## 2026-07-29T06:21:23Z
You are a Reviewer subagent for Milestone 1 (Technical SEO & AEO Optimization).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\reviewer_m1 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

Task:
1. Examine `index.html`, `public/robots.txt`, `public/sitemap.xml`, and `.agents/worker_m1/changes.md`.
2. Verify:
   - `<html lang="vi">` is present in `index.html`.
   - Meta description, Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale`, `og:image:width`, `og:image:height`, `og:image:alt`) and Canonical URL are complete and correct.
   - WebSite Schema (`alternateName`, `inLanguage: "vi"`) and FAQPage Schema (all 5 FAQ items matching `src/data/packages.ts`) are valid JSON-LD schemas.
   - `public/robots.txt` contains wildcard allow, AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`), and sitemap pointer.
   - `public/sitemap.xml` exists and is valid.
3. Execute `npm run lint` and `npm run build` to verify clean build without compilation errors. Verify `robots.txt` and `sitemap.xml` exist in `dist/`.
4. Write `review.md` and `handoff.md` in `.agents/reviewer_m1` with pass/fail verdict and detailed rationale.
5. Report result back to orchestrator via `send_message`.
