# Package Catalog Operations Runbook

The versioned catalog is an evidence gate, not a second editorial ledger. Legacy package data, facts, topics, posts, and the Blogger publication ledger remain preserved. A catalog change must be reviewed before it can affect customer registration or BOD content.

## Updating a package

1. Verify every commercial claim against current official Viettel HTTPS evidence. Do not promote a Markdown claim or an unverified legacy value to active status.
2. Update `data/package-catalog.v1.json`, bump `catalogVersion`, and record the source snapshot hash.
3. Run `npm run validate:catalog` and `npm run check:catalog`.
4. Run `npx vitest run tests/catalog tests/blogger` and `npm run build`; inspect route and content diffs.
5. Review registration fields: only evidence-backed `active` packages may expose a CTA; all other statuses remain visible with registration disabled.
6. Merge through review with the validation output attached. Never delete `data/facts.json`, topics, posts, or existing ledger entries.

## Drift and stale evidence

`npm run check:catalog` deterministically regenerates the candidate and fails if the checked-in catalog no longer matches `src/data/packages.ts`. `npm run validate:catalog` rejects malformed structure, missing references, non-official evidence, and stale active facts. An expired or unverified package stays customer-visible for discovery but cannot produce a registration CTA or an automated Blogger draft.

## Rollback

Catalog versions are append-only. If a validated deployment regresses, switch the catalog version pointer/configuration to the previous validated version, rebuild, and record the event in the release log. Do not rewrite history, delete catalog versions, alter legacy facts/posts, or remove Blogger publication-ledger entries. Re-run both catalog commands and the full build before restoring traffic.

## CI and scheduling

The daily workflow runs catalog validation and drift checks before the existing pipeline. Its schedule remains disabled; `workflow_dispatch` is the only trigger. These checks do not publish content or enable a cron job.
