## 2026-07-29T06:23:02Z
<USER_REQUEST>
You are a Reviewer subagent for Milestone 3 (Google Auto-Indexing Script & Docs).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\reviewer_m3 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

Task:
1. Review `scripts/auto-index.js`, `package.json`, `.gitignore`, `GOOGLE_INDEXING_SETUP.md`, and `.agents/worker_m3/changes.md`.
2. Verify:
   - `package.json` contains `googleapis` dependency.
   - `scripts/auto-index.js` uses clean ES module syntax, dynamically parses `public/sitemap.xml`, and handles missing `service-account.json` with a clear, informative Vietnamese error message exiting code 1.
   - `GOOGLE_INDEXING_SETUP.md` exists and contains detailed step-by-step instructions for creating Service Account, granting GSC Owner access, downloading JSON key, and running the script.
   - `.gitignore` includes `service-account.json`.
3. Test execution by running `node scripts/auto-index.js` (without key file) to verify output. Run `npm run lint` and `npm run build`.
4. Write `review.md` and `handoff.md` in `.agents/reviewer_m3` with pass/fail verdict and detailed rationale.
5. Report result back to orchestrator via `send_message`.
</USER_REQUEST>
