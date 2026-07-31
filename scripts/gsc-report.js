import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Define the site URL as registered in Google Search Console
const SITE_URL = 'sc-domain:tracuugoicuoc.com';

async function getGscReport() {
  try {
    const keyPath = path.resolve('gsc-service-account.json');
    if (!fs.existsSync(keyPath)) {
      console.error('❌ Error: gsc-service-account.json not found in project root!');
      process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Calculate date range: last 7 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2); // GSC data is usually 2 days delayed
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);

    const formatDate = (d) => d.toISOString().split('T')[0];

    console.log(`📊 Đang lấy báo cáo từ khóa GSC cho ${SITE_URL}`);
    console.log(`📅 Thời gian: ${formatDate(startDate)} đến ${formatDate(endDate)}`);
    console.log('--------------------------------------------------');

    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 15, // Top 15 keywords
      },
    });

    if (!res.data.rows || res.data.rows.length === 0) {
      console.log('⚠️ Không có dữ liệu từ khóa nào trong khoảng thời gian này.');
      return;
    }

    let reportMessage = `📊 *Báo Cáo Thứ Hạng GSC (${SITE_URL})*\n`;
    reportMessage += `📅 Từ: ${formatDate(startDate)} đến ${formatDate(endDate)}\n\n`;
    
    console.log(
      'Hạng | Từ khóa'.padEnd(45) + ' | Clicks | Hiển thị | CTR    | Vị trí TB'
    );
    console.log('-'.repeat(80));

    res.data.rows.forEach((row, index) => {
      const keyword = row.keys[0];
      const clicks = row.clicks.toString();
      const impressions = row.impressions.toString();
      const ctr = (row.ctr * 100).toFixed(2) + '%';
      const position = row.position.toFixed(1);

      console.log(
        `${(index + 1).toString().padEnd(4)} | ${keyword.padEnd(38)} | ${clicks.padEnd(6)} | ${impressions.padEnd(8)} | ${ctr.padEnd(6)} | ${position}`
      );
      
      reportMessage += `*${index + 1}.* \`${keyword}\`\n`;
      reportMessage += `👉 Vị trí: *${position}* | Click: ${clicks} | Hiển thị: ${impressions}\n`;
    });
    
    console.log('-'.repeat(80));
    console.log('✅ Báo cáo hoàn tất ra Console.');

    // Gửi qua Telegram nếu có cấu hình
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      console.log('🚀 Đang gửi báo cáo qua Telegram...');
      const tgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const tgResponse = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: reportMessage,
          parse_mode: 'Markdown'
        })
      });
      if (tgResponse.ok) {
        console.log('✅ Đã gửi báo cáo Telegram thành công!');
      } else {
        console.error('❌ Lỗi khi gửi Telegram:', await tgResponse.text());
      }
    } else {
      console.log('⚠️ Không tìm thấy TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env. Bỏ qua gửi báo cáo.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi lấy dữ liệu GSC:', error.message);
  }
}

// Load env before running
const envPath = path.join(path.resolve(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    if (key) process.env[key] = parts.slice(1).join('=').trim();
  });
}

getGscReport();
