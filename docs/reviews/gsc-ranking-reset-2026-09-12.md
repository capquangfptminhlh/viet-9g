# GSC ranking reset — 2026-09-12

## Scope

This record captures the first-party Google Search Console evidence used to prioritize the 2026-09-12 ranking improvements for `https://www.tracuugoicuoc.com`.

- Property: `sc-domain:tracuugoicuoc.com`
- Search type: Web
- Settled-through date reported by Search Console: `2026-09-09`
- Primary analysis window: `2026-08-13` → `2026-09-09`
- Evidence source: connected Google Search Console property via GSC Wizard
- Website OS source: `capquangfptminhlh/seo-web@ef18d255150f3a77a7c7587feccf1ba7c419ad7b`
- Manifest: `governance/website-os.manifest.yml` v1.3.0

## Observed site-level signal

For the 28-day window, Search Console reported:

- 2 clicks
- 79 impressions
- 2.53% CTR
- average position 14.36

These figures show that technical PASS alone is not a ranking outcome. The current optimization decision is therefore based on query/page visibility and on-page quality rather than publishing quota.

## GSC-visible pages used for prioritization

The same 28-day window showed, among other rows:

| Page | Clicks | Impressions | Avg. position |
| --- | ---: | ---: | ---: |
| `/` | 1 | 17 | 23.18 |
| `/posts/cach-huy-goi-mxh120` | 0 | 1 | 10.00 |
| `/posts/cach-huy-goi-mxh120/` | 0 | 4 | 8.75 |
| `/posts/cach-kiem-tra-tai-khoan-chinh` | 0 | 2 | 4.00 |
| `/posts/cach-kiem-tra-tai-khoan-chinh/` | 0 | 5 | 21.60 |

A query/page row for `hủy mxh120` reached average position 3 with one impression on `/posts/cach-huy-goi-mxh120/`. Because the sample is extremely small, this is treated as directional evidence only, not as proof of stable Top 3 ranking.

## Cannibalization check

The first-party cannibalization analysis was run with `minImpressions=1` and returned no confirmed cannibalized queries for the observed window. Therefore this change set does **not** merge or delete ranking pages on the assumption of cannibalization.

## On-page findings used for this change set

A focused crawl of the homepage, package hub, and the two GSC-visible support guides identified the following actionable issues:

1. Organization structured data did not expose a `logo`.
2. Article structured data did not receive the article hero image from the post template.
3. The account-check article did not expose `datePublished` because its content file had no date metadata.
4. `/goi-cuoc` was comparatively thin and had a short generic title.
5. The homepage H1 existed only as visually hidden text instead of a visible topical heading.
6. The default Open Graph image path referenced `/og-image.jpg`, but that file is not present in `public/`.

## Decision

The ranking reset prioritizes:

- a visible homepage topic hierarchy and crawlable links to core package hubs;
- a stronger canonical `/goi-cuoc` hub rather than creating new thin landing pages;
- article-specific image/date metadata and explicit canonical owners;
- source-backed metadata for the account-check guide already receiving Search Console visibility;
- fixing the broken default social-image fallback;
- preserving existing ranking URLs unless later evidence supports a migration.

No search volume, keyword difficulty, CPC, traffic potential, conversion rate, or ranking guarantee is fabricated in this record. New article scaling remains subordinate to observed GSC/SERP evidence and Website OS K0 rules.