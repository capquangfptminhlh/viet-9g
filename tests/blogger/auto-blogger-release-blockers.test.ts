import crypto from 'crypto';
import fs from 'fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createBloggerContentHash,
  runAutoBlogger,
  type PublicationLedgerStore,
} from '../../scripts/auto-blogger';
import { GitHubPublicationLedgerStore } from '../../packages/connectors/blogger/github-publication-ledger-store';
import type { BloggerClient, BloggerPostRequest } from '../../packages/connectors/blogger/blogger.types';
import { createIdempotencyKey, type LedgerEntry } from '../../packages/connectors/blogger/blogger.idempotency';
import { createTopicDraftHtml, generateBloggerDraftPayload } from '../../packages/content-engine/blogger-content-generator';
import { generateReferralUrl } from '../../packages/measurement-engine/blogger-referral-tracker';

afterEach(() => vi.restoreAllMocks());

function passingClient(events: string[] = []): BloggerClient {
  let inserted: BloggerPostRequest | undefined;
  return {
    async insertPost(request) {
      events.push('blogger:insert');
      inserted = request;
      return { id: 'post-1', status: 'LIVE', url: 'https://example.blogspot.com/post-1' } as any;
    },
    async getPost(blogId, postId) {
      return {
        id: postId,
        blog: { id: blogId },
        status: 'LIVE',
        title: inserted!.requestBody.title,
        content: inserted!.requestBody.content,
        labels: inserted!.requestBody.labels,
        url: 'https://example.blogspot.com/post-1',
      } as any;
    },
    async listPosts() { return []; },
  };
}

function memoryStore(initial: LedgerEntry[] = [], events: string[] = []) {
  let entries = structuredClone(initial);
  const store: PublicationLedgerStore = {
    async load() { return structuredClone(entries); },
    async save(next) {
      events.push(`remote:${next.at(-1)?.status}`);
      entries = structuredClone(next);
    },
  };
  return { store, entries: () => entries };
}

const facts = [{ id: 'f1', claim: 'Dùng My Viettel để kiểm tra dung lượng.', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }];
const site = { blogId: 'a', enabled: true, allowedDestination: 'tracuugoicuoc.com' };

describe('release-blocking Blogger safety guarantees', () => {
  it('commits the remote reservation before calling the Blogger API', async () => {
    const events: string[] = [];
    const durable = memoryStore([], events);

    const result = await runAutoBlogger({
      client: passingClient(events),
      ledgerStore: durable.store,
      sites: [site],
      topics: [{ topicId: 'eligible', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Eligible', targetUrlPath: '/tin-tuc/', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' },
      facts,
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(result.status).toBe('SUCCESS');
    expect(events.indexOf('remote:INSERT_STARTED')).toBeLessThan(events.indexOf('blogger:insert'));
  });

  it('fails closed without calling Blogger when the durable reservation cannot be committed', async () => {
    let inserts = 0;
    const client = passingClient();
    vi.spyOn(client, 'insertPost').mockImplementation(async () => {
      inserts += 1;
      return { id: 'unexpected', status: 'LIVE' };
    });
    const store: PublicationLedgerStore = {
      async load() { return []; },
      async save() { throw new Error('GitHub reservation rejected'); },
    };

    const result = await runAutoBlogger({
      client,
      ledgerStore: store,
      sites: [site],
      topics: [{ topicId: 'eligible', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Eligible', targetUrlPath: '/tin-tuc/', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' },
      facts,
    });

    expect(result).toMatchObject({ status: 'ERROR', exitCode: 1 });
    expect(inserts).toBe(0);
  });

  it('rejects a missing target path instead of falling back to an unrelated cancellation URL', async () => {
    const durable = memoryStore();
    const inserted: BloggerPostRequest[] = [];
    const client = passingClient();
    vi.spyOn(client, 'insertPost').mockImplementation(async (request) => {
      inserted.push(request);
      return { id: 'post-1', status: 'LIVE', url: 'https://example.blogspot.com/post-1' } as any;
    });

    const result = await runAutoBlogger({
      client,
      ledgerStore: durable.store,
      sites: [site],
      topics: [
        { topicId: 'missing-target', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Missing target', sourceFactIds: ['f1'] },
        { topicId: 'valid-target', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Valid target', targetUrlPath: '/tin-tuc/', sourceFactIds: ['f1'] },
      ],
      env: { BLOGGER_ENABLED: 'true' },
      facts,
    });

    expect(result.selectedTopicId).toBe('valid-target');
    expect(inserted).toHaveLength(1);
    expect(inserted[0].requestBody.content).not.toContain('/huong-dan/huy-goi-cuoc-viettel/');
    expect(durable.entries()).toContainEqual(expect.objectContaining({
      topicId: 'missing-target', status: 'HOLD', failureReason: 'TARGET_URL_REQUIRED',
    }));
  });

  it('deduplicates generated HTML even when the titles differ', async () => {
    const priorHtml = generateBloggerDraftPayload({
      blogId: 'a',
      title: 'Old title',
      htmlBody: createTopicDraftHtml('Old title', facts, generateReferralUrl('tracuugoicuoc.com', '/tin-tuc/', 'old-topic'), 'informational'),
    }).sanitizedHtml;
    const prior: LedgerEntry = {
      idempotencyKey: crypto.randomUUID(), blogId: 'a', topicId: 'old-topic',
      contentHash: createBloggerContentHash('a', priorHtml), status: 'LIVE', createdAt: '2026-01-01T00:00:00.000Z',
    };
    const durable = memoryStore([prior]);
    let inserts = 0;
    const client = passingClient();
    vi.spyOn(client, 'insertPost').mockImplementation(async () => {
      inserts += 1;
      return { id: 'unexpected', status: 'LIVE' };
    });

    const result = await runAutoBlogger({
      client,
      ledgerStore: durable.store,
      sites: [site],
      topics: [{ topicId: 'new-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Completely different title', targetUrlPath: '/tin-tuc/', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' },
      facts,
    });

    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1 });
    expect(inserts).toBe(0);
    expect(durable.entries()).toContainEqual(expect.objectContaining({
      topicId: 'new-topic', status: 'HOLD', failureReason: 'DUPLICATE_CONTENT',
    }));
  });

  it('records content key, gate results, reason, post id and published URL in durable audit entries', async () => {
    const durable = memoryStore();
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

    await runAutoBlogger({
      client: passingClient(),
      ledgerStore: durable.store,
      sites: [site],
      topics: [{ topicId: 'audited', contentVersion: 'v7', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Audited', targetUrlPath: '/tin-tuc/', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' },
      facts,
    });

    expect(durable.entries()).toContainEqual(expect.objectContaining({
      topicId: 'audited', contentVersion: 'v7', idempotencyKey: expect.any(String),
      status: 'LIVE', postId: 'post-1', publishedUrl: 'https://example.blogspot.com/post-1',
      gateResults: expect.objectContaining({ targetUrl: 'PASS', facts: 'PASS', duplicate: 'PASS', idempotency: 'PASS' }),
    }));
  });

  it('records an auditable durable row when the eligible queue is empty', async () => {
    const durable = memoryStore();

    const result = await runAutoBlogger({
      client: passingClient(),
      ledgerStore: durable.store,
      sites: [site],
      topics: [],
      env: { BLOGGER_ENABLED: 'true' },
      facts,
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1 });
    expect(durable.entries()).toContainEqual(expect.objectContaining({
      status: 'TOPIC_QUEUE_EXHAUSTED', failureReason: 'NO_QUEUED_TOPICS',
      idempotencyKey: expect.any(String), gateResults: { queue: 'REJECT' },
    }));
  });

  it('uses a run-audit key for the daily limit so the queued topic remains eligible tomorrow', async () => {
    const topic = { topicId: 'tomorrow-topic', contentVersion: 'v1', status: 'QUEUE', targetBlogId: 'a', intent: 'informational', title: 'Tomorrow topic', targetUrlPath: '/tin-tuc/', sourceFactIds: ['f1'] };
    const topicKey = createIdempotencyKey('a', topic.topicId, topic.contentVersion);
    const durable = memoryStore([{
      idempotencyKey: 'published-today', blogId: 'a', topicId: 'earlier-topic', contentHash: 'earlier',
      status: 'LIVE', createdAt: '2026-08-02T00:00:00.000Z', publishedAt: '2026-08-02T00:00:00.000Z',
    }]);

    const limited = await runAutoBlogger({
      client: passingClient(), ledgerStore: durable.store, sites: [site], topics: [topic],
      env: { BLOGGER_ENABLED: 'true' }, facts, now: new Date('2026-08-02T02:00:00.000Z'),
    });

    expect(limited.status).toBe('DAILY_LIMIT_REACHED');
    expect(durable.entries()).toContainEqual(expect.objectContaining({
      topicId: topic.topicId, status: 'DAILY_LIMIT_REACHED', idempotencyKey: expect.not.stringMatching(`^${topicKey}$`),
    }));

    const published = await runAutoBlogger({
      client: passingClient(), ledgerStore: durable.store, sites: [site], topics: [topic],
      env: { BLOGGER_ENABLED: 'true' }, facts, now: new Date('2026-08-03T02:00:00.000Z'),
    });

    expect(published).toMatchObject({ status: 'SUCCESS', selectedTopicId: topic.topicId });
    expect(durable.entries()).toContainEqual(expect.objectContaining({
      idempotencyKey: topicKey, topicId: topic.topicId, status: 'LIVE',
    }));
  });
});

describe('GitHubPublicationLedgerStore', () => {
  it('updates the repository ledger with the current blob sha and branch', async () => {
    const initial: LedgerEntry[] = [];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'blob-sha', content: Buffer.from(JSON.stringify(initial)).toString('base64') }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: { sha: 'new-sha' } }), { status: 200 }));
    const store = new GitHubPublicationLedgerStore({
      token: 'secret', repository: 'owner/repo', branch: 'main', fetch: fetchMock as any,
    });
    await store.load();
    await store.save([{ idempotencyKey: 'key', blogId: 'a', topicId: 't', contentHash: 'h', status: 'INSERT_STARTED', createdAt: 'now' }]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, put] = fetchMock.mock.calls[1];
    expect(put.method).toBe('PUT');
    expect(put.headers.Authorization).toBe('Bearer secret');
    expect(JSON.parse(put.body)).toMatchObject({ sha: 'blob-sha', branch: 'main' });
  });

  it.each(['LIVE', 'VERIFY_FAILED'])('rebases and retries a stale-SHA %s terminal update without losing remote rows', async (status) => {
    const reservation: LedgerEntry = {
      idempotencyKey: 'owned-key', blogId: 'a', topicId: 'owned-topic', contentHash: 'owned-hash',
      status: 'INSERT_STARTED', createdAt: '2026-08-02T00:00:00.000Z',
    };
    const concurrent: LedgerEntry = {
      idempotencyKey: 'concurrent-key', blogId: 'b', topicId: 'concurrent-topic', contentHash: 'concurrent-hash',
      status: 'LIVE', createdAt: '2026-08-02T00:01:00.000Z', publishedAt: '2026-08-02T00:01:00.000Z',
    };
    const remoteAfterConflict = [reservation, concurrent];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'reservation-sha', content: Buffer.from(JSON.stringify([reservation])).toString('base64') }), { status: 200 }))
      .mockResolvedValueOnce(new Response('', { status: 409 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'current-sha', content: Buffer.from(JSON.stringify(remoteAfterConflict)).toString('base64') }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: { sha: 'terminal-sha' } }), { status: 200 }));
    const store = new GitHubPublicationLedgerStore({
      token: 'secret', repository: 'owner/repo', branch: 'main', fetch: fetchMock as any,
    });
    const desired = [{ ...reservation, status }];

    await store.load();
    await store.save(desired);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    const retryBody = JSON.parse(fetchMock.mock.calls[3][1].body);
    expect(retryBody.sha).toBe('current-sha');
    const rebased = JSON.parse(Buffer.from(retryBody.content, 'base64').toString('utf-8'));
    expect(rebased).toContainEqual(expect.objectContaining({ idempotencyKey: 'owned-key', status }));
    expect(rebased).toContainEqual(concurrent);
  });
});
