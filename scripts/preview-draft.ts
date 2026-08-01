import fs from 'fs';
import { createTopicDraftHtml } from '../packages/content-engine/blogger-content-generator';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';

const factsStore = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8').replace(/^\uFEFF/, ''));
const topicTitle = 'Cách hủy gói data Viettel qua SMS 191';
const topicIntent = 'cancellation';
const topicId = 'topic-huy-goi-cuoc';
const topicSourceFactIds = ['fact-5'];
const referralUrl = generateReferralUrl('tracuugoicuoc.com', '/huong-dan/huy-goi-cuoc-viettel/', topicId);

const inputFacts = factsStore.filter((f: any) => topicSourceFactIds.includes(f.id));
const html = createTopicDraftHtml(topicTitle, inputFacts, referralUrl, topicIntent);

console.log(html);
