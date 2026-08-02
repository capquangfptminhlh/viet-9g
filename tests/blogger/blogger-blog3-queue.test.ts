import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const readJson = (relativePath: string) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, ''),
);

describe('Blog 3 queue activation', () => {
  it('enables only the repaired, fact-backed Blog 3 queue', () => {
    const sites = readJson('config/blogger-sites.json').sites;
    const topics = readJson('config/topics.json');
    const facts = readJson('data/facts.json');
    const blogId = '2757413717171314447';
    const queued = topics.filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE');
    const factIds = new Set(facts.map((fact: any) => fact.id));

    expect(sites.find((site: any) => site.blogId === blogId)).toMatchObject({ enabled: true });
    expect(queued).toHaveLength(14);
    expect(queued.map((topic: any) => topic.topicId)).toEqual([
      'topic-b3-tk-191-account', 'topic-b3-198-support', 'topic-b3-web-traffic-check',
      'topic-b3-gic70-renewal', 'topic-b3-gic70-stop-renewal', 'topic-b3-gic70-cancel-package',
      'topic-b3-yt7-renewal', 'topic-b3-yt7-stop-renewal', 'topic-b3-yt7-cancel-package',
      'topic-b3-yt30-renewal', 'topic-b3-yt30-stop-renewal', 'topic-b3-yt30-cancel-package',
      'topic-b3-st5km-cancel-package', 'topic-b3-huy-vs-huydata',
    ]);
    for (const topic of queued) {
      expect(['informational', 'cancellation']).toContain(topic.intent);
      expect(topic.targetUrlPath).toMatch(/^\/(?!.*\.\.)/);
      expect(topic.sourceFactIds.every((factId: string) => factIds.has(factId))).toBe(true);
    }
  });
});
