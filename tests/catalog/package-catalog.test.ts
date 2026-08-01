import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getPackageById, getRenderablePackages, loadPackageCatalog, parsePackageCatalog } from '../../src/data/package-catalog';

type CatalogFactFixture = {
  id: string;
  key: string;
  value: number;
  unit: string;
  claim: string;
  sourceUrl?: string;
  retrievedAt: string;
  effectiveAt: string;
  expiresAt: string;
};

type PackageFixture = {
  id: string;
  code: string;
  status: string;
  category: string;
  factIds: string[];
  display: { name: string; description: string };
  registration: { syntax: string; smsNumber: number; channel: string };
  facts: CatalogFactFixture[];
};

type CatalogFixture = {
  schemaVersion: string;
  catalogVersion: string;
  generatedAt: string;
  packages: PackageFixture[];
};

const baseCatalog: CatalogFixture = {
  schemaVersion: '1.0.0',
  catalogVersion: '2026-08-02',
  generatedAt: '2026-08-02T00:00:00.000Z',
  packages: [{
    id: 'v120b',
    code: 'V120B',
    status: 'active',
    category: 'combo',
    factIds: ['price-vnd'],
    display: {
      name: 'V120B',
      description: 'Gói data và thoại V120B',
    },
    registration: {
      syntax: 'V120B GB',
      smsNumber: 290,
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
};

function createCatalog(): CatalogFixture {
  return structuredClone(baseCatalog);
}

describe('package catalog schema', () => {
  it('accepts an evidence-backed active package with display and registration data', () => {
    expect(parsePackageCatalog(createCatalog())).toMatchObject(baseCatalog);
  });

  it('rejects duplicate package IDs', () => {
    const catalog = createCatalog();
    catalog.packages.push({ ...catalog.packages[0] });

    expect(() => parsePackageCatalog(catalog)).toThrow(/duplicate.*package|package.*duplicate/i);
  });

  it('rejects duplicate fact IDs within a package', () => {
    const catalog = createCatalog();
    catalog.packages[0].facts.push({ ...catalog.packages[0].facts[0] });

    expect(() => parsePackageCatalog(catalog)).toThrow(/duplicate.*fact|fact.*duplicate/i);
  });

  it('rejects a fact ID reused by a different package', () => {
    const catalog = createCatalog();
    catalog.packages.push({
      ...catalog.packages[0],
      id: 'v90b',
      code: 'V90B',
      display: { name: 'V90B', description: 'Gói data và thoại V90B' },
      registration: { syntax: 'V90B GB', smsNumber: 290, channel: 'sms' },
    });

    expect(() => parsePackageCatalog(catalog)).toThrow(/duplicate.*fact|fact.*duplicate/i);
  });

  it('rejects a package fact reference that cannot be resolved locally', () => {
    const catalog = createCatalog();
    catalog.packages[0].factIds = ['missing-fact'];

    expect(() => parsePackageCatalog(catalog)).toThrow(/factIds|reference|missing/i);
  });

  it('rejects an active fact without source evidence', () => {
    const catalog = createCatalog();
    delete catalog.packages[0].facts[0].sourceUrl;

    expect(() => parsePackageCatalog(catalog)).toThrow(/sourceUrl|evidence/i);
  });

  it('rejects a source URL outside the official viettel.vn allowlist', () => {
    const catalog = createCatalog();
    catalog.packages[0].facts[0].sourceUrl = 'https://tracuugoicuoc.com/goi-cuoc/v120b';

    expect(() => parsePackageCatalog(catalog)).toThrow(/viettel\.vn|official|sourceUrl/i);
  });

  it('rejects registration syntax without the GB code', () => {
    const catalog = createCatalog();
    catalog.packages[0].registration = {
      syntax: 'V120B',
      smsNumber: 290,
      channel: 'sms',
    };

    expect(() => parsePackageCatalog(catalog)).toThrow(/GB|syntax|registration/i);
  });

  it('rejects registration data without SMS number 290', () => {
    const catalog = createCatalog();
    catalog.packages[0].registration = {
      syntax: 'V120B GB',
      smsNumber: 191,
      channel: 'sms',
    };

    expect(() => parsePackageCatalog(catalog)).toThrow(/290|smsNumber|registration/i);
  });

  it('rejects registration data whose channel is not sms', () => {
    const catalog = createCatalog();
    catalog.packages[0].registration = {
      syntax: 'V120B GB',
      smsNumber: 290,
      channel: 'web',
    };

    expect(() => parsePackageCatalog(catalog)).toThrow(/sms|channel|registration/i);
  });

  it('rejects facts expired before the catalog generation time', () => {
    const catalog = createCatalog();
    catalog.packages[0].facts[0].expiresAt = '2026-08-01T23:59:59.999Z';

    expect(() => parsePackageCatalog(catalog)).toThrow(/expired|expiresAt|expiry/i);
  });

  it('requires source evidence for every fact', () => {
    const catalog = createCatalog();
    delete catalog.packages[0].facts[0].sourceUrl;
    catalog.packages[0].status = 'unverified';
    expect(() => parsePackageCatalog(catalog)).toThrow(/sourceUrl|evidence/i);
  });

  it('rejects non-positive numeric fact values', () => {
    const catalog = createCatalog();
    catalog.packages[0].facts[0].value = 0;
    expect(() => parsePackageCatalog(catalog)).toThrow(/positive|value|numeric/i);
  });

  it('rejects an https violation even on a non-active package', () => {
    const catalog = createCatalog();
    catalog.packages[0].status = 'eligibility_required';
    catalog.packages[0].facts[0].sourceUrl = 'http://viettel.vn/goi-cuoc/v120b';
    expect(() => parsePackageCatalog(catalog)).toThrow(/https|sourceUrl|official/i);
  });

  it('treats expiry equal to catalog generation as stale', () => {
    const catalog = createCatalog();
    catalog.packages[0].facts[0].expiresAt = catalog.generatedAt;
    expect(() => parsePackageCatalog(catalog)).toThrow(/expired|expiresAt|expiry/i);
  });

  it('excludes packages when expiry is exactly now', () => {
    const catalog = parsePackageCatalog(createCatalog());
    const now = new Date('2026-08-02T00:00:00.000Z');
    catalog.packages[0].facts[0].expiresAt = now.toISOString();
    expect(getRenderablePackages(catalog, now)).toHaveLength(0);
  });

  it('excludes packages whose evidence starts in the future', () => {
    const catalog = parsePackageCatalog(createCatalog());
    const now = new Date('2026-08-02T00:00:00.000Z');
    catalog.packages[0].facts[0].effectiveAt = '2026-08-03T00:00:00.000Z';
    expect(getRenderablePackages(catalog, now)).toHaveLength(0);
  });

  it('defensively excludes non-official evidence if a parsed catalog is mutated', () => {
    const catalog = parsePackageCatalog(createCatalog());
    const now = new Date('2026-08-02T00:00:00.000Z');
    catalog.packages[0].facts[0].sourceUrl = 'http://viettel.vn/goi-cuoc/v120b';
    expect(getRenderablePackages(catalog, now)).toHaveLength(0);
  });

  it('documents runtime-only cross-field constraints in the JSON Schema', () => {
    const schema = JSON.parse(fs.readFileSync('schemas/package-catalog.schema.json', 'utf8'));
    expect(schema['x-runtimeConstraints'].authoritativeValidator).toContain('parsePackageCatalog');
    expect(schema['x-runtimeConstraints'].rules).toEqual(expect.arrayContaining([
      expect.stringMatching(/globally unique/),
      expect.stringMatching(/renderable.*expiry/i),
    ]));
  });

  it.each(['hold', 'unverified', 'eligibility_required', 'retired'])('allows %s package without registration', (status) => {
    const catalog = createCatalog();
    catalog.packages[0].status = status;
    delete (catalog.packages[0] as Partial<PackageFixture>).registration;
    expect(() => parsePackageCatalog(catalog)).not.toThrow();
  });

  it('requires registration only for active packages', () => {
    const catalog = createCatalog();
    delete (catalog.packages[0] as Partial<PackageFixture>).registration;
    expect(() => parsePackageCatalog(catalog)).toThrow(/registration/i);
  });

  it('loads a UTF-8 BOM-prefixed catalog from a path', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-')), 'catalog.json');
    fs.writeFileSync(file, `\uFEFF${JSON.stringify(createCatalog())}`, 'utf8');
    expect(loadPackageCatalog(file).packages[0].id).toBe('v120b');
  });

  it('reports malformed JSON when loading a path', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-')), 'catalog.json');
    fs.writeFileSync(file, '{bad json', 'utf8');
    expect(() => loadPackageCatalog(file)).toThrow();
  });

  it('looks up packages by stable id or display code', () => {
    const catalog = parsePackageCatalog(createCatalog());
    expect(getPackageById(catalog, 'v120b')?.id).toBe('v120b');
    expect(getPackageById(catalog, 'V120B')?.id).toBe('v120b');
    expect(getPackageById(catalog, 'missing')).toBeUndefined();
  });
});
