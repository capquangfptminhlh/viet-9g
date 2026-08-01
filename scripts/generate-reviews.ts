import fs from 'fs';
import { generateBloggerDraftPayload, createTopicDraftHtml } from '../packages/content-engine/blogger-content-generator';
import { generateReferralUrl } from '../packages/measurement-engine/blogger-referral-tracker';

const topics = JSON.parse(fs.readFileSync('config/topics.json', 'utf8').replace(/^\uFEFF/, ''));
const facts = JSON.parse(fs.readFileSync('data/facts.json', 'utf8').replace(/^\uFEFF/, ''));

const reviewTopics = ['topic-huy-goi-cuoc', 'topic-kiem-tra-toc-do', 'topic-st15k-review'];

for (const topicId of reviewTopics) {
  const topic = topics.find((t: any) => t.topicId === topicId);
  if (!topic) continue;

  const topicFacts = facts.filter((f: any) => (topic.sourceFactIds || []).includes(f.id));
  const refUrl = generateReferralUrl('tracuugoicuoc.com/huong-dan/huy-goi-cuoc-viettel/', topic.topicId);
  
  const rawHtml = createTopicDraftHtml(topic.title, topicFacts, refUrl, topic.intent);
  
  // Full production pipeline: sanitize + validate links
  const payload = generateBloggerDraftPayload({
    blogId: '5229528996284551001',
    title: topic.title,
    htmlBody: rawHtml,
    labels: ['4G Viettel', 'Tin tức']
  });

  const markdown = `# Draft Preview: ${topic.title}
*Intent: ${topic.intent}*
*Lưu ý: Mã HTML đã chạy qua bộ lọc \`sanitizeBloggerHtml\` và \`enforceBloggerLinks\` y hệt Production.*

\`\`\`html
${payload.sanitizedHtml}
\`\`\`
`;

  const outPath = `docs/reviews/${topicId}.md`;
  if (!fs.existsSync('docs/reviews')) {
    fs.mkdirSync('docs/reviews', { recursive: true });
  }
  // Include UTF-8 BOM
  fs.writeFileSync(outPath, '\ufeff' + markdown, 'utf8');
  console.log(`Generated preview at ${outPath}`);
}
