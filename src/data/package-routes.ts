import { VIETTEL_PACKAGES } from './packages';
import { loadPackageCatalog } from './package-catalog';
import type { PackageCatalog } from './package-catalog';
import type { TelecomPackage } from '../types';

/** Customer-facing routes include every catalog record except explicitly retired ones.
 * Registration is enabled only when the adapter has evidence-backed active status. */
export function getPackageRoutes(catalog: PackageCatalog = loadPackageCatalog()): TelecomPackage[] {
  const visible = new Map(catalog.packages.filter((pkg) => pkg.status !== 'retired').map((pkg) => [pkg.id, pkg]));
  return VIETTEL_PACKAGES
    .filter((pkg) => visible.has(pkg.id))
    .map((pkg) => ({ ...pkg, code: visible.get(pkg.id)!.code, status: visible.get(pkg.id)!.status }));
}
