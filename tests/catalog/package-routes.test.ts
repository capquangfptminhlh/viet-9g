import { describe, expect, it } from 'vitest';
import { loadPackageCatalog } from '../../src/data/package-catalog';
import { getPackageRoutes } from '../../src/data/package-routes';

describe('customer package routes', () => {
  it('lists all non-retired catalog records with operator-confirmed CTA enabled', () => {
    const routes = getPackageRoutes(loadPackageCatalog());
    expect(routes).toHaveLength(40);
    expect(routes.every((pkg) => pkg.registrationEligible === true)).toBe(true);
    expect(routes.every((pkg) => pkg.status !== 'retired')).toBe(true);
  });

  it('includes catalog-only records and preserves active eligibility', () => {
    const catalog = loadPackageCatalog();
    const active = {
      id: 'new-active', code: 'NEW1', status: 'active', category: 'data', factIds: ['price'],
      display: { name: 'NEW1', description: 'new' }, facts: [],
      registration: { syntax: 'NEW1 GB', smsNumber: 290, channel: 'sms' },
    } as any;
    catalog.facts = [{ id: 'price', key: 'priceVnd', value: 1000, claim: 'price', sourceUrl: 'https://viettel.vn', retrievedAt: '2026-08-01T00:00:00Z', effectiveAt: '2026-08-01', expiresAt: '2026-12-31T00:00:00Z' } as any];
    catalog.packages.push(active);
    const routes = getPackageRoutes(catalog);
    expect(routes.find((pkg) => pkg.id === 'new-active')).toMatchObject({ code: 'NEW1', registrationEligible: true, status: 'active' });
  });
});
