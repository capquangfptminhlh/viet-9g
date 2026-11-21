import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
function selectEvidencePath() {
  const base = process.env.PR_BASE_SHA;
  const head = process.env.PR_HEAD_SHA;
  if (!base || !head) return '.website-os/evidence/editorial-decision-record.yml';
  const candidates = execFileSync('git', [
    'diff', '--name-only', '--diff-filter=AM', base, head, '--', 'src/content/posts',
  ], { encoding: 'utf8' }).split(/\r?\n/u).filter(file => file.endsWith('.md'));
  if (candidates.length === 0) return '.website-os/evidence/editorial-decision-record.yml';
  assert.equal(candidates.length, 1, 'HOLD: exactly one article review at a time');
  const slug = candidates[0].split('/').at(-1).replace(/\.md$/u, '');
  return '.website-os/evidence/editorial-decisions/' + slug + '.yml';
}
const selectedEvidence = selectEvidencePath();
assert(existsSync(join(root, selectedEvidence)), 'HOLD: missing current article-specific evidence: ' + selectedEvidence);
const evidence = readFileSync(join(root, selectedEvidence), 'utf8');
function field(name) {
  const line = evidence.split(/\r?\n/).find((entry) => entry.startsWith(name + ':'));
  assert(line, 'Missing editorial evidence field: ' + name);
  const value = line.slice(name.length + 1).trim();
  assert(value, 'Empty editorial evidence field: ' + name);
  return value.replace(/^["']|["']$/g, '');
}
const canonical = new URL(field('canonical_url'));
const slug = canonical.pathname.split('/').filter(Boolean).at(-1);
const imagePath = field('image_path');
assert(imagePath.startsWith('/images/'), 'Editorial image must be an original local image');
const out = join(root, '.website-os/out/editorial-artifact');
mkdirSync(join(out, 'images'), { recursive: true });
function firstExisting(candidates) {
  const found = candidates.find(existsSync);
  assert(found, 'Missing built artifact: ' + candidates.join(' OR '));
  return found;
}
const html = (s) => firstExisting([join(root, 'dist/posts', s + '.html'), join(root, 'dist/posts', s, 'index.html')]);
const sourceArticle = html(slug);
const sourceTemplate = html('cach-do-toc-do-4g-5g-viettel');
const sourceListing = firstExisting([join(root, 'dist/tin-tuc.html'), join(root, 'dist/tin-tuc/index.html')]);
const sourceImage = join(root, 'dist', imagePath.slice(1));
assert(existsSync(sourceImage), 'Built editorial image missing');
const sitemapCandidates = readdirSync(join(root, 'dist')).filter(x => /^sitemap.*\.xml$/.test(x)).map(x => join(root, 'dist', x));
const sourceSitemap = sitemapCandidates.find(x => readFileSync(x, 'utf8').includes(canonical.pathname));
assert(sourceSitemap, 'Built sitemap missing editorial canonical');
const sources = [
  [sourceArticle, join(out, 'article.html')],
  [sourceTemplate, join(out, 'template.html')],
  [sourceListing, join(out, 'listing.html')],
  [sourceSitemap, join(out, 'sitemap.xml')],
  [sourceImage, join(out, imagePath.slice(1))],
];
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const provenance = sources.map(([source, target]) => {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  assert.equal(sha256(source), sha256(target), 'Evidence copy differs from actual build');
  return { source: source.slice(root.length + 1), target: target.slice(root.length + 1), sha256: sha256(source) };
});
writeFileSync(join(out, 'provenance.json'), JSON.stringify({ observed_at: new Date().toISOString(), canonical_url: canonical.href, files: provenance }, null, 2) + '\n');
console.log('EDITORIAL ARTIFACTS VERIFIED', JSON.stringify(provenance));
