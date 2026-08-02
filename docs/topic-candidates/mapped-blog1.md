# Blog 1 mapping audit

**Target blog:** `5229528996284551001` (Cẩm nang 4G Viettel)  
**Audit date:** 2026-08-02  
**Scope:** 4G/5G usage guides only; no package reviews/sales and no cancellation, renewal, or troubleshooting content.  
**Result:** `0` safe `QUEUE` mappings. No change to `config/topics.json` is warranted.

A mapping is eligible only where the fact is unexpired, its source is an official Viettel domain, the topic stays within Blog 1's charter, and the target is a live, context-matched website route. The sitemap was used to validate target routes.

## Valid mappings

None. `data/facts.json` contains no fact that satisfies all four gates for a distinct Blog 1 topic.

## HOLD exclusions

| Fact ID | Candidate topic | Existing target checked | Status | HOLD reason |
| --- | --- | --- | --- | --- |
| `fact-1` | V120B: what 1.5GB/day over 30 days means | `/goi-cuoc/v120b` | HOLD | `NON_VIETTEL_SOURCE`: the source is `tracuugoicuoc.com`, not a Viettel first-party domain; it is also package-specific rather than a usage guide. |
| `fact-2` | How to understand SD90's monthly allowance | `/goi-cuoc/sd90` | HOLD | `NON_VIETTEL_SOURCE_AND_PACKAGE_REVIEW_SCOPE`: the source is not first-party, and the fact supports a package review, which belongs outside Blog 1. |
| `fact-3` | Understanding MXH120 social-video data benefits | `/goi-cuoc/mxh120` | HOLD | `NON_VIETTEL_SOURCE_AND_PACKAGE_REVIEW_SCOPE`: the source is not first-party, and the fact is a package benefit claim rather than an independent usage guide. |
| `fact-4` | Check remaining Viettel data with KTTK/191 | `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại` | HOLD | `NON_VIETTEL_SOURCE_AND_CHARTER_MISMATCH`: the route exists, but the source is not first-party and data checking is allocated to the checking/cancellation blog, not Blog 1. |
| `fact-5` | Distinguish `HUY` from `HUYDATA` via 191 | `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động` | HOLD | `CHARTER_MISMATCH_AND_DUPLICATE_INTENT`: the first-party source is unexpired, but cancellation is outside Blog 1 and is already represented by cancellation topics. |
| `fact-6` | Check 4G speed with Speedtest or fast.com | No context-matched route in the sitemap | HOLD | `NO_VALID_TARGET_AND_DUPLICATE_INTENT`: the first-party source is unexpired, but no speed-test destination route exists; the existing `topic-kiem-tra-toc-do` already covers the same intent and points to a non-existent `/huong-dan/kiem-tra-toc-do-mang/` route. |
| `fact-7` | What ST15K's 3GB/3-day allowance covers | No `/goi-cuoc/st15k` route in the sitemap | HOLD | `PACKAGE_REVIEW_SCOPE_AND_NO_VALID_TARGET`: the first-party source is unexpired, but it supports a package-specific review, not Blog 1's usage-guide charter, and the proposed ST15K route is absent. |

## Required evidence before a Blog 1 queue can be created

Add an unexpired first-party Viettel fact for a distinct 4G/5G setup or usage task, then provide an existing context-matched website route. Reusing `fact-5`, `fact-6`, or `fact-7` would fail the charter, duplicate-intent, or target gate above.
