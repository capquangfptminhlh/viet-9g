# Challenge Report — Milestone 1 (Technical SEO & AEO Optimization)

## Challenge Summary

**Overall risk assessment**: LOW

The Milestone 1 work product meets all technical requirements for Technical SEO & AEO Optimization. Automated parsing of JSON-LD schemas in `index.html` succeeds without syntax errors, all 5 FAQ items match `src/data/packages.ts` character-for-character, all Open Graph / Twitter meta tags are properly structured, and Vite correctly bundles `robots.txt` and `sitemap.xml` to `dist/`.

One minor issue was discovered during empirical asset validation: `public/og-image.jpg` referenced by `<meta property="og:image">` does not physically exist in the `public/` folder, which could cause a 404 when social media crawlers attempt to fetch the preview card thumbnail.

---

## Challenges & Attack Surface

### [Low Risk] Challenge 1: Missing Physical Image Asset `public/og-image.jpg`

- **Assumption challenged**: Meta tag `<meta property="og:image" content="https://tracuugoicuoc.com/og-image.jpg" />` points to a reachable social media preview image.
- **Attack scenario**: When links are shared on Zalo, Facebook, or X/Twitter, crawlers fetch `https://tracuugoicuoc.com/og-image.jpg` and receive HTTP 404, resulting in a blank or fallback preview card.
- **Blast radius**: Low (SEO/AEO schema works; only visual thumbnail on social media sharing is affected).
- **Mitigation**: Create or place `og-image.jpg` (1200x630px) inside `public/`.

---

## Stress Test Results

| # | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| 1 | JSON-LD syntax validation (`index.html`) | Valid JSON string for `WebSite` & `FAQPage` script blocks | Both blocks pass `JSON.parse()` without error | **PASS** |
| 2 | FAQ 1-to-1 content alignment (`src/data/packages.ts` vs `index.html`) | All 5 questions and answers match line-for-line | 5/5 questions & answers match 100% | **PASS** |
| 3 | Open Graph meta tags validation | `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:site_name`, `og:locale`, `og:image:width`, `og:image:height`, `og:image:alt` match specified values | All 10 meta tags present and match expected values | **PASS** |
| 4 | Twitter meta tags validation | `twitter:card`, `twitter:url`, `twitter:title`, `twitter:description` present | All 4 Twitter tags present and match expected values | **PASS** |
| 5 | AI/AEO Crawlers in `robots.txt` | Allows `*`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, specifies `Sitemap` | All crawler user-agents explicitly allowed with Sitemap directive | **PASS** |
| 6 | Sitemap XML structure | Valid XML schema with loc `https://tracuugoicuoc.com/` | `public/sitemap.xml` has valid structure and location | **PASS** |
| 7 | Vite production build output | `dist/` created, containing `robots.txt` and `sitemap.xml` identical to `public/` | `npm run build` completed cleanly; `dist/robots.txt` and `dist/sitemap.xml` exist and match `public/` files | **PASS** |
| 8 | Social Preview Image file existence | `public/og-image.jpg` exists in file system | `public/og-image.jpg` does not exist on disk | **FAIL (Minor)** |

---

## Unchallenged Areas

- Server-side runtime HTTP header configurations (e.g. `X-Robots-Tag`, HSTS, CSP headers) — Out of scope for static SPA Vite build.
