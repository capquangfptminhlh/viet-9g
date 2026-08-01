import { describe, expect, it } from 'vitest';
import { parsePackageCatalog } from '../../src/data/package-catalog';

const validCatalog = () => ({
  schemaVersion: '1.0.0',
  catalogVersion: '2026-08-02',
  generatedAt: '2026-08-02T00:00:00.000Z',
  packages: [{
    id: 'v120b',
    code: 'V120B',
    status: 'active',
    category: 'combo',
    display: {
      name: 'V120B',
      description: 'Gói data và thoại V120B',
    },
    registration: {
      syntax: 'V120B GB',
      shortcode: '290',
      channel: 'sms',
    },
    facts: [{
      id: 'price-vnd',
      key: 'priceVnd',
      value: 120000,
      unit: 'VND',
      claim: 'Gói V120B có giá 120.000đ',
      sourceUrl: 'https://www.viettel.vn/di-dong/goi-cuoc/v120b',
      retrievedAt: '2026-08-02T00:00:00.000Z',
      effectiveAt: '2026-08-01T00:00:00.000Z',
      expiresAt: '2026-09-01T00:00:00.000Z',
    }],
  }],
});

describe('package catalog schema', () => {
  it('accepts an evidence-backed active package with display and registration data', () => {
    expect(parsePackageCatalog(validCatalog())).toMatchObject(validCatalog());
  });

  it('rejects duplicate package IDs', () => {
    const catalog = validCatalog();
    catalog.packages.push({ ...catalog.packages[0] });

    expect(() => parsePackageCatalog(catalog)).toThrow(/duplicate.*package|package.*duplicate/i);
  });

  it('rejects duplicate fact IDs within a package', () => {
    const catalog = validCatalog();
    catalog.packages[0].facts.push({ ...catalog.packages[0].facts[0] });

    expect(() => parsePackageCatalog(catalog)).toThrow(/duplicate.*fact|fact.*duplicate/i);
  });

  it('rejects an active fact without source evidence', () => {
    const catalog = validCatalog();
    delete (catalog.packages[0].facts[0] as Partial<(typeof catalog.packages)[number]['facts'][number]>).sourceUrl;

    expect(() => parsePackageCatalog(catalog)).toThrow(/sourceUrl|evidence/i);
  });

  it('rejects a source URL outside the official viettel.vn allowlist', () => {
    const catalog = validCatalog();
    catalog.packages[0].facts[0].sourceUrl = 'https://tracuugoicuoc.com/goi-cuoc/v120b';

    expect(() => parsePackageCatalog(catalog)).toThrow(/viettel\.vn|official|sourceUrl/i);
  });

  it('rejects registration data without the GB code, 290 shortcode, and sms channel', () => {
    const catalog = validCatalog();
    catalog.packages[0].registration = {
      syntax: 'V120B',
      shortcode: '191',
      channel: 'web',
    };

    expect(() => parsePackageCatalog(catalog)).toThrow(/GB|290|sms|registration/i);
  });

  it('rejects facts expired before the catalog generation time', () => {
    const catalog = validCatalog();
    catalog.packages[0].facts[0].expiresAt = '2026-08-01T23:59:59.999Z';

    expect(() => parsePackageCatalog(catalog)).toThrow(/expired|expiresAt|expiry/i);
  });
});
