# Editorial Consolidation and Package Hubs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build crawlable package/category hubs and a measured content disposition process that reduces duplication without losing useful pages or making unsupported redirects.

**Architecture:** A build-time content inventory records facts about each Markdown post. Category hubs draw their package cards from `VerifiedPackage`, while a maintained article-link map connects guides only to relevant active packages. Redirect work is separated from content cleanup because the current GitHub Pages host cannot emit HTTP 301 responses.

**Tech Stack:** Astro 5 static output, TypeScript, Astro content collections, Vitest, generated JSON/Markdown review artifacts.

---

## File structure

| File | Responsibility |
| --- | --- |
| `scripts/audit-editorial-content.ts` | Produces a deterministic inventory of post words, headings, canonical, title, image, links, and CTA terms. |
| `src/data/editorial-links.ts` | Holds vetted guide-to-package relation data; invalid/non-public packages are filtered at build time. |
| `src/data/package-hubs.ts` | Defines factual category labels, descriptions, and eligible package grouping. |
| `src/pages/goi-cuoc/index.astro` | Package hub page. |
| `src/pages/goi-cuoc/[category].astro` | Category hub page for `data`, `social`, `combo`, `5g`, and `chu-ky-dai`. |
| `src/components/PackageHub.tsx` | Displays a category's verified packages and a comparison table. |
| `src/pages/posts/[slug].astro` | Displays only validated contextual links and no CTA for unsupported old package mentions. |
| `docs/reviews/editorial-content-inventory.json` | Versioned audit result for editorial decisions. |
| `docs/reviews/url-disposition.csv` | Owner-reviewed source URL, target, intent, and action record. |
| `tests/content/editorial-audit.test.ts`, `tests/content/editorial-links.test.ts`, `tests/catalog/package-hubs.test.ts` | Verify audit output, link validity, and category output. |

### Task 1: Make the editorial audit reproducible

**Files:**
- Create: `scripts/audit-editorial-content.ts`
- Create: `tests/content/editorial-audit.test.ts`
- Create: `docs/reviews/editorial-content-inventory.json`

- [ ] **Step 1: Write a fixture-based audit test.**

```ts
it('reports word count, headings, image count, CTA terms, and canonical intent for every post', () => {
  const report = auditMarkdown('# Title\n\nText about V120B GB gửi 290.');
  expect(report).toMatchObject({ wordCount: 6, headings: ['Title'], imageCount: 0, packageCodes: ['V120B'] });
});
```

- [ ] **Step 2: Run it before implementing the script.**

Run: `npx vitest run tests/content/editorial-audit.test.ts`

Expected: FAIL because the audit module does not exist.

- [ ] **Step 3: Implement deterministic Markdown inspection.**

```ts
export type EditorialAudit = {
  slug: string; title: string; wordCount: number; headings: string[];
  imageCount: number; outboundLinks: string[]; packageCodes: string[];
  hasRegistrationCta: boolean;
};
```

Read `src/content/posts/*.md`, parse only local content, sort by slug, and write UTF-8 JSON. Do not classify a page “thin” from its excerpt; report measurements for human review.

- [ ] **Step 4: Generate and commit the first inventory.**

Run: `npx tsx scripts/audit-editorial-content.ts`

Expected: `docs/reviews/editorial-content-inventory.json` contains exactly one sorted record for each Markdown post.

- [ ] **Step 5: Commit the audit system.**

```bash
git add scripts/audit-editorial-content.ts tests/content/editorial-audit.test.ts docs/reviews/editorial-content-inventory.json
git commit -m "feat(content): add reproducible editorial inventory"
```

### Task 2: Add fact-bound guide-to-package links

**Files:**
- Create: `src/data/editorial-links.ts`
- Modify: `src/pages/posts/[slug].astro`
- Create: `tests/content/editorial-links.test.ts`

- [ ] **Step 1: Write failing link-integrity tests.**

```ts
it('links a guide only to current verified package IDs', () => {
  const links = getGuidePackageLinks('cach-kiem-tra-tai-khoan-chinh', verifiedPackages);
  expect(links.every(({ href }) => href.startsWith('/goi-cuoc/'))).toBe(true);
  expect(links.map(({ href }) => href)).not.toContain('/goi-cuoc/st90k');
});
```

- [ ] **Step 2: Run the test before introducing the map.**

Run: `npx vitest run tests/content/editorial-links.test.ts`

Expected: FAIL because `getGuidePackageLinks` does not exist.

- [ ] **Step 3: Add a small, explicit relation map and a filtering helper.**

```ts
const GUIDE_LINKS: Record<string, string[]> = {
  'cach-kiem-tra-tai-khoan-chinh': ['v120b', 'sd120'],
  'cach-huy-gia-han-4g-viettel': ['v120b', 'mxh120'],
};
export function getGuidePackageLinks(slug: string, packages: VerifiedPackage[]) {
  const byId = new Map(packages.map((pkg) => [pkg.id, pkg]));
  return (GUIDE_LINKS[slug] ?? []).flatMap((id) => byId.has(id) ? [{ href: `/goi-cuoc/${id}`, label: byId.get(id)!.name }] : []);
}
```

- [ ] **Step 4: Render a related-package block below post content.**

Use server-loaded verified packages and the helper. The block must not add SMS syntax, price, or a “register” CTA to an old post; it links to the verified package page that owns those facts.

- [ ] **Step 5: Run link tests and build.**

Run: `npx vitest run tests/content/editorial-links.test.ts && npm run build`

Expected: PASS; links to held/retired/unknown packages do not appear in generated post pages.

- [ ] **Step 6: Commit contextual linking.**

```bash
git add src/data/editorial-links.ts src/pages/posts/[slug].astro tests/content/editorial-links.test.ts
git commit -m "feat(content): add verified contextual package links"
```

### Task 3: Build package hubs and comparison views

**Files:**
- Create: `src/data/package-hubs.ts`
- Create: `src/components/PackageHub.tsx`
- Create: `src/pages/goi-cuoc/index.astro`
- Create: `src/pages/goi-cuoc/[category].astro`
- Create: `tests/catalog/package-hubs.test.ts`

- [ ] **Step 1: Write category selection tests.**

```ts
it('exposes only verified packages in the 5G hub', () => {
  expect(getHubPackages('5g', verifiedPackages).map(({ code }) => code)).toEqual(['5G135', '5G150']);
});

it('does not generate a category path for unknown categories', () => {
  expect(getHubStaticPaths(verifiedPackages).map(({ params }) => params.category)).not.toContain('unknown');
});
```

- [ ] **Step 2: Run hub tests before implementation.**

Run: `npx vitest run tests/catalog/package-hubs.test.ts`

Expected: FAIL because the hub module does not exist.

- [ ] **Step 3: Define fixed hub categories and public grouping.**

```ts
export const HUBS = {
  data: { title: 'Gói data Viettel', categories: ['data'] },
  'mang-xa-hoi': { title: 'Gói mạng xã hội Viettel', categories: ['social'] },
  combo: { title: 'Gói combo data và thoại Viettel', categories: ['combo'] },
  '5g': { title: 'Gói 5G Viettel', codes: [/^5G/] },
  'chu-ky-dai': { title: 'Gói chu kỳ dài Viettel', categories: ['long_term'] },
} as const;
```

`getHubPackages` receives `VerifiedPackage[]`; it never reads the catalogue or legacy list directly.

- [ ] **Step 4: Render a factual table and ItemList/BreadcrumbList.**

Each row has package name, verified price, validity, allowance, and link. The comparison uses only columns that every listed package has. The hub has no universal SMS/renewal/cancellation claim.

- [ ] **Step 5: Run hub tests and build.**

Run: `npx vitest run tests/catalog/package-hubs.test.ts && npm run build`

Expected: PASS; generated hub pages list only verified packages and expose valid ItemList/BreadcrumbList JSON-LD.

- [ ] **Step 6: Commit package hubs.**

```bash
git add src/data/package-hubs.ts src/components/PackageHub.tsx src/pages/goi-cuoc/index.astro src/pages/goi-cuoc/[category].astro tests/catalog/package-hubs.test.ts
git commit -m "feat(seo): add verified package hubs and comparisons"
```

### Task 4: Create an owner-reviewed URL disposition process

**Files:**
- Create: `docs/reviews/url-disposition.csv`
- Create: `scripts/validate-url-disposition.ts`
- Create: `tests/content/url-disposition.test.ts`

- [ ] **Step 1: Write CSV validation tests.**

```ts
it('rejects a redirect disposition without a live source, exact target, and matching intent', () => {
  expect(() => validateDisposition([{ source: '/posts/a', action: '301', target: '', intentMatch: false }])).toThrow(/target|intent/i);
});
```

- [ ] **Step 2: Run it before the validator exists.**

Run: `npx vitest run tests/content/url-disposition.test.ts`

Expected: FAIL because `validateDisposition` does not exist.

- [ ] **Step 3: Add the exact CSV contract.**

```csv
source,status,canonical,action,target,intentMatch,ownerApproved,notes
/posts/esim-viettel-co-dung-duoc-4g-khong,200,/posts/esim-viettel-ho-tro-4g-5g,review,,,false,Requires rendered-content review
```

Allowed actions are `keep`, `improve`, `canonicalize`, `noindex`, and `301`. A `301` row requires a non-empty target, `intentMatch=true`, and `ownerApproved=true`.

- [ ] **Step 4: Implement validation without emitting fake redirects.**

```ts
if (row.action === '301' && (!row.target || row.intentMatch !== 'true' || row.ownerApproved !== 'true')) {
  throw new Error(`invalid 301 disposition for ${row.source}`);
}
```

Do not create `meta refresh`, client-side redirect code, or a `_redirects` file: GitHub Pages cannot return an HTTP 301. On the current host, an owner-approved duplicate may use canonical/noindex only. A real 301 requires a later deployment decision to Cloudflare/Vercel/server hosting.

- [ ] **Step 5: Run disposition validation.**

Run: `npx vitest run tests/content/url-disposition.test.ts && npx tsx scripts/validate-url-disposition.ts`

Expected: PASS; the committed file has no `301` row until an HTTP-redirect-capable host is authorized.

- [ ] **Step 6: Commit the migration guard.**

```bash
git add docs/reviews/url-disposition.csv scripts/validate-url-disposition.ts tests/content/url-disposition.test.ts
git commit -m "docs(seo): gate URL consolidation on verified intent"
```

### Task 5: Perform full verification and publish the audit artifacts

**Files:**
- Modify only evidence/source files whose verification is complete.

- [ ] **Step 1: Regenerate the inventory and validate the disposition record.**

Run: `npx tsx scripts/audit-editorial-content.ts && npx tsx scripts/validate-url-disposition.ts`

Expected: inventory changes only when post content changes; disposition validation passes.

- [ ] **Step 2: Run the full project verification.**

Run: `npm test && npm run build && git diff --check`

Expected: all tests and build succeed with no whitespace errors.

- [ ] **Step 3: Inspect static output for safe linking.**

Run: `rg -n "href=\"/goi-cuoc/(st90k|fb7|fb30|yt1|1n)" dist/posts dist/goi-cuoc`

Expected: exit code 1 unless that package has subsequently become a verified public offer.

- [ ] **Step 4: Push reviewed commits.**

```bash
git status --short
git push origin HEAD:main
```

Expected: clean worktree and successful push.

