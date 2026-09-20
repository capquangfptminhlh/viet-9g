---
title: "Sau tắt 2G: Viettel có 4G nhưng không gọi được, kiểm tra gì?"
description: "Cập nhật sau mốc 15/09/2026: có 4G/5G nhưng không gọi được có thể liên quan VoLTE, thiết bị, SIM hoặc cấu hình. Checklist kiểm tra theo nguồn chính thức."
date: 2026-09-20
---

# Sau tắt 2G: Viettel có 4G nhưng không gọi được, kiểm tra gì?

**Cập nhật 20/09/2026:** sau mốc dừng 2G, việc điện thoại vẫn hiện 4G/5G và vào Internet được **không tự động chứng minh** phần thoại đã sẵn sàng. Nếu thuê bao Viettel có data nhưng gọi/nhận cuộc gọi không được, hãy kiểm tra VoLTE, thiết bị, SIM/thuê bao và cuộc gọi thật trước khi đổi gói cước.

![Minh họa điện thoại 4G/5G Viettel duy trì cuộc gọi khi mạng 2G được dừng](/images/tat-song-2g-volte-viettel.svg)

> **Trả lời nhanh:** data 4G/5G và thoại VoLTE là hai khả năng khác nhau. Viettel hướng dẫn dùng SIM 4G/5G, điện thoại hỗ trợ VoLTE, bật VoLTE/Cuộc gọi 4G và có thể đăng ký dịch vụ bằng **`HDCALL` gửi `191`**. Phí dịch vụ VoLTE được Viettel công bố là **0 đồng**; cước cuộc gọi vẫn theo gói/chính sách thoại của thuê bao.

## Sau 15/9, vì sao máy có 4G vẫn có thể không gọi được?

Trước đây một số thiết bị có thể dùng 4G cho data nhưng chuyển về mạng thế hệ cũ khi thực hiện cuộc gọi. Sau khi 2G dừng theo lộ trình, cách kiểm tra phù hợp hơn là xác nhận máy thực sự gọi được qua VoLTE thay vì chỉ nhìn biểu tượng 4G.

Chuỗi kiểm tra nên là:

1. điện thoại có hỗ trợ VoLTE;
2. SIM/eSIM và thuê bao Viettel dùng được 4G/5G;
3. VoLTE/Cuộc gọi 4G được bật nếu thiết bị có tùy chọn;
4. dịch vụ VoLTE trên thuê bao sẵn sàng;
5. cuộc gọi thử thiết lập thành công;
6. nếu vẫn lỗi, kiểm tra đúng SIM thoại trên máy hai SIM, phần mềm/Carrier Settings và điều kiện mạng tại nơi thử.

Nguồn Viettel:
- [Viettel — VoLTE, dịch vụ thoại chất lượng cao trên hạ tầng mạng 4G/5G](https://098.viettel.vn/tin-tuc/chi-tiet/volte-dich-vu-thoai-chat-luong-cao-tren-ha-tang-mang-4g5g-viettel/13748208)

Nguồn quản lý nhà nước về lộ trình:
- [Bộ Khoa học và Công nghệ — Lộ trình tắt sóng 2G](https://mst.gov.vn/bo-tttt-cong-bo-lo-trinh-tat-song-2g-197240705094212138.htm)
- [Bộ Khoa học và Công nghệ — Kết quả đấu giá băng tần 900 MHz, 09/09/2026](https://mst.gov.vn/vnpt-viettel-vietnamobile-cung-trung-dau-gia-3-cap-khoi-bang-tan-900mhz-197260909205107936.htm)

## Checklist xử lý khi có data nhưng không gọi được

### 1. Gọi thử khi đang ở 4G/LTE/5G

Tắt Wi-Fi, thực hiện một cuộc gọi đi và quan sát trạng thái mạng. Một lần thử không đủ để chẩn đoán toàn bộ nguyên nhân, nhưng giúp tách lỗi thoại khỏi lỗi data.

### 2. Kiểm tra VoLTE trên máy

Tùy hãng và phiên bản hệ điều hành, tùy chọn có thể mang tên **VoLTE**, **Cuộc gọi VoLTE**, **Gọi 4G** hoặc **Thoại và dữ liệu 4G**. Nếu có, bật tùy chọn này rồi thử lại.

### 3. Kiểm tra dịch vụ Viettel

Theo hướng dẫn Viettel, có thể soạn **`HDCALL` gửi `191`** hoặc dùng kênh My Viettel được nhà mạng công bố để kiểm tra/đăng ký VoLTE. Đây không phải thao tác mua gói data.

### 4. Máy hai SIM: xác nhận đúng SIM gọi thoại

Nếu máy dùng hai SIM, hãy kiểm tra SIM Viettel nào đang được chọn làm SIM thoại và SIM data. Cấu hình sai SIM có thể làm kết quả thử gây nhầm lẫn.

### 5. Cập nhật phần mềm rồi thử lại

Khởi động lại máy sau khi thay đổi cấu hình; cập nhật hệ điều hành/Carrier Settings nếu nhà sản xuất cung cấp. Nếu lỗi vẫn còn, ghi lại model, phiên bản hệ điều hành, vị trí và thời điểm thử để kênh hỗ trợ Viettel có dữ kiện cụ thể.

## Gọi điện làm máy tụt khỏi 4G có chắc là lỗi VoLTE không?

Không. Đây là **dấu hiệu cần kiểm tra**, không phải chẩn đoán tuyệt đối. Nguyên nhân có thể liên quan khả năng VoLTE của model, phần mềm, cấu hình SIM, trạng thái dịch vụ thuê bao hoặc điều kiện mạng.

Nếu cần hướng dẫn theo thiết bị:
- [Bật VoLTE Viettel trên Android](/posts/bat-volte-viettel-android/)
- [Bật VoLTE Viettel trên iPhone](/posts/cai-dat-4g-5g-volte-iphone-viettel/)
- [Kiểm tra điện thoại bàn phím 4G và VoLTE](/posts/dien-thoai-ban-phim-4g-viettel-volte-tat-2g/)

## USSD `*101#`, `*102#`, `*098#` không chạy thì sao?

Không nên tự kết luận SIM bị khóa chỉ vì USSD không hoạt động. Viettel đã có hướng dẫn về yêu cầu thiết bị/phần mềm hỗ trợ **USSD over IMS** trong quá trình chuyển sang 4G/5G và công bố các kênh thay thế.

Xem hướng dẫn riêng: [USSD Viettel qua 4G/VoLTE/IMS sau khi tắt 2G](/posts/ussd-viettel-qua-4g-volte-ims/).

Nguồn Viettel:
- [Cập nhật phần mềm và thiết bị hỗ trợ USSD khi tắt sóng 2G](https://shop.viettel.vn/tin-tuc/chi-tiet/cap-nhat-phan-mem-va-thiet-bi-ho-tro-ussd-khong-lo-gian-doan-dich-vu-khi-tat-song-2g/14894320)

## Câu hỏi nhanh

### Có 4G/5G là chắc chắn gọi được sau khi 2G dừng không?

Không. Data 4G/5G và thoại VoLTE là hai khả năng khác nhau. Cần kiểm tra cuộc gọi thực tế.

### `HDCALL` gửi `191` có phải mua gói data không?

Không. Đây là cú pháp Viettel hướng dẫn cho dịch vụ VoLTE. Viettel công bố phí dịch vụ VoLTE là 0 đồng; cước thoại vẫn theo chính sách của thuê bao.

### Không gọi được có nên mua gói 4G/5G khác ngay không?

Không nên. Nếu data vẫn hoạt động nhưng thoại lỗi, hãy kiểm tra VoLTE, thiết bị, SIM/thuê bao và cấu hình trước. Một gói data khác không tự giải quyết lỗi thoại VoLTE.

### Nếu `*101#` không chạy thì SIM có bị khóa không?

Không thể kết luận chỉ từ lỗi USSD. Cần kiểm tra hỗ trợ USSD over IMS/4G của thiết bị/phần mềm hoặc dùng kênh thay thế Viettel công bố.

## Kết luận

Sau mốc 15/09/2026, nếu Viettel **có 4G/5G nhưng không gọi được**, hãy xử lý theo đúng search job hỗ trợ: **model hỗ trợ VoLTE → SIM/thuê bao → `HDCALL` gửi `191` → bật VoLTE/Cuộc gọi 4G → gọi thử → kiểm tra phần mềm/cấu hình SIM**.

Bài này không khẳng định một nguyên nhân duy nhất cho mọi thuê bao và không suy diễn vùng phủ, điều kiện thuê bao hay chính sách gói cước chưa được Viettel xác minh.