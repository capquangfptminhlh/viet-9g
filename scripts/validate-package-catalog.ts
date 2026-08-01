import { loadPackageCatalog } from '../src/data/package-catalog.ts';

try {
  const catalog = loadPackageCatalog();
  const summary = catalog.packages.reduce<Record<string, number>>((counts, pkg) => {
    counts[pkg.status] = (counts[pkg.status] || 0) + 1;
    return counts;
  }, {});
  console.log(`Package catalog ${catalog.catalogVersion}: ${catalog.packages.length} packages`);
  for (const [status, count] of Object.entries(summary).sort()) console.log(`${status}: ${count}`);
} catch (error) {
  console.error(`Invalid package catalog: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
