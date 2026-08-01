# Package Catalog v1 — Design

## Goal

Create one evidence-backed package catalog for the website and BOD-32. It must preserve the affiliate registration code `GB` and SMS destination `290`, while preventing stale, unverified, or contradictory commercial claims from being rendered or published.

## Scope

This release creates the catalog contract, loader, compatibility adapter, and one verified vertical slice. It does not bulk-rewrite existing articles, delete legacy data, alter the Blogger ledger, or enable any publishing schedule.

## Source of truth

`data/package-catalog.v1.json` is the sole operational source for package facts. Every package has a stable ID, display metadata, lifecycle status, evidence references, and dated commercial facts. Commercial facts include an official Viettel source URL, retrieval time, effective time, and expiry time.

`GB` is intentionally separate from package facts in `src/config/agent-code.ts`. The only API permitted to construct a registration message is `buildSmsSyntax(package, registrationChannel)`, which emits `<PACKAGE_CODE> GB` for recipient `290`.

## Package lifecycle

| Status | Website behavior | Automation behavior |
|---|---|---|
| `ACTIVE` | Show package and registration CTA | Eligible after all gates pass |
| `ELIGIBILITY_REQUIRED` | Show package with subscriber-eligibility warning | Not eligible for auto-publish until evidence supports the topic |
| `HOLD` | Do not show a registration CTA | Never selected |
| `RETIRED` | Hidden from catalog or archival/noindex page | Never selected |

## Data model

The catalog contains:

- package identity: `id`, `code`, category and display copy;
- normalized facts: `priceVnd`, validity, data allowance, calls, eligibility and renewal policy;
- `factIds` for every commercial claim;
- `sourceUrl`, `retrievedAt`, `effectiveAt`, `expiresAt` for facts;
- `catalogVersion`, `generatedAt` and a source snapshot hash.

Facts may be projected for Blogger validation, but Blogger cannot introduce an independent price/data/cú pháp store. A topic may later reference `packageId` plus immutable `sourceFactIds`.

## Components and data flow

```text
package-catalog.v1.json
  -> schema + loader + validation
  -> compatibility adapter (TelecomPackage)
  -> website grid / recommender / package route / CTA
  -> BOD topic resolver + fact validator + ledger catalogVersion
```

The current `src/data/packages.ts` becomes a read-only adapter during migration. Existing UI props stay stable in this release to constrain change risk. `HeroCarousel` becomes data-driven only after the adapter passes parity tests.

## Migration rules

1. Inventory all current package IDs, fields, routes and Markdown claims.
2. Do not infer a commercial fact from stale Markdown or the current UI list.
3. Conflicting values remain `HOLD` or `UNVERIFIED` until reconciled against a primary Viettel source.
4. Start with V120B as one vertical slice, then migrate packages in reviewed batches.
5. Preserve all existing Blogger ledger entries; catalog version is appended for new entries only.
6. Do not delete `data/facts.json` or literal package data until coverage and parity gates are complete.

## Required gates and tests

- schema: unique IDs/codes, valid enum/value/unit/date fields;
- evidence: all commercial facts are linked to a package, official allowed source, and valid future expiry;
- freshness: expired and `HOLD` records cannot render a CTA or create Blogger content;
- adapter parity: V120B catalog projection preserves the existing package UI contract;
- registration invariant: every generated registration CTA uses `GB` and recipient `290`;
- topic integrity: package/topic/fact references resolve; no deleted or expired fact is accepted;
- content manifest: package claims in Markdown are reported as verified, conflicting, or unmapped;
- regression: unit tests, Astro build, targeted route smoke tests and `git diff --check` pass.

## Rollback

Catalog files are versioned. Cutover uses a version pointer/configuration setting only after a validated build. Rollback switches to the previous validated catalog version and appends an audit record. It never deletes facts, posts, or Blogger ledger entries.

## Explicit non-goals

- No automatic publication in this release.
- No bulk SEO rewrite or mass creation of articles.
- No claim that every current package is active until official evidence is recorded.
- No change to the `GB` affiliate code or `290` SMS destination.
