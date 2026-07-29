# Milestone 3 Changes Summary

**Agent**: worker_m3  
**Date**: 2026-07-29  

## Modified Files

### 1. `package.json`
- Added `"googleapis": "^144.0.0"` under `dependencies`.
- Ran `npm install` to update `node_modules` and lockfile.

### 2. `scripts/auto-index.js`
- Refactored CommonJS `require()` statements to modern ES Module imports (`import { google } from 'googleapis'`, `import fs from 'fs'`, `import path from 'path'`, `import { fileURLToPath } from 'url'`).
- Added ESM `__dirname` and `__filename` resolution via `fileURLToPath(import.meta.url)`.
- Added key file lookup covering `process.env.GOOGLE_APPLICATION_CREDENTIALS`, `scripts/service-account.json`, and root `service-account.json`.
- Implemented clean, detailed Vietnamese error output with step-by-step setup instructions when `service-account.json` is missing, exiting cleanly with code 1.
- Implemented `getUrlsToIndex()` function to dynamically parse `<loc>` URLs from `public/sitemap.xml` using regex (`/<loc>(.*?)<\/loc>/gi`), with fallback to `https://tracuugoicuoc.com/`.
- Implemented JWT client authentication (`new google.auth.JWT`) with scope `https://www.googleapis.com/auth/indexing` and batch URL publishing via `indexing.urlNotifications.publish`.

### 3. `.gitignore`
- Added `service-account.json` to prevent accidentally committing private key files to git.

## New Files Created

### 1. `GOOGLE_INDEXING_SETUP.md`
- Created comprehensive guide covering Google Web Search Indexing API setup in Google Cloud Console, Service Account JSON key download, setting Owner role in Google Search Console, local file placement, execution commands, and troubleshooting common error status codes (403, 429, missing key).
