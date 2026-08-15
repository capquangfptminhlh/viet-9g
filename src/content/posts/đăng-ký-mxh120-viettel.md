---
title: "Đăng ký MXH120 không được? Cách kiểm tra điều kiện và cú pháp đúng"
description: "Nếu đăng ký MXH120 Viettel không thành công, hãy kiểm tra đúng mã gói, thuê bao đủ điều kiện và cú pháp MXH120 GB gửi 290 trước khi thử lại."
pubDate: "2026-08-15"
category: "support"
tags: ["Viettel", "MXH120", "đăng ký không được", "hỗ trợ"]
---

# Đăng ký MXH120 không được? Cách kiểm tra điều kiện và cú pháp đúng

**Nếu bạn đã thử đăng ký MXH120 nhưng hệ thống không chấp nhận, đừng tiếp tục gửi lặp lại nhiều lần.** Hãy kiểm tra theo thứ tự: đúng mã gói → đúng cú pháp → thuê bao có thuộc diện áp dụng hay không → tài khoản và trạng thái thuê bao → sau đó mới thử đăng ký lại.

Trang này chỉ xử lý **intent hỗ trợ khi đăng ký MXH120 gặp lỗi**. Thông tin đầy đủ về giá, dung lượng, quyền lợi và các gói thay thế được giữ tại trang gói chính [MXH120](/goi-cuoc/mxh120/) để tránh hai URL cùng cạnh tranh một intent.

## Cú pháp đăng ký MXH120 trên website này

Luồng đăng ký của website sử dụng:

> **MXH120 GB** gửi **290**

Trong đó `GB` là mã đại lý được cấu hình cho luồng đăng ký của website. Nếu bạn bấm nút **Đăng ký** tại trang gói MXH120 trên điện thoại, hệ thống sẽ mở ứng dụng SMS với nội dung tương ứng.

## Trước khi đăng ký lại, kiểm tra 5 điểm này

### 1. Đúng mã gói

Mã cần gửi là `MXH120`. Tránh thêm ký tự lạ, dấu tiếng Việt hoặc khoảng trắng không cần thiết trong tên gói.

### 2. Đúng cú pháp đăng ký

Với luồng đăng ký của website này, cú pháp là `MXH120 GB` gửi `290`. Nếu bạn đang dùng một kênh Viettel khác, hãy làm theo hướng dẫn hiển thị trên chính kênh đó thay vì trộn nhiều cú pháp.

### 3. Kiểm tra thuê bao có đủ điều kiện hay không

Không nên mặc định mọi thuê bao Viettel đều đăng ký được cùng một gói. Catalog nguồn của dự án ghi MXH120 là gói có điều kiện áp dụng theo chính sách Viettel. Nếu hệ thống từ chối đăng ký dù cú pháp đúng, khả năng thuê bao không thuộc nhóm được áp dụng cần được kiểm tra qua kênh Viettel chính thức.

### 4. Kiểm tra tài khoản và trạng thái thuê bao

Nếu thuê bao trả trước không đủ số dư cần thiết tại thời điểm đăng ký, giao dịch có thể không thành công. Ngoài ra, thuê bao đang bị hạn chế dịch vụ hoặc có trạng thái bất thường cũng cần xử lý trước.

### 5. Đọc chính xác SMS phản hồi

Tin nhắn phản hồi của hệ thống là bằng chứng tốt nhất để biết lỗi thuộc nhóm nào. Nếu SMS báo không thuộc đối tượng, không nên tiếp tục gửi lại cùng một lệnh nhiều lần. Nếu SMS báo thiếu điều kiện khác, xử lý đúng điều kiện đó trước khi thử lại.

## Thông tin MXH120 đang được dự án xác minh từ đâu?

Source of Truth hiện tại của dự án ghi MXH120 ở mức **120.000đ/30 ngày, 1 GB/ngày, tổng 30 GB/tháng**, kèm ưu đãi gọi và dịch vụ mạng xã hội theo điều kiện sử dụng của Viettel. Dữ liệu này được lấy từ nguồn Viettel đã lưu trong `data/package-catalog.v1.json` và có thời hạn xác minh riêng.

Bài hỗ trợ này không tự sao chép toàn bộ quyền lợi gói để tránh tạo thêm một trang cạnh tranh với landing chính. Khi cần xem quyền lợi hiện hành, hãy dùng [trang MXH120](/goi-cuoc/mxh120/).

## Nếu vẫn không đăng ký được thì làm gì?

1. Chụp lại hoặc ghi chính xác nội dung SMS phản hồi.
2. Kiểm tra gói có còn hiển thị là phù hợp cho thuê bao trên kênh Viettel chính thức hay không.
3. Nếu cần, liên hệ kênh chăm sóc khách hàng Viettel để kiểm tra điều kiện thuê bao.
4. Chỉ đăng ký lại khi đã xác định được nguyên nhân thay vì gửi lặp lại cùng một cú pháp.

## Câu hỏi thường gặp

### MXH120 có phải gói dành cho mọi thuê bao không?

Không nên kết luận như vậy. Khả năng đăng ký phụ thuộc điều kiện áp dụng tại thời điểm thực hiện. Nếu thuê bao bị từ chối, cần kiểm tra trạng thái thực tế trên kênh Viettel chính thức.

### Tôi nên xem giá và dung lượng MXH120 ở đâu trên website?

Xem tại [landing gói MXH120](/goi-cuoc/mxh120/). URL đó là owner cho intent thương mại/entity MXH120; bài hiện tại chỉ xử lý tình huống đăng ký gặp lỗi.

### Có nên gửi lại SMS nhiều lần khi hệ thống báo lỗi không?

Không. Nên đọc nguyên nhân trong SMS phản hồi và xử lý điều kiện tương ứng trước.

## Kết luận

Nếu đăng ký MXH120 không thành công, hãy ưu tiên xác định **lỗi cú pháp hay lỗi điều kiện thuê bao**. Trang gói chính giữ vai trò cung cấp thông tin gói và CTA đăng ký; URL này chỉ giữ vai trò hỗ trợ troubleshooting để giảm cannibalization và giúp người dùng xử lý lỗi rõ ràng hơn.
