import { describe, expect, it } from 'vitest';
import { parsePackageCatalog } from '../../packages/catalog/package-catalog';

const activePriceFact = {
  id: 'pkg:v120b:price-vnd',
  packageId: 'v120b',
  key: 'priceVnd',
  value: 120000,
  unit: 'VND',
  claim: 'Gói V120B có giá 120.000đ',
  sourceUrl: 'https://tracuugoicuoc.com/goi-cuoc/v120b/',
  retrievedAt: '2026-08-02T00:00:00.000Z',
  effectiveAt: '2026-08-01',
  expiresAt: '2026-09-01',
};

const validCatalog = () => ({
  schemaVersion: 1,
  generatedAt: '2026-08-02T00:00:00.000Z',
  packages: [{
    id: 'v120b',
    code: 'V120B',
    category: 'combo',
    status: 'active',
    factIds: [activePriceFact.id],
  }],
  facts: [activePriceFact],
});

describe('package catalog schema', () => {
  it('accepts an active package with evidence-backed facts', () => {
    expect(parsePackageCatalog(validCatalog())).toMatchObject(validCatalog());
  });

  it('rejects duplicate package and fact IDs', () => {
    const catalog = validCatalog();
    catalog.packages.push({ ...catalog.packages[0] });
    catalog.facts.push({ ...catalog.facts[0] });

    expect(() => parsePackageCatalog(catalog)).toThrow(/duplicate/i);
  });

  it('rejects an active fact without evidence', () => {
    const catalog = validCatalog();
    delete (catalog.facts[0] as Partial<typeof activePriceFact>).sourceUrl;

    expect(() => parsePackageCatalog(catalog)).toThrow(/sourceUrl|evidence/i);
  });

  it('rejects an expiry date that is not after the effective date', () => {
    const catalog = validCatalog();
    catalog.facts[0].expiresAt = catalog.facts[0].effectiveAt;

    expect(() => parsePackageCatalog(catalog)).toThrow(/expiresAt|expiry/i);
  });
});
