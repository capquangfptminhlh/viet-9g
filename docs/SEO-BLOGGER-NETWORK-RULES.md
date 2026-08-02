# Quy tắc vận hành mạng Blogger SEO

## Mục tiêu

Mạng Blogger hỗ trợ người dùng tìm thông tin hữu ích và dẫn về trang đích phù hợp trên website chính. Đây không phải hệ thống nhân bản nội dung hoặc tạo liên kết hàng loạt.

## Phân vai 5 Blogger

| Blog | Chủ đề độc quyền | Không được đăng |
| --- | --- | --- |
| Blog 1 | Hướng dẫn sử dụng 4G/5G Viettel | Review/bán gói cước |
| Blog 2 | Kiểm tra, hủy và gia hạn gói | Tin tức/khuyến mãi |
| Blog 3 | Review và so sánh gói cước | Hướng dẫn hủy/khắc phục lỗi |
| Blog 4 | Khắc phục sự cố, lỗi mạng, SIM và thiết bị | Review hoặc quảng bá gói cước |
| Blog 5 | Tin tức và khuyến mãi có nguồn Viettel chính thức | Tin chưa có nguồn chính thức |

## Quy tắc xuất bản

1. Mỗi Blogger tối đa một bài mỗi ngày.
2. Mỗi topic chỉ thuộc một Blogger và có một `targetBlogId` duy nhất.
3. Không dùng lại HTML, ảnh, title, slug hoặc dàn ý giữa Blogger và website chính.
4. Mỗi bài có tối đa một link về website chính; URL phải đúng ngữ cảnh của bài.
5. Chỉ xuất bản topic `active` có facts còn hạn và nguồn Viettel hợp lệ.
6. Gói chỉ ở trạng thái `operator_verified` được hiển thị CTA ở web chính nhưng không là nguồn để Blogger tự xuất bản.
7. Bài không qua fact, link, duplicate, HTML hoặc ledger gate phải HOLD; không thử topic khác trong cùng lượt chạy.
8. Không xóa ledger, không xóa audit, không đổi content version để vượt qua idempotency nếu chưa kiểm tra post trên Blogger.

## Nội dung và hình ảnh

1. Mỗi bài dùng ảnh AI tạo mới, đúng nội dung và khác ảnh của bài web chính.
2. Không dùng ảnh có logo Viettel hoặc tuyên bố giá/ưu đãi nếu fact không xác minh điều đó.
3. Nội dung phải có giá trị hướng dẫn/review/tin tức thực; không nhồi từ khóa hoặc lặp câu CTA.
4. Review phải có ưu điểm, hạn chế, đối tượng phù hợp và điều cần cân nhắc.
5. Tin khuyến mãi phải nêu nguồn và ngày hiệu lực; hết hạn phải HOLD.

## An toàn kỹ thuật

1. Lịch auto-publish: 07:00 giờ Việt Nam.
2. Ledger là nguồn sự thật để chống đăng trùng; reservation phải được lưu trước khi gọi Blogger API.
3. Sau publish phải read-back xác nhận ID, title, labels, link policy và trạng thái `LIVE`.
4. Nếu API hoặc read-back lỗi, ghi `VERIFY_FAILED`, giữ audit và dừng.
5. Chỉ nhánh `main` được phép publish; các nhánh khác chỉ dùng để kiểm thử.
6. Không để OAuth secret trong repository, log hay summary.

## Quy trình thêm Blogger mới

1. Tạo Blogger thủ công trên cùng tài khoản Google đã cấp OAuth.
2. Đặt tên, mô tả, theme tối giản, trang Giới thiệu/Chính sách riêng cho đúng chủ đề blog.
3. Lấy Blog ID và xác định đúng phân vai trong bảng trên.
4. Thêm site vào `config/blogger-sites.json` với `enabled: false`.
5. Yêu cầu Codex tạo tối thiểu 14 topic riêng cho blog đó; mỗi topic phải có intent, target URL, fact IDs và nguồn còn hạn.
6. Chạy preview + test; kiểm tra không trùng HTML/link với các blog còn lại.
7. Bật `enabled: true`, chạy một lượt thủ công, kiểm tra post LIVE và ledger.
8. Chỉ sau đó để lịch 07:00 tự vận hành.

## Dấu hiệu phải HOLD ngay

- Nguồn fact hết hạn, thiếu hoặc không thuộc allowlist.
- URL đích không khớp chủ đề.
- Bài/ảnh có dấu hiệu giống bài đã đăng.
- Blogger/Google gửi cảnh báo spam hoặc giới hạn tài khoản.
- Một blog có index, impressions hoặc traffic giảm bất thường trong nhiều tuần.

## Chỉ số theo dõi hàng tháng

- Số bài LIVE, HOLD và VERIFY_FAILED theo từng Blogger.
- Index, impressions, CTR và vị trí từ Google Search Console.
- Click referral về website chính và tỷ lệ chuyển đổi CTA.
- Tỷ lệ nội dung trùng/thiếu source phát hiện bởi pipeline: phải bằng 0.

## Tạo batch topic

Không có bot tự nghĩ hoặc tự thêm topic. Khi queue của một blog còn dưới 14 bài, chủ sở hữu yêu cầu Codex tạo batch mới. Codex phải tạo topic từ fact chính thức còn hạn, chạy kiểm tra trùng/ngữ cảnh, rồi mới commit queue; Publisher tự động chỉ có quyền xuất bản các topic đã qua bước này.
