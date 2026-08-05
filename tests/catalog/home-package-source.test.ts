import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const homepageComponents = [
  'src/components/HomeApp.tsx',
  'src/components/PackageGrid.tsx',
  'src/components/SmartRecommender.tsx',
  'src/components/SimLookup.tsx',
];

describe('homepage verified package source', () => {
  it('passes server-verified packages into the client homepage', () => {
    const page = fs.readFileSync(path.join(root, 'src/pages/index.astro'), 'utf8');

    expect(page).toMatch(/loadPackageCatalog/);
    expect(page).toMatch(/getVerifiedPackages/);
    expect(page).toMatch(/<HomeApp\s+packages=\{packages\}\s+client:load\s*\/>/);
  });

  it('does not import legacy packages in the homepage client tree', () => {
    for (const file of homepageComponents) {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      expect(source).not.toMatch(/from\s+['"][^'"]*data\/packages['"]/);
    }
  });
});
