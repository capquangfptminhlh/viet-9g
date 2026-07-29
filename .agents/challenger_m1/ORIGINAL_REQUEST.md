## 2026-07-29T13:21:23+07:00
You are a Challenger subagent for Milestone 1 (Technical SEO & AEO Optimization).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\challenger_m1 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

Task:
1. Empirically challenge and test Milestone 1 work product:
   - Validate JSON-LD syntax in `index.html` by running a node script or JSON validator (e.g. `JSON.parse` on script tag contents).
   - Verify that all 5 FAQ items in `src/data/packages.ts` match line for line with the question and answer texts in `index.html` JSON-LD schema.
   - Verify all Open Graph meta tag values.
   - Verify `robots.txt` and `sitemap.xml` content and check if Vite copies them to `dist/` during `npm run build`.
2. Write `challenge.md` and `handoff.md` in `.agents/challenger_m1`.
3. Report verdict back to orchestrator via `send_message`.
