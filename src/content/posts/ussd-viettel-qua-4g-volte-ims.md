---
title: "USSD Viettel sau tắt 2G: cách kiểm tra 4G/IMS và phương án thay thế"
description: "*101# hoặc *098# không chạy? Xem cách Viettel hướng dẫn kiểm tra USSD over IMS trên 4G/5G, điều kiện iPhone/Android và các kênh thay thế."
date: 2026-09-05
---

# USSD Viettel sau tắt 2G: cách kiểm tra 4G/IMS và phương án thay thế

Nếu bạn bấm `*101#`, `*102#`, `*098#` hoặc một mã USSD quen thuộc nhưng máy không trả kết quả, **đừng vội kết luận SIM Viettel bị lỗi**. Trong hướng dẫn chính thức đăng ngày 03/07/2026, Viettel cho biết khi hạ tầng 2G/3G được tắt để tập trung cho 4G/5G, thiết bị chưa được cập nhật phần mềm tương thích hoặc không hỗ trợ **USSD qua 4G (USSD over IMS)** có thể không thực hiện được lệnh USSD.

Điểm cần kiểm tra vì vậy không chỉ là “máy có 4G hay không”, mà là **máy, phần mềm và trạng thái IMS có cho phép USSD hoạt động trên kết nối 4G/5G hay không**. Nếu chưa dùng được, Viettel cũng công bố các kênh thay thế như ứng dụng My Viettel/Tammi, SMS và tổng đài 198.

> **Tóm tắt nhanh:** tắt Wi-Fi, giữ dữ liệu di động, kiểm tra VoLTE/IMS rồi thử `*101#` hoặc `*098#`. Nếu lệnh trả kết quả mà máy vẫn giữ 4G/LTE/5G, đó là dấu hiệu kiểm tra thực tế mà Viettel hướng dẫn cho USSD qua 4G. Nếu chưa được, hãy cập nhật phần mềm hoặc dùng kênh thay thế thay vì thử đi thử lại một mã USSD.

## Cập nhật kiểm chứng 05/09/2026: tắt 2G/3G ảnh hưởng USSD thì cần cập nhật gì?

Viettel khuyến nghị người dùng **kiểm tra và nâng cấp phần mềm thiết bị**, hoặc chuyển sang thiết bị hỗ trợ **USSD qua 4G (USSD over IMS)** nếu máy hiện tại không tương thích. Đây là cùng một search job với lỗi `*101#`, `*102#`, `*098#` không phản hồi trên 4G/5G, nên nội dung được hợp nhất vào canonical này thay vì tách thành một bài mới.

Các thao tác cần ưu tiên trước khi nghĩ tới đổi SIM hay đổi gói cước:

1. cập nhật hệ điều hành/phần mềm thiết bị lên bản ổn định mà máy hỗ trợ;
2. tắt Wi-Fi và thử USSD trong trạng thái dữ liệu di động;
3. kiểm tra VoLTE/IMS khi thiết bị có hiển thị trạng thái này;
4. thử lại `*101#` hoặc `*098#`;
5. nếu vẫn không dùng được, chuyển sang My Viettel/Tammi, SMS hoặc gọi `198` để xử lý nhu cầu trước mắt.

Không nên hiểu khuyến nghị “đổi sang thiết bị hỗ trợ” là mọi máy cũ đều bắt buộc phải đổi ngay. Cần xác nhận khả năng cập nhật phần mềm và tương thích thực tế của chính thiết bị trước.

## Vì sao *101# có thể không chạy dù điện thoại vẫn có 4G/5G?

USSD là nhóm lệnh quay số ngắn dùng cho nhiều thao tác như tra cứu tài khoản, đăng ký dịch vụ hoặc nạp thẻ. Theo Viettel, các cú pháp này trước đây hoạt động chủ yếu trên nền tảng 2G/3G. Khi thiết bị chuyển sang môi trường 4G/5G, việc điện thoại hiện biểu tượng 4G hoặc 5G **không tự động chứng minh** rằng máy đã hỗ trợ USSD over IMS.

Viettel nêu hai tình huống có thể gây gián đoạn:

- thiết bị chưa được cập nhật phần mềm tương thích;
- thiết bị không hỗ trợ USSD qua 4G.

Do đó, nếu data vẫn vào mạng bình thường nhưng `*101#` không phản hồi, hướng xử lý hợp lý là kiểm tra khả năng USSD/IMS của thiết bị trước. Đây cũng là lý do không nên đổi SIM, reset máy hoặc thay gói cước chỉ dựa trên một lần USSD thất bại.

## Cách kiểm tra USSD Viettel qua 4G trên Android

Viettel hướng dẫn người dùng Android kiểm tra theo trạng thái mạng thực tế thay vì chỉ nhìn tên model điện thoại.

### Bước 1: tắt Wi-Fi

Tắt Wi-Fi và chỉ để **Dữ liệu di động** hoạt động. Mục đích là tránh việc Wi-Fi che mất trạng thái kết nối di động mà bạn đang cần kiểm tra.

### Bước 2: kiểm tra VoLTE hoặc IMS

Quan sát cạnh cột sóng xem có biểu tượng **VoLTE** hay không. Trên một số máy, bạn có thể kiểm tra mục trạng thái SIM để xem **IMS Registration / Trạng thái đăng ký IMS** có báo đã đăng ký hay không.

Tên menu có thể khác giữa Samsung, Xiaomi, OPPO, vivo, realme và các phiên bản Android. Vì vậy, đừng coi một đường dẫn cài đặt duy nhất là áp dụng cho mọi máy.

### Bước 3: thử một lệnh USSD

Bấm `*101#` hoặc `*098#`. Theo hướng dẫn của Viettel, nếu kết quả USSD trả về bình thường thì thiết bị đã có khả năng dùng USSD qua 4G trong trạng thái đang kiểm tra.

Nếu chưa được, ưu tiên cập nhật hệ điều hành/phần mềm thiết bị trước. Với máy quá cũ và không còn được nhà sản xuất hỗ trợ cập nhật, khả năng tương thích có thể là giới hạn của chính thiết bị.

## Cách kiểm tra trên iPhone

Trên iPhone, Viettel hướng dẫn vào:

**Cài đặt (Settings) → Di động (Cellular) → Tùy chọn dữ liệu di động (Cellular Data Options) → Thoại & dữ liệu (Voice & Data)**.

Chọn 4G hoặc 5G và bảo đảm VoLTE được bật khi tùy chọn này xuất hiện trên thiết bị/cấu hình mạng.

Sau đó:

1. Tắt Wi-Fi.
2. Kiểm tra thanh trạng thái đang hiện 4G/LTE hoặc 5G.
3. Bấm `*101#` hoặc `*098#`.
4. Quan sát xem lệnh có trả kết quả và biểu tượng mạng có tiếp tục giữ 4G/LTE/5G hay không.

Nguồn Viettel ngày 03/07/2026 cũng nêu điều kiện hỗ trợ USSD over IMS trên iPhone là **iOS từ 18.1 trở lên**. Vì phần mềm thiết bị có thể tiếp tục thay đổi, bạn nên cập nhật iOS lên phiên bản ổn định mới nhất mà thiết bị hỗ trợ thay vì cố giữ một bản cũ.

Nếu bạn đang xử lý riêng phần cấu hình mạng trên iPhone, xem thêm [hướng dẫn cài đặt 4G/5G và VoLTE Viettel trên iPhone](/posts/cai-dat-4g-5g-volte-iphone-viettel/).

## *101# không chạy: có thể kiểm tra tài khoản bằng cách nào khác?

Đây là phần quan trọng nhất nếu bạn cần thông tin ngay và không muốn chờ xử lý USSD.

Theo bài hướng dẫn chính thức của Viettel, các kênh thay thế gồm:

| Nhu cầu | Kênh Viettel nêu trong hướng dẫn |
| --- | --- |
| Tra cứu tài khoản và dịch vụ | My Viettel hoặc Viettel Tammi |
| Tra cứu tài khoản qua SMS | Soạn `TK` gửi `191` |
| Nạp thẻ cào qua SMS | Soạn `NT <Mã thẻ cào>` gửi `100` |
| Đăng ký gói qua SMS | Soạn `<Tên gói cước>` gửi `191` |
| Cần hỗ trợ trực tiếp | Gọi `198` |

Như vậy, **USSD không phải kênh duy nhất** để xử lý các nhu cầu cơ bản. Nếu mục tiêu của bạn chỉ là xem số dư hoặc tìm cách tra cứu tài khoản, hãy ưu tiên phương án đang hoạt động thay vì mất thời gian khắc phục USSD trước. Bạn có thể xem thêm trang [kiểm tra tài khoản chính Viettel](/posts/cach-kiem-tra-tai-khoan-chinh/) để phân biệt các nhu cầu tra cứu.

## Có nên đổi điện thoại chỉ vì USSD không chạy?

Không nên quyết định chỉ từ một dấu hiệu.

Thứ tự kiểm tra an toàn hơn là:

1. xác nhận data di động đang hoạt động;
2. cập nhật phần mềm/hệ điều hành;
3. kiểm tra VoLTE hoặc trạng thái IMS nếu máy hiển thị;
4. tắt Wi-Fi và thử lại `*101#` hoặc `*098#` trên 4G/5G;
5. dùng My Viettel/Tammi, SMS hoặc 198 nếu cần xử lý ngay;
6. chỉ cân nhắc đổi thiết bị khi máy thực sự không còn khả năng cập nhật hoặc không hỗ trợ tính năng cần thiết.

Viettel có đưa ra một số dòng smartphone 4G/5G thế hệ mới để người dùng tham khảo, nhưng danh sách ví dụ **không nên được hiểu là danh sách duy nhất được hỗ trợ**. Khả năng thực tế còn phụ thuộc model, phiên bản phần mềm và cấu hình mạng.

## Ba nhầm lẫn thường gặp khi xử lý USSD sau quá trình tắt 2G

### “Có sóng 5G thì chắc chắn *101# phải chạy”

Không hẳn. Biểu tượng 5G cho biết trạng thái truy cập mạng, còn USSD over IMS liên quan đến khả năng hỗ trợ của thiết bị/phần mềm và trạng thái dịch vụ tương ứng.

### “*101# lỗi nghĩa là SIM hỏng”

Không đủ căn cứ. Nếu gọi, SMS hoặc data vẫn hoạt động, hãy kiểm tra phần mềm và IMS trước. Một lệnh USSD không phản hồi không tự chứng minh SIM vật lý bị hỏng.

### “Phải dùng USSD mới kiểm tra được tài khoản”

Không đúng theo hướng dẫn hiện hành của Viettel. Nhà mạng đã nêu My Viettel/Tammi, SMS `TK` gửi `191` và tổng đài `198` là các lựa chọn thay thế trong quá trình chuyển đổi.

## Khi nào nên gọi 198?

Bạn nên chuyển sang hỗ trợ trực tiếp nếu đã cập nhật phần mềm, thử trên dữ liệu di động và vẫn gặp một trong các tình huống sau:

- nhiều mã USSD đều không phản hồi;
- trạng thái IMS/VoLTE bất thường nhưng bạn không xác định được nguyên nhân;
- cần kiểm tra thông tin thuê bao mà app/SMS không giải quyết được;
- lỗi xuất hiện sau khi đổi thiết bị, đổi SIM hoặc thay đổi cấu hình mạng và bạn cần xác minh theo thuê bao cụ thể.

Không nên tự suy đoán một lỗi thuê bao cụ thể từ hướng dẫn chung trên web, vì trạng thái dịch vụ có thể khác giữa từng số thuê bao và thiết bị.

## FAQ về USSD Viettel trên 4G/5G

### USSD over IMS là gì?

Trong ngữ cảnh hướng dẫn của Viettel, đây là khả năng thực hiện lệnh USSD khi thiết bị hoạt động trên nền 4G thông qua IMS, thay vì phụ thuộc vào nền mạng 2G/3G cũ.

### iPhone cần iOS bao nhiêu để Viettel nêu là hỗ trợ USSD over IMS?

Bài Viettel ngày 03/07/2026 nêu **iOS 18.1 trở lên**. Hãy kiểm tra cập nhật phần mềm thực tế trên máy vì phiên bản hệ điều hành tiếp tục thay đổi theo thời gian.

### Nếu *101# không chạy thì dùng gì để tra cứu tài khoản?

Viettel nêu các lựa chọn gồm My Viettel/Tammi, SMS `TK` gửi `191`, hoặc gọi tổng đài `198` để được hỗ trợ.

### Có cần tắt Wi-Fi khi kiểm tra không?

Có. Hướng dẫn kiểm tra của Viettel yêu cầu tắt Wi-Fi và dùng kết nối di động để quan sát đúng trạng thái 4G/LTE/5G, VoLTE/IMS khi thử USSD.

## Kết luận

Nếu USSD Viettel không hoạt động trong giai đoạn chuyển dịch khỏi 2G/3G, cách xử lý hiệu quả là **kiểm tra khả năng USSD over IMS của thiết bị trước, đồng thời dùng kênh thay thế nếu cần thao tác ngay**. Trên Android, chú ý VoLTE/IMS; trên iPhone, kiểm tra 4G/5G, VoLTE và phiên bản iOS. Nếu vẫn không xử lý được, tổng đài 198 là kênh phù hợp để kiểm tra theo thuê bao cụ thể.

**Nguồn kiểm chứng:** [Viettel — “Cập nhật phần mềm và thiết bị hỗ trợ USSD: Không lo gián đoạn dịch vụ khi tắt sóng 2G”, đăng 03/07/2026](https://098.viettel.vn/tin-tuc/chi-tiet/cap-nhat-phan-mem-va-thiet-bi-ho-tro-ussd-khong-lo-gian-doan-dich-vu-khi-tat-song-2g/14894320). Nội dung bài này được kiểm chứng lại ngày 05/09/2026 dựa trên phạm vi thông tin mà nguồn chính thức nêu; không suy rộng thành cam kết tương thích cho mọi thiết bị.