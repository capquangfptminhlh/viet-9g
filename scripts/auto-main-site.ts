import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { generateMainSiteArticle } from '../packages/content-engine/main-site-content-generator';
import { requireFactStore, validateBloggerFacts } from '../packages/content-engine/blogger-fact-validator';
import { AutomationPolicy, decideBloggerPublication } from '../packages/policy-engine/automation-policy';

type Topic = {
  topicId: string;
  title: string;
  status: string;
  intent: string;
  packageId?: string;
  riskTier?: 'low' | 'medium' | 'high';
  sourceFactIds: string[];
};

type Fact = { id: string; claim: string; sourceUrl: string; expiresAt: string };
type MediaAsset = { topicId: string; publicUrl: string; alt: string; imageBrief: string };
type LedgerEntry = { idempotencyKey: string; topicId: string; slug?: string; contentHash?: string; status: 'PUBLISHED' | 'HOLD'; failureReason?: string; createdAt: string };

export type MainSiteLedgerStore = { load(): Promise<LedgerEntry[]>; save(entries: LedgerEntry[]): Promise<void> };

export type AutoMainSiteOptions = {
  outputDir?: string;
  topics?: Topic[];
  facts?: Fact[];
  mediaManifest?: { assets: MediaAsset[] };
  automationPolicy?: AutomationPolicy;
  ledgerStore?: MainSiteLedgerStore;
  now?: Date;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')) as T;
}

function defaultLedgerStore(): MainSiteLedgerStore {
  const ledgerPath = 'state/main-site-publication-ledger.json';
  return {
    async load() { return fs.existsSync(ledgerPath) ? readJson<LedgerEntry[]>(ledgerPath) : []; },
    async save(entries) { fs.writeFileSync(ledgerPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8'); },
  };
}

function idempotencyKey(topic: Topic): string {
  return crypto.createHash('sha256').update(`main-site:${topic.topicId}`).digest('hex');
}

export async function runAutoMainSite(options: AutoMainSiteOptions = {}): Promise<{ status: 'SUCCESS' | 'NO_ELIGIBLE_TOPIC'; topicId?: string; slug?: string }> {
  const topics = options.topics ?? readJson<Topic[]>('config/topics.json');
  const facts = options.facts ?? readJson<Fact[]>('data/facts.json');
  const mediaManifest = options.mediaManifest ?? readJson<{ assets: MediaAsset[] }>('state/media-manifest.json');
  const policy = options.automationPolicy ?? readJson<AutomationPolicy>('config/automation-policy.json');
  const outputDir = options.outputDir ?? 'src/content/posts';
  const ledgerStore = options.ledgerStore ?? defaultLedgerStore();
  const ledger = await ledgerStore.load();
  const now = options.now ?? new Date();
  requireFactStore(facts);

  for (const topic of topics.filter((candidate) => candidate.status === 'QUEUE')) {
    const key = idempotencyKey(topic);
    if (ledger.some((entry) => entry.idempotencyKey === key && entry.status === 'PUBLISHED')) continue;
    const factDecision = validateBloggerFacts({ claims: [{ text: topic.title, sourceFactIds: topic.sourceFactIds }] }, facts, now);
    const policyDecision = decideBloggerPublication(policy, { intent: topic.intent, packageId: topic.packageId, riskTier: topic.riskTier, hasVerifiedFacts: factDecision.decision === 'PASS' });
    const media = mediaManifest.assets.find((asset) => asset.topicId === topic.topicId);
    if (factDecision.decision !== 'PASS' || !policyDecision.allowed || !media || !media.publicUrl.startsWith('https://')) {
      ledger.push({ idempotencyKey: `${key}:${now.toISOString()}`, topicId: topic.topicId, status: 'HOLD', failureReason: factDecision.decision !== 'PASS' ? 'FACT_VALIDATION_REJECTED' : !policyDecision.allowed ? policyDecision.reason : 'MEDIA_MANIFEST_REJECTED', createdAt: now.toISOString() });
      continue;
    }
    const article = generateMainSiteArticle({ topic, facts, media, publishedAt: now });
    const destination = path.join(outputDir, `${article.slug}.md`);
    if (fs.existsSync(destination)) continue;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(destination, article.markdown, 'utf8');
    ledger.push({ idempotencyKey: key, topicId: topic.topicId, slug: article.slug, contentHash: article.contentHash, status: 'PUBLISHED', createdAt: now.toISOString() });
    await ledgerStore.save(ledger);
    return { status: 'SUCCESS', topicId: topic.topicId, slug: article.slug };
  }
  await ledgerStore.save(ledger);
  return { status: 'NO_ELIGIBLE_TOPIC' };
}

if (process.argv[1]?.endsWith('auto-main-site.ts')) {
  runAutoMainSite().then((result) => {
    console.log('Result:', result);
    process.exit(result.status === 'SUCCESS' ? 0 : 1);
  }).catch((error) => { console.error(error); process.exit(1); });
}
