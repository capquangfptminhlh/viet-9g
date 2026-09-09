---
title: "Cách hủy gia hạn gói Viettel qua 191 và My Viettel"
description: "Hướng dẫn phân biệt dừng gia hạn và hủy gói Viettel, gồm ví dụ GIC70/GIC70T với HUY và HUYDATA gửi 191, cùng cách kiểm tra trước khi thao tác."
date: 2026-09-09
category: "support"
tags: ["Viettel", "hủy gia hạn", "191", "My Viettel", "GIC70", "GIC70T"]
---

# Cách hủy gia hạn gói Viettel qua 191 và My Viettel

**Nếu mục tiêu của bạn chỉ là tránh gói tự gia hạn ở chu kỳ tiếp theo, đừng gửi một cú pháp bất kỳ theo bài cũ trên Internet.** Trước tiên hãy xác định đúng tên gói đang dùng và đọc hướng dẫn hủy của chính gói đó.

Viettel hiện cung cấp hai kênh thuận tiện để quản lý gói: **SMS 191** và **My Viettel**. Trên các hướng dẫn gói cụ thể, Viettel có thể phân biệt giữa thao tác **dừng gia hạn** và **hủy gói ngay**, vì vậy cần làm đúng theo tên gói và SMS phản hồi.

## Bước 1: kiểm tra gói đang sử dụng

Bạn có thể mở My Viettel để xem gói hiện hành. Với nhiều gói data, Viettel cũng hướng dẫn dùng `KTTK` gửi `191` để kiểm tra thông tin lưu lượng/thời hạn.

Đừng đoán tên gói từ số tiền bị trừ. Cùng một mức giá có thể có nhiều chương trình hoặc điều kiện thuê bao khác nhau.

## Bước 2: phân biệt dừng gia hạn và hủy gói

Trong hướng dẫn chính thức cho các gói như FB7, FB30 và YT7, Viettel phân biệt rõ:

- **Dừng gia hạn:** dùng cú pháp dạng `HUY TÊN_GÓI` gửi `191`; ưu đãi còn lại có thể tiếp tục được dùng đến hết chu kỳ theo điều kiện của gói.
- **Hủy gói:** một số gói dùng cú pháp dạng `HUYDATA TÊN_GÓI` gửi `191`; ưu đãi còn lại có thể bị mất khi hủy hoàn toàn.

Không nên suy rộng một cú pháp cho mọi gói. Khi SMS phản hồi yêu cầu xác nhận hoặc hiển thị điều kiện khác, hãy làm theo phản hồi thực tế của Viettel.

## GIC70/GIC70T: HUY và HUYDATA gửi 191 khác nhau thế nào?

Trong hướng dẫn chính thức dành riêng cho **GIC70/GIC70T**, Viettel nêu hai thao tác khác nhau:

- Soạn `HUY` gửi `191` để **hủy gia hạn**.
- Soạn `HUYDATA` gửi `191` để **hủy gói cước**.

Đây là hướng dẫn cho đúng nhóm gói GIC70/GIC70T trong nguồn được dẫn bên dưới, không phải cú pháp mặc định cho mọi gói Viettel. Trước khi thao tác, hãy kiểm tra đúng gói đang dùng và đọc SMS phản hồi của `191`; nếu hệ thống hiển thị yêu cầu hoặc điều kiện khác, ưu tiên làm theo phản hồi thực tế của nhà mạng.

Nếu bạn chỉ muốn tránh bị gia hạn ở chu kỳ tiếp theo, cần phân biệt rõ mục tiêu này với việc hủy hẳn gói. Việc chọn sai giữa `HUY` và `HUYDATA` có thể không cho kết quả bạn đang cần.

## Bước 3: hủy trên My Viettel nếu muốn thao tác bằng giao diện

Viettel cũng cho phép quản lý/hủy nhiều gói ngay trong My Viettel. Cách này hữu ích khi bạn không nhớ chính xác cú pháp SMS: đăng nhập đúng thuê bao, mở phần gói cước đang sử dụng, chọn gói cần quản lý và đọc kỹ lựa chọn hủy/gia hạn trước khi xác nhận.

## Nếu hủy không thành công

Kiểm tra theo thứ tự:

1. Tên gói trong SMS có đúng với gói đang dùng không.
2. Bạn đang muốn dừng gia hạn hay hủy ngay.
3. SMS phản hồi của 191 có yêu cầu xác nhận thêm không.
4. Gói có quy tắc hủy riêng hay không.
5. Nếu vẫn không rõ, kiểm tra trực tiếp trong My Viettel hoặc liên hệ tổng đài Viettel 198.

Nếu vấn đề của bạn là **đăng ký gói bị từ chối**, xem [checklist lỗi đăng ký 4G Viettel](/posts/lỗi-đăng-ký-4g-viettel-không-thành-công-và-cách-khắc-phục).

## FAQ

### Hủy gia hạn có giống hủy gói không?

Không nhất thiết. Viettel có các gói phân biệt rõ thao tác dừng gia hạn và hủy hoàn toàn. Với GIC70/GIC70T, nguồn Viettel nêu `HUY` gửi `191` cho hủy gia hạn và `HUYDATA` gửi `191` cho hủy gói.

### Có thể hủy bằng My Viettel không?

Có. Viettel công bố My Viettel là một trong các kênh quản lý/đăng ký gói; với gói đang sử dụng, hãy mở thông tin gói và thực hiện theo tùy chọn hiển thị cho thuê bao.

### Có nên gửi lại nhiều lần nếu chưa thấy hủy?

Không. Hãy đọc SMS phản hồi trước. Việc gửi lặp lại không thay thế bước xác nhận hoặc điều kiện mà hệ thống yêu cầu.

## Nguồn Viettel

- [GIC70/GIC70T: hướng dẫn HUY và HUYDATA gửi 191](https://shop.viettel.vn/tin-tuc/chi-tiet/dang-ky-ngay-goi-cuoc-%E2%80%9Cthuong-hieu-tre%E2%80%9D-gic70-va-gic70t-de-nhan-sieu-uu-dai-data-hap-dan/11385444/)
- [Tổng hợp gói trả trước Viettel và hướng dẫn hủy theo tên gói](https://098.viettel.vn/tin-tuc/chi-tiet/cap-nhat-2025-cach-dang-ky-goi-cuoc-tra-truoc-viettel-gia-re-moi-nhat/17031500)
- [FB7/FB30: Viettel phân biệt hủy gia hạn và hủy gói](https://098.viettel.vn/tin-tuc/chi-tiet/luot-facebook-khong-gioi-han-data-cung-viettel-voi-goi-cuoc-moi-fb7-va-fb30/17165624)
- [Kiểm tra thời hạn/lưu lượng gói data qua My Viettel hoặc KTTK 191](https://098.viettel.vn/tin-tuc/chi-tiet/huong-dan-kiem-tra-ngay-het-han-cua-goi-cuoc-data-viettel/10455428)
