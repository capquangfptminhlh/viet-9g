import { GoogleGenAI } from '@google/genai';
import sanitizeHtml from 'sanitize-html';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  findOfficialArticleLinks, isOfficialViettelUrl,
  renderOriginalEditorialSvg, validateOriginalDraft,
} from './original-editorial-core.mjs';

const ROOT = process.cwd();
const START_URL = 'https://098.viettel.vn/tin-tuc/chi-tiet/huong-dan-moi-nhat-cach-bat-mang-5g-viettel-cho-dien-thoai-smartphone/16290128';
const OUT = '.website-os/out/ai-editorial-creation.json';
const MAX_SOURCE_AGE_DAYS = 75;
const MAX_SOURCE_CHECKS = 8;

function jsonReport(result) {
  const file = join(ROOT, OUT);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ observedAt: new Date().toISOString(), ...result }, null, 2) + '\n');
  console.log('ORIGINAL_EDITORIAL=' + JSON.stringify(result));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = requireFromFs();
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '### Original article + original illustration\n' +
      '- Creation status: ' + result.status + '\n' +
      '- Reason: ' + (result.reason || 'none') + '\n' +
      '- Source: ' + (result.sourceUrl || 'UNKNOWN') + '\n' +
      '- Article: ' + (result.article || 'not generated') + '\n' +
      '- Image: ' + (result.image || 'not generated') + '\n' +
      '- Production release: NOT AUTHORIZED; human editorial and owner gates remain mandatory.\n');
  }
  return result;
}

function requireFromFs() {
  return { appendFileSync: (...args) => fsAppend(...args) };
}

function fsAppend(...args) {
  // Imported dynamically in the caller path to keep no file writes in pure helpers.
  return import('node:fs').then(mod => mod.appendFileSync(...args));
}

function parseTitle(html) {
  return sanitizeHtml(html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/iu)?.[0] ?? '',
    { allowedTags: [], allowedAttributes: {} }).replace(/\s+/gu, ' ').trim();
}

function parseOfficialArticle(html, sourceUrl, observedAt) {
  const title = parseTitle(html);
  const rawText = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\r/gu, '').replace(/[ \t]+/gu, ' ');
  const start = rawText.indexOf(title);
  const afterHeading = start >= 0 ? rawText.slice(start) : rawText;
  const end = afterHeading.search(/Tin tức khác|Tin nổi bật|Bài viết liên quan/iu);
  const sourceText = (end >= 0 ? afterHeading.slice(0, end) : afterHeading).trim().slice(0, 22000);
  const dateMatch = sourceText.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/u);
  const sourceDate = dateMatch
    ? new Date(Date.UTC(+dateMatch[3], +dateMatch[2] - 1, +dateMatch[1])) : null;
  const ageDays = sourceDate
    ? Math.floor((observedAt.getTime() - sourceDate.getTime()) / 86400000) : null;
  return {
    sourceUrl, title, sourceDate: sourceDate?.toISOString().slice(0, 10) ?? null,
    ageDays, sourceText,
    valid: Boolean(title.length > 20 && sourceText.length > 450 &&
      ageDays !== null && ageDays >= 0 && ageDays <= MAX_SOURCE_AGE_DAYS &&
      /5G|4G|SIM|data|mạng|điện thoại|roaming|cước|thuê bao|My Viettel/iu.test(title)),
  };
}

async function retrieveOfficialArticle(url, now) {
  if (!isOfficialViettelUrl(url)) throw new Error('SOURCE_DOMAIN_NOT_OFFICIAL');
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ViettelEditorialResearch/1.0 (original sourced guide)' },
    redirect: 'follow', signal: AbortSignal.timeout(14000),
  });
  if (!response.ok || !isOfficialViettelUrl(response.url)) {
    throw new Error('SOURCE_NOT_ACCESSIBLE_' + response.status);
  }
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) throw new Error('SOURCE_NOT_HTML');
  const html = await response.text();
  return { html, ...parseOfficialArticle(html, response.url, now) };
}

function existingTitlesAndSlugs() {
  const directory = join(ROOT, 'src/content/posts');
  const list = readdirSync(directory).filter(file => file.endsWith('.md'));
  return {
    slugs: new Set(list.map(file => file.slice(0, -3))),
    titles: list.map(file => {
      const text = readFileSync(join(directory, file), 'utf8');
      return text.match(/^title:\s*["']?(.+?)["']?\s*$/mu)?.[1] ??
        text.match(/^#\s+(.+)$/mu)?.[1] ?? file.slice(0, -3);
    }),
  };
}

function cleanJsonOutput(text) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('MODEL_RETURNED_EMPTY');
  // Gemini JSON mode should return a JSON object, not a Markdown code fence.
  return JSON.parse(raw);
}

async function draftWithGemini(api, source, inventory) {
  const titles = inventory.titles.slice(-150);
  const prompt = [
    'Bạn là biên tập viên hướng dẫn kỹ thuật di động bằng tiếng Việt.',
    'Hãy VIẾT MỘT BÀI GỐC tối thiểu 650 từ, hữu ích, không copy nguyên văn nguồn,',
    'giải quyết MỘT tình huống người dùng Viettel có ý định tìm kiếm rõ ràng.',
    'Đây chỉ là bài nháp; không được nói đã được Viettel xác nhận trên mọi thuê bao.',
    'Chỉ dùng thông tin được chứng minh trong VĂN BẢN NGUỒN CHÍNH THỨC bên dưới.',
    'Không tự đoán giá, data, khuyến mãi, ngày hiệu lực, hỗ trợ thiết bị, cú pháp SMS.',
    'Không viết giá tiền, ưu đãi dung lượng số lượng hoặc bảng giá.',
    'Nếu tài liệu nguồn không đủ để viết hữu ích mà không bịa, trả về JSON với canWrite=false và reason.',
    'Tạo một title độc đáo tối đa 110 ký tự và slug không dấu chữ thường, có dấu gạch ngang.',
    'Tránh trùng ý định/canonical với các tiêu đề đã tồn tại bên dưới.',
    'Markdown chỉ là NỘI DUNG THÂN BÀI, bắt đầu bằng ## Trả lời nhanh, tối thiểu 4 mục ##,',
    'có hướng dẫn bước cụ thể, dấu hiệu kiểm tra, sai lầm thường gặp, khi nào liên hệ Viettel, FAQ,',
    'và MỘT link nguồn chính thức đầy đủ chính xác: ' + source.sourceUrl + '.',
    'Đừng sao chép quá 10 từ liên tiếp từ nguồn vào bài đăng.',
    'evidenceQuotes: liệt kê 2-4 đoạn CÓ THẬT CHÍNH XÁC từng chữ trong văn bản nguồn (25-180 ký tự mỗi đoạn),',
    'chúng là bằng chứng nội bộ, KHÔNG đưa các trích dẫn này vào bài đăng.',
    'visualSteps: đúng 3 nhãn hành động ngắn (6-23 ký tự) để vẽ hình gốc, không nêu số liệu.',
    'Chỉ trả JSON đúng cấu trúc: {"canWrite":true,"title":"...",',
    '"slug":"...","description":"...","markdown":"...","evidenceQuotes":["...","..."],',
    '"visualSteps":["...","...","..."],"imageAlt":"..."}',
    'Không thêm markdown fences, không thêm nguồn ngoài. Không bịa sự kiện mới.',
    'Nguồn: ' + source.sourceUrl + ' (ngày: ' + source.sourceDate + ')',
    'VĂN BẢN NGUỒN:\n' + source.sourceText.slice(0, 15500),
    'CÁC CHỦ ĐỀ ĐÃ CÓ (cần tránh trùng):\n' + titles.join('\n').slice(0, 12500),
  ].join('\n\n');
  const response = await api.models.generateContent({
    model: process.env.GEMINI_EDITORIAL_MODEL?.trim() || 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 6500 },
  });
  return cleanJsonOutput(response.text);
}

function safeYamlString(text) {
  return JSON.stringify(String(text).replace(/[\r\n]+/gu, ' '));
}

function renderArticle(draft, source, now, imagePath) {
  const body = draft.markdown.replace(/^#\s+[^\n]+\n+/u, '').trim();
  return '---\n' +
    'title: ' + safeYamlString(draft.title) + '\n' +
    'description: ' + safeYamlString(draft.description) + '\n' +
    'date: ' + now.toISOString() + '\n' +
    'image: ' + safeYamlString(imagePath) + '\n' +
    '---\n\n' +
    '# ' + draft.title.trim() + '\n\n' + body + '\n\n' +
    '## Nguồn đối chiếu\n\n' +
    '- [Thông tin chính thức từ Viettel](' + source.sourceUrl + '), ngày công bố: ' + source.sourceDate + '.\n' +
    '- Bài viết do ban biên tập tự biên soạn từ nguồn trên, không đại diện cho nhà mạng.\n';
}

async function main() {
  const now = new Date();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return jsonReport({ status: 'HOLD', reason: 'GEMINI_API_KEY_SECRET_MISSING' });
  const inventory = existingTitlesAndSlugs();
  const ai = new GoogleGenAI({ apiKey });
  const pages = [];
  try {
    const seed = await retrieveOfficialArticle(START_URL, now);
    pages.push(seed);
    const links = findOfficialArticleLinks(seed.html, seed.sourceUrl);
    for (const link of links.slice(0, MAX_SOURCE_CHECKS - 1)) {
      try {
        const item = await retrieveOfficialArticle(link, now);
        if (item.valid) pages.push(item);
      } catch (error) {
        console.log('OFFICIAL_SOURCE_SKIP=' + error.message);
      }
    }
  } catch (error) {
    return jsonReport({ status: 'HOLD', reason: 'OFFICIAL_SOURCE_FETCH_FAILED: ' + error.message });
  }
  const candidates = pages.filter(page => page.valid)
    .sort((left, right) => right.sourceDate.localeCompare(left.sourceDate));
  if (!candidates.length) {
    return jsonReport({ status: 'HOLD', reason: 'NO_CURRENT_OFFICIAL_MOBILE_SOURCE' });
  }
  const failures = [];
  for (const source of candidates.slice(0, 4)) {
    try {
      const draft = await draftWithGemini(ai, source, inventory);
      if (!draft.canWrite) {
        failures.push('INSUFFICIENT_SOURCE_MATERIAL');
        continue;
      }
      const validation = validateOriginalDraft(draft, source.sourceText,
        source.sourceUrl, inventory.titles);
      if (inventory.slugs.has(draft.slug)) validation.push('CANONICAL_SLUG_EXISTS');
      if (validation.length) {
        failures.push(validation.join(','));
        continue;
      }
      const slug = draft.slug;
      const imagePath = '/images/editorial/' + slug + '.svg';
      const articlePath = 'src/content/posts/' + slug + '.md';
      const svg = renderOriginalEditorialSvg({
        slug, title: draft.title, alt: draft.imageAlt || draft.title,
        visualSteps: draft.visualSteps,
      });
      const markdown = renderArticle(draft, source, now, imagePath);
      if (existsSync(articlePath) || existsSync('public' + imagePath)) {
        failures.push('EDITORIAL_ASSET_ALREADY_EXISTS');
        continue;
      }
      mkdirSync(dirname(join(ROOT, articlePath)), { recursive: true });
      mkdirSync(dirname(join(ROOT, 'public' + imagePath)), { recursive: true });
      writeFileSync(join(ROOT, articlePath), markdown, 'utf8');
      writeFileSync(join(ROOT, 'public' + imagePath), svg, 'utf8');
      const verified = readFileSync(join(ROOT, articlePath), 'utf8') === markdown &&
        readFileSync(join(ROOT, 'public' + imagePath), 'utf8') === svg;
      if (!verified) throw new Error('ARTIFACT_READBACK_MISMATCH');
      return jsonReport({
        status: 'STAGED_FOR_REVIEW', article: articlePath, image: 'public' + imagePath,
        sourceUrl: source.sourceUrl, sourceDate: source.sourceDate,
        sourceDigest: createHash('sha256').update(source.sourceText).digest('hex'),
        wordCount: draft.markdown.trim().split(/\s+/u).length,
        evidenceQuotesChecked: draft.evidenceQuotes.length,
        published: false, requiresTwoHumanReviews: true, ownerApprovalRequired: true,
      });
    } catch (error) {
      failures.push('AI_OR_EDITORIAL_GATE: ' + error.message);
    }
  }
  return jsonReport({ status: 'HOLD', reason: failures.join(' | ').slice(0, 1000) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error('AI_EDITORIAL_CREATION_FAILED=' + error.message);
    process.exitCode = 1;
  });
}
