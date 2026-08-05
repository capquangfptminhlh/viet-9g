import { getVerifiedPackages } from '../../src/data/verified-package';
import type { PackageCatalog, PackageRecord } from '../../src/data/package-catalog-runtime';
import type { TelecomPackage } from '../../src/types';

/** Compatibility adapter for verified offers only; incomplete catalog metadata is never synthesized into a UI package. */
export function toTelecomPackage(
  pkg: PackageRecord,
  catalog: PackageCatalog,
  now = new Date(),
): TelecomPackage | null {
  return getVerifiedPackages(catalog, now).find((verified) => verified.id === pkg.id) ?? null;
}

export function catalogToTelecomPackages(catalog: PackageCatalog, now = new Date()): TelecomPackage[] {
  return getVerifiedPackages(catalog, now);
}
