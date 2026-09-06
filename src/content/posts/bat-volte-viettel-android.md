---
title: "Bật VoLTE Viettel trên Android trước tắt 2G 15/9/2026"
description: "Android Viettel vẫn hiện 4G/5G nhưng thoại chưa chắc sẵn sàng sau tắt 2G. Cách bật VoLTE, HDCALL gửi 191, kiểm tra Samsung, Xiaomi, Oppo, Realme và gọi thử."
date: 2026-09-06
---

# Bật VoLTE Viettel trên Android trước tắt 2G 15/9/2026

**Cập nhật kiểm chứng 06/09/2026:** mốc dừng sóng 2G ngày **15/09/2026** đang khiến câu hỏi “điện thoại Android vẫn hiện 4G/5G thì có gọi được không?” trở nên cấp thiết hơn. Điểm cần kiểm tra không chỉ là biểu tượng data: một máy có Internet 4G/5G **chưa tự động chứng minh thoại VoLTE đã sẵn sàng**.

> **Trả lời nhanh:** nếu dùng Android với SIM/eSIM Viettel, hãy kiểm tra theo chuỗi **thiết bị hỗ trợ VoLTE → đúng SIM Viettel → dịch vụ VoLTE trên thuê bao → chế độ mạng 4G/5G → công tắc VoLTE/4G Calling nếu máy có → cuộc gọi thử**. Viettel hướng dẫn đăng ký VoLTE/HD Voice bằng **`HDCALL` gửi `191`** và công bố phí đăng ký dịch vụ là **0 đồng**.

![Minh họa VoLTE Viettel trên điện thoại Android Samsung, Xiaomi, Oppo và Realme](/images/volte-viettel-android.svg)

## Vì sao Android có 4G/5G vẫn nên kiểm tra VoLTE trước 15/9?

Data di động và thoại là hai lớp kiểm tra khác nhau. Điện thoại có thể truy cập Internet trên 4G/5G nhưng cuộc gọi vẫn chưa đi qua VoLTE nếu thiết bị, phần mềm, cấu hình nhà mạng hoặc trạng thái dịch vụ trên thuê bao chưa đáp ứng.

Các bản tin đầu tháng 9/2026 về lộ trình dừng 2G tiếp tục cảnh báo rằng **một số điện thoại 4G vẫn có nguy cơ gián đoạn liên lạc nếu chưa sẵn sàng cho thoại trên nền 4G**. Vì vậy, trước mốc 15/09, việc hữu ích nhất là kiểm tra bằng một cuộc gọi thực tế thay vì chỉ nhìn biểu tượng 4G/5G trên thanh trạng thái.

Bài này chỉ sở hữu search job **bật và chẩn đoán VoLTE Viettel trên Android**. Nếu bạn cần tổng quan riêng về mốc tắt 2G và nhóm thiết bị có nguy cơ, xem [tắt sóng 2G 15/9/2026 và VoLTE Viettel](/posts/tat-song-2g-15-9-2026-viettel-volte/). Nếu dùng iPhone, xem owner riêng [cách bật VoLTE Viettel trên iPhone](/posts/cai-dat-4g-5g-volte-iphone-viettel/).

## VoLTE Viettel trên Android là gì?

VoLTE (Voice over LTE) là cuộc gọi thoại được thiết lập trên hạ tầng 4G/LTE thay vì phụ thuộc lớp mạng thoại cũ. Trong tài liệu hướng dẫn VoLTE của Viettel, điều kiện cốt lõi gồm thiết bị hỗ trợ, thuê bao có dịch vụ và tính năng VoLTE được bật trên thiết bị.

Trên Android, tên hiển thị không giống nhau giữa các hãng và phiên bản phần mềm. Bạn có thể thấy:

- **VoLTE**;
- **Cuộc gọi VoLTE**;
- **4G Calling**;
- **HD Voice**;
- hoặc không có công tắc riêng vì phần mềm/nhà mạng quản lý tự động.

Vì vậy, **không thấy chữ VoLTE không đồng nghĩa chắc chắn máy không hỗ trợ**. Cần kiểm tra cả trạng thái dịch vụ và cuộc gọi thử.

## Checklist 5 phút trước khi kết luận Android chưa sẵn sàng

Thực hiện theo thứ tự này để tránh reset máy hoặc đổi SIM không cần thiết:

1. Xác nhận đang kiểm tra **đúng SIM/eSIM Viettel** nếu máy có hai SIM.
2. Đặt loại mạng ưu tiên ở **4G/LTE hoặc 5G** phù hợp với thiết bị.
3. Kiểm tra dịch vụ VoLTE bằng hướng dẫn **`HDCALL` gửi `191`** hoặc liên hệ Viettel nếu cần xác minh trạng thái.
4. Mở phần **Mạng di động / Mobile networks** và bật **VoLTE / 4G Calling / Cuộc gọi VoLTE** nếu thiết bị có tùy chọn.
5. Khởi động lại khi vừa thay đổi cấu hình nếu cần, sau đó **thực hiện một cuộc gọi đi** và quan sát kết nối.

Nếu data vẫn bình thường nhưng chỉ thoại có vấn đề, đừng vội sửa APN. APN là search job dữ liệu riêng; xem [cách cài APN Viettel 4G/5G `v-internet`](/posts/cai-apn-viettel-4g-5g-v-internet/) khi lỗi nằm ở truy cập Internet.

## Bước 1: đăng ký VoLTE Viettel bằng HDCALL gửi 191

Theo tài liệu Viettel, cú pháp đăng ký dịch vụ VoLTE/HD Voice là:

**`HDCALL` gửi `191`**

Viettel công bố **phí đăng ký dịch vụ VoLTE là 0 đồng**. Đây không phải cú pháp mua gói data và không làm thay đổi luồng đăng ký gói cước trên website này.

Cần phân biệt rõ:

- **phí dịch vụ VoLTE = 0 đồng** không có nghĩa mọi cuộc gọi đều miễn phí;
- cước thoại thực tế vẫn phụ thuộc gói cước/chính sách đang áp dụng cho thuê bao;
- việc điện thoại hiện 4G/5G không thay thế bước kiểm tra trạng thái VoLTE.

Nếu thuê bao đã có VoLTE, không cần đăng ký lặp lại chỉ để làm xuất hiện biểu tượng trên màn hình.

## Bước 2: bật VoLTE trên Android theo đường dẫn chung

Viettel có tài liệu hướng dẫn Android theo nhánh cài đặt tương tự:

**Cài đặt (Settings) → Kết nối/Mạng di động (Connections/Mobile networks) → chọn SIM Viettel → bật VoLTE / Cuộc gọi VoLTE nếu máy có công tắc.**

Tên mục có thể khác theo Samsung One UI, Xiaomi/Redmi/Poco với MIUI hoặc HyperOS, Oppo/Realme, Vivo và các biến thể Android khác. Do đó, hãy tìm các từ khóa **SIM**, **Mạng di động**, **Loại mạng ưu tiên**, **VoLTE**, **Cuộc gọi 4G** thay vì cố áp dụng một đường dẫn duy nhất cho mọi model.

## Samsung: bật và kiểm tra VoLTE Viettel ở đâu?

Trên nhiều máy Samsung, phần liên quan thường nằm dưới:

**Cài đặt → Kết nối → Các mạng di động**

Tùy model và phiên bản One UI, máy có thể hiển thị **Cuộc gọi VoLTE** hoặc tự quản lý tính năng theo cấu hình nhà mạng.

Nếu dùng hai SIM:

- kiểm tra SIM nào đang đặt cho cuộc gọi;
- kiểm tra SIM nào đang đặt cho dữ liệu;
- chắc chắn thao tác đang áp dụng lên đúng SIM Viettel;
- sau khi cấu hình, gọi thử một số bình thường và quan sát trạng thái mạng trong lúc gọi.

Không nên lấy menu của một model Samsung cụ thể rồi khẳng định tất cả máy Samsung phải giống hệt.

## Xiaomi, Redmi, Poco: không thấy nút VoLTE thì làm gì?

Tên menu và cách hiển thị VoLTE có thể thay đổi theo MIUI/HyperOS, model và phiên bản phần mềm. Trước khi dùng mã kỹ thuật trên Internet, hãy kiểm tra những bước ít rủi ro hơn:

- SIM Viettel có đang hoạt động bình thường không;
- đúng SIM có được chọn cho thoại không;
- loại mạng ưu tiên có 4G/LTE hoặc 5G không;
- dịch vụ VoLTE trên thuê bao đã sẵn sàng chưa;
- máy có bản cập nhật phần mềm ổn định nào đang chờ không;
- cuộc gọi thử có giữ được kết nối 4G/LTE/5G theo khả năng thiết bị không.

Không nên nhập mã kỹ thuật không có trong hướng dẫn chính thức chỉ để ép hiện công tắc VoLTE. Nếu thiết bị được cho là hỗ trợ nhưng vẫn không hoạt động, ưu tiên xác minh trạng thái thuê bao với Viettel.

## Oppo và Realme: kiểm tra nhanh thế nào?

Trên Oppo/Realme, tùy ColorOS/realme UI, mục liên quan có thể nằm trong **SIM & mạng di động**, **Mạng di động** hoặc nhánh tương đương.

Luồng an toàn:

1. chọn đúng SIM Viettel;
2. chọn 4G/LTE hoặc 5G làm chế độ mạng phù hợp;
3. bật **VoLTE/Cuộc gọi VoLTE** nếu tùy chọn xuất hiện;
4. thực hiện cuộc gọi thử;
5. nếu vừa thay đổi cấu hình mà chưa được, khởi động lại rồi kiểm tra lại.

## Android không có nút VoLTE có chắc sẽ mất cuộc gọi sau tắt 2G không?

**Không thể kết luận chỉ từ việc thiếu một công tắc.** Một số phiên bản Android hoặc cấu hình nhà mạng có thể không hiển thị nút VoLTE riêng. Cách kiểm tra đáng tin hơn là kết hợp:

- model/phần mềm có hỗ trợ thoại LTE hay không;
- trạng thái dịch vụ trên thuê bao;
- đúng SIM và đúng chế độ mạng;
- cuộc gọi thực tế.

Nếu cuộc gọi vẫn thiết lập bình thường và thiết bị duy trì lớp mạng 4G/LTE/5G theo cách máy hiển thị, đó là bằng chứng thực tế hữu ích hơn việc chỉ tìm một icon.

Ngược lại, nếu cứ bắt đầu gọi là máy rơi về lớp mạng cũ hoặc không thiết lập được cuộc gọi, nên xử lý trước mốc 15/09 thay vì chờ đến khi 2G dừng hoàn toàn.

## Tại sao Android đã bật 4G/5G nhưng gọi vẫn không chạy VoLTE?

### 1. Thuê bao chưa có dịch vụ VoLTE

Kiểm tra **`HDCALL` gửi `191`** hoặc liên hệ Viettel để xác minh. 4G/5G data và VoLTE voice không phải cùng một trạng thái.

### 2. Đang chỉnh nhầm SIM trên máy hai SIM

Một SIM có thể dùng cho data trong khi SIM kia là mặc định cho thoại. Hãy kiểm tra đúng SIM Viettel trước khi thay đổi cấu hình.

### 3. Thiết bị hoặc firmware chưa tương thích

Nếu thuê bao đã có dịch vụ nhưng thiết bị không có tùy chọn phù hợp và cuộc gọi không hoạt động như mong đợi, cần kiểm tra chính model, phiên bản phần mềm và cấu hình nhà mạng. Không suy từ tên hãng sang toàn bộ model.

### 4. Loại mạng ưu tiên chưa phù hợp

Nếu máy đang khóa ở một chế độ mạng không phù hợp, chuyển về lựa chọn 4G/LTE hoặc 5G mà thiết bị hỗ trợ rồi gọi thử lại.

### 5. Cần khởi động lại sau khi thay đổi cấu hình

Sau thay đổi dịch vụ/cài đặt, khởi động lại là bước xử lý ít rủi ro hơn so với reset toàn bộ cài đặt mạng hoặc xóa eSIM.

## Có cần đổi SIM để dùng VoLTE Viettel trên Android không?

Không nên mặc định phải đổi SIM chỉ vì chưa thấy VoLTE. Hãy kiểm tra SIM/eSIM đang dùng, trạng thái dịch vụ và khả năng của thiết bị trước.

Nếu câu hỏi của bạn là **SIM 4G hiện tại có dùng được 5G hay phải đổi SIM mới**, đó là intent riêng. Xem [SIM 4G Viettel có dùng được 5G không?](/posts/sim-4g-viettel-co-dung-duoc-5g-khong/).

Nếu vừa chuyển SIM sang điện thoại khác và bị chặn/xác thực khuôn mặt, xem [SIM Viettel lắp sang máy mới bị chặn 1 chiều](/posts/sim-viettel-lap-sang-may-moi-bi-chan-1-chieu/) thay vì xử lý như lỗi VoLTE.

## VoLTE Android và VoLTE khi roaming có giống nhau không?

Không hoàn toàn. Bài này tập trung vào **VoLTE trong nước trên Android**. Khi roaming, ngoài thiết bị/thuê bao còn có điều kiện chuyển vùng quốc tế, mạng đối tác và hỗ trợ VoLTE Roaming tại điểm đến.

Nếu lỗi xảy ra ở nước ngoài, xem [cách bật VoLTE khi roaming Viettel](/posts/bat-volte-khi-roaming-viettel/). Nếu có sóng nhưng không vào Internet, hãy kiểm tra [Data Roaming Viettel trên iPhone/Android](/posts/data-roaming-viettel-iphone-android/).

## Không nên làm gì khi VoLTE chưa hoạt động

- Không xóa eSIM chỉ để thử sửa lỗi thoại.
- Không reset toàn bộ cài đặt mạng ở bước đầu.
- Không đổi APN nếu data vẫn bình thường và lỗi chỉ nằm ở thoại.
- Không dùng mã kỹ thuật không được Viettel hướng dẫn để ép bật tính năng.
- Không mua gói data chỉ vì nghĩ gói cước sẽ tự kích hoạt VoLTE.
- Không kết luận “máy có 5G = chắc chắn thoại 4G đã sẵn sàng”.

## Khi nào cần liên hệ Viettel?

Nếu đã kiểm tra đủ **thiết bị, SIM/eSIM, dịch vụ VoLTE, đúng SIM, chế độ mạng và cuộc gọi thử** nhưng thoại vẫn không hoạt động, nên liên hệ Viettel để kiểm tra trạng thái thuê bao thay vì tiếp tục thay đổi cấu hình sâu.

Tài liệu hỗ trợ Viettel công bố tổng đài **1800 8098**. Nếu cần báo lỗi, nên chuẩn bị trước:

- model điện thoại;
- phiên bản Android/One UI/HyperOS/ColorOS tương ứng;
- SIM vật lý hay eSIM;
- máy một SIM hay hai SIM;
- trạng thái 4G/5G trước và trong lúc gọi;
- thời điểm và khu vực xảy ra lỗi.

## Câu hỏi nhanh

### Bật VoLTE Viettel trên Android có mất phí không?

Theo tài liệu Viettel, phí đăng ký dịch vụ VoLTE bằng **`HDCALL` gửi `191`** là **0 đồng**. Điều này không đồng nghĩa mọi cuộc gọi đều miễn phí.

### Samsung không có nút VoLTE có phải SIM bị lỗi không?

Chưa thể kết luận. Tùy model/phần mềm, công tắc có thể hiển thị khác hoặc được quản lý tự động. Hãy kiểm tra trạng thái dịch vụ và gọi thử trước.

### Máy hiện 5G có chắc chắn gọi VoLTE được không?

Không. Biểu tượng 5G chủ yếu cho biết trạng thái kết nối dữ liệu/mạng; thoại VoLTE còn phụ thuộc thiết bị, phần mềm, SIM/thuê bao và cấu hình dịch vụ.

### Android 4G có thể bị gián đoạn cuộc gọi sau 15/9/2026 không?

Có thể xảy ra với thiết bị/thuê bao chưa sẵn sàng cho thoại trên nền 4G và trước đó còn phụ thuộc mạng cũ. Vì vậy cần kiểm tra VoLTE thực tế trước mốc dừng 2G, nhưng không nên suy rằng mọi Android 4G đều sẽ mất cuộc gọi.

### Có nên đổi SIM chỉ để chắc chắn có VoLTE không?

Không nên coi đổi SIM là bước đầu mặc định. Trước hết hãy kiểm tra đúng SIM, dịch vụ VoLTE, hỗ trợ thiết bị và cuộc gọi thử.

## Nguồn kiểm chứng

- [Viettel Telecom — Hướng dẫn sử dụng gọi VoLTE (4G) Roaming](https://media.vietteltelecom.vn/upload/InternationalMessagePrice/b6/d7/7b/0b394bd302ad3427a447221a9b89661ec4399ea5.pdf): xác nhận điều kiện thiết bị, `HDCALL` gửi `191`, miễn phí đăng ký và yêu cầu bật VoLTE trên thiết bị. Bài này chỉ dùng phần kỹ thuật chung có thể đối chiếu, không suy diễn điều kiện roaming thành điều kiện trong nước.
- [Viettel Telecom — Các bước thao tác cụ thể bật chức năng gọi VoLTE](https://media.vietteltelecom.vn/upload/InternationalMessagePrice/ed/cf/fe/472bc67201bc609be3830366ec546607573f53ff.pdf): minh họa đường dẫn Android **Settings → Connections → Mobile networks → VoLTE calls SIM** trong tài liệu Viettel; giao diện thực tế có thể khác theo model/phần mềm.
- Báo Tuổi Trẻ/Vietnam.vn, đầu tháng 09/2026: nguồn freshness cho cảnh báo một số máy 4G có thể gián đoạn liên lạc khi dừng 2G nếu chưa đáp ứng thoại trên nền mới. Nguồn này không được dùng để tự tạo giá, eligibility hay cấu hình Viettel.

**Phạm vi kiểm chứng:** bài không khẳng định mọi Android 4G đều bị ảnh hưởng, không tự tạo danh sách model tương thích toàn bộ, không khẳng định coverage theo địa chỉ và không suy diễn phí cuộc gọi từ phí đăng ký VoLTE.