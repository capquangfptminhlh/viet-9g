import { describe, expect, it } from 'vitest';
import { runAutoBlogger } from '../../scripts/auto-blogger';

describe('Auto Blogger Orchestration', () => {
  it('selects one eligible site and stops after one draft outcome', async () => {
    const result = await runAutoBlogger({
      sites: [{ blogId: 'a', enabled: true }, { blogId: 'b', enabled: true }],
      topics: [{ topicId: 't1' }],
      env: { BLOGGER_ENABLED: 'true' },
      now: new Date('2026-08-01'),
      facts: [{ id: 'f1' }]
    });
    expect(result.attemptedBlogIds).toHaveLength(1);
  });

  it('does not execute when BLOGGER_ENABLED is not true', async () => {
    await expect(runAutoBlogger({ env: { BLOGGER_ENABLED: 'false' }, facts: [{ id: 'f1' }] })).resolves.toMatchObject({ status: 'DISABLED' });
  });

  it('returns a non-zero empty-topic result without calling Blogger', async () => {
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
