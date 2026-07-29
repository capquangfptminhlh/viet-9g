# BRIEFING — 2026-07-29T13:21:12+07:00

## Mission
Implement Milestone 1 Technical SEO & AEO Optimization for tracuugoicuoc.com

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\worker_m1
- Original parent: 67e52107-e61d-4384-ba30-d255cd8a88f6
- Milestone: Milestone 1 (Technical SEO & AEO Optimization)

## 🔒 Key Constraints
- Genuine implementation, no cheating or fake outputs.
- Minimal change principle.
- Verify build, JSON-LD validity, and FAQ synchronization.

## Current Parent
- Conversation ID: 67e52107-e61d-4384-ba30-d255cd8a88f6
- Updated: 2026-07-29T13:21:12+07:00

## Task Summary
- **What to build**: 
  1. `<html lang="vi">` confirmation/fix in `index.html`.
  2. Full Meta Description, Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale`, `og:image:width`, `og:image:height`, `og:image:alt`) and Canonical URL in `index.html`.
  3. JSON-LD Schemas in `index.html`: WebSite Schema (`alternateName`, `inLanguage: "vi"`), FAQPage Schema synced 100% with `src/data/packages.ts` (5 FAQs).
  4. `public/robots.txt` with wildcard allow, AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`), sitemap directive.
  5. `public/sitemap.xml` for `https://tracuugoicuoc.com/`.
- **Success criteria**: Valid HTML/JSON-LD, full SEO/AEO tags, clean build & tests passing.

## Change Tracker
- **Files modified**: `index.html`, `public/robots.txt`, `public/sitemap.xml`
- **Build status**: Pass (`npm run build` succeeded)
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (`npm run lint` & `verify_m1.js` passed)
- **Lint status**: 0 errors
- **Tests added/modified**: `.agents/worker_m1/verify_m1.js`

## Loaded Skills
- None

## Key Decisions Made
- FAQPage schema text matched `src/data/packages.ts` 100%.

## Artifact Index
- `.agents/worker_m1/ORIGINAL_REQUEST.md` — Original request
- `.agents/worker_m1/BRIEFING.md` — Briefing document
- `.agents/worker_m1/progress.md` — Progress tracker
- `.agents/worker_m1/changes.md` — Detailed list of modifications
- `.agents/worker_m1/handoff.md` — Handoff report
- `.agents/worker_m1/verify_m1.js` — Automated verification script
