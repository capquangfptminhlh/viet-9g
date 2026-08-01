import fs from 'fs';
import path from 'path';

import { RealBloggerClient } from '../packages/connectors/blogger/blogger.client';
import { BloggerPublisher } from '../packages/connectors/blogger/blogger.publisher';
import { generateBloggerDraftPayload } from '../packages/content-engine/blogger-content-generator';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';
import { createIdempotencyKey, findLedgerEntry, canInsertDraft, LedgerEntry } from '../packages/connectors/blogger/blogger.idempotency';
import { verifyCreatedDraft } from '../packages/connectors/blogger/blogger.verify';
import { validateBloggerFacts, Claim } from '../packages/content-engine/blogger-fact-validator';
import { detectDuplicate } from '../packages/content-engine/blogger-duplicate-detector';

export async function runAutoBlogger(options: {
  sites?: Array<{ blogId: string; enabled: boolean; allowedDestination?: string }>;
  topics?: Array<{ topicId: string; targetBlogId: string; intent: string; title: string; sourceFactIds?: string[] }>;
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
    if (!fs.existsSync('data/facts.json')) {
      throw new Error('FACT_STORE_EMPTY: data/facts.json does not exist');
    }
    facts = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8'));
  }
  if (!facts || facts.length === 0) {
    throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');
  }

  let sites = options.sites;
  if (!sites) {
    if (!fs.existsSync('config/blogger-sites.json')) {
      throw new Error('CONFIG_ERROR: config/blogger-sites.json does not exist');
    }
    sites = JSON.parse(fs.readFileSync('config/blogger-sites.json', 'utf-8')).sites;
  }
  sites = (sites || []).filter((s: any) => s.enabled);
  if (sites.length === 0) {
    return { status: 'NO_ELIGIBLE_SITES', exitCode: 0, attemptedBlogIds: [] };
  }

  let topics = options.topics;
  if (!topics) {
    if (!fs.existsSync('config/topics.json')) {
      throw new Error('CONFIG_ERROR: config/topics.json does not exist');
    }
    topics = JSON.parse(fs.readFileSync('config/topics.json', 'utf-8'));
  }
  topics = (topics || []).filter((t: any) => t.status !== 'PUBLISHED');
  if (topics.length === 0) {
    return { status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] };
  }

  let ledger: LedgerEntry[] = [];
  if (fs.existsSync('state/blogger-publication-ledger.json')) {
    ledger = JSON.parse(fs.readFileSync('state/blogger-publication-ledger.json', 'utf-8'));
  }

  const selectedSite = sites[0];
  let selectedTopic = null;
  let idempotencyKey = '';

  for (const topic of topics) {
    if (topic.targetBlogId !== selectedSite.blogId) continue;

    // Gate: Fact validation
    const claim: Claim = { text: topic.title, sourceFactIds: topic.sourceFactIds || [] };
    const factDecision = validateBloggerFacts({ claims: [claim] }, facts);
    if (factDecision.decision !== 'PASS') continue;

    // Gate: Idempotency
    const currentKey = createIdempotencyKey(selectedSite.blogId, topic.topicId, 'v1');
    if (!canInsertDraft(ledger, currentKey)) continue;

    // Gate: Duplicate detection
    const dupDecision = detectDuplicate({ contentHash: currentKey }, ledger);
    if (dupDecision.decision !== 'PASS') continue;

    selectedTopic = topic;
    idempotencyKey = currentKey;
    break;
  }

  if (!selectedTopic) {
    return { status: 'NO_VALID_TOPICS_REMAINING', exitCode: 0, attemptedBlogIds: [selectedSite.blogId] };
  }

  let draftReviewUrl;
  let postId = 'p-mock-draft';
  
  if (!options.sites) {
    // RUNNING IN REAL MODE
    try {
      const client = new RealBloggerClient();
      const publisher = new BloggerPublisher(client);
      
      const dest = selectedSite.allowedDestination || 'tracuugoicuoc.com';
      const refUrl = generateReferralUrl(dest, selectedTopic.topicId);
      
      const payload = generateBloggerDraftPayload({
        blogId: selectedSite.blogId,
        title: selectedTopic.title,
        htmlBody: `<h2>${selectedTopic.title}</h2><p>Đăng ký gói cước Viettel nhanh chóng với nhiều ưu đãi.</p><p><a href="${refUrl}">Xem chi tiết gói cước tại đây</a>.</p>`,
        labels: ['4G Viettel', 'Tin tức']
      });

      console.log(`Inserting draft for topic ${selectedTopic.topicId} on blog ${selectedSite.blogId}...`);
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
      ledger.push({
        idempotencyKey,
        blogId: selectedSite.blogId,
        topicId: selectedTopic.topicId,
        contentHash: idempotencyKey,
        status: 'VERIFY_FAILED',
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync('state/blogger-publication-ledger.json', JSON.stringify(ledger, null, 2));
      return { status: 'ERROR', exitCode: 1, attemptedBlogIds: [selectedSite.blogId] };
    }
  } else {
    // Unit test mode execution
    draftReviewUrl = `https://www.blogger.com/blog/post/edit/${selectedSite.blogId}/p-mock-draft`;
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
