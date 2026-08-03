import fs from 'fs/promises';
import path from 'path';

/**
 * Tác nhân IDX-14: Chuyên viên Index Siêu Tốc (Fast Indexing Agent)
 * Nhiệm vụ: Tự động gửi tín hiệu IndexNow tới Google/Bing/Yandex sau khi nội dung mới được xuất bản.
 */
export async function submitToIndexNow(domain: string = 'tracuugoicuoc.com', buildDir: string = 'dist') {
  console.log(`[IDX-14] Bắt đầu quá trình đẩy IndexNow cho domain: ${domain}`);
  
  const key = '9f7435f2b3e846059d9df3c965c4015f'; // Static key for IndexNow verification
  const keyFileName = `${key}.txt`;
  const keyFilePath = path.join('public', keyFileName);

  // 1. Đảm bảo file key tồn tại trong public để các bộ máy tìm kiếm verify
  try {
    await fs.writeFile(keyFilePath, key);
    console.log(`[IDX-14] Đã tạo file xác thực IndexNow tại: ${keyFilePath}`);
  } catch (err: any) {
    console.error(`[IDX-14] Không thể tạo file key: ${err.message}`);
    return;
  }

  // 2. Thu thập danh sách URL (ví dụ đơn giản: đọc từ sitemap tĩnh đã build)
  // Trong môi trường Astro, sitemap sinh ra ở dist/sitemap-0.xml
  const sitemapPath = path.join(buildDir, 'sitemap-0.xml');
  let urlList: string[] = [];

  try {
    const sitemapContent = await fs.readFile(sitemapPath, 'utf-8');
    // Regex lấy nội dung thẻ <loc>
    const regex = /<loc>(.*?)<\/loc>/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(sitemapContent)) !== null) {
      urlList.push(match[1]);
    }
  } catch (err) {
    console.warn(`[IDX-14] Không tìm thấy hoặc không thể đọc sitemap tại ${sitemapPath}. Sẽ chỉ submit trang chủ.`);
    urlList.push(`https://${domain}/`);
  }

  if (urlList.length === 0) {
    console.log(`[IDX-14] Danh sách URL trống. Hủy submit.`);
    return;
  }

  console.log(`[IDX-14] Tìm thấy ${urlList.length} URL để submit...`);

  // 3. Gửi tín hiệu POST đến IndexNow
  const payload = {
    host: domain,
    key: key,
    keyLocation: `https://${domain}/${keyFileName}`,
    urlList: urlList
  };

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(` ✅ [IDX-14] Đã ép Index thành công ${urlList.length} URL lên Bing/Yandex!`);
    } else {
      console.error(` ❌ [IDX-14] Bị từ chối (Status: ${response.status}) - ${response.statusText}`);
    }
  } catch (error: any) {
    console.error(` ❌ [IDX-14] Lỗi mạng khi gọi API IndexNow:`, error.message);
  }
}

// Export only
