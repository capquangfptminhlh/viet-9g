# K0 Publishing Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the website and Blogger automations from publishing content unless an approved, non-fixture keyword-intelligence decision and an explicit canonical URL mapping exist.

**Architecture:** A small Node validator reads repository-owned research artifacts and an approval decision. Each publishing workflow invokes the validator before a generator; a failed gate stops the run without creating content or changing the ledger. Package catalogues are handled on their existing isolated branch and must provide source-backed typed facts before their routes can be merged.

**Tech Stack:** Node.js ESM, TypeScript, Vitest, GitHub Actions, Astro.

---

### Task 1: Define and test the K0 decision contract

**Files:**
- Create: `schemas/k0-decision.schema.json`
- Create: `tests/k0/k0-gate.test.ts`
- Create: `scripts/k0-keyword-intelligence-check.mjs`

- [x] **Step 1: Write failing tests** for a passing approved decision, a missing canonical mapping, and fixture markers such as `example.com`.
- [x] **Step 2: Run** `npx vitest run tests/k0/k0-gate.test.ts` and confirm it fails because the validator is absent.
- [x] **Step 3: Implement** the validator so it permits only an approved decision with one canonical URL per cluster and rejects fixture/reference-only data.
- [x] **Step 4: Re-run** the focused test and confirm it passes.

### Task 2: Gate automated publishing

**Files:**
- Modify: `.github/workflows/daily-publish.yml`
- Modify: `.github/workflows/daily-blogger.yml`
- Modify: `package.json`
- Test: `tests/k0/k0-gate.test.ts`

- [x] **Step 1: Add a failing workflow-source assertion** requiring `npm run k0:check` before each content generator.
- [x] **Step 2: Run** the focused test and confirm it fails.
- [x] **Step 3: Add** the `k0:check` script and workflow steps before the existing generators.
- [x] **Step 4: Re-run** the focused test and build checks.

### Task 3: Replace the fake daily pipeline PASS result

**Files:**
- Modify: `pipeline/daily.ts`
- Create: `tests/pipeline/daily-k0-gate.test.ts`

- [x] **Step 1: Write a failing test** proving a missing/failed K0 decision produces `FAILED`, not a fabricated `PASS` verification result.
- [x] **Step 2: Run** the focused test and confirm it fails.
- [x] **Step 3: Implement** K0 invocation in `init()` and make subsequent stages fail closed.
- [x] **Step 4: Run** the focused test and full `npm test`.

### Task 4: Verify integration readiness

**Files:**
- Modify: `docs/superpowers/plans/2026-08-07-k0-publishing-safety.md`

- [x] **Step 1: Run** `npm test` and `npm run build`.
- [x] **Step 2: Run** `npm run k0:check`; record the expected HOLD until authentic research is added.
- [x] **Step 3: Commit** only the K0 gate files on `codex/k0-integration`; do not merge the unrelated package-catalog worktree automatically.
