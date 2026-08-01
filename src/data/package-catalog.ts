import fs from 'node:fs';
import path from 'node:path';
import { parsePackageCatalog } from './package-catalog-runtime';
import type { PackageCatalog } from './package-catalog-runtime';

export { parsePackageCatalog, getPackageById, getRenderablePackages, isOfficialSource } from './package-catalog-runtime';
export type { PackageCatalog, PackageRecord, CatalogFact } from './package-catalog-runtime';

export function loadPackageCatalog(input: string | URL | unknown = path.resolve('data/package-catalog.v1.json')): PackageCatalog {
  const raw = typeof input === 'string' || input instanceof URL
    ? JSON.parse(fs.readFileSync(input instanceof URL ? input : path.resolve(input), 'utf8').replace(/^\uFEFF/, ''))
    : input;
  return parsePackageCatalog(raw);
}
