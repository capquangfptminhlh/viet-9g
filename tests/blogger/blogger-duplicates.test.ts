import { describe, expect, it } from 'vitest';
import { detectDuplicate } from '../../packages/content-engine/blogger-duplicate-detector';

describe('Blogger duplicate detection', () => {
  it('rejects an exact prior content hash before API insertion', () => {
    expect(detectDuplicate({ contentHash: 'same' }, [{ contentHash: 'same' }]))
      .toMatchObject({ decision: 'REJECT' });
  });
});
