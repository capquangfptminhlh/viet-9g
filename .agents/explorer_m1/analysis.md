# Analysis Report: Milestone 1 - Technical SEO & AEO Optimization

## 1. Overview & Current Status Assessment

### 1.1 `index.html` Examination
- **Language Attribute**: Line 2 contains `<html lang="vi">`. Correctly set to Vietnamese.
- **Title Tag**: Line 6 contains `<title>Tra Cứu Gói Cước Viettel | Cổng Đăng Ký 4G/5G Di Động Trực Tuyến</title>`. Contains relevant keywords and proper branding.
- **Meta Description**: Line 7 contains `<meta name="description" content="Tra cứu và đăng ký các gói cước 4G/5G Viettel siêu tốc mới nhất 2026. Hướng dẫn soạn tin nhắn SMS đăng ký chính thức qua tổng đài 290 miễn phí dịch vụ." />`. Highly relevant, includes call-to-action and updated 2026 keyword.
- **Canonical Link**: Line 8 contains `<link rel="canonical" href="https://tracuugoicuoc.com/" />`. Points directly to the primary domain.
- **Open Graph & Social Media Tags**: Lines 11-21 contain basic OG and Twitter cards (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:url`, `twitter:title`, `twitter:description`).
  - *Gaps Identified*: Missing `og:site_name`, `og:locale` (`vi_VN`), `og:image:width`, `og:image:height`, `og:image:alt` for complete Facebook/Zalo link preview compliance.
- **JSON-LD WebSite Schema**: Lines 24-36 contain basic `WebSite` schema.
  - *Gaps Identified*: Lacks `alternateName` and explicit `inLanguage: "vi"`.
- **JSON-LD FAQPage Schema**: Lines 38-78 contain 4 FAQ items.
  - *Gaps Identified*: Out of sync with the actual 5 FAQ items rendered by `src/components/FaqAccordion.tsx` (defined in `src/data/packages.ts`). Two key FAQs regarding Agent Code 290 and SIM eligibility conditions are missing from the JSON-LD schema, and the answers in the schema differ from the full text in `src/data/packages.ts`.

### 1.2 `public/` Directory Assessment
- **`public/robots.txt`**: Present (5 lines, 71 bytes). Contains `User-agent: *`, `Allow: /`, `Sitemap: https://tracuugoicuoc.com/sitemap.xml`.
  - *Recommendation*: Enhance with explicit allowance for AI/AEO search engines (`GPTBot`, `ClaudeBot`, `PerplexityBot`) to improve Answer Engine Optimization (AEO).
- **`public/sitemap.xml`**: Present (10 lines, 267 bytes). Contains valid URL structure pointing to `https://tracuugoicuoc.com/` with `lastmod: 2026-07-29`.
- **`public/CNAME`**: Present (2 lines). Contains `tracuugoicuoc.com`.

---

## 2. Precise Recommended Changes

### 2.1 HTML Meta & Social Tag Enhancements for `index.html`

Add the following Open Graph & Zalo preview tags inside `<head>`:

```html
<!-- Open Graph / Zalo / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://tracuugoicuoc.com/" />
<meta property="og:title" content="Tra Cứu Gói Cước Viettel | Đăng Ký 4G/5G Trực Tuyến" />
<meta property="og:description" content="Tra cứu và đăng ký nhanh các gói cước 4G/5G Viettel siêu tốc mới nhất. Đăng ký qua tổng đài 290 miễn phí dịch vụ." />
<meta property="og:image" content="https://tracuugoicuoc.com/og-image.jpg" />
<meta property="og:site_name" content="Tra Cứu Gói Cước Viettel" />
<meta property="og:locale" content="vi_VN" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Tra Cứu Gói Cước Viettel 4G 5G" />
```

### 2.2 Precise JSON-LD WebSite Schema Structure for `index.html`

```json
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tra Cứu Gói Cước Viettel",
    "alternateName": [
      "tracuugoicuoc.com",
      "Cổng Đăng Ký 4G/5G Viettel"
    ],
    "url": "https://tracuugoicuoc.com/",
    "inLanguage": "vi",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tracuugoicuoc.com/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
</script>
```

### 2.3 Precise JSON-LD FAQPage Schema Structure for `index.html`
Synchronized 100% with `src/data/packages.ts` `FAQS` array:

```json
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Mã đại lý 290 là gì? Đăng ký có mất thêm chi phí trung gian không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tổng đài 290 là kênh đăng ký dịch vụ di động trực tuyến chính thức của Tổng Công Ty Viễn Thông Viettel. Khi bạn đăng ký có kèm mã số đại lý (ví dụ: DA, 352525287), hệ thống ghi nhận doanh số cho đại lý phát triển thuê bao. Bạn hoàn toàn KHÔNG MẤT thêm bất kỳ chi phí phát sinh nào, giá cước gói đăng ký được trừ trực tiếp vào tài khoản chính của SIM tương đương đúng bảng giá niêm yết của Viettel."
        }
      },
      {
        "@type": "Question",
        "name": "Điều kiện để đăng ký thành công các gói cước 4G/5G Viettel là gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Để đăng ký gói cước thành công, SIM của bạn cần thỏa mãn các điều kiện cơ bản sau:\n1. Là SIM di động Viettel đang hoạt động cả 2 chiều nghe và gọi.\n2. Thuộc đối tượng ưu đãi của gói cước (ví dụ: kích hoạt mới từ mốc thời gian quy định hoặc nằm trong danh sách khuyến mãi).\n3. Tài khoản chính (tài khoản gốc) của thuê bao trả trước phải có số dư lớn hơn hoặc bằng giá tiền của gói cước tại thời điểm soạn tin nhắn."
        }
      },
      {
        "@type": "Question",
        "name": "Làm thế nào để kiểm tra dung lượng Data tốc độ cao còn lại của gói?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trong quá trình sử dụng, bạn có thể dễ dàng kiểm tra dung lượng data còn lại bằng 2 cách:\n- Cách 1: Soạn tin nhắn văn bản miễn phí theo cú pháp: KTTK gửi 191.\n- Cách 2: Tải và đăng nhập ứng dụng My Viettel để tra cứu lưu lượng trực quan tại màn hình trang chủ."
        }
      },
      {
        "@type": "Question",
        "name": "Hủy gói cước 4G/5G Viettel như thế nào khi không còn nhu cầu sử dụng?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Khi không muốn gói cước tự động gia hạn ở chu kỳ tiếp theo, bạn có hai phương án để hủy:\n- Hủy gia hạn gói (vẫn được bảo lưu data và phút gọi còn lại sử dụng đến hết chu kỳ): Soạn HUY [Tên-Gói] gửi 191, sau đó soạn Y gửi 191 để xác nhận.\n- Hủy hoàn toàn gói cước ngay lập tức (mọi ưu đãi thừa sẽ mất ngay): Soạn HUYDATA [Tên-Gói] gửi 191, sau đó soạn Y gửi 191 để xác nhận."
        }
      },
      {
        "@type": "Question",
        "name": "Khi sử dụng hết Data tốc độ cao trong ngày thì kết nối Internet có bị trừ tiền ngoài gói không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Để bảo vệ quyền lợi và số dư trong tài khoản của khách hàng, hầu hết các gói cước thế hệ mới của Viettel (như dòng SD, MXH, V-B) đều tự động TẠM NGƯNG truy cập internet khi bạn đã dùng hết dung lượng tốc độ cao trong ngày. Do đó, bạn sẽ hoàn toàn không bị trừ thêm tiền phát sinh ở tài khoản chính. Bạn có thể mua thêm gói data ngày phụ trợ nếu cần tiếp tục kết nối."
        }
      }
    ]
  }
</script>
```

### 2.4 Complete Recommended Content for `public/robots.txt`

```txt
User-agent: *
Allow: /

# Explicit AI & AEO Crawler Allow Rules
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://tracuugoicuoc.com/sitemap.xml
```

### 2.5 Complete Recommended Content for `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tracuugoicuoc.com/</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```
