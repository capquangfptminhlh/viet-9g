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

function globalFacts(catalog: PackageCatalog): Map<string, CatalogFact> {
  return new Map([
    ...catalog.facts.map((fact) => [fact.id, fact] as const),
  ]);
}

function packageFacts(pkg: PackageRecord, catalog: PackageCatalog): Map<string, CatalogFact> {
  return new Map([
    ...globalFacts(catalog),
    ...pkg.facts.map((fact) => [fact.id, fact] as const),
  ]);
}

function isCurrentFact(fact: CatalogFact | undefined, now: Date): fact is CatalogFact {
  if (!fact || !isOfficialSource(fact.sourceUrl)) return false;
  const at = now.getTime();
  return Date.parse(fact.effectiveAt) <= at && Date.parse(fact.expiresAt) > at;
}

const SnapshotRevalidatableKeys = new Set(['priceVnd', 'durationDays', 'dataAllowance', 'dataPerDay']);

function normalizeEvidenceText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
}

function snapshotText(fact: CatalogFact): string {
  return `${fact.claim} ${String(fact.value)}`;
}

function supportsCoreFact(snapshot: CatalogFact, pkg: PackageRecord, fact: CatalogFact): boolean {
  if (!SnapshotRevalidatableKeys.has(fact.key)) return false;
  const rawSnapshot = snapshotText(snapshot);
  const normalizedSnapshot = normalizeEvidenceText(rawSnapshot);
  if (!normalizedSnapshot.includes(normalizeEvidenceText(pkg.code))) return false;

  if (fact.key === 'priceVnd') {
    if (typeof fact.value !== 'number') return false;
    const en = new Intl.NumberFormat('en-US').format(fact.value);
    const vi = new Intl.NumberFormat('vi-VN').format(fact.value);
    return rawSnapshot.includes(en) || rawSnapshot.includes(vi) || normalizedSnapshot.includes(String(fact.value));
  }

  if (fact.key === 'durationDays') {
    if (typeof fact.value !== 'number') return false;
    return new RegExp(`\\b${fact.value}\\s*days?\\b`, 'i').test(rawSnapshot);
  }

  if (typeof fact.value !== 'string') return false;
  const normalizedValue = normalizeEvidenceText(fact.value)
    .replace('/ngay', '/day')
    .replace('/thang', '/month');
  return normalizedSnapshot.includes(normalizedValue);
}

function isRevalidatedCoreFact(
  pkg: PackageRecord,
  fact: CatalogFact | undefined,
  catalog: PackageCatalog,
  now: Date,
): fact is CatalogFact {
  if (!fact || !SnapshotRevalidatableKeys.has(fact.key)) return false;
  if (!isOfficialSource(fact.sourceUrl) || Date.parse(fact.effectiveAt) > now.getTime()) return false;

  return catalog.facts.some((snapshot) =>
    snapshot.sourceUrl === fact.sourceUrl
    && isCurrentFact(snapshot, now)
    && supportsCoreFact(snapshot, pkg, fact));
}

function supportsRegistrationSyntax(fact: CatalogFact, syntax: string): boolean {
  if (typeof fact.value !== 'string') return false;
  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toUpperCase();
  return normalize(fact.value) === normalize(syntax);
}

export function getCurrentFacts(pkg: PackageRecord, catalog: PackageCatalog, now = new Date()): CatalogFact[] {
  const facts = packageFacts(pkg, catalog);
  return pkg.factIds
    .map((id) => facts.get(id))
    .filter((fact): fact is CatalogFact => isCurrentFact(fact, now) || isRevalidatedCoreFact(pkg, fact, catalog, now));
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
      if (!packageFacts(pkg, catalog).has(id)) throw new Error(`missing local or global fact reference ${id} in package ${pkg.id}`);
    }
    if (pkg.status === 'active') {
      if (!pkg.registration) throw new Error(`active package ${pkg.id} requires registration data`);
      if (pkg.factIds.length === 0) throw new Error(`active package ${pkg.id} requires evidence`);
    }
    for (const id of pkg.factIds) {
      const fact = packageFacts(pkg, catalog).get(id)!;
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
    const hasPositiveNumber = (key: string) => currentFacts.some((fact) => fact.key === key && typeof fact.value === 'number' && fact.value > 0);
    const hasData = currentFacts.some((fact) => (fact.key === 'dataAllowance' || fact.key === 'dataPerDay') && typeof fact.value === 'string' && fact.value.trim().length > 0);
    if (!hasPositiveNumber('priceVnd') || !hasPositiveNumber('durationDays') || !hasData) return [];

    const registrationFact = pkg.registration?.factId
      && pkg.factIds.includes(pkg.registration.factId)
      ? currentFacts.find((fact) => fact.id === pkg.registration!.factId)
      : undefined;
    const registrationIsCurrent = !!pkg.registration
      && registrationFact?.key === 'registrationSyntax'
      && supportsRegistrationSyntax(registrationFact, pkg.registration.syntax);
    if (registrationIsCurrent) return [pkg];
    const { registration: _registration, ...publicOffer } = pkg;
    return [publicOffer];
  });
}
