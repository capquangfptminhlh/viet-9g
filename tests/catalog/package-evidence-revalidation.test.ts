import { describe, expect, it } from 'vitest';
import { getRenderablePackages, loadPackageCatalog } from '../../src/data/package-catalog';
import { getVerifiedPackages } from '../../src/data/verified-package';

describe('package evidence revalidation', () => {
  const observedAt = new Date('2026-09-12T06:30:00.000Z');

  it('keeps core package cards renderable when current official summary evidence revalidates expired structured facts', () => {
    const catalog = loadPackageCatalog();
    const codes = getRenderablePackages(catalog, observedAt).map((pkg) => pkg.code);

    expect(codes).toEqual(expect.arrayContaining(['5G135', '5G150', 'SD70', 'SD90', 'SD120', 'SD135', 'SD150', 'V90B', 'V120B', 'V160B', 'MXH100', 'MXH120', 'MXH150']));
  });

  it('passes the revalidated core facts through the homepage verified-package adapter without stale optional copy', () => {
    const catalog = loadPackageCatalog();
    const packages = getVerifiedPackages(catalog, observedAt);
    const codes = packages.map((pkg) => pkg.code);

    expect(codes).toEqual(expect.arrayContaining(['5G135', 'SD70', 'V120B', 'MXH120']));
    const package5g135 = packages.find((pkg) => pkg.code === '5G135');
    expect(package5g135).toMatchObject({ priceVnd: 135000, durationDays: 30, dataPerDay: '4 GB/ngày' });
    expect(package5g135?.benefits).toEqual([]);
    expect(package5g135?.eligibility).toEqual([]);
    expect(package5g135?.registrationEligible).toBe(false);
  });

  it('fails closed when both structured package facts and official summary snapshots are stale', () => {
    const catalog = loadPackageCatalog();
    for (const fact of catalog.facts) fact.expiresAt = '2026-08-23T00:00:00.000Z';

    expect(getRenderablePackages(catalog, observedAt)).toHaveLength(0);
    expect(getVerifiedPackages(catalog, observedAt)).toHaveLength(0);
  });

  it('does not revalidate a package when the current summary no longer supports its exact price', () => {
    const catalog = loadPackageCatalog();
    const summary = catalog.facts.find((fact) => String(fact.value).includes('5G135'));
    expect(summary).toBeDefined();
    if (!summary) return;

    summary.claim = summary.claim.replace(/135[,.]000/g, '999,000');
    summary.value = String(summary.value).replace(/135[,.]000/g, '999,000');

    const codes = getVerifiedPackages(catalog, observedAt).map((pkg) => pkg.code);
    expect(codes).not.toContain('5G135');
  });
});
