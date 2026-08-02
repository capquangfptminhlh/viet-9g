import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const readJson = (relativePath: string) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, ''),
);
const blogId = '5229528996284551001';
const officialViettelHosts = ['viettel.vn', 'vietteltelecom.vn', '098.viettel.vn'];
const isOfficialViettelUrl = (value: string) => {
  const host = new URL(value).hostname;
  return officialViettelHosts.some((domain) => host === domain || host.endsWith(`.${domain}`));
};
const routeExists = (targetUrlPath: string) => fs.existsSync(
  path.join(root, 'dist', targetUrlPath.replace(/^\/+|\/+$/g, ''), 'index.html'),
);

// Blog 1 may only refer users to a dedicated, context-matched usage guide.
// A generic category such as /tin-tuc/ is intentionally not an eligible target.
const dedicatedUsageRoutes = new Set<string>();

describe('Blog 1 queue configuration', () => {
  it('has zero strict-ready topics until dedicated usage routes exist', () => {
    const topics = readJson('config/topics.json');
    const facts = readJson('data/facts.json');
    const factsById = new Map(facts.map((fact: any) => [fact.id, fact]));
    const queued = topics.filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE');

    const auditDate = new Date('2026-08-03T00:00:00Z');
    const strictReady = queued.filter((topic: any) => (
      topic.targetUrlPath
      && routeExists(topic.targetUrlPath)
      && dedicatedUsageRoutes.has(topic.targetUrlPath)
      && topic.sourceFactIds?.length
      && topic.sourceFactIds.every((id: string) => {
        const fact = factsById.get(id);
        return fact
          && isOfficialViettelUrl(fact.sourceUrl)
          && Date.parse(fact.expiresAt) > auditDate.getTime();
      })
    ));

    expect(strictReady).toHaveLength(0);
  });

  it('does not treat a generic news category as a Blog 1 destination', () => {
    const topics = readJson('config/topics.json');
    const queued = topics.filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE');

    expect(queued.some((topic: any) => topic.targetUrlPath === '/tin-tuc/')).toBe(false);
  });
});
