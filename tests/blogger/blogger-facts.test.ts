import { describe, expect, it } from 'vitest';
import { validateBloggerFacts, requireFactStore } from '../../packages/content-engine/blogger-fact-validator';
import { detectDuplicate } from '../../packages/content-engine/blogger-duplicate-detector';

describe('Blogger fact validation', () => {
  it('holds a quantitative claim without a matching source fact', () => {
    expect(validateBloggerFacts({ claims: [{ text: '20GB', sourceFactIds: [] }] }, []))
      .toMatchObject({ decision: 'HOLD' });
  });

  it('fails startup when the canonical fact store is empty', () => {
    expect(() => requireFactStore([])).toThrow(/FACT_STORE_EMPTY/);
  });
});

describe('Blogger duplicate detection', () => {
  it('rejects an exact prior content hash before API insertion', () => {
    expect(detectDuplicate({ contentHash: 'same' }, [{ contentHash: 'same' }]))
      .toMatchObject({ decision: 'REJECT' });
  });
});
