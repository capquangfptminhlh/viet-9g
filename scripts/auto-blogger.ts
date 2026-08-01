import crypto from 'crypto';
import fs from 'fs';

import { RealBloggerClient } from '../packages/connectors/blogger/blogger.client';
import { BloggerPublisher } from '../packages/connectors/blogger/blogger.publisher';
import { canInsertDraft, createIdempotencyKey, LedgerEntry } from '../packages/connectors/blogger/blogger.idempotency';
import { verifyCreatedDraft } from '../packages/connectors/blogger/blogger.verify';
import { generateBloggerDraftPayload } from '../packages/content-engine/blogger-content-generator';
import { detectDuplicate } from '../packages/content-engine/blogger-duplicate-detector';
import { Claim, validateBloggerFacts } from '../packages/content-engine/blogger-fact-validator';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';

type Topic = { topicId: string; targetBlogId: string; intent: string; title: string; sourceFactIds?: string[]; status?: string };
type Site = { blogId: string; enabled: boolean; allowedDestination?: string };
type Result = { status: string; exitCode: number; attemptedBlogIds: string[]; draftReviewUrl?: string; selectedTopicId?: string };

function contentSignature(blogId: string, title: string): string {
  return crypto.createHash('sha256').update(`${blogId}:${title.trim().toLowerCase().replace(/\s+/g, ' ')}`).digest('hex');
}

export function createTopicDraftHtml(title: string, referralUrl?: string): string {
  const reference = referralUrl
    ? `<p><a href="${referralUrl}" rel="nofollow noopener noreferrer">Tài liệu tham khảo</a>.</p>`
    : '';
  return `<h2>${title}</h2><p>Nội dung dưới đây tập trung vào ${title}, với các bước và lưu ý để bạn tự đối chiếu thông tin.</p>${reference}`;
}

export async function runAutoBlogger(options: {
  sites?: Site[];
  topics?: Topic[];
  env?: Record<string, string | undefined>;
  now?: Date;
  facts?: any[];
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
  topics = (topics || []).filter((topic) => topic.status !== 'PUBLISHED');
  if (topics.length === 0) return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] };

  let ledger: LedgerEntry[] = [];
  if (fs.existsSync('state/blogger-publication-ledger.json')) {
    ledger = JSON.parse(fs.readFileSync('state/blogger-publication-ledger.json', 'utf-8').replace(/^\uFEFF/, ''));
  }

  const selectedSite = sites[0];
  let selectedTopic: Topic | undefined;
  let idempotencyKey = '';
  let selectedContentSignature = '';
  for (const topic of topics) {
    if (topic.targetBlogId !== selectedSite.blogId) continue;
    const claim: Claim = { text: topic.title, sourceFactIds: topic.sourceFactIds || [] };
    if (validateBloggerFacts({ claims: [claim] }, facts).decision !== 'PASS') continue;
    const currentKey = createIdempotencyKey(selectedSite.blogId, topic.topicId, 'v1');
    if (!canInsertDraft(ledger, currentKey)) continue;
    const currentSignature = contentSignature(selectedSite.blogId, topic.title);
    if (detectDuplicate({ contentHash: currentSignature }, ledger).decision !== 'PASS') continue;
    selectedTopic = topic;
    idempotencyKey = currentKey;
    selectedContentSignature = currentSignature;
    break;
  }
  if (!selectedTopic) return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [selectedSite.blogId] };

  let draftReviewUrl: string | undefined;
  let postId = 'p-mock-draft';
  if (!options.sites) {
    try {
      const client = new RealBloggerClient();
      const publisher = new BloggerPublisher(client);
      const refUrl = generateReferralUrl(selectedSite.allowedDestination || 'tracuugoicuoc.com', selectedTopic.topicId);
      const payload = generateBloggerDraftPayload({
        blogId: selectedSite.blogId, title: selectedTopic.title,
        htmlBody: createTopicDraftHtml(selectedTopic.title, refUrl), labels: ['4G Viettel', 'Tin tức']
      });
      console.log(`Inserting draft for topic ${selectedTopic.topicId} on blog ${selectedSite.blogId}...`);
      const attempt = { idempotencyKey, blogId: selectedSite.blogId, topicId: selectedTopic.topicId, contentHash: selectedContentSignature, status: 'INSERT_STARTED', createdAt: new Date().toISOString() };
      ledger.push(attempt);
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
      const response = await publisher.createDraft(payload);
      postId = response.id;
      draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/${postId}`;
      await verifyCreatedDraft(client, selectedSite.blogId, postId, payload);
      Object.assign(attempt, { postId, status: 'DRAFT_CREATED' });
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
    } catch (err: any) {
      console.error('Blogger API Error:', err);
      const existing = ledger.find((entry) => entry.idempotencyKey === idempotencyKey);
      if (existing) Object.assign(existing, { postId, status: 'VERIFY_FAILED' });
      else ledger.push({ idempotencyKey, blogId: selectedSite.blogId, topicId: selectedTopic.topicId, contentHash: selectedContentSignature, postId, status: 'VERIFY_FAILED', createdAt: new Date().toISOString() });
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
      return { status: 'ERROR', exitCode: 1, attemptedBlogIds: [selectedSite.blogId], selectedTopicId: selectedTopic.topicId };
    }
  } else {
    draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/p-mock-draft`;
  }
  if (env.GITHUB_STEP_SUMMARY && draftReviewUrl) {
    try {
      fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `### ✅ Blogger Draft Created\n- **Blog ID**: ${selectedSite.blogId}\n- **Post ID**: ${postId}\n- **Review & Publish**: [Open in Blogger](${draftReviewUrl})\n`, 'utf-8');
    } catch (err) { console.error('Failed writing to GITHUB_STEP_SUMMARY', err); }
  }
  return { status: 'SUCCESS', exitCode: 0, attemptedBlogIds: [selectedSite.blogId], draftReviewUrl, selectedTopicId: selectedTopic.topicId };
}

const isMain = process.argv[1] && (process.argv[1].endsWith('auto-blogger.ts') || process.argv[1].endsWith('auto-blogger.js'));
if (isMain) {
  runAutoBlogger({}).then((result) => { console.log('Result:', result); process.exit(result.exitCode); }).catch((err) => { console.error('Fatal:', err); process.exit(1); });
}
