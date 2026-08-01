import { describe, expect, it } from 'vitest';
import { catalogToTelecomPackages, toTelecomPackage } from '../../packages/catalog/package-adapters';

const packageRecord = (status: 'active' | 'unverified' | 'retired') => ({
  id: status,
  code: status.toUpperCase(),
  status,
  category: 'combo' as const,
  factIds: [],
  display: { name: status.toUpperCase(), description: `${status} package` },
  facts: [],
});

describe('package catalog UI adapter', () => {
  it('projects an evidence-backed active package and enables registration', () => {
    const pkg = { ...packageRecord('active'), factIds: ['price'], registration: { syntax: 'ACTIVE GB', smsNumber: 290 as const, channel: 'sms' as const } };
    const facts = [{ id: 'price', key: 'priceVnd', value: 120000, claim: 'price', sourceUrl: 'https://viettel.vn', retrievedAt: '2026-08-01T00:00:00Z', effectiveAt: '2026-08-01', expiresAt: '2026-12-31T00:00:00Z' } as any];
    const adapted = toTelecomPackage(pkg, undefined, facts);
    expect(adapted).toMatchObject({ id: 'active', code: 'ACTIVE', price: 120000, registrationEligible: true, status: 'active' });
  });

  it('keeps an unverified package visible while disabling registration', () => {
    const adapted = toTelecomPackage(packageRecord('unverified'));

    expect(adapted.id).toBe('unverified');
    expect(adapted.code).toBe('UNVERIFIED');
    expect(adapted.name).toBe('UNVERIFIED');
    expect(adapted.registrationEligible).toBe(false);
    expect(adapted.status).toBe('unverified');
  });

  it('preserves all non-retired catalog packages for listing', () => {
    const adapted = catalogToTelecomPackages({ packages: [packageRecord('active'), packageRecord('unverified'), packageRecord('retired')] } as any);

    expect(adapted.map((pkg) => pkg.id)).toEqual(['active', 'unverified']);
    expect(adapted.find((pkg) => pkg.id === 'unverified')?.registrationEligible).toBe(false);
  });
});
