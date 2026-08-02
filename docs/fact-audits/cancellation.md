# Fact audit: checking, cancellation, and renewal

**Scope.** Package controls are package-specific. The evidence below supports only
the stated package or action; it must not be silently promoted into a universal
rule for every Viettel offer.

**Retrieval date:** 2026-08-02  
**Default review / expiry date:** 2026-11-02 (mobile-package terms are volatile)

| # | Factual claim (Vietnamese) | Official Viettel source | Retrieved | Expires | Suggested target path |
| --- | --- | --- | --- | --- | --- |
| 1 | Soạn `KTTK` gửi `191` để nhận SMS về dung lượng còn lại và hạn sử dụng của gói. | [098 Viettel: 4 cách kiểm tra lưu lượng](https://098.viettel.vn/tin-tuc/chi-tiet/bat-mi-4-cach-kiem-tra-thong-tin-luu-luong-goi-cuoc-viettel/12831304/) | 2026-08-02 | 2026-11-02 | `data/facts.json` (replace/general check fact) |
| 2 | Có thể đăng nhập `vietteltelecom.vn` để kiểm tra thông tin lưu lượng. | [098 Viettel: 4 cách kiểm tra lưu lượng](https://098.viettel.vn/tin-tuc/chi-tiet/bat-mi-4-cach-kiem-tra-thong-tin-luu-luong-goi-cuoc-viettel/12831304/) | 2026-08-02 | 2026-11-02 | `src/pages/huong-dan/kiem-tra-dung-luong-viettel.astro` |
| 3 | Có thể bấm `*098#`, gọi và làm theo hướng dẫn trên màn hình để tra cứu gói/lưu lượng. | [098 Viettel: 4 cách kiểm tra lưu lượng](https://098.viettel.vn/tin-tuc/chi-tiet/bat-mi-4-cach-kiem-tra-thong-tin-luu-luong-goi-cuoc-viettel/12831304/) | 2026-08-02 | 2026-11-02 | `src/pages/huong-dan/kiem-tra-dung-luong-viettel.astro` |
| 4 | Trên My Viettel, mục kiểm tra hiển thị lưu lượng data, tên gói và thời hạn sử dụng. | [098 Viettel: kiểm tra data 4G trên My Viettel](https://098.viettel.vn/tin-tuc/chi-tiet/cach-kiem-tra-dung-luong-data-4g-tren-my-viettel-sieu-don-gian/19202908) | 2026-08-02 | 2026-11-02 | `src/pages/huong-dan/kiem-tra-dung-luong-viettel.astro` |
| 5 | Tổng đài `198` được bài hướng dẫn của Viettel nêu là miễn phí để hỗ trợ/tư vấn. | [098 Viettel: kiểm tra data 4G trên My Viettel](https://098.viettel.vn/tin-tuc/chi-tiet/cach-kiem-tra-dung-luong-data-4g-tren-my-viettel-sieu-don-gian/19202908) | 2026-08-02 | 2026-11-02 | `src/pages/huong-dan/huy-goi-cuoc-viettel.astro` |
| 6 | Với GIC70/GIC70T, hệ thống tự động gia hạn sau 30 ngày với cước 70.000 đồng. | [Viettel Shop: GIC70 và GIC70T](https://shop.viettel.vn/tin-tuc/chi-tiet/dang-ky-ngay-goi-cuoc-%E2%80%9Cthuong-hieu-tre%E2%80%9D-gic70-va-gic70t-de-nhan-sieu-uu-dai-data-hap-dan/11385444/) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped GIC fact) |
| 7 | Với GIC70/GIC70T, soạn `KTTK` gửi `191` để kiểm tra data còn lại. | [Viettel Shop: GIC70 và GIC70T](https://shop.viettel.vn/tin-tuc/chi-tiet/dang-ky-ngay-goi-cuoc-%E2%80%9Cthuong-hieu-tre%E2%80%9D-gic70-va-gic70t-de-nhan-sieu-uu-dai-data-hap-dan/11385444/) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped GIC fact) |
| 8 | Với GIC70/GIC70T, soạn `HUY` gửi `191` để hủy gia hạn. | [Viettel Shop: GIC70 và GIC70T](https://shop.viettel.vn/tin-tuc/chi-tiet/dang-ky-ngay-goi-cuoc-%E2%80%9Cthuong-hieu-tre%E2%80%9D-gic70-va-gic70t-de-nhan-sieu-uu-dai-data-hap-dan/11385444/) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped GIC fact) |
| 9 | Với GIC70/GIC70T, soạn `HUYDATA` gửi `191` để hủy gói cước. | [Viettel Shop: GIC70 và GIC70T](https://shop.viettel.vn/tin-tuc/chi-tiet/dang-ky-ngay-goi-cuoc-%E2%80%9Cthuong-hieu-tre%E2%80%9D-gic70-va-gic70t-de-nhan-sieu-uu-dai-data-hap-dan/11385444/) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped GIC fact) |
| 10 | Gói YT7 được gia hạn sau 7 ngày. | [098 Viettel: gói data YouTube](https://098.viettel.vn/tin-tuc/chi-tiet/diem-danh-cac-goi-cuoc-data-viettel-xem-youtube-khong-gioi-han/10454296) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped YT7 fact) |
| 11 | Với YT7, `HUY YT7` gửi `191` là hướng dẫn hủy gia hạn; ưu đãi còn lại được bảo lưu đến hết chu kỳ. | [098 Viettel: gói data YouTube](https://098.viettel.vn/tin-tuc/chi-tiet/diem-danh-cac-goi-cuoc-data-viettel-xem-youtube-khong-gioi-han/10454296) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped YT7 fact) |
| 12 | Với YT7, `HUYDATA YT7` gửi `191` là hướng dẫn hủy gói cước. | [098 Viettel: gói data YouTube](https://098.viettel.vn/tin-tuc/chi-tiet/diem-danh-cac-goi-cuoc-data-viettel-xem-youtube-khong-gioi-han/10454296) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped YT7 fact) |
| 13 | Gói YT30 được gia hạn sau 30 ngày. | [098 Viettel: gói data YouTube](https://098.viettel.vn/tin-tuc/chi-tiet/diem-danh-cac-goi-cuoc-data-viettel-xem-youtube-khong-gioi-han/10454296) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped YT30 fact) |
| 14 | Với YT30, `HUY YT30` gửi `191` hủy gia hạn, còn `HUYDATA YT30` gửi `191` hủy gói. | [098 Viettel: gói data YouTube](https://098.viettel.vn/tin-tuc/chi-tiet/diem-danh-cac-goi-cuoc-data-viettel-xem-youtube-khong-gioi-han/10454296) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped YT30 fact) |
| 15 | Với ST5KM, gói tự động gia hạn khi hết chu kỳ; hủy dùng cú pháp `HUYDATA ST5KM` gửi `191`, theo hướng dẫn tiếp theo của hệ thống, và data còn lại không được bảo lưu sau khi hủy. | [Viettel Shop: gói data ngày ST5KM/ST10K](https://shop.viettel.vn/tin-tuc/chi-tiet/danh-sach-cac-goi-cuoc-data-ngay-viettel-chi-voi-5k-10k/10530408) | 2026-08-02 | 2026-11-02 | `data/facts.json` (package-scoped ST5KM fact) |

## Editorial guardrails

- Keep the wording **package-scoped** unless a current official source explicitly
  establishes a universal rule. In particular, this audit does not prove that
  every package uses `HUY`, `HUYDATA`, or the same confirmation step.
- Treat `HUY` (stop renewal) and `HUYDATA` (cancel the package) as separate
  actions only where the cited package source makes that distinction.
- Before publication, re-open the cited page and reconfirm the action, shortcode,
  fee, cycle, and preservation outcome. Do not infer a cancellation fee from the
  above sources.
