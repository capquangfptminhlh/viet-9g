import type { VerifiedPackage } from './verified-package';

export const GUIDE_LINKS: Record<string, string[]> = {
  'cach-kiem-tra-tai-khoan-chinh': ['v120b', 'sd120'],
  'cach-huy-gia-han-4g-viettel': ['v120b', 'mxh120'],
};

export type GuidePackageLink = {
  href: string;
  label: string;
};

/** Returns only editorial package links backed by the supplied verified package list. */
export function getGuidePackageLinks(slug: string, verifiedPackages: VerifiedPackage[]): GuidePackageLink[] {
  const packagesById = new Map(verifiedPackages.map((pkg) => [pkg.id, pkg]));

  return (GUIDE_LINKS[slug] ?? []).flatMap((id) => {
    const pkg = packagesById.get(id);
    return pkg ? [{ href: `/goi-cuoc/${id}`, label: pkg.name }] : [];
  });
}
