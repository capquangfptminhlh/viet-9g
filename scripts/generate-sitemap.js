import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

// List of Viettel packages (17 Pillar Pages)
const PACKAGES = [
  'mxh120', 'mxh150', 'v120b', 'sd90', 'sd120', 'st5k', 'st70k', 'st90k', 
  'v150b', 'v200b', 'sd135', 'sd150', 'mxh100', 'v90b', 'sd70', '6mxh120', '12mxh120'
];

function generateSitemap() {
  console.log('🔄 Bắt đầu sinh sitemap chuẩn Whitehat SEO...');

  const urls = [];
  // 1. Add Homepage
  urls.push('https://www.tracuugoicuoc.com/');

  // 2. Add Pillar Pages
  for (const pkg of PACKAGES) {
    urls.push(`https://www.tracuugoicuoc.com/goi-cuoc/${pkg}`);
  }

  // 3. Add Blog Posts from public/posts directory
  const POSTS_DIR = path.join(__dirname, '..', 'public', 'posts');
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      urls.push(`https://www.tracuugoicuoc.com/posts/${file.replace('.md', '')}`);
    }
  }

  console.log(`📊 Đã sinh tổng cộng ${urls.length} liên kết chất lượng (Pillar Pages + Posts).`);

  // 4. Build XML content
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
