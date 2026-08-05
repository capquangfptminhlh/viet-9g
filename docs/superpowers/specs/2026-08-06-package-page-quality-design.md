# Package pages: factual quality and search coverage

**Status:** proposed for review  
**Date:** 2026-08-06  
**Scope:** `tracuugoicuoc.com` package catalogue, package pages, and their SEO data.

## Goal

Every indexable package URL must be a useful, evidence-backed landing page. A
visitor and a crawler must see the same complete package information: current
price, validity, allowance, verified SMS syntax where available, an actual
update date, relevant comparison/guide links, and a unique editorial image.

The system must never publish a card, package page, sitemap entry, registration
CTA, or Offer schema with missing, expired, or unsupported package data.

## Verified current state

- Individual routes already exist (for example `/goi-cuoc/v120b/`), so this is
  an upgrade of their data quality and SEO rather than a new routing feature.
- The legacy adapter falls back to `0` or empty strings. This causes the live
  V160B page to show `0 đ`, empty duration/data, and an incomplete SMS command.
- The current page renderer injects generic sales copy and generic cancellation,
  renewal, and balance-checking claims into every package page. Those claims
  are not necessarily supported for every package.
- Current cards and pages have no editorial images, no package Product/Offer,
  BreadcrumbList, or Organization structured data, and weak contextual links.

## Chosen architecture

Use the validated catalogue as the sole source of public package information.
The legacy `src/data/packages.ts` may remain for compatibility but must not be
a factual fallback for an indexable page.

```text
catalogue facts + package record
  -> source/expiry/field validation
  -> normalized RenderablePackage model
  -> cards, routes, sitemap, CTA, article links, schema, page content
```

`src/data/package-catalog-runtime.ts` already provides the foundation with
`getRenderablePackages`. The change will make all public consumers use a
single stricter model instead of `package-adapters.ts` filling absent values
from stale fallback data.

### Publication states

| Evidence and state | Card / sitemap / index | Page and CTA |
| --- | --- | --- |
| Active or eligibility-required package with current official facts and all displayed fields | Yes | Render factual page. Show registration SMS only when the syntax is a current verified fact. |
| Current facts but subscriber eligibility is unknown | Yes | Explain eligibility factually; do not promise successful registration. |
| Missing field, expired fact, unsupported source, or incomplete registration syntax | No | No package card, sitemap entry, indexable route, Offer schema, or registration CTA. A legacy URL returns a noindex unavailable page with links to current packages. |
| Retired package | No | Noindex unavailable page; no CTA or schema. |

This prevents `0đ`, blank benefits, or `PACKAGE GB gửi 290` from reaching the
public site while avoiding misleading replacement content at old URLs.

## Package-page contract

The normalized `RenderablePackage` model will require, before a page is
indexable:

- package ID, title, status, official current source and real `updatedAt`;
- numeric VND price, duration in days, and at least one data/allowance field;
- only benefit, renewal, checking, cancellation, and registration statements
  that map to a non-expired, official fact record;
- a validated target path and referral URL. The existing agency code `GB` is
  preserved only in registration syntax that is actually verified by the fact
  record; it is never appended speculatively.

The renderer will replace superlative/fictional copy with a factual page
structure:

1. direct summary and actual update date;
2. package facts table and visible plain-text SMS syntax, if verified;
3. who it may suit, eligibility and important limitations, each fact-gated;
4. a comparison table of other currently renderable packages in the same
   category/price band;
5. contextual links to verified help articles (checking allowance, cancellation
   or My Viettel) only when relevant;
6. a concise FAQ whose answers are fact-bound.

No generic claim such as “authorized Viettel agent”, universal auto-renewal,
or a universal `HUY/HUYDATA` instruction may be rendered. The site will state
only that it is an independent referral/CTV channel if that statement is true;
it will not claim authorization without written evidence. Legal owner/contact
details are an external business input and must not be invented.

## Components and responsibilities

| Location | Responsibility after change |
| --- | --- |
| `src/data/package-catalog-runtime.ts` | Validate official fact source/expiry and build the eligible public package set. |
| `src/data/package-routes.ts` | Create routes only for valid public packages; recognize legacy unavailable IDs without restoring stale data. |
| `packages/catalog/package-adapters.ts` (or a focused replacement module) | Construct the normalized model. It must throw/reject incomplete published data rather than supply `0` or blank defaults. |
| `src/pages/goi-cuoc/[id].astro` | Render valid package pages or a `noindex` unavailable page; remove mock configuration wording. |
| `src/components/DynamicPostPage.tsx` | Render factual page blocks from the model, linked help/comparison content, image, and package-specific disclaimers. |
| package grid/card and sitemap builders | Consume the same public package set, so cards, routes, and sitemap cannot disagree. |
| layout/schema helper | Emit canonical URL, BreadcrumbList, Organization, Product and Offer only when the model is eligible. |
| `src/pages/ve-chung-toi.astro` and footer | Use accurate independent-CTV disclosure and avoid unsubstantiated authorization language. |

## Structured data and media

For an eligible package page, emit factual JSON-LD only:

- `BreadcrumbList` for Home → Packages → package;
- `Product` with an `Offer` containing the verified VND price and URL;
- `Organization` site identity on site-level pages;
- `FAQPage` only for the visible, factual FAQ.

There will be no ratings, availability, seller status, checkout promise, or
other merchant claim that the site cannot prove. FAQ markup remains useful
semantic documentation, but it is not treated as a promise of a Google FAQ
rich result; Google now generally limits that treatment to authoritative
government and health sites.

Each eligible package receives an original editorial illustration in a local
media manifest, with a descriptive Vietnamese alt text. These illustrations
must not impersonate a Viettel UI, include invented screenshots, or use the
Viettel logo without rights. The image pipeline produces deterministic local
assets for the main site; Blogger content keeps its separate media workflow.

## Data remediation boundary

The code will not invent missing package facts. A package remains unavailable
until its catalogue records contain all required fields, an official Viettel
source URL, and an unexpired `expiresAt`. Existing reliable content may stay
published only when it satisfies the same model.

Updating the full operator catalogue is a separate content/data operation:
each package must be independently evidenced before it can join the public
set. This change makes that operational rule technically enforceable.

## Verification

Automated coverage will prove:

- a package with a missing price, duration, allowance, source, or expiry cannot
  become a route, card, sitemap entry, CTA, or Offer;
- verified `GB` registration syntax survives unchanged, while unsupported SMS
  syntax does not render;
- expired/non-official facts are excluded;
- package pages do not contain banned legacy superlatives or generic
  cancellation/renewal language without supporting facts;
- valid pages expose an actual date, visible verified syntax, contextual links,
  image/alt text, canonical URL, and truthful JSON-LD;
- legacy incomplete IDs yield a noindex unavailable response without `0đ` or
  blank fields.

After tests and the production build pass, the deployed site will be checked
for a valid and an unavailable package URL, schema JSON-LD, sitemap contents,
and absence of the confirmed bad phrases. Google Rich Results Test can then be
used on a live eligible page; eligibility is not a guarantee of a rich result.

## Non-goals

- No simulated visits, clicks, or traffic manipulation.
- No fabricated customer reviews, prices, eligibility, screenshots, or carrier
  authority claims.
- No automatic publication of unverified catalogue entries.

