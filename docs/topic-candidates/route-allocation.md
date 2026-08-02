# Primary-site route allocation: setup/use vs. checking/cancel/renew

**Audit date:** 2026-08-02  
**Purpose:** allocate the current primary-site routes to one Blogger charter before a
topic is queued. This is a semantic route audit only; it does not validate the
current claims, package availability, or source facts.

## Decision rule

| Stream | Include when the reader's primary job is | Exclude when the primary job is |
| --- | --- | --- |
| **Blog 2 — 4G/5G setup and use** | getting a SIM/service/device ready to use 4G/5G, or using an already active service across devices | looking up a balance, data allowance, package, expiry, or phone number; stopping a package; or changing its renewal state |
| **Blog 3 — checking, cancellation, and renewal** | inspecting an account, number, package, allowance, or expiry; cancelling a package; preventing/understanding renewal; or obtaining support for one of those tasks | selecting a package, registering a service, or ordinary 4G/5G use not needed to perform the checking/cancellation/renewal task |

The main task and the article's promised outcome decide the owner. A route may
mention another task in a FAQ or cross-link, but that does not make it eligible
for the other stream. Package selection, prices, benefits, and package-specific
registration remain outside both streams and belong to the package-review
charter.

## Routes allocated to Blog 2: setup and use

| Existing path | Current content signal | Allowed Blog 2 angle | Boundary |
| --- | --- | --- | --- |
| `/posts/dang-ky-multisim-viettel` | Explains MultiSIM, using one service across devices, and in-store/eSIM setup. | Preparing and using MultiSIM across a phone, watch, or tablet. | Do not turn it into a package review, balance/data check, cancellation, or renewal guide. |
| `/posts/cách-đăng-ký-mạng-viettel-cho-sim-mới-kích-hoạt` | Primarily presents packages and SMS registration for newly activated SIMs. | **No new Blog 2 queue from the route as written.** It can only support a future setup article after its package-selection/registration claims are independently fact-checked and the angle is narrowed to SIM readiness. | Its current page is substantially package sales/registration content and also contains checking and cancellation FAQs. Those FAQs belong to Blog 3 and must not be spun out from this route for Blog 2. |

No existing route was found for a general 4G/5G device/network-settings guide.
Do not use `/`, a package page, or a troubleshooting page as a substitute
destination for that missing intent.

## Routes allocated to Blog 3: checking, cancellation, and renewal

| Existing path | Current content signal | Allowed Blog 3 angle | Duplicate guard |
| --- | --- | --- | --- |
| `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại` | The H1 and FAQ make remaining 4G data the reader's task. | Checking remaining data; only publish facts that the current source supports. | One canonical destination for data-allowance checks; do not create one version for Blog 2 and another for Blog 3. |
| `/posts/cach-kiem-tra-tai-khoan-chinh` | Covers main/promotional balance, remaining data, and My Viettel lookup. | Account, package, allowance, or expiry lookup. | Keep `*098#`, KTTK, and My Viettel lookup topics here; distinguish only genuinely different supported user jobs. |
| `/posts/cach-kiem-tra-so-dien-thoai-viettel-dang-dung` | Its H1 is a phone-number lookup task. | Checking the active Viettel phone number. | Not a setup/use topic merely because it uses a USSD/SMS operation. |
| `/posts/cach-huy-gia-han-4g-viettel` | Explicitly distinguishes stopping renewal from fully cancelling a package. | Cancellation, stopping renewal, confirmation, and consequences. | Canonical general cancellation/renewal destination. Do not split the same command/confirmation sequence into several near-duplicate posts. |
| `/posts/cach-huy-goi-mxh120` | Package-specific cancellation and cancellation-versus-renewal explanation. | MXH120 cancellation only if the current package-specific fact is valid. | Do not duplicate the general cancellation guide unless the package-specific rule or consequence is materially distinct and fact-backed. |
| `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động` | The H1 promises avoiding automatic deductions through cancellation. | Cancellation/renewal only. | This content route exists in `src/content/posts`, although it is absent from the checked-in static sitemap; verify the generated route before linking. |

## Explicitly out of scope for both streams

| Route group | Reason |
| --- | --- |
| `/goi-cuoc/*` | Catalog/package detail routes support package discovery, review, or comparison rather than either operational charter. |
| `/posts/đăng-ký-*`, `/posts/dang-ky-goi-v120b`, and package-list/comparison posts | Their primary intent is package registration, pricing, benefit explanation, or selection. Allocate only to the package-review stream after the normal fact and route checks. |
| `/posts/lỗi-đăng-ký-4g-viettel-không-thành-công-và-cách-khắc-phục`, `/posts/loi-khong-dang-ky-duoc-mang-5g-viettel` | Troubleshooting/error resolution belongs to the network/SIM/device troubleshooting stream. |
| `/posts/huong-dan-dang-ky-5g135n-choi-lien-quan`, `/posts/so-sanh-goi-5g135n-va-5g150n-viettel` | Package-specific registration and comparison, not general setup/use. |
| `/posts/cách-ứng-data-4g-viettel-khi-hết-tiền` | The file has malformed/incomplete front matter and no usable body route evidence in this audit. Do not map it until the content and generated route are verified. |

## Current queue conflicts to block

`config/topics.json` currently has each of the following checking intents queued
for **both** Blog 2 and Blog 3. The primary routes and the stated charters place
all of them with Blog 3:

| Intent / destination | Blog 2 topic | Blog 3 topic | Allocation outcome |
| --- | --- | --- | --- |
| KTTK data/expiry lookup → `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại` | `topic-b2-kiem-tra-data-kttk-191` | `topic-b3-kttk-data-han-dung` | Blog 3 only |
| `*098#` package/allowance lookup → `/posts/cach-kiem-tra-tai-khoan-chinh` | `topic-b2-tra-cuu-goi-098` | `topic-b3-tra-cuu-goi-098` | Blog 3 only |
| My Viettel allowance/package/expiry lookup → `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại` | `topic-b2-my-viettel-dung-luong-han-dung` | `topic-b3-my-viettel-dung-luong` | Blog 3 only |

This document does **not** edit those queued records. Until a separate
configuration change resolves them, do not publish the Blog 2 versions.

## Queue gate for future topics

1. Choose one primary user outcome, then select only the route in that outcome's
   allocation above.
2. Reject a topic if another Blog has the same operational method and the same
   primary route, even if its title, image, or wording differs.
3. Treat facts, live generated routes, source freshness, and the publication
   ledger as independent gates. Passing this allocation does not clear those
   gates.
4. Where a page mixes intents, use the dominant H1/body purpose—not an FAQ,
   incidental command, or CTA—to assign its stream.
