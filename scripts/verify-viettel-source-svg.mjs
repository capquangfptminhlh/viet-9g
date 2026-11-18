import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { retrieveOfficialArticle } from './ai-daily-editorial.mjs';
import { renderOriginalEditorialSvg } from './original-editorial-core.mjs';

const officialSource =
  'https://098.viettel.vn/tin-tuc/chi-tiet/huong-dan-moi-nhat-cach-bat-mang-5g-viettel-cho-dien-thoai-smartphone/16290128';
const at = new Date();
const source = await retrieveOfficialArticle(officialSource, at);
const details = {
  observedAt: at.toISOString(),
  sourceUrl: source.sourceUrl,
  httpContentType: 'text/html',
  title: source.title,
  sourceDate: source.sourceDate,
  ageDays: source.ageDays,
  sourceLength: source.sourceText.length,
  sourceSha256: createHash('sha256').update(source.sourceText).digest('hex'),
  htmlFetched: source.html.length > 0,
  sourceVerified: source.valid,
  aiGenerationTested: false,
  productionPublished: false,
};
mkdirSync('.website-os/out/source-smoke', { recursive: true });
writeFileSync('.website-os/out/source-smoke/source.json',
  JSON.stringify(details, null, 2) + '\n', 'utf8');
console.log('VIETTEL_LIVE_SOURCE=' + JSON.stringify(details));
assert(source.valid, 'VIETTEL_SOURCE_FETCH_OR_FRESHNESS_HOLD');

const svg = renderOriginalEditorialSvg({
  slug: 'nguon-viettel-source-only-smoke',
  title: source.title,
  alt: 'Sơ đồ thử nghiệm từ một nguồn Viettel thật',
  visualSteps: ['Mở phần cài đặt', 'Chọn chế độ mạng', 'Xác nhận kết nối'],
});
const svgPath = join('.website-os/out/source-smoke', 'illustration.svg');
writeFileSync(svgPath, svg, 'utf8');
assert.equal(readFileSync(svgPath, 'utf8'), svg, 'Image file read-back failed');
assert(svg.startsWith('<svg') && svg.includes('viewBox="0 0 1200 630"'),
  'Original renderer SVG missing');
console.log('VIETTEL_LIVE_SOURCE_AND_RENDERER_PASS');
