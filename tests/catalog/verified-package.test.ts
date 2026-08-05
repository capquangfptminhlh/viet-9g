import { describe, expect, it } from 'vitest';
import { getRenderablePackages, parsePackageCatalog } from '../../src/data/package-catalog';
import { getCurrentFacts } from '../../src/data/package-catalog-runtime';
import { PublicOfferFactKeySchema, PublicOfferFactKeys } from '../../src/data/package-catalog.schema';

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

function publicOffer() {
  return {
    schemaVersion: '1.0.0',
    catalogVersion: 'test',
    generatedAt: '2026-08-02T00:00:00.000Z',
    packages: [{
      id: 'v120b',
      code: 'V120B',
      status: 'active',
      category: 'combo',
      factIds: ['price', 'duration', 'data'],
      display: { name: 'V120B', description: 'A verified package' },
      registration: { syntax: 'V120B GB', smsNumber: 290, channel: 'sms', factId: 'registration' },
      facts: [
        fact('price', 'priceVnd', 120000),
        fact('duration', 'durationDays', 30),
        fact('data', 'dataPerDay', '4GB'),
        fact('registration', 'registrationSyntax', 'V120B GB'),
      ],
    }],
  };
}

describe('verified public package offers', () => {
  it('accepts a legacy registration without an evidence fact ID but does not expose its CTA', () => {
    const catalog = publicOffer();
    delete (catalog.packages[0].registration as Partial<typeof catalog.packages[0]['registration']>).factId;

    expect(parsePackageCatalog(catalog)).toBeDefined();
    expect(getRenderablePackages(parsePackageCatalog(catalog), now)[0].registration).toBeUndefined();
  });

  it('allows legacy fact keys while exposing a strict public-offer key set', () => {
    const catalog = publicOffer();
    catalog.packages[0].facts[0].key = 'price';

    expect(parsePackageCatalog(catalog)).toBeDefined();
    expect(PublicOfferFactKeySchema.safeParse('price').success).toBe(false);
    expect(PublicOfferFactKeys).toContain('priceVnd');
  });

  it('withholds a public offer missing a current duration fact', () => {
    const catalog = publicOffer();
    catalog.packages[0].factIds = ['price', 'data'];

    expect(getRenderablePackages(parsePackageCatalog(catalog), now)).toHaveLength(0);
  });

  it('does not expose registration when its evidence is not referenced', () => {
    const catalog = parsePackageCatalog(publicOffer());

    expect(getRenderablePackages(catalog, now)[0].registration).toBeUndefined();
  });

  it('does not expose registration when its fact ID references a non-registration fact', () => {
    const catalogInput = publicOffer();
    catalogInput.packages[0].registration.factId = 'price';
    const catalog = parsePackageCatalog(catalogInput);

    expect(getRenderablePackages(catalog, now)[0].registration).toBeUndefined();
  });

  it('exposes registration only when a referenced registration fact exactly matches the syntax', () => {
    const catalogInput = publicOffer();
    catalogInput.packages[0].factIds.push('registration');
    const catalog = parsePackageCatalog(catalogInput);

    expect(getRenderablePackages(catalog, now)[0].registration).toMatchObject({ syntax: 'V120B GB' });
  });

  it.each([
    ['claim-only evidence', 'not the syntax', 'Send V120B GB to 290'],
    ['a syntax substring', 'V120B GB NOW', 'registrationSyntax claim'],
  ])('does not expose registration with %s', (_label, value, claim) => {
    const catalogInput = publicOffer();
    catalogInput.packages[0].factIds.push('registration');
    catalogInput.packages[0].facts[3].value = value;
    catalogInput.packages[0].facts[3].claim = claim;
    const catalog = parsePackageCatalog(catalogInput);

    expect(getRenderablePackages(catalog, now)[0].registration).toBeUndefined();
  });

  it.each([
    ['boolean price', 0, true],
    ['nonnumeric duration', 1, '30'],
    ['boolean data allowance', 2, true],
  ])('withholds public offers with %s', (_label, index, value) => {
    const catalogInput = publicOffer();
    (catalogInput.packages[0].facts[index].value as unknown) = value;

    expect(getRenderablePackages(parsePackageCatalog(catalogInput), now)).toHaveLength(0);
  });

  it('keeps a verified offer visible but omits registration when its referenced fact is expired', () => {
    const catalogInput = publicOffer();
    catalogInput.packages[0].factIds.push('registration');
    catalogInput.packages[0].facts[3].expiresAt = '2026-08-10T00:00:00.000Z';
    const catalog = parsePackageCatalog(catalogInput);

    const [offer] = getRenderablePackages(catalog, new Date('2026-08-15T00:00:00.000Z'));
    expect(offer).toBeDefined();
    expect(offer.registration).toBeUndefined();
  });

  it('returns only official facts that are effective and unexpired at the requested time', () => {
    const catalog = parsePackageCatalog(publicOffer());
    catalog.packages[0].facts[1].sourceUrl = 'http://viettel.vn/di-dong/goi-cuoc/v120b';
    catalog.packages[0].facts[2].expiresAt = now.toISOString();

    expect(getCurrentFacts(catalog.packages[0], catalog, now).map((item) => item.id)).toEqual(['price']);
  });
});
