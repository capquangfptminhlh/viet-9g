import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { LEGACY_PACKAGE_SOURCE } from '../src/data/packages.ts';

export { LEGACY_PACKAGE_SOURCE };

const root = process.cwd();
const sourcePath = path.resolve(root, 'src/data/packages.ts');
const factsPath = path.resolve(root, 'data/facts.json');
const outputPath = path.resolve(root, 'data/package-catalog.v1.json');

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function serializePackageCatalog(catalog: unknown): string {
  return `${stable(catalog)}\n`;
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r+\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * The catalog snapshot was historically generated from a Windows checkout.
 * Canonicalize source text to CRLF before hashing so the same logical source
 * has one stable snapshot hash on Windows, Linux, and macOS.
 */
export function computeSourceSnapshotHash(source: Buffer | string): string {
  const normalizedLf = normalizeLineEndings(Buffer.isBuffer(source) ? source.toString('utf8') : source);
  const canonicalCrLf = normalizedLf.replace(/\n/g, '\r\n');
  return crypto.createHash('sha256').update(canonicalCrLf, 'utf8').digest('hex');
}

export function buildPackageCatalog(existing?: any) {
  const source = fs.readFileSync(sourcePath);
  const sha256 = computeSourceSnapshotHash(source);
  const facts = JSON.parse(fs.readFileSync(factsPath, 'utf8').replace(/^\uFEFF/, ''))
    .filter((fact: any) => /^package-\d+$/.test(fact.id))
    .map((fact: any) => ({
      id: fact.id,
      key: fact.id,
      value: fact.claim,
      claim: fact.claim,
      sourceUrl: fact.sourceUrl,
      retrievedAt: fact.retrievedAt.includes('T') ? fact.retrievedAt : `${fact.retrievedAt}T00:00:00Z`,
      effectiveAt: fact.effectiveAt,
      expiresAt: fact.expiresAt,
    }));
  const prior = new Map<string, any>((existing?.packages || []).map((pkg: any) => [pkg.id, pkg] as [string, any]));
  const legacyIds = new Set(LEGACY_PACKAGE_SOURCE.map((pkg) => pkg.id));
  const migrationSource = [
    ...LEGACY_PACKAGE_SOURCE,
    ...(existing?.packages || [])
      .filter((pkg: any) => !legacyIds.has(pkg.id))
      .map((pkg: any) => ({
        id: pkg.id,
        name: pkg.display.name,
        category: pkg.category,
        description: pkg.display.description,
      })),
  ];
  return {
    schemaVersion: '1.0.0',
    catalogVersion: existing?.catalogVersion || '1.0.0',
    generatedAt: existing?.generatedAt || '2026-08-02T00:00:00.000Z',
    sourceSnapshot: { path: 'src/data/packages.ts', sha256 },
    facts,
    packages: migrationSource.map((pkg) => {
      const previous = prior.get(pkg.id) || {};
      return {
        ...previous,
        id: pkg.id,
        code: previous.code ?? pkg.code ?? pkg.name,
        category: pkg.category,
        display: { name: pkg.name, description: pkg.description, ...(previous.display || {}) },
        status: previous.status || 'unverified',
        factIds: previous.factIds || [],
        facts: previous.facts || [],
      };
    }),
  };
}

function readExisting() {
  if (!fs.existsSync(outputPath)) return undefined;
  return JSON.parse(fs.readFileSync(outputPath, 'utf8').replace(/^\uFEFF/, ''));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const existing = readExisting();
  const candidate = buildPackageCatalog(existing);
  const serialized = serializePackageCatalog(candidate);
  const check = process.argv.includes('--check');

  if (check) {
    if (!existing || normalizeLineEndings(fs.readFileSync(outputPath, 'utf8')) !== serialized) {
      console.error('Package catalog drift detected; generated output differs from data/package-catalog.v1.json');
      process.exitCode = 1;
    } else {
      console.log(`OK: package catalog unchanged (${candidate.packages.length} packages, source ${candidate.sourceSnapshot.sha256})`);
    }
  } else {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, serialized, 'utf8');
    console.log(`Wrote ${outputPath} (${candidate.packages.length} packages, source ${candidate.sourceSnapshot.sha256})`);
  }
}
