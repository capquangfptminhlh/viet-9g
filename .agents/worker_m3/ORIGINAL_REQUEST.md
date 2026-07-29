## 2026-07-29T13:21:03Z

<USER_REQUEST>
You are a Worker subagent for Milestone 3 (Google Auto-Indexing Script & Setup Guide).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\worker_m3 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task:
Read Explorer M3 handoff report at D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m3\handoff.md and analysis report at D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m3\analysis.md.

Execute all Milestone 3 tasks:
1. Add `"googleapis": "^144.0.0"` to `package.json` dependencies if missing. (Check existing dependencies in `package.json`).
2. Complete `scripts/auto-index.js`:
   - Refactor to clean ES Module imports (`import { google } from 'googleapis'`, `import fs from 'fs'`, etc.).
   - Implement clear check for `service-account.json` (check project root and `scripts/service-account.json`). If missing, log a clear, detailed, nicely formatted error message in Vietnamese with instructions on how to get the file, and exit with code 1.
   - Implement dynamic XML parsing of `public/sitemap.xml` to extract site URLs (`<loc>...</loc>`), with fallback to `https://tracuugoicuoc.com/`.
   - Implement authentication using Google JWT client with scope `https://www.googleapis.com/auth/indexing` and call `indexing.urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } })`.
3. Ensure `.gitignore` contains `service-account.json`.
4. Create `GOOGLE_INDEXING_SETUP.md` in project root:
   - Detailed, clear step-by-step instructions on creating Google Cloud project, enabling Google Search Indexing API, creating Service Account, downloading JSON key file, adding Service Account email as Owner in Google Search Console, placing key file at `service-account.json`, and running `node scripts/auto-index.js`.
5. Run test verification:
   - Execute `node scripts/auto-index.js` without `service-account.json` present to verify it outputs the clear error message and exits cleanly without unhandled exceptions.
6. Write `changes.md` and `handoff.md` in `.agents/worker_m3` and report back to orchestrator via `send_message`.
</USER_REQUEST>
