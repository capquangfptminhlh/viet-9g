# Quy tắc vận hành SEO/AEO - Viettel 4G

Tài liệu này là bản áp dụng của `SEO_AEO_Operating_System_Blueprint` cho `tracuugoicuoc.com` và mạng Blogger. Nó là policy vận hành, không phải lời hứa về index, thứ hạng, AI citation, traffic hay doanh thu.

## 1. Nguồn dữ liệu và CTA

- Mọi claim về giá, chu kỳ, dung lượng, ưu đãi, điều kiện áp dụng, cú pháp SMS hoặc chính sách phải có fact còn hiệu lực từ nguồn Viettel trong fact store.
- Fact hết hạn, không có nguồn allowlist hoặc không khớp với package catalog làm topic chuyển `HOLD`; không được suy đoán để đủ queue.
- Package catalog có bốn trạng thái vận hành: `active`, `operator_verified`, `HOLD` và `expired`. Gói được hiển thị/đặt CTA phải có trạng thái được policy cho phép và đủ fact còn hiệu lực; `HOLD` và `expired` không được tự động đưa CTA.
- CTA đăng ký gói đang dùng mã đại lý `GB`. Không thay mã này bằng nội dung sinh tự động.

## 2. Website chính

- Một URL chỉ có một canonical, intent và CTA chính. Không tạo URL chỉ để phủ keyword hoặc tranh cùng intent.
- Bài mới phải có answer-first opening, evidence, internal links có ngữ cảnh, media liên quan và release record.
- Worker xuất bản web chính không được đưa claim/cú pháp do mô hình tự nghĩ ra vào production. Claim nhạy cảm phải đi qua facts/package catalog; media phải đi qua manifest.
- Sau deploy, kiểm tra route public, canonical, robots, sitemap, schema, asset và nội dung chính. Fail critical route thì rollback thay vì chạy bù.

## 3. Mạng Blogger năm kênh

| Kênh | Charter | Nhóm intent |
| --- | --- | --- |
| Cẩm nang 4G Viettel | Cách dùng 4G/5G, eSIM, roaming | informational |
| Thủ thuật 4G/5G Viettel | Thao tác thiết bị, USSD, thiết lập | instructional |
| Kiểm tra & Hủy gói Viettel | Dung lượng, hạn dùng, hủy/gia hạn | data-check, cancellation |
| Review Gói Cước Viettel | Đánh giá, so sánh có điều kiện | review |
| Hỗ trợ Lỗi Mạng Viettel | SIM/eSIM/SMS/kết nối/roaming | troubleshooting |

- Mỗi run Blogger tối đa một bài và mỗi blog tối đa một bài/ngày theo giờ Việt Nam. Không chạy bù hàng loạt khi lỗi hoặc queue lớn.
- Bài Blogger phải khác title, angle, cấu trúc và mục đích với bài web chính; link chỉ về URL đúng ngữ cảnh và có UTM.
- Publish chỉ xảy ra khi lần lượt pass: policy mode, fact freshness/source, URL/link policy, duplicate/idempotency, media manifest, Blogger API response, read-back và public URL.
- `dry_run`, `review_required`, high-risk topic, hoặc `killSwitchActive: true` đều là trạng thái không publish. Quyết định `HOLD` phải lưu vào ledger cùng reason code.

## 4. Ảnh và media

- Mỗi topic `QUEUE` cần `imageBrief`, `imageAlt` và asset riêng trong `state/media-manifest.json`.
- Asset được tạo từ brief, có topic ID, hash, URL public, alt text và timestamp để audit. Không dùng placeholder, ảnh không liên quan, logo giả, QR thật, giá/cú pháp chưa được xác minh hoặc ảnh làm “bằng chứng” cho product claim.
- Blogger chỉ nhúng ảnh đã có URL HTTPS trên domain web chính. Nếu asset chưa được deploy public thì topic `HOLD`.
- Khi đổi title/intent/brief/alt, tạo asset hash mới; không tái sử dụng hình cũ cho một claim mới.

## 5. Automation, incident và đo lường

- Không ghi secret, token, file service account, PII hoặc khóa Google Ads/Blogger vào repo, log, summary, artifact hay prompt.
- Hai lỗi nghiêm trọng liên tiếp, public mismatch, post ngoài ledger hoặc nguy cơ lộ secret: bật kill switch, dừng publish, giữ evidence, xác định commit tốt gần nhất và thêm regression test trước khi chạy lại.
- Không dùng OAuth Blogger cho Google Ads. Google Ads có OAuth client, refresh token và developer token riêng; chỉ kết nối sau khi landing page, tracking và disclosure được duyệt policy.
- Báo cáo tuần xem queue health, fact expiry, publishes/holds/errors, crawl/indexability, GSC impressions/CTR/position/clicks, referral Blogger và conversion. Kết luận theo baseline: `IMPROVED`, `NO_CLEAR_SIGNAL`, `REGRESSED` hoặc `INCONCLUSIVE`.
