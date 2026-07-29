# Hướng Dẫn Cấu Hình Google Auto-Indexing API (Search Console)

Tài liệu này hướng dẫn chi tiết từng bước tạo và cấu hình Google Cloud Service Account để tự động gửi yêu cầu lập chỉ mục (indexing) lên Google Search Console thông qua script `scripts/auto-index.js`.

---

## 📋 Tổng Quan & Điều Kiện Cần Có

Google Web Search Indexing API cho phép thông báo trực tiếp cho Google khi trang web có nội dung mới hoặc thay đổi, giúp Googlebot lập chỉ mục nhanh hơn.

**Yêu cầu chuẩn bị:**
- Một tài khoản Google (Google Cloud Console).
- Quyền quản trị Google Search Console cho tên miền `https://tracuugoicuoc.com/`.
- Node.js (v18+) cài sẵn trên máy chủ hoặc môi trường phát triển.

---

## 🚀 Bước 1: Kích Hoạt Google Web Search Indexing API

1. Truy cập vào **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Đăng nhập tài khoản Google của bạn.
3. Tạo một dự án mới (Ví dụ: `Viettel-Tra-Cuu-Goi-Cuoc`) hoặc chọn dự án hiện có.
4. Trên thanh tìm kiếm ở đỉnh trang, gõ `Web Search Indexing API`.
5. Chọn **Web Search Indexing API** trong danh sách kết quả và nhấn nút **Enable** (Kích hoạt).

---

## 🔑 Bước 2: Tạo Service Account & Tải File Key JSON

1. Vào menu bên trái: **IAM & Admin** -> **Service Accounts** (Tài khoản dịch vụ).
2. Nhấn nút **+ CREATE SERVICE ACCOUNT** ở phía trên.
3. Nhập thông tin:
   - **Service account name**: `viettel-auto-indexer` (hoặc tên tuỳ chọn).
   - **Service account ID**: Tự động sinh ra (ví dụ: `viettel-auto-indexer@project-id.iam.gserviceaccount.com`).
   - Nhấn **CREATE AND CONTINUE**.
4. (Tuỳ chọn) Ở bước cấp quyền (Grant this service account access to project), bạn có thể nhấn **CONTINUE** rồi **DONE**.
5. Trong danh sách Service Accounts vừa tạo, nhấn vào **Email** hoặc menu **3 chấm (...)** ở cột Actions -> chọn **Manage keys**.
6. Nhấn **ADD KEY** -> **Create new key**.
7. Chọn định dạng **JSON** và nhấn **CREATE**.
8. File JSON key sẽ tự động được tải về máy tính của bạn (tên file thường có dạng `project-id-xxxxxx.json`).

---

## 📁 Bước 3: Lưu File Khoá Đã Tải Về Vào Dự Án

1. Đổi tên file JSON vừa tải về thành: `service-account.json`.
2. Đặt file vào thư mục gốc của dự án hoặc vào thư mục `scripts/`:
   - Đường dẫn 1: `scripts/service-account.json` (Khuyên dùng)
   - Đường dẫn 2: `service-account.json` (Thư mục gốc)
3. **Lưu ý bảo mật**: File `service-account.json` chứa private key bảo mật. Đảm bảo file `.gitignore` đã có dòng `service-account.json` để không vô tình push key lên Git.

---

## 👤 Bước 4: Cấp Quyền Chủ Sở Hữu (Owner) Trong Google Search Console

> ⚠️ **CỰC KỲ QUAN TRỌNG**: Nếu không thêm Service Account làm **Owner** trong Google Search Console, API sẽ trả về lỗi `403 Forbidden: Indexing API has not been used in project... or it is disabled` hoặc `Permission Denied`.

1. Mở file `service-account.json` và sao chép địa chỉ email trong trường `"client_email"` (dạng `viettel-auto-indexer@...iam.gserviceaccount.com`).
2. Truy cập **[Google Search Console](https://search.google.com/search-console)**.
3. Chọn property `https://tracuugoicuoc.com/`.
4. Vào **Settings** (Cài đặt) -> **Users and permissions** (Người dùng và quyền).
5. Nhấn **Add User** (Thêm người dùng).
6. Dán email Service Account vừa copy vào ô **Email address**.
7. Tại ô **Permission** (Quyền), chọn **Owner** (Chủ sở hữu).
8. Nhấn **Add** (Thêm).

---

## ⚙️ Bước 5: Chạy Script Auto-Indexing

1. Mở terminal tại thư mục gốc dự án và cài đặt dependencies (nếu chưa cài):
   ```bash
   npm install
   ```

2. Thực thi script auto-indexing:
   ```bash
   node scripts/auto-index.js
   ```

3. Script sẽ tự động:
   - Đọc các URL từ file `public/sitemap.xml` (hoặc fallback về `https://tracuugoicuoc.com/`).
   - Xác thực JWT với Google API.
   - Gửi yêu cầu `URL_UPDATED` cho từng URL.
   - Hiển thị kết quả chi tiết trên terminal.

---

## 🛠️ Trợ Giúp & Xử Lý Lỗi Thường Gặp (Troubleshooting)

### 1. Lỗi: `❌ LỖI: Không tìm thấy file khoá Service Account (service-account.json)!`
- **Nguyên nhân**: Chưa đặt file `service-account.json` đúng vị trí.
- **Cách khắc phục**: Tải lại JSON key từ Google Cloud Console, đổi tên thành `service-account.json` và đặt vào thư mục `scripts/`.

### 2. Lỗi `403 Permission Denied`
- **Nguyên nhân**: Email Service Account chưa được thêm làm **Owner** trong Google Search Console.
- **Cách khắc phục**: Thực hiện lại Bước 4, đảm bảo quyền được chọn là **Owner** chứ không phải Full hoặc Restricted.

### 3. Lỗi `429 Quota Exceeded`
- **Nguyên nhân**: Vượt quá hạn ngạch API mặc định của Google (mặc định 200 URL/ngày).
- **Cách khắc phục**: Đợi sang ngày tiếp theo (theo múi giờ UTC) hoặc nộp yêu cầu tăng quota trong Google Cloud Console.

### 4. Lỗi `Cannot find module 'googleapis'`
- **Nguyên nhân**: Chưa chạy `npm install`.
- **Cách khắc phục**: Chạy `npm install` tại thư mục gốc dự án.
