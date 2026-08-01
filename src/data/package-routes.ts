import { VIETTEL_PACKAGES } from './packages';
import { loadPackageCatalog } from './package-catalog';
import type { PackageCatalog } from './package-catalog';
import type { TelecomPackage } from '../types';
import { toTelecomPackage } from '../../packages/catalog/package-adapters';

/** Customer-facing routes include every catalog record except explicitly retired ones.
 * Registration is enabled only when the adapter has evidence-backed active status. */
export function getPackageRoutes(catalog: PackageCatalog = loadPackageCatalog()): TelecomPackage[] {
  const fallbacks = Object.fromEntries(VIETTEL_PACKAGES.map((pkg) => [pkg.id, pkg]));
  const facts = catalog.facts;
  return catalog.packages
    .filter((pkg) => pkg.status !== 'retired')
    .map((pkg) => toTelecomPackage(pkg, fallbacks[pkg.id], facts));
}
