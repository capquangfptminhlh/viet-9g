import { google } from 'googleapis';
import { appendFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { deltaPercent, normalizeTotals, reportWindows } from './gsc-report-window.js';

const SITE_URL = 'sc-domain:tracuugoicuoc.com';

function getCredentials() {
  const secret = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (secret) {
    try {
      return { credentials: JSON.parse(secret) };
    } catch {
      throw new Error('GSC_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }
  const keyPath = resolve('gsc-service-account.json');
  if (existsSync(keyPath)) return { keyFile: keyPath };
  throw new Error('GSC credentials missing; GSC KPIs are UNKNOWN (no fallback traffic=0)');
}

function printable(value, suffix = '') {
  return value === null || value === undefined ? 'UNKNOWN' : String(value) + suffix;
}

function diffLine(name, recent, prior, field, suffix = '') {
  if (!recent || !prior) return name + ': UNKNOWN (missing verified GSC totals)';
  const absolute = +(recent[field] - prior[field]).toFixed(2);
  const change = deltaPercent(recent[field], prior[field]);
  return name + ': ' + printable(recent[field], suffix) +
    ' | trước ' + printable(prior[field], suffix) +
    ' | Δ ' + printable(absolute, suffix) +
    ' | Δ% ' + printable(change, '%');
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    ...getCredentials(),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const api = google.searchconsole({ version: 'v1', auth });
  const windows = reportWindows();
  const query = async (period, dimensions = []) => {
    const response = await api.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        ...period,
        type: 'web',
        dimensions,
        rowLimit: dimensions.length ? 10 : 1,
      },
    });
    return response.data.rows ?? [];
  };
  const currentRows = await query(windows.current);
  const previousRows = await query(windows.previous);
  const current = normalizeTotals(currentRows[0]);
  const previous = normalizeTotals(previousRows[0]);
  const status = current && previous ? 'VERIFIED' : 'UNKNOWN';
  const topQueries = await query(windows.current, ['query']);
  const topPages = await query(windows.current, ['page']);

  console.log('GSC_28D_REPORT_STATUS=' + status);
  console.log('GSC_28D_CURRENT=' + windows.current.startDate + '..' + windows.current.endDate);
  console.log('GSC_28D_PREVIOUS=' + windows.previous.startDate + '..' + windows.previous.endDate);
  console.log('INDEXING_STATUS=UNKNOWN (Search Analytics is not the index coverage API)');

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '### GSC first-party reporting\n' +
      '- Source: Google Search Console Search Analytics (service account)\n' +
      '- 28-day comparison status: **' + status + '**\n' +
      '- Current: ' + windows.current.startDate + '–' + windows.current.endDate + '\n' +
      '- Previous: ' + windows.previous.startDate + '–' + windows.previous.endDate + '\n' +
      '- Detailed private KPI report: Telegram notification; not printed to public CI logs\n' +
      '- Indexed URL count: UNKNOWN (requires separate index-coverage evidence)\n');
  }

  const lines = [
    '📊 GSC VIETTEL — nguồn Google Search Console thật',
    'Trạng thái: ' + status,
    '28 ngày mới: ' + windows.current.startDate + ' đến ' + windows.current.endDate,
    '28 ngày trước: ' + windows.previous.startDate + ' đến ' + windows.previous.endDate,
    '',
    diffLine('Clicks', current, previous, 'clicks'),
    diffLine('Impressions', current, previous, 'impressions'),
    diffLine('CTR', current, previous, 'ctrPercent', '%'),
    diffLine('Vị trí trung bình', current, previous, 'averagePosition'),
    '',
    'Indexing: UNKNOWN (cần kiểm tra báo cáo Page indexing riêng).',
    '',
    'Top queries (28 ngày mới):',
    ...topQueries.slice(0, 5).map((row, i) => (i + 1) + '. ' +
      String(row.keys?.[0] ?? '').slice(0, 90) + ' | ' +
      printable(row.clicks) + ' click | ' + printable(row.impressions) + ' impressions'),
    '',
    'Top pages (28 ngày mới):',
    ...topPages.slice(0, 5).map((row, i) => (i + 1) + '. ' +
      String(row.keys?.[0] ?? '').slice(0, 110) + ' | ' +
      printable(row.clicks) + ' click'),
  ];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Telegram delivery is not configured; GSC report cannot be delivered');
  const response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n').slice(0, 3900) }),
  });
  if (!response.ok) throw new Error('Telegram delivery HTTP ' + response.status);
  console.log('GSC_28D_TELEGRAM_DELIVERED=true');
}

main().catch((error) => {
  console.error('GSC_REPORT_FAILED: ' + error.message);
  process.exitCode = 1;
});
