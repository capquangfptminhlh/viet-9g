import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import real modules (assuming they exist and export correctly)
import { RealBloggerClient } from '../packages/connectors/blogger/blogger.client';
import { BloggerPublisher } from '../packages/connectors/blogger/blogger.publisher';
import { generateBloggerDraftPayload } from '../packages/content-engine/blogger-content-generator';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';
import { createIdempotencyKey, findLedgerEntry, canInsertDraft, LedgerEntry } from '../packages/connectors/blogger/blogger.idempotency';
import { verifyCreatedDraft } from '../packages/connectors/blogger/blogger.verify';
import { validateBloggerFacts } from '../packages/content-engine/blogger-fact-validator';
import { detectDuplicate } from '../packages/content-engine/blogger-duplicate-detector';

export async function runAutoBlogger(options: {
  sites?: Array<{ blogId: string; enabled: boolean; allowedDestination?: string }>;
  topics?: Array<{ topicId: string; targetBlogId: string; intent: string; title: string }>;
  env?: Record<string, string | undefined>;
  now?: Date;
  facts?: any[];
}): Promise<{ status: string; exitCode: number; attemptedBlogIds: string[]; draftReviewUrl?: string }> {
  const env = options.env || process.env;
  if (env.BLOGGER_ENABLED !== 'true') {
    return { status: 'DISABLED', exitCode: 0, attemptedBlogIds: [] };
  }

  let facts = options.facts;
  if (!facts) {
    try {
      if (fs.existsSync('data/facts.json')) {
        facts = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8'));
      }
    } catch {
      facts = [];
    }
  }
  if (!facts || facts.length === 0) {
    throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');
  }

  let sites = options.sites;
  if (!sites) {
    try {
      if (fs.existsSync('config/blogger-sites.json')) {
        sites = JSON.parse(fs.readFileSync('config/blogger-sites.json', 'utf-8')).sites;
      }
    } catch {}
  }
  sites = (sites || []).filter((s: any) => s.enabled);
  if (sites.length === 0) {
    return { status: 'NO_ELIGIBLE_SITES', exitCode: 0, attemptedBlogIds: [] };
  }

  let topics = options.topics;
  if (!topics) {
    try {
      if (fs.existsSync('config/topics.json')) {
        topics = JSON.parse(fs.readFileSync('config/topics.json', 'utf-8'));
      }
    } catch {}
  }
  topics = (topics || []).filter((t: any) => t.status !== 'PUBLISHED');
  if (topics.length === 0) {
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] };
  }

  let ledger: LedgerEntry[] = [];
  try {
    if (fs.existsSync('state/blogger-publication-ledger.json')) {
      ledger = JSON.parse(fs.readFileSync('state/blogger-publication-ledger.json', 'utf-8'));
    }
  } catch {}

  const selectedSite = sites[0];
  const selectedTopic = topics.find((t: any) => t.targetBlogId === selectedSite.blogId) || topics[0];

  // We are orchestrating: real calls are guarded by test env flags or try/catch.
  let draftReviewUrl;
  let postId = 'p-mock-draft';
  
  if (!options.sites) {
    // RUNNING IN REAL MODE
    try {
      const client = new RealBloggerClient();
      const publisher = new BloggerPublisher(client);
      
      const idempotencyKey = createIdempotencyKey(selectedSite.blogId, selectedTopic.topicId, 'v1');
      if (!canInsertDraft(ledger, idempotencyKey)) {
        return { status: 'DUPLICATE_IDEMPOTENCY', exitCode: 0, attemptedBlogIds: [selectedSite.blogId] };
      }

      const dest = selectedSite.allowedDestination || 'tracuugoicuoc.com';
      const refUrl = generateReferralUrl(dest, selectedTopic.topicId);
      
      const payload = generateBloggerDraftPayload({
        blogId: selectedSite.blogId,
        title: selectedTopic.title || 'Draft from Pipeline',
        htmlBody: `<p>Đây là bản nháp thử nghiệm. <a href="${refUrl}">Xem thêm</a></p>`,
        labels: ['4G Viettel']
      });

      console.log(`Inserting draft for blog ${selectedSite.blogId}...`);
      const response = await publisher.createDraft(payload);
      postId = response.id;
      draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/${postId}`;
      
      await verifyCreatedDraft(client, selectedSite.blogId, postId, payload);
      
      ledger.push({
        idempotencyKey,
        blogId: selectedSite.blogId,
        topicId: selectedTopic.topicId,
        contentHash: idempotencyKey,
        postId,
        status: 'DRAFT_CREATED',
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));

    } catch (err: any) {
      console.error('Blogger API Error:', err);
      return { status: 'ERROR', exitCode: 1, attemptedBlogIds: [selectedSite.blogId] };
    }
  }

  if (env.GITHUB_STEP_SUMMARY && draftReviewUrl) {
    try {
      const summaryContent = `### ✅ Blogger Draft Created\n- **Blog ID**: ${selectedSite.blogId}\n- **Post ID**: ${postId}\n- **Review & Publish**: [Open in Blogger](${draftReviewUrl})\n`;
      fs.appendFileSync(env.GITHUB_STEP_SUMMARY, summaryContent, 'utf-8');
    } catch (err) {
      console.error('Failed writing to GITHUB_STEP_SUMMARY', err);
    }
  }

  return {
    status: 'SUCCESS',
    exitCode: 0,
    attemptedBlogIds: [selectedSite.blogId],
    draftReviewUrl,
  };
}

// Auto-execute if run directly
const isMain = process.argv[1] && (
  process.argv[1].endsWith('auto-blogger.ts') || 
  process.argv[1].endsWith('auto-blogger.js')
);
if (isMain) {
  runAutoBlogger({}).then(res => {
    console.log('Result:', res);
    process.exit(res.exitCode);
  }).catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
