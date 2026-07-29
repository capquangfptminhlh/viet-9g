# Original User Request

## 2026-07-29T13:18:33+07:00

<USER_REQUEST>
Tự động hóa hoàn toàn quy trình tối ưu cấu trúc kỹ thuật SEO & AEO, cải thiện trải nghiệm giao diện di động (Mobile UX) và thiết lập script tự động index Google cho website tiếp thị liên kết Viettel tracuugoicuoc.com.

Working directory: D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted
Integrity mode: development

## Requirements

### R1. Tối ưu hóa SEO & AEO Kỹ thuật
*   Sửa lỗi ngôn ngữ thành `<html lang="vi">` trong `index.html`.
*   Thêm đầy đủ thẻ Meta Description, Open Graph tags (Facebook/Zalo) và Canonical URL.
*   Nhúng mã **JSON-LD Schema cho WebSite** và **FAQPage** hợp lệ.
*   Tạo file `robots.txt` và `sitemap.xml` động hoặc tĩnh lưu vào thư mục `public/`.

### R2. Tối ưu hóa Trải nghiệm Di động (Mobile UX) & Hiệu năng
*   Quét và tự động nén toàn bộ các hình ảnh tĩnh trong dự án sang định dạng `.webp` để tối ưu tốc độ tải trang trên di động.
*   Kiểm tra và sửa CSS/Tailwind của các component (`Header`, `PackageCard`, `FaqAccordion`) đảm bảo hiển thị hoàn hảo trên các màn hình di động.
*   Đảm bảo các nút bấm đăng ký (SMS, Hotline, Zalo) có kích thước tương tác (tap target) tối thiểu 48px trên thiết bị di động.

### R3. Tự động hóa Lập chỉ mục (Auto-Indexing)
*   Hoàn thiện file script scripts/auto-index.js để tự động gửi tín hiệu yêu cầu lập chỉ mục lên Google Indexing API.
*   Viết tài liệu hướng dẫn chi tiết cách tạo Service Account và lấy file JSON Key đặt vào dự án.

## Acceptance Criteria

### Tối ưu kỹ thuật SEO & AEO
- [ ] File `index.html` chứa thẻ `<html lang="vi">`, thẻ meta description và Open Graph tags đầy đủ.
- [ ] File `index.html` chứa Schema JSON-LD WebSite và FAQPage hợp lệ (validate không có lỗi cú pháp).
- [ ] File `robots.txt` và `sitemap.xml` tồn tại trong thư mục `dist/` sau khi chạy lệnh build.

### Tối ưu di động & Hiệu năng
- [ ] 100% hình ảnh tĩnh trong dự án được chuyển đổi thành `.webp` và tải mượt mà.
- [ ] Các nút bấm tương tác chính (`Đăng ký`, `Hotline`, `Zalo`) đạt kích thước chiều cao hoặc chiều rộng tối thiểu 48px trên giao diện di động.
- [ ] Dự án chạy lệnh `npm run build` thành công, không gặp bất kỳ lỗi biên dịch nào.

### Tự động hóa Index
- [ ] File `scripts/auto-index.js` sẵn sàng hoạt động và in ra thông báo lỗi rõ ràng nếu thiếu file key `service-account.json`.
</USER_REQUEST>
