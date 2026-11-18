#!/usr/bin/env node
// This is a static regression check, not a substitute for a 390x844 browser test.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function ensureTapTarget(file, href, label) {
  const source = readFileSync(file, 'utf8');
  const pattern = new RegExp('<a\\\\s+href="' + href.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\  const anchor = source.match(new RegExp('<a\\s+href="' + href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>', 'i'))?.[0];
  assert(anchor, 'Missing ' + label + ' action in ' + file);
  assert(anchor.includes('min-h-[48px]'), 'HOLD: ' + label + ' must have at least 48px min height');') + '"[^>]*>', 'gi');
  const anchors = [...source.matchAll(pattern)].map(match => match[0]);
  assert(anchors.length > 0, 'Missing ' + label + ' action in ' + file);
  // The same destination can appear in tiny breadcrumb navigation. Check the CTA,
  // not the first breadcrumb anchor that happens to share an href.
  assert(anchors.some(anchor => anchor.includes('min-h-[48px]')), 'HOLD: ' + label + ' CTA must have at least 48px min height');
}

const article = 'src/pages/posts/[slug].astro';
ensureTapTarget(article, '/goi-cuoc', 'article package list');
ensureTapTarget(article, '/tin-tuc', 'article article list');
ensureTapTarget(article, 'tel:18008098', 'article hotline');

const listing = 'src/pages/tin-tuc.astro';
ensureTapTarget(listing, '/', 'listing footer back navigation');
// The article cards have dynamic href values; inspect their CSS class directly.
const source = readFileSync(listing, 'utf8');
const detailLink = source.match(/<a\b[^>]*href=\{`\/posts\/\$\{item\.slug\}`\}[^>]*>/g)?.at(-1);
assert(detailLink?.includes('min-h-[48px]'), 'HOLD: article-card detail CTA smaller than 48px');
console.log('PASS — template and listing CTA minimum-height source contracts (browser measurements still required)');
