import crypto from 'node:crypto';

export type TopicMediaInput = {
  topicId: string;
  title: string;
  intent: string;
  imageBrief?: string;
  imageAlt?: string;
};

export type TopicMediaAsset = {
  assetId: string;
  topicId: string;
  intent: string;
  relativePath: string;
  publicUrl: string;
  alt: string;
  imageBrief: string;
  contentHash: string;
  createdAt: string;
  svg: string;
};

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  }[character] || character));
}

function normalizedDomain(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Public media domain must be a root HTTPS URL.');
  }
  return url;
}

function theme(intent: string): { accent: string; label: string; icon: string } {
  if (intent === 'cancellation') return { accent: '#B45309', label: 'Hướng dẫn thao tác', icon: 'SMS' };
  if (intent === 'review') return { accent: '#9D174D', label: 'Đánh giá độc lập', icon: '✓' };
  if (intent === 'troubleshooting') return { accent: '#1D4ED8', label: 'Khắc phục kết nối', icon: '!' };
  return { accent: '#0F766E', label: 'Cẩm nang 4G/5G', icon: '4G' };
}

export function createTopicMediaAsset(input: TopicMediaInput, publicDomain: string, createdAt = new Date()): TopicMediaAsset {
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/i.test(input.topicId)) throw new Error('topicId is invalid for a media asset.');
  if (!input.title.trim()) throw new Error('title is required for a media asset.');
  if (!input.imageBrief?.trim()) throw new Error('imageBrief is required for a media asset.');
  if (!input.imageAlt?.trim()) throw new Error('imageAlt is required for a media asset.');
  const domain = normalizedDomain(publicDomain);
  const contentHash = crypto.createHash('sha256')
    .update(JSON.stringify({ topicId: input.topicId, title: input.title, intent: input.intent, imageBrief: input.imageBrief, imageAlt: input.imageAlt }))
    .digest('hex');
  const assetId = `${input.topicId}-${contentHash.slice(0, 12)}`;
  const relativePath = `/images/blogger/${assetId}.svg`;
  const publicUrl = new URL(relativePath, domain).toString();
  const selectedTheme = theme(input.intent);
  const displayTitle = input.title.replace(/\b\d{1,3}(?:[.,]\d{3})?\s?(?:đ|vnđ|vnd)\b/gi, '').replace(/\b(?:GB|290)\b/gi, '').trim();
  const safeTitle = escapeXml(displayTitle.slice(0, 88));
  const safeLabel = escapeXml(selectedTheme.label);
  const safeAlt = escapeXml(input.imageAlt.trim());
  const safeTopicId = escapeXml(input.topicId);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc" data-topic-id="${safeTopicId}"><title id="title">${safeAlt}</title><desc id="desc">${safeLabel}</desc><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F8FAFC"/><stop offset="1" stop-color="#E2E8F0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><rect x="70" y="70" width="1060" height="490" rx="38" fill="#FFFFFF"/><circle cx="196" cy="196" r="88" fill="${selectedTheme.accent}"/><text x="196" y="214" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF">${selectedTheme.icon}</text><text x="320" y="178" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${selectedTheme.accent}">${safeLabel}</text><text x="320" y="246" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#0F172A">${safeTitle}</text><line x1="320" y1="292" x2="1010" y2="292" stroke="#CBD5E1" stroke-width="4"/><rect x="320" y="338" width="650" height="22" rx="11" fill="#CBD5E1"/><rect x="320" y="384" width="530" height="22" rx="11" fill="#E2E8F0"/><rect x="320" y="430" width="610" height="22" rx="11" fill="#E2E8F0"/><text x="70" y="604" font-family="Arial, sans-serif" font-size="20" fill="#475569">Minh họa biên tập tự tạo theo chủ đề</text></svg>`;

  return {
    assetId,
    topicId: input.topicId,
    intent: input.intent,
    relativePath,
    publicUrl,
    alt: input.imageAlt.trim(),
    imageBrief: input.imageBrief.trim(),
    contentHash,
    createdAt: createdAt.toISOString(),
    svg,
  };
}
