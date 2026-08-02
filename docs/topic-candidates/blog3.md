# Blog 3 topic candidates

Target blog: `2757413717171314447`
Scope: checking data, cancellation, and renewal guidance only.

## Evidence and route audit

The only official, unexpired fact that applies to this charter is `fact-5` (source: `098.viettel.vn`, expires `2026-12-31T23:59:59Z`). It supports only the distinction between `HUY TÊN_GÓI gửi 191` (stop renewal) and `HUYDATA TÊN_GÓI gửi 191` (cancel the package), plus following Viettel's SMS confirmation and the possibility of losing remaining benefits after full cancellation. `fact-4` is excluded because its source is not an official Viettel domain. `fact-6` and `fact-7` are official and unexpired but do not support checking/cancellation/renewal subjects here.

All paths below were verified as existing generated routes. No candidate is queued: `fact-5` can support one general cancellation/renewal guide, but that intent and destination already exist in the website and registered topic `topic-huy-goi-cuoc`; every other proposed claim needs additional official evidence.

## Candidates

### 01 — Cách kiểm tra dung lượng data Viettel còn lại
- title: Cách kiểm tra dung lượng data Viettel còn lại
- intent: checking
- targetUrlPath: /posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/
- sourceFactIds: []
- imageBrief: Điện thoại hiển thị màn hình tin nhắn tra cứu dung lượng với dữ liệu minh họa trung tính, không logo.
- imageAlt: Minh họa kiểm tra dung lượng data còn lại trên điện thoại.
- status: HOLD
- HOLD reason: NO_MATCHING_OFFICIAL_UNEXPIRED_FACT

### 02 — Cách kiểm tra tài khoản chính Viettel trước khi gia hạn gói
- title: Cách kiểm tra tài khoản chính Viettel trước khi gia hạn gói
- intent: checking
- targetUrlPath: /posts/cach-kiem-tra-tai-khoan-chinh/
- sourceFactIds: []
- imageBrief: Người dùng xem số dư tài khoản trên điện thoại, không hiển thị số dư hoặc thương hiệu.
- imageAlt: Minh họa kiểm tra tài khoản chính trên điện thoại.
- status: HOLD
- HOLD reason: NO_MATCHING_OFFICIAL_UNEXPIRED_FACT

### 03 — Cách kiểm tra gói data Viettel đang dùng
- title: Cách kiểm tra gói data Viettel đang dùng
- intent: checking
- targetUrlPath: /posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/
- sourceFactIds: []
- imageBrief: Màn hình điện thoại minh họa mục thông tin gói data, không có tên gói hay số liệu.
- imageAlt: Minh họa xem thông tin gói data trên điện thoại.
- status: HOLD
- HOLD reason: NO_MATCHING_OFFICIAL_UNEXPIRED_FACT

### 04 — Cách kiểm tra thời hạn còn lại của gói data Viettel
- title: Cách kiểm tra thời hạn còn lại của gói data Viettel
- intent: checking
- targetUrlPath: /posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại/
- sourceFactIds: []
- imageBrief: Lịch và điện thoại hiển thị thông báo thời hạn ở dạng minh họa, không ngày cụ thể.
- imageAlt: Minh họa kiểm tra thời hạn gói data trên điện thoại.
- status: HOLD
- HOLD reason: NO_MATCHING_OFFICIAL_UNEXPIRED_FACT

### 05 — Cách kiểm tra gói data có tự động gia hạn hay không
- title: Cách kiểm tra gói data có tự động gia hạn hay không
- intent: checking
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Điện thoại với biểu tượng chu kỳ lặp và hộp tin nhắn xác nhận, không logo.
- imageAlt: Minh họa kiểm tra trạng thái gia hạn gói data.
- status: HOLD
- HOLD reason: FACT_5_DOES_NOT_DESCRIBE_A_STATUS_CHECK_METHOD

### 06 — Cách đọc tin nhắn phản hồi khi kiểm tra dịch vụ Viettel
- title: Cách đọc tin nhắn phản hồi khi kiểm tra dịch vụ Viettel
- intent: checking
- targetUrlPath: /posts/cach-kiem-tra-tai-khoan-chinh/
- sourceFactIds: []
- imageBrief: Khung tin nhắn phản hồi trừu tượng trên điện thoại, không nội dung hoặc thương hiệu.
- imageAlt: Minh họa đọc tin nhắn phản hồi của dịch vụ di động.
- status: HOLD
- HOLD reason: NO_MATCHING_OFFICIAL_UNEXPIRED_FACT

### 07 — Kiểm tra trước khi hủy gói data Viettel: những thông tin cần xác nhận
- title: Kiểm tra trước khi hủy gói data Viettel: những thông tin cần xác nhận
- intent: checking
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Danh sách kiểm tra cạnh điện thoại và tin nhắn xác nhận, không logo.
- imageAlt: Minh họa các bước kiểm tra trước khi hủy gói data.
- status: HOLD
- HOLD reason: FACT_5_DOES_NOT_SUPPORT_THE_PROPOSED_CHECKLIST_DETAILS

### 08 — Khi nào nên kiểm tra ưu đãi còn lại trước khi hủy gói
- title: Khi nào nên kiểm tra ưu đãi còn lại trước khi hủy gói
- intent: checking
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Biểu tượng dữ liệu và cảnh báo cạnh điện thoại, thiết kế trung tính.
- imageAlt: Minh họa lưu ý kiểm tra ưu đãi trước khi hủy gói.
- status: HOLD
- HOLD reason: FACT_5_ONLY_STATES_BENEFITS_MAY_NOT_BE_PRESERVED_AFTER_FULL_CANCELLATION

### 09 — Cách kiểm tra thông tin cần thiết trước khi dừng gia hạn
- title: Cách kiểm tra thông tin cần thiết trước khi dừng gia hạn
- intent: checking
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Người dùng rà soát thông tin trên điện thoại trước khi gửi tin nhắn, không logo.
- imageAlt: Minh họa kiểm tra thông tin trước khi dừng gia hạn.
- status: HOLD
- HOLD reason: FACT_5_DOES_NOT_PROVIDE_A_PRE_RENEWAL_CHECK_METHOD

### 10 — Kiểm tra SMS xác nhận của Viettel sau khi gửi yêu cầu hủy
- title: Kiểm tra SMS xác nhận của Viettel sau khi gửi yêu cầu hủy
- intent: checking
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Màn hình điện thoại có tin nhắn xác nhận dạng minh họa, không sao chép giao diện Viettel.
- imageAlt: Minh họa kiểm tra tin nhắn xác nhận sau yêu cầu hủy.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 11 — Phân biệt dừng gia hạn và hủy hoàn toàn gói data Viettel
- title: Phân biệt dừng gia hạn và hủy hoàn toàn gói data Viettel
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Sơ đồ hai nhánh dừng gia hạn và hủy hoàn toàn trên điện thoại, không logo.
- imageAlt: Minh họa phân biệt dừng gia hạn và hủy hoàn toàn gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 12 — Hủy gói data qua SMS: vì sao cần làm theo tin nhắn phản hồi
- title: Hủy gói data qua SMS: vì sao cần làm theo tin nhắn phản hồi
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Chuỗi tin nhắn minh họa theo thứ tự gửi yêu cầu và nhận phản hồi, không logo.
- imageAlt: Minh họa làm theo tin nhắn phản hồi khi hủy gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 13 — Những lưu ý về ưu đãi còn lại khi hủy hoàn toàn gói data
- title: Những lưu ý về ưu đãi còn lại khi hủy hoàn toàn gói data
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Biểu tượng dữ liệu kèm cảnh báo mềm trước thao tác hủy, không số liệu.
- imageAlt: Minh họa lưu ý về ưu đãi còn lại khi hủy gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 14 — Hủy gói data hay chỉ dừng gia hạn: chọn theo nhu cầu sử dụng
- title: Hủy gói data hay chỉ dừng gia hạn: chọn theo nhu cầu sử dụng
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Người dùng cân nhắc giữa hai lựa chọn trên điện thoại, hình minh họa trung tính.
- imageAlt: Minh họa lựa chọn hủy gói hoặc dừng gia hạn.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 15 — Cú pháp HUY TÊN_GÓI gửi 191 dùng trong trường hợp nào
- title: Cú pháp HUY TÊN_GÓI gửi 191 dùng trong trường hợp nào
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Màn hình soạn tin nhắn với phần tên gói được thay bằng ký hiệu chung, không logo.
- imageAlt: Minh họa cú pháp dừng gia hạn theo tên gói.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 16 — Cú pháp HUYDATA TÊN_GÓI gửi 191 dùng trong trường hợp nào
- title: Cú pháp HUYDATA TÊN_GÓI gửi 191 dùng trong trường hợp nào
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Màn hình soạn tin nhắn hủy hoàn toàn với tên gói là biến mẫu, không logo.
- imageAlt: Minh họa cú pháp hủy hoàn toàn gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 17 — Hủy hoàn toàn gói data: lưu ý trước khi xác nhận yêu cầu
- title: Hủy hoàn toàn gói data: lưu ý trước khi xác nhận yêu cầu
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Hộp thoại xác nhận và biểu tượng cảnh báo cạnh điện thoại, không logo.
- imageAlt: Minh họa lưu ý trước khi xác nhận hủy hoàn toàn gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 18 — Vì sao không nên bỏ qua SMS phản hồi khi hủy gói Viettel
- title: Vì sao không nên bỏ qua SMS phản hồi khi hủy gói Viettel
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Tin nhắn phản hồi được đánh dấu cần đọc trên điện thoại, không logo.
- imageAlt: Minh họa cần đọc SMS phản hồi khi hủy gói.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 19 — Hủy gói data khi không muốn tiếp tục sử dụng: điều cần biết
- title: Hủy gói data khi không muốn tiếp tục sử dụng: điều cần biết
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Người dùng quyết định dừng một dịch vụ data trên điện thoại, không logo.
- imageAlt: Minh họa quyết định hủy gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 20 — Cách tránh nhầm giữa yêu cầu dừng gia hạn và hủy gói
- title: Cách tránh nhầm giữa yêu cầu dừng gia hạn và hủy gói
- intent: cancellation
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Hai nhãn hành động riêng biệt trong giao diện minh họa, không logo.
- imageAlt: Minh họa tránh nhầm giữa dừng gia hạn và hủy gói.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 21 — Dừng gia hạn gói data Viettel bằng SMS 191
- title: Dừng gia hạn gói data Viettel bằng SMS 191
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Điện thoại soạn yêu cầu dừng gia hạn với biểu tượng chu kỳ, không logo.
- imageAlt: Minh họa dừng gia hạn gói data bằng SMS.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 22 — Dừng gia hạn nhưng không hủy ngay gói data: hiểu đúng thao tác
- title: Dừng gia hạn nhưng không hủy ngay gói data: hiểu đúng thao tác
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Sơ đồ chu kỳ gói chuyển sang trạng thái không gia hạn, không logo.
- imageAlt: Minh họa dừng gia hạn mà không hủy ngay gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 23 — Khi nào nên chọn dừng gia hạn thay vì hủy hoàn toàn gói
- title: Khi nào nên chọn dừng gia hạn thay vì hủy hoàn toàn gói
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Minh họa lựa chọn theo hai nhánh trên lịch chu kỳ, không logo.
- imageAlt: Minh họa chọn dừng gia hạn thay vì hủy hoàn toàn.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 24 — Sau khi dừng gia hạn, cần chú ý gì trong SMS phản hồi
- title: Sau khi dừng gia hạn, cần chú ý gì trong SMS phản hồi
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Điện thoại hiển thị SMS phản hồi với biểu tượng đánh dấu, không logo.
- imageAlt: Minh họa đọc SMS phản hồi sau khi dừng gia hạn.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 25 — Dừng gia hạn gói data để tránh tiếp tục chu kỳ mới
- title: Dừng gia hạn gói data để tránh tiếp tục chu kỳ mới
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Lịch chu kỳ với mũi tên dừng trước kỳ kế tiếp, không logo.
- imageAlt: Minh họa dừng gia hạn trước chu kỳ data tiếp theo.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 26 — Có cần hủy hoàn toàn nếu chỉ muốn dừng gia hạn không?
- title: Có cần hủy hoàn toàn nếu chỉ muốn dừng gia hạn không?
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Câu hỏi chọn lựa giữa hai thao tác trên điện thoại, không logo.
- imageAlt: Minh họa câu hỏi về dừng gia hạn và hủy hoàn toàn.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 27 — Dừng gia hạn gói data: vì sao phải dùng đúng tên gói
- title: Dừng gia hạn gói data: vì sao phải dùng đúng tên gói
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Trường tên gói được tô nổi bật trong mẫu SMS minh họa, không logo.
- imageAlt: Minh họa sử dụng đúng tên gói khi dừng gia hạn.
- status: HOLD
- HOLD reason: FACT_5_PROVIDES_A_TEMPLATE_BUT_NOT_A_NAME_VALIDATION_RULE

### 28 — Dừng gia hạn và ưu đãi còn lại: câu hỏi cần xác nhận với Viettel
- title: Dừng gia hạn và ưu đãi còn lại: câu hỏi cần xác nhận với Viettel
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Biểu tượng ưu đãi và tin nhắn hỏi đáp trên điện thoại, không logo.
- imageAlt: Minh họa xác nhận ưu đãi còn lại khi dừng gia hạn.
- status: HOLD
- HOLD reason: FACT_5_ONLY_ADDRESSES_POSSIBLE_LOSS_AFTER_FULL_CANCELLATION

### 29 — Dừng gia hạn gói data sau khi nhận SMS: các bước cần làm rõ
- title: Dừng gia hạn gói data sau khi nhận SMS: các bước cần làm rõ
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Chuỗi SMS xác nhận minh họa với các bước trung tính, không logo.
- imageAlt: Minh họa quy trình SMS khi dừng gia hạn gói data.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC

### 30 — Dừng gia hạn hay hủy hoàn toàn: bảng quyết định tối giản
- title: Dừng gia hạn hay hủy hoàn toàn: bảng quyết định tối giản
- intent: renewal
- targetUrlPath: /posts/cach-huy-gia-han-4g-viettel/
- sourceFactIds: [fact-5]
- imageBrief: Bảng so sánh hai lựa chọn với biểu tượng điện thoại, không logo.
- imageAlt: Minh họa so sánh dừng gia hạn và hủy hoàn toàn.
- status: HOLD
- HOLD reason: DUPLICATE_WEBSITE_AND_TOPIC_INTENT_TOPIC_HUY_GOI_CUOC
