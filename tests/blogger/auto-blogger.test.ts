import crypto from 'crypto';
import fs from 'fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runAutoBlogger } from '../../scripts/auto-blogger';
import { createTopicDraftHtml } from '../../packages/content-engine/blogger-content-generator';

afterEach(() => vi.restoreAllMocks());

describe('Auto Blogger Orchestration', () => {
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
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'state/blogger-publication-ledger.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    await expect(runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [{ topicId: 't1', status: 'QUEUE', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['f1'] }],
      env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }]
    })).rejects.toThrow(SyntaxError);
  });

  it('preserves malformed fact-store JSON errors', async () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'data/facts.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'true' } })).rejects.toThrow(SyntaxError);
  });

  it('preserves malformed site-config JSON errors', async () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => String(file) === 'config/blogger-sites.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not-json');
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'true' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }] })).rejects.toThrow(SyntaxError);
  });

  it('does not execute when BLOGGER_ENABLED is not true', async () => {
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'false' }, facts: [{ id: 'f1', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn' }] })).resolves.toMatchObject({ status: 'DISABLED' });
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

  it('creates topic-specific editorial text with structured sections', () => {
    const draft = createTopicDraftHtml('Cách kiểm tra dung lượng 4G', [{ claim: 'Bấm *098#' }]);
    expect(draft).toContain('Cách kiểm tra dung lượng 4G');
    expect(draft).toContain('Bấm *098#');
    expect(draft).toContain('Câu hỏi thường gặp (FAQ)');
  });
});
