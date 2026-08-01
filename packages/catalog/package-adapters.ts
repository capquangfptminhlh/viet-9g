import type { TelecomPackage } from '../../src/types';
import type { PackageCatalog, PackageRecord, CatalogFact } from '../../src/data/package-catalog-runtime';

export type PackageFallbacks = Record<string, TelecomPackage>;

function factValue(pkg: PackageRecord, facts: Map<string, CatalogFact>, key: string): string | number | boolean | undefined {
  for (const id of pkg.factIds) {
    const fact = facts.get(id);
    if (fact?.key === key) return fact.value;
  }
  return undefined;
}

function asNumber(value: string | number | boolean | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function toTelecomPackage(
  pkg: PackageRecord,
  fallback?: Partial<TelecomPackage>,
  catalogFacts: readonly CatalogFact[] = [],
): TelecomPackage {
  const facts = new Map([
    ...catalogFacts.map((fact) => [fact.id, fact] as const),
    ...pkg.facts.map((fact) => [fact.id, fact] as const),
  ]);
  const price = asNumber(factValue(pkg, facts, 'priceVnd'), fallback?.price ?? 0);
  const registrationEligible = pkg.status === 'active' && pkg.factIds.length > 0 && Boolean(pkg.registration);

  return {
    id: pkg.id,
    code: pkg.code,
    name: pkg.display.name,
    price,
    duration: fallback?.duration ?? '',
    dataLimit: fallback?.dataLimit ?? '',
    dataPerDay: fallback?.dataPerDay ?? '',
    calls: fallback?.calls,
    social: fallback?.social,
    category: pkg.category,
    description: pkg.display.description,
    benefits: fallback?.benefits ?? pkg.display.benefits ?? [],
    rules: fallback?.rules ?? [],
    popular: fallback?.popular,
    status: pkg.status,
    registrationEligible,
  };
}

export function catalogToTelecomPackages(catalog: PackageCatalog, fallbacks: PackageFallbacks = {}): TelecomPackage[] {
  const catalogFacts = catalog.facts;
  return catalog.packages
    .filter((pkg) => pkg.status !== 'retired')
    .map((pkg) => toTelecomPackage(pkg, fallbacks[pkg.id], catalogFacts));
}
