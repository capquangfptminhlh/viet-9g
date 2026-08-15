---
title: "Đăng ký SD90 không được? Cách kiểm tra cú pháp và lỗi thuê bao"
description: "Hướng dẫn xử lý khi đăng ký SD90 Viettel thất bại: kiểm tra mã gói, cú pháp SD90 GB gửi 290, điều kiện thuê bao và SMS phản hồi."
pubDate: "2026-08-15"
category: "support"
tags: ["Viettel", "SD90", "đăng ký không được", "hỗ trợ"]
---

# Đăng ký SD90 không được? Cách kiểm tra cú pháp và lỗi thuê bao

**Nếu bạn gửi đăng ký SD90 nhưng chưa thành công, đừng tiếp tục gửi nhiều lần.** Hãy kiểm tra đúng mã gói, đúng cú pháp, trạng thái thuê bao và nội dung SMS phản hồi.

Thông tin thương mại của SD90 được tập trung tại [trang SD90](/goi-cuoc/sd90/). URL hiện tại chỉ xử lý **intent hỗ trợ khi đăng ký gặp lỗi**.

## Cú pháp đăng ký trên website

> **SD90 GB** gửi **290**

Đây là luồng đăng ký được website khóa. Nếu bạn đang thao tác qua một kênh Viettel khác, hãy dùng cú pháp hiển thị trên chính kênh đó.

## Kiểm tra theo thứ tự

### 1. Mã gói

Đảm bảo tên gói là `SD90`, không thêm ký tự hoặc dấu khác.

### 2. Nội dung SMS

Với website này, nội dung là `SD90 GB` và gửi tới `290`. Nếu nút đăng ký không mở đúng nội dung, quay lại [landing SD90](/goi-cuoc/sd90/) và thử lại trên điện thoại.

### 3. Điều kiện thuê bao

Khả năng đăng ký có thể phụ thuộc chính sách áp dụng cho từng thuê bao. Nếu hệ thống báo không thuộc đối tượng, hãy kiểm tra gói khả dụng trên kênh Viettel chính thức thay vì tiếp tục gửi cùng lệnh.

### 4. Trạng thái SIM và tài khoản

Nếu SMS phản hồi cho biết thuê bao chưa đáp ứng điều kiện, hãy xử lý đúng điều kiện đó trước. Bài này không tự suy đoán số dư, trạng thái gói cũ hay quyền đăng ký của từng số thuê bao.

### 5. Giữ lại SMS phản hồi

Nội dung phản hồi giúp phân loại lỗi chính xác hơn. Khi cần hỗ trợ, cung cấp nguyên văn thông báo thay vì chỉ nói “đăng ký không được”.

## Câu hỏi thường gặp

### Xem giá và dung lượng SD90 ở đâu?

Xem [trang SD90](/goi-cuoc/sd90/), là canonical owner cho intent thương mại/entity của gói.

### Cú pháp của website là gì?

**SD90 GB gửi 290**.

### Có nên gửi lại liên tục không?

Không. Nên xử lý nguyên nhân trong SMS phản hồi trước khi thử lại.

## Kết luận

Bài này được retarget thành trang hỗ trợ lỗi đăng ký SD90; landing `/goi-cuoc/sd90/` giữ vai trò trang gói chính. Hai URL phục vụ hai user job khác nhau để giảm cannibalization.