# SEO Viettel — nghiên cứu và quyết định 19/11/2026

**Status:** RESEARCHED / READY_FOR_HUMAN_REVIEW; **production release HOLD**. Source: `capquangfptminhlh/seo-web@6d0b7c7c4d8458746f552704ce8d6fe517d9c847`, manifest 1.4.0, SEO Alpha 1.0.0. Read central mandatory order and SEO lab handbook during this execution. Current project K0 record: PASS for existing URL remediation, but **expansion remains HOLD**. Website OS engine has **not** been executed for this change; do not infer PASS.

## Five first-party source-verified search intents

| Intent / evidence | Existing canonical owner | Decision |
|---|---|---|
| Kiểm tra data Viettel còn lại / ứng dụng Tammi; Viettel 17/09/2026 [source](https://www.viettel.vn/tin-tuc/chi-tiet/tam-biet-my-viettel-bat-dau-hanh-trinh-moi-cung-viettel-tammi/12026648), Viettel 19/05/2025 [source](https://098.viettel.vn/tin-tuc/chi-tiet/bat-mi-4-cach-kiem-tra-thong-tin-luu-luong-goi-cuoc-viettel/12831304/) | `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` | **PR correction to existing URL**. 2024 page contained stale unverified plan data and claimed official agent status. Remove stale commercial assertions, retain existing canonical. Human review mandatory before release |
| eSIM Viettel đổi máy, QR cũ vs iOS no-QR; Viettel 18/08/2026 [source](https://www.viettel.vn/tin-tuc/chi-tiet/esim-viettel-cham-la-ket-noi-kich-hoat-khong-can-ma-qr/13707592) | `/posts/esim-viettel-doi-may-quet-lai-qr/` | **NO NEW URL**. Existing guide explicitly differentiates the two scenarios |
| eSIM có phát hotspot; Viettel 01/02/2026 [source](https://098.viettel.vn/tin-tuc/chi-tiet/giai-dap-esim-co-phat-wi-fi-duoc-khong-cach-chia-se-mang-don-gian/10594300) | `/posts/esim-viettel-co-phat-wifi-hotspot/` | **NO NEW URL**. Existing canonical guide covers intent |
| Bật VoLTE khi chuyển đổi 2G; Viettel 14/04/2026 [source](https://098.viettel.vn/tin-tuc/huong-dan-bat-dich-vu-cuoc-goi-volte-goi-chat-luong-tot-hon-an-toan-hon/15298552) | `/posts/bat-volte-viettel-android/` and `/posts/cai-dat-4g-5g-volte-iphone-viettel/` (device-specific) | **NO NEW URL**. Distinct device-intent owners already exist |
| Chuyển từ My Viettel sang Tammi; Viettel 17/09/2026 [source](https://www.viettel.vn/tin-tuc/chi-tiet/tam-biet-my-viettel-bat-dau-hanh-trinh-moi-cung-viettel-tammi/12026648) | `/posts/my-viettel-1-10-2026-chuyen-sang-tammi/` | **NO NEW URL**. Existing owner already explains migration |

**Evidence quality:** OFFICIAL primary sources; no observed GSC query/page rows, search volume, CPC, ranking or conversion data. These metrics remain **UNKNOWN**, not zero. GSC Wizard access refused with `payment_required` on 19/11/2026, so 28-day vs 28-day and 90-day baseline unavailable. No unsupported ranking lift claim.

## Risk and release

- 2026-11-10 to 2026-11-24 is a **provisional SEO volatility freeze** in central alpha playbook, not a verified Google rollout announcement. This PR is a **factual correction proposal**, not permission to deploy.
- Article correction replaces outdated 2024 figures, removes unverified affiliate-status claim and preserves the existing slug. It does not change the site's 290 CTA contract, DNS, sitemap, robots, canonical tags or commercial landing pages.
- Original SVG is `public/images/editorial/kiem-tra-data-viettel-tammi-2026.svg`. No copied Viettel screenshot. Verify rendered SVG, mobile and asset HTTP 200 in preview before approval.
- Mandatory checks: `npm test`, `npm run k0:check`, `npm run build`, SEO Alpha source verification, Website OS enforcement engine, K0 article decision, HTML/canonical/asset QA, **two independent human reviews and explicit owner release approval**.
- Until these gates PASS and production SHA READY + URL 200 are verified, publication remains **HOLD**. No automatic merge or bypass.
