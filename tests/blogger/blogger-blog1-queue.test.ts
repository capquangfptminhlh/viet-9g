import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const blogId = '5229528996284551001';
const auditDate = new Date('2026-08-03T00:00:00Z');
const expectedRoutes: Record<string, string> = {
  'topic-b1-esim-5g-tuong-thich': '/posts/esim-5g-kich-hoat-quet-qr/',
  'topic-b1-esim-quet-qr-buoc-dau': '/posts/esim-5g-kich-hoat-quet-qr/',
  'topic-b1-esim-kich-hoat-ket-noi': '/posts/esim-5g-kich-hoat-quet-qr/',
  'topic-b1-iphone-chon-4g-5g-volte': '/posts/cai-dat-4g-5g-volte-iphone-viettel/',
  'topic-b1-roaming-nhat-che-do-mang': '/posts/data-roaming-viettel-iphone-android/',
  'topic-b1-roaming-bat-data-truoc-khi-di': '/posts/data-roaming-viettel-iphone-android/',
  'topic-b1-iphone-data-roaming-duong-dan': '/posts/data-roaming-viettel-iphone-android/',
  'topic-b1-android-data-roaming-duong-dan': '/posts/data-roaming-viettel-iphone-android/',
  'topic-b1-roaming-khoi-dong-lai-may': '/posts/data-roaming-viettel-iphone-android/',
  'topic-b1-roaming-chon-mang-thu-cong': '/posts/chon-mang-thu-cong-roaming-viettel/',
  'topic-b1-roaming-tra-lai-tu-dong': '/posts/chon-mang-thu-cong-roaming-viettel/',
  'topic-b1-iphone-roaming-chon-mang': '/posts/chon-mang-thu-cong-roaming-viettel/',
  'topic-b1-android-roaming-chon-mang': '/posts/chon-mang-thu-cong-roaming-viettel/',
  'topic-b1-ussd-2g-tat-can-cap-nhat-gi': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-ussd-thiet-bi-khong-tuong-thich': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-ussd-dich-vu-bi-anh-huong': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-android-kiem-tra-ussd-ims': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-android-thu-ussd-4g': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-iphone-ussd-4g-volte': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-iphone-kiem-tra-bieu-tuong-mang': '/posts/kiem-tra-bieu-tuong-4g-lte-5g-iphone/',
  'topic-b1-ios-181-ussd-ims': '/posts/ussd-viettel-qua-4g-volte-ims/',
  'topic-b1-do-toc-do-4g-5g-speedtest-ping': '/posts/cach-do-toc-do-4g-5g-viettel/',
  'topic-b1-esim-khong-can-doi-sim-5g': '/posts/esim-5g-kich-hoat-quet-qr/',
  'topic-b1-roaming-chon-mang-iphone-android': '/posts/chon-mang-thu-cong-roaming-viettel/',
};

const readJson = (relativePath: string) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, ''),
);
const isOfficialViettelUrl = (value: string) => {
  const host = new URL(value).hostname;
  return ['viettel.vn', 'vietteltelecom.vn', '098.viettel.vn'].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
};
const routeExists = (targetUrlPath: string) => fs.existsSync(
  path.join(root, 'src', 'content', targetUrlPath.replace(/^\/posts\//, 'posts/').replace(/\/$/, '.md')),
);

describe('Blog 1 queue configuration', () => {
  it('queues exactly the 24 fact-backed topics with their semantic routes', () => {
    const topics = readJson('config/topics.json');
    const factsById = new Map(readJson('data/facts.json').map((fact: any) => [fact.id, fact]));
    const queued = topics.filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE');
    const strictReady = queued.filter((topic: any) => Object.hasOwn(expectedRoutes, topic.topicId));

    expect(strictReady.map((topic: any) => topic.topicId).sort()).toEqual(Object.keys(expectedRoutes).sort());
    expect(strictReady).toHaveLength(24);

    for (const topic of strictReady) {
      expect(topic.targetUrlPath).toBe(expectedRoutes[topic.topicId]);
      expect(routeExists(topic.targetUrlPath)).toBe(true);
      expect(topic.sourceFactIds?.length).toBeGreaterThan(0);
      for (const factId of topic.sourceFactIds) {
        const fact = factsById.get(factId) as any;
        expect(fact).toBeDefined();
        expect(isOfficialViettelUrl(fact.sourceUrl)).toBe(true);
        expect(Date.parse(fact.expiresAt)).toBeGreaterThan(auditDate.getTime());
      }
    }
  });

  it('does not leave legacy Blog 1 topics in QUEUE without an official source and live target route', () => {
    const topics = readJson('config/topics.json');
    const factsById = new Map(readJson('data/facts.json').map((fact: any) => [fact.id, fact]));
    const queued = topics.filter((topic: any) => topic.targetBlogId === blogId && topic.status === 'QUEUE');

    for (const topic of queued) {
      expect(topic.targetUrlPath).toBeTruthy();
      expect(routeExists(topic.targetUrlPath)).toBe(true);
      for (const factId of topic.sourceFactIds ?? []) {
        const fact = factsById.get(factId) as any;
        expect(fact).toBeDefined();
        expect(isOfficialViettelUrl(fact.sourceUrl)).toBe(true);
        expect(Date.parse(fact.expiresAt)).toBeGreaterThan(auditDate.getTime());
      }
    }
  });
});
