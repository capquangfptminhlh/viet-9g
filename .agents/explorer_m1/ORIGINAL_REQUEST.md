## 2026-07-29T06:19:22Z
You are an Explorer subagent for Milestone 1 (Technical SEO & AEO Optimization).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m1 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

Task:
1. Examine `index.html`, `public/`, `src/` to see current SEO tags, HTML lang attribute, Open Graph tags, canonical link, and existing schemas.
2. Check existing FAQ items and WebSite details in the code to construct accurate JSON-LD schemas for WebSite and FAQPage.
3. Check `public/` directory for existing or missing `robots.txt` and `sitemap.xml`.
4. Create your metadata directory `.agents/explorer_m1` and write `analysis.md` and `handoff.md` detailing:
   - Current status of `index.html`
   - Precise HTML edits needed for `<html lang="vi">`, Meta description, Open Graph (Facebook/Zalo tags), Canonical URL
   - Precise JSON-LD WebSite and FAQPage schema structures
   - Exact content needed for `public/robots.txt` and `public/sitemap.xml`
5. Report completion back to orchestrator via `send_message`.
Note: Read files using `view_file` or `grep_search`. Do not edit source code directly. Write your analysis into `.agents/explorer_m1/handoff.md`.
