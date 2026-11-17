import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const slug = '5gip200-viettel-iphone';
const path = join('dist', 'posts', slug, 'index.html');
const fallback = join('dist', 'posts', slug + '.html');
const htmlPath = existsSync(path) ? path : fallback;
assert(existsSync(htmlPath), 'Built article HTML missing: ' + htmlPath);
const html = readFileSync(htmlPath, 'utf8');
assert(html.length > 1500, 'Article HTML unexpectedly short');
assert(/5GIP200/i.test(html), 'Article identity missing');
assert(/<meta[^>]+name=["']viewport["'][^>]*>/i.test(html), 'Mobile viewport missing');
assert(/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html), 'Canonical missing');
assert(html.includes('/images/5gip200-info-2026.svg'), 'Article image missing');
assert(existsSync('dist/images/5gip200-info-2026.svg'), 'Article image asset missing');

// Prevent a repeat of the mobile hero crop reported on production.
const hero = html.match(/<img\\b[^>]*src=["']\\/images\\/5gip200-info-2026\\.svg["'][^>]*>/i);
assert(hero, 'Rendered hero image tag missing');
assert(/\\bh-auto\\b/.test(hero[0]) && /\\bobject-contain\\b/.test(hero[0]), 'Mobile hero must preserve full image aspect ratio');
assert(!/object-cover|scale-105|h-\\[240px\\]/.test(hero[0]), 'Mobile hero must not crop or zoom the text graphic');
const bodyMarkdown = readFileSync('src/content/posts/5gip200-viettel-iphone.md', 'utf8');
assert(!/!\\[[^\\]]*\\]\\(\\/images\\/5gip200-info-2026\\.svg\\)/.test(bodyMarkdown), 'Hero graphic duplicated in article body');

assert(/<h1\b/i.test(html), 'Article H1 missing');
assert(/<article\b/i.test(html), 'Article region missing');
console.log('EDITORIAL HTML PASS', htmlPath, 'bytes', Buffer.byteLength(html));
