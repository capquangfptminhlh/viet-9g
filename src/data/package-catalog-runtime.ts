import { PackageCatalogSchema, type PackageCatalog, type PackageRecord, type CatalogFact } from './package-catalog.schema';

export type { PackageCatalog, PackageRecord, CatalogFact } from './package-catalog.schema';

function duplicate(values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return undefined;
}

export function isOfficialSource(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'https:' && (host === 'viettel.vn' || host.endsWith('.viettel.vn'));
  } catch { return false; }
}

function catalogFacts(catalog: PackageCatalog): Map<string, CatalogFact> {
  return new Map([
    ...catalog.facts.map((fact) => [fact.id, fact] as const),
    ...catalog.packages.flatMap((pkg) => pkg.facts.map((fact) => [fact.id, fact] as const)),
  ]);
}

function isCurrentFact(fact: CatalogFact | undefined, now: Date): fact is CatalogFact {
  if (!fact || !isOfficialSource(fact.sourceUrl)) return false;
  const at = now.getTime();
  return Date.parse(fact.effectiveAt) <= at && Date.parse(fact.expiresAt) > at;
}

export function getCurrentFacts(pkg: PackageRecord, catalog: PackageCatalog, now = new Date()): CatalogFact[] {
  const facts = catalogFacts(catalog);
  return pkg.factIds
    .map((id) => facts.get(id))
    .filter((fact): fact is CatalogFact => isCurrentFact(fact, now));
}

export function parsePackageCatalog(input: unknown): PackageCatalog {
  const catalog = PackageCatalogSchema.parse(input);
  const packageDuplicate = duplicate(catalog.packages.map((pkg) => pkg.id));
  if (packageDuplicate) throw new Error(`duplicate package ID: ${packageDuplicate}`);
  const codeDuplicate = duplicate(catalog.packages.map((pkg) => pkg.code.toUpperCase()));
  if (codeDuplicate) throw new Error(`duplicate package code: ${codeDuplicate}`);

  const allFacts = [...catalog.facts, ...catalog.packages.flatMap((pkg) => pkg.facts)];
  const factDuplicate = duplicate(allFacts.map((fact) => fact.id));
  if (factDuplicate) throw new Error(`duplicate fact ID: ${factDuplicate}`);
  const factMap = new Map(allFacts.map((fact) => [fact.id, fact]));
  const generated = Date.parse(catalog.generatedAt);

  for (const fact of allFacts) {
    if (!isOfficialSource(fact.sourceUrl)) throw new Error(`sourceUrl for fact ${fact.id} must be HTTPS official viettel.vn evidence`);
    if (typeof fact.value === 'number' && fact.value <= 0) throw new Error(`fact ${fact.id} value must be positive`);
    if (Date.parse(fact.expiresAt) <= Date.parse(fact.effectiveAt)) throw new Error(`invalid expiry for fact ${fact.id}`);
  }

  for (const pkg of catalog.packages) {
    const refs = duplicate(pkg.factIds);
    if (refs) throw new Error(`duplicate fact ID reference in package ${pkg.id}: ${refs}`);
    for (const id of pkg.factIds) {
      if (!factMap.has(id)) throw new Error(`missing fact reference ${id} in package ${pkg.id}`);
    }
    if (pkg.status === 'active') {
      if (!pkg.registration) throw new Error(`active package ${pkg.id} requires registration data`);
      if (pkg.factIds.length === 0) throw new Error(`active package ${pkg.id} requires evidence`);
    }
    for (const id of pkg.factIds) {
      const fact = factMap.get(id)!;
      if (pkg.status === 'active' && Date.parse(fact.expiresAt) <= generated) {
        throw new Error(`expired fact ${id} for active package ${pkg.id}`);
      }
    }
  }
  return catalog;
}

export function getPackageById(catalog: PackageCatalog, id: string): PackageRecord | undefined {
  return catalog.packages.find((pkg) => pkg.id === id.toLowerCase() || pkg.code.toLowerCase() === id.toLowerCase());
}

export function getRenderablePackages(catalog: PackageCatalog, now = new Date()): PackageRecord[] {
  return catalog.packages.flatMap((pkg) => {
    if (!['active', 'eligibility_required'].includes(pkg.status)) return [];
    const currentFacts = getCurrentFacts(pkg, catalog, now);
    const keys = new Set(currentFacts.map((fact) => fact.key));
    if (!keys.has('priceVnd') || !keys.has('durationDays') || (!keys.has('dataAllowance') && !keys.has('dataPerDay'))) return [];

    const registrationIsCurrent = !!pkg.registration?.factId
      && pkg.factIds.includes(pkg.registration.factId)
      && currentFacts.some((fact) => fact.id === pkg.registration!.factId);
    if (registrationIsCurrent) return [pkg];
    const { registration: _registration, ...publicOffer } = pkg;
    return [publicOffer];
  });
}
