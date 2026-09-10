# iPhone nào hỗ trợ eSIM Viettel? iPhone 18 Pro, EID, 5G và Carrier Lock 2026

**Cập nhật kiểm chứng: 10/09/2026.** Apple Việt Nam đã công bố thông số kỹ thuật chính thức của **iPhone 18 Pro và iPhone 18 Pro Max**. Bản được Apple Việt Nam mô tả hỗ trợ **SIM kép (nano-SIM và eSIM)**, **eSIM kép** và **5G sub-6 GHz**. Đây là thay đổi bằng chứng quan trọng so với lần kiểm tra ngày 09/09/2026, khi dòng iPhone 18 Pro chưa có trang thông số chính thức để xác minh.

> **Trả lời nhanh:** nếu mục tiêu là kiểm tra iPhone có phần cứng eSIM phù hợp với Viettel, hãy đối chiếu **model**, mục **Thêm eSIM**, **EID** và **Carrier Lock**. Riêng iPhone 18 Pro/18 Pro Max bản được Apple Việt Nam công bố, phần cứng eSIM đã được xác nhận chính thức: máy có nano-SIM + eSIM, hỗ trợ eSIM kép và 5G. Viettel hiện hỗ trợ eSIM trên iPhone và từ 18/08/2026 đã công bố luồng kích hoạt eSIM tự động trên iOS không cần quét QR. Tuy nhiên, bài này không biến thông số Apple thành cam kết rằng mọi máy nhập khẩu, mọi firmware hay mọi thuê bao đều provisioning Viettel thành công trong mọi tình huống.

![Minh họa iPhone, eSIM và kết nối 5G](/images/blogger/topic-b1-esim-5g-tuong-thich-4435b941a4f9.svg)

## iPhone 18 Pro và iPhone 18 Pro Max có eSIM không?

**Có, theo thông số kỹ thuật chính thức của Apple Việt Nam.** Apple ghi cho iPhone 18 Pro và iPhone 18 Pro Max:

- **SIM kép (nano-SIM và eSIM)**;
- **hỗ trợ eSIM kép**;
- **5G (sub-6 GHz)**;
- các biến thể được Apple Việt Nam liệt kê có hỗ trợ nhiều băng tần 5G, trong đó có **n78**.

Nguồn: [Apple Việt Nam — Thông số kỹ thuật iPhone 18 Pro và iPhone 18 Pro Max](https://www.apple.com/vn/iphone-18-pro/specs/).

Điểm quan trọng là **bản thông số Việt Nam không phải eSIM-only**. Apple Newsroom cho biết các mẫu eSIM-only được bán tại một số thị trường như Mỹ, Canada, Nhật Bản và một số quốc gia khác; Việt Nam không nằm trong danh sách eSIM-only mà Apple nêu trong thông báo ra mắt. Vì vậy không nên lấy hướng dẫn cho bản Mỹ rồi áp vào máy bán chính thức tại Việt Nam.

Apple Việt Nam cho biết iPhone 18 Pro mở đặt trước từ **19:00 ngày 12/09/2026, giờ Việt Nam**, và có hàng từ **18/09/2026**. Đây là thông tin availability của Apple, không phải cam kết tồn kho của Viettel hay một đại lý cụ thể.

## iPhone 18 Pro dùng eSIM Viettel được không?

Có **cơ sở phần cứng và cơ chế nhà mạng để sử dụng eSIM**, nhưng cần tách rõ hai lớp bằng chứng:

1. **Apple Việt Nam xác nhận capability thiết bị:** nano-SIM + eSIM, eSIM kép và 5G.
2. **Viettel xác nhận capability dịch vụ:** Viettel có eSIM cho iPhone và đã công bố cơ chế kích hoạt eSIM tự động trên iOS từ 18/08/2026.

Hai điều trên là bằng chứng mạnh để người dùng kiểm tra và triển khai eSIM trên máy phù hợp. Tuy nhiên, tại lần kiểm chứng ngày 10/09/2026, bài này **không coi đó là danh sách carrier-certification riêng cho từng SKU iPhone 18 Pro/18 Pro Max**. Với máy nhập khẩu, máy khóa mạng hoặc máy thuộc thị trường khác, vẫn phải kiểm tra trực tiếp EID, Carrier Lock và mục Thêm eSIM.

Nếu mục tiêu của bạn là kích hoạt eSIM sau khi đã xác nhận máy tương thích, xem [hướng dẫn eSIM 5G Viettel và kích hoạt](/posts/esim-5g-kich-hoat-quet-qr/). Nếu đang chuyển từ SIM vật lý sang eSIM, xem [đổi eSIM Viettel trên My Viettel/Tammi](/posts/doi-esim-viettel-tren-my-viettel/).

## iPhone 18 Pro Viettel có cần quét QR eSIM không?

Không nên mặc định là luôn phải quét QR. Viettel công bố ngày **18/08/2026** rằng trên **thiết bị sử dụng iOS**, khách hàng trong luồng được hỗ trợ có thể kích hoạt eSIM tự động ngay trên máy, **không cần quét mã QR**.

Nguồn: [Viettel — eSIM Viettel: Chạm là kết nối, kích hoạt không cần mã QR](https://www.viettel.vn/tin-tuc/chi-tiet/esim-viettel-cham-la-ket-noi-kich-hoat-khong-can-ma-qr/13707592).

Điều này không có nghĩa QR đã biến mất trong mọi kịch bản hỗ trợ. Nếu giao dịch, thiết bị hoặc kênh chăm sóc của bạn vẫn cấp QR, hãy làm theo chính luồng Viettel hiển thị cho thuê bao đó. Không dùng QR mẫu, QR cũ hoặc QR của thuê bao khác.

## Cách kiểm tra nhanh iPhone có hỗ trợ eSIM Viettel không

Nên kiểm tra theo bốn lớp thay vì chỉ nhìn tên model:

1. **Kiểm tra mục Thêm eSIM:** vào **Cài đặt → Di động** và tìm **Thêm eSIM**.
2. **Kiểm tra EID:** mở bàn phím gọi điện và nhập `*#06#`. Nếu có trường **EID**, thiết bị có định danh phần cứng eSIM.
3. **Kiểm tra Carrier Lock:** vào **Cài đặt → Cài đặt chung → Giới thiệu → Khóa mạng (Carrier Lock)**. Nếu hiện **Không giới hạn SIM / No SIM restrictions**, iOS đang cho biết thiết bị không bị khóa theo một nhà mạng.
4. **Kiểm tra đúng model/region:** đặc biệt cần thiết với máy nhập khẩu hoặc mua lại.

Bốn bước này trả lời các câu hỏi khác nhau: máy có giao diện thêm eSIM hay không, có EID hay không, có bị khóa mạng hay không và có đúng biến thể mà bạn đang đối chiếu hay không.

## EID là gì và vì sao nên kiểm tra `*#06#`?

**EID** là mã định danh gắn với phần eSIM trên thiết bị. Trong hướng dẫn chính thức của Viettel cho các dòng iPhone, Viettel sử dụng EID như một bước để kiểm tra capability eSIM.

Điểm cần nhớ: **có EID không đồng nghĩa chắc chắn kích hoạt được mọi eSIM trong mọi tình huống**. EID xác nhận lớp phần cứng; việc sử dụng thực tế còn liên quan đến trạng thái khóa mạng, biến thể máy và quy trình kích hoạt của thuê bao.

Nếu máy có EID nhưng không thấy tùy chọn thêm eSIM, hãy kiểm tra lại phiên bản iOS, model/thị trường phân phối và trạng thái thiết bị trước khi chuyển đổi thuê bao.

## Carrier Lock khác gì với khả năng hỗ trợ eSIM?

Đây là hai điều kiện khác nhau:

- **Hỗ trợ eSIM:** thiết bị có phần cứng/tính năng eSIM.
- **Carrier Lock:** thiết bị có thể bị ràng buộc chỉ sử dụng với một nhà mạng nhất định.

Trên iPhone, có thể kiểm tra tại **Cài đặt → Cài đặt chung → Giới thiệu → Khóa mạng (Carrier Lock)**. Nếu trạng thái là **Không giới hạn SIM / No SIM restrictions**, thiết bị đang ở trạng thái không khóa nhà mạng theo iOS.

Nếu bạn đang kiểm tra iPhone 16e mua theo chương trình trợ giá Viettel, đó là search job riêng về chính sách carrier lock/unlock; xem [iPhone 16e Viettel SIM lock và điều kiện mở khóa](/posts/iphone-16e-viettel-sim-lock-mo-khoa/).

## Danh sách iPhone Viettel đã công bố hỗ trợ eSIM trước dòng iPhone 18

Tại lần kiểm tra gần nhất trước khi Apple công bố iPhone 18 Pro, cổng eSIM Viettel liệt kê các nhóm máy gồm:

- iPhone XR, iPhone XS, iPhone XS Max;
- iPhone 11, 11 Pro, 11 Pro Max;
- iPhone 12, 12 mini, 12 Pro, 12 Pro Max;
- iPhone 13, 13 mini, 13 Pro, 13 Pro Max;
- iPhone SE (2020), iPhone SE (2022);
- iPhone 14, 14 Plus, 14 Pro, 14 Pro Max;
- iPhone 15, 15 Plus, 15 Pro, 15 Pro Max;
- iPhone 16, 16e, 16 Plus, 16 Pro, 16 Pro Max;
- iPhone 17, 17 Pro, 17 Pro Max;
- iPhone Air.

**iPhone 18 Pro/18 Pro Max được xử lý riêng trong bản cập nhật 10/09/2026 vì Apple Việt Nam vừa công bố thông số chính thức.** Bài không tự thêm dòng máy mới vào “danh sách Viettel đã công bố” nếu chưa đọc được một danh sách Viettel cập nhật tương ứng. Đây là cách tránh biến capability do Apple xác nhận thành claim nhà mạng chưa có provenance.

## iPhone 18 Pro có dùng được 5G Viettel không?

Apple Việt Nam xác nhận iPhone 18 Pro và 18 Pro Max hỗ trợ **5G sub-6 GHz**, và bảng band của bản được công bố có **n78**. Tuy nhiên, việc máy hiện 5G tại vị trí cụ thể còn phụ thuộc cấu hình thiết bị, trạng thái SIM/eSIM, dịch vụ thuê bao và vùng phủ thực tế.

Vì vậy:

- **5G capability của iPhone 18 Pro/Pro Max:** VERIFIED từ Apple Việt Nam.
- **5G Viettel luôn xuất hiện ở mọi nơi:** không được suy ra từ bảng band.
- **coverage tại một địa chỉ cụ thể:** chỉ nên kết luận sau khi kiểm tra nguồn vùng phủ và máy thật.

Nếu eSIM đã hoạt động nhưng máy chỉ hiện LTE/4G, xem [Điện thoại Viettel không hiện 5G: kiểm tra cài đặt, thiết bị và vùng phủ](/posts/loi-khong-dang-ky-duoc-mang-5g-viettel/).

## Có thể dùng 2 eSIM Viettel cùng lúc trên iPhone 18 Pro không?

Apple Việt Nam xác nhận **hỗ trợ eSIM kép**. Đây là capability thiết bị. Nó không tự chứng minh rằng mọi cặp thuê bao Viettel, mọi trạng thái provisioning và mọi biến thể máy đều hoạt động đồng thời theo cùng một cách.

Nếu mục tiêu là dùng hai số, xem owner chuyên biệt [iPhone dùng 2 eSIM Viettel cùng lúc](/posts/iphone-dung-2-esim-viettel-cung-luc/) và kiểm tra trạng thái từng line trên máy thật sau khi cài đặt.

## Bản Mỹ eSIM-only khác gì bản Việt Nam?

Apple Newsroom cho biết iPhone 18 Pro/Pro Max **eSIM-only** được cung cấp tại một số thị trường, bao gồm Mỹ, Canada, Nhật Bản và một số quốc gia khác. Trong khi đó, trang thông số Apple Việt Nam ghi rõ **SIM kép (nano-SIM và eSIM)**.

Vì vậy, khi mua máy xách tay:

- đừng giả định mọi iPhone 18 Pro đều có khay nano-SIM;
- đừng giả định bản Việt Nam là eSIM-only chỉ vì đọc bài hướng dẫn của thị trường Mỹ;
- kiểm tra model/region thực tế trước khi quyết định chuyển SIM.

Đây là khác biệt thực tế có thể thay đổi cách bạn chuẩn bị SIM khi đổi máy.

## iPhone 11 và iPhone 12 có eSIM Viettel không?

**Có.** Tài liệu Viettel đã xác nhận các dòng iPhone 11 và iPhone 12 tiêu chuẩn hỗ trợ eSIM. Với máy cũ, máy nhập khẩu hoặc không rõ thị trường, vẫn nên kiểm tra EID và Carrier Lock trên chính thiết bị thay vì chỉ dựa vào tên model.

## Khi nào nên kiểm tra lại thay vì chỉ dựa vào danh sách?

Bạn nên kiểm tra trực tiếp model, EID, Carrier Lock và mục Thêm eSIM khi:

- iPhone được mua từ thị trường nước ngoài;
- máy đã qua sử dụng hoặc không rõ phiên bản phân phối;
- model nằm trong danh sách nhưng **Cài đặt → Di động** không xuất hiện tùy chọn thêm eSIM;
- có EID nhưng kích hoạt eSIM vẫn bị từ chối;
- thiết bị báo trạng thái khóa mạng;
- bạn chuẩn bị đổi SIM vật lý sang eSIM hoặc chuyển eSIM sang máy khác.

Nếu vừa chuyển SIM/eSIM sang một thiết bị khác và thuê bao phát sinh chặn chiều/xác thực, xem [SIM Viettel lắp sang máy mới bị chặn 1 chiều](/posts/sim-viettel-lap-sang-may-moi-bi-chan-1-chieu/) để xử lý đúng luồng xác thực thiết bị.

## Câu hỏi nhanh

### iPhone 18 Pro bản Việt Nam có phải eSIM-only không?

**Không theo thông số Apple Việt Nam.** Trang kỹ thuật ghi **SIM kép (nano-SIM và eSIM)** và hỗ trợ eSIM kép.

### iPhone 18 Pro Max có eSIM không?

**Có.** Apple Việt Nam công bố cùng capability nano-SIM + eSIM và eSIM kép cho iPhone 18 Pro Max.

### iPhone 18 Pro có eSIM thì chắc chắn lên 5G Viettel không?

Không. Capability eSIM và capability 5G là hai lớp khác nhau; việc lên 5G thực tế còn phụ thuộc cấu hình, thuê bao và vùng phủ.

### EID có nghĩa là iPhone chắc chắn dùng được eSIM Viettel không?

Không hoàn toàn. EID xác nhận phần cứng eSIM, nhưng vẫn cần kiểm tra Carrier Lock, biến thể thiết bị và luồng kích hoạt thực tế.

### “No SIM restrictions” nghĩa là gì?

Đó là trạng thái iOS hiển thị tại mục Carrier Lock để cho biết thiết bị không bị giới hạn SIM theo một nhà mạng.

## Những gì đã VERIFIED và những gì vẫn UNKNOWN

### VERIFIED từ nguồn first-party

- Apple Việt Nam đã công bố iPhone 18 Pro và iPhone 18 Pro Max.
- Bản thông số Apple Việt Nam có **nano-SIM + eSIM**, **eSIM kép** và **5G sub-6 GHz**.
- Apple Việt Nam công bố đặt trước từ 19:00 ngày 12/09/2026 và có hàng từ 18/09/2026.
- Viettel công bố kích hoạt eSIM tự động không cần QR cho thiết bị iOS từ 18/08/2026 trong luồng được hỗ trợ.

### Vẫn UNKNOWN / không được suy diễn

- một danh sách Viettel cập nhật ngày 10/09/2026 ghi đích danh mọi SKU iPhone 18 Pro/18 Pro Max;
- tỷ lệ provisioning thành công cho máy nhập khẩu;
- coverage 5G tại một địa chỉ cụ thể;
- giá/gói cước/ưu đãi hoặc eligibility thương mại dành riêng cho iPhone 18 Pro;
- search volume, KD, CPC, ranking và traffic potential.

## Nguồn kiểm chứng

- [Apple Việt Nam — iPhone 18 Pro và iPhone 18 Pro Max, Thông số kỹ thuật](https://www.apple.com/vn/iphone-18-pro/specs/)
- [Apple Việt Nam — iPhone 18 Pro](https://www.apple.com/vn/iphone-18-pro/)
- [Apple Newsroom — Apple debuts iPhone 18 Pro and iPhone 18 Pro Max, 09/09/2026](https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/)
- [Viettel — eSIM Viettel: Chạm là kết nối, kích hoạt không cần mã QR, 18/08/2026](https://www.viettel.vn/tin-tuc/chi-tiet/esim-viettel-cham-la-ket-noi-kich-hoat-khong-can-ma-qr/13707592)
- [Viettel eSIM — cổng thông tin eSIM](https://esim.viettel.vn/)
- [Apple — hỗ trợ từ nhà mạng và các tính năng dành cho iPhone tại Châu Á - Thái Bình Dương](https://support.apple.com/vi-vn/109510)

> Bài viết chỉ dùng các fact thiết bị, eSIM, 5G và activation có provenance first-party. Không suy diễn giá, ưu đãi, vùng phủ, traffic/ranking hay điều kiện thương mại chưa được xác minh.