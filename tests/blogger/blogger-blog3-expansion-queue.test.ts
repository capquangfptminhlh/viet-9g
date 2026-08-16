import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { resolveCanonicalTargetPath } from '../../src/data/canonical-target-path';

const root = path.resolve(import.meta.dirname, '../..');
const blogId = '2757413717171314447';
const auditDate = new Date('2026-08-03T00:00:00Z');

const readJson = (relativePath: string): any => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, ''),
);

const isOfficialViettelUrl = (value: string) => {
  const host = new URL(value).hostname;
  return ['viettel.vn', 'vietteltelecom.vn', '098.viettel.vn'].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
};

const routeExists = (targetUrlPath: string) => {
  const canonicalPath = resolveCanonicalTargetPath(targetUrlPath);
  const relative = canonicalPath.replace(/^\/posts\//, 'posts/').replace(/\/$/, '');
  return fs.existsSync(path.join(root, 'src', 'content', `${relative}.md`));
};

describe('Blog 3 expansion queue configuration', () => {
  it('queues every ready Blog 3 topic only with an official, unexpired fact and resolvable canonical route', () => {
    const candidates = readJson('docs/topic-candidates/ready-blog3-expansion.json');
    const topics = readJson('config/topics.json');
    const factsById = new Map(readJson('data/facts.json').map((fact: any) => [fact.id, fact]));
    const queuedById = new Map(
      topics
        .filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE')
        .map((topic: any) => [topic.topicId, topic]),
    );

    expect(candidates).toHaveLength(14);
    for (const candidate of candidates) {
      expect(['EXISTING', 'REQUIRED_NEW']).toContain(candidate.targetRouteStatus);
      expect(routeExists(candidate.targetUrlPath)).toBe(true);
      expect(candidate.sourceFactIds?.length).toBeGreaterThan(0);

      for (const factId of candidate.sourceFactIds) {
        const fact = factsById.get(factId) as { sourceUrl: string; expiresAt: string } | undefined;
        expect(fact).toBeDefined();
        expect(isOfficialViettelUrl(fact.sourceUrl)).toBe(true);
        expect(Date.parse(fact.expiresAt)).toBeGreaterThan(auditDate.getTime());
      }

      const queued = queuedById.get(candidate.topicId);
      expect(queued).toMatchObject({
        targetBlogId: blogId,
        title: candidate.title,
        intent: candidate.intent,
        sourceFactIds: candidate.sourceFactIds,
        targetUrlPath: candidate.targetUrlPath,
        imageBrief: candidate.imageBrief,
        imageAlt: candidate.imageAlt,
        status: 'QUEUE',
      });
    }
  });
});
