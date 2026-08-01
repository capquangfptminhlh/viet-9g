# Package Catalog v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce one validated, versioned package catalog that can drive the website and BOD-32 while preserving the `GB` affiliate code and SMS destination `290`.

**Architecture:** `data/package-catalog.v1.json` is the canonical package/evidence store. A typed loader validates it and adapters project it into the existing `TelecomPackage` UI shape and Blogger fact shape. Existing UI components remain compatible during this release; no ledger or publication schedule is changed.

**Tech Stack:** TypeScript, Zod, Astro 5, React 19, Vitest, JSON Schema, Node.js scripts.

---

## File map before implementation

- Create `data/package-catalog.v1.json`: versioned package records and evidence references.
- Create `schemas/package-catalog.schema.json`: machine-readable validation contract.
- Create `src/data/package-catalog.schema.ts`: runtime Zod schemas and exported types.
- Create `src/data/package-catalog.ts`: loader, selectors, freshness/status checks.
- Create `src/config/agent-code.ts`: single registration channel `{ agentCode: 'GB', smsNumber: '290' }`.
- Create `packages/catalog/package-adapters.ts`: canonical-to-legacy UI and Blogger projections.
- Create `scripts/migrate-package-catalog.ts`: deterministic import/check report; never edits legacy files.
- Create `scripts/validate-package-catalog.ts`: CI validation command.
- Modify `src/data/packages.ts`: compatibility re-export from the catalog adapter; remove package literals only after parity is proven.
- Modify `src/pages/goi-cuoc/[id].astro`: use catalog selectors for static paths.
- Modify `src/components/PackageModal.tsx` and `src/components/DynamicPostPage.tsx`: use the centralized GB/290 formatter.
- Modify `scripts/auto-blogger.ts`: resolve package-backed topics through the catalog and persist `catalogVersion`.
- Create `tests/catalog/package-catalog.test.ts`, `tests/catalog/package-adapters.test.ts`, and `tests/catalog/registration-channel.test.ts`.
- Create `tests/catalog/package-catalog-migration.test.ts`.

## Task 1: Establish a failing catalog contract test

**Files:** Create `tests/catalog/package-catalog.test.ts`.

- [ ] **Step 1: Write tests for a valid record, duplicate IDs, missing evidence, expired active facts, and invalid registration fields.** Use a fixture object inside the test so the test fails before the loader exists.

```ts
import { describe, expect, it } from 'vitest';
import { parsePackageCatalog } from '../../src/data/package-catalog';

const valid = {
  schemaVersion: '1.0.0', catalogVersion: '2026-08-02.1', generatedAt: '2026-08-02T00:00:00Z',
  packages: [{
    id: 'v120b', code: 'V120B', category: 'combo', status: 'unverified',
    display: { description: 'Gói dữ liệu cần xác minh' },
    factIds: ['pkg:v120b:price'],
    facts: [{ id: 'pkg:v120b:price', key: 'priceVnd', value: 120000, unit: 'VND', claim: '120000đ', sourceUrl: 'https://viettel.vn/example', retrievedAt: '2026-08-02T00:00:00Z', effectiveAt: '2026-01-01', expiresAt: '2026-12-31T23:59:59Z' }]
  }]
};

describe('package catalog contract', () => {
  it('accepts a structurally valid catalog', () => expect(parsePackageCatalog(valid).packages).toHaveLength(1));
  it('rejects duplicate package IDs', () => expect(() => parsePackageCatalog({ ...valid, packages: [valid.packages[0], valid.packages[0]] })).toThrow(/duplicate/i));
  it('rejects an active package without current evidence', () => expect(() => parsePackageCatalog({ ...valid, packages: [{ ...valid.packages[0], status: 'active', facts: [] }] })).toThrow(/evidence|fact/i));
  it('rejects an invalid expiry date', () => expect(() => parsePackageCatalog({ ...valid, packages: [{ ...valid.packages[0], facts: [{ ...valid.packages[0].facts[0], expiresAt: 'not-a-date' }] }] })).toThrow(/date|expiry|expires/i));
});
```

- [ ] **Step 2: Run the focused test and verify the expected missing-module failure.**

Run: `npx vitest run tests/catalog/package-catalog.test.ts`

Expected: FAIL because `src/data/package-catalog.ts` does not exist.

- [ ] **Step 3: Commit the red test.**

```bash
git add tests/catalog/package-catalog.test.ts
git commit -m "test(catalog): define package catalog contract"
```

## Task 2: Implement schema, loader, and freshness selectors

**Files:** Create `src/data/package-catalog.schema.ts`, `src/data/package-catalog.ts`, `schemas/package-catalog.schema.json`.

- [ ] **Step 1: Implement the Zod schema and parser.** The parser must enforce unique package/fact IDs, ISO dates, positive numeric values, and evidence for `active` records. It must return a typed catalog and never silently downgrade malformed input.

```ts
export const FactSchema = z.object({
  id: z.string().min(1), key: z.string().min(1), value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(), claim: z.string().min(1), sourceUrl: z.string().url(),
  retrievedAt: z.string().datetime(), effectiveAt: z.string(), expiresAt: z.string().datetime()
});
export const PackageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), code: z.string().min(1), category: z.enum(['hot','data','social','combo','long_term']),
  status: z.enum(['active','eligibility_required','hold','retired','unverified']),
  display: z.object({ description: z.string(), benefits: z.array(z.string()).optional(), eligibility: z.array(z.string()).optional() }),
  factIds: z.array(z.string()), facts: z.array(FactSchema)
});
export const PackageCatalogSchema = z.object({ schemaVersion: z.literal('1.0.0'), catalogVersion: z.string(), generatedAt: z.string().datetime(), packages: z.array(PackageSchema) });
```

- [ ] **Step 2: Add `parsePackageCatalog`, `loadPackageCatalog`, `getPackageById`, and `getRenderablePackages`.** `getRenderablePackages` must return only `active` or `eligibility_required` records whose referenced facts are current at the supplied clock. A missing/expired fact returns no renderable package.

- [ ] **Step 3: Add the equivalent JSON Schema and make the validator script call the same parser.** Do not maintain separate validation rules.

- [ ] **Step 4: Run focused tests and then the existing Blogger tests.**

Run: `npx vitest run tests/catalog/package-catalog.test.ts tests/blogger`

Expected: catalog tests PASS; existing Blogger suite remains green.

- [ ] **Step 5: Commit.**

```bash
git add src/data/package-catalog.schema.ts src/data/package-catalog.ts schemas/package-catalog.schema.json
git commit -m "feat(catalog): add validated package catalog loader"
```

## Task 3: Add the catalog data and deterministic migration/check commands

**Files:** Create `data/package-catalog.v1.json`, `scripts/migrate-package-catalog.ts`, `scripts/validate-package-catalog.ts`, `tests/catalog/package-catalog-migration.test.ts`.

- [ ] **Step 1: Add a migration test that proves a second `--check` run is byte-stable and that the legacy package ID set is preserved.** The test must fail until the script exists.

- [ ] **Step 2: Build the initial catalog from `src/data/packages.ts` without silently asserting its claims as current.** Records whose official Viettel evidence is not available are `unverified`; they remain visible only after a later evidence review and never receive an automatic registration CTA. Record the input SHA-256 and `catalogVersion` in the output.

- [ ] **Step 3: Implement `scripts/migrate-package-catalog.ts --check`.** It reads legacy data, compares the generated stable JSON with the checked-in catalog, and exits nonzero on drift; it does not modify the legacy file, facts, topics, or Blogger ledger.

- [ ] **Step 4: Implement `scripts/validate-package-catalog.ts`.** It calls `parsePackageCatalog`, prints a summary of active/eligibility/hold/unverified/retired counts, and exits nonzero for invalid structure or stale evidence.

- [ ] **Step 5: Run migration, validate, and tests.**

Run: `npx tsx scripts/migrate-package-catalog.ts --check`

Expected: deterministic report and exit 0 only when the checked-in catalog matches the source snapshot.

Run: `npx tsx scripts/validate-package-catalog.ts`

Expected: summary with no invalid records.

- [ ] **Step 6: Commit catalog and scripts.**

```bash
git add data/package-catalog.v1.json scripts/migrate-package-catalog.ts scripts/validate-package-catalog.ts tests/catalog/package-catalog-migration.test.ts
git commit -m "feat(catalog): add versioned package data and migration checks"
```

## Task 4: Centralize `GB`/`290` and preserve UI behavior

**Files:** Create `src/config/agent-code.ts`, `packages/catalog/package-adapters.ts`, `tests/catalog/package-adapters.test.ts`, `tests/catalog/registration-channel.test.ts`; modify `src/data/packages.ts`, `src/components/PackageModal.tsx`, `src/components/DynamicPostPage.tsx`.

- [ ] **Step 1: Write failing tests for catalog-to-`TelecomPackage` projection and exact registration syntax.**

```ts
expect(buildSmsSyntax({ code: 'V120B' })).toBe('V120B GB');
expect(REGISTRATION_CHANNEL.smsNumber).toBe('290');
expect(toTelecomPackage(catalog.packages[0]).id).toBe('v120b');
```

- [ ] **Step 2: Implement the adapter and channel config.** Package data comes from the catalog; only the channel config owns `GB` and `290`. Reject a blank or changed agent code at runtime.

- [ ] **Step 3: Replace UI imports/CTA string concatenation with adapter/channel functions.** Do not change layout or package filtering in this task. Preserve current `TelecomPackage` props through the adapter.

- [ ] **Step 4: Run focused UI/catalog tests and build.**

Run: `npx vitest run tests/catalog tests/blogger`

Expected: all focused tests pass and every registration assertion contains `GB` and `290`.

Run: `npm run build`

Expected: Astro build succeeds and route count does not drop from the baseline.

- [ ] **Step 5: Commit.**

```bash
git add src/config/agent-code.ts packages/catalog/package-adapters.ts src/data/packages.ts src/components/PackageModal.tsx src/components/DynamicPostPage.tsx tests/catalog
git commit -m "feat(catalog): centralize package adapter and GB registration channel"
```

## Task 5: Switch static package routes and BOD to the catalog

**Files:** Modify `src/pages/goi-cuoc/[id].astro`, `scripts/auto-blogger.ts`, `config/topics.json`; create/update `tests/catalog/route-parity.test.ts` and the BOD catalog integration tests.

- [ ] **Step 1: Write failing route-parity tests.** Assert that every currently renderable package ID has one route, unknown IDs are not generated, and inactive/unverified records cannot produce an automatic registration CTA.

- [ ] **Step 2: Change `getStaticPaths()` to use `getRenderablePackages()` and the adapter.** Keep existing IDs stable; do not delete old routes in this release without an explicit redirect plan.

- [ ] **Step 3: Add optional `packageId` to topic typing and resolve it through the catalog before generating Blogger content.** Validate package status, fact IDs, freshness, and `catalogVersion`; missing/invalid package resolution returns `TOPIC_QUEUE_EXHAUSTED`/HOLD without an API call.

- [ ] **Step 4: Persist `catalogVersion` and `packageId` in new ledger entries.** Never rewrite or delete existing ledger entries.

- [ ] **Step 5: Run route, Blogger, and full regression checks.**

Run: `npx vitest run tests/catalog tests/blogger`

Run: `npm run build`

Expected: all tests pass, the route count is stable, and no old ledger entry changes.

- [ ] **Step 6: Commit.**

```bash
git add src/pages/goi-cuoc/[id].astro scripts/auto-blogger.ts config/topics.json tests/catalog tests/blogger
git commit -m "feat(catalog): route package pages and Blogger topics through catalog"
```

## Task 6: Add CI gates and operator documentation

**Files:** Modify `package.json`, `.github/workflows/daily.yml` only if needed for validation; create/update `docs/BOD-32-PUBLISHING-RUNBOOK.md` and catalog operations documentation.

- [ ] **Step 1: Add scripts `validate:catalog` and `check:catalog` to `package.json`.** They must call the checked-in TypeScript scripts, not duplicate logic.

- [ ] **Step 2: Add CI steps after install and before any publish candidate.** Run catalog validation, migration check, focused tests, full tests, build, and `git diff --check`. Do not enable cron or direct publishing.

- [ ] **Step 3: Document catalog update procedure.** It must say: verify official evidence, update catalog version, run validation, inspect route/content diff, preserve `GB`, review PR, and record rollback version.

- [ ] **Step 4: Run the release checklist.**

Run: `npm run validate:catalog`

Run: `npm run check:catalog`

Run: `npm test`

Run: `npm run build`

Expected: all commands pass; no Blogger cron or auto-publish schedule is enabled by this release.

- [ ] **Step 5: Commit documentation and CI changes.**

```bash
git add package.json .github/workflows/daily.yml docs/BOD-32-PUBLISHING-RUNBOOK.md docs/superpowers
git commit -m "docs(ci): document and gate package catalog operations"
```

## Rollout and rollback checkpoints

1. Review catalog conflicts before marking any package `active`.
2. Run V120B as the vertical slice and compare route/UI/CTA output with the baseline.
3. Migrate additional packages in batches; no mass Markdown rewrite.
4. If validation fails, leave the previous adapter/catalog pointer active and mark the candidate `HOLD`.
5. Rollback by selecting the previous validated catalog version; do not reset Git history, delete facts, or edit Blogger ledger history.

## Definition of done

- Catalog schema and loader are tested and deterministic.
- Legacy package IDs map one-to-one through the adapter.
- UI displays all eligible catalog packages and never gives a CTA for stale/unverified data.
- Every registration CTA remains `GB` to `290`.
- BOD-32 resolves current package facts from the catalog and records catalog version.
- Tests/build/migration check pass.
- No cron or auto-publish is enabled by Release 1.
