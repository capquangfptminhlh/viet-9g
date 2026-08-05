import { loadPackageCatalog } from './package-catalog';
import type { PackageCatalog, PackageRecord } from './package-catalog';
import { getVerifiedPackages, type VerifiedPackage } from './verified-package';

export interface LegacyPackageRoute {
  id: string;
  code: string;
  name: string;
  category: PackageRecord['category'];
  status: PackageRecord['status'];
  reason: 'INCOMPLETE_EVIDENCE';
  indexable: false;
}

export function getPackageRoutes(catalog: PackageCatalog = loadPackageCatalog(), now = new Date()): VerifiedPackage[] {
  return getVerifiedPackages(catalog, now);
}

/** Legacy records are intentionally metadata-only: no price, benefits, or registration CTA is exposed. */
export function getLegacyPackageRoutes(catalog: PackageCatalog = loadPackageCatalog(), now = new Date()): LegacyPackageRoute[] {
  const verifiedIds = new Set(getVerifiedPackages(catalog, now).map((pkg) => pkg.id));
  return catalog.packages
    .filter((pkg) => !verifiedIds.has(pkg.id))
    .map((pkg) => ({
      id: pkg.id,
      code: pkg.code,
      name: pkg.display.name,
      category: pkg.category,
      status: pkg.status,
      reason: 'INCOMPLETE_EVIDENCE' as const,
      indexable: false as const,
    }));
}
