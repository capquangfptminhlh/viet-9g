import type { VerifiedPackage } from './verified-package';

export type PackageHubSlug = 'data' | 'mang-xa-hoi' | 'combo' | '5g' | 'chu-ky-dai';

export interface PackageHub {
  slug: PackageHubSlug;
  title: string;
  description: string;
  matches: (pkg: VerifiedPackage) => boolean;
}

export const packageHubs: readonly PackageHub[] = [
  {
    slug: 'data',
    title: 'Gói data Viettel',
    description: 'So sánh các gói data có thông tin ưu đãi đã được xác minh.',
    matches: (pkg) => pkg.category === 'data',
  },
  {
    slug: 'mang-xa-hoi',
    title: 'Gói mạng xã hội Viettel',
    description: 'So sánh các gói mạng xã hội có thông tin ưu đãi đã được xác minh.',
    matches: (pkg) => pkg.category === 'social',
  },
  {
    slug: 'combo',
    title: 'Gói combo Viettel',
    description: 'So sánh các gói combo có thông tin ưu đãi đã được xác minh.',
    matches: (pkg) => pkg.category === 'combo' && !pkg.code.toUpperCase().startsWith('5G'),
  },
  {
    slug: '5g',
    title: 'Gói 5G Viettel',
    description: 'So sánh các gói có mã gói 5G và thông tin ưu đãi đã được xác minh.',
    matches: (pkg) => pkg.code.toUpperCase().startsWith('5G'),
  },
  {
    slug: 'chu-ky-dai',
    title: 'Gói chu kỳ dài Viettel',
    description: 'So sánh các gói chu kỳ dài có thông tin ưu đãi đã được xác minh.',
    matches: (pkg) => pkg.category === 'long_term',
  },
];

export function getPackageHub(slug: string): PackageHub | undefined {
  return packageHubs.find((hub) => hub.slug === slug);
}

/** Static paths are deliberately limited to the fixed hub list, never package IDs. */
export function getPackageHubPaths(packages: readonly VerifiedPackage[] = []) {
  const packageIds = new Set(packages.map((pkg) => pkg.id.toLowerCase()));
  const duplicateSlug = packageHubs.find((hub) => packageIds.has(hub.slug));
  if (duplicateSlug) {
    throw new Error(`package hub URL collision: ${duplicateSlug.slug}`);
  }
  return packageHubs.map((hub) => ({ params: { category: hub.slug } }));
}

/** The caller supplies verified offers; this module never reads the legacy catalog. */
export function groupPackagesForHub(hub: PackageHub, packages: readonly VerifiedPackage[]): VerifiedPackage[] {
  return packages.filter(hub.matches);
}
