# Execution Plan: Viettel tracuugoicuoc.com Optimization

## Objective
Fully automate and implement technical SEO & AEO optimization, Mobile UX & performance enhancements, and Google Indexing API script automation for tracuugoicuoc.com.

## Milestones & Strategy

### Milestone 1: Technical SEO & AEO Optimization (M1)
- **Explorer Stage**: Examine `index.html`, package data/FAQ data, existing meta tags, structure.
- **Worker Stage**:
  - Update `index.html` with `<html lang="vi">`.
  - Add Meta Description, Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `zalo:official_account_id`), and Canonical URL (`https://tracuugoicuoc.com/`).
  - Embed valid JSON-LD Schema for `WebSite` and `FAQPage` in `index.html`.
  - Create `public/robots.txt` and `public/sitemap.xml`.
- **Reviewer & Challenger Stage**: Verify HTML syntax, JSON-LD Schema validity, and check that build places `robots.txt` and `sitemap.xml` in `dist/`.
- **Auditor Stage**: Forensic integrity audit.

### Milestone 2: Mobile UX & Performance Optimization (M2)
- **Explorer Stage**: Identify all static images (`.png`, `.jpg`, `.jpeg`, `.svg`), inspect `Header`, `PackageCard`, `FaqAccordion` components for mobile responsiveness and tap targets for SMS/Hotline/Zalo buttons.
- **Worker Stage**:
  - Convert static images to `.webp` (or generate webp versions) and update source references in code/CSS.
  - Fix Tailwind/CSS in `Header`, `PackageCard`, `FaqAccordion` for perfect mobile rendering.
  - Set tap target sizes (`min-h-[48px]`, `min-w-[48px]`, `py-3`, `px-4`, etc.) on interactive register/contact buttons (`Đăng ký`, `Hotline`, `Zalo`, SMS).
  - Verify `npm run build` succeeds without compilation errors.
- **Reviewer & Challenger Stage**: Check build logs, inspect CSS classes, verify 48px tap targets, verify webp loading.
- **Auditor Stage**: Forensic integrity audit.

### Milestone 3: Google Auto-Indexing Script & Documentation (M3)
- **Explorer Stage**: Analyze existing `scripts/auto-index.js` and dependencies.
- **Worker Stage**:
  - Implement/complete `scripts/auto-index.js` using Google Indexing API / `googleapis`.
  - Add missing file check for `service-account.json` with a helpful, clear error message.
  - Create `GOOGLE_INDEXING_SETUP.md` (or detailed guide in script/readme) documenting Service Account creation, Google Search Console ownership, Indexing API activation, and JSON key placement.
- **Reviewer & Challenger Stage**: Run `node scripts/auto-index.js` without key to verify clear error message; verify script logic.
- **Auditor Stage**: Forensic integrity audit.

## Execution Topology
- Parallel dispatches for initial exploration: Spawn Explorers for M1, M2, and M3.
- Sequential implementation execution per milestone with standard Explorer -> Worker -> Reviewer -> Challenger -> Auditor iteration loop.
