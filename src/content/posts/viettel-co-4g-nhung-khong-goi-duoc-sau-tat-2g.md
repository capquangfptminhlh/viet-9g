---
title: "Viettel có 4G/5G nhưng không gọi được sau tắt 2G: kiểm tra VoLTE thế nào?"
description: "Điện thoại vẫn có data 4G/5G Viettel nhưng gọi thoại lỗi sau mốc 2G? Kiểm tra VoLTE, chế độ mạng, thiết bị và trạng thái thuê bao theo nguồn chính thức."
date: 2026-09-15T13:02:02+07:00
---

# Viettel có 4G/5G nhưng không gọi được sau tắt 2G: kiểm tra VoLTE thế nào?

Nếu điện thoại vẫn vào mạng bằng **4G/5G Viettel nhưng cuộc gọi thoại không thực hiện được**, đừng vội kết luận SIM đã hỏng. Data hoạt động và thoại hoạt động là hai việc cần kiểm tra riêng. Trong bối cảnh chuyển đổi 2G, điểm quan trọng là điện thoại, SIM/thuê bao và mạng phải đáp ứng điều kiện để cuộc gọi thoại chạy trên nền 4G qua **VoLTE**.

## Trả lời nhanh

**Có 4G/5G không đồng nghĩa chắc chắn cuộc gọi thoại đã dùng được VoLTE.** Viettel mô tả VoLTE là dịch vụ thoại chất lượng cao trên nền 4G/LTE. Vì vậy trường hợp data vẫn chạy nhưng gọi không được cần kiểm tra VoLTE, cấu hình mạng, khả năng hỗ trợ của thiết bị và trạng thái thuê bao thay vì chỉ nhìn biểu tượng 4G/5G.

## 1. Gọi thử và nhìn biểu tượng mạng

Hãy thực hiện một cuộc gọi thử khi máy đang hiển thị 4G/LTE hoặc 5G.

- Nếu cuộc gọi kết nối bình thường và máy vẫn duy trì kết nối dữ liệu phù hợp, đó là tín hiệu tốt.
- Nếu bấm gọi nhưng không kết nối, báo lỗi hoặc mất dịch vụ thoại, chuyển sang các bước bên dưới.
- Không dùng một lần gọi thử để suy ra vùng phủ hoặc trạng thái toàn mạng; kết quả còn phụ thuộc thiết bị, SIM/thuê bao và vị trí thực tế.

## 2. Kiểm tra VoLTE trên điện thoại

Trong phần cài đặt SIM/di động, tìm tùy chọn có tên như **VoLTE**, **Cuộc gọi 4G** hoặc **4G Calling**. Tên menu khác nhau theo hãng và phiên bản hệ điều hành.

Nếu máy có tùy chọn này, hãy bảo đảm nó đang được bật. Nếu hoàn toàn không thấy tùy chọn, chưa nên tự kết luận Viettel không hỗ trợ: model máy, firmware/khu vực bán máy và cấu hình nhà mạng có thể ảnh hưởng việc hiển thị tính năng.

## 3. Kiểm tra dịch vụ HD CALL của Viettel

Theo hướng dẫn Viettel về VoLTE, thuê bao có thể đăng ký dịch vụ HD CALL bằng cú pháp:

**HDCALL gửi 191**

Sau khi thao tác, hãy đọc **SMS phản hồi thực tế từ Viettel** trước khi kết luận thuê bao đã được kích hoạt. Bài viết này không giả định mọi thuê bao, mọi thiết bị hoặc mọi khu vực đều có cùng trạng thái hỗ trợ.

## 4. Đặt chế độ mạng về tự động 4G/5G phù hợp

Nếu trước đó bạn từng ép máy về một chế độ mạng đặc biệt để thử nghiệm, hãy đưa cấu hình về chế độ tự động phù hợp mà thiết bị cung cấp. Sau đó bật/tắt chế độ máy bay một lần hoặc khởi động lại máy rồi gọi thử lại.

Không nên xóa eSIM, reset toàn bộ máy hoặc thay đổi APN hàng loạt chỉ để thử VoLTE. Những thao tác mạnh này không phải bước đầu tiên cho lỗi gọi thoại.

## 5. Phân biệt lỗi data và lỗi thoại

Một cách kiểm tra nhanh:

| Hiện tượng | Hướng kiểm tra ưu tiên |
|---|---|
| Không có cả data lẫn thoại | SIM/thuê bao, sóng, chế độ mạng, sự cố khu vực |
| Có 4G/5G data nhưng gọi không được | VoLTE/HD CALL, thiết bị, cấu hình thoại, trạng thái thuê bao |
| Gọi được nhưng data lỗi | data/APN/gói dữ liệu/trạng thái data |
| Chỉ lỗi ở một địa điểm | kiểm tra vùng phủ hoặc sự cố cục bộ trước khi đổi SIM |

## 6. Điện thoại ghi “4G” vẫn chưa đủ để khẳng định tương thích thoại

Khả năng bắt 4G data chỉ chứng minh thiết bị có thể kết nối dữ liệu ở điều kiện hiện tại. Để gọi thoại trên 4G, thiết bị còn phải hỗ trợ VoLTE theo cấu hình phù hợp và thuê bao phải ở trạng thái dịch vụ tương ứng.

Đặc biệt với máy xách tay, firmware theo thị trường khác hoặc model ít phổ biến, nên kiểm tra đúng model thay vì suy luận từ tên thương mại chung.

## 7. Khi nào nên liên hệ Viettel?

Nếu đã bật VoLTE/4G Calling, đã kiểm tra phản hồi `HDCALL` từ 191, đã khởi động lại máy và vẫn có data nhưng không gọi được, hãy dùng kênh chăm sóc khách hàng chính thức của Viettel để kiểm tra **trạng thái thuê bao và hỗ trợ VoLTE của model đang dùng**.

Khi liên hệ, nên chuẩn bị:

- model máy chính xác;
- phiên bản hệ điều hành;
- SIM vật lý hay eSIM;
- biểu tượng mạng đang hiển thị;
- nội dung lỗi khi gọi;
- SMS phản hồi sau thao tác HDCALL nếu có.

## Mốc 2G liên quan thế nào?

Lộ trình quản lý tần số của Việt Nam đặt mốc chuyển đổi GSM/2G đến **15/09/2026**. Bài này tập trung vào **triệu chứng sau chuyển đổi: vẫn có 4G/5G data nhưng thoại lỗi**, còn phần giải thích deadline và checklist trước mốc được giữ ở bài [mốc tắt 2G và kiểm tra VoLTE Viettel](/posts/tat-song-2g-15-9-2026-viettel-volte/).

Không suy diễn mốc quản lý thành một giờ tắt đồng loạt cho mọi trạm, mọi khu vực nếu nguồn chính thức không công bố chi tiết đó.

## Câu hỏi thường gặp

### Có 5G Viettel mà gọi không được thì có phải 5G lỗi không?

Không thể kết luận như vậy chỉ từ một triệu chứng. Data và thoại cần được kiểm tra riêng; hãy kiểm tra VoLTE/HD CALL, thiết bị, cấu hình và trạng thái thuê bao.

### Bật VoLTE có cần đổi số điện thoại không?

VoLTE là phương thức thực hiện cuộc gọi trên nền 4G/LTE; bài viết không có bằng chứng nào cho thấy phải đổi số chỉ để bật VoLTE.

### Có nên xóa eSIM rồi cài lại để sửa lỗi gọi?

Không nên xem đó là bước đầu tiên. Trước hết hãy kiểm tra VoLTE, phản hồi HDCALL, chế độ mạng và trạng thái thuê bao. Xóa eSIM có thể làm phát sinh thêm quy trình kích hoạt lại.

## Nguồn tham khảo

- [Viettel Telecom – Dịch vụ VoLTE của Viettel mang đến những lợi ích gì?](https://vietteltelecom.vn/tin-tuc/chi-tiet/dich-vu-volte-cua-viettel-mang-den-nhung-loi-ich-gi/12781968)
- [Bộ Khoa học và Công nghệ – Lộ trình tắt sóng 2G và giải pháp hỗ trợ người dùng chuyển đổi thiết bị 4G](https://mst.gov.vn/lo-trinh-tat-song-2g-va-cac-giai-phap-ho-tro-nguoi-dung-chuyen-doi-thiet-bi-4g-197250704095238417.htm)

> Các điều kiện hỗ trợ có thể khác theo model máy, firmware, SIM/thuê bao và khu vực. Không có dữ liệu trong bài này được dùng để suy diễn giá, gói cước, vùng phủ hoặc eligibility chưa được nguồn chính thức xác nhận.
