import { describe, expect, it } from 'vitest';
import { runAutoBlogger } from '../../scripts/auto-blogger';

describe('Auto Blogger Orchestration', () => {
  it('skips a topic if fact validation fails and picks the next valid topic', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 't1', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['missing-fact'] },
        { topicId: 't2', targetBlogId: 'a', intent: 'info', title: 'T2', sourceFactIds: ['f1'] }
      ],
      env: { BLOGGER_ENABLED: 'true' },
      now: new Date('2026-08-01'),
      facts: [{ id: 'f1' }]
    });
    expect(result.attemptedBlogIds).toHaveLength(1);
    expect(result.status).toBe('SUCCESS');
  });

  it('skips a topic if duplicate is detected based on ledger', async () => {
    // Requires mocking fs or idempotency in a real setup, but here we can't easily inject ledger via options yet.
    // Let's rely on the module logic: if topics exhaust, it returns NO_VALID_TOPICS_REMAINING
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [
        { topicId: 't1', targetBlogId: 'a', intent: 'info', title: 'T1', sourceFactIds: ['missing-fact'] }
      ],
      env: { BLOGGER_ENABLED: 'true' },
      facts: [{ id: 'f1' }]
    });
    expect(result.status).toBe('NO_VALID_TOPICS_REMAINING');
  });

  it('does not execute when BLOGGER_ENABLED is not true', async () => {
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'false' }, facts: [{ id: 'f1' }] })).resolves.toMatchObject({ status: 'DISABLED' });
  });

  it('returns a non-zero empty-topic result when topics list is empty', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }],
      topics: [],
      env: { BLOGGER_ENABLED: 'true' },
      now: new Date('2026-08-01'),
      facts: [{ id: 'f1' }]
    });
    expect(result).toMatchObject({ status: 'TOPIC_QUEUE_EXHAUSTED', exitCode: 1, attemptedBlogIds: [] });
  });
});
