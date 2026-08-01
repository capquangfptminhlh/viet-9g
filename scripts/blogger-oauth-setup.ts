import readline from 'readline';

const CLIENT_ID = process.env.BLOGGER_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.BLOGGER_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPE = 'https://www.googleapis.com/auth/blogger';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Thiếu BLOGGER_OAUTH_CLIENT_ID hoặc BLOGGER_OAUTH_CLIENT_SECRET trong .env!');
  process.exit(1);
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

console.log('--- HƯỚNG DẪN LẤY REFRESH TOKEN ---');
console.log('1. Mở URL sau trong trình duyệt đã đăng nhập tài khoản Google (vai trò Author):');
console.log(authUrl);
console.log('\n2. Sau khi xác nhận, trình duyệt sẽ chuyển hướng về http://localhost:3000/callback?code=XXX');
console.log('3. Copy đoạn mã XXX (code=...) và dán vào bên dưới:\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Nhập Authorization Code: ', async (code) => {
  rl.close();
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: decodeURIComponent(code.trim()),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error('❌ Lỗi lấy token:', data.error_description || data.error);
      return;
    }

    console.log('\n✅ THÀNH CÔNG! Thêm dòng sau vào file .env của bạn:');
    console.log(`BLOGGER_REFRESH_TOKEN=${data.refresh_token}`);
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error);
  }
});
