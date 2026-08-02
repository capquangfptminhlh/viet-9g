# Blog 3 — fact-backed topic mapping

**Target blog:** `2757413717171314447`
**Charter:** Checking data, cancellation, and renewal guidance only.
**Audit date:** 2026-08-02

This is a mapping audit, not a change to `config/topics.json`. A mapping is usable only when its `sourceFactIds` exist in `data/facts.json`, the cited claim is no broader than the fact, and its `targetUrlPath` exists in the current generated site. “Mapped — not queued” means a future topic can be created only after normal editorial, freshness, and duplicate checks; it is not an instruction to publish.

## Verified route inventory

| targetUrlPath | Verified generated artifact | Use in this audit |
| --- | --- | --- |
| `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` | `dist/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/index.html` | Data-use check by SMS |
| `/posts/cach-kiem-tra-tai-khoan-chinh/` | `dist/posts/cach-kiem-tra-tai-khoan-chinh/index.html` | General USSD/account-check context |
| `/posts/cach-huy-gia-han-4g-viettel/` | `dist/posts/cach-huy-gia-han-4g-viettel/index.html` | Cancellation/renewal guidance |

## Valid, non-overlapping mappings

| # | Proposed title | Intent | targetUrlPath | sourceFactIds | Exact supported scope | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Kiểm tra lưu lượng data Viettel đang dùng bằng KTTK gửi 191 | checking | `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` | `fact-4` | `KTTK` gửi `191` để kiểm tra lưu lượng data Viettel đang dùng. | MAPPED — NOT QUEUED |
| 2 | *098# dùng để vào menu tra cứu tổng hợp Viettel như thế nào? | checking | `/posts/cach-kiem-tra-tai-khoan-chinh/` | `fact-4` | Bấm gọi `*098#` để vào menu tra cứu tổng hợp và đăng ký dịch vụ. Do not claim particular menu options or results. | MAPPED — NOT QUEUED |
| 3 | HUY và HUYDATA gửi 191: phân biệt dừng gia hạn với hủy gói | cancellation | `/posts/cach-huy-gia-han-4g-viettel/` | `fact-5` | `HUY TÊN_GÓI` gửi `191` dừng gia hạn; `HUYDATA TÊN_GÓI` gửi `191` hủy gói. Follow the Viettel SMS response; full cancellation may not preserve remaining benefits. | MAPPED — NOT QUEUED |

### Source boundaries

- `fact-4` is current through `2026-12-31T23:59:59Z`, but its source is `tracuugoicuoc.com`, not a Viettel-owned domain. Re-check against an official source before publishing a sensitive operational instruction.
- `fact-5` is current through `2026-12-31T23:59:59Z` and is sourced from `098.viettel.vn`. It supports one consolidated cancellation guide only; splitting its same three operational claims into multiple near-duplicate posts is excluded below.
- Neither fact establishes package-specific syntax, confirmation text, response contents, an app workflow, a support-call procedure, a recharge rule, or automatic-renewal eligibility.

## HOLD exclusions

| Proposed angle | Nearest route | Reason for HOLD |
| --- | --- | --- |
| Check remaining data, package name, and expiry date from a KTTK reply | `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` | `fact-4` establishes the command only, not the fields returned in a reply. |
| Check account balance before renewal | `/posts/cach-kiem-tra-tai-khoan-chinh/` | No fact supports a balance-check method or links balance to renewal. |
| Check whether a package auto-renews | `/posts/cach-huy-gia-han-4g-viettel/` | No fact supplies a renewal-status check method or package eligibility rule. |
| Cancel in My Viettel rather than by SMS | `/posts/cach-huy-gia-han-4g-viettel/` | No fact supports an app cancellation flow or comparison. |
| Call 198 when SMS or USSD fails | `/posts/cach-kiem-tra-tai-khoan-chinh/` | No fact supports escalation conditions or the stated support channel. |
| Package-specific HUY/HUYDATA syntax (for example, MXH120) | `/posts/cach-huy-gia-han-4g-viettel/` | `fact-5` gives templates only; it does not validate a particular package’s current cancellation rule. |
| Separate posts for SMS confirmation, benefit loss, HUY, and HUYDATA | `/posts/cach-huy-gia-han-4g-viettel/` | All are subsets of mapping #3 and would create overlapping cancellation content from the same single fact. |

## Existing-config note

`config/topics.json` already contains the broader cancellation topic `topic-huy-goi-cuoc` and two closely related variants, all pointing to `/huong-dan/huy-goi-cuoc-viettel/` for blog `5229528996284551001`. This audit does not alter them. Any later addition for Blog 3 must be checked for cross-site duplication and a unique `topicId` before being queued.
