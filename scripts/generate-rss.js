import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '..', 'public', 'posts');
const RSS_FILE = path.join(__dirname, '..', 'public', 'rss.xml');

function generateRSS() {
  console.log('🔄 Bắt đầu sinh RSS Feed cho hệ thống Backlink tự động...');

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Tra Cứu Gói Cước Viettel</title>
  <link>https://www.tracuugoicuoc.com</link>
  <description>Cập nhật liên tục các gói cước 4G/5G Viettel mới nhất và hướng dẫn đăng ký</description>
  <language>vi-vn</language>
  <atom:link href="https://www.tracuugoicuoc.com/rss.xml" rel="self" type="application/rss+xml" />
`;

  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    
    // Sort by modified time to get the latest posts first
    const sortedFiles = files.map(file => {
      const stats = fs.statSync(path.join(POSTS_DIR, file));
      return { file, time: stats.mtime.getTime(), date: stats.mtime.toUTCString() };
    }).sort((a, b) => b.time - a.time).slice(0, 50); // Only keep the 50 latest items for RSS

    sortedFiles.forEach(item => {
      // Create title from filename: cach-dang-ky -> Cách đăng ký
      const title = item.file.replace('.md', '').replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
      const url = `https://www.tracuugoicuoc.com/posts/${item.file.replace('.md', '')}`;
      
      rss += `
  <item>
    <title><![CDATA[${title}]]></title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${item.date}</pubDate>
    <description><![CDATA[Hướng dẫn chi tiết ${title} - Cập nhật mới nhất.]]></description>
  </item>`;
    });
  }

  rss += `
</channel>
</rss>`;

  fs.mkdirSync(path.dirname(RSS_FILE), { recursive: true });
  fs.writeFileSync(RSS_FILE, rss, 'utf-8');
  console.log(`✅ Thành công! RSS Feed đã được lưu tại: ${RSS_FILE}`);
}

generateRSS();
