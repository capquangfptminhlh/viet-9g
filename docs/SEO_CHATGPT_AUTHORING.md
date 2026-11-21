# SEO Viettel — ChatGPT là người biên tập và đăng bài

## Luồng vận hành

**AI authoring chạy trong tác vụ ChatGPT đã kết nối GitHub** (lịch hiện có 07:00 / 13:00 / 20:00 Asia/Ho_Chi_Minh). GitHub Actions chỉ kiểm tra code, chạy giám sát và triển khai code đã được duyệt. GitHub Actions **không có khả năng tự gọi ChatGPT** nếu không có API, vì vậy không yêu cầu hay phụ thuộc vào GEMINI_API_KEY hoặc OpenAI API key.

1. Đọc `AGENTS.md`, manifest và toàn bộ mandatory_read_order trong `seo-web@main`, SEO Alpha, K0; ghi nguồn SHA/time và trạng thái PASS/HOLD thật.
2. ChatGPT tìm chủ đề có nhu cầu hữu ích và kiểm tra trang chính thức của Viettel, ngày cập nhật, dữ kiện, gói cước và phạm vi áp dụng. Nguồn chỉ để xác minh **facts**, không copy nội dung hay ảnh.
3. So sánh các bài trong `src/content/posts/`, kiểm tra trùng intent / canonical và K0 owner. Nếu chủ đề đã được phục vụ tốt, ưu tiên nâng cấp canonical hiện tại; không tạo nhiều trang trùng.
4. ChatGPT **tự viết** bài tiếng Việt nguyên bản (hướng dẫn từng bước, câu hỏi thực tế, điều kiện áp dụng, FAQ, liên kết nội bộ, nguồn chính thức), đủ chiều sâu. Không bịa giá, dung lượng, cú pháp SMS hoặc khả năng dùng 5G.
5. ChatGPT **tự vẽ một ảnh infographic gốc** bằng SVG text source, 1200×630, lưu `public/images/editorial/<slug>.svg`. Nội dung hình rõ trên mobile, chữ không bị cắt, XML hợp lệ, không dùng hình trên website nguồn. Có thể dùng công cụ ảnh do ChatGPT cung cấp nếu khả dụng và chuyển bytes qua đường GitHub hợp lệ. **Không đòi người dùng gửi ảnh hay khóa model AI.**
6. Ghi frontmatter Markdown `title`, `description`, `date`, `image: "/images/editorial/<slug>.svg"`; ảnh phải tồn tại trong source và build `dist/`. Bài phải trỏ tới nguồn gốc có thật.
7. ChatGPT tạo branch/commit/PR trên GitHub, chạy `npm test`, `npm run k0:check`, `npm run build` và kiểm tra HTML, sitemap, canonical, ảnh. Không tự tuyên bố Website OS engine PASS nếu chưa chạy engine.
8. Chỉ sau khi đủ hai reviewer độc lập + owner release approval theo `seo-web`, merge theo quy trình được phép và xác nhận Vercel production READY đúng SHA, URL HTTP 200, ảnh 200. Nếu chưa được duyệt: báo PR + HOLD; không báo đã đăng.
9. Tác vụ báo kết quả mỗi lượt: URL bài sống, commit, CI, production SHA hoặc nguyên nhân HOLD cụ thể. Khi không có chủ đề phù hợp, ưu tiên sửa bài cũ, lỗi kỹ thuật và ảnh; không chạy theo chỉ tiêu bài mới bất chấp chất lượng.

## Vai trò GitHub Actions

`.github/workflows/daily-publish.yml` là **monitor read-only**, không tạo bài viết/ảnh, không gọi API model, không tự merge/deploy. Tác vụ ChatGPT trực tiếp thực hiện phần sáng tạo; monitor kiểm tra tình trạng queue và URL production, gửi Telegram khi được cấu hình.

## An toàn

- Không thay DNS, tên miền chính, đầu số CTA hoặc cú pháp `MÃ_GÓI GB` gửi 290.
- Không giả đã xuất bản, giả lượt duyệt, giả index hoặc giả dữ liệu GSC.
- Trong giai đoạn Google biến động / SEO freeze được quản trị nêu, không tự thay đổi SEO production tùy ý.
- Không có cam kết 100% không lỗi hoặc ngày nào cũng đủ chủ đề hợp lệ; **không tạo bài mỏng để lấp lịch**.
