import { describe, expect, it } from 'vitest';
import { getRenderablePackages, loadPackageCatalog } from '../../src/data/package-catalog';

describe('package evidence revalidation', () => {
  const observedAt = new Date('2026-09-12T06:30:00.000Z');

  it('keeps core package cards renderable when current official summary evidence revalidates expired structured facts', () => {
    const catalog = loadPackageCatalog();
    const codes = getRenderablePackages(catalog, observedAt).map((pkg) => pkg.code);

    expect(codes).toEqual(expect.arrayContaining(['5G135', '5G150', 'SD70', 'SD90', 'SD120', 'SD135', 'SD150', 'V90B', 'V120B', 'V160B', 'MXH100', 'MXH120', 'MXH150']));
  });

  it('fails closed when both structured package facts and official summary snapshots are stale', () => {
    const catalog = loadPackageCatalog();
    for (const fact of catalog.facts) fact.expiresAt = '2026-08-23T00:00:00.000Z';

    expect(getRenderablePackages(catalog, observedAt)).toHaveLength(0);
  });

  it('does not revalidate a package when the current summary no longer supports its exact price', () => {
    const catalog = loadPackageCatalog();
    const summary = catalog.facts.find((fact) => String(fact.value).includes('5G135'));
    expect(summary).toBeDefined();
    if (!summary) return;

    summary.claim = summary.claim.replace(/135[,.]000/g, '999,000');
    summary.value = String(summary.value).replace(/135[,.]000/g, '999,000');

    const codes = getRenderablePackages(catalog, observedAt).map((pkg) => pkg.code);
    expect(codes).not.toContain('5G135');
  });
});
