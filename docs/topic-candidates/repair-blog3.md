# Blog 3 repair queue — checking, cancellation, and renewal

**Target blog:** `2757413717171314447`
**Audit date:** 2026-08-02
**Scope:** operational checking, cancellation, and renewal guidance only.

This repair plan contains exactly 14 distinct candidates. It deliberately excludes
the generic data-check angles already assigned to Blog 2 (`KTTK` remaining-data
lookup, `*098#` lookup, and My Viettel's data/package/expiry display). It also
excludes package reviews, prices, benefits, and troubleshooting. No configuration
file is changed by this document.

## Route and evidence checks

All paths below resolve to existing generated routes:

- `/posts/cach-kiem-tra-tai-khoan-chinh/` — account-check and support context.
- `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` — data-allowance checking context.
- `/posts/cach-huy-gia-han-4g-viettel/` — stopping renewal context.
- `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/` — full-cancellation context.

Every cited fact is unexpired as of the audit date and has a Viettel-owned source.
Package-specific commands and effects below must stay package-specific; they are
not evidence for any other package. Recheck the cited official source immediately
before publication.

| # | Candidate title | Intent | Target URL path | Official fact IDs | Fact-bounded angle | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Tra cứu tài khoản Viettel bằng `TK` gửi 191: dùng khi cần kiểm tra số dư nào? | account-check | `/posts/cach-kiem-tra-tai-khoan-chinh/` | `usage-02` | State only that Viettel directs subscribers to send `TK` to `191` to check the account; do not invent the reply fields. | `QUEUE` |
| 02 | Muốn kiểm tra thông tin trực tiếp: tổng đài 198 của Viettel có thu phí không? | support-check | `/posts/cach-kiem-tra-tai-khoan-chinh/` | `usage-05` | Viettel identifies `198` as a free customer-care channel that can directly support information checking. Do not promise resolution time or a specific account action. | `QUEUE` |
| 03 | Kiểm tra lưu lượng trên vietteltelecom.vn: một lựa chọn khi không dùng SMS | data-check | `/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/` | `cancellation-02` | Say only that logging in to vietteltelecom.vn can be used to check traffic information; do not describe an unverified navigation flow. | `QUEUE` |
| 04 | GIC70/GIC70T tự gia hạn sau bao lâu? | renewal-check | `/posts/cach-huy-gia-han-4g-viettel/` | `cancellation-06` | Limit the article to the named GIC70/GIC70T packages: the cited source says renewal occurs after 30 days at the stated package charge. | `QUEUE` |
| 05 | GIC70/GIC70T: gửi `HUY` 191 để dừng gia hạn như thế nào? | renewal-cancellation | `/posts/cach-huy-gia-han-4g-viettel/` | `cancellation-08` | Limit the command to GIC70/GIC70T and describe it only as the source's instruction to cancel renewal. | `QUEUE` |
| 06 | GIC70/GIC70T: khi nào dùng `HUYDATA` 191 để hủy gói? | full-cancellation | `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/` | `cancellation-09` | Limit the command to GIC70/GIC70T and describe it only as the source's instruction to cancel the package. | `QUEUE` |
| 07 | YT7 gia hạn theo chu kỳ mấy ngày? | renewal-check | `/posts/cach-huy-gia-han-4g-viettel/` | `cancellation-10` | State only the seven-day renewal cycle for the named YT7 package. | `QUEUE` |
| 08 | YT7: dừng gia hạn bằng `HUY YT7` 191 có giữ ưu đãi đến hết chu kỳ không? | renewal-cancellation | `/posts/cach-huy-gia-han-4g-viettel/` | `cancellation-11` | The retained-benefit statement is limited strictly to YT7 and the cited source; do not generalize it to other packages. | `QUEUE` |
| 09 | YT7: `HUYDATA YT7` gửi 191 dùng để hủy gói trong trường hợp nào? | full-cancellation | `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/` | `cancellation-12` | State only that the source gives `HUYDATA YT7` to `191` as the YT7 package-cancellation instruction. | `QUEUE` |
| 10 | YT30 tự gia hạn sau bao nhiêu ngày? | renewal-check | `/posts/cach-huy-gia-han-4g-viettel/` | `cancellation-13` | State only the 30-day renewal cycle for the named YT30 package. | `QUEUE` |
| 11 | YT30: `HUY YT30` 191 là hủy gia hạn hay hủy gói? | renewal-cancellation | `/posts/cach-huy-gia-han-4g-viettel/` | `cancellation-14` | The source distinguishes `HUY YT30` as cancelling renewal; keep the article to YT30. | `QUEUE` |
| 12 | YT30: `HUYDATA YT30` 191 khác gì với `HUY YT30`? | full-cancellation | `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/` | `cancellation-14` | The source distinguishes `HUYDATA YT30` as cancelling the package; compare only these two YT30 commands. | `QUEUE` |
| 13 | ST5KM tự gia hạn: hủy bằng `HUYDATA ST5KM` cần lưu ý điều gì? | full-cancellation | `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/` | `cancellation-15` | Keep all three source limits together: ST5KM auto-renews at cycle end, the command is followed by system instructions, and remaining data is not retained after cancellation. | `QUEUE` |
| 14 | `HUY TÊN_GÓI` và `HUYDATA TÊN_GÓI` gửi 191: dừng gia hạn khác hủy gói thế nào? | cancellation-decision | `/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/` | `fact-5` | State the source's template distinction, follow Viettel's SMS reply, and say full cancellation can forfeit remaining benefits. Do not attach the distinction to an uncited package. | `QUEUE` |

## Distinctness gate

- Candidates 01–03 are different checking channels and facts; none repeats Blog 2's generic `KTTK`, `*098#`, or My Viettel data-display topic.
- Candidates 04–13 are separated by named package and by materially different renewal or cancellation operation. No command, renewal duration, or benefit-retention rule is transferred between packages.
- Candidate 14 is the only package-agnostic cancellation explainer. It must not be split into confirmation, benefit-loss, `HUY`, and `HUYDATA` near-duplicates.
- Do not add these rows to `config/topics.json` until the normal duplicate, freshness, route, and ledger gates pass.
