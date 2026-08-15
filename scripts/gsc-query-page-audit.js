import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:tracuugoicuoc.com';
const DAYS = Number(process.env.GSC_DAYS || 90);
const ROW_LIMIT = Math.min(Number(process.env.GSC_ROW_LIMIT || 25000), 25000);
const OUTPUT = process.env.GSC_OUTPUT || 'state/gsc/query-page-latest.csv';

function csv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function getAuth() {
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (json) {
    const credentials = JSON.parse(json);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
  }

  const keyPath = path.resolve(process.env.GSC_KEY_FILE || 'gsc-service-account.json');
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      'Missing GSC credentials. Set GSC_SERVICE_ACCOUNT_JSON or provide gsc-service-account.json (or GSC_KEY_FILE).',
    );
  }

  return new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

async function main() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - DAYS + 1);

  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const response = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: isoDate(start),
      endDate: isoDate(end),
      dimensions: ['query', 'page'],
      rowLimit: ROW_LIMIT,
      dataState: 'final',
    },
  });

  const rows = response.data.rows || [];
  const header = [
    'query',
    'page',
    'clicks',
    'impressions',
    'ctr',
    'position',
    'start_date',
    'end_date',
    'observed_at',
    'source',
  ];
  const observedAt = new Date().toISOString();
  const lines = [header.join(',')];

  for (const row of rows) {
    const [query, page] = row.keys || [];
    lines.push(
      [
        query,
        page,
        row.clicks ?? 0,
        row.impressions ?? 0,
        row.ctr ?? 0,
        row.position ?? '',
        isoDate(start),
        isoDate(end),
        observedAt,
        'Google Search Console Search Analytics API',
      ].map(csv).join(','),
    );
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${lines.join('\n')}\n`, 'utf8');

  console.log(`GSC_QUERY_PAGE_PASS rows=${rows.length}`);
  console.log(`site=${SITE_URL}`);
  console.log(`range=${isoDate(start)}..${isoDate(end)}`);
  console.log(`output=${OUTPUT}`);
}

main().catch((error) => {
  console.error(`GSC_QUERY_PAGE_HOLD: ${error.message}`);
  process.exitCode = 2;
});
