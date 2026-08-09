import { describe, expect, it } from 'vitest';
import {
  getPackageHub,
  getPackageHubPaths,
  groupPackagesForHub,
  packageHubs,
} from '../../src/data/package-hubs';
import type { VerifiedPackage } from '../../src/data/verified-package';

function verifiedPackage(id: string, category: VerifiedPackage['category']): VerifiedPackage {
  return {
    id,
    code: id.toUpperCase(),
    name: id.toUpperCase(),
    category,
    priceVnd: 120000,
    durationDays: 30,
    dataAllowance: '120GB',
    benefits: ['Verified benefit'],
    eligibility: ['Verified eligibility'],
    updatedAt: '2026-08-01T00:00:00.000Z',
    priceValidUntil: '2026-09-01T00:00:00.000Z',
    sourceUrl: 'https://www.viettel.vn/di-dong/goi-cuoc/example',
    price: 120000,
    duration: '30 ngày',
    dataLimit: '120GB',
    description: 'Verified package',
    rules: ['Verified eligibility'],
    registrationEligible: false,
    status: 'active',
  };
}

describe('package hubs', () => {
  it('defines only the fixed public category hubs', () => {
    expect(packageHubs.map((hub) => hub.slug)).toEqual([
      'data',
      'mang-xa-hoi',
      'combo',
      '5g',
      'chu-ky-dai',
    ]);
    expect(getPackageHubPaths()).toEqual(packageHubs.map((hub) => ({ params: { category: hub.slug } })));
    expect(getPackageHub('not-a-hub')).toBeUndefined();
  });

  it('groups only the supplied verified packages for the requested hub', () => {
    const supplied = [
      verifiedPackage('data', 'data'),
      verifiedPackage('social', 'social'),
      verifiedPackage('combo', 'combo'),
      verifiedPackage('long-term', 'long_term'),
      verifiedPackage('5g135', 'combo'),
    ];

    expect(groupPackagesForHub(getPackageHub('data')!, supplied).map((pkg) => pkg.id)).toEqual(['data']);
    expect(groupPackagesForHub(getPackageHub('mang-xa-hoi')!, supplied).map((pkg) => pkg.id)).toEqual(['social']);
    expect(groupPackagesForHub(getPackageHub('combo')!, supplied).map((pkg) => pkg.id)).toEqual(['combo']);
    expect(groupPackagesForHub(getPackageHub('5g')!, supplied).map((pkg) => pkg.id)).toEqual(['5g135']);
    expect(groupPackagesForHub(getPackageHub('chu-ky-dai')!, supplied).map((pkg) => pkg.id)).toEqual(['long-term']);
  });

  it('does not invent packages when the supplied verified list is empty', () => {
    expect(groupPackagesForHub(getPackageHub('combo')!, [])).toEqual([]);
  });

  it('rejects a static URL collision between a hub slug and a package ID', () => {
    expect(() => getPackageHubPaths([verifiedPackage('data', 'data')])).toThrow(/collision/i);
  });
});
