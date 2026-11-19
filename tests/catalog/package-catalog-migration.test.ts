import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import catalogJson from '../../data/package-catalog.v1.json';
import { catalogToTelecomPackages } from '../../packages/catalog/package-adapters';
import { buildPackageCatalog, computeSourceSnapshotHash, LEGACY_PACKAGE_SOURCE } from '../../scripts/migrate-package-catalog';
import { parsePackageCatalog } from '../../src/data/package-catalog-runtime';

const root = process.cwd();
const catalogPath = path.join(root, 'data', 'package-catalog.v1.json');
const catalogSnapshot = parsePackageCatalog(catalogJson);
const withinEvidenceWindow = new Date('2026-08-22T12:00:00.000Z');
const afterStructuredFactExpiry = new Date('2026-08-24T00:00:00.000Z');
const afterAllEvidenceExpiry = new Date('2026-11-02T00:00:00.000Z');

describe('package catalog migration', () => {
  it('preserves all legacy package IDs and keeps activation evidence explicit', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog.packages).toHaveLength(41);
    expect(catalog.packages.filter((pkg: any) => pkg.status === 'eligibility_required')).toHaveLength(15);
    expect(catalog.packages.filter((pkg: any) => pkg.status === 'operator_verified')).toHaveLength(26);
    expect(catalog.packages.every((pkg: any) => pkg.registration?.smsNumber === 290 && / GB$/.test(pkg.registration.syntax))).toBe(true);
    expect(catalog.packages.filter((pkg: any) => pkg.status === 'eligibility_required').every((pkg: any) => pkg.factIds.length > 0)).toBe(true);
    expect(catalog.sourceSnapshot.sha256).toBe(computeSourceSnapshotHash(fs.readFileSync(path.join(root, 'src', 'data', 'packages.ts'))));
  });

  it('uses the same source snapshot hash for LF and CRLF checkouts', () => {
    const lf = 'alpha\nbeta\ngamma\n';
    const crlf = lf.replace(/\n/g, '\r\n');
    expect(computeSourceSnapshotHash(lf)).toBe(computeSourceSnapshotHash(crlf));
  });

  it('preserves catalog-only record IDs, codes, and display names without deriving code from the name', () => {
    const generated = buildPackageCatalog({
      catalogVersion: 'test', generatedAt: '2026-08-02T00:00:00.000Z', sourceSnapshot: {}, facts: [],
      packages: [{
        id: 'catalog-only', code: 'CODE-42', category: 'data', status: 'unverified', factIds: [], facts: [],
        display: { name: 'Display-only name', description: 'Catalog-only record' },
      }],
    });

    expect(generated.packages.find((pkg: any) => pkg.id === 'catalog-only')).toMatchObject({
      id: 'catalog-only', code: 'CODE-42', display: { name: 'Display-only name' },
    });
  });

  it('exposes only source-backed package facts during their evidence window and withholds unsupported partner SMS CTAs', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const verifiedPackages = catalogToTelecomPackages(catalogSnapshot, withinEvidenceWindow);

    expect(catalog.packages).toHaveLength(41);
    expect(verifiedPackages).toHaveLength(15);
    expect(verifiedPackages.every((pkg) => pkg.price > 0 && pkg.duration.length > 0)).toBe(true);
    expect(verifiedPackages.every((pkg) => pkg.registrationEligible === false)).toBe(true);
  });

  it('keeps packages visible after structured facts expire while the exact current official summary still revalidates core facts', () => {
    expect(catalogToTelecomPackages(catalogSnapshot, afterStructuredFactExpiry)).toHaveLength(15);
  });

  it('fails closed after all official package evidence expires', () => {
    expect(catalogToTelecomPackages(catalogSnapshot, afterAllEvidenceExpiry)).toHaveLength(0);
  });

  it('runs a deterministic no-write migration check', () => {
    const before = fs.readFileSync(catalogPath, 'utf8');
    const output = execSync('npx tsx scripts/migrate-package-catalog.ts --check', { cwd: root, encoding: 'utf8' });
    expect(output).toMatch(/OK|unchanged|stable/i);
    expect(fs.readFileSync(catalogPath, 'utf8')).toBe(before);
  });

  it('preserves the exact legacy ID-to-code-and-name mapping', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const actual = Object.fromEntries(catalog.packages
      .filter((pkg: any) => LEGACY_PACKAGE_SOURCE.some((legacy) => legacy.id === pkg.id))
      .map((pkg: any) => [pkg.id, { code: pkg.code, name: pkg.display.name }]));
    const expected = Object.fromEntries(LEGACY_PACKAGE_SOURCE
      .map((pkg) => [pkg.id, { code: pkg.code ?? pkg.name, name: pkg.name }]));

    expect(actual).toEqual(expected);
  });

  it('does not report catalog drift when a Windows checkout uses CRLF line endings', () => {
    // A shared production JSON file must never be overwritten by a Vitest worker:
    // another test may parse it while the CRLF fixture is being written.
    const before = fs.readFileSync(catalogPath, 'utf8');
    const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viettel-catalog-crlf-'));
    const fixturePath = path.join(fixtureDir, 'package-catalog.v1.json');
    try {
      const crlf = before.replace(/\n/g, '\r\n');
      fs.writeFileSync(fixturePath, crlf, 'utf8');
      const output = execSync('npx tsx scripts/migrate-package-catalog.ts --check', {
        cwd: root, encoding: 'utf8',
        env: { ...process.env, CATALOG_CHECK_FIXTURE_PATH: fixturePath },
      });
      expect(output).toMatch(/OK|unchanged|stable/i);
      expect(fs.readFileSync(fixturePath, 'utf8')).toBe(crlf);
      expect(fs.readFileSync(catalogPath, 'utf8')).toBe(before);
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it('validator prints a status summary and exits successfully', () => {
    const output = execSync('npx tsx scripts/validate-package-catalog.ts', { cwd: root, encoding: 'utf8' });
    expect(output).toMatch(/operator_verified/i);
    expect(output).toMatch(/41 packages/);
  });
});
