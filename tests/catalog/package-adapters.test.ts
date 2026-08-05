import { describe, expect, it } from 'vitest';
import { catalogToTelecomPackages, toTelecomPackage } from '../../packages/catalog/package-adapters';

const now = new Date('2026-08-02T00:00:00.000Z');

function catalog() {
  const fact = (id: string, key: string, value: string | number) => ({
    id, key, value, claim: key, sourceUrl: 'https://www.viettel.vn/goi-cuoc',
    retrievedAt: '2026-08-01T00:00:00.000Z', effectiveAt: '2026-08-01T00:00:00.000Z', expiresAt: '2026-09-01T00:00:00.000Z',
  });
  return {
    schemaVersion: '1.0.0', catalogVersion: 'test', generatedAt: now.toISOString(), facts: [], packages: [
      {
        id: 'verified', code: 'VERIFIED', status: 'active', category: 'combo',
        factIds: ['price', 'duration', 'data', 'benefit', 'eligibility'],
        display: { name: 'VERIFIED', description: 'legacy copy must not be used' }, facts: [
          fact('price', 'priceVnd', 120000), fact('duration', 'durationDays', 30), fact('data', 'dataAllowance', '120GB'),
          fact('benefit', 'benefit', 'TV360'), fact('eligibility', 'eligibility', 'Prepaid'),
        ], registration: { syntax: 'VERIFIED GB', smsNumber: 290, channel: 'sms' },
      },
      {
        id: 'metadata-only', code: 'META', status: 'unverified', category: 'data', factIds: [],
        display: { name: 'META', description: 'legacy copy must not be used' }, facts: [],
      },
    ],
  } as any;
}

describe('package catalog UI adapter', () => {
  it('adapts only a verified package using the verified model', () => {
    const input = catalog();
    const adapted = toTelecomPackage(input.packages[0], input, now);

    expect(adapted).toMatchObject({ id: 'verified', price: 120000, dataLimit: '120GB' });
    expect(adapted?.registrationEligible).toBe(false);
  });

  it('does not adapt metadata-only records with zero, empty, or CTA fallback values', () => {
    const input = catalog();

    expect(toTelecomPackage(input.packages[1], input, now)).toBeNull();
    expect(catalogToTelecomPackages(input, now).map((pkg) => pkg.id)).toEqual(['verified']);
  });
});
