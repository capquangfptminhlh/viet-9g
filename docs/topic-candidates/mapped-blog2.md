# Blog 2 mapped candidates — 4G/5G setup and use

**Target blog:** `5656849674298814641` — Thủ thuật 4G/5G Viettel  
**Charter:** Guides for setting up and using 4G/5G Viettel only.  
**Audit date:** 2026-08-02  
**Evidence:** `data/facts.json` and `public/sitemap.xml`.

All destination paths below are present in the sitemap. A mapping is eligible only
when its proposed article can stay within the exact wording of its cited fact.

## Valid mapping

| title | intent | targetUrlPath | sourceFactIds | fact-bounded angle | status |
| --- | --- | --- | --- | --- | --- |
| Cách kiểm tra dung lượng data 4G Viettel còn lại qua KTTK và *098# | how-to | `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại` | `fact-4` | State only that `KTTK` sent to `191` checks the data allowance in use, and that `*098#` opens Viettel's general lookup/service-registration menu. Do not claim that every menu path, package type, or response format is identical. | `VALID` |

## HOLD exclusions

| proposed angle | sourceFactIds | existing target URL considered | HOLD reason |
| --- | --- | --- | --- |
| Hướng dẫn đo tốc độ 4G Viettel bằng Speedtest hoặc fast.com | `fact-6` | `/` | `TARGET_CONTEXT_MISMATCH`: the sitemap has no speed-test or network-speed destination. The root route is not a context-specific target. |
| Tốc độ 4G Viettel trung bình 30–50 Mbps | `fact-6` | `/` | `TARGET_CONTEXT_MISMATCH` and `PERFORMANCE_CLAIM`: no matching speed route; the fact is limited to standard conditions and must not become a user-level speed promise. |
| Cách sử dụng gói ST15K trong 3 ngày | `fact-7` | none | `NO_EXISTING_TARGET_URL`: no `/goi-cuoc/st15k` route appears in the sitemap. The fact also supports price, duration, and allowance only—not a usage workflow. |
| Hủy hoặc dừng gia hạn gói data qua 191 | `fact-5` | `/posts/cach-huy-gia-han-4g-viettel` | `CHARTER_MISMATCH`: cancellation and renewal guidance belongs to Blog 3, not Blog 2. |
| Chọn gói V120B, SD90, hoặc MXH120 | `fact-1`, `fact-2`, `fact-3` | matching package routes exist | `CHARTER_MISMATCH`: these are package pricing/benefit claims, not setup or use guidance for Blog 2. |

## Release decision

`1` candidate is valid for a future Blog 2 queue and has an existing, relevant
destination. The remaining fact areas stay on hold; do not add them to
`config/topics.json` for Blog 2 without a matching route and charter fit.
