import crypto from 'crypto';
import fs from 'fs';

import { RealBloggerClient } from '../packages/connectors/blogger/blogger.client';
import { GitHubPublicationLedgerStore } from '../packages/connectors/blogger/github-publication-ledger-store';
import { BloggerPublisher } from '../packages/connectors/blogger/blogger.publisher';
import { canInsertDraft, createIdempotencyKey, createRunAuditKey, LedgerEntry } from '../packages/connectors/blogger/blogger.idempotency';
import { verifyCreatedPost } from '../packages/connectors/blogger/blogger.verify';
import type { BloggerClient } from '../packages/connectors/blogger/blogger.types';
import { generateBloggerDraftPayload, createTopicDraftHtml } from '../packages/content-engine/blogger-content-generator';
import { detectDuplicate } from '../packages/content-engine/blogger-duplicate-detector';
import { Claim, validateBloggerFacts } from '../packages/content-engine/blogger-fact-validator';
import type { TopicMediaAsset } from '../packages/content-engine/topic-media';
import { decideBloggerPublication, type AutomationPolicy } from '../packages/policy-engine/automation-policy';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';
import { getPackageById, getRenderablePackages, loadPackageCatalog } from '../src/data/package-catalog';
import type { PackageCatalog } from '../src/data/package-catalog';

type Topic = { topicId: string; targetBlogId: string; intent: string; title: string; packageId?: string; contentVersion?: string; sourceFactIds?: string[]; status?: string; targetUrlPath?: string; reviewData?: any; imageBrief?: string; imageAlt?: string; riskTier?: 'low' | 'medium' | 'high'; };
type Site = { blogId: string; enabled: boolean; allowedDestination?: string };
type GateResult = 'PASS' | 'REJECT' | 'NOT_RUN';
type TopicMediaManifest = { assets: Array<Omit<TopicMediaAsset, 'svg'>> };
export type PublicationLedgerStore = {
  load(): Promise<LedgerEntry[]>;
  save(entries: LedgerEntry[]): Promise<void>;
};
type Result = { status: string; exitCode: number; attemptedBlogIds: string[]; draftReviewUrl?: string; publishedUrl?: string; selectedTopicId?: string };
type AutoBloggerOptions = {
  sites?: Site[];
  topics?: Topic[];
  env?: Record<string, string | undefined>;
  now?: Date;
  facts?: any[];
  client?: BloggerClient;
  ledgerStore?: PublicationLedgerStore;
  requireMedia?: boolean;
  mediaManifest?: TopicMediaManifest['assets'];
  verifyMediaUrl?: (url: string) => Promise<boolean>;
  automationPolicy?: AutomationPolicy;
};

function summaryValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function asiaHoChiMinhDate(value: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function hasLivePublicationToday(ledger: LedgerEntry[], blogId: string, now: Date): boolean {
  const today = asiaHoChiMinhDate(now);
  return ledger.some((entry) => {
    if (entry.blogId !== blogId || entry.status !== 'LIVE' || !entry.publishedAt) return false;
    const publishedAt = new Date(entry.publishedAt);
    return !Number.isNaN(publishedAt.getTime()) && asiaHoChiMinhDate(publishedAt) === today;
  });
}

function orderSitesForRun(sites: Site[], ledger: LedgerEntry[]): Site[] {
  const lastLivePublication = (blogId: string): number => {
    let latest = Number.NEGATIVE_INFINITY;
    for (const entry of ledger) {
      if (entry.blogId !== blogId || entry.status !== 'LIVE' || !entry.publishedAt) continue;
      const publishedAt = new Date(entry.publishedAt).getTime();
      if (!Number.isNaN(publishedAt)) latest = Math.max(latest, publishedAt);
    }
    return latest;
  };

  return [...sites].sort((left, right) => {
    const leftLastPublished = lastLivePublication(left.blogId);
    const rightLastPublished = lastLivePublication(right.blogId);
    if (leftLastPublished !== rightLastPublished) {
      return leftLastPublished < rightLastPublished ? -1 : 1;
    }
    if (left.blogId === right.blogId) return 0;
    return left.blogId < right.blogId ? -1 : 1;
  });
}

function writeGitHubStepSummary(
  env: Record<string, string | undefined>,
  details: { result: 'SUCCESS' | 'DISABLED' | 'NO_ELIGIBLE_SITES' | 'TOPIC_QUEUE_EXHAUSTED' | 'DAILY_LIMIT_REACHED' | 'ERROR'; status: 'LIVE' | 'NOT_PUBLISHED' | 'VERIFY_FAILED'; topicId?: string; idempotencyKey?: string; gateResults?: Record<string, GateResult>; failureReason?: string; postId?: string; publishedUrl?: string; editorUrl?: string },
): void {
  if (!env.GITHUB_STEP_SUMMARY) return;
  const lines = [
    '### Blogger publication',
    `- Result: ${details.result}`,
    `- Status: ${details.status}`,
  ];
  if (details.topicId) lines.push(`- Topic: ${summaryValue(details.topicId)}`);
  if (details.idempotencyKey) lines.push(`- Content key: ${summaryValue(details.idempotencyKey)}`);
  if (details.gateResults) lines.push(`- Gates: ${summaryValue(JSON.stringify(details.gateResults))}`);
  if (details.failureReason) lines.push(`- Reason: ${summaryValue(details.failureReason)}`);
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

export function createBloggerContentHash(blogId: string, generatedHtml: string): string {
  const canonicalHtml = generatedHtml
    .replace(/^\s*<h2\b[^>]*>[\s\S]*?<\/h2>\s*/i, '')
    .replace(/([?&](?:amp;)?utm_campaign=)[^&"']*/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(`${blogId}:${canonicalHtml}`).digest('hex');
}

function localLedgerStore(): PublicationLedgerStore {
  return {
    async load() {
      if (!fs.existsSync('state/blogger-publication-ledger.json')) return [];
      return JSON.parse(fs.readFileSync('state/blogger-publication-ledger.json', 'utf-8').replace(/^\uFEFF/, ''));
    },
    async save(entries) {
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(entries, null, 2));
    },
  };
}

function productionLedgerStore(env: Record<string, string | undefined>): PublicationLedgerStore {
  return new GitHubPublicationLedgerStore({
    token: env.GITHUB_TOKEN || '',
    repository: env.GITHUB_REPOSITORY || '',
    branch: env.GITHUB_REF_NAME || '',
  });
}

function auditEntry(
  blogId: string,
  topic: Topic,
  status: string,
  failureReason: string,
  gateResults: Record<string, GateResult>,
  now: Date,
  contentHash = '',
): LedgerEntry {
  const contentVersion = topic.contentVersion || 'v1';
  return {
    idempotencyKey: createIdempotencyKey(blogId, topic.topicId, contentVersion),
    blogId,
    topicId: topic.topicId,
    packageId: topic.packageId,
    contentVersion,
    contentHash,
    status,
    failureReason,
    gateResults,
    createdAt: now.toISOString(),
  };
}

function retryableGateAudit(
  blogId: string,
  topic: Topic,
  failureReason: string,
  gateResults: Record<string, GateResult>,
  now: Date,
): LedgerEntry {
  const audit = auditEntry(blogId, topic, 'HOLD', failureReason, gateResults, now);
  audit.idempotencyKey = createRunAuditKey(blogId, topic.topicId, topic.contentVersion || 'v1', failureReason, now);
  return audit;
}

function redactError(error: unknown, env: Record<string, string | undefined>): string {
  let message = error instanceof Error ? error.message : String(error);
  for (const [key, value] of Object.entries(env)) {
    if (/(TOKEN|SECRET|PASSWORD|KEY)/i.test(key) && value) message = message.split(value).join('[REDACTED]');
  }
  return summaryValue(message || 'Unknown publication error');
}

export async function runAutoBlogger(options: AutoBloggerOptions): Promise<Result> {
  const env = options.env || process.env;
  try {
    return await runAutoBloggerTransaction(options, env);
  } catch (error) {
    writeGitHubStepSummary(env, { result: 'ERROR', status: 'NOT_PUBLISHED' });
    throw error;
  }
}

async function runAutoBloggerTransaction(options: AutoBloggerOptions, env: Record<string, string | undefined>): Promise<Result> {
  if (env.BLOGGER_ENABLED !== 'true') {
    writeGitHubStepSummary(env, { result: 'DISABLED', status: 'NOT_PUBLISHED' });
    return { status: 'DISABLED', exitCode: 0, attemptedBlogIds: [] };
  }

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
  if (sites.length === 0) {
    writeGitHubStepSummary(env, { result: 'NO_ELIGIBLE_SITES', status: 'NOT_PUBLISHED' });
    return { status: 'NO_ELIGIBLE_SITES', exitCode: 0, attemptedBlogIds: [] };
  }

  let topics = options.topics;
  if (!topics) {
    if (!fs.existsSync('config/topics.json')) throw new Error('CONFIG_ERROR: config/topics.json does not exist');
    topics = JSON.parse(fs.readFileSync('config/topics.json', 'utf-8').replace(/^\uFEFF/, ''));
  }
  topics = (topics || []).filter((topic) => topic.status === 'QUEUE');
  const requireMedia = options.requireMedia ?? !options.topics;
  let mediaByTopic = new Map<string, TopicMediaManifest['assets'][number]>();
  if (requireMedia) {
    const assets = options.mediaManifest ?? (() => {
      if (!fs.existsSync('state/media-manifest.json')) throw new Error('MEDIA_MANIFEST_MISSING: state/media-manifest.json does not exist');
      const manifest = JSON.parse(fs.readFileSync('state/media-manifest.json', 'utf-8').replace(/^\uFEFF/, '')) as TopicMediaManifest;
      if (!Array.isArray(manifest.assets)) throw new Error('MEDIA_MANIFEST_INVALID: assets must be an array');
      return manifest.assets;
    })();
    mediaByTopic = new Map(assets.map((asset) => [asset.topicId, asset]));
  }
  const verifyMediaUrl = options.verifyMediaUrl ?? (async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      return response.ok && (response.headers.get('content-type') || '').startsWith('image/');
    } catch {
      return false;
    }
  });
  const policy = options.automationPolicy ?? (() => {
    if (options.topics) return undefined;
    if (!fs.existsSync('config/automation-policy.json')) throw new Error('AUTOMATION_POLICY_MISSING: config/automation-policy.json does not exist');
    return JSON.parse(fs.readFileSync('config/automation-policy.json', 'utf-8').replace(/^\uFEFF/, '')) as AutomationPolicy;
  })();
  const shouldPublish = Boolean(options.client) || !options.sites;
  const ledgerStore = options.ledgerStore || (options.client || !shouldPublish ? localLedgerStore() : productionLedgerStore(env));
  const ledger = await ledgerStore.load();
  const now = options.now || new Date();
  const orderedSites = orderSitesForRun(sites, ledger);
  let selectedSite = orderedSites[0];
  if (topics.length === 0) {
    const emptyQueueTopic: Topic = {
      topicId: `__empty_queue__:${asiaHoChiMinhDate(now)}`,
      targetBlogId: selectedSite.blogId,
      intent: 'none',
      title: 'No queued topics',
      contentVersion: now.toISOString(),
    };
    const gates = { queue: 'REJECT' as const };
    const audit = auditEntry(selectedSite.blogId, emptyQueueTopic, 'TOPIC_QUEUE_EXHAUSTED', 'NO_QUEUED_TOPICS', gates, now);
    ledger.push(audit);
    if (shouldPublish) await ledgerStore.save(ledger);
    writeGitHubStepSummary(env, { result: 'TOPIC_QUEUE_EXHAUSTED', status: 'NOT_PUBLISHED', topicId: audit.topicId, idempotencyKey: audit.idempotencyKey, gateResults: gates, failureReason: audit.failureReason });
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [selectedSite.blogId] };
  }
  let selectedTopic: Topic | undefined;
  let catalog: PackageCatalog | undefined;
  let idempotencyKey = '';
  let selectedContentSignature = '';
  let selectedPayload: ReturnType<typeof generateBloggerDraftPayload> | undefined;
  let selectedGateResults: Record<string, GateResult> | undefined;
  const rejectedAudits: LedgerEntry[] = [];
  const dailyLimitAudits: LedgerEntry[] = [];
  const dailyLimitedBlogIds = new Set<string>();
  const candidateTopics = orderedSites.flatMap((site) => (
    topics
      .filter((topic) => topic.targetBlogId === site.blogId)
      .map((topic) => ({ site, topic }))
  ));
  for (const { site, topic } of candidateTopics) {
    selectedSite = site;
    if (dailyLimitedBlogIds.has(site.blogId)) continue;
    if (hasLivePublicationToday(ledger, site.blogId, now)) {
      const gates = { dailyLimit: 'REJECT' as const };
      const reason = 'DAILY_LIMIT_REACHED';
      const audit = auditEntry(site.blogId, topic, reason, reason, gates, now);
      audit.idempotencyKey = createRunAuditKey(site.blogId, topic.topicId, topic.contentVersion || 'v1', reason, now);
      dailyLimitAudits.push(audit);
      dailyLimitedBlogIds.add(site.blogId);
      continue;
    }
    const gateResults: Record<string, GateResult> = {
      packageEvidence: 'NOT_RUN', facts: 'NOT_RUN', policy: 'NOT_RUN', targetUrl: 'NOT_RUN', media: 'NOT_RUN', html: 'NOT_RUN', idempotency: 'NOT_RUN', duplicate: 'NOT_RUN', insert: 'NOT_RUN', readBack: 'NOT_RUN', publishedUrl: 'NOT_RUN',
    };
    if (topic.packageId) {
      if (!catalog) catalog = loadPackageCatalog();
      if (!isPackageTopicEligible(topic, catalog, now)) {
        gateResults.packageEvidence = 'REJECT';
        rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', 'PACKAGE_EVIDENCE_REJECTED', gateResults, now));
        continue;
      }
    }
    gateResults.packageEvidence = 'PASS';
    const claim: Claim = { text: topic.title, sourceFactIds: topic.sourceFactIds || [] };
    const validationFacts = topic.packageId && catalog
      ? [...catalog.facts, ...catalog.packages.flatMap((pkg) => pkg.facts)].filter((fact) => (topic.sourceFactIds || []).includes(fact.id))
      : facts;
    if (validateBloggerFacts({ claims: [claim] }, validationFacts).decision !== 'PASS') {
      gateResults.facts = 'REJECT';
      rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', 'FACT_VALIDATION_REJECTED', gateResults, now));
      continue;
    }
    gateResults.facts = 'PASS';
    if (policy) {
      const policyDecision = decideBloggerPublication(policy, {
        intent: topic.intent,
        packageId: topic.packageId,
        riskTier: topic.riskTier,
        hasVerifiedFacts: true,
      });
      if (!policyDecision.allowed) {
        gateResults.policy = 'REJECT';
        rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', policyDecision.reason, gateResults, now));
        continue;
      }
      gateResults.policy = 'PASS';
    }
    const contentVersion = topic.contentVersion || 'v1';
    const currentKey = createIdempotencyKey(selectedSite.blogId, topic.topicId, contentVersion);
    if (!canInsertDraft(ledger, currentKey)) {
      gateResults.idempotency = 'REJECT';
      rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', 'IDEMPOTENCY_KEY_RESERVED', gateResults, now));
      continue;
    }
    gateResults.idempotency = 'PASS';
    if (!topic.targetUrlPath || !topic.targetUrlPath.startsWith('/') || topic.targetUrlPath.includes('..')) {
      gateResults.targetUrl = 'REJECT';
      rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', 'TARGET_URL_REQUIRED', gateResults, now));
      continue;
    }
    gateResults.targetUrl = 'PASS';
    const media = mediaByTopic.get(topic.topicId);
    if (requireMedia && (!media || !media.publicUrl.startsWith('https://') || !media.alt.trim() || !media.imageBrief.trim())) {
      gateResults.media = 'REJECT';
      rejectedAudits.push(retryableGateAudit(selectedSite.blogId, topic, 'MEDIA_MANIFEST_REJECTED', gateResults, now));
      continue;
    }
    if (requireMedia && media && !(await verifyMediaUrl(media.publicUrl))) {
      gateResults.media = 'REJECT';
      rejectedAudits.push(retryableGateAudit(selectedSite.blogId, topic, 'MEDIA_NOT_PUBLIC', gateResults, now));
      continue;
    }
    gateResults.media = requireMedia ? 'PASS' : 'NOT_RUN';
    const refUrl = generateReferralUrl(selectedSite.allowedDestination || 'tracuugoicuoc.com', topic.targetUrlPath, topic.topicId);
    const contentFacts = topic.packageId && catalog
      ? [...catalog.facts, ...catalog.packages.flatMap((pkg) => pkg.facts)].filter((fact) => (topic.sourceFactIds || []).includes(fact.id))
      : facts.filter((fact: any) => (topic.sourceFactIds || []).includes(fact.id));
    let payload: ReturnType<typeof generateBloggerDraftPayload>;
    try {
      payload = generateBloggerDraftPayload({
        blogId: selectedSite.blogId,
        title: topic.title,
        htmlBody: createTopicDraftHtml(topic.title, contentFacts, refUrl, topic.intent, topic.reviewData, media?.publicUrl, media?.alt),
        labels: ['4G Viettel', 'Tin tức'],
      });
      gateResults.html = 'PASS';
    } catch (error) {
      gateResults.html = 'REJECT';
      rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', `HTML_GATE_REJECTED: ${redactError(error, env)}`, gateResults, now));
      continue;
    }
    const currentSignature = createBloggerContentHash(selectedSite.blogId, payload.sanitizedHtml);
    const legacyTitleSignature = crypto.createHash('sha256').update(`${selectedSite.blogId}:${topic.title.trim().toLowerCase().replace(/\s+/g, ' ')}`).digest('hex');
    if (detectDuplicate({ contentHash: currentSignature }, ledger).decision !== 'PASS' || detectDuplicate({ contentHash: legacyTitleSignature }, ledger).decision !== 'PASS') {
      gateResults.duplicate = 'REJECT';
      rejectedAudits.push(auditEntry(selectedSite.blogId, topic, 'HOLD', 'DUPLICATE_CONTENT', gateResults, now, currentSignature));
      continue;
    }
    gateResults.duplicate = 'PASS';
    selectedTopic = topic;
    idempotencyKey = currentKey;
    selectedContentSignature = currentSignature;
    selectedPayload = payload;
    selectedGateResults = gateResults;
    break;
  }
  if (!selectedTopic) {
    const pendingAudits = [...rejectedAudits, ...dailyLimitAudits];
    if (pendingAudits.length && shouldPublish) {
      ledger.push(...pendingAudits);
      await ledgerStore.save(ledger);
    }
    const lastAudit = rejectedAudits.at(-1);
    const dailyLimitAudit = dailyLimitAudits.at(-1);
    if (!lastAudit && dailyLimitAudit) {
      writeGitHubStepSummary(env, { result: 'DAILY_LIMIT_REACHED', status: 'NOT_PUBLISHED', topicId: dailyLimitAudit.topicId, idempotencyKey: dailyLimitAudit.idempotencyKey, gateResults: dailyLimitAudit.gateResults, failureReason: dailyLimitAudit.failureReason });
      return { status: 'DAILY_LIMIT_REACHED', exitCode: 1, attemptedBlogIds: [dailyLimitAudit.blogId] };
    }
    writeGitHubStepSummary(env, { result: 'TOPIC_QUEUE_EXHAUSTED', status: 'NOT_PUBLISHED', topicId: lastAudit?.topicId, idempotencyKey: lastAudit?.idempotencyKey, gateResults: lastAudit?.gateResults, failureReason: lastAudit?.failureReason || 'NO_ELIGIBLE_TOPIC' });
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [selectedSite.blogId] };
  }

  let draftReviewUrl: string | undefined;
  let publishedUrl: string | undefined;
  let postId: string | undefined;
  if (shouldPublish) {
    let attempt: LedgerEntry | undefined;
    let reservationCommitted = false;
    try {
      const client = options.client || new RealBloggerClient();
      const publisher = new BloggerPublisher(client);
      const payload = selectedPayload!;
      console.log(`Publishing topic ${selectedTopic.topicId} on blog ${selectedSite.blogId}...`);
      attempt = { idempotencyKey, blogId: selectedSite.blogId, topicId: selectedTopic.topicId, packageId: selectedTopic.packageId, catalogVersion: catalog?.catalogVersion, contentVersion: selectedTopic.contentVersion || 'v1', contentHash: selectedContentSignature, status: 'INSERT_STARTED', gateResults: selectedGateResults, createdAt: now.toISOString() };
      ledger.push(...rejectedAudits, ...dailyLimitAudits, attempt);
      await ledgerStore.save(ledger);
      reservationCommitted = true;
      const response = await publisher.publishPost(payload);
      if (typeof response.id !== 'string' || !response.id.trim()) {
        throw new Error('Blogger insert response did not include a valid post id.');
      }
      if (attempt.gateResults) attempt.gateResults.insert = 'PASS';
      postId = response.id;
      draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/${postId}`;
      const responseUrl = (response as typeof response & { url?: unknown }).url;
      if (typeof responseUrl === 'string' && responseUrl.trim()) publishedUrl = responseUrl;
      await verifyCreatedPost(client, selectedSite.blogId, postId, payload, 'LIVE');
      if (attempt.gateResults) attempt.gateResults.readBack = 'PASS';
      if (!publishedUrl) {
        if (attempt.gateResults) attempt.gateResults.publishedUrl = 'REJECT';
        throw new Error('Verification failed: LIVE post did not include a published URL');
      }
      if (attempt.gateResults) attempt.gateResults.publishedUrl = 'PASS';
      Object.assign(attempt, { postId, publishedUrl, status: 'LIVE', publishedAt: new Date().toISOString() });
      await ledgerStore.save(ledger);
    } catch (error) {
      const failureReason = redactError(error, env);
      console.error(`Blogger publication failed: ${failureReason}`);
      if (attempt) {
        attempt.status = reservationCommitted ? 'VERIFY_FAILED' : 'HOLD';
        attempt.failureReason = failureReason;
        if (attempt.gateResults) {
          if (!reservationCommitted) attempt.gateResults.idempotency = 'REJECT';
          else if (attempt.gateResults.insert === 'NOT_RUN') attempt.gateResults.insert = 'REJECT';
          else if (attempt.gateResults.readBack === 'NOT_RUN') attempt.gateResults.readBack = 'REJECT';
        }
        if (postId) attempt.postId = postId;
        if (reservationCommitted) {
          try {
            await ledgerStore.save(ledger);
          } catch (ledgerError) {
            console.error(`Failed to persist Blogger failure audit: ${redactError(ledgerError, env)}`);
          }
        }
      }
      writeGitHubStepSummary(env, { result: 'ERROR', status: reservationCommitted ? 'VERIFY_FAILED' : 'NOT_PUBLISHED', topicId: selectedTopic.topicId, idempotencyKey, gateResults: selectedGateResults, failureReason, postId });
      return { status: 'ERROR', exitCode: 1, attemptedBlogIds: [selectedSite.blogId], selectedTopicId: selectedTopic.topicId };
    }
  } else {
    draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/p-mock-draft`;
  }
  writeGitHubStepSummary(env, {
    result: 'SUCCESS',
    status: shouldPublish ? 'LIVE' : 'NOT_PUBLISHED',
    topicId: selectedTopic.topicId,
    idempotencyKey,
    gateResults: selectedGateResults,
    postId,
    publishedUrl,
    editorUrl: draftReviewUrl,
  });
  const result: Result = { status: 'SUCCESS', exitCode: 0, attemptedBlogIds: [selectedSite.blogId], draftReviewUrl, selectedTopicId: selectedTopic.topicId };
  if (publishedUrl) result.publishedUrl = publishedUrl;
  return result;
}

const isMain = process.argv[1] && (process.argv[1].endsWith('auto-blogger.ts') || process.argv[1].endsWith('auto-blogger.js'));
if (isMain) {
  runAutoBlogger({}).then((result) => { console.log('Result:', result); process.exit(result.exitCode); }).catch((err) => { console.error('Fatal:', err); process.exit(1); });
}

