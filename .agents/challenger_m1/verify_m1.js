import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../');
console.log('Project Root:', rootDir);

const results = [];

function recordTest(testName, passed, details = '') {
  results.push({ testName, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}${details ? `: ${details}` : ''}`);
}

// Step 1: Validate index.html JSON-LD
const indexPath = path.join(rootDir, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
let match;
const jsonLdSchemas = [];

while ((match = jsonLdRegex.exec(indexContent)) !== null) {
  const jsonText = match[1].trim();
  try {
    const parsed = JSON.parse(jsonText);
    jsonLdSchemas.push(parsed);
    recordTest(`JSON-LD Syntax Parsing (${parsed['@type'] || 'Unknown'})`, true);
  } catch (err) {
    recordTest(`JSON-LD Syntax Parsing`, false, err.message);
  }
}

// Step 2: Check FAQPage match with packages.ts
const faqSchema = jsonLdSchemas.find(s => s['@type'] === 'FAQPage');
if (!faqSchema) {
  recordTest('FAQPage Schema Found', false, 'No FAQPage schema found in index.html');
} else {
  recordTest('FAQPage Schema Found', true);
}

// Read packages.ts FAQS array
const packagesPath = path.join(rootDir, 'src/data/packages.ts');
const packagesContent = fs.readFileSync(packagesPath, 'utf-8');

// Parse FAQS array from packages.ts using regex or JSON extraction
const faqsMatch = packagesContent.match(/export const FAQS:\s*FAQItem\[\]\s*=\s*(\[\s*[\s\S]*?\n\]);/);
let tsFaqs = [];
if (faqsMatch) {
  try {
    // Basic js eval/parse for the array
    const rawFaqsText = faqsMatch[1];
    tsFaqs = eval(rawFaqsText);
    recordTest('Parse FAQS from src/data/packages.ts', true, `Found ${tsFaqs.length} FAQs`);
  } catch (e) {
    recordTest('Parse FAQS from src/data/packages.ts', false, e.message);
  }
} else {
  recordTest('Parse FAQS from src/data/packages.ts', false, 'Could not locate FAQS array');
}

// Compare line-for-line / exact match
if (faqSchema && faqSchema.mainEntity && tsFaqs.length > 0) {
  const schemaFaqs = faqSchema.mainEntity;
  recordTest('FAQ Count Match', schemaFaqs.length === tsFaqs.length, `schema: ${schemaFaqs.length}, ts: ${tsFaqs.length}`);

  tsFaqs.forEach((tsFaq, idx) => {
    const schemaItem = schemaFaqs[idx];
    if (!schemaItem) {
      recordTest(`FAQ Item #${idx + 1} Exists in Schema`, false);
      return;
    }

    const qMatch = tsFaq.question === schemaItem.name;
    recordTest(`FAQ Item #${idx + 1} Question Match`, qMatch, qMatch ? '' : `TS: "${tsFaq.question}" vs Schema: "${schemaItem.name}"`);

    const aMatch = tsFaq.answer === (schemaItem.acceptedAnswer && schemaItem.acceptedAnswer.text);
    recordTest(`FAQ Item #${idx + 1} Answer Match`, aMatch, aMatch ? '' : `TS: "${tsFaq.answer}" vs Schema: "${schemaItem.acceptedAnswer?.text}"`);
  });
}

// Step 3: Open Graph and Meta Tags Verification
const expectedOgMeta = {
  'og:type': 'website',
  'og:url': 'https://tracuugoicuoc.com/',
  'og:title': 'Tra Cứu Gói Cước Viettel | Đăng Ký 4G/5G Trực Tuyến',
  'og:description': 'Tra cứu và đăng ký nhanh các gói cước 4G/5G Viettel siêu tốc mới nhất. Đăng ký qua tổng đài 290 miễn phí dịch vụ.',
  'og:image': 'https://tracuugoicuoc.com/og-image.jpg',
  'og:site_name': 'Tra Cứu Gói Cước Viettel',
  'og:locale': 'vi_VN',
  'og:image:width': '1200',
  'og:image:height': '630',
  'og:image:alt': 'Tra Cứu Gói Cước Viettel 4G 5G',
  'twitter:card': 'summary_large_image',
  'twitter:url': 'https://tracuugoicuoc.com/',
  'twitter:title': 'Tra Cứu Gói Cước Viettel | Đăng Ký 4G/5G Trực Tuyến',
  'twitter:description': 'Tra cứu và đăng ký nhanh các gói cước 4G/5G Viettel siêu tốc mới nhất. Đăng ký qua tổng đài 290 miễn phí dịch vụ.'
};

for (const [prop, expectedValue] of Object.entries(expectedOgMeta)) {
  const metaRegex = new RegExp(`<meta\\s+(?:property|name)=["']${prop.replace(':', '\\:')}["']\\s+content=["']([^"']*)["']`, 'i');
  const metaMatch = indexContent.match(metaRegex);
  if (metaMatch) {
    const actualValue = metaMatch[1];
    recordTest(`Meta Tag ${prop}`, actualValue === expectedValue, `Actual: "${actualValue}"`);
  } else {
    recordTest(`Meta Tag ${prop}`, false, 'Tag not found in index.html');
  }
}

// Step 4: Verify robots.txt & sitemap.xml in public/
const robotsPath = path.join(rootDir, 'public/robots.txt');
const sitemapPath = path.join(rootDir, 'public/sitemap.xml');

recordTest('public/robots.txt Exists', fs.existsSync(robotsPath));
if (fs.existsSync(robotsPath)) {
  const robotsText = fs.readFileSync(robotsPath, 'utf-8');
  recordTest('robots.txt Allow *', robotsText.includes('User-agent: *\nAllow: /') || robotsText.includes('User-agent: *\r\nAllow: /'));
  recordTest('robots.txt GPTBot', robotsText.includes('User-agent: GPTBot'));
  recordTest('robots.txt ClaudeBot', robotsText.includes('User-agent: ClaudeBot'));
  recordTest('robots.txt PerplexityBot', robotsText.includes('User-agent: PerplexityBot'));
  recordTest('robots.txt Google-Extended', robotsText.includes('User-agent: Google-Extended'));
  recordTest('robots.txt Sitemap directive', robotsText.includes('Sitemap: https://tracuugoicuoc.com/sitemap.xml'));
}

recordTest('public/sitemap.xml Exists', fs.existsSync(sitemapPath));
if (fs.existsSync(sitemapPath)) {
  const sitemapText = fs.readFileSync(sitemapPath, 'utf-8');
  recordTest('sitemap.xml URL loc', sitemapText.includes('<loc>https://tracuugoicuoc.com/</loc>'));
  recordTest('sitemap.xml valid structure', sitemapText.includes('<?xml version="1.0" encoding="UTF-8"?>') && sitemapText.includes('</urlset>'));
}

// Output summary
const total = results.length;
const passedCount = results.filter(r => r.passed).length;
const failedCount = results.filter(r => !r.passed).length;

console.log('\n--- VERIFICATION SUMMARY ---');
console.log(`Total Checks: ${total}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);

fs.writeFileSync(
  path.join(__dirname, 'test_results.json'),
  JSON.stringify({ total, passedCount, failedCount, results }, null, 2),
  'utf-8'
);
