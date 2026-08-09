import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const AUDIT_DIR = path.join(ROOT_DIR, 'state', 'audit');
const EXPECTED_ORIGIN = 'https://www.tracuugoicuoc.com';

function scanDirectory(dir, predicate, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) scanDirectory(filePath, predicate, fileList);
    else if (predicate(filePath)) fileList.push(filePath);
  }
  return fileList;
}

function routeFromFile(file) {
  const relative = path.relative(DIST_DIR, file).replace(/\\/g, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}`;
  if (relative.endsWith('.html')) return `/${relative.slice(0, -'.html'.length)}`;
  return `/${relative}`;
}

function extractAll(content, regex) {
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) matches.push(match[1] ?? match[0]);
  return matches;
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function extractMeta(content, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagRegex = new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${escaped}["'][^>]*>`, 'gi');
  const tags = content.match(tagRegex) ?? [];
  return tags.map((tag) => decodeHtmlEntities(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? ''));
}

function schemaHasType(value, expectedType) {
  if (!value || typeof value !== 'object') return false;
  const type = value['@type'];
  if (type === expectedType || (Array.isArray(type) && type.includes(expectedType))) return true;
  const graph = value['@graph'];
  return Array.isArray(graph) && graph.some((item) => schemaHasType(item, expectedType));
}

function parseJsonLd(content, route, criticalIssues) {
  const scripts = extractAll(
    content,
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  const parsed = [];
  scripts.forEach((raw, index) => {
    try {
      parsed.push(JSON.parse(raw.trim()));
    } catch (error) {
      criticalIssues.push({
        route,
        rule: 'SCHEMA_JSON_PARSE',
        message: `JSON-LD #${index + 1} không parse được: ${error.message}`,
      });
    }
  });
  return parsed;
}

function pushIssue(target, route, rule, message) {
  target.push({ route, rule, message });
}

function runAudit() {
  console.log('🔍 [AUD-21] Kiểm toán SEO/AEO/GEO sau build...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Không tìm thấy thư mục dist. Hãy build trước khi audit.');
    process.exitCode = 1;
    return;
  }

  const htmlFiles = scanDirectory(DIST_DIR, (filePath) => filePath.endsWith('.html'));
  const criticalIssues = [];
  const warnings = [];
  const canonicalOwners = new Map();
  const titleOwners = new Map();

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const route = routeFromFile(file);

    const titles = extractAll(content, /<title>([\s\S]*?)<\/title>/gi).map((value) => value.trim());
    const descriptions = extractMeta(content, 'description');
    const robots = extractMeta(content, 'robots');
    const canonicals = extractAll(content, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
    const ogUrls = extractMeta(content, 'og:url');
    const h1Count = (content.match(/<h1\b/gi) ?? []).length;
    const schemas = parseJsonLd(content, route, criticalIssues);

    if (titles.length !== 1 || !titles[0]) {
      pushIssue(criticalIssues, route, 'TITLE_COUNT', `Cần đúng 1 title, hiện có ${titles.length}.`);
    } else {
      const owner = titleOwners.get(titles[0]);
      if (owner && owner !== route) {
        pushIssue(warnings, route, 'DUPLICATE_TITLE', `Title trùng với ${owner}.`);
      } else {
        titleOwners.set(titles[0], route);
      }
    }

    if (descriptions.length !== 1 || !descriptions[0]) {
      pushIssue(criticalIssues, route, 'META_DESCRIPTION', `Cần đúng 1 meta description, hiện có ${descriptions.length}.`);
    } else if (descriptions[0].length < 50 || descriptions[0].length > 180) {
      pushIssue(warnings, route, 'DESCRIPTION_LENGTH', `Meta description dài ${descriptions[0].length} ký tự.`);
    }

    if (robots.length !== 1 || !robots[0]) {
      pushIssue(criticalIssues, route, 'ROBOTS_META', `Cần đúng 1 robots meta, hiện có ${robots.length}.`);
    }

    if (canonicals.length !== 1) {
      pushIssue(criticalIssues, route, 'CANONICAL_COUNT', `Cần đúng 1 canonical, hiện có ${canonicals.length}.`);
    } else {
      try {
        const canonical = new URL(canonicals[0]);
        if (canonical.origin !== EXPECTED_ORIGIN) {
          pushIssue(criticalIssues, route, 'CANONICAL_ORIGIN', `Canonical dùng origin ${canonical.origin}.`);
        }
        if (canonical.search || canonical.hash) {
          pushIssue(criticalIssues, route, 'CANONICAL_CLEAN', 'Canonical không được chứa query hoặc hash.');
        }
        const canonicalKey = canonical.href;
        const owner = canonicalOwners.get(canonicalKey);
        if (owner && owner !== route) {
          pushIssue(criticalIssues, route, 'DUPLICATE_CANONICAL', `Canonical trùng với ${owner}.`);
        } else {
          canonicalOwners.set(canonicalKey, route);
        }
        if (ogUrls.length !== 1 || ogUrls[0] !== canonicalKey) {
          pushIssue(criticalIssues, route, 'OG_CANONICAL_MISMATCH', 'og:url phải khớp canonical tuyệt đối.');
        }
      } catch {
        pushIssue(criticalIssues, route, 'CANONICAL_URL', `Canonical không phải URL tuyệt đối hợp lệ: ${canonicals[0]}`);
      }
    }

    if (schemas.length === 0) {
      pushIssue(criticalIssues, route, 'SCHEMA_MISSING', 'Không có JSON-LD.');
    } else {
      const expectsArticle = route.startsWith('/posts/');
      const pageType = expectsArticle ? 'Article' : 'WebPage';
      if (!schemas.some((schema) => schemaHasType(schema, pageType))) {
        pushIssue(criticalIssues, route, 'PAGE_SCHEMA_TYPE', `Thiếu schema ${pageType}.`);
      }
      if (route !== '/' && route !== '/404' && !schemas.some((schema) => schemaHasType(schema, 'BreadcrumbList'))) {
        pushIssue(criticalIssues, route, 'BREADCRUMB_SCHEMA', 'Thiếu BreadcrumbList cho trang con.');
      }
    }

    if (route === '/404' && !robots.some((value) => value.toLowerCase().includes('noindex'))) {
      pushIssue(criticalIssues, route, '404_NOINDEX', 'Trang 404 phải có noindex.');
    }

    if (h1Count !== 1) {
      pushIssue(warnings, route, 'H1_COUNT', `Nên có đúng 1 H1, hiện có ${h1Count}.`);
    }

    if (/href=["'](?:undefined|)["']/i.test(content)) {
      pushIssue(criticalIssues, route, 'BROKEN_HREF', 'Phát hiện href rỗng hoặc undefined.');
    }
  }

  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  const llmsPath = path.join(DIST_DIR, 'llms.txt');
  const sitemapIndexPath = path.join(DIST_DIR, 'sitemap-index.xml');

  if (!fs.existsSync(robotsPath)) {
    pushIssue(criticalIssues, '/robots.txt', 'ROBOTS_FILE', 'Thiếu robots.txt trong dist.');
  } else {
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    if (!robotsContent.includes(`${EXPECTED_ORIGIN}/sitemap-index.xml`)) {
      pushIssue(criticalIssues, '/robots.txt', 'ROBOTS_SITEMAP', 'robots.txt chưa trỏ đúng sitemap-index.xml.');
    }
  }

  if (!fs.existsSync(sitemapIndexPath)) {
    pushIssue(criticalIssues, '/sitemap-index.xml', 'SITEMAP_INDEX', 'Thiếu sitemap-index.xml do Astro sinh.');
  }

  if (!fs.existsSync(llmsPath)) {
    pushIssue(criticalIssues, '/llms.txt', 'LLMS_FILE', 'Thiếu llms.txt policy file.');
  }

  const sitemapFiles = scanDirectory(DIST_DIR, (filePath) => /sitemap.*\.xml$/i.test(path.basename(filePath)));
  for (const sitemapFile of sitemapFiles) {
    const sitemapContent = fs.readFileSync(sitemapFile, 'utf-8');
    if (sitemapContent.includes(`${EXPECTED_ORIGIN}/404`)) {
      pushIssue(criticalIssues, '/sitemap-index.xml', 'SITEMAP_404', '404 không được xuất hiện trong sitemap.');
    }
  }

  const score = Math.max(0, 100 - criticalIssues.length * 10 - warnings.length * 2);
  const report = {
    timestamp: new Date().toISOString(),
    pagesScanned: htmlFiles.length,
    seoScore: score,
    status: criticalIssues.length === 0 ? 'PASS' : 'FAIL',
    criticalIssueCount: criticalIssues.length,
    warningCount: warnings.length,
    criticalIssues,
    warnings,
  };

  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const dateStr = new Date().toISOString().split('T')[0];
  const reportPath = path.join(AUDIT_DIR, `${dateStr}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`📊 Đã quét ${htmlFiles.length} trang tĩnh. Critical: ${criticalIssues.length}. Warning: ${warnings.length}.`);
  console.log(`🧾 Báo cáo: state/audit/${dateStr}.json`);

  if (warnings.length > 0) {
    console.warn('⚠️ Chi tiết warning SEO/AEO/GEO:');
    warnings.forEach((issue) => console.warn(` - [${issue.rule}] ${issue.route}: ${issue.message}`));
  }

  if (criticalIssues.length > 0) {
    console.error('❌ SEO/AEO/GEO quality gate FAIL. Build không được coi là đạt chuẩn.');
    criticalIssues.slice(0, 20).forEach((issue) => console.error(` - [${issue.rule}] ${issue.route}: ${issue.message}`));
    process.exitCode = 1;
  } else {
    console.log(`✅ SEO/AEO/GEO quality gate PASS (${score}/100).`);
  }
}

runAudit();
