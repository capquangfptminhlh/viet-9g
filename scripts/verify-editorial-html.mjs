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
assert(/<h1\b/i.test(html), 'Article H1 missing');
assert(/<main\b/i.test(html), 'Article main region missing');
console.log('EDITORIAL HTML PASS', htmlPath, 'bytes', Buffer.byteLength(html));
