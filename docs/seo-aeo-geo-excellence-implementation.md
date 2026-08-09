# SEO / AEO / GEO Excellence — Implementation Contract

Ngày triển khai: 2026-08-09

## Mục tiêu

Nâng tầng technical SEO/AEO/GEO của `tracuugoicuoc.com` theo nguyên tắc: crawl/index rõ ràng, entity nhất quán, structured data khớp nội dung hiển thị, dữ kiện có bằng chứng và regression phải bị chặn trước khi merge.

Tài liệu này bổ sung cho `docs/seo-aeo-operating-rules.md`; không thay đổi fact gate, package catalog policy hoặc quy tắc HOLD hiện có.

## Invariants bắt buộc

1. Canonical dùng duy nhất origin `https://www.tracuugoicuoc.com`, không chứa query/hash và mỗi HTML có đúng một canonical.
2. `og:url` phải trùng canonical.
3. Mỗi HTML có title, description, robots meta và JSON-LD parse hợp lệ.
4. Trang con có `BreadcrumbList`; bài dưới `/posts/` có `Article`; các trang còn lại có `WebPage`.
5. Trang 404 là `noindex,follow` và bị loại khỏi sitemap.
6. `robots.txt` trỏ tới `/sitemap-index.xml`, đúng output của `@astrojs/sitemap`.
7. `llms.txt` chỉ mô tả cấu trúc/policy. Nó không thay thế robots, sitemap, canonical, structured data hoặc HTML công khai.
8. Schema không được tạo claim mới. Gói cước chỉ được public từ `getPackageRoutes()` / verified package gate hiện có.
9. Trang chi tiết gói đưa URL nguồn vào `citation` và thời điểm retrieval vào `dateModified` khi dữ liệu có sẵn.
10. Build phải FAIL nếu quality gate phát hiện lỗi critical.

## Entity graph

`BaseLayout.astro` là nguồn chuẩn cho graph dùng chung:

- `Organization`: TraCuuGoiCuoc.com, được mô tả rõ là trang thông tin độc lập, không phải website chính thức Viettel.
- `WebSite`: canonical site, ngôn ngữ `vi-VN`, publisher trỏ về Organization.
- `WebPage` hoặc `Article`: URL canonical, title/description, publisher và quan hệ với WebSite.
- `BreadcrumbList`: sinh từ route; route `/posts/*` đi qua `/tin-tuc` thay vì tạo breadcrumb giả `/posts`.
- Schema riêng của từng page (ví dụ `ItemList`) được bổ sung qua prop `jsonLd`.

Không dùng `SearchAction` khi website không có search endpoint tương ứng.

## Article metadata

Với route `/posts/*`, layout tự đọc content collection để lấy `description` và `date` từ frontmatter nếu page không truyền trực tiếp. Nếu thiếu description, layout dùng fallback trung tính dựa trên title; không tự sinh product claim.

## Package metadata

Route `/goi-cuoc/[id]` chỉ được tạo từ verified package routes. Metadata được tạo từ cùng object đã qua fact gate:

- code gói;
- giá và chu kỳ;
- dữ liệu đã xác minh;
- `sourceUrl` làm citation;
- `updatedAt` làm modified time.

Không thêm giá/cú pháp/ưu đãi ngoài object verified.

## Quality gate

`scripts/aud-21-audit.js` chạy sau `astro check` và `astro build`. Critical failures gồm:

- thiếu hoặc nhiều title/description/robots/canonical;
- canonical sai origin, có query/hash hoặc trùng URL khác;
- `og:url` lệch canonical;
- JSON-LD không parse được;
- thiếu đúng page schema hoặc breadcrumb schema;
- 404 thiếu noindex;
- href rỗng/undefined;
- thiếu `robots.txt`, `sitemap-index.xml`, `llms.txt`;
- robots trỏ sai sitemap;
- 404 lọt vào sitemap.

H1 count, duplicate title và description length hiện là warning để tránh khóa release vì legacy content; chúng vẫn được ghi vào report để xử lý theo backlog.

Báo cáo được ghi tại `state/audit/YYYY-MM-DD.json` và build nhận exit code khác 0 khi có critical issue.

## CI / merge gate

Workflow `.github/workflows/quality.yml` chạy trên Pull Request:

1. `npm ci`
2. `npm test`
3. `npm run build`

PR không nên merge khi workflow này fail.

## Đo lường sau release

Không đánh giá thành công bằng lời hứa về rank hoặc AI citation. Theo dõi theo baseline trong policy hiện có:

- crawl/indexability và lỗi canonical/sitemap/schema;
- GSC impressions, clicks, CTR, position theo nhóm intent;
- coverage của URL gói verified và bài editorial;
- số HOLD/expired/fact-expiry và regression;
- referral/conversion chỉ kết luận khi có dữ liệu đủ và attribution rõ.

## Rollback

Nếu route public, canonical, sitemap hoặc schema phát sinh critical regression, rollback về commit tốt gần nhất trước khi tiếp tục publish tự động. Không dùng content generation để “bù” lỗi technical SEO.

## Ghi chú nguồn spec

Tên spec được người vận hành cung cấp là `docs/superpowers/specs/2026-08-09-seo-aeo-geo-excellence-design.md`. Tại thời điểm triển khai qua GitHub connector, file đó chưa có trên các ref remote khả dụng; implementation này vì vậy bám policy SEO/AEO đang có trong repository và source `main` hiện hành. Khi spec local được push, cần diff contract này với spec để phát hiện yêu cầu riêng còn thiếu trước khi merge cuối cùng.
