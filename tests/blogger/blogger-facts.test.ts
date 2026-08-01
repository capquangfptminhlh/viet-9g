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

  it('holds a claim whose text does not match its referenced fact', () => {
    expect(validateBloggerFacts(
      { claims: [{ text: 'Gói 20GB', sourceFactIds: ['f1'] }] },
      [{ id: 'f1', claim: 'Gói 10GB' }]
    )).toMatchObject({ decision: 'HOLD' });
  });

  it('holds a claim that references a fact which does not exist', () => {
    expect(validateBloggerFacts(
      { claims: [{ text: 'Gói có 10GB', sourceFactIds: ['missing'] }] },
      [{ id: 'f1', claim: 'Gói có 10GB' }],
    )).toMatchObject({ decision: 'HOLD' });
  });

  it('accepts normalized quantities when their values appear across referenced facts', () => {
    expect(validateBloggerFacts(
      { claims: [{ text: 'Gói có 10GB và 512 MB trong 30 ngày, giá 15000 VND', sourceFactIds: ['f1', 'f2'] }] },
      [
        { id: 'f1', claim: 'Ưu đãi 10 GB và 512MB', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn/goi-1' },
        { id: 'f2', claim: 'Sử dụng trong 30 ngày, giá 15000 VND', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://vietteltelecom.vn/goi-2' },
      ],
    )).toMatchObject({ decision: 'PASS' });
  });

  it('holds a claim when referenced fact lacks expiresAt', () => {
    expect(validateBloggerFacts(
      { claims: [{ text: 'Gói có 10GB', sourceFactIds: ['f1'] }] },
      [{ id: 'f1', claim: 'Gói có 10GB', sourceUrl: 'https://viettel.vn/goi-1' }],
    )).toMatchObject({ decision: 'HOLD' });
  });

  it('holds a claim when referenced fact has expired', () => {
    expect(validateBloggerFacts(
      { claims: [{ text: 'Gói có 10GB', sourceFactIds: ['f1'] }] },
      [{ id: 'f1', claim: 'Gói có 10GB', expiresAt: '2020-01-01T00:00:00Z', sourceUrl: 'https://viettel.vn/goi-1' }],
    )).toMatchObject({ decision: 'HOLD' });
  });

  it('holds a claim with quantitative data when sourceUrl is not from Viettel allowlist', () => {
    expect(validateBloggerFacts(
      { claims: [{ text: 'Gói có 10GB', sourceFactIds: ['f1'] }] },
      [{ id: 'f1', claim: 'Gói có 10GB', expiresAt: '2030-01-01T00:00:00Z', sourceUrl: 'https://otherdomain.com/goi-1' }],
    )).toMatchObject({ decision: 'HOLD' });
  });
});

describe('Blogger duplicate detection', () => {
  it('rejects an exact prior content hash before API insertion', () => {
    expect(detectDuplicate({ contentHash: 'same' }, [{ contentHash: 'same' }]))
      .toMatchObject({ decision: 'REJECT' });
  });
});
