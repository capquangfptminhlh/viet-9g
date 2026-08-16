---
title: "APN Viettel khi roaming: cài v-internet trên iPhone và Android"
description: "Roaming Viettel có sóng nhưng không vào mạng? Kiểm tra Data Roaming, APN v-internet, mạng đối tác và VPN theo hướng dẫn Viettel."
date: 2026-08-16
---

# APN Viettel khi roaming: cài v-internet trên iPhone và Android

Nếu SIM Viettel của bạn đã bắt được mạng ở nước ngoài nhưng **không truy cập được Internet**, APN là một trong những cấu hình nên kiểm tra sớm. Trong tài liệu hướng dẫn roaming hiện hành, Viettel sử dụng APN **`v-internet`** và cũng khuyến nghị kiểm tra Data Roaming, mạng đối tác và VPN khi dữ liệu di động chưa hoạt động.

> **Trả lời nhanh:** hãy bật Data Roaming cho đúng SIM Viettel, kiểm tra máy đã đăng ký được mạng đối tác, sau đó kiểm tra APN có phải **`v-internet`** hay không. Nếu vẫn không có dữ liệu, tắt hoặc xóa VPN không cần thiết và thử lại. Không nên sửa hàng loạt thông số APN khác nếu Viettel không yêu cầu cho trường hợp của bạn.

Bài này tập trung vào search job **cài và kiểm tra APN Viettel khi roaming**. Nếu điện thoại không đăng ký được mạng đối tác, xem [cách chọn mạng thủ công khi roaming Viettel](/posts/chon-mang-thu-cong-roaming-viettel/). Nếu bạn đang ở Nhật Bản, xem riêng [hướng dẫn roaming Viettel tại Nhật không có mạng](/posts/viettel-roaming-nhat-ban-khong-co-mang/).

## APN Viettel khi roaming là gì?

APN (Access Point Name) là cấu hình để thiết bị thiết lập kết nối dữ liệu di động. Theo tài liệu roaming của Viettel, APN dùng cho SIM Viettel trong hướng dẫn này là:

**`v-internet`**

APN không phải là gói cước roaming và việc nhập đúng APN không tự tạo dung lượng data. Thuê bao vẫn cần có trạng thái roaming phù hợp và chịu điều kiện/cước của dịch vụ hoặc gói đang sử dụng.

## Khi nào nên kiểm tra APN?

Nên kiểm tra APN khi gặp tình huống như:

- điện thoại đã hiện tên mạng đối tác nhưng không vào Internet;
- đã bật Data Roaming nhưng dữ liệu vẫn không chạy;
- vừa thay đổi hoặc reset cài đặt mạng;
- máy có nhiều SIM và bạn chưa chắc SIM Viettel đang được chọn cho dữ liệu;
- đã chọn mạng thủ công thành công nhưng trình duyệt/app vẫn báo mất kết nối.

Nếu máy hoàn toàn không có sóng hoặc không đăng ký được mạng đối tác, hãy xử lý phần chọn mạng trước. APN chủ yếu liên quan đến đường dữ liệu sau khi thiết bị có thể kết nối với mạng di động phù hợp.

## Cài APN Viettel trên iPhone khi roaming

Tên menu có thể khác nhẹ theo phiên bản iOS. Hãy làm theo nguyên tắc sau:

1. Mở **Cài đặt**.
2. Vào **Di động** hoặc **Dịch vụ di động**.
3. Chọn đúng đường dây Viettel nếu iPhone có nhiều SIM/eSIM.
4. Bật **Chuyển vùng dữ liệu / Data Roaming**.
5. Mở phần cấu hình **Mạng dữ liệu di động / Cellular Data Network** nếu thiết bị và cấu hình nhà mạng cho phép chỉnh.
6. Kiểm tra trường APN dữ liệu là **`v-internet`**.
7. Quay lại, tắt/bật dữ liệu di động hoặc khởi động lại máy để thử kết nối.

Nếu iPhone không cho sửa APN, đừng cài profile lạ từ Internet. Cấu hình có thể do carrier settings quản lý. Khi đó nên kiểm tra cập nhật hệ điều hành/cài đặt nhà mạng và liên hệ Viettel nếu dữ liệu vẫn không hoạt động.

## Cài APN Viettel trên Android khi roaming

Trên Samsung, Xiaomi, OPPO, vivo, Pixel và các hãng khác, tên menu không hoàn toàn giống nhau. Luồng thường gặp:

1. Mở **Cài đặt**.
2. Vào **Kết nối**, **Mạng di động** hoặc **SIM & mạng**.
3. Chọn SIM Viettel.
4. Bật **Chuyển vùng dữ liệu / Data Roaming**.
5. Mở **Tên điểm truy cập / Access Point Names / APN**.
6. Chọn cấu hình Viettel hiện có hoặc tạo/chỉnh theo hướng dẫn của nhà mạng.
7. Đặt trường APN dữ liệu là **`v-internet`**.
8. Lưu cấu hình và chọn APN vừa kiểm tra nếu hệ điều hành yêu cầu.
9. Tắt/bật dữ liệu di động hoặc khởi động lại thiết bị.

Không tự điền proxy, port, username hay password từ một website không phải nguồn Viettel chỉ để “thử”. Nếu thiết bị đã có cấu hình do SIM/carrier cung cấp, ưu tiên giữ các trường không được Viettel yêu cầu thay đổi.

## Đã đúng v-internet nhưng roaming vẫn không vào mạng: kiểm tra 5 điểm

### 1. Data Roaming có bật trên đúng SIM không?

Điện thoại hai SIM rất dễ bật roaming cho một đường dây nhưng lại chọn đường dây khác làm SIM dữ liệu. Kiểm tra cả hai mục trước khi sửa APN thêm lần nữa.

### 2. Máy đã đăng ký đúng mạng đối tác chưa?

Viettel hướng dẫn người dùng kiểm tra mạng roaming khi dịch vụ chưa hoạt động. Nếu chọn mạng tự động không thành công, có thể cần [chọn mạng thủ công](/posts/chon-mang-thu-cong-roaming-viettel/) theo danh sách mạng Viettel hỗ trợ tại quốc gia đang đến.

### 3. VPN có đang can thiệp kết nối không?

Trong tài liệu hỗ trợ roaming, Viettel khuyến nghị kiểm tra và tắt/xóa VPN không cần thiết khi đã bật Data Roaming nhưng dịch vụ vẫn không chạy. Nếu bạn dùng VPN công ty bắt buộc, không nên xóa cấu hình quản trị; hãy tạm dừng theo chính sách của đơn vị hoặc liên hệ bộ phận IT.

### 4. Chế độ mạng có phù hợp không?

Một số quốc gia/mạng đối tác đã thay đổi hoặc tắt công nghệ 2G/3G. Thiết bị cũ hoặc máy đang khóa ở chế độ mạng không phù hợp có thể có vấn đề kết nối. Trường hợp Nhật Bản có hướng dẫn riêng của Viettel về 4G/5G, VoLTE và APN; xem [bài roaming Nhật Bản](/posts/viettel-roaming-nhat-ban-khong-co-mang/).

### 5. Trạng thái roaming và data của thuê bao có hợp lệ không?

APN đúng không thể thay thế việc kích hoạt dịch vụ roaming hoặc điều kiện sử dụng data. Nếu đã kiểm tra thiết bị mà vẫn không kết nối, hãy xác minh trạng thái dịch vụ trực tiếp với Viettel.

## Có cần đổi APN khi đi từng quốc gia không?

Không nên tự lấy APN của nhà mạng nước ngoài rồi thay vào SIM Viettel. Trong tài liệu roaming của Viettel được kiểm tra cho bài này, APN được hướng dẫn cho SIM Viettel là **`v-internet`**.

Điều có thể thay đổi theo quốc gia là **mạng đối tác**, công nghệ mạng khả dụng và điều kiện roaming. Vì vậy, nếu `v-internet` đã đúng nhưng vẫn lỗi, bước tiếp theo hợp lý thường là kiểm tra Data Roaming, mạng đối tác, VPN và khả năng tương thích mạng của thiết bị.

## APN đúng nhưng chỉ một số ứng dụng không vào mạng

Nếu trình duyệt hoạt động nhưng một ứng dụng riêng lẻ không kết nối, lỗi có thể không nằm ở APN. Hãy kiểm tra:

- quyền dùng dữ liệu di động của ứng dụng;
- chế độ tiết kiệm dữ liệu;
- VPN hoặc DNS riêng;
- giới hạn dữ liệu roaming của hệ điều hành;
- dịch vụ có bị giới hạn theo khu vực hay không.

Không nên reset toàn bộ điện thoại chỉ vì một ứng dụng lỗi trong khi các ứng dụng khác vẫn dùng data bình thường.

## Checklist xử lý nhanh

Khi roaming Viettel có sóng nhưng không vào Internet, làm theo thứ tự:

1. chọn đúng SIM Viettel cho dữ liệu;
2. bật Data Roaming;
3. kiểm tra máy đã vào được mạng đối tác;
4. kiểm tra APN **`v-internet`**;
5. tắt VPN không cần thiết;
6. tắt/bật dữ liệu hoặc khởi động lại máy;
7. nếu vẫn lỗi, liên hệ Viettel để kiểm tra trạng thái roaming của thuê bao.

## Nguồn kiểm chứng

- Viettel Telecom, **Hướng dẫn cài đặt APN trên điện thoại**: tài liệu roaming chính thức hướng dẫn APN `v-internet` trên iOS và Android.
- Viettel Telecom, **Hướng dẫn sử dụng ưu đãi Roaming**: hướng dẫn bật Data Roaming và kiểm tra mạng thủ công, APN, VPN khi chưa dùng được dịch vụ.
- Viettel Telecom, **Đi Nhật Bản không có mạng? Hướng dẫn bật 4G/5G và Roaming Viettel chi tiết**, 14/04/2026: xác nhận APN `v-internet` và việc kiểm tra VPN trong luồng troubleshooting roaming tại Nhật.

*Nguồn được kiểm tra ngày 16/08/2026. Menu thiết bị và mạng đối tác có thể thay đổi theo hệ điều hành, model và quốc gia; ưu tiên hướng dẫn Viettel đang hiển thị cho trường hợp thực tế của bạn.*
