import crypto from 'node:crypto';

type Topic = {
  topicId: string;
  title: string;
  intent: string;
  targetUrlPath?: string;
  sourceFactIds: string[];
};

type Fact = {
  id: string;
  claim: string;
  sourceUrl: string;
  expiresAt: string;
};

type Media = {
  publicUrl: string;
  alt: string;
};

function markdownText(value: string): string {
  return value.replace(/[\[\]]/g, '\\$&').trim();
}

function slugFor(topicId: string): string {
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/i.test(topicId)) throw new Error('Invalid topic id for main-site content.');
  return topicId.toLowerCase();
}

export function generateMainSiteArticle(input: { topic: Topic; facts: Fact[]; media: Media; publishedAt?: Date }): { slug: string; markdown: string; contentHash: string } {
  const { topic, media } = input;
  if (!topic.title.trim()) throw new Error('Main-site article requires a title.');
  if (!media.publicUrl.startsWith('https://') || !media.alt.trim()) throw new Error('Main-site article requires public HTTPS media.');
  const facts = topic.sourceFactIds.map((factId) => input.facts.find((fact) => fact.id === factId));
  if (facts.some((fact) => !fact)) throw new Error('Main-site article is missing a referenced fact.');
  const verifiedFacts = facts as Fact[];
  const publishedAt = input.publishedAt || new Date();
  const slug = slugFor(topic.topicId);
  const title = markdownText(topic.title);
  const factLines = verifiedFacts.map((fact) => `- ${fact.claim}`).join('\n');
  const sourceLines = verifiedFacts.map((fact) => `- [Nguồn Viettel](${fact.sourceUrl})`).join('\n');
  const markdown = `---
title: "${title.replace(/"/g, '\\"')}"
description: "Thông tin được đối chiếu từ nguồn Viettel, cập nhật theo ngày hiệu lực của dữ liệu."
date: ${publishedAt.toISOString()}
---

# ${title}

![${markdownText(media.alt)}](${media.publicUrl})

Bài viết tổng hợp thông tin theo nguồn công bố của Viettel. Hãy đối chiếu điều kiện thuê bao và phản hồi dịch vụ trước khi thực hiện.

## Thông tin đã đối chiếu

${factLines}

## Điều cần kiểm tra trước khi thực hiện

- Thông tin ưu đãi và điều kiện áp dụng có thể khác theo thuê bao.
- Chỉ thực hiện thao tác theo hướng dẫn chính thức hoặc SMS phản hồi của nhà mạng.
- Nếu cần hỗ trợ trực tiếp, hãy dùng kênh chăm sóc khách hàng chính thức của Viettel.

## Nguồn tham khảo

${sourceLines}
`;
  return {
    slug,
    markdown,
    contentHash: crypto.createHash('sha256').update(markdown).digest('hex'),
  };
}
