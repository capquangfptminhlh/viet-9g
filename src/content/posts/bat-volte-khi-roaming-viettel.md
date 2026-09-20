---
title: "Roaming Viettel có 4G/data nhưng không gọi được? Cách bật VoLTE"
description: "Roaming Viettel có 4G/5G hoặc data nhưng không gọi được? Kiểm tra VoLTE roaming, HDCALL gửi 191, thiết bị và cấu hình iPhone/Android theo nguồn Viettel."
date: 2026-08-26
---

# Roaming Viettel có 4G/data nhưng không gọi được? Cách bật VoLTE

Khi đi nước ngoài, bạn có thể gặp tình huống **SIM Viettel vẫn có 4G/5G hoặc data roaming nhưng không thực hiện được cuộc gọi**. Có data không đồng nghĩa phần thoại đã sẵn sàng: tại các mạng/quốc gia đã tắt 2G/3G, cuộc gọi có thể cần chạy trên 4G bằng **VoLTE**.

> **Trả lời nhanh:** Theo tài liệu hướng dẫn VoLTE Roaming của Viettel, hãy kiểm tra ba điều kiện: thiết bị hỗ trợ VoLTE, thuê bao đã đăng ký dịch vụ gọi VoLTE bằng cú pháp **HDCALL gửi 191**, và VoLTE/4G Calling đã được bật trên điện thoại. Viettel cũng khuyến nghị thiết bị hỗ trợ 4G, VoLTE và nhiều băng tần khi roaming tại các quốc gia đã tắt 2G/3G.

Bài này tập trung vào **cuộc gọi VoLTE khi đang roaming ở nước ngoài**. Nếu vấn đề của bạn là data roaming tại Nhật không hoạt động, xem hướng dẫn riêng [Viettel roaming ở Nhật Bản không có mạng](/posts/viettel-roaming-nhat-ban-khong-co-mang/).

## Vì sao có 4G/5G hoặc data roaming nhưng vẫn không gọi được?

Dữ liệu và thoại là hai lớp khác nhau. Điện thoại có thể đăng ký được mạng 4G/5G và truy cập Internet, nhưng cuộc gọi vẫn thất bại nếu thiết bị/thuê bao chưa đáp ứng điều kiện VoLTE trên mạng roaming đang sử dụng.

Tài liệu chính thức của Viettel về VoLTE Roaming nêu rõ bối cảnh này: khi chuyển vùng vào mạng hoặc quốc gia đã tắt hạ tầng 2G/3G, khách hàng cần cấu hình điện thoại để gọi trên 4G. Vì vậy, nếu **data chạy nhưng gọi không được**, đừng vội reset APN; hãy kiểm tra VoLTE trước.

## Ba điều kiện Viettel nêu cho cuộc gọi VoLTE Roaming

Tài liệu hướng dẫn của Viettel liệt kê ba điều kiện chính:

1. **Thiết bị hỗ trợ VoLTE.**
2. **Đăng ký dịch vụ gọi VoLTE** bằng cách soạn **HDCALL gửi 191**; tài liệu ghi đăng ký miễn phí.
3. **Bật chức năng VoLTE trên thiết bị.**

Viettel cũng lưu ý khả năng hỗ trợ có thể phụ thuộc model điện thoại, phiên bản hệ điều hành và mạng đối tác tại quốc gia roaming. Vì vậy, không nên hiểu rằng chỉ cần thấy biểu tượng 4G là cuộc gọi VoLTE chắc chắn hoạt động.

## Đi Nhật: có data nhưng không gọi được thì kiểm tra gì trước?

Hướng dẫn hiện hành của Viettel cho khách hàng roaming tại Nhật yêu cầu thiết bị hỗ trợ **VoLTE** để bảo đảm liên lạc khi mạng 2G/3G đã ngừng hoạt động. Trên iPhone, Viettel hướng dẫn vào **Cài đặt → Di động → SIM Viettel → Thoại & Dữ liệu** rồi chọn **4G/VoLTE hoặc 5G**; đồng thời cập nhật hệ điều hành và bật Data Roaming khi cần dùng dữ liệu.

Nếu ở Nhật và Internet vẫn chạy nhưng cuộc gọi lỗi, kiểm tra theo thứ tự:

1. xác nhận SIM Viettel đang là SIM cần gọi;
2. kiểm tra `HDCALL` gửi `191` theo hướng dẫn Viettel về đăng ký VoLTE;
3. kiểm tra VoLTE/4G Calling hoặc mục Thoại & Dữ liệu trên máy;
4. ưu tiên 4G/LTE hoặc 5G thay vì khóa 2G/3G;
5. cập nhật hệ điều hành/carrier settings chính thức;
6. bật/tắt chế độ máy bay hoặc khởi động lại rồi thử một cuộc gọi thực tế.

Nếu **không có mạng hoặc không có Internet** tại Nhật, đó là search job khác: dùng checklist [4G/5G, Data Roaming và APN cho roaming Nhật](/posts/viettel-roaming-nhat-ban-khong-co-mang/) thay vì chỉ tập trung vào VoLTE.

## Cách bật VoLTE roaming Viettel trên iPhone

Tên menu có thể thay đổi theo phiên bản iOS, nhưng mục tiêu là chọn đúng SIM Viettel, bật chuyển vùng dữ liệu khi cần dùng data và cho phép thoại trên 4G/VoLTE.

Theo luồng cài đặt trong tài liệu Viettel, bạn kiểm tra theo hướng:

1. Mở **Cài đặt**.
2. Vào **Di động/Cellular**.
3. Chọn SIM Viettel nếu máy dùng nhiều SIM/eSIM.
4. Vào **Tùy chọn dữ liệu di động/Cellular Data Options**.
5. Bật **Chuyển vùng dữ liệu/Data Roaming** khi cần sử dụng data roaming.
6. Vào **Thoại & dữ liệu/Voice & Data** và bật/chọn **VoLTE** hoặc chế độ 4G/5G có hỗ trợ thoại phù hợp với phiên bản iOS.

Nếu iPhone không còn hiển thị công tắc VoLTE riêng, đừng cố tìm đúng tên menu của một bản iOS cũ. Apple có thể thay đổi cách trình bày tùy chọn nhà mạng theo phiên bản; hãy kiểm tra mục Thoại & dữ liệu và cập nhật carrier settings/iOS chính thức khi hệ thống yêu cầu.

## Cách bật VoLTE roaming Viettel trên Android

Android khác nhau đáng kể giữa Samsung, Xiaomi, Oppo, Vivo, Pixel và các phiên bản hệ điều hành. Tài liệu Viettel minh họa luồng phổ biến qua phần **Mạng di động/Mobile networks**.

Bạn có thể kiểm tra theo thứ tự:

1. Mở **Cài đặt**.
2. Vào **Kết nối/Mạng & Internet/SIM** tùy hãng.
3. Chọn đúng SIM Viettel.
4. Mở **Mạng di động/Mobile networks**.
5. Bật **Chuyển vùng dữ liệu/Data roaming** nếu cần data.
6. Bật **Cuộc gọi VoLTE/4G Calling** nếu thiết bị có tùy chọn này.
7. Đặt chế độ mạng ưu tiên ở 4G/LTE hoặc 5G phù hợp thay vì khóa máy ở 2G/3G.

Nếu không thấy mục VoLTE, nguyên nhân có thể nằm ở model, firmware, cấu hình nhà mạng hoặc cách hãng ẩn/đổi tên tùy chọn. Không nên cài ứng dụng hay profile không rõ nguồn gốc chỉ để ép xuất hiện công tắc VoLTE.

## Đã bật VoLTE nhưng roaming vẫn không gọi được: kiểm tra gì?

Hãy tách lỗi theo lớp thay vì thay đổi nhiều cài đặt cùng lúc:

| Kiểm tra | Câu hỏi cần trả lời |
|---|---|
| Dịch vụ roaming | Thuê bao đã có dịch vụ chuyển vùng quốc tế hoạt động chưa? |
| VoLTE | Đã đăng ký `HDCALL` gửi `191` và bật VoLTE/4G Calling chưa? |
| Thiết bị | Model và phiên bản hệ điều hành có hỗ trợ cấu hình cần thiết không? |
| Mạng ưu tiên | Máy có đang bị khóa ở 2G/3G không? |
| Mạng đối tác | Thiết bị có đăng ký được vào mạng roaming khả dụng không? |
| Khởi động lại | Sau khi đổi cấu hình, máy đã đăng ký lại mạng chưa? |

Sau mỗi thay đổi quan trọng, có thể bật/tắt chế độ máy bay hoặc khởi động lại điện thoại rồi chờ máy đăng ký lại mạng trước khi thử cuộc gọi.

## Có cần bật Data Roaming để gọi VoLTE không?

Đừng dùng công tắc Data Roaming như bằng chứng duy nhất cho trạng thái VoLTE. Đây là hai chức năng khác nhau. Tuy nhiên khi ở nước ngoài, người dùng thường cần cấu hình đồng thời dịch vụ roaming, chế độ mạng và các tùy chọn thoại/dữ liệu phù hợp để có trải nghiệm đầy đủ.

Nếu mục tiêu chỉ là xử lý lỗi **không có Internet**, hãy ưu tiên kiểm tra Data Roaming, SIM dùng data và APN. Nếu mục tiêu là xử lý **không gọi được khi mạng nước ngoài đã chuyển mạnh sang 4G**, VoLTE là lớp cần kiểm tra riêng.

## HDCALL gửi 191 có phải gói cước roaming không?

Không. Theo tài liệu Viettel, **HDCALL gửi 191** là cú pháp đăng ký dịch vụ gọi VoLTE. Nó không đồng nghĩa với việc bạn đã mua một gói data roaming, không xác nhận dung lượng roaming và không thay thế việc đăng ký dịch vụ chuyển vùng quốc tế khi cần.

Để chọn gói roaming theo quốc gia, thời gian và nhu cầu data/thoại, hãy kiểm tra thông tin hiện hành trên kênh roaming chính thức Viettel trước chuyến đi. Giá, vùng áp dụng và quyền lợi gói có thể thay đổi theo thời điểm.

## Khi nào nên chọn mạng thủ công?

Thông thường nên để **chọn mạng tự động** trước. Nếu máy không đăng ký được mạng hoặc Viettel hướng dẫn chọn một mạng đối tác cụ thể, bạn mới chuyển sang chọn mạng thủ công.

Trên Android, mục này thường nằm trong **Mạng di động → Nhà cung cấp mạng/Network operators**. Trên iPhone, mục tương đương thường là **Di động → Lựa chọn mạng/Network Selection**. Danh sách mạng khả dụng phụ thuộc quốc gia và thời điểm, vì vậy bài này không hard-code một danh sách đối tác cố định.

## Checklist trước khi ra nước ngoài

Trước chuyến đi, bạn nên kiểm tra:

- roaming quốc tế đã được kích hoạt theo nhu cầu;
- điện thoại hỗ trợ 4G/LTE và VoLTE;
- dịch vụ VoLTE đã đăng ký nếu cần bằng `HDCALL` gửi `191` theo hướng dẫn Viettel;
- hệ điều hành và cài đặt nhà mạng đã cập nhật;
- biết vị trí bật Data Roaming, VoLTE/4G Calling và chọn mạng trên thiết bị;
- đã lưu kênh hỗ trợ chính thức của Viettel để dùng khi ở nước ngoài.

Nếu bạn đang chuẩn bị chuyến đi Lào và cần chọn gói thay vì xử lý lỗi thoại, xem [gói roaming Viettel đi Lào](/posts/roaming-viettel-di-lao/).

## Nguồn kiểm chứng

- Viettel Telecom — **Hướng dẫn bật chức năng gọi VoLTE khi Roaming trên điện thoại**: tài liệu chính thức nêu điều kiện thiết bị, `HDCALL` gửi `191`, bật VoLTE và bối cảnh các mạng/quốc gia tắt 2G/3G.
- Viettel Telecom — **Đi Nhật Bản Không Có Mạng? Hướng Dẫn Bật 4G/5G Và Roaming Viettel Chi Tiết**, 14/04/2026: nguồn chính thức nêu 4G/5G, Data Roaming, VoLTE và cập nhật phần mềm khi roaming tại Nhật.

Thông tin roaming và khả năng tương thích có thể thay đổi theo mạng đối tác, quốc gia, thiết bị và thời điểm. Nếu máy vẫn không gọi được sau khi kiểm tra cấu hình, hãy xác minh trạng thái thuê bao và hướng dẫn hiện hành trực tiếp với Viettel thay vì tiếp tục đổi cài đặt ngẫu nhiên.
