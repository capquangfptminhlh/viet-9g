# Google Search Indexing & Search Console Setup

## Mục tiêu
Dự án `tracuugoicuoc.com` là website nội dung/gói cước thông thường. Không sử dụng Google Indexing API để ép index URL gói cước hoặc bài viết.

Google quy định Indexing API chỉ dành cho trang có `JobPosting` hoặc `BroadcastEvent` nhúng trong `VideoObject`. Website này không thuộc hai loại đó, vì vậy chiến lược index đúng là sitemap + crawlable internal links + Search Console monitoring.

## 1. Sitemap production

Astro tự sinh `sitemap-index.xml` khi build. Production phải đáp ứng:

- `https://www.tracuugoicuoc.com/sitemap-index.xml` trả HTTP 200.
- Canonical trong sitemap và canonical trên từng trang cùng hostname `www.tracuugoicuoc.com`.
- `robots.txt` không chặn các URL muốn index.
- Mỗi URL indexable phải tự canonical hoặc canonical đến URL owner đã được chốt.

Gửi `sitemap-index.xml` trong Search Console > Sitemaps. Việc gửi sitemap là tín hiệu discovery, không phải cam kết Google sẽ index hoặc xếp hạng.

## 2. Search Console là nguồn đo bắt buộc

Dự án đã có script đọc Search Analytics API:

```bash
npm run gsc:query-page
```

Credential hỗ trợ:

```bash
GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' npm run gsc:query-page
```

hoặc file local bị gitignore:

```bash
GSC_KEY_FILE=gsc-service-account.json npm run gsc:query-page
```

Property mặc định:

```text
sc-domain:tracuugoicuoc.com
```

Output mặc định:

```text
state/gsc/query-page-latest.csv
```

Không được kết luận "SEO đã lên top" chỉ từ Lighthouse, build, schema hoặc AUD-21. Báo cáo tăng trưởng phải dùng dữ liệu GSC thật gồm query, page, clicks, impressions, CTR và average position.

## 3. Quy tắc xử lý theo dữ liệu GSC

Ưu tiên theo thứ tự:

1. URL có impression nhưng position 8-30: tối ưu title/H1, intent coverage, internal links và content usefulness.
2. URL position 1-10 nhưng CTR thấp: tối ưu title/meta theo query thật, không clickbait.
3. Nhiều URL cùng nhận impression cho một query: audit cannibalization và chốt một owner.
4. URL không có impression: kiểm tra crawl/indexing, internal links, sitemap, chất lượng/nội dung trùng trước khi viết thêm.
5. Chỉ tạo cluster mới khi có search intent và fact source đủ mạnh; không tăng số lượng bài chỉ để đạt quota.

## 4. URL Inspection

Dùng URL Inspection trong Search Console để kiểm tra các money page và hub quan trọng. Request indexing thủ công chỉ dùng như tín hiệu crawl cho một số URL quan trọng sau khi sửa; không dùng automation lách hạn mức.

## 5. Không dùng Indexing API cho dự án này

Không tạo service account với mục tiêu gọi `indexing.googleapis.com/v3/urlNotifications:publish` cho các trang gói cước/bài blog. Không coi HTTP 200 từ Indexing API là bằng chứng URL sẽ được index hoặc rank.

Nếu trong lịch sử dự án còn tài liệu/handoff nói "Google Auto-Indexing API" là milestone hoàn tất cho website gói cước, coi phần đó là legacy và không dùng làm tiêu chuẩn production.

## 6. Definition of Done cho SEO production

Technical gate chỉ là điều kiện cần. Một chu kỳ SEO chỉ được đánh giá thành công khi có dữ liệu GSC so sánh kỳ trước và kỳ sau, tối thiểu theo 28 ngày và 90 ngày:

- impressions theo cluster;
- clicks organic;
- CTR;
- average position;
- số query/page có impression;
- cannibalization query-page;
- top landing pages tăng/giảm.

Không hứa vị trí số 1. Mục tiêu là tăng visibility và traffic organic dựa trên dữ liệu đo được, không dựa vào điểm audit nội bộ.
