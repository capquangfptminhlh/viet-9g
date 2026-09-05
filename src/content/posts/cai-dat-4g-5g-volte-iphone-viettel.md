---
title: "Cách bật VoLTE Viettel trên iPhone trước tắt 2G 15/9/2026"
description: "Kiểm tra HDCALL gửi 191, Voice & Data 4G/5G và cuộc gọi thử trên iPhone Viettel trước mốc tắt 2G 15/9/2026; tránh nhầm có data 4G/5G là đã sẵn sàng thoại."
date: 2026-09-05
---

# Cách bật VoLTE Viettel trên iPhone trước tắt 2G 15/9/2026

Nếu iPhone dùng SIM hoặc eSIM Viettel nhưng khi gọi điện máy rơi khỏi 4G/5G, thời gian kết nối cuộc gọi chậm hoặc bạn không chắc VoLTE đã hoạt động, hãy kiểm tra theo đúng thứ tự: **thiết bị hỗ trợ → dịch vụ VoLTE trên thuê bao → Voice & Data → cuộc gọi thử**.

Theo hướng dẫn chính thức của Viettel, dịch vụ VoLTE/HD Voice được đăng ký bằng cú pháp **`HDCALL` gửi `191`** và phí dịch vụ được Viettel công bố là **0 đồng**. Một số thuê bao có thể đã được đăng ký sẵn.

> **Cập nhật kiểm chứng 05/09/2026:** mốc dừng phát sóng 2G toàn quốc theo lộ trình là **15/09/2026**. Việc iPhone vẫn hiện 4G/5G và vào Internet bình thường **không tự động chứng minh phần thoại đã sẵn sàng**. Trước mốc này, nên kiểm tra VoLTE bằng trạng thái thuê bao, mục Voice & Data và một cuộc gọi thử thay vì chỉ nhìn biểu tượng mạng.

## iPhone đang hiện 4G/5G có chắc gọi được sau khi tắt 2G không?

Không nên kết luận chỉ từ biểu tượng 4G/5G. Các cảnh báo kỹ thuật trước mốc 15/09/2026 cho thấy một số điện thoại 4G vẫn có thể truy cập data nhưng phần thoại còn phụ thuộc vào VoLTE. Khi lớp mạng cũ không còn làm đường fallback cho cuộc gọi, thiết bị/thuê bao chưa sẵn sàng VoLTE có thể gặp gián đoạn thoại.

Với iPhone Viettel, cách kiểm tra an toàn là:

1. xác nhận iPhone hỗ trợ VoLTE và đang dùng SIM 4G/5G hoặc eSIM phù hợp;
2. kiểm tra dịch vụ VoLTE trên thuê bao bằng hướng dẫn Viettel;
3. vào **Cài đặt → Di động → SIM Viettel → Tùy chọn dữ liệu di động → Thoại & dữ liệu**;
4. chọn 4G/LTE hoặc 5G phù hợp với tùy chọn máy đang hiển thị;
5. thực hiện một cuộc gọi đi và quan sát trạng thái mạng trong lúc gọi.

Không dùng danh sách model tự suy đoán để khẳng định mọi iPhone đều tương thích giống nhau. Phiên bản iOS, cấu hình nhà mạng và trạng thái thuê bao thực tế vẫn cần được kiểm tra.

Nếu bạn cần bức tranh tổng quát cho cả Android và iPhone trước mốc 15/09, xem [tắt sóng 2G 15/9/2026: điện thoại 4G Viettel có bị mất cuộc gọi không?](/posts/tat-song-2g-15-9-2026-viettel-volte/).

## VoLTE Viettel trên iPhone là gì?

VoLTE (Voice over LTE) là cuộc gọi thoại được thực hiện trên hạ tầng 4G. Viettel cũng mô tả dịch vụ này là HD Voice và cho biết người dùng có thể tiếp tục duy trì kết nối data 4G/5G trong khi đàm thoại khi điều kiện mạng và thiết bị đáp ứng.

Với iPhone, mục tiêu của việc bật VoLTE không phải là “ép” điện thoại luôn hiện chữ VoLTE. Cách hiển thị thực tế có thể khác theo model iPhone, phiên bản iOS và cấu hình nhà mạng. Điều cần kiểm tra là thuê bao đã có dịch vụ, máy hỗ trợ và cuộc gọi được duy trì trên lớp mạng 4G/5G/LTE theo hướng dẫn của Viettel.

## Điều kiện trước khi bật VoLTE Viettel

Viettel nêu các điều kiện cơ bản sau:

1. Thuê bao sử dụng **SIM 4G/5G hoặc eSIM Viettel** phù hợp.
2. Điện thoại có hỗ trợ VoLTE.
3. Dịch vụ VoLTE đã được đăng ký trên thuê bao hoặc đã được Viettel kích hoạt sẵn.
4. Tùy chọn thoại trên iPhone được đặt ở cấu hình 4G/5G phù hợp.

Nếu một trong các điều kiện trên chưa đạt, chỉ bật một công tắc trong iPhone chưa chắc làm cuộc gọi chạy trên VoLTE.

## Bước 1: đăng ký VoLTE Viettel bằng HDCALL gửi 191

Mở ứng dụng Tin nhắn trên iPhone và soạn:

**`HDCALL` gửi `191`**

Viettel công bố phí dịch vụ VoLTE là **0 đồng**. Nếu thuê bao đã được đăng ký sẵn, bạn không cần đăng ký lặp lại chỉ để kiểm tra.

Lưu ý: đây là cú pháp đăng ký **dịch vụ VoLTE/HD Voice**, không phải cú pháp đăng ký một gói data. Nó không thay đổi luồng đăng ký gói cước trên website này.

## Bước 2: bật 4G/5G và VoLTE trong iPhone

Theo đường dẫn mà Viettel hướng dẫn cho iOS, bạn có thể kiểm tra tại:

**Cài đặt (Settings) → Di động (Cellular) → chọn SIM Viettel → Tùy chọn dữ liệu di động (Cellular Data Options) → Thoại & dữ liệu (Voice & Data).**

Tại đây, chọn cấu hình **4G/LTE hoặc 5G** phù hợp với tùy chọn máy đang hiển thị và bật VoLTE nếu iPhone/iOS của bạn còn hiển thị công tắc riêng.

Tên mục trên iPhone có thể thay đổi theo phiên bản iOS. Vì vậy, nếu bạn không thấy đúng từng chữ như hướng dẫn cũ, hãy ưu tiên tìm mục **Di động / Cellular**, SIM Viettel đang dùng và **Thoại & dữ liệu / Voice & Data**.

## Dùng 5G có cần bật VoLTE riêng không?

5G và VoLTE là hai vấn đề khác nhau:

- **5G** liên quan đến lớp mạng dữ liệu mà iPhone đang sử dụng.
- **VoLTE** liên quan đến việc cuộc gọi thoại được thiết lập trên hạ tầng LTE/4G thay vì phải rơi về lớp mạng cũ.

Vì vậy, việc iPhone đang hiện 5G không tự động chứng minh cuộc gọi VoLTE đã hoạt động. Ngược lại, một iPhone đang dùng 4G vẫn có thể thực hiện VoLTE khi thiết bị, thuê bao và mạng đáp ứng.

## Cách kiểm tra VoLTE đã hoạt động chưa

Viettel hướng dẫn kiểm tra bằng cách thực hiện một cuộc gọi đi. Trong lúc gọi, quan sát trạng thái mạng trên máy.

Tùy từng dòng máy và phiên bản phần mềm, bạn có thể thấy trạng thái **4G, 5G, LTE hoặc VoLTE** cạnh cột sóng. Nếu cuộc gọi được thiết lập mà kết nối dữ liệu 4G/5G vẫn duy trì, đó là dấu hiệu phù hợp với cách Viettel mô tả hoạt động VoLTE.

Không nên chỉ dựa vào việc có hay không có một biểu tượng “VoLTE”, vì giao diện iOS có thể không hiển thị giống nhau trên mọi phiên bản.

## Vì sao iPhone đã bật 4G/5G nhưng gọi vẫn không chạy VoLTE?

Hãy kiểm tra lần lượt thay vì đổi nhiều cài đặt cùng lúc.

### 1. Thuê bao chưa có dịch vụ VoLTE

Kiểm tra lại bước đăng ký **`HDCALL` gửi `191`**. Viettel cũng lưu ý nhiều thuê bao có thể đã được đăng ký sẵn, nên trạng thái thực tế của thuê bao cần được ưu tiên hơn việc đoán từ giao diện máy.

### 2. iPhone hoặc phiên bản phần mềm không hiển thị công tắc như hướng dẫn

Viettel lưu ý giao diện thực tế có thể khác tùy dòng máy và phiên bản. Hãy tìm đúng nhánh **Cellular → SIM Viettel → Voice & Data** thay vì kết luận VoLTE không hỗ trợ chỉ vì thiếu một công tắc có tên chính xác.

### 3. Cấu hình Voice & Data chưa đặt ở 4G/5G

Nếu máy đang bị khóa ở chế độ không phù hợp, hãy chọn 4G/LTE hoặc 5G theo tùy chọn mà iPhone cung cấp. Sau đó thực hiện cuộc gọi kiểm tra lại.

### 4. Cần khởi động lại máy sau khi thay đổi cấu hình

Trong hướng dẫn kiểm tra của Viettel, nếu cuộc gọi chưa thành công sau khi bật dịch vụ/cấu hình, người dùng được khuyến nghị khởi động lại máy rồi kiểm tra lại.

### 5. Thiết bị không hỗ trợ VoLTE

Một số thiết bị cũ không tương thích VoLTE. Nếu iPhone không có tùy chọn phù hợp và thuê bao đã xác nhận có dịch vụ, cần kiểm tra khả năng hỗ trợ của chính model thiết bị thay vì tự đổi APN hoặc xóa eSIM.

## Không nên làm gì khi VoLTE chưa hoạt động

- Không xóa eSIM chỉ để thử sửa VoLTE.
- Không reset toàn bộ cài đặt mạng ngay từ bước đầu khi chưa kiểm tra thuê bao và Voice & Data.
- Không đổi APN nếu vấn đề chỉ là cuộc gọi thoại trong nước và data vẫn hoạt động bình thường.
- Không nhầm VoLTE trong nước với **VoLTE Roaming**. Khi ở nước ngoài, còn có điều kiện roaming, mạng đối tác và cấu hình Data Roaming riêng.

Nếu vấn đề xảy ra khi đang ở nước ngoài, xem hướng dẫn riêng: [Cách bật VoLTE khi roaming Viettel](/posts/bat-volte-khi-roaming-viettel/).

## VoLTE và cuộc gọi khi đang dùng data 4G/5G

Một lợi ích Viettel nêu cho VoLTE là người dùng có thể tiếp tục sử dụng data trong khi gọi. Điều này hữu ích khi bạn vừa gọi điện vừa cần mở bản đồ, email hoặc tra cứu thông tin.

Tuy nhiên, không nên dùng tốc độ data trong một cuộc gọi đơn lẻ để suy ra chất lượng hoặc vùng phủ toàn mạng. Chất lượng thực tế còn phụ thuộc tín hiệu, vị trí, tải mạng và thiết bị tại thời điểm sử dụng.

## Có cần đổi SIM để dùng VoLTE không?

Không nên tự kết luận phải đổi SIM chỉ vì chưa bật được VoLTE. Viettel yêu cầu SIM 4G/5G và thiết bị hỗ trợ; nếu thuê bao đang dùng SIM/eSIM hiện hành nhưng VoLTE không hoạt động, hãy kiểm tra trạng thái dịch vụ và cấu hình trước.

Nếu câu hỏi của bạn là SIM 4G hiện tại có phải đổi mới dùng được 5G hay không, xem [SIM 4G Viettel có dùng được 5G không?](/posts/sim-4g-viettel-co-dung-duoc-5g-khong/). Nếu đang quan tâm riêng đến việc iPhone có hỗ trợ eSIM hay không, xem [cách kiểm tra EID và Carrier Lock trên iPhone](/posts/kiem-tra-iphone-co-ho-tro-esim-viettel/).

## Khi nào cần liên hệ Viettel?

Nếu đã thực hiện đủ các bước sau mà VoLTE vẫn không hoạt động:

- thiết bị có hỗ trợ VoLTE;
- đã kiểm tra/đăng ký `HDCALL` gửi `191`;
- đã chọn 4G/5G trong Voice & Data;
- đã khởi động lại và gọi thử;

thì nên liên hệ kênh hỗ trợ chính thức của Viettel để kiểm tra trạng thái dịch vụ trên thuê bao. Viettel công bố tổng đài hỗ trợ miễn phí **1800 8098** trong tài liệu VoLTE.

## Câu hỏi nhanh

### iPhone có 4G/5G rồi có cần kiểm tra VoLTE trước 15/9/2026 không?
Có. Trạng thái data 4G/5G và trạng thái thoại VoLTE là hai việc khác nhau. Hãy kiểm tra dịch vụ, Voice & Data và thực hiện cuộc gọi thử trước mốc tắt 2G.

### Bật VoLTE Viettel trên iPhone có mất phí không?
Theo tài liệu Viettel về VoLTE, phí dịch vụ bằng `HDCALL` gửi `191` là **0 đồng**.

### iPhone đang hiện 5G có nghĩa là VoLTE đã bật chưa?
Không. 5G thể hiện lớp mạng dữ liệu; cần thực hiện cuộc gọi và kiểm tra trạng thái theo hướng dẫn VoLTE của Viettel.

### Không thấy nút VoLTE trên iPhone thì có phải máy không hỗ trợ?
Chưa thể kết luận chỉ từ giao diện. Tên mục/cách hiển thị có thể khác theo model và phiên bản iOS. Hãy kiểm tra nhánh Voice & Data và trạng thái dịch vụ thuê bao trước.

### HDCALL gửi 191 có phải gói cước data không?
Không. Đây là cú pháp Viettel dùng để đăng ký dịch vụ VoLTE/HD Voice, không phải cú pháp mua một gói data.

## Nguồn kiểm chứng

- [Viettel: Hướng dẫn bật dịch vụ cuộc gọi VoLTE](https://098.viettel.vn/tin-tuc/huong-dan-bat-dich-vu-cuoc-goi-volte-goi-chat-luong-tot-hon-an-toan-hon/15298552) — cập nhật **14/04/2026**, nguồn first-party cho thiết lập theo dòng máy.
- [Viettel: VoLTE – dịch vụ thoại chất lượng cao trên hạ tầng mạng 4G/5G](https://098.viettel.vn/tin-tuc/chi-tiet/volte-dich-vu-thoai-chat-luong-cao-tren-ha-tang-mang-4g5g-viettel/13748208) — nguồn first-party cho điều kiện, `HDCALL` gửi `191`, phí dịch vụ 0 đồng và cách kiểm tra.
- [Báo Tuyên Quang: Tắt 2G từ 15/9, điện thoại 4G cũng có thể mất liên lạc](https://baotuyenquang.com.vn/xa-hoi/202608/tat-2g-tu-159-dien-thoai-4g-cung-co-the-mat-lien-lac-cf21430/) — nguồn freshness cho rủi ro thoại khi thiết bị 4G chưa sẵn sàng VoLTE; không dùng để thay thế Viettel cho business facts.

Thông tin giao diện thiết bị và chính sách dịch vụ có thể thay đổi theo phiên bản phần mềm hoặc cập nhật của Viettel. Khi có khác biệt, ưu tiên hướng dẫn live từ Viettel và trạng thái thực tế của thuê bao.