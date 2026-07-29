import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'tracuugoicuoc.com';
const SITEMAP_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');
const INDEX_NOW_KEY = process.env.INDEXNOW_KEY; 

async function pingIndexNow() {
  console.log('🚀 [IDX-14] Khởi động Module Ép Index (IndexNow)...');

  if (!INDEX_NOW_KEY) {
    console.log('⚠️ [IDX-14] Bỏ qua vì không tìm thấy biến môi trường INDEXNOW_KEY.');
    return;
  }

  // Tự động sinh file key.txt bắt buộc cho IndexNow
  const keyFilePath = path.join(__dirname, '..', 'public', `${INDEX_NOW_KEY}.txt`);
  fs.writeFileSync(keyFilePath, INDEX_NOW_KEY, 'utf-8');

  // Đọc sitemap để lấy 10 URL mới nhất (hoặc tất cả)
  if (!fs.existsSync(SITEMAP_FILE)) {
    console.log('⚠️ [IDX-14] Không tìm thấy Sitemap để lấy URL.');
    return;
  }

  const sitemapData = fs.readFileSync(SITEMAP_FILE, 'utf-8');
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(sitemapData)) !== null) {
    urls.push(match[1]);
  }

  if (urls.length === 0) return;

  // Lấy tối đa 50 URL đầu tiên để ping
  const targetUrls = urls.slice(0, 50);

  const payload = {
    host: HOST,
    key: INDEX_NOW_KEY,
    keyLocation: `https://${HOST}/${INDEX_NOW_KEY}.txt`,
    urlList: targetUrls
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (res.status === 200 || res.status === 202) {
      console.log(`✅ [IDX-14] Bắn Ping thành công ${targetUrls.length} URLs tới mạng lưới IndexNow (Bing/Yandex/CốcCốc).`);
    } else {
      console.error(`❌ [IDX-14] Ping thất bại. HTTP Status: ${res.status}`);
    }
  } catch (error) {
    console.error(`❌ [IDX-14] Lỗi kết nối IndexNow API:`, error.message);
  }
}

pingIndexNow();
