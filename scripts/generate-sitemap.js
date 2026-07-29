import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

// List of Viettel packages
const PACKAGES = [
  'mxh120', 'mxh150', 'v120b', 'sd90', 'sd120', 'st5k', 'st70k', 'st90k', 
  'v150b', 'v200b', 'sd135', 'sd150', 'mxh100', 'v90b', 'sd70', '6mxh120', '12mxh120'
];

// Permutations for Programmatic SEO URL Generation
const PREFIXES = [
  'dang-ky',
  'goi-cuoc',
  'cach-dang-ky',
  'cu-phap-dang-ky',
  'huong-dan-dang-ky',
  'dang-ky-4g',
  'dang-ky-5g',
  'mua-goi-data',
  'uu-dai-goi',
  'huong-dan-dang-ky-goi',
  'cu-phap-soan-tin',
  'dang-ky-mang',
  'cai-dat-goi',
  'dang-ky-nhanh',
  'dang-ky-sim',
  'cach-cai-dat-goi',
  'soan-tin-dang-ky'
];

const SUFFIXES = [
  'viettel',
  'viettel-re-nhat',
  'viettel-cho-hoc-sinh',
  'viettel-cho-sinh-vien',
  'viettel-khong-gioi-han',
  'viettel-uu-dai-khung',
  'viettel-thang',
  'viettel-1-ngay',
  'viettel-cho-sim-moi',
  'viettel-gia-re',
  'viettel-online',
  'viettel-chinh-thuc',
  'viettel-moi-nhat',
  'viettel-tot-nhat',
  'viettel-2026',
  'viettel-mien-phi-sms',
  'viettel-moi-nhat-2026',
  'viettel-khong-phat-sinh-cuoc',
  'viettel-gia-re-nhat'
];

function generateSitemap() {
  console.log('🔄 Bắt đầu sinh 5000+ từ khóa ngách Programmatic SEO sitemap...');

  const urls = [];
  // 1. Add Homepage
  urls.push('https://tracuugoicuoc.com/');

  // 2. Generate combined dynamic URLs
  for (const pkg of PACKAGES) {
    for (const prefix of PREFIXES) {
      for (const suffix of SUFFIXES) {
        // e.g., dang-ky-mxh120-viettel-re-nhat
        const urlPath = `${prefix}-${pkg}-${suffix}`;
        urls.push(`https://tracuugoicuoc.com/${urlPath}`);
      }
    }
  }

  console.log(`📊 Đã sinh tổng cộng ${urls.length} liên kết từ khóa ngách.`);

  // 3. Build XML content
  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  // Ensure public folder exists and write file
  fs.mkdirSync(path.dirname(SITEMAP_FILE), { recursive: true });
  fs.writeFileSync(SITEMAP_FILE, xml, 'utf-8');

  console.log(`✅ Thành công! Sitemap đã được lưu tại: ${SITEMAP_FILE}`);
}

generateSitemap();
