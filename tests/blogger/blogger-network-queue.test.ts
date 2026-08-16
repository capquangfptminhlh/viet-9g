import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveCanonicalTargetPath } from '../../src/data/canonical-target-path';

const root = path.resolve(import.meta.dirname, '../..');
const auditDate = new Date('2026-08-03T00:00:00Z');
const siteIds = [
  '5229528996284551001',
  '5656849674298814641',
  '2757413717171314447',
  '6831378030642060628',
  '9153601315328665051',
];

const readJson = (file: string) => JSON.parse(
  fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''),
);

const routeExists = (targetUrlPath: string) => {
  const canonicalPath = resolveCanonicalTargetPath(targetUrlPath);
  if (canonicalPath.startsWith('/goi-cuoc/')) {
    const packageId = canonicalPath.split('/').filter(Boolean).at(-1);
    const catalog = readJson('data/package-catalog.v1.json');
    return catalog.packages.some((pkg: any) => pkg.id === packageId);
  }
  const relative = canonicalPath.replace(/^\/posts\//, 'posts/').replace(/\/$/, '.md');
  const markdownPath = relative.endsWith('.md') ? relative : `${relative}.md`;
  return fs.existsSync(path.join(root, 'src', 'content', markdownPath));
};

describe('five-blog publication queue', () => {
  it('has exactly 30 eligible queued topics per configured blog', () => {
    const topics = readJson('config/topics.json');
    const facts = new Map(readJson('data/facts.json').map((fact: any) => [fact.id, fact]));
    const catalog = readJson('data/package-catalog.v1.json');
    const catalogFacts = new Map([
      ...catalog.facts,
      ...catalog.packages.flatMap((pkg: any) => pkg.facts),
    ].map((fact: any) => [fact.id, fact]));

    for (const blogId of siteIds) {
      const queued = topics.filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE');
      expect(queued, `queue for ${blogId}`).toHaveLength(30);
      expect(new Set(queued.map((topic: any) => topic.topicId)).size, `unique topic IDs for ${blogId}`).toBe(30);
      for (const topic of queued) {
        expect(topic.targetUrlPath).toMatch(/^\/(?!.*\.\.)/);
        expect(routeExists(topic.targetUrlPath)).toBe(true);
        expect(topic.sourceFactIds?.length).toBeGreaterThan(0);
        const store = topic.packageId ? catalogFacts : facts;
        for (const factId of topic.sourceFactIds) {
          const fact = store.get(factId);
          expect(fact, `${topic.topicId} fact ${factId}`).toBeDefined();
          expect(new URL(fact.sourceUrl).hostname).toMatch(/(^|\.)(viettel\.vn|vietteltelecom\.vn)$/);
          expect(Date.parse(fact.expiresAt)).toBeGreaterThan(auditDate.getTime());
        }
      }
    }
  });

  it('keeps all five Blogger sites enabled after the queue is complete', () => {
    const sites = readJson('config/blogger-sites.json').sites;
    expect(sites.filter((site: any) => site.enabled).map((site: any) => site.blogId).sort()).toEqual([...siteIds].sort());
  });
});
