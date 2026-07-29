# Project: Viettel tracuugoicuoc.com Optimization & Automation

## Architecture
- **Frontend Stack**: Vite + React + TypeScript + Tailwind CSS
- **Target Website**: `tracuugoicuoc.com` (Viettel Affiliate Package Lookup)
- **Key Directories**:
  - `src/`: React source code, components (`Header`, `PackageCard`, `FaqAccordion`, etc.)
  - `public/`: Static assets (`robots.txt`, `sitemap.xml`, images)
  - `scripts/`: Node.js scripts (`auto-index.js`)
  - `dist/`: Build output folder

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | SEO & AEO Technical Optimization | `<html lang="vi">`, Meta tags, Open Graph, Canonical URL, JSON-LD Schema (WebSite & FAQPage), `public/robots.txt`, `public/sitemap.xml` | None | DONE |
| M2 | Mobile UX & Performance Optimization | WebP image conversion, `Header`, `PackageCard`, `FaqAccordion` CSS/Tailwind mobile styling, >= 48px tap targets for SMS/Hotline/Zalo, `npm run build` verification | M1 | DONE |
| M3 | Google Auto-Indexing Script & Docs | `scripts/auto-index.js` logic completion, `service-account.json` error handling, Service Account setup documentation | None | DONE |

## Code Layout & Conventions
- HTML metadata & schemas in `index.html`
- Static public assets in `public/`
- React UI components in `src/components/`
- Utility scripts in `scripts/`
- All build artifacts verified landing in `dist/` via Vite build process.
