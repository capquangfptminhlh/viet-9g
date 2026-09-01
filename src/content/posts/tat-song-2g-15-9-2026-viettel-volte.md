---
title: "Tắt sóng 2G 15/9/2026: điện thoại 4G Viettel có bị mất cuộc gọi không?"
description: "Giải thích ai có thể bị ảnh hưởng khi 2G dừng sau 15/9/2026, vì sao điện thoại 4G vẫn có thể không gọi được và cách kiểm tra VoLTE Viettel trước thời điểm chuyển đổi."
date: 2026-09-01
---

# Tắt sóng 2G 15/9/2026: điện thoại 4G Viettel có bị mất cuộc gọi không?

Từ sau **15/9/2026**, mạng GSM/2G bước vào mốc dừng theo lộ trình quản lý tần số. Điểm dễ gây nhầm là **điện thoại có 4G chưa chắc đã sẵn sàng cho cuộc gọi thoại khi 2G không còn**: một số máy vẫn dùng 4G cho Internet nhưng cần VoLTE để gọi trực tiếp trên 4G/5G.

![Minh họa điện thoại 4G/5G Viettel duy trì cuộc gọi khi mạng 2G được dừng](/images/tat-song-2g-volte-viettel.svg)

Nếu đang dùng Viettel, trước mốc chuyển đổi hãy kiểm tra ba lớp: **thiết bị có hỗ trợ VoLTE → SIM/thuê bao dùng 4G/5G → dịch vụ VoLTE đã hoạt động và gọi thử thành công**.

## Mốc 15/9/2026 có ý nghĩa gì?

Theo lộ trình công bố trên Cổng thông tin Bộ Khoa học và Công nghệ, hệ thống GSM/2G được tiếp tục sử dụng đến hết **15/9/2026**, ngoại trừ các khu vực đặc thù được nêu trong nguồn như Trường Sa, Hoàng Sa và nhà giàn DK.

Điều này khác với mốc năm 2024. Giai đoạn 2024 tập trung dừng phục vụ thiết bị **2G only**, còn hạ tầng 2G vẫn được duy trì trong thời gian chuyển tiếp để hỗ trợ một số thiết bị 3G/4G chưa có thoại trên 4G. Vì vậy, tháng 9/2026 mới là mốc cần đặc biệt chú ý với nhóm máy 4G nhưng thoại vẫn phụ thuộc lớp mạng cũ.

Nguồn quản lý nhà nước: [Bộ Khoa học và Công nghệ — Lộ trình tắt sóng 2G](https://mst.gov.vn/bo-tttt-cong-bo-lo-trinh-tat-song-2g-197240705094212138.htm).

## Điện thoại 4G Viettel có thể vẫn mất cuộc gọi sau khi 2G dừng không?

**Có thể.** Kết nối 4G để dùng Internet và khả năng gọi thoại trên 4G là hai việc khác nhau.

Một điện thoại có thể:

- vẫn hiện 4G/5G và truy cập Internet bình thường;
- nhưng khi gọi lại chuyển xuống 2G/3G;
- hoặc chưa hỗ trợ / chưa kích hoạt VoLTE;
- vì vậy có nguy cơ không thiết lập được cuộc gọi khi lớp mạng thoại cũ không còn.

Hướng dẫn triển khai của cơ quan nhà nước trong tháng 8/2026 cũng lưu ý nhóm **điện thoại 4G chưa hỗ trợ VoLTE hoặc chưa kích hoạt VoLTE** có thể bị ảnh hưởng dịch vụ thoại sau khi 2G dừng.

Nguồn cập nhật: [Cổng thông tin điện tử Hải Phòng — Lộ trình tắt sóng 2G và chuyển đổi thiết bị, SIM 4G/5G, 11/08/2026](https://nhichieu.haiphong.gov.vn/tin-tuc-su-kien/lo-trinh-tat-song-2g-va-chuyen-doi-thiet-bi-dau-cuoi-sim-4g-5g-947884).

## VoLTE là phần quan trọng nhất cần kiểm tra

VoLTE là cuộc gọi thoại trên nền 4G/LTE. Viettel công bố dịch vụ này cho phép cuộc gọi được thiết lập trên mạng 4G/5G thay vì phải rơi xuống lớp mạng thoại cũ.

Với thuê bao Viettel, tài liệu chính thức hướng dẫn đăng ký dịch vụ bằng:

**`HDCALL` gửi `191`**

Viettel công bố **phí đăng ký dịch vụ VoLTE là 0 đồng**. Nhiều thuê bao có thể đã được kích hoạt sẵn, nên không cần nhắn lặp lại nếu dịch vụ đã hoạt động.

Nguồn Viettel: [VoLTE — dịch vụ thoại chất lượng cao trên hạ tầng mạng 4G/5G](https://098.viettel.vn/tin-tuc/chi-tiet/volte-dich-vu-thoai-chat-luong-cao-tren-ha-tang-mang-4g5g-viettel/13748208).

## Checklist 5 bước trước khi 2G dừng

### 1. Xác định máy có hỗ trợ 4G/5G và VoLTE

Không nên chỉ nhìn biểu tượng 4G để kết luận máy đã sẵn sàng. Hãy kiểm tra model có hỗ trợ VoLTE hay không và cập nhật phần mềm ổn định nếu nhà sản xuất/Viettel có hướng dẫn.

Viettel hiện có hướng dẫn VoLTE cho nhiều nhóm thiết bị như iPhone, Samsung, Huawei, Oppo/Realme, Redmi/Xiaomi, Vivo, Poco, Google Pixel, Sony Xperia và một số dòng khác. Tuy nhiên, **không nên suy rộng rằng mọi model của mọi hãng đều tương thích**.

Nguồn Viettel: [Hướng dẫn bật dịch vụ cuộc gọi VoLTE, 14/04/2026](https://098.viettel.vn/tin-tuc/huong-dan-bat-dich-vu-cuoc-goi-volte-goi-chat-luong-tot-hon-an-toan-hon/15298552).

### 2. Kiểm tra SIM/eSIM đang dùng đúng thuê bao Viettel và hỗ trợ 4G/5G

Nếu máy dùng hai SIM, hãy kiểm tra đúng SIM Viettel đang dùng cho thoại và dữ liệu. Nếu SIM quá cũ hoặc trạng thái thuê bao chưa rõ, nên xác minh với Viettel thay vì tự kết luận chỉ từ biểu tượng sóng.

### 3. Kiểm tra dịch vụ VoLTE trên thuê bao

Nếu chưa từng kiểm tra, có thể dùng cú pháp **`HDCALL` gửi `191`** theo hướng dẫn Viettel. Nếu thuê bao đã được kích hoạt sẵn, bước này chỉ dùng để xác minh, không phải mua một gói data mới.

### 4. Bật VoLTE / Cuộc gọi 4G trên điện thoại nếu máy có công tắc

Tên và vị trí menu thay đổi theo hệ điều hành, model và phiên bản phần mềm.

- Android: xem hướng dẫn riêng [cách bật VoLTE Viettel trên Android](/posts/bat-volte-viettel-android/).
- iPhone: xem [cách bật VoLTE Viettel trên iPhone](/posts/cai-dat-4g-5g-volte-iphone-viettel/).

Bài này không lặp lại toàn bộ menu thiết bị để tránh tạo nội dung trùng với hai canonical owner trên.

### 5. Gọi thử ngay khi còn thời gian xử lý

Sau khi bật VoLTE, hãy thực hiện một cuộc gọi đi. Tùy điện thoại, máy có thể tiếp tục hiển thị 4G/5G/LTE hoặc VoLTE trong khi gọi.

Không nên chờ tới sát mốc dừng 2G mới thử. Nếu cuộc gọi vẫn rơi khỏi 4G/LTE hoặc không thiết lập được, còn thời gian để kiểm tra thiết bị, firmware, SIM và trạng thái dịch vụ với Viettel.

## Nếu máy vẫn vào Internet nhưng không gọi được thì xử lý theo thứ tự nào?

Hãy xử lý từ ít rủi ro đến nhiều thay đổi hơn:

1. kiểm tra đúng SIM Viettel trên máy hai SIM;
2. kiểm tra loại mạng ưu tiên có 4G/LTE hoặc 5G;
3. xác minh thiết bị có VoLTE;
4. xác minh dịch vụ VoLTE trên thuê bao;
5. bật VoLTE nếu máy có công tắc;
6. khởi động lại máy sau thay đổi cấu hình;
7. gọi thử lại;
8. nếu vẫn lỗi, liên hệ Viettel để kiểm tra theo thuê bao và model cụ thể.

Không nên xóa eSIM, reset toàn bộ máy hoặc nhập mã kỹ thuật không có trong hướng dẫn chính thức chỉ để thử sửa lỗi thoại.

## USSD như *098# có liên quan gì đến việc tắt 2G?

Có, nhưng đó là **một search job khác**. Viettel cho biết một số thao tác USSD truyền thống cần thiết bị/phần mềm hỗ trợ **USSD over IMS** khi mạng cũ được dừng.

Nếu vấn đề của bạn là `*098#`, `*101#`, `*102#` hoặc mã USSD không phản hồi, xem canonical riêng [USSD Viettel qua 4G/VoLTE/IMS](/posts/ussd-viettel-qua-4g-volte-ims/).

## Có phải đổi SIM chỉ vì sắp tắt 2G?

**Không nên mặc định.** Nếu SIM/eSIM Viettel hiện tại đã hỗ trợ 4G/5G và thuê bao hoạt động bình thường, vấn đề cần kiểm tra tiếp là thiết bị và VoLTE.

Chỉ nên đổi SIM khi trạng thái thực tế cho thấy SIM chưa đáp ứng hoặc Viettel xác nhận cần chuyển đổi. Bài này không khẳng định mọi SIM cũ đều phải đổi và cũng không tự đặt mức phí đổi SIM vì chính sách có thể phụ thuộc nghiệp vụ/thuê bao.

## Có phải đổi điện thoại nếu máy đang có 4G?

Không phải mọi máy 4G đều cần đổi. Trước tiên hãy xác định **máy có hỗ trợ VoLTE phù hợp hay không**.

Nếu model hỗ trợ VoLTE và cuộc gọi thử hoạt động trên 4G/LTE, không có cơ sở để kết luận chỉ vì tắt 2G mà bắt buộc phải thay máy. Ngược lại, nếu thiết bị chỉ dùng 4G cho data nhưng không có khả năng thoại VoLTE, cần cân nhắc thiết bị phù hợp hơn để tránh gián đoạn cuộc gọi.

## Những điều bài này không khẳng định

Để tránh suy diễn từ nguồn, các điểm sau được giữ ở trạng thái **chưa xác minh phổ quát**:

- mọi model 4G đều hỗ trợ VoLTE;
- mọi nơi sẽ tắt 2G vào cùng một giờ chính xác;
- mọi thuê bao có cùng trình tự xử lý;
- mọi SMS/OTP sẽ có hành vi giống nhau trên mọi thiết bị sau khi 2G dừng;
- mọi SIM cũ đều phải đổi;
- mọi lỗi thoại đều do 2G shutdown.

Nếu cần xác minh theo thuê bao cụ thể, nên dùng kênh hỗ trợ chính thức của Viettel.

## Câu hỏi nhanh

### Tắt 2G rồi điện thoại 4G Viettel có còn dùng Internet không?
Nếu thiết bị, SIM và vùng phủ 4G/5G đáp ứng, data có thể vẫn hoạt động. Rủi ro được nói đến trong bài này là **thoại** trên một số máy 4G chưa sẵn sàng VoLTE.

### Có 4G nhưng gọi điện bị mất mạng sau khi 2G dừng thì kiểm tra gì trước?
Kiểm tra VoLTE của thiết bị và thuê bao, đúng SIM, loại mạng 4G/5G rồi gọi thử lại. Android và iPhone có hướng dẫn riêng trên website.

### Viettel bật VoLTE bằng cú pháp nào?
Theo tài liệu Viettel: **`HDCALL` gửi `191`**, phí đăng ký dịch vụ được công bố là **0 đồng**.

### Mốc 15/9/2026 có phải mốc tắt 2G theo lộ trình không?
Theo nguồn quản lý nhà nước, GSM/2G được sử dụng đến hết **15/9/2026**, với các ngoại lệ khu vực đặc thù được nêu trong nguồn chính thức.

## Nguồn kiểm chứng

- [Bộ Khoa học và Công nghệ — Bộ TT&TT công bố lộ trình tắt sóng 2G](https://mst.gov.vn/bo-tttt-cong-bo-lo-trinh-tat-song-2g-197240705094212138.htm)
- [Cổng thông tin điện tử Hải Phòng — Lộ trình tắt sóng 2G và chuyển đổi thiết bị, SIM 4G/5G, 11/08/2026](https://nhichieu.haiphong.gov.vn/tin-tuc-su-kien/lo-trinh-tat-song-2g-va-chuyen-doi-thiet-bi-dau-cuoi-sim-4g-5g-947884)
- [Viettel — Hướng dẫn bật dịch vụ cuộc gọi VoLTE, 14/04/2026](https://098.viettel.vn/tin-tuc/huong-dan-bat-dich-vu-cuoc-goi-volte-goi-chat-luong-tot-hon-an-toan-hon/15298552)
- [Viettel — VoLTE trên hạ tầng 4G/5G, 23/04/2025](https://098.viettel.vn/tin-tuc/chi-tiet/volte-dich-vu-thoai-chat-luong-cao-tren-ha-tang-mang-4g5g-viettel/13748208)

**Cập nhật nguồn:** 01/09/2026. Giá gói cước, vùng phủ, model tương thích phổ quát và các chỉ số search volume/KD/CPC không được suy diễn trong bài này.
