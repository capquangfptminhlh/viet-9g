import crypto from 'crypto';
import fs from 'fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isPackageTopicEligible, runAutoBlogger } from '../../scripts/auto-blogger';
import { loadPackageCatalog } from '../../src/data/package-catalog';
import { createTopicDraftHtml } from '../../packages/content-engine/blogger-content-generator';
import { createIdempotencyKey } from '../../packages/connectors/blogger/blogger.idempotency';
import type { BloggerClient, BloggerPostRequest } from '../../packages/connectors/blogger/blogger.types';

afterEach(() => vi.restoreAllMocks());

describe('Auto Blogger Orchestration', () => {
  it('publishes an eligible topic and marks the durable attempt LIVE only after read-back verification', async () => {
    const inserts: BloggerPostRequest[] = [];
    const writes: string[] = [];
    const summaries: string[] = [];
    const events: string[] = [];
    const client: BloggerClient = {
      async insertPost(request) {
        events.push('insertPost');
        inserts.push(request);
        return { id: 'post-1', status: 'LIVE', url: 'https://example.blogspot.com/eligible-topic' };
      },
      async getPost(blogId, postId) {
        const inserted = inserts[0];
        return {
          id: postId,
          blog: { id: blogId },
          status: 'LIVE',
          title: inserted.requestBody.title,
          content: inserted.requestBody.content,
          labels: inserted.requestBody.labels,
        };
      },
      async listPosts() { return []; },
    };
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'writeFileSync').mockImplementation((_path, data) => {
      const serialized = String(data);
      writes.push(serialized);
      events.push(`ledger:${JSON.parse(serialized)[0].status}`);
    });
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });

    const result = await runAutoBlogger({
      client,
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 'eligible-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Eligible topic', sourceFactIds: ['f1'] }],
      env: {
        BLOGGER_ENABLED: 'true',
        GITHUB_STEP_SUMMARY: 'summary.md',
        BLOGGER_CLIENT_SECRET: 'must-not-leak',
      },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].isDraft).toBe(false);
    expect(events.indexOf('ledger:INSERT_STARTED')).toBeLessThan(events.indexOf('insertPost'));
    const initialLedger = JSON.parse(writes[0]);
    expect(initialLedger).toMatchObject([{
      topicId: 'eligible-topic', status: 'INSERT_STARTED',
    }]);
    expect(initialLedger[0]).not.toHaveProperty('postId');
    expect(JSON.parse(writes.at(-1)!)).toMatchObject([{
      topicId: 'eligible-topic', postId: 'post-1', status: 'LIVE', publishedAt: expect.any(String),
    }]);
    expect(result).toMatchObject({
      status: 'SUCCESS', exitCode: 0, selectedTopicId: 'eligible-topic',
      publishedUrl: 'https://example.blogspot.com/eligible-topic',
    });
    expect(summaries.join('\n')).toContain('Status: LIVE');
    expect(summaries.join('\n')).toContain('https://example.blogspot.com/eligible-topic');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('marks the same attempt VERIFY_FAILED and stops after a failed LIVE read-back', async () => {
    const inserts: BloggerPostRequest[] = [];
    const writes: string[] = [];
    const summaries: string[] = [];
    const client: BloggerClient = {
      async insertPost(request) {
        inserts.push(request);
        return { id: 'post-unverified', status: 'LIVE' };
      },
      async getPost(blogId, postId) {
        const inserted = inserts[0];
        return {
          id: postId,
          blog: { id: blogId },
          status: 'DRAFT',
          title: inserted.requestBody.title,
          content: inserted.requestBody.content,
          labels: inserted.requestBody.labels,
        };
      },
      async listPosts() { return []; },
    };
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'writeFileSync').mockImplementation((_path, data) => { writes.push(String(data)); });
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await runAutoBlogger({
      client,
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 'first', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'First topic', sourceFactIds: ['f1'] },
        { topicId: 'second', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Second topic', sourceFactIds: ['f1'] },
      ],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_REFRESH_TOKEN: 'must-not-leak' },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(inserts).toHaveLength(1);
    expect(result).toMatchObject({ status: 'ERROR', exitCode: 1, selectedTopicId: 'first' });
    expect(JSON.parse(writes.at(-1)!)).toMatchObject([{
      topicId: 'first', postId: 'post-unverified', status: 'VERIFY_FAILED',
    }]);
    expect(summaries.join('\n')).toContain('Status: VERIFY_FAILED');
    expect(summaries.join('\n')).toContain('Topic: first');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it.each([
    ['missing', undefined],
    ['blank', ''],
  ])('marks an insert response with a %s post id VERIFY_FAILED without another insert', async (_label, responseId) => {
    const inserts: BloggerPostRequest[] = [];
    const writes: string[] = [];
    let readBacks = 0;
    const client: BloggerClient = {
      async insertPost(request) {
        inserts.push(request);
        return { id: responseId, status: 'LIVE' } as any;
      },
      async getPost() {
        readBacks += 1;
        throw new Error('read-back must not run without a valid post id');
      },
      async listPosts() { return []; },
    };
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'writeFileSync').mockImplementation((_path, data) => { writes.push(String(data)); });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await runAutoBlogger({
      client,
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 'invalid-id', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Invalid ID', sourceFactIds: ['f1'] },
        { topicId: 'must-not-run', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Must not run', sourceFactIds: ['f1'] },
      ],
      env: { BLOGGER_ENABLED: 'true' },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'ERROR', exitCode: 1, selectedTopicId: 'invalid-id' });
    expect(inserts).toHaveLength(1);
    expect(readBacks).toBe(0);
    expect(writes).toHaveLength(2);
    const initialLedger = JSON.parse(writes[0]);
    const failedLedger = JSON.parse(writes[1]);
    expect(failedLedger).toHaveLength(1);
    expect(failedLedger[0]).toMatchObject({
      idempotencyKey: initialLedger[0].idempotencyKey,
      topicId: 'invalid-id',
      status: 'VERIFY_FAILED',
    });
    expect(failedLedger[0]).not.toHaveProperty('postId');
  });

  it('does not fabricate a published URL for a verified LIVE response without one', async () => {
    let inserted: BloggerPostRequest | undefined;
    const summaries: string[] = [];
    const client: BloggerClient = {
      async insertPost(request) {
        inserted = request;
        return { id: 'post-without-url', status: 'LIVE' };
      },
      async getPost(blogId, postId) {
        return {
          id: postId,
          blog: { id: blogId },
          status: 'LIVE',
          title: inserted!.requestBody.title,
          content: inserted!.requestBody.content,
          labels: inserted!.requestBody.labels,
        };
      },
      async listPosts() { return []; },
    };
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });

    const result = await runAutoBlogger({
      client,
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 'no-url', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'No URL', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md' },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'SUCCESS', selectedTopicId: 'no-url' });
    expect(result).not.toHaveProperty('publishedUrl');
    expect(summaries.join('\n')).not.toContain('Published URL:');
    expect(summaries.join('\n')).not.toContain('blogspot.com');
  });

  it('does not insert held, expired, operator-unverified, duplicate, or reserved topics', async () => {
    const inserts: BloggerPostRequest[] = [];
    const duplicateSignature = crypto.createHash('sha256').update('a:duplicate topic').digest('hex');
    const reservedKey = createIdempotencyKey('a', 'reserved-topic', 'v1');
    const ledger = [
      { idempotencyKey: 'older-key', blogId: 'a', topicId: 'older', contentHash: duplicateSignature, status: 'LIVE', createdAt: '2026-01-01T00:00:00.000Z' },
      { idempotencyKey: reservedKey, blogId: 'a', topicId: 'reserved-topic', contentHash: 'reserved', status: 'INSERT_STARTED', createdAt: '2026-01-02T00:00:00.000Z' },
    ];
    const originalReadFileSync = fs.readFileSync;
    const summaries: string[] = [];
    const client: BloggerClient = {
      async insertPost(request) { inserts.push(request); return { id: 'unexpected', status: 'LIVE' }; },
      async getPost() { throw new Error('unexpected read-back'); },
      async listPosts() { return []; },
    };
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'state/blogger-publication-ledger.json');
    vi.spyOn(fs, 'readFileSync').mockImplementation(((...args: any[]) => {
      if (String(args[0]) === 'state/blogger-publication-ledger.json') return JSON.stringify(ledger);
      return (originalReadFileSync as any)(...args);
    }) as any);
    const write = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });

    const result = await runAutoBlogger({
      client,
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 'held-topic', status: 'HOLD', targetBlogId: 'a', intent: 'info', title: 'Held topic', sourceFactIds: ['f1'] },
        { topicId: 'expired-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Expired topic', sourceFactIds: ['expired'] },
        { topicId: 'package-topic', packageId: 'v120b', status: 'QUEUE', targetBlogId: 'a', intent: 'review', title: 'Package topic', sourceFactIds: [] },
        { topicId: 'duplicate-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Duplicate topic', sourceFactIds: ['f1'] },
        { topicId: 'reserved-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Reserved topic', sourceFactIds: ['f1'] },
      ],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_CLIENT_SECRET: 'must-not-leak' },
      facts: [
        { id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' },
        { id: 'expired', expiresAt: '2026-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' },
      ],
      now: new Date('2026-08-02T00:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1 });
    expect(inserts).toHaveLength(0);
    expect(write).not.toHaveBeenCalled();
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).toContain('TOPIC_QUEUE_EXHAUSTED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('stops before selecting or inserting when the blog already has a LIVE post on the same Asia/Ho_Chi_Minh date', async () => {
    const inserts: BloggerPostRequest[] = [];
    const summaries: string[] = [];
    const ledger = [{
      idempotencyKey: 'published-today', blogId: 'a', topicId: 'earlier-topic', contentHash: 'earlier',
      status: 'LIVE', createdAt: '2026-08-01T17:30:00.000Z', publishedAt: '2026-08-01T17:30:00.000Z',
    }];
    const client: BloggerClient = {
      async insertPost(request) { inserts.push(request); return { id: 'unexpected', status: 'LIVE' }; },
      async getPost() { throw new Error('unexpected read-back'); },
      async listPosts() { return []; },
    };
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'state/blogger-publication-ledger.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(ledger));
    const write = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });

    const result = await runAutoBlogger({
      client,
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 'next-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Next topic', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md' },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
      now: new Date('2026-08-02T15:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'DAILY_LIMIT_REACHED', exitCode: 1, attemptedBlogIds: ['a'] });
    expect(inserts).toHaveLength(0);
    expect(write).not.toHaveBeenCalled();
    expect(summaries.join('\n')).toContain('Result: DAILY_LIMIT_REACHED');
  });

  it('accepts a BOM-prefixed durable ledger', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 't1', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    });
    expect(result.status).toBe('SUCCESS');
  });

  it('skips a topic if fact validation fails and picks the next valid topic', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 't1', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['missing-fact'] },
        { topicId: 't2', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'T2', sourceFactIds: ['f1'] }
      ],
      env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    });
    expect(result).toMatchObject({ status: 'SUCCESS', selectedTopicId: 't2' });
  });

  it('returns TOPIC_QUEUE_EXHAUSTED with a non-zero exit code when no topic survives validation', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 't1', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['missing-fact'] }],
      env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    });
    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1 });
  });

  it('skips an already published title signature and selects the next eligible topic', async () => {
    const duplicateSignature = crypto.createHash('sha256').update('a:duplicate title').digest('hex');
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'state/blogger-publication-ledger.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([{
      idempotencyKey: 'unrelated-topic-key', blogId: 'a', topicId: 'older-topic', contentHash: duplicateSignature,
      status: 'LIVE', createdAt: '2026-01-01T00:00:00.000Z'
    }]));
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 'new-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Duplicate Title', sourceFactIds: ['f1'] },
        { topicId: 'next-topic', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'Different Topic', sourceFactIds: ['f1'] }
      ],
      env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    });
    expect(result).toMatchObject({ status: 'SUCCESS', selectedTopicId: 'next-topic' });
  });

  it('preserves malformed ledger JSON errors', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'state/blogger-publication-ledger.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    await expect(runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 't1', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_CLIENT_SECRET: 'must-not-leak' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    })).rejects.toThrow(SyntaxError);
    expect(summaries.join('\n')).toContain('Result: ERROR');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('preserves malformed fact-store JSON errors', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'data/facts.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_REFRESH_TOKEN: 'must-not-leak' } })).rejects.toThrow(SyntaxError);
    expect(summaries.join('\n')).toContain('Result: ERROR');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('preserves malformed site-config JSON errors', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'config/blogger-sites.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_CLIENT_SECRET: 'must-not-leak' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }] })).rejects.toThrow(SyntaxError);
    expect(summaries.join('\n')).toContain('Result: ERROR');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('preserves malformed topic-config JSON errors and writes a secret-free error summary', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'config/topics.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    await expect(runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_CLIENT_SECRET: 'must-not-leak' },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
    })).rejects.toThrow(SyntaxError);
    expect(summaries.join('\n')).toContain('Result: ERROR');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('writes a secret-free error summary when the fact store is missing', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    await expect(runAutoBlogger({
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_REFRESH_TOKEN: 'must-not-leak' },
    })).rejects.toThrow('FACT_STORE_EMPTY');
    expect(summaries.join('\n')).toContain('Result: ERROR');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('does not execute when BLOGGER_ENABLED is not true', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'false', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_CLIENT_SECRET: 'must-not-leak' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }] })).resolves.toMatchObject({ status: 'DISABLED' });
    expect(summaries.join('\n')).toContain('Result: DISABLED');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('writes a not-published summary when no eligible site exists', async () => {
    const summaries: string[] = [];
    vi.spyOn(fs, 'appendFileSync').mockImplementation((_path, data) => { summaries.push(String(data)); });
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: false }],
      env: { BLOGGER_ENABLED: 'true', GITHUB_STEP_SUMMARY: 'summary.md', BLOGGER_CLIENT_SECRET: 'must-not-leak' },
      facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }],
    });
    expect(result).toMatchObject({ status: 'NO_ELIGIBLE_SITES', exitCode: 0 });
    expect(summaries.join('\n')).toContain('Result: NO_ELIGIBLE_SITES');
    expect(summaries.join('\n')).toContain('Status: NOT_PUBLISHED');
    expect(summaries.join('\n')).not.toContain('must-not-leak');
  });

  it('returns a non-zero empty-topic result when topics list is empty', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }], topics: [], env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    });
    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] });
  });

  it('holds an unverified package topic without creating a draft', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 'pkg-topic', packageId: 'v120b', status: 'QUEUE', targetBlogId: 'a', intent: 'review', title: 'V120B review', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    });
    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1 });
  });

  it('rejects package topics whose source facts do not exactly match catalog evidence', () => {
    const catalog = loadPackageCatalog();
    expect(isPackageTopicEligible({ packageId: 'v120b', sourceFactIds: ['unrelated'] } as any, catalog, new Date())).toBe(false);
  });

  it('creates topic-specific editorial text with structured sections', () => {
    const draft = createTopicDraftHtml('Cách kiểm tra dung lượng 4G', [{ claim: 'Bấm *098#' }]);
    expect(draft).toContain('Cách kiểm tra dung lượng 4G');
    expect(draft).toContain('Bấm *098#');
    expect(draft).toContain('Câu hỏi thường gặp (FAQ)');
  });
});
