#!/usr/bin/env node
// Static regression checks only. Full 390x844 browser measurement remains a separate gate.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function anchorsIn(file) {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/<a\b[^>]*>/gi)].map(match => match[0]);
}

function ensureTapTarget(file, href, label) {
  const matches = anchorsIn(file).filter(anchor => anchor.includes('href="' + href + '"'));
  assert(matches.length > 0, 'Missing ' + label + ' action in ' + file);
  // The destination might occur in breadcrumb navigation too; check the bottom CTA.
  assert(matches.some(anchor => anchor.includes('min-h-[48px]')),
    'HOLD: ' + label + ' CTA needs at least 48px source min-height');
}

const article = 'src/pages/posts/[slug].astro';
ensureTapTarget(article, '/goi-cuoc', 'package list');
ensureTapTarget(article, '/tin-tuc', 'article list');
ensureTapTarget(article, 'tel:18008098', 'hotline');

const listing = 'src/pages/tin-tuc.astro';
ensureTapTarget(listing, '/', 'listing footer');
const detailLinks = anchorsIn(listing).filter(anchor => anchor.includes('href={`/posts/${item.slug}`}'));
assert(detailLinks.length > 0, 'Missing article-card detail CTA');
// The full image card is already 192px tall; the explicit text CTA needs 48px.
assert(detailLinks.some(anchor => anchor.includes('min-h-[48px]')),
  'HOLD: article-card CTA needs at least 48px source min-height');
console.log('PASS: CTA source min-height contracts. Actual mobile viewport measurement remains required.');
