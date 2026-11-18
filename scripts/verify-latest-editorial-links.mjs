#!/usr/bin/env node
// Compare the rendered ordering against source dates, never a hard-coded post.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const sourceDir = 'src/content/posts';
const dated = readdirSync(sourceDir)
  .filter(file => file.endsWith('.md'))
  .map(file => {
    const text = readFileSync(join(sourceDir, file), 'utf8');
    const frontmatter = text.match(/^---\s*\n([\s\S]*?)\n---/);
    const date = frontmatter?.[1].match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    return {
      slug: file.slice(0, -3),
      timestamp: date ? Date.parse(date + 'T00:00:00Z') : 0,
    };
  })
  .sort((a, b) => b.timestamp - a.timestamp || a.slug.localeCompare(b.slug, 'vi'));

assert(dated.length > 0, 'No editorial source articles found');
const latest = dated[0].slug;

const newsHtml = readFileSync('dist/tin-tuc/index.html', 'utf8');
const firstCard = newsHtml.match(/<article\b[^>]*>[\s\S]*?<a\b[^>]*href="\/posts\/([^"\/]+)"/i)?.[1];
assert(firstCard, 'No visible news card found in built /tin-tuc');
assert.equal(firstCard, latest, 'Newest post must be the first card in the built news listing');

const homeHtml = readFileSync('dist/index.html', 'utf8');
assert(homeHtml.includes('href="/posts/' + latest + '"'),
  'The homepage must expose a direct link to the latest SEO article');

console.log('EDITORIAL_VISIBILITY_PASS: newest date first on /tin-tuc and directly linked from homepage:', latest);
