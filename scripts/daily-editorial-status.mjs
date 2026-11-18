import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const REPORT_PATH = '.website-os/out/daily-editorial-readiness.json';
const APPROVED_SOURCE_DOMAINS = ['viettel.vn', 'vietteltelecom.vn', '098.viettel.vn'];

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
}

function officialSource(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' &&
      APPROVED_SOURCE_DOMAINS.some(domain =>
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

function normalizePath(url) {
  if (typeof url !== 'string' || !url.startsWith('/')) return '';
  try {
    return decodeURIComponent(url.split(/[?#]/)[0]).replace(/\/$/, '');
  } catch {
    return '';
  }
}

function resolveOwner(target, redirects) {
  let current = normalizePath(target);
  const seen = new Set();
  for (let depth = 0; depth < 8; depth++) {
    if (!current || seen.has(current)) break;
    seen.add(current);
    const rule = redirects.find(rule => normalizePath(rule.source) === current);
    if (!rule || !String(rule.destination).startsWith('/')) break;
    current = normalizePath(rule.destination);
  }
  return current;
}

export function assessArticle(markdown) {
  const body = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/u, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/gu, '')
    .replace(/\[[^\]]+\]\([^)]+\)/gu, 'source')
    .replace(/[#*|>]/gu, ' ');
  const words = body.trim().split(/\s+/u).filter(Boolean).length;
  const findings = [];
  if (words < 250) findings.push('THIN_ARTICLE_UNDER_250_WORDS');
  if (markdown.includes('Bài viết tổng hợp thông tin theo nguồn công bố của Viettel.')) {
    findings.push('GENERIC_UNEDITED_CONTENT_TEMPLATE');
  }
  if (!/^#\s+\S/mu.test(markdown) || !/^##\s+\S/mu.test(markdown)) {
    findings.push('ARTICLE_HEADINGS_MISSING');
  }
  if (!/https:\/\/(?:[\w.-]+\.)?(?:viettel\.vn|vietteltelecom\.vn)\//iu.test(markdown)) {
    findings.push('VIETTEL_SOURCE_LINK_MISSING');
  }
  return { passed: findings.length === 0, words, findings };
}

export function auditDailyReadiness(now = new Date()) {
  const topics = readJson('config/topics.json');
  const facts = new Map(readJson('data/facts.json').map(fact => [fact.id, fact]));
  const media = new Map(readJson('state/media-manifest.json').assets.map(asset => [asset.topicId, asset]));
  const ledger = readJson('state/main-site-publication-ledger.json');
  const redirects = readJson('vercel.json').redirects ?? [];
  const postFiles = new Set(readdirSync(join(ROOT, 'src/content/posts')));
  const finished = new Set(ledger
    .filter(entry => entry.status === 'PUBLISHED' || entry.status === 'STAGED')
    .map(entry => entry.topicId));

  const queue = topics.filter(topic => topic.status === 'QUEUE');
  const blockedReasons = {};
  let blockedTopics = 0;
  let provisionalTopics = 0;

  for (const topic of queue) {
    const reasons = new Set();
    if (finished.has(topic.topicId)) reasons.add('ALREADY_PUBLISHED_OR_STAGED');
    const referenced = topic.sourceFactIds.map(id => facts.get(id));
    if (referenced.length === 0 || referenced.some(fact =>
      !fact || !fact.expiresAt ||
      !Number.isFinite(Date.parse(fact.expiresAt)) ||
      Date.parse(fact.expiresAt) < now.getTime())) {
      reasons.add('FACT_MISSING_OR_EXPIRED');
    }
    if (referenced.some(fact => !officialSource(fact?.sourceUrl))) {
      reasons.add('UNVERIFIED_SOURCE_DOMAIN');
    }
    const illustration = media.get(topic.topicId);
    if (!illustration || typeof illustration.publicUrl !== 'string' ||
        !illustration.publicUrl.startsWith('https://')) {
      reasons.add('MEDIA_MANIFEST_UNAVAILABLE');
    }
    const canonical = resolveOwner(topic.targetUrlPath, redirects);
    if (canonical.startsWith('/posts/') &&
        postFiles.has(canonical.slice('/posts/'.length) + '.md')) {
      reasons.add('CANONICAL_OWNER_EXISTS');
    }
    if (postFiles.has(topic.topicId + '.md')) reasons.add('ARTICLE_SLUG_EXISTS');
    if (reasons.size) {
      blockedTopics++;
      for (const reason of reasons) blockedReasons[reason] = (blockedReasons[reason] ?? 0) + 1;
    } else {
      provisionalTopics++;
    }
  }
  return {
    observedAt: now.toISOString(),
    status: 'RESEARCH_ONLY_NOT_APPROVED_FOR_PUBLICATION',
    queue: queue.length,
    blockedTopics,
    provisionalTopics,
    blockedReasons,
    publishedToProduction: false,
    note: 'Preliminary eligibility is not a fresh source check, independent intent proof, editorial PASS or owner release approval.',
  };
}

function vietnamDate(value) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const read = kind => parts.find(part => part.type === kind)?.value;
  return read('year') + '-' + read('month') + '-' + read('day');
}

export function sourcePostsForLocalDay(today = new Date()) {
  const date = vietnamDate(today);
  return readdirSync(join(ROOT, 'src/content/posts'))
    .filter(file => file.endsWith('.md'))
    .flatMap(file => {
      const markdown = readFileSync(join(ROOT, 'src/content/posts', file), 'utf8');
      const dateLine = markdown.match(/^date:\s*["']?([^\s"']+)/mu)?.[1];
      const time = dateLine ? new Date(dateLine) : null;
      return time && !Number.isNaN(time.getTime()) && vietnamDate(time) === date
        ? [file.slice(0, -3)] : [];
    });
}

export function hasCorrectArticleCanonical(html, slug) {
  const tags = html.match(/<link\b[^>]*>/giu) ?? [];
  const canonical = tags.find(tag => /\brel=["']canonical["']/iu.test(tag));
  const href = canonical?.match(/\bhref=["']([^"']+)["']/iu)?.[1];
  if (!href) return false;
  try {
    const url = new URL(href, 'https://www.tracuugoicuoc.com');
    return url.origin === 'https://www.tracuugoicuoc.com' &&
      decodeURIComponent(url.pathname).replace(/\/$/u, '') === '/posts/' + slug;
  } catch {
    return false;
  }
}

export async function checkDailyLive(now = new Date()) {
  const slugCandidates = sourcePostsForLocalDay(now);
  const results = [];
  for (const slug of slugCandidates.slice(0, 5)) {
    const url = 'https://www.tracuugoicuoc.com/posts/' + encodeURIComponent(slug);
    try {
      const response = await fetch(url, {
        method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(12000),
      });
      const html = response.ok ? await response.text() : '';
      const hasCanonical = hasCorrectArticleCanonical(html, slug);
      results.push({
        url, status: response.status,
        liveVerified: response.status === 200 && hasCanonical,
      });
    } catch (error) {
      results.push({ url, status: 'UNKNOWN', liveVerified: false, error: error.message });
    }
  }
  return {
    observedAt: now.toISOString(),
    localDate: vietnamDate(now),
    eligibleSourcePostCount: slugCandidates.length,
    checked: results,
    publishedTodayVerified: results.some(result => result.liveVerified),
    note: 'HTTP 200 and canonical are production visibility checks, not Google indexing evidence.',
  };
}

function writeSummary(text) {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
}

async function main() {
  const mode = process.argv[2];
  if (mode === 'audit') {
    const report = auditDailyReadiness();
    const file = join(ROOT, REPORT_PATH);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
    console.log('DAILY_EDITORIAL_READINESS=' + JSON.stringify(report));
    writeSummary('### Viettel daily editorial readiness (source queue only)\n' +
      '- QUEUE: ' + report.queue + '; blocked: ' + report.blockedTopics +
      '; provisional research topics: ' + report.provisionalTopics + '\n' +
      '- Reasons: ' + JSON.stringify(report.blockedReasons) + '\n' +
      '- Publication verdict: NOT VERIFIED; no production release approved.');
    return;
  }
  if (mode === 'quality') {
    const path = process.argv[3];
    if (!path || !/^src\/content\/posts\/[a-zA-Z0-9-]+\.md$/u.test(path) ||
        !existsSync(join(ROOT, path))) {
      throw new Error('ARTICLE_SOURCE_MISSING_OR_UNSAFE');
    }
    const report = assessArticle(readFileSync(join(ROOT, path), 'utf8'));
    console.log('STAGED_ARTICLE_QUALITY=' + JSON.stringify({ path, ...report }));
    if (!report.passed) process.exitCode = 2;
    return;
  }
  if (mode === 'live') {
    const report = await checkDailyLive();
    const file = join(ROOT, '.website-os/out/daily-live-publication.json');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
    const value = report.publishedTodayVerified ? 'PUBLISHED_TODAY_VERIFIED' : 'NOT_VERIFIED';
    console.log('DAILY_LIVE_PUBLICATION=' + value);
    writeSummary('### Production publication watchdog\n' +
      '- Vietnam day: ' + report.localDate + '\n' +
      '- Live publication: **' + value + '**\n' +
      '- URLs checked: ' + report.checked.map(item =>
        item.url + ' (' + item.status + ')').join(', '));
    return;
  }
  if (mode === 'notify') {
    const data = existsSync(REPORT_PATH) ? readJson(REPORT_PATH) : null;
    const aiCreation = existsSync('.website-os/out/ai-editorial-creation.json')
      ? readJson('.website-os/out/ai-editorial-creation.json') : null;
    const live = existsSync('.website-os/out/daily-live-publication.json')
      ? readJson('.website-os/out/daily-live-publication.json') : null;
    const status = live?.publishedTodayVerified ? 'PUBLISHED_TODAY_VERIFIED'
      : process.env.EDITORIAL_JOB_STATUS === 'success'
      ? (process.env.EDITORIAL_PR_STATE === 'NEW_PR' ? 'STAGED_FOR_REVIEW'
        : process.env.EDITORIAL_PR_STATE === 'OPEN_REVIEW' ? 'EXISTING_PR_AWAITING_REVIEW'
        : process.env.EDITORIAL_QUALITY_READY === 'false' ? 'HOLD_EDITORIAL_QUALITY'
        : process.env.EDITORIAL_CANDIDATE_GENERATED === 'false' ? 'NO_ELIGIBLE_TOPIC'
        : 'NO_VERIFIED_PUBLICATION')
      : 'ERROR_WORKFLOW_FAILED';
    const runUrl = 'https://github.com/' + (process.env.GITHUB_REPOSITORY || 'capquangfptminhlh/viet-9g') +
      '/actions/runs/' + (process.env.GITHUB_RUN_ID || 'UNKNOWN');
    const lines = [
      '📋 SEO Viettel — báo cáo lịch chạy',
      'Trạng thái: ' + status,
      'Đã đăng trên website hôm nay: ' + (live?.publishedTodayVerified ? 'ĐÃ KIỂM CHỨNG URL LIVE' : 'CHƯA XÁC MINH'),
      'Kiểm tra URL live: ' + (live?.checked?.map(x => x.url + ' (' + x.status + ')').join(', ') || 'Chưa có bài ngày hôm nay trong mã nguồn'),
      'Chủ đề QUEUE: ' + (data?.queue ?? 'UNKNOWN') +
        '; blocked: ' + (data?.blockedTopics ?? 'UNKNOWN') +
        '; nghiên cứu tiếp: ' + (data?.provisionalTopics ?? 'UNKNOWN'),
      'Nguyên nhân: ' + JSON.stringify(data?.blockedReasons ?? {}),
      'Tự tìm nguồn/viết bài/vẽ ảnh: ' + (aiCreation?.status || 'CHƯA CHẠY') +
        (aiCreation?.reason ? ' (' + aiCreation.reason.slice(0, 180) + ')' : ''),
      'Nguồn Viettel: ' + (aiCreation?.sourceUrl || 'CHƯA CÓ'),
      'Ảnh minh họa: ' + (aiCreation?.image || 'CHƯA CÓ'),
      'PR: ' + (process.env.EDITORIAL_PR_URL || 'Không có PR mới'),
      'Lượt chạy: ' + runUrl,
      'Bài mới chỉ được đăng sau khi PASS các gate, 2 human reviews, owner approval và xác minh URL live.',
    ];
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    writeSummary('### Daily publishing decision: ' + status + '\n' +
      '- Production publication: ' + (live?.publishedTodayVerified ? 'VERIFIED_LIVE' : 'NOT_VERIFIED') + '\n' +
      '- AI original content: ' + (aiCreation?.status ?? 'NOT_RUN') + '\n' +
      '- Run: ' + runUrl + '\n' +
      '- PR: ' + (process.env.EDITORIAL_PR_URL || 'none'));
    if (!token || !chat) throw new Error('TELEGRAM_STATUS_NOT_SENT: credentials unavailable');
    const response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: lines.join('\n').slice(0, 3900) }),
    });
    if (!response.ok) throw new Error('TELEGRAM_STATUS_NOT_SENT: HTTP ' + response.status);
    console.log('DAILY_EDITORIAL_STATUS_SENT=' + status);
    return;
  }
  throw new Error('Usage: daily-editorial-status.mjs audit | quality ARTICLE | live | notify');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error('DAILY_EDITORIAL_STATUS_ERROR=' + error.message);
    process.exitCode = 1;
  });
}
