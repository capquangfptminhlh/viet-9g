#!/usr/bin/env node
// Article release gate: built HTML PASS is not equivalent to editorial approval.
// This script only runs strict checks when an article source changed in the PR.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.PR_BASE_SHA;
const head = process.env.PR_HEAD_SHA;
if (!base || !head) {
  console.log('No pull-request content diff to inspect; not a publication approval.');
  process.exit(0);
}
const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=AM', base, head, '--', 'src/content/posts'], { encoding: 'utf8' })
  .split(/\r?\n/).filter(x => x.endsWith('.md'));
if (changed.length === 0) {
  console.log('PASS: source maintenance without new or modified article; no publication claim.');
  process.exit(0);
}

const articles = changed.filter(path => existsSync(path));
assert(articles.length === 1, 'HOLD: only one reviewed article change per release');
const reviewSlug = articles[0].split('/').at(-1).replace(/\.md$/, '');
const evidencePath = '.website-os/evidence/editorial-decisions/' + reviewSlug + '.yml';
assert(existsSync(evidencePath), 'HOLD: per-article editorial review decision missing: ' + evidencePath);
const evidence = readFileSync(evidencePath, 'utf8');
const field = name => evidence.match(new RegExp('^' + name + ':\\s*(.+)$', 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
assert.equal(field('decision'), 'PASS', 'HOLD: article-specific editorial gate is not PASS');
assert.equal(field('scope'), 'ARTICLE_MAINTENANCE', 'HOLD: editorial record scope mismatch');
assert.equal(field('existing_template_mobile_verified'), 'true', 'HOLD: mobile template needs exact-head verification');
assert.match(evidence, /source_references:\s*\n\s*- https:\/\//, 'HOLD: a verifiable primary source is required');

const path = articles[0];
const slug = path.split('/').at(-1).replace(/\.md$/, '');
const canonical = new URL(field('canonical_url'));
assert.equal(canonical.hostname, 'www.tracuugoicuoc.com', 'HOLD: canonical domain mismatch');
assert.equal(canonical.pathname.replace(/\/$/, ''), '/posts/' + slug, 'HOLD: canonical ownership mismatch');
const markdown = readFileSync(path, 'utf8');
const substantive = markdown.replace(/^---[\s\S]*?---/m, '').replace(/\[[^\]]+\]\([^)]*\)/g, '').replace(/[#*|>!]/g, '');
const words = substantive.trim().split(/\s+/u).filter(Boolean);
assert(words.length >= 250, 'HOLD: content appears thin; needs substantive, original editorial expansion');

const built = [
  join('dist', 'posts', slug, 'index.html'),
  join('dist', 'posts', slug + '.html'),
].find(existsSync);
assert(built, 'HOLD: built HTML missing for candidate');
const html = readFileSync(built, 'utf8');
assert.match(html, /<h1\b/i, 'HOLD: H1 missing');
assert.match(html, /<meta[^>]+name=["']description["']/i, 'HOLD: meta description missing');
assert.match(html, /<link[^>]+rel=["']canonical["']/i, 'HOLD: canonical missing');
assert(html.includes('/posts/' + slug), 'HOLD: target URL not rendered');
const image = markdown.match(/^image:\s*["']?(\/images\/editorial\/[a-z0-9-]+\.svg)["']?\s*$/mu)?.[1];
assert(image === '/images/editorial/' + slug + '.svg',
  'HOLD: missing or incorrect per-article original image frontmatter');
assert(existsSync('dist' + image), 'HOLD: original image was not included in dist');
assert(html.includes(image), 'HOLD: original image missing from rendered article');

const listing = [ 'dist/tin-tuc.html', 'dist/tin-tuc/index.html' ].find(existsSync);
assert(listing && readFileSync(listing, 'utf8').includes('/posts/' + slug), 'HOLD: article not listed');
const { readdirSync } = await import('node:fs');
const sitemap = readdirSync('dist').filter(x => /^sitemap.*\.xml$/.test(x))
  .some(x => readFileSync(join('dist', x), 'utf8').includes('/posts/' + slug));
assert(sitemap, 'HOLD: article missing in sitemap');
console.log('PASS — one substantive article, approved editorial, canonical, HTML, mobile record, listing, sitemap:', slug);
