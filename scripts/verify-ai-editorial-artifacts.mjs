import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const file = '.website-os/out/ai-editorial-creation.json';
assert(existsSync(file), 'LIVE_SMOKE_FAILED: missing AI source/asset evidence');
const report = JSON.parse(readFileSync(file, 'utf8'));
console.log('AI_LIVE_SMOKE_STATUS=' + report.status);
console.log('AI_LIVE_SMOKE_REASON=' + (report.reason || 'NONE'));
assert.equal(report.status, 'STAGED_FOR_REVIEW',
  'LIVE_SMOKE_HOLD: AI did not actually generate a new draft and graphic (' +
    (report.reason || 'unknown') + ')');

const article = report.article;
const image = report.image;
assert(/^src\/content\/posts\/[a-z0-9-]+\.md$/.test(article), 'Unsafe article path');
assert(/^public\/images\/editorial\/[a-z0-9-]+\.svg$/.test(image), 'Unsafe image path');
const slug = basename(article, '.md');
assert.equal(basename(image, '.svg'), slug, 'Image and article must have same slug');
assert(existsSync(article) && existsSync(image), 'Real article/image were not created');

const markdown = readFileSync(article, 'utf8');
const svg = readFileSync(image, 'utf8');
assert(markdown.includes(report.sourceUrl), 'Real official source not cited');
assert(markdown.includes('image: "/images/editorial/' + slug + '.svg"'),
  'Markdown does not point to own original graphic');
assert(svg.includes('<svg') && svg.includes('viewBox="0 0 1200 630"'),
  'Generated SVG is not a 1200×630 image');
assert(svg.includes('Minh họa biên tập'), 'Generated illustration provenance missing');
assert(report.evidenceQuotesChecked >= 2, 'No matched evidence anchors');
assert.equal(report.published, false, 'Smoke test may not claim production release');

const builtHtml = [
  join('dist', 'posts', slug, 'index.html'),
  join('dist', 'posts', slug + '.html'),
].find(existsSync);
assert(builtHtml, 'Static article HTML missing from dist after real build');
const html = readFileSync(builtHtml, 'utf8');
assert(html.includes('/posts/' + slug), 'Built page lacks canonical article path');
assert(html.includes('/images/editorial/' + slug + '.svg'), 'Built page lacks original graphic');
assert(existsSync(join('dist', 'images', 'editorial', slug + '.svg')),
  'Original graphic absent from built deployment bundle');
console.log('AI_ORIGINAL_ARTICLE_SVG_LIVE_SMOKE=PASS');
console.log('ARTICLE_PATH=' + article);
console.log('ILLUSTRATION_PATH=' + image);
console.log('SOURCE_URL=' + report.sourceUrl);
