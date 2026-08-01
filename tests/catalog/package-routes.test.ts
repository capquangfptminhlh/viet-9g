import { describe, expect, it } from 'vitest';
import { loadPackageCatalog } from '../../src/data/package-catalog';
import { getPackageRoutes } from '../../src/data/package-routes';

describe('customer package routes', () => {
  it('lists all non-retired catalog records while disabling registration CTA', () => {
    const routes = getPackageRoutes(loadPackageCatalog());
    expect(routes).toHaveLength(40);
    expect(routes.every((pkg) => pkg.registrationEligible === false)).toBe(true);
    expect(routes.every((pkg) => pkg.status !== 'retired')).toBe(true);
  });
});
