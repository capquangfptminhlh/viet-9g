import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const catalogPath = path.join(root, 'data', 'package-catalog.v1.json');

describe('package catalog migration', () => {
  it('preserves all legacy package IDs and marks them unverified without fabricated evidence', () => {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog.packages).toHaveLength(40);
    expect(catalog.packages.every((pkg: any) => ['unverified', 'hold'].includes(pkg.status))).toBe(true);
    expect(catalog.packages.every((pkg: any) => pkg.factIds.length === 0 && pkg.facts.length === 0)).toBe(true);
    expect(catalog.sourceSnapshot.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('runs a deterministic no-write migration check', () => {
    const before = fs.readFileSync(catalogPath, 'utf8');
    const output = execSync('npx tsx scripts/migrate-package-catalog.ts --check', { cwd: root, encoding: 'utf8' });
    expect(output).toMatch(/OK|unchanged|stable/i);
    expect(fs.readFileSync(catalogPath, 'utf8')).toBe(before);
  });

  it('validator prints a status summary and exits successfully', () => {
    const output = execSync('npx tsx scripts/validate-package-catalog.ts', { cwd: root, encoding: 'utf8' });
    expect(output).toMatch(/unverified/i);
    expect(output).toMatch(/40/);
  });
});
