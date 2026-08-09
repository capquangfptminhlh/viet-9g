import type { VerifiedPackage } from './verified-package';

export interface PackagePageFact {
  label: string;
  value: string;
}

export interface PackagePageModel {
  title: string;
  facts: PackagePageFact[];
  benefits: string[];
  eligibility: string[];
  sourceUrl: string;
  updatedAt: string;
  priceValidUntil: string;
  registration?: { syntax: string; smsNumber: 290 };
}

export function getPackagePageModel(pkg: VerifiedPackage): PackagePageModel {
  return {
    title: `Gói ${pkg.code} Viettel`,
    facts: [
      { label: 'Giá', value: `${pkg.priceVnd.toLocaleString('vi-VN')}đ / ${pkg.durationDays} ngày` },
      { label: 'Dung lượng', value: pkg.dataAllowance ?? pkg.dataPerDay! },
      ...(pkg.dataPerDay ? [{ label: 'Ưu đãi mỗi ngày', value: pkg.dataPerDay }] : []),
    ],
    benefits: pkg.benefits,
    eligibility: pkg.eligibility,
    sourceUrl: pkg.sourceUrl,
    updatedAt: pkg.updatedAt,
    priceValidUntil: pkg.priceValidUntil,
    ...(pkg.registration ? { registration: { syntax: pkg.registration.syntax, smsNumber: pkg.registration.smsNumber } } : {}),
  };
}
