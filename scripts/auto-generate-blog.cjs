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
const mdContent = `# Đăng ký gói cước ${selectedPkg.name} Viettel: ${selectedPkg.dataLimit} Data tốc độ cao giá chỉ ${priceStr}đ

**Gói cước ${selectedPkg.name} của Viettel là sự lựa chọn hàng đầu cho khách hàng có nhu cầu sử dụng Internet di động tốc độ cao với mức chi phí tối ưu nhất năm 2026.**

---

## 1. Thông tin chi tiết gói cước ${selectedPkg.name} Viettel
- **Tên gói cước:** ${selectedPkg.name}
- **Giá cước:** ${priceStr}đ / lần đăng ký
- **Chu kỳ sử dụng:** ${selectedPkg.duration}
- **Ưu đãi lưu lượng Data:** Có ngay **${selectedPkg.dataLimit}** tốc độ cao 4G/5G (tương đương **${selectedPkg.dataPerDay}**).
- **Cước phí gửi SMS đăng ký:** Miễn phí 100% khi gửi đến tổng đài 290.

---

## 2. Cú pháp đăng ký gói ${selectedPkg.name} Viettel chính xác nhất
Để đăng ký nhanh gói cước **${selectedPkg.name}**, bạn chỉ cần bấm nút Đăng ký trên trang chủ hoặc soạn tin nhắn theo cú pháp chuẩn sau:

> **${selectedPkg.name} GB** gửi **290**

*Trong đó:*
- **${selectedPkg.name}** là tên gói cước bạn muốn đăng ký.
- **GB** là mã số đại lý kích hoạt ưu đãi chính thức của Viettel.
- **290** là tổng đài quốc gia tiếp nhận đăng ký dịch vụ di động Viettel (miễn phí nhắn tin).

---

## 3. Điều kiện đăng ký & Lưu ý quan trọng
Để đăng ký thành công gói cước **${selectedPkg.name}**, thuê bao của bạn cần đáp ứng các điều kiện sau:
- Là thuê bao di động Viettel đang hoạt động hai chiều.
- Số dư tài khoản chính tại thời điểm soạn tin phải lớn hơn hoặc bằng **${priceStr}đ**.
- Khi sử dụng hết **${selectedPkg.dataPerDay}** trong ngày, hệ thống sẽ tự động tạm dừng kết nối để tránh phát sinh cước ngoài ý muốn cho đến 00h00 ngày hôm sau.

---

## 4. Các cú pháp tra cứu và hỗ trợ khi dùng gói ${selectedPkg.name}
- **Kiểm tra lưu lượng Data còn lại:** Soạn **KTTK** gửi **191** (Miễn phí).
- **Hủy gia hạn gói cước:** Soạn **HUY ${selectedPkg.name}** gửi **191**.
- **Hủy hoàn toàn gói cước:** Soạn **HUYDATA ${selectedPkg.name}** gửi **191**.

*(Đại lý ủy thác tiếp thị số di động Viettel - Cước phí trừ trực tiếp từ tài khoản gốc theo hệ thống Viettel).*
`;

fs.writeFileSync(path.join(postsDir, postFilename), mdContent, 'utf-8');
console.log(`[Auto-Blog] Successfully created post: ${postFilename}`);
