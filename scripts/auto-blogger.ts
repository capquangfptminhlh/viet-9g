import crypto from 'crypto';
import fs from 'fs';

import { RealBloggerClient } from '../packages/connectors/blogger/blogger.client';
import { BloggerPublisher } from '../packages/connectors/blogger/blogger.publisher';
import { canInsertDraft, createIdempotencyKey, LedgerEntry } from '../packages/connectors/blogger/blogger.idempotency';
import { verifyCreatedPost } from '../packages/connectors/blogger/blogger.verify';
import type { BloggerClient } from '../packages/connectors/blogger/blogger.types';
import { generateBloggerDraftPayload, createTopicDraftHtml } from '../packages/content-engine/blogger-content-generator';
import { detectDuplicate } from '../packages/content-engine/blogger-duplicate-detector';
import { Claim, validateBloggerFacts } from '../packages/content-engine/blogger-fact-validator';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';
import { getPackageById, getRenderablePackages, loadPackageCatalog } from '../src/data/package-catalog';
import type { PackageCatalog } from '../src/data/package-catalog';

type Topic = { topicId: string; targetBlogId: string; intent: string; title: string; packageId?: string; contentVersion?: string; sourceFactIds?: string[]; status?: string; targetUrlPath?: string; reviewData?: any; };
type Site = { blogId: string; enabled: boolean; allowedDestination?: string };
type Result = { status: string; exitCode: number; attemptedBlogIds: string[]; draftReviewUrl?: string; publishedUrl?: string; selectedTopicId?: string };

function summaryValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function writeGitHubStepSummary(
  env: Record<string, string | undefined>,
  details: { result: 'SUCCESS' | 'TOPIC_QUEUE_EXHAUSTED' | 'ERROR'; status: 'LIVE' | 'NOT_PUBLISHED' | 'VERIFY_FAILED'; topicId?: string; postId?: string; publishedUrl?: string; editorUrl?: string },
): void {
  if (!env.GITHUB_STEP_SUMMARY) return;
  const lines = [
    '### Blogger publication',
    `- Result: ${details.result}`,
    `- Status: ${details.status}`,
  ];
  if (details.topicId) lines.push(`- Topic: ${summaryValue(details.topicId)}`);
  if (details.postId) lines.push(`- Post: ${summaryValue(details.postId)}`);
  if (details.publishedUrl) lines.push(`- Published URL: ${summaryValue(details.publishedUrl)}`);
  if (details.editorUrl) lines.push(`- Editor URL: ${summaryValue(details.editorUrl)}`);
  try {
    fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`, 'utf-8');
  } catch (err) {
    console.error('Failed writing to GITHUB_STEP_SUMMARY', err);
  }
}

export function isPackageTopicEligible(topic: Pick<Topic, 'packageId' | 'sourceFactIds'>, catalog: PackageCatalog, now = new Date()): boolean {
  if (!topic.packageId) return true;
  const pkg = getPackageById(catalog, topic.packageId);
  if (!pkg || pkg.status !== 'active') return false;
  const expected = [...new Set(pkg.factIds)].sort();
  const actual = [...new Set(topic.sourceFactIds || [])].sort();
  if (expected.length === 0 || expected.join('\0') !== actual.join('\0')) return false;
  return getRenderablePackages(catalog, now).some((item) => item.id === pkg.id);
}

function contentSignature(blogId: string, title: string): string {
  return crypto.createHash('sha256').update(`${blogId}:${title.trim().toLowerCase().replace(/\s+/g, ' ')}`).digest('hex');
}

export async function runAutoBlogger(options: {
  sites?: Site[];
  topics?: Topic[];
  env?: Record<string, string | undefined>;
  now?: Date;
  facts?: any[];
  client?: BloggerClient;
}): Promise<Result> {
  const env = options.env || process.env;
  if (env.BLOGGER_ENABLED !== 'true') return { status: 'DISABLED', exitCode: 0, attemptedBlogIds: [] };

  let facts = options.facts;
  if (!facts) {
    if (!fs.existsSync('data/facts.json')) throw new Error('FACT_STORE_EMPTY: data/facts.json does not exist');
    facts = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8').replace(/^\uFEFF/, ''));
  }
  if (!facts || facts.length === 0) throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');

  let sites = options.sites;
  if (!sites) {
    if (!fs.existsSync('config/blogger-sites.json')) throw new Error('CONFIG_ERROR: config/blogger-sites.json does not exist');
    sites = JSON.parse(fs.readFileSync('config/blogger-sites.json', 'utf-8').replace(/^\uFEFF/, '')).sites;
  }
  sites = (sites || []).filter((site) => site.enabled);
  if (sites.length === 0) return { status: 'NO_ELIGIBLE_SITES', exitCode: 0, attemptedBlogIds: [] };

  let topics = options.topics;
  if (!topics) {
    if (!fs.existsSync('config/topics.json')) throw new Error('CONFIG_ERROR: config/topics.json does not exist');
    topics = JSON.parse(fs.readFileSync('config/topics.json', 'utf-8').replace(/^\uFEFF/, ''));
  }
  topics = (topics || []).filter((topic) => topic.status === 'QUEUE');
  if (topics.length === 0) {
    writeGitHubStepSummary(env, { result: 'TOPIC_QUEUE_EXHAUSTED', status: 'NOT_PUBLISHED' });
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] };
  }

  let ledger: LedgerEntry[] = [];
  if (fs.existsSync('state/blogger-publication-ledger.json')) {
    ledger = JSON.parse(fs.readFileSync('state/blogger-publication-ledger.json', 'utf-8').replace(/^\uFEFF/, ''));
  }

  const selectedSite = sites[0];
  let selectedTopic: Topic | undefined;
  let catalog: PackageCatalog | undefined;
  let idempotencyKey = '';
  let selectedContentSignature = '';
  for (const topic of topics) {
    if (topic.targetBlogId !== selectedSite.blogId) continue;
    if (topic.packageId) {
      if (!catalog) catalog = loadPackageCatalog();
      if (!isPackageTopicEligible(topic, catalog, options.now || new Date())) continue;
    }
    const claim: Claim = { text: topic.title, sourceFactIds: topic.sourceFactIds || [] };
    const validationFacts = topic.packageId && catalog
      ? [...catalog.facts, ...catalog.packages.flatMap((pkg) => pkg.facts)].filter((fact) => (topic.sourceFactIds || []).includes(fact.id))
      : facts;
    if (validateBloggerFacts({ claims: [claim] }, validationFacts).decision !== 'PASS') continue;
    const contentVersion = topic.contentVersion || 'v1';
    const currentKey = createIdempotencyKey(selectedSite.blogId, topic.topicId, contentVersion);
    if (!canInsertDraft(ledger, currentKey)) continue;
    const currentSignature = contentSignature(selectedSite.blogId, topic.title);
    if (detectDuplicate({ contentHash: currentSignature }, ledger).decision !== 'PASS') continue;
    selectedTopic = topic;
    idempotencyKey = currentKey;
    selectedContentSignature = currentSignature;
    break;
  }
  if (!selectedTopic) {
    writeGitHubStepSummary(env, { result: 'TOPIC_QUEUE_EXHAUSTED', status: 'NOT_PUBLISHED' });
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [selectedSite.blogId] };
  }

  let draftReviewUrl: string | undefined;
  let publishedUrl: string | undefined;
  let postId: string | undefined;
  const shouldPublish = Boolean(options.client) || !options.sites;
  if (shouldPublish) {
    let attempt: LedgerEntry | undefined;
    try {
      const client = options.client || new RealBloggerClient();
      const publisher = new BloggerPublisher(client);
      let targetPath = selectedTopic.targetUrlPath || '/huong-dan/huy-goi-cuoc-viettel/';
      if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
      const refUrl = generateReferralUrl(selectedSite.allowedDestination || 'tracuugoicuoc.com', targetPath, selectedTopic.topicId);
      
      const contentFacts = selectedTopic.packageId && catalog
        ? [...catalog.facts, ...catalog.packages.flatMap((pkg) => pkg.facts)].filter((fact) => (selectedTopic!.sourceFactIds || []).includes(fact.id))
        : facts.filter((f: any) => (selectedTopic!.sourceFactIds || []).includes(f.id));
      const payload = generateBloggerDraftPayload({
        blogId: selectedSite.blogId, title: selectedTopic.title,
        htmlBody: createTopicDraftHtml(selectedTopic.title, contentFacts, refUrl, selectedTopic.intent, selectedTopic.reviewData), labels: ['4G Viettel', 'Tin tức']
      });
      console.log(`Publishing topic ${selectedTopic.topicId} on blog ${selectedSite.blogId}...`);
      attempt = { idempotencyKey, blogId: selectedSite.blogId, topicId: selectedTopic.topicId, packageId: selectedTopic.packageId, catalogVersion: catalog?.catalogVersion, contentVersion: selectedTopic.contentVersion || 'v1', contentHash: selectedContentSignature, status: 'INSERT_STARTED', createdAt: new Date().toISOString() };
      ledger.push(attempt);
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
      const response = await publisher.publishPost(payload);
      postId = response.id;
      draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/${postId}`;
      const responseUrl = (response as typeof response & { url?: unknown }).url;
      if (typeof responseUrl === 'string' && responseUrl.trim()) publishedUrl = responseUrl;
      await verifyCreatedPost(client, selectedSite.blogId, postId, payload, 'LIVE');
      Object.assign(attempt, { postId, status: 'LIVE', publishedAt: new Date().toISOString() });
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
    } catch {
      console.error('Blogger publication failed during insert or read-back verification.');
      if (attempt) {
        Object.assign(attempt, { postId, status: 'VERIFY_FAILED' });
        fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
      }
      writeGitHubStepSummary(env, { result: 'ERROR', status: 'VERIFY_FAILED', topicId: selectedTopic.topicId, postId });
      return { status: 'ERROR', exitCode: 1, attemptedBlogIds: [selectedSite.blogId], selectedTopicId: selectedTopic.topicId };
    }
  } else {
    draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/p-mock-draft`;
  }
  writeGitHubStepSummary(env, {
    result: 'SUCCESS',
    status: shouldPublish ? 'LIVE' : 'NOT_PUBLISHED',
    topicId: selectedTopic.topicId,
    postId,
    publishedUrl,
    editorUrl: draftReviewUrl,
  });
  return { status: 'SUCCESS', exitCode: 0, attemptedBlogIds: [selectedSite.blogId], draftReviewUrl, publishedUrl, selectedTopicId: selectedTopic.topicId };
}

const isMain = process.argv[1] && (process.argv[1].endsWith('auto-blogger.ts') || process.argv[1].endsWith('auto-blogger.js'));
if (isMain) {
  runAutoBlogger({}).then((result) => { console.log('Result:', result); process.exit(result.exitCode); }).catch((err) => { console.error('Fatal:', err); process.exit(1); });
}

