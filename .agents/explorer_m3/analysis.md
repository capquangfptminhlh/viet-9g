# Milestone 3 Analysis Report: Google Auto-Indexing Script & Documentation

**Date**: 2026-07-29  
**Agent**: explorer_m3 (Explorer Subagent)  
**Target Milestone**: Milestone 3 — Google Auto-Indexing Script & Setup Documentation  

---

## 1. Current Implementation & Audit Findings

### 1.1 Dependency Audit (`package.json`)
- **`googleapis` status**: **MISSING** from `package.json` dependencies. Calling `require('googleapis')` or `import { google } from 'googleapis'` fails with `Cannot find module 'googleapis'`.
- **`dotenv` status**: Present in `package.json` (`"dotenv": "^17.2.3"`).
- **`request` status**: Used in `scripts/auto-index.js` (`const request = require('request');`), but **NOT installed** in `package.json` and deprecated in Node.js ecosystem.
- **Module format**: `package.json` contains `"type": "module"`.

### 1.2 `scripts/auto-index.js` Audit
- **Module Syntax Conflict**: `scripts/auto-index.js` uses CommonJS `require()`. In an ES Module project (`"type": "module"`), running `node scripts/auto-index.js` raises a `ReferenceError: require is not defined in ES module scope`.
- **Hardcoded Single URL**: Currently hardcoded to `https://tracuugoicuoc.com/` (lines 39-40). It does not dynamically parse `public/sitemap.xml`.
- **Deprecated HTTP Client**: Uses `request` library instead of modern `googleapis` SDK (`google.indexing({ version: 'v3', auth })`).
- **Key Missing Error Handling**: Currently checks if `scripts/service-account.json` exists. If missing, prints Vietnamese message and exits with `process.exit(1)`.

### 1.3 `public/sitemap.xml` Audit
- **Path**: `public/sitemap.xml`
- **Content**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://tracuugoicuoc.com/</loc>
      <lastmod>2026-07-29</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```
- **Parsing strategy**: Can extract all `<loc>` values using a regex `/<loc>(.*?)<\/loc>/gi` from `public/sitemap.xml`. If missing or empty, fall back gracefully to `https://tracuugoicuoc.com/`.

---

## 2. Required Modifications & Technical Specification

### 2.1 Dependency Updates (`package.json`)
Add `googleapis` to `dependencies`:
```json
"dependencies": {
  "googleapis": "^144.0.0",
  ...
}
```

### 2.2 Modernized ES Module Code for `scripts/auto-index.js`

```javascript
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target key file paths & sitemap
const KEY_FILE_SCRIPTS = path.join(__dirname, 'service-account.json');
const KEY_FILE_ROOT = path.join(__dirname, '..', 'service-account.json');
const SITEMAP_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Determine service account file path
let keyFilePath = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
} else if (fs.existsSync(KEY_FILE_SCRIPTS)) {
  keyFilePath = KEY_FILE_SCRIPTS;
} else if (fs.existsSync(KEY_FILE_ROOT)) {
  keyFilePath = KEY_FILE_ROOT;
}

if (!keyFilePath) {
  console.error('\n❌ Error: Missing Google Cloud Service Account Key file!');
  console.error('------------------------------------------------------------------');
  console.error('File "service-account.json" not found in "scripts/" or project root.');
  console.error('\n👉 Instructions to resolve:');
  console.error('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.error('2. Create or select a project, then enable "Web Search Indexing API".');
  console.error('3. Go to IAM & Admin -> Service Accounts, create a Service Account.');
  console.error('4. Create a JSON Key and download it.');
  console.error('5. Rename downloaded key to "service-account.json" and place in "scripts/".');
  console.error('6. Add the Service Account email as Owner in Google Search Console.');
  console.error('------------------------------------------------------------------\n');
  process.exit(1);
}

// Dynamically extract URLs from sitemap.xml
function getUrlsToIndex() {
  const defaultUrl = 'https://tracuugoicuoc.com/';
  if (!fs.existsSync(SITEMAP_FILE)) {
    console.warn(`⚠️ sitemap.xml not found at ${SITEMAP_FILE}, defaulting to: ${defaultUrl}`);
    return [defaultUrl];
  }

  try {
    const sitemapContent = fs.readFileSync(SITEMAP_FILE, 'utf-8');
    const matches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/gi)];
    const urls = matches.map(m => m[1].trim()).filter(Boolean);
    
    if (urls.length === 0) {
      console.warn(`⚠️ No URLs found in sitemap.xml, defaulting to: ${defaultUrl}`);
      return [defaultUrl];
    }
    return urls;
  } catch (err) {
    console.error(`⚠️ Error reading sitemap.xml: ${err.message}, defaulting to: ${defaultUrl}`);
    return [defaultUrl];
  }
}

async function runAutoIndex() {
  console.log('🔍 Starting Google Auto-Indexing process...');
  console.log(`🔑 Using Key File: ${keyFilePath}`);

  let keyData;
  try {
    const rawData = fs.readFileSync(keyFilePath, 'utf-8');
    keyData = JSON.parse(rawData);
  } catch (err) {
    console.error(`❌ Failed to parse JSON key file at ${keyFilePath}:`, err.message);
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: keyData.client_email,
    key: keyData.private_key,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({ version: 'v3', auth });
  const urls = getUrlsToIndex();

  console.log(`📋 Found ${urls.length} URL(s) to index:\n${urls.map(u => `  - ${u}`).join('\n')}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    try {
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });
      console.log(`✅ [HTTP ${response.status}] Indexing requested for: ${url}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to request indexing for: ${url}`);
      console.error(`   Detail: ${err.response?.data?.error?.message || err.message}`);
      failCount++;
    }
  }

  console.log('\n==================================================');
  console.log(`🎉 Auto-Indexing finished. Success: ${successCount}, Failed: ${failCount}`);
  console.log('==================================================\n');
}

runAutoIndex();
```

---

## 3. Outline for Service Account Setup Documentation (`GOOGLE_INDEXING_SETUP.md`)

1. **Overview & Prerequisites**
   - Purpose of Google Web Search Indexing API.
   - Requirements: Google Cloud account, Google Search Console ownership for `tracuugoicuoc.com`.
2. **Step 1: Enable Indexing API in Google Cloud Console**
   - Create/Select project in Google Cloud Console.
   - Search for "Web Search Indexing API" and click Enable.
3. **Step 2: Create Service Account & Download Key**
   - Navigate to IAM & Admin -> Service Accounts.
   - Click "Create Service Account", fill name (`viettel-auto-indexer`), click Create.
   - Go to Keys tab -> Add Key -> Create new key -> JSON format.
   - Download the file and rename it to `service-account.json`.
4. **Step 3: Deploy Key File**
   - Move `service-account.json` into `scripts/service-account.json` directory.
   - Ensure `service-account.json` is listed in `.gitignore` so secrets are never committed.
5. **Step 4: Grant Permissions in Google Search Console**
   - Copy the Service Account email address (e.g. `viettel-auto-indexer@project.iam.gserviceaccount.com`).
   - Open Google Search Console -> Settings -> Users and permissions -> Add User.
   - Add the Service Account email with **Owner** role.
6. **Step 5: Run Auto-Indexing Script**
   - Execute: `npm install`
   - Execute: `node scripts/auto-index.js`
7. **Step 6: Troubleshooting & Common Errors**
   - `403 Permission Denied`: Service account not added as Owner in Google Search Console.
   - `429 Quota Exceeded`: Daily API limit exceeded (default 200 requests/day).
   - `400 Bad Request`: Invalid URL format or missing domain verification.
   - `Missing Key File`: Explains the error message shown by script when key is absent.
