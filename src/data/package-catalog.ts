import fs from 'node:fs';
import path from 'node:path';
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

function isOfficial(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'https:' && (host === 'viettel.vn' || host.endsWith('.viettel.vn'));
  } catch { return false; }
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
    if (!isOfficial(fact.sourceUrl)) throw new Error(`sourceUrl for fact ${fact.id} must be HTTPS official viettel.vn evidence`);
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
      const expires = Date.parse(fact.expiresAt);
      if (pkg.status === 'active') {
        if (expires <= generated) throw new Error(`expired fact ${id} for active package ${pkg.id}`);
      }
    }
  }
  return catalog;
}

export function loadPackageCatalog(input: string | URL | unknown = path.resolve('data/package-catalog.v1.json')): PackageCatalog {
  const raw = typeof input === 'string' || input instanceof URL
    ? JSON.parse(fs.readFileSync(input instanceof URL ? input : path.resolve(input), 'utf8').replace(/^\uFEFF/, ''))
    : input;
  return parsePackageCatalog(raw);
}

export function getPackageById(catalog: PackageCatalog, id: string): PackageRecord | undefined {
  return catalog.packages.find((pkg) => pkg.id === id.toLowerCase() || pkg.code.toLowerCase() === id.toLowerCase());
}

export function getRenderablePackages(catalog: PackageCatalog, now = new Date()): PackageRecord[] {
  const facts = new Map<string, CatalogFact>([
    ...catalog.facts.map((fact) => [fact.id, fact] as const),
    ...catalog.packages.flatMap((pkg) => pkg.facts.map((fact) => [fact.id, fact] as const)),
  ]);
  const at = now.getTime();
  return catalog.packages.filter((pkg) => {
    if (!['active', 'eligibility_required'].includes(pkg.status)) return false;
    return pkg.factIds.length > 0 && pkg.factIds.every((id) => {
      const fact = facts.get(id);
      return !!fact && isOfficial(fact.sourceUrl) && Date.parse(fact.expiresAt) > at && Date.parse(fact.effectiveAt) <= at;
    });
  });
}
