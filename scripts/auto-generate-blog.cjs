const fs = require('fs');
const path = require('path');

const packagesFilePath = path.join(__dirname, '../src/data/packages.ts');
const postsDir = path.join(__dirname, '../src/content/posts');

// Read packages.ts and parse package entries via Regex
const tsContent = fs.readFileSync(packagesFilePath, 'utf-8');
const packageRegex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*price:\s*(\d+),\s*duration:\s*'([^']+)',\s*dataLimit:\s*'([^']+)',\s*dataPerDay:\s*'([^']+)'/g;

let match;
const packages = [];
while ((match = packageRegex.exec(tsContent)) !== null) {
  packages.push({
    id: match[1],
    name: match[2],
    price: parseInt(match[3]),
    duration: match[4],
    dataLimit: match[5],
    dataPerDay: match[6],
  });
}

console.log(`[Auto-Blog] Found ${packages.length} packages in database.`);

// Find the first package without an existing blog post
let selectedPkg = null;
let postFilename = '';

for (const pkg of packages) {
  const possibleFilenames = [
    `dang-ky-${pkg.id.toLowerCase()}-viettel.md`,
    `đăng-ký-${pkg.id.toLowerCase()}-viettel.md`,
    `goi-${pkg.id.toLowerCase()}-viettel.md`,
  ];

  let exists = false;
  for (const fn of possibleFilenames) {
    if (fs.existsSync(path.join(postsDir, fn))) {
      exists = true;
      break;
    }
  }

  if (!exists) {
    selectedPkg = pkg;
    postFilename = `dang-ky-${pkg.id.toLowerCase()}-viettel.md`;
    break;
  }
}

if (!selectedPkg) {
  console.log('[Auto-Blog] All packages already have blog posts! Creating a general AEO comparison post...');
  const timestamp = Date.now();
  selectedPkg = packages[0];
  postFilename = `tong-hop-goi-cuoc-viettel-moi-nhat-${timestamp}.md`;
}

console.log(`[Auto-Blog] Selecting package ${selectedPkg.name} -> Filename: ${postFilename}`);

const priceStr = selectedPkg.price.toLocaleString('vi-VN');

// Chọn ảnh minh họa chuẩn theo nhóm gói cước
let pkgImage = '/images/viettel-4g-speed-banner.jpg';
const idLower = selectedPkg.id.toLowerCase();
if (idLower.includes('mxh')) {
  pkgImage = '/images/viettel-4g-social-banner.jpg';
} else if (idLower.includes('v90b') || idLower.includes('v120b') || idLower.includes('v150b') || idLower.includes('v200b') || idLower.includes('v300b')) {
  pkgImage = '/images/viettel-combo-call-data-banner.jpg';
} else if (idLower.includes('5g')) {
  pkgImage = '/images/5g-gaming.jpg';
}

const mdContent = `# Đăng ký gói cước ${selectedPkg.name} Viettel: ${selectedPkg.dataLimit} Data tốc độ cao giá chỉ ${priceStr}đ

**Gói cước ${selectedPkg.name} của Viettel là giải pháp Internet di động 4G/5G hàng đầu năm 2026, tối ưu chi phí cho nhu cầu làm việc, học tập và giải trí trực tuyến chuẩn SEO 2.0 & AEO.**

![Ưu đãi gói cước ${selectedPkg.name} Viettel chính thức 2026](${pkgImage})
*Hình minh họa: Ưu đãi lưu lượng và cú pháp đăng ký nhanh gói cước ${selectedPkg.name} Viettel mới nhất năm 2026.*

---

## 1. Bảng tóm tắt thông tin gói cước ${selectedPkg.name}

| Tiêu chí | Chi tiết ưu đãi |
| :--- | :--- |
| **Tên gói cước** | **${selectedPkg.name}** |
| **Giá cước** | **${priceStr}đ** / lần đăng ký |
| **Chu kỳ sử dụng** | ${selectedPkg.duration} |
| **Lưu lượng Data** | **${selectedPkg.dataLimit}** tốc độ cao 4G/5G (${selectedPkg.dataPerDay}) |
| **Cú pháp đăng ký** | **${selectedPkg.name} GB** gửi **290** (miễn phí SMS) |

---

## 2. Hướng dẫn cú pháp đăng ký gói ${selectedPkg.name} Viettel
Để kích hoạt ưu đãi nhanh chóng và chuẩn xác nhất, bạn chỉ cần bấm nút Đăng ký trên trang chủ hoặc soạn tin nhắn theo cú pháp chính thức sau:

> **${selectedPkg.name} GB** gửi **290**

*Giải thích cú pháp:*
- **${selectedPkg.name}** là tên gói cước ưu đãi Viettel bạn lựa chọn.
- **GB** là mã số đại lý kích hoạt ưu đãi chính thức của hệ thống Viettel.
- **290** là tổng đài tiếp nhận đăng ký gói cước di động Viettel (miễn phí 100% cước nhắn tin).

---

## 3. Điều kiện đăng ký & Quy định sử dụng
- Áp dụng cho thuê bao di động Viettel trả trước hoặc trả sau đang hoạt động 2 chiều.
- Số dư trong tài khoản chính tại thời điểm nhắn tin phải đạt tối thiểu **${priceStr}đ**.
- Khi sử dụng hết **${selectedPkg.dataPerDay}** trong ngày, kết nối sẽ tự động tạm dừng để bảo vệ tài khoản không bị trừ tiền cước phát sinh ngoài ý muốn cho đến 00h00 ngày kế tiếp.

---

## 4. Các cú pháp hỗ trợ trong quá trình sử dụng
- **Kiểm tra dung lượng Data còn lại:** Soạn **KTTK** gửi **191** (Miễn phí).
- **Hủy gia hạn tự động (giữ ưu đãi đến hết chu kỳ):** Soạn **HUY ${selectedPkg.name}** gửi **191**.
- **Hủy hoàn toàn gói cước:** Soạn **HUYDATA ${selectedPkg.name}** gửi **191**.

---

## 5. Câu hỏi thường gặp (FAQ - AEO 2026)

### Gói ${selectedPkg.name} có tự động gia hạn khi hết tháng không?
Có. Hệ thống Viettel sẽ tự động gia hạn gói **${selectedPkg.name}** sau khi hết chu kỳ ${selectedPkg.duration} nếu tài khoản chính của bạn có đủ **${priceStr}đ**.

### Có mất phí tin nhắn khi gửi đến tổng đài 290 không?
Không. Mọi tin nhắn đăng ký qua tổng đài **290** đều được Viettel miễn phí 100%.

*(Đại lý ủy thác tiếp thị số di động Viettel - Cước phí trừ trực tiếp từ tài khoản gốc theo quy định chính thức).*
`;

fs.writeFileSync(path.join(postsDir, postFilename), mdContent, 'utf-8');
console.log(`[Auto-Blog] Successfully created post: ${postFilename}`);
