# SEO/AEO Blueprint Gap Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the production SEO, primary-site and five-Blogger publishing paths with the approved operating blueprint without weakening the existing fact, duplicate or ledger gates.

**Architecture:** Treat configuration as executable policy. The Blogger worker must load one source of truth for mode, kill switch, site charter, media requirements and publish caps before it makes an API call. A deterministic media manifest provides traceable, topic-specific editorial images; the primary-site and Blogger workers consume only published asset URLs.

**Tech Stack:** TypeScript, Vitest, Astro static assets, GitHub Actions, Blogger API, JSON configuration.

---

### Task 1: Make the catalog check portable on Windows

**Files:**
- Modify: `.gitattributes`
- Test: `tests/catalog/package-catalog-migration.test.ts`

- [ ] Add a regression test that invokes the catalog check against CRLF fixture content and expects a stable result.
- [ ] Run the new test and confirm it fails because the current raw-byte comparison treats line endings as catalog drift.
- [ ] Normalize catalog line-ending handling and enforce LF for the generated catalog through `.gitattributes`.
- [ ] Re-run the focused catalog suite, then `npm test`.

### Task 2: Turn automation configuration into an enforced publishing boundary

**Files:**
- Create: `packages/policy-engine/automation-policy.ts`
- Modify: `scripts/auto-blogger.ts`
- Modify: `config/automation-policy.json`
- Test: `tests/blogger/automation-policy.test.ts`

- [ ] Add tests for disabled/dry-run, kill-switch, low-risk conditional publishing and rejected medium/high-risk publication.
- [ ] Make the worker load and validate policy before selecting a topic or creating a Blogger API client.
- [ ] Record policy version and rejection reason in the ledger and GitHub summary.
- [ ] Retain the existing fact, duplicate, link, read-back and one-post-per-blog-per-day gates as mandatory gates.

### Task 3: Add a traceable media contract

**Files:**
- Create: `packages/content-engine/topic-media.ts`
- Create: `scripts/generate-topic-media.ts`
- Create: `state/media-manifest.json`
- Modify: `scripts/auto-blogger.ts`
- Modify: `config/topics.json`
- Test: `tests/blogger/topic-media.test.ts`

- [ ] Write failing tests for a valid topic-specific illustration manifest, missing image brief/alt text, unsafe URL and duplicate asset identity.
- [ ] Generate a unique editorial SVG/PNG asset from each topic's approved image brief and title; no claims, logo imitation, QR code, price or registration syntax is rendered into the image.
- [ ] Store asset ID, topic ID, content hash, generated path, public URL, alt text and creation timestamp in the manifest.
- [ ] Require a manifest-backed image URL before Blogger publication; inject that URL and the approved alt text into sanitized HTML.
- [ ] Ensure publishing stops safely when the asset has not yet been deployed to the public primary-site domain.

### Task 4: Unify primary-site publishing with the evidence gates

**Files:**
- Modify: `.github/workflows/daily-publish.yml`
- Modify: `scripts/generate-content.js` or replace it with a typed evidence-gated worker
- Test: `tests/publishing/primary-site-policy.test.ts`

- [ ] Add tests that reject unsupported package claims, missing fact IDs, absent media manifests and missing agency code `GB` for active package CTA output.
- [ ] Remove direct publish behavior that allows an LLM response to introduce price, package conditions or SMS syntax outside the fact store.
- [ ] Commit only a verified release package, then rely on the existing deployment workflow; do not silently swallow failed pushes.
- [ ] Include release ID, used fact IDs, image asset ID and rollback commit in the workflow summary.

### Task 5: Complete operating evidence and observability

**Files:**
- Create: `docs/seo-aeo-operating-rules.md`
- Modify: `.github/workflows/daily-blogger.yml`
- Modify: `.github/workflows/daily-report.yml`
- Test: `tests/blogger/auto-blogger.test.ts`

- [ ] Document the five-channel charter, daily cadence, image provenance, source allowlist, fact expiry review, hold states, incident response and weekly review.
- [ ] Publish a concise GitHub job summary with site, topic, asset, source facts, gate results, live URL and recovery action.
- [ ] Add an expiry/queue-health report so the team learns about low queue depth or expiring facts before publication fails.
- [ ] Run the complete test suite, production build and static SEO audit; review the generated workflow summaries.

### Task 6: Integrate safely

**Files:**
- Modify only files produced by Tasks 1-5.

- [ ] Rebase the isolated branch on the latest committed `main`; do not absorb or overwrite uncommitted work in the main checkout.
- [ ] Resolve any conflict by preserving existing publish-read-back behavior and rerun tests.
- [ ] Commit each task separately and push only after full verification succeeds.
