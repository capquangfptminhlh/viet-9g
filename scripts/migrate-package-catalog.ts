import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { VIETTEL_PACKAGES } from '../src/data/packages.ts';

const root = process.cwd();
const sourcePath = path.resolve(root, 'src/data/packages.ts');
const outputPath = path.resolve(root, 'data/package-catalog.v1.json');

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function buildPackageCatalog(existing?: any) {
  const source = fs.readFileSync(sourcePath);
  const sha256 = crypto.createHash('sha256').update(source).digest('hex');
  const prior = new Map<string, any>((existing?.packages || []).map((pkg: any) => [pkg.id, pkg] as [string, any]));
  return {
    schemaVersion: '1.0.0',
    catalogVersion: existing?.catalogVersion || '1.0.0',
    generatedAt: existing?.generatedAt || '2026-08-02T00:00:00.000Z',
    sourceSnapshot: { path: 'src/data/packages.ts', sha256 },
    packages: VIETTEL_PACKAGES.map((pkg) => {
      const previous = prior.get(pkg.id) || {};
      return {
        ...previous,
        id: pkg.id,
        code: pkg.name,
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

const existing = readExisting();
const candidate = buildPackageCatalog(existing);
const serialized = `${stable(candidate)}\n`;
const check = process.argv.includes('--check');

if (check) {
  if (!existing || fs.readFileSync(outputPath, 'utf8') !== serialized) {
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
