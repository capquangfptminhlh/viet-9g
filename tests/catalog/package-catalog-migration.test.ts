import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { VIETTEL_PACKAGES } from '../../src/data/packages';

const root = process.cwd();
const catalogPath = path.join(root, 'data', 'package-catalog.v1.json');

describe('package catalog migration', () => {
  it('preserves all legacy package IDs and explicit operator verification', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog.packages).toHaveLength(40);
    expect(catalog.packages.every((pkg: any) => pkg.status === 'operator_verified')).toBe(true);
    expect(catalog.packages.every((pkg: any) => pkg.registration?.smsNumber === 290 && / GB$/.test(pkg.registration.syntax))).toBe(true);
    expect(catalog.sourceSnapshot.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('matches the legacy package ID set and code/name mapping exactly', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const catalogIds = new Set(catalog.packages.map((pkg: any) => pkg.id));
    const legacyIds = new Set(VIETTEL_PACKAGES.map((pkg) => pkg.id));
    expect(catalogIds).toEqual(legacyIds);
    for (const legacy of VIETTEL_PACKAGES) {
      const migrated = catalog.packages.find((pkg: any) => pkg.id === legacy.id);
      expect(migrated.code).toBe(legacy.name);
      expect(migrated.display.name).toBe(legacy.name);
    }
  });

  it('runs a deterministic no-write migration check', () => {
    const before = fs.readFileSync(catalogPath, 'utf8');
    const output = execSync('npx tsx scripts/migrate-package-catalog.ts --check', { cwd: root, encoding: 'utf8' });
    expect(output).toMatch(/OK|unchanged|stable/i);
    expect(fs.readFileSync(catalogPath, 'utf8')).toBe(before);
  });

  it('validator prints a status summary and exits successfully', () => {
    const output = execSync('npx tsx scripts/validate-package-catalog.ts', { cwd: root, encoding: 'utf8' });
    expect(output).toMatch(/operator_verified/i);
    expect(output).toMatch(/40/);
  });
});
