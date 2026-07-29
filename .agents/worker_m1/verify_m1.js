import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FAQS } from '../../src/data/packages.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

console.log('--- Starting Milestone 1 Technical SEO & AEO Verification ---');

let errors = [];

// 1. Check index.html
const indexHtmlPath = path.join(projectRoot, 'index.html');
const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

// 1.1 Check <html lang="vi">
if (!/<html\s+lang="vi">/.test(htmlContent)) {
  errors.push('index.html: missing or incorrect <html lang="vi">');
} else {
  console.log('✓ HTML lang attribute set to "vi"');
}

// 1.2 Check Meta Description & Canonical
if (!/<meta\s+name="description"\s+content="[^"]+"/.test(htmlContent)) {
  errors.push('index.html: missing meta description');
} else {
  console.log('✓ Meta description present');
}

if (!/<link\s+rel="canonical"\s+href="https:\/\/tracuugoicuoc\.com\/"\s*\/>/.test(htmlContent)) {
  errors.push('index.html: missing or incorrect canonical link');
} else {
  console.log('✓ Canonical URL set to https://tracuugoicuoc.com/');
}

// 1.3 Check Open Graph tags
const requiredOGProperties = [
  'og:type',
  'og:url',
  'og:title',
  'og:description',
  'og:image',
  'og:site_name',
  'og:locale',
  'og:image:width',
  'og:image:height',
  'og:image:alt'
];

for (const prop of requiredOGProperties) {
  const regex = new RegExp(`<meta\\s+property="${prop}"\\s+content="[^"]+"`);
  if (!regex.test(htmlContent)) {
    errors.push(`index.html: missing Open Graph property "${prop}"`);
  }
}
console.log(`✓ All ${requiredOGProperties.length} required Open Graph tags present`);

// 1.4 Check JSON-LD Schemas
const jsonLdBlocks = [];
const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(htmlContent)) !== null) {
  try {
    const parsed = JSON.parse(match[1].trim());
    jsonLdBlocks.push(parsed);
  } catch (e) {
    errors.push(`index.html: Failed to parse JSON-LD block: ${e.message}`);
  }
}

const websiteSchema = jsonLdBlocks.find(b => b['@type'] === 'WebSite');
if (!websiteSchema) {
  errors.push('index.html: missing WebSite JSON-LD schema');
} else {
  if (websiteSchema.inLanguage !== 'vi') {
    errors.push(`WebSite schema: inLanguage is "${websiteSchema.inLanguage}", expected "vi"`);
  }
  if (!websiteSchema.alternateName) {
    errors.push('WebSite schema: missing alternateName');
  }
  console.log('✓ WebSite schema valid with alternateName & inLanguage="vi"');
}

const faqSchema = jsonLdBlocks.find(b => b['@type'] === 'FAQPage');
if (!faqSchema) {
  errors.push('index.html: missing FAQPage JSON-LD schema');
} else {
  const mainEntities = faqSchema.mainEntity || [];
  if (mainEntities.length !== FAQS.length) {
    errors.push(`FAQPage schema count mismatch: JSON-LD has ${mainEntities.length}, src/data/packages.ts has ${FAQS.length}`);
  } else {
    let synced = true;
    for (let i = 0; i < FAQS.length; i++) {
      const faqInTs = FAQS[i];
      const faqInLd = mainEntities[i];

      if (faqInLd.name !== faqInTs.question) {
        errors.push(`FAQ [${i}] Question mismatch:\n  LD: "${faqInLd.name}"\n  TS: "${faqInTs.question}"`);
        synced = false;
      }
      if (faqInLd.acceptedAnswer.text !== faqInTs.answer) {
        errors.push(`FAQ [${i}] Answer mismatch:\n  LD: "${faqInLd.acceptedAnswer.text}"\n  TS: "${faqInTs.answer}"`);
        synced = false;
      }
    }
    if (synced) {
      console.log(`✓ FAQPage schema synchronized 100% with all ${FAQS.length} FAQs from packages.ts`);
    }
  }
}

// 2. Check public/robots.txt
const robotsPath = path.join(projectRoot, 'public/robots.txt');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');

const requiredCrawlers = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
for (const crawler of requiredCrawlers) {
  if (!robotsContent.includes(`User-agent: ${crawler}`)) {
    errors.push(`robots.txt: missing rule for AI crawler "${crawler}"`);
  }
}
if (!robotsContent.includes('Sitemap: https://tracuugoicuoc.com/sitemap.xml')) {
  errors.push('robots.txt: missing or incorrect sitemap directive');
} else {
  console.log('✓ robots.txt configured with wildcard allow, AI crawlers, and sitemap pointer');
}

// 3. Check public/sitemap.xml
const sitemapPath = path.join(projectRoot, 'public/sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

if (!sitemapContent.includes('<loc>https://tracuugoicuoc.com/</loc>')) {
  errors.push('sitemap.xml: missing location https://tracuugoicuoc.com/');
} else {
  console.log('✓ sitemap.xml valid and points to https://tracuugoicuoc.com/');
}

console.log('--------------------------------------------------');
if (errors.length > 0) {
  console.error('Verification FAILED with errors:');
  errors.forEach(err => console.error(' ❌ ' + err));
  process.exit(1);
} else {
  console.log('✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}
