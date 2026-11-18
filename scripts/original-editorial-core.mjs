import { createHash } from 'node:crypto';

export function isOfficialViettelUrl(candidate) {
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' &&
      ['viettel.vn', 'vietteltelecom.vn'].some(domain =>
        url.hostname === domain || url.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

export function findOfficialArticleLinks(html, pageUrl) {
  const matches = [...String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/giu)];
  const results = new Set();
  for (const match of matches) {
    try {
      const url = new URL(match[1].replace(/&amp;/g, '&'), pageUrl);
      url.hash = '';
      url.search = '';
      if (isOfficialViettelUrl(url.toString()) && /\/tin-tuc\/chi-tiet\//u.test(url.pathname)) {
        results.add(url.toString());
      }
    } catch {
      // Ignore invalid links rather than inventing sources.
    }
  }
  return [...results];
}

export function textKey(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase('vi').replace(/đ/gu, 'd')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function words(value) {
  return textKey(value).split(/\s+/u).filter(Boolean);
}

function overlap(a, b) {
  const left = new Set(words(a).filter(word => word.length > 2));
  const right = new Set(words(b).filter(word => word.length > 2));
  const same = [...left].filter(word => right.has(word)).length;
  return same / Math.max(1, Math.min(left.size, right.size));
}

export function validateOriginalDraft(draft, sourceText, sourceUrl, existingTitles = []) {
  const problems = [];
  if (!draft || typeof draft !== 'object') return ['INVALID_MODEL_RESPONSE'];
  if (!isOfficialViettelUrl(sourceUrl)) problems.push('UNVERIFIED_SOURCE');
  if (typeof draft.title !== 'string' || draft.title.length < 20 || draft.title.length > 125) {
    problems.push('BAD_TITLE');
  }
  if (typeof draft.slug !== 'string' ||
      !/^[a-z0-9](?:[a-z0-9-]{8,90})$/u.test(draft.slug)) problems.push('BAD_SLUG');
  if (existingTitles.some(title => overlap(title, draft.title) >= 0.80)) {
    problems.push('SIMILAR_EXISTING_ARTICLE');
  }
  if (typeof draft.description !== 'string' ||
      draft.description.length < 70 || draft.description.length > 190) {
    problems.push('BAD_META_DESCRIPTION');
  }
  const markdown = typeof draft.markdown === 'string' ? draft.markdown : '';
  if (words(markdown).length < 450) problems.push('THIN_ORIGINAL_ARTICLE');
  if ((markdown.match(/^##\s+\S/gmu) ?? []).length < 4) problems.push('INSUFFICIENT_SECTIONS');
  if (!markdown.includes(sourceUrl)) problems.push('OFFICIAL_SOURCE_LINK_MISSING');
  if (/Bài viết tổng hợp thông tin theo nguồn công bố|Thông tin đã đối chiếu/iu.test(markdown)) {
    problems.push('UNEDITED_TEMPLATE');
  }
  if (/<\s*\/?[a-z][^>]*>/iu.test(markdown) || /javascript:/iu.test(markdown)) {
    problems.push('UNSAFE_MARKDOWN_HTML');
  }
  const externalLinks = [...markdown.matchAll(/\]\((https?:\/\/[^\s)]+)\)/giu)]
    .map(match => match[1]);
  if (externalLinks.some(url => url !== sourceUrl)) problems.push('EXTERNAL_LINK_NOT_GROUNDED');

  if (/(?:\d[\d.,]*\s*(?:đ|vnd|đồng|gb\/ngày))/iu.test(markdown)) {
    problems.push('NUMERIC_OFFER_REQUIRES_SEPARATE_VERIFICATION');
  }
  const quotes = Array.isArray(draft.evidenceQuotes) ? draft.evidenceQuotes : [];
  if (quotes.length < 2 || quotes.length > 6) problems.push('INSUFFICIENT_SOURCE_EVIDENCE');
  const normalized = textKey(sourceText);
  for (const quote of quotes) {
    const candidate = textKey(quote);
    if (candidate.length < 25 || candidate.length > 250 || !normalized.includes(candidate)) {
      problems.push('EVIDENCE_NOT_FOUND_VERBATIM');
      break;
    }
  }
  if (!Array.isArray(draft.visualSteps) || draft.visualSteps.length !== 3 ||
      draft.visualSteps.some(step => typeof step !== 'string' || step.length < 6 || step.length > 24)) {
    problems.push('ILLUSTRATION_STEPS_INVALID');
  }
  return [...new Set(problems)];
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, character =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]);
}

function splitTitle(value) {
  const parts = String(value).trim().split(/\s+/u);
  const lines = [];
  let line = '';
  for (const word of parts) {
    if ((line + ' ' + word).trim().length > 37 && line) {
      lines.push(line);
      line = '';
    }
    line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 2).map((part, i) => i === 1 && lines.length > 2
    ? part.slice(0, 32) + '…' : part);
}

export function renderOriginalEditorialSvg({ title, visualSteps, alt, slug }) {
  if (!Array.isArray(visualSteps) || visualSteps.length !== 3) {
    throw new Error('ILLUSTRATION_STEPS_INVALID');
  }
  const key = createHash('sha256').update(String(slug)).digest('hex');
  const accents = ['#2563EB', '#0D9488', '#DC2626', '#7C3AED'];
  const accent = accents[parseInt(key.slice(0, 2), 16) % accents.length];
  const titleLines = splitTitle(title);
  const titleElements = titleLines.map((part, i) =>
    '<text x="70" y="' + (166 + i * 59) +
    '" font-size="47" font-weight="750" fill="#F8FAFC">' + escapeXml(part) + '</text>').join('');
  const cards = visualSteps.map((step, i) => {
    const x = 72 + i * 364;
    const safe = escapeXml(step);
    return '<g transform="translate(' + x + ',394)">' +
      '<rect x="0" y="0" width="335" height="154" rx="24" fill="#FFFFFF" opacity=".97"/>' +
      '<circle cx="46" cy="47" r="26" fill="' + accent + '"/>' +
      '<text x="46" y="57" font-family="Arial,sans-serif" font-size="29" font-weight="700" text-anchor="middle" fill="#FFFFFF">' + (i + 1) + '</text>' +
      '<text x="25" y="107" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#0F172A">' + safe + '</text>' +
      '</g>';
  }).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">' +
    '<title id="title">' + escapeXml(alt || title) + '</title>' +
    '<desc id="description">Sơ đồ minh họa do ban biên tập tự tạo, không phải ảnh chụp cài đặt thật</desc>' +
    '<defs><linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#081B35"/><stop offset="1" stop-color="#172C4B"/></linearGradient></defs>' +
    '<rect width="1200" height="630" fill="url(#base)"/>' +
    '<circle cx="1100" cy="110" r="230" fill="' + accent + '" opacity=".18"/>' +
    '<circle cx="1030" cy="70" r="150" fill="none" stroke="#B8D4FF" stroke-width="3" opacity=".2"/>' +
    '<rect x="70" y="54" width="254" height="48" rx="24" fill="' + accent + '"/>' +
    '<text x="93" y="86" font-family="Arial,sans-serif" font-size="21" font-weight="700" fill="#FFFFFF">CẨM NANG VIETTEL</text>' +
    '<g font-family="Arial,sans-serif">' + titleElements + '</g>' +
    '<text x="72" y="335" font-family="Arial,sans-serif" font-size="25" fill="#BFDBFE">3 việc cần kiểm tra theo thứ tự</text>' +
    cards + '<text x="72" y="595" font-family="Arial,sans-serif" font-size="19" fill="#94A3B8">Minh họa biên tập • Hướng dẫn tham khảo, xác nhận trên thiết bị thực tế</text>' +
    '</svg>';
}
