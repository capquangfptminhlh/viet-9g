import { describe, expect, it } from 'vitest';
import { loadPackageCatalog } from '../../src/data/package-catalog';
import { getLegacyPackageRoutes, getPackageRoutes } from '../../src/data/package-routes';

const now = new Date('2026-08-02T00:00:00.000Z');

function fact(id: string, key: string, value: string | number) {
  return {
    id,
    key,
    value,
    claim: `${key} claim`,
    sourceUrl: 'https://www.viettel.vn/di-dong/goi-cuoc/v120b',
    retrievedAt: '2026-08-01T00:00:00.000Z',
    effectiveAt: '2026-08-01T00:00:00.000Z',
    expiresAt: '2026-09-01T00:00:00.000Z',
  };
}

function catalogWithPublicOffer() {
  return {
    schemaVersion: '1.0.0',
    catalogVersion: 'test',
    generatedAt: now.toISOString(),
    facts: [],
    packages: [{
      id: 'v120b',
      code: 'V120B',
      status: 'active',
      category: 'combo',
      factIds: ['price', 'duration', 'data', 'daily-data', 'benefit', 'eligibility', 'registration'],
      display: { name: 'V120B', description: 'Not a public offer field' },
      registration: { syntax: 'V120B GB', smsNumber: 290, channel: 'sms', factId: 'registration' },
      facts: [
        fact('price', 'priceVnd', 120000),
        fact('duration', 'durationDays', 30),
        fact('data', 'dataAllowance', '120GB'),
        fact('daily-data', 'dataPerDay', '4GB'),
        fact('benefit', 'benefit', 'TV360 Basic'),
        fact('eligibility', 'eligibility', 'Prepaid subscribers'),
        fact('registration', 'registrationSyntax', ' V120B   GB '),
      ],
    }],
  };
}

describe('customer package routes', () => {
  it('returns a complete, current public offer from fact-derived values only', () => {
    const routes = getPackageRoutes(catalogWithPublicOffer() as any, now);

    expect(routes).toEqual([expect.objectContaining({
      id: 'v120b',
      code: 'V120B',
      name: 'V120B',
      priceVnd: 120000,
      durationDays: 30,
      dataPerDay: '4GB',
      price: 120000,
      duration: '30 ngày',
      dataLimit: '120GB',
      description: 'V120B · 120000 VND · 30 days · 120GB',
      rules: ['Prepaid subscribers'],
      registrationEligible: true,
      benefits: ['TV360 Basic'],
      eligibility: ['Prepaid subscribers'],
      registration: { syntax: 'V120B GB', smsNumber: 290, channel: 'sms' },
    })]);
  });

  it('does not expose a package missing a required current offer value', () => {
    const catalog = catalogWithPublicOffer();
    catalog.packages[0].factIds = catalog.packages[0].factIds.filter((id) => id !== 'duration');

    expect(getPackageRoutes(catalog as any, now)).toEqual([]);
  });

  it('allows either a total allowance or a per-day allowance without inventing the other value', () => {
    const allowanceOnly = catalogWithPublicOffer();
    allowanceOnly.packages[0].factIds = allowanceOnly.packages[0].factIds.filter((id) => id !== 'daily-data');
    allowanceOnly.packages[0].facts = allowanceOnly.packages[0].facts.filter((item) => item.id !== 'daily-data');
    const perDayOnly = catalogWithPublicOffer();
    perDayOnly.packages[0].factIds = perDayOnly.packages[0].factIds.filter((id) => id !== 'data');
    perDayOnly.packages[0].facts = perDayOnly.packages[0].facts.filter((item) => item.id !== 'data');

    expect(getPackageRoutes(allowanceOnly as any, now)[0]).toMatchObject({ dataAllowance: '120GB' });
    expect(getPackageRoutes(allowanceOnly as any, now)[0]).not.toHaveProperty('dataPerDay');
    expect(getPackageRoutes(perDayOnly as any, now)[0]).toMatchObject({ dataPerDay: '4GB' });
    expect(getPackageRoutes(perDayOnly as any, now)[0]).not.toHaveProperty('dataAllowance');
  });

  it('returns incomplete catalog records as legacy routes without price or CTA data', () => {
    const catalog = loadPackageCatalog();
    const legacy = getLegacyPackageRoutes(catalog, now);

    expect(getPackageRoutes(catalog, now)).toEqual([]);
    expect(legacy).toHaveLength(41);
    expect(legacy[0]).toMatchObject({ reason: 'INCOMPLETE_EVIDENCE' });
    expect(legacy[0]).toMatchObject({ indexable: false });
    expect(legacy[0]).not.toHaveProperty('priceVnd');
    expect(legacy[0]).not.toHaveProperty('registration');
  });

  it('excludes verified records from metadata-only legacy routes', () => {
    const catalog = catalogWithPublicOffer();
    catalog.packages.push({
      id: 'incomplete', code: 'INC', status: 'active', category: 'data', factIds: [],
      display: { name: 'INC', description: '' }, facts: [],
      registration: { syntax: 'INC GB', smsNumber: 290, channel: 'sms', factId: 'registration' },
    });

    expect(getPackageRoutes(catalog as any, now).map((pkg) => pkg.id)).toEqual(['v120b']);
    expect(getLegacyPackageRoutes(catalog as any, now)).toEqual([expect.objectContaining({
      id: 'incomplete', indexable: false, reason: 'INCOMPLETE_EVIDENCE',
    })]);
  });
});
