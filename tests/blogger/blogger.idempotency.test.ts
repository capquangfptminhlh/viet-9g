import { describe, expect, it } from 'vitest';
import { createIdempotencyKey, findLedgerEntry, canInsertDraft } from '../../packages/connectors/blogger/blogger.idempotency';

describe('Blogger idempotency', () => {
  it('returns an existing record for the same blog, topic, and version', () => {
    const key = createIdempotencyKey('blog-1', 'sim-data-check', 'v1');
    expect(findLedgerEntry([{ idempotencyKey: key } as any], key)).toBeDefined();
  });

  it('writes no second entry after an already-recorded successful draft', () => {
    expect(canInsertDraft([{ idempotencyKey: 'same', status: 'DRAFT_CREATED' } as any], 'same')).toBe(false);
  });
});
