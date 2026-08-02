# Blog 6831378030642060628 — package review/comparison source audit

Audited: 2026-08-02. Scope is limited to the `Review Gói Cước Viettel` Blogger site (`6831378030642060628`), whose charter is independent package reviews and comparisons. This document is evidence only; it does not authorize a catalog, fact, or configuration change.

## Source quality and review rule

`098.viettel.vn` is a Viettel-operated customer-information domain. Package prices, allowances, renewal, eligibility, and zero-rated-service terms are volatile. Treat every positive package claim below as usable only through **2026-08-09** and recheck the cited source (and the logged-in My Viettel/Hub offer for the target SIM) before drafting or publishing.

The source article below was published 2025-04-03 but was accessible during this audit and its page was crawled in July 2026. The short recheck window is intentional: page accessibility is not a guarantee that every offer still applies to every subscriber.

## Official evidence mapped to internal destinations

| Official URL | Verified claim (as presented by Viettel) | Expiry / recheck | Existing internal target path | Review/comparison use |
| --- | --- | --- | --- | --- |
| [Cập nhật 2025: Cách đăng ký gói cước trả trước Viettel](https://098.viettel.vn/tin-tuc/chi-tiet/cap-nhat-2025-cach-dang-ky-goi-cuoc-tra-truoc-viettel-gia-re-moi-nhat/17031500) | **SD90:** 90,000đ/30 days; 45GB high-speed data (1.5GB/day); renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/sd90/` | Usable for an SD90 review and a SD90-versus-V120B comparison on price, daily data, cycle, and included calling. |
| Same official URL | **V120B:** 120,000đ/30 days; 1.5GB/day (45GB/month); 50 off-net minutes; first 10 minutes of every on-net call free; renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/v120b/` | Usable for V120B review and the SD90-versus-V120B comparison. Do not infer eligibility. |
| Same official URL | **MXH120:** 120,000đ/30 days; 1GB/day (30GB/month); first 10 minutes of on-net calls free and 30 off-net minutes; Facebook, TikTok, YouTube, and Messenger access stated as free **up to 50GB per usage guide**; renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/mxh120/` | Usable for an MXH120 review and a V120B-versus-MXH120 comparison. The 50GB qualification must appear anywhere the social-data benefit is discussed. |
| Same official URL | **5G135:** 135,000đ/30 days; 4GB/day (120GB/month); TV360 Basic; 20GB MyBox storage; renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/5g135/` | Usable for 5G135 review and a 5G135-versus-5G160B comparison. |
| Same official URL | **5G160B:** 160,000đ/30 days; 4GB/day (120GB/month); 100 off-net minutes; first 10 minutes of each on-net call free (maximum 1,000 minutes); TV360 Basic; 20GB MyBox storage; renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/5g160b/` | Usable for comparison with 5G135: the documented differences are price and voice allowance; the listed daily data and content/storage benefits match. |
| Same official URL | **5G150:** 150,000đ/30 days; 6GB/day (180GB/month); TV360 Basic; 30GB MyBox storage; renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/5g150/` | Usable for 5G150 review and 5G150-versus-5G180B comparison. |
| Same official URL | **5G180B:** 180,000đ/30 days; 6GB/day (180GB/month); 100 off-net minutes; first 10 minutes of each on-net call free (maximum 1,000 minutes); TV360 Basic; 30GB MyBox storage; renews after 30 days. | Recheck 2026-08-09 | `/goi-cuoc/5g180b/` | Usable for comparison with 5G150: the documented differences are price and voice allowance; the listed daily data and content/storage benefits match. |
| [Viettel 5GMAX launch](https://098.viettel.vn/tin-tuc/chi-tiet/viettel-ra-mat-he-goi-cuoc-5gmax-khang-dinh-vi-the-dan-dau-ve-toc-do-va-trai-nghiem/17708700) | The article lists 5GMAX13 (13,000đ/day, 7GB/day), 5GMAX40 (40,000đ/3 days, 8GB/day), 5GMAX90 (90,000đ/7 days, 10GB/day), and 5GMAX200 (200,000đ/30 days, 8GB/day), each with TV360 Basic. | Recheck 2026-08-09 | **No matching package route in `data/package-catalog.v1.json`** | Source is valid, but it cannot support a Blogger destination until a matching catalog route is deliberately added and independently verified. |

## Unavailable or contradicted facts — do not use as review evidence

| Fact / proposed statement | Audit result | Reason and handling | Related target path |
| --- | --- | --- | --- |
| `fact-3`: “MXH120 ... miễn phí 100% data Tiktok, FB, Youtube.” | **UNAVAILABLE_AS_WRITTEN** | The official table describes the named services and Messenger as free only “tối đa 50GB/hướng dẫn sử dụng”; it does not substantiate an unqualified “100% free data” claim. Use the qualified official wording only after the recheck. | `/goi-cuoc/mxh120/` |
| `fact-7`: ST15K is 15,000đ/3 days with 3GB high-speed data and is suitable for short-term use. | **UNAVAILABLE** | The stored `vietteltelecom.vn/di-dong/chi-tiet-goi-cuoc/ST15K` URL did not return an auditable official page in this review, and no current official replacement was found. Do not publish price, allowance, renewal, exhaustion behavior, or use-case recommendations for ST15K from this audit. | `/goi-cuoc/st15k/` |
| Package eligibility / whether any named package can be registered by a particular SIM. | **UNAVAILABLE** | The cited tables list package details but do not establish universal eligibility. Require a real-time result in My Viettel or Hub for the user’s subscriber before asserting availability. | All package paths |
| Registration via the site's affiliate syntax (`<package> GB` to `290`) or registration success. | **UNAVAILABLE** | Official sources describe generic registration to 191, My Viettel, USSD, or Hub; they do not validate the site’s affiliate channel. Keep it out of review/comparison copy. | All package paths |
| “Unlimited,” “no throttling,” network-speed guarantees, or best-for claims. | **UNAVAILABLE** | None of the cited package tables establishes those performance or editorial-superlative claims. Any recommendation must be a clearly labeled editorial inference limited to the verified attributes. | All package paths |

## Safe comparison boundaries

- **SD90 vs V120B:** both list 45GB/month (1.5GB/day) and a 30-day cycle; V120B costs 30,000đ more and lists the stated calling benefits. Do not claim either package is universally better.
- **V120B vs MXH120:** both list a 120,000đ / 30-day price point, but they have different listed data, calling, and social-data benefits. Preserve MXH120’s 50GB qualification.
- **5G135 vs 5G160B** and **5G150 vs 5G180B:** each pair has equal listed daily data and content/storage benefits; the B plan adds the listed voice allowance at the higher listed price.

Before publication, re-open the official URL, confirm the product is presently available for the relevant subscriber, and retain the recheck result with the post record.
