# Verified Package Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public package card and `/goi-cuoc/{id}/` page derive only from current, complete Viettel evidence and prevent incomplete packages from being indexed or offered for registration.

**Architecture:** A build-time `VerifiedPackage` model will replace the legacy `TelecomPackage` fallback projection for all public package consumers. The model is constructed from typed fact records, then drives routes, homepage props, package-page content, JSON-LD, and sitemap filtering. Unverified legacy routes remain buildable only as noindex unavailable pages, without price, SMS syntax, CTA, or Offer markup.

**Tech Stack:** Astro 5 static output, React 19, TypeScript, Zod, Vitest, `@astrojs/sitemap`, local SVG editorial assets.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/data/package-catalog.schema.ts` | Defines typed fact keys and evidence-linked registration data. |
| `src/data/package-catalog-runtime.ts` | Resolves facts and rejects expired, incomplete, or unsupported public offers. |
| `src/data/verified-package.ts` | Builds the single `VerifiedPackage` view model and legacy unavailable route data. |
| `src/data/package-routes.ts` | Creates valid and noindex legacy paths without stale fallbacks. |
| `src/data/package-media.ts` | Maps a verified package ID to a local, original illustration and Vietnamese alt text. |
| `src/data/package-schema.ts` | Creates factual BreadcrumbList, Product/Offer, and FAQPage JSON-LD. |
| `src/pages/index.astro`, `src/components/HomeApp.tsx` | Pass the build-time public package list to client components. |
| `src/components/PackageGrid.tsx`, `src/components/SmartRecommender.tsx`, `src/components/SimLookup.tsx` | Consume supplied verified packages instead of importing `VIETTEL_PACKAGES`. |
| `src/components/DynamicPostPage.tsx`, `src/components/PackageUnavailable.tsx` | Render a fact-gated page or a noindex unavailable page. |
| `src/pages/goi-cuoc/[id].astro`, `src/layouts/BaseLayout.astro`, `astro.config.mjs` | Apply robots/schema metadata and prevent unavailable package URLs from entering the sitemap. |
| `tests/catalog/verified-package.test.ts`, `tests/catalog/package-routes.test.ts`, `tests/catalog/package-schema.test.ts` | Cover public-offer gating, route behavior, and schema truthfulness. |

### Task 1: Define the evidence contract

**Files:**
- Modify: `src/data/package-catalog.schema.ts`
- Modify: `src/data/package-catalog-runtime.ts`
- Create: `tests/catalog/verified-package.test.ts`

- [ ] **Step 1: Write failing validation tests for the required public fields.**

```ts
it('does not make an active package public without price, duration, and data facts', () => {
  const catalog = fixtureCatalog({ factKeys: ['priceVnd', 'durationDays'] });
  expect(getVerifiedPackages(catalog, NOW)).toEqual([]);
});

it('does not expose registration when its fact reference is absent or expired', () => {
  const catalog = fixtureCatalog({ registrationFactExpired: true });
  expect(getVerifiedPackages(catalog, NOW)[0]?.registration).toBeUndefined();
});
```

- [ ] **Step 2: Run the new test and confirm the imports/functions do not yet exist.**

Run: `npx vitest run tests/catalog/verified-package.test.ts`

Expected: FAIL because `getVerifiedPackages` and the registration evidence field are absent.

- [ ] **Step 3: Add explicit fact keys and evidence-linked registration.**

```ts
export const PackageFactKeySchema = z.enum([
  'priceVnd', 'durationDays', 'dataAllowance', 'dataPerDay',
  'benefit', 'eligibility', 'checkingInstruction',
  'renewalInstruction', 'cancellationInstruction', 'registrationSyntax',
]);

export const PackageRegistrationSchema = z.object({
  syntax: z.string().min(1),
  smsNumber: z.literal(290),
  channel: z.literal('sms'),
  factId: z.string().min(1),
});
```

Require `priceVnd`, `durationDays`, and one of `dataAllowance`/`dataPerDay` for an indexable offer. Require the registration `factId` to be referenced by the package and current before exposing an SMS CTA. Keep `GB` valid only inside the cited registration fact.

- [ ] **Step 4: Implement current-fact lookup once in the runtime module.**

```ts
export function getCurrentFacts(pkg: PackageRecord, catalog: PackageCatalog, now: Date) {
  const facts = getFactMap(catalog, pkg);
  return pkg.factIds
    .map((id) => facts.get(id))
    .filter((fact): fact is CatalogFact => Boolean(fact))
    .filter((fact) => isOfficialSource(fact.sourceUrl))
    .filter((fact) => Date.parse(fact.effectiveAt) <= now.getTime())
    .filter((fact) => Date.parse(fact.expiresAt) > now.getTime());
}
```

The helper must never substitute values from `src/data/packages.ts`.

- [ ] **Step 5: Run validation tests.**

Run: `npx vitest run tests/catalog/package-catalog.test.ts tests/catalog/verified-package.test.ts`

Expected: PASS; malformed, expired, incomplete, and non-official facts are excluded.

- [ ] **Step 6: Commit the contract.**

```bash
git add src/data/package-catalog.schema.ts src/data/package-catalog-runtime.ts tests/catalog/verified-package.test.ts
git commit -m "feat(catalog): require complete evidence for public offers"
```

### Task 2: Build the normalized public package model

**Files:**
- Create: `src/data/verified-package.ts`
- Modify: `src/data/package-routes.ts`
- Modify: `packages/catalog/package-adapters.ts`
- Modify: `tests/catalog/package-routes.test.ts`
- Modify: `tests/catalog/package-adapters.test.ts`

- [ ] **Step 1: Replace tests that expect all 41 catalog records to be public.**

```ts
it('returns only complete current offers as indexable routes', () => {
  const routes = getPackageRoutes(fixtureCatalog());
  expect(routes.map((route) => route.id)).toEqual(['v120b']);
});

it('creates a noindex legacy route without a price or registration syntax', () => {
  const route = getLegacyPackageRoutes(fixtureCatalog()).find((item) => item.id === 'v160b');
  expect(route).toMatchObject({ indexable: false, reason: 'INCOMPLETE_EVIDENCE' });
  expect(route).not.toHaveProperty('offer');
});
```

- [ ] **Step 2: Run route and adapter tests and confirm their old expectations fail.**

Run: `npx vitest run tests/catalog/package-routes.test.ts tests/catalog/package-adapters.test.ts`

Expected: FAIL because the old adapter includes all non-retired records and uses zero/empty fallbacks.

- [ ] **Step 3: Add the focused public model.**

```ts
export type VerifiedPackage = {
  id: string; code: string; name: string; category: PackageCategory;
  priceVnd: number; durationDays: number; dataAllowance: string;
  dataPerDay?: string; benefits: string[]; eligibility: string[];
  registration?: { syntax: string; smsNumber: 290 };
  updatedAt: string; priceValidUntil: string; sourceUrl: string;
};

export function getVerifiedPackages(catalog: PackageCatalog, now = new Date()): VerifiedPackage[] {
  return getRenderablePackages(catalog, now)
    .map((pkg) => toVerifiedPackage(pkg, catalog, now))
    .filter((pkg): pkg is VerifiedPackage => pkg !== null);
}
```

`toVerifiedPackage` returns `null` for every missing required field; it never returns `0`, `''`, guessed benefits, or a generic SMS syntax.

- [ ] **Step 4: Replace public route creation and remove the stale adapter fallback from that path.**

```ts
export function getPackageRoutes(catalog = loadPackageCatalog(), now = new Date()) {
  return getVerifiedPackages(catalog, now);
}

export function getLegacyPackageRoutes(catalog = loadPackageCatalog(), now = new Date()) {
  const visible = new Set(getPackageRoutes(catalog, now).map(({ id }) => id));
  return catalog.packages.filter(({ id }) => !visible.has(id));
}
```

Delete `VIETTEL_PACKAGES`/legacy values from `package-routes.ts` and make `catalogToTelecomPackages` either delegate to `VerifiedPackage` or remove it after all callers migrate.

- [ ] **Step 5: Run focused tests.**

Run: `npx vitest run tests/catalog/verified-package.test.ts tests/catalog/package-routes.test.ts tests/catalog/package-adapters.test.ts`

Expected: PASS; no public route can contain `price: 0`, a blank duration, a blank allowance, or an uncited CTA.

- [ ] **Step 6: Commit the public model.**

```bash
git add src/data/verified-package.ts src/data/package-routes.ts packages/catalog/package-adapters.ts tests/catalog
git commit -m "feat(catalog): derive public routes from verified package facts"
```

### Task 3: Remove legacy package data from the homepage client tree

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/HomeApp.tsx`
- Modify: `src/components/PackageGrid.tsx`
- Modify: `src/components/SmartRecommender.tsx`
- Modify: `src/components/SimLookup.tsx`
- Create: `tests/catalog/home-package-source.test.ts`

- [ ] **Step 1: Write a source-boundary test.**

```ts
it('does not import the legacy package list from homepage components', () => {
  for (const file of HOME_COMPONENTS) {
    expect(readFileSync(file, 'utf8')).not.toMatch(/from ['"].*data\/packages/);
  }
});
```

- [ ] **Step 2: Run it and confirm the current imports fail.**

Run: `npx vitest run tests/catalog/home-package-source.test.ts`

Expected: FAIL for `HomeApp.tsx`, `PackageGrid.tsx`, `SmartRecommender.tsx`, and `SimLookup.tsx`.

- [ ] **Step 3: Load verified packages on the Astro server and pass them as props.**

```astro
---
import { getVerifiedPackages } from '../data/verified-package';
import { loadPackageCatalog } from '../data/package-catalog';
const packages = getVerifiedPackages(loadPackageCatalog());
---
<HomeApp packages={packages} client:load />
```

```ts
export default function HomeApp({ packages }: { packages: VerifiedPackage[] }) {
  const activePackage = packages.find(({ id }) => id === selectedPkgId) ?? null;
  return <PackageGrid packages={packages} /* existing callbacks */ />;
}
```

Pass the same array into the recommender and SIM lookup; preserve their existing interaction logic but never create a registration selection for a package outside this array.

- [ ] **Step 4: Make cards require the normalized fields.**

```ts
const dailyCost = Math.round(pkg.priceVnd / pkg.durationDays);
<span>{pkg.priceVnd.toLocaleString('vi-VN')}đ</span>
<span>/ {pkg.durationDays} ngày</span>
```

Delete conditional output that relied on blank legacy strings. A card has no “register” action when `pkg.registration` is absent.

- [ ] **Step 5: Run source and project tests.**

Run: `npx vitest run tests/catalog/home-package-source.test.ts tests/catalog`

Expected: PASS; homepage components no longer import `src/data/packages.ts`.

- [ ] **Step 6: Commit homepage data migration.**

```bash
git add src/pages/index.astro src/components/HomeApp.tsx src/components/PackageGrid.tsx src/components/SmartRecommender.tsx src/components/SimLookup.tsx tests/catalog/home-package-source.test.ts
git commit -m "fix(home): show only verified package offers"
```

### Task 4: Render indexable and unavailable package pages safely

**Files:**
- Modify: `src/pages/goi-cuoc/[id].astro`
- Modify: `src/components/DynamicPostPage.tsx`
- Create: `src/components/PackageUnavailable.tsx`
- Create: `tests/catalog/package-page-policy.test.ts`

- [ ] **Step 1: Write page policy tests against pure render helpers.**

```ts
it('renders visible SMS syntax only from an evidenced registration field', () => {
  expect(renderPackageFacts(verifiedV120B)).toContain('V120B GB gửi 290');
  expect(renderPackageFacts({ ...verifiedV120B, registration: undefined })).not.toContain('gửi 290');
});

it('does not inject generic renewal or cancellation statements', () => {
  expect(renderPackageFaq(verifiedV120B)).not.toMatch(/HUYDATA|tự động gia hạn/);
});
```

- [ ] **Step 2: Run the test and confirm the generic renderer fails it.**

Run: `npx vitest run tests/catalog/package-page-policy.test.ts`

Expected: FAIL because `DynamicPostPage.tsx` currently hardcodes `KTTK`, renewal, and `HUY/HUYDATA` text.

- [ ] **Step 3: Make static paths include an explicit page state.**

```ts
return [
  ...getPackageRoutes().map((pkg) => ({ params: { id: pkg.id }, props: { page: { kind: 'verified', pkg } } })),
  ...getLegacyPackageRoutes().map((pkg) => ({ params: { id: pkg.id }, props: { page: { kind: 'unavailable', pkg } } })),
];
```

Use `PackageUnavailable` for `kind: 'unavailable'`, with a factual explanation, a link to `/goi-cuoc/`, `robots="noindex,follow"`, and no commercial offer data.

- [ ] **Step 4: Replace generic prose with fact-gated sections.**

```tsx
{pkg.registration && <SmsSyntax syntax={pkg.registration.syntax} number={pkg.registration.smsNumber} />}
{pkg.checkingInstruction && <FactSection title="Kiểm tra ưu đãi" text={pkg.checkingInstruction} />}
{pkg.cancellationInstruction && <FactSection title="Hủy gói" text={pkg.cancellationInstruction} />}
```

Use the factual page title, actual `updatedAt`, direct summary table, source link, comparison slots, and local package image. Remove all universal claims about authorization, free SMS, renewal, cutoff, KTTK, `HUY`, `HUYDATA`, and 198 unless the model includes their cited facts.

- [ ] **Step 5: Run page-policy tests.**

Run: `npx vitest run tests/catalog/package-page-policy.test.ts tests/catalog/verified-package.test.ts`

Expected: PASS; an unavailable route has no price/CTA and a verified route only exposes cited instructions.

- [ ] **Step 6: Commit safe page rendering.**

```bash
git add src/pages/goi-cuoc/[id].astro src/components/DynamicPostPage.tsx src/components/PackageUnavailable.tsx tests/catalog/package-page-policy.test.ts
git commit -m "fix(package-page): gate copy and CTA on current facts"
```

### Task 5: Add truthful schema, local images, and sitemap exclusion

**Files:**
- Create: `src/data/package-media.ts`
- Create: `src/data/package-schema.ts`
- Create: `public/images/packages/v120b.svg`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/goi-cuoc/[id].astro`
- Modify: `astro.config.mjs`
- Create: `tests/catalog/package-schema.test.ts`

- [ ] **Step 1: Write schema tests.**

```ts
it('creates Product/Offer markup with the verified price and expiry only', () => {
  const schema = buildPackageSchemas(verifiedV120B, 'https://tracuugoicuoc.com/goi-cuoc/v120b');
  expect(schema).toEqual(expect.arrayContaining([
    expect.objectContaining({ '@type': 'Product', offers: expect.objectContaining({ price: '120000', priceCurrency: 'VND' }) }),
  ]));
  expect(JSON.stringify(schema)).not.toMatch(/InStock|aggregateRating|review/);
});
```

- [ ] **Step 2: Run schema tests and confirm they fail before the helper exists.**

Run: `npx vitest run tests/catalog/package-schema.test.ts`

Expected: FAIL because `buildPackageSchemas` and the media manifest are absent.

- [ ] **Step 3: Implement typed schema and media manifests.**

```ts
export function buildPackageSchemas(pkg: VerifiedPackage, canonicalUrl: string) {
  return [breadcrumbSchema(pkg, canonicalUrl), {
    '@context': 'https://schema.org', '@type': 'Product', name: `Gói ${pkg.code} Viettel`,
    brand: { '@type': 'Brand', name: 'Viettel' },
    offers: { '@type': 'Offer', price: String(pkg.priceVnd), priceCurrency: 'VND',
      priceValidUntil: pkg.priceValidUntil, url: canonicalUrl },
  }];
}
```

Each asset manifest entry contains `{ src, alt, width, height }`. Add only original editorial illustrations; do not create simulated app screenshots or use carrier logos.

- [ ] **Step 4: Extend the layout metadata contract.**

```astro
interface Props { title?: string; description?: string; robots?: string; structuredData?: Record<string, unknown>[]; }
const { robots, structuredData = [] } = Astro.props;
{robots && <meta name="robots" content={robots} />}
{structuredData.map((item) => <script type="application/ld+json" set:html={JSON.stringify(item)} />)}
```

Keep the existing WebSite JSON-LD. Do not emit `Organization` until a real legal owner/contact record is supplied.

- [ ] **Step 5: Exclude unavailable package paths from the sitemap.**

```ts
const indexablePackagePaths = new Set(getPackageRoutes().map(({ id }) => `/goi-cuoc/${id}`));
sitemap({ filter: (page) => !page.includes('/goi-cuoc/') || indexablePackagePaths.has(new URL(page).pathname.replace(/\/$/, '')) });
```

Normalize slash handling in the filter and add a build assertion that an unavailable ID is absent from `dist/sitemap-0.xml`.

- [ ] **Step 6: Run schema/unit/build verification.**

Run: `npx vitest run tests/catalog/package-schema.test.ts tests/catalog && npm run build`

Expected: PASS; `dist/goi-cuoc/v120b/index.html` has Product/Offer/BreadcrumbList and an image, while an incomplete package page has `noindex` and no Offer.

- [ ] **Step 7: Commit SEO metadata and media.**

```bash
git add src/data/package-media.ts src/data/package-schema.ts public/images/packages src/layouts/BaseLayout.astro src/pages/goi-cuoc/[id].astro astro.config.mjs tests/catalog/package-schema.test.ts
git commit -m "feat(seo): add factual package metadata and media"
```

### Task 6: Clean public disclosures and production data

**Files:**
- Modify: `data/package-catalog.v1.json`
- Modify: `src/components/Footer.tsx`
- Modify: `src/pages/ve-chung-toi.astro`
- Create: `tests/catalog/public-copy-policy.test.ts`

- [ ] **Step 1: Write a copy-policy test for prohibited claims and malformed offers.**

```ts
const prohibited = [/Gói súp lơ/i, /Vua của/i, /Vũ khí tối thượng/i, /cáp quang Wifi/i, /đại lý ủy quyền/i, /đại lý ủy thác/i];
for (const pattern of prohibited) expect(publicCopy).not.toMatch(pattern);
expect(publicCopy).not.toMatch(/0đ\/|GB gửi 290/);
```

- [ ] **Step 2: Run the test and confirm the current catalogue/footer fails.**

Run: `npx vitest run tests/catalog/public-copy-policy.test.ts`

Expected: FAIL due to legacy descriptions and authorization language.

- [ ] **Step 3: Migrate only independently evidenced package facts.**

For each public package, add the required typed fact records with current official Viettel source URLs and expiry dates. Set every package without all required facts to `hold`; do not retain a public description or a registration object as a substitute for missing evidence. Preserve `GB` only in a registration fact that supports the exact syntax.

- [ ] **Step 4: Replace disclosures with the narrow factual statement.**

```text
TraCuuGoiCuoc.com là kênh giới thiệu/CTV độc lập, không phải website do Viettel Telecom sở hữu.
Thông tin và khả năng đăng ký gói phụ thuộc vào hệ thống Viettel tại thời điểm khách hàng thực hiện.
```

Do not state “ủy quyền”, “ủy thác”, “được cấp phép”, a Viettel office address, or “không thu phí” unless the site owner supplies written evidence for that exact claim.

- [ ] **Step 5: Run production data checks.**

Run: `npm run validate:catalog && npx vitest run tests/catalog/public-copy-policy.test.ts tests/catalog && npm run build`

Expected: PASS; only complete current offers are in the built sitemap and no prohibited claim remains in the built public package files.

- [ ] **Step 6: Commit the data and disclosure cleanup.**

```bash
git add data/package-catalog.v1.json src/components/Footer.tsx src/pages/ve-chung-toi.astro tests/catalog/public-copy-policy.test.ts
git commit -m "fix(seo): remove unsupported package and authority claims"
```

### Task 7: Final regression and deployment check

**Files:**
- Modify only if the checks reveal a defect in files above.

- [ ] **Step 1: Run the full automated suite.**

Run: `npm test && npm run build && git diff --check`

Expected: all tests pass, Astro check/build succeeds, and no whitespace errors are reported.

- [ ] **Step 2: Inspect generated public evidence.**

Run: `rg -n "0đ/|Gói súp lơ|Vua của|Vũ khí tối thượng|đại lý ủy quyền|đại lý ủy thác" dist && rg -n "V160B|v160b" dist/sitemap-0.xml`

Expected: both commands return exit code 1. Then inspect `dist/goi-cuoc/v120b/index.html` for the visible SMS syntax, actual date, local image, canonical URL, and JSON-LD.

- [ ] **Step 3: Push only the verified commits.**

```bash
git status --short
git push origin HEAD:main
```

Expected: clean worktree and a successful fast-forward push.

