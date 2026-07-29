const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const request = require('request');

// Path to the service account key file
const KEY_FILE = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(KEY_FILE)) {
  console.error('❌ Thư mục scripts/ thiếu file service-account.json từ Google Cloud Console!');
  console.log('👉 Hướng dẫn: Sếp cần vào Google Cloud Console, tạo Service Account, tải file JSON key về, đổi tên thành service-account.json và đặt vào thư mục scripts/.');
  process.exit(1);
}

const key = require(KEY_FILE);

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/indexing'],
  null
);

jwtClient.authorize((err, tokens) => {
  if (err) {
    console.error('❌ Lỗi xác thực với Google API:', err);
    return;
  }
  
  const options = {
    url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: jwtClient,
    body: JSON.stringify({
      url: 'https://tracuugoicuoc.com/',
      type: 'URL_UPDATED'
    })
  };
  
  request(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('✅ Đã gửi yêu cầu ép Google Index thành công!', body);
    } else {
      console.error('❌ Lỗi gửi yêu cầu Index:', error || body);
    }
  });
});
