# Blog 5 — official Viettel source audit

- Target blog ID: `9153601315328665051`
- Audit date: 2026-08-02 (Asia/Bangkok)
- Source policy: official Viettel-operated domains only. This audit is research only; it does not add facts to `data/facts.json`, create a topic queue, or authorize publication.

## Scope note

`docs/SEO-BLOGGER-NETWORK-RULES.md` assigns Blog 5 to official-source news and promotions, while `config/blogger-sites.json` currently describes this same ID as network/SIM/device troubleshooting. That conflict must be resolved before any topic is queued. Until then, every row below is **HOLD**, even where a source is still usable.

## Source register

| ID | Official source and date | Verified claim (narrowly stated) | Expiry / recheck | Existing internal target path(s) | Availability and publication disposition |
| --- | --- | --- | --- | --- | --- |
| B5-01 | [Viettel Telecom: data registration gets Be voucher](https://www.vietteltelecom.vn/index.php/tin-tuc/chi-tiet/dang-ky-data-viettel-tang-ma-be-toi-50k-di-dau-cung-re-luot-mang-cuc-me/18328932) — 2026-06-03 | Customers registering 5G135N, MXH100, 5G150, or 5G150N in My Viettel could receive a BeBike/BeCar code worth up to 30%, capped at 50,000 VND; one code per subscriber, with 30-day code validity. | Offer ended **2026-06-30**. | `/posts/huong-dan-dang-ky-5g135n-choi-lien-quan/`; `/posts/đăng-ký-mxh100-viettel/` (only the 5G135N and MXH100 portions match). No existing post matches 5G150/5G150N. | **UNAVAILABLE — EXPIRED.** Do not publish or reuse the offer as a current package benefit. |
| B5-02 | [Viettel Shop: USSD after the 2G shutdown](https://shop.viettel.vn/tin-tuc/chi-tiet/cap-nhat-phan-mem-va-thiet-bi-ho-tro-ussd-khong-lo-gian-doan-dich-vu-khi-tat-song-2g/14894320) — 2026-07-03 | Viettel says unsupported devices may be unable to use USSD after 2G/3G shutdown. It identifies My Viettel/Tammi, SMS `TK` to `191`, and hotline `198` as alternatives for account checks; it also says compatible Android/iOS devices can test USSD over 4G/IMS. | No end date stated. Recheck **2026-09-01** or immediately if Viettel updates its 2G/3G or USSD guidance. | `/posts/cach-kiem-tra-tai-khoan-chinh/`; `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` (partial contextual match only). | **AVAILABLE FOR FACT REVIEW; HOLD.** The source is current but has no fact ID, and the Blog 5 charter conflict remains unresolved. Do not infer that every handset supports USSD over IMS. |
| B5-03 | [Viettel Telecom: blocked subscriber due to identity verification](https://www.vietteltelecom.vn/tin-tuc/chi-tiet/thong-bao-thue-bao-viettel-bi-chan-do-chua-xac-thuc-thong-tin-huong-dan-cach-xu-ly/15333972) — 2026-06-18 | The notice says that, from 2026-06-15, subscribers who had not completed identity verification were blocked for calls/SMS. For customers abroad, it describes roaming/OTP and My Viettel/Viettel Tammi verification requirements and directs customers to support. | No end date stated. Recheck **2026-09-01** and before publishing because it is a regulatory/identity claim. | No exact existing post. The closest existing destination is `/tin-tuc/`, which is too broad for a contextual outbound link. | **UNAVAILABLE — NO MATCHING INTERNAL TARGET.** Do not queue until a suitable website destination exists and the notice is revalidated. |
| B5-04 | [Viettel Telecom: eSIM conversion fee reduction](https://www.vietteltelecom.vn/index.php/tin-tuc/chi-tiet/viettel-giam-toi-hon-50-phi-chuyen-doi-esim-uu-dai-cao-hon-tren-ung-dung-viettel-tammi/17076372) — 2026-07-03 | Viettel announced a nationwide reduction of more than 50% for physical-SIM-to-eSIM conversion from 2026-07-01, with a more favorable rate on Viettel Tammi. The article does not provide a durable text value for the fee. | Start date **2026-07-01**; no end date stated. Recheck **2026-09-01** and before quoting any price. | No exact existing post; `/tin-tuc/` is only a generic listing and is not a matching contextual target. | **UNAVAILABLE — NO MATCHING INTERNAL TARGET / PRICE NOT TEXT-VERIFIABLE.** Do not publish an amount, a percentage beyond the quoted “more than 50%,” or a CTA. |
| B5-05 | [Viettel Telecom media PDF: Viettel++ rules for 2026](https://media.vietteltelecom.vn/upload/ckfinder/files/File_The%20le%20chuong%20trinh%20Viettel%2B%2B%20nam%202026_up%281%29.pdf) — 2026 rules | The official rules state that the Viettel++ customer-loyalty program runs nationwide from 2026-01-01 through 2026-12-31 and covers services from the listed Viettel companies. | Expires **2026-12-31**; recheck **2026-12-01** for renewal/replacement rules. | No exact existing post; `/tin-tuc/` is not a sufficiently specific target. | **UNAVAILABLE — NO MATCHING INTERNAL TARGET.** It may be used for later fact review only; do not state benefits or point-conversion values unless separately sourced. |

## Evidence boundaries

- B5-01 is historical only. Its package list and voucher terms are not evidence that those packages or benefits remain available after 2026-06-30.
- B5-02 is operational guidance, not a guarantee that USSD will work on every phone; device/software/IMS state remain conditions stated by Viettel.
- B5-03 concerns identity verification and possible service restriction. Treat it as time-sensitive and require a fresh official confirmation before any public-facing use.
- B5-04 contains a promotional percentage but no durable text fee table. The audit deliberately records no monetary conversion fee.
- B5-05 establishes only the program window and general program scope. It does not substantiate any specific reward, package, or eligibility claim.

## Queue decision

No candidate is publication-ready. The only source with a direct enough existing content match (B5-02) still requires fact ingestion/review and resolution of the Blog 5 scope conflict. All other facts are either expired or lack an appropriate internal target path.
