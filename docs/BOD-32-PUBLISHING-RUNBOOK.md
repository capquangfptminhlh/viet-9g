# BOD-32 — Quy trình xuất bản Blogger an toàn

Mục tiêu: chỉ xuất bản nội dung có ích, khác web chính và đã được kiểm chứng. Không dùng Blogger để đăng hàng loạt, lặp nội dung, hoặc ép link.

## Quy tắc không được phá vỡ

1. BOD-32 chỉ tạo **Draft**. Không gọi API publish; người phụ trách tự bấm Publish trong Blogger.
2. Mỗi lần chạy chỉ được tạo tối đa một draft cho một blog.
3. Không có fact hợp lệ, không có topic hợp lệ, hoặc nội dung gần trùng: **HOLD**, không tìm cách lách gate.
4. Link về `tracuugoicuoc.com` là tùy ngữ cảnh, tối đa một link/bài; bắt buộc HTTPS, UTM và `rel="nofollow noopener noreferrer"`.
5. Không bật cron cho đến khi các draft thực tế được review đạt chất lượng.

## Trước khi thêm topic

- Xác định intent riêng của Blogger; không trùng title/intent với bài web chính.
- Thêm fact vào `data/facts.json`: `id`, nội dung fact, nguồn, thời điểm kiểm tra, hiệu lực và thời điểm cần review lại.
- Chỉ dùng nguồn đáng tin; với giá gói/cú pháp/ưu đãi ưu tiên nguồn nhà mạng. Không lấy web chính làm nguồn duy nhất cho claim quan trọng.
- Thêm topic vào `config/topics.json` với `topicId` duy nhất, `targetBlogId`, tiêu đề, intent, `contentVersion`, `sourceFactIds` và trạng thái `QUEUE`.
- Đọc lại nội dung dự kiến: bài phải giải quyết một câu hỏi người dùng, không chỉ đổi từ khóa.

## Tiêu chuẩn một draft đạt chất lượng

Draft phải có đủ:

- Tiêu đề đúng topic, không giật gân.
- Đoạn mở đầu trả lời trực tiếp câu hỏi.
- Tối thiểu ba phần hướng dẫn hoặc giải thích có ích.
- Hướng dẫn thực hành, điều kiện áp dụng và lưu ý phù hợp khi có fact.
- FAQ ngắn nếu phù hợp.
- Không chứa số liệu, giá, dung lượng, chu kỳ, cú pháp SMS hoặc cam kết nếu không có fact ID đã kiểm chứng.
- Không sao chép bài web chính; không dùng template chung chung như “nhiều ưu đãi” hoặc “xem thêm”.
- Nếu có link: chỉ một link liên quan trực tiếp, anchor tự nhiên, UTM + rel đúng policy.

## Chính sách ảnh cho web chính và Blogger

1. Mỗi bài mới phải có một ảnh AI tạo mới, bám sát topic và nội dung thực tế của bài; không tái sử dụng ảnh giữa các topic khác nhau.
2. Một asset gốc được tạo cho từng bài, lưu trước ở web chính; Blogger dùng chính asset đó hoặc phiên bản tối ưu cùng nội dung. Không hotlink ảnh bên thứ ba.
3. Prompt ảnh phải tránh logo/nhãn hiệu bị mô phỏng sai, người thật có thể nhận diện, watermark và chữ chứa giá/cú pháp chưa fact-check.
4. Lưu asset với tên mô tả, nén WebP/JPEG hợp lý, có `alt` mô tả trung thực. Không tải lại ảnh từ Google Images, website đối thủ hoặc mạng xã hội.
5. Với ảnh thông tin gói cước/cú pháp, chỉ đưa số liệu đã có fact ID còn hiệu lực. Nếu không thể tạo ảnh an toàn, bài phải HOLD thay vì dùng ảnh không liên quan.
6. Trước Publish, reviewer xác nhận: ảnh đúng topic, không có claim sai, alt text đúng, hiển thị tốt trên desktop/mobile và cùng asset được dùng nhất quán ở web chính/Blogger.

## Quy trình mỗi lần chạy

1. Chạy workflow thủ công **Blogger Owned Media Draft** trên `main`.
2. Kiểm tra Actions Summary và log:
   - `status: SUCCESS` chỉ khi có draft mới;
   - `draftReviewUrl` mở được;
   - ledger được commit;
   - không có secret trong log.
3. Mở draft trong Blogger và review theo tiêu chuẩn ở trên.
4. Nếu đạt: người phụ trách tự bấm **Publish** trong Blogger.
5. Nếu không đạt: giữ Draft hoặc xóa Draft; sửa topic/facts/generator trước lần chạy tiếp theo. Không publish để “đủ số lượng”.
6. Ghi nhận kết quả vào ledger/audit: topic, post ID, link review, quyết định Publish/HOLD và lý do.

## Các trạng thái và hành động bắt buộc

| Trạng thái | Ý nghĩa | Hành động |
| --- | --- | --- |
| `SUCCESS` | Có một draft đã read-back | Review thủ công trước Publish. |
| `TOPIC_QUEUE_EXHAUSTED` | Không còn topic hợp lệ | Không chạy lại; bổ sung topic/fact đã review. |
| `HOLD` | Fact, duplicate hoặc policy không đạt | Sửa đầu vào; không bypass gate. |
| `DUPLICATE_IDEMPOTENCY` | Topic/draft đã có record | Kiểm tra ledger và Blogger, không tạo lại. |
| `VERIFY_FAILED` / `ERROR` | API hoặc read-back lỗi | Không retry mù; kiểm tra post ID/ledger trước. |

## Điều kiện bật cron

Chỉ bật cron khi tất cả điều kiện sau đạt:

- Ít nhất 5 topic đã fact-check và review riêng.
- Ít nhất 3 draft chất lượng đã được duyệt thủ công.
- Không có draft trùng, post public ngoài ý muốn hoặc secret lộ trong log.
- Ledger và Summary hoạt động ở mọi lượt Pilot.
- Có người chịu trách nhiệm review định kỳ fact hết hạn và nội dung draft.

Khi bật cron, vẫn giữ một draft/lần chạy và lịch chạy hằng ngày hoặc thưa hơn. Nếu hai lần liên tiếp `HOLD`, `ERROR` hoặc chất lượng draft giảm, tắt cron và quay lại workflow thủ công.

## Checklist trước khi bấm Publish

- [ ] Bài khác rõ ràng với web chính.
- [ ] Nội dung không còn boilerplate hoặc claim không có nguồn.
- [ ] Fact quan trọng còn hiệu lực.
- [ ] Link (nếu có) đúng policy và thực sự hữu ích.
- [ ] Đã đọc trên desktop và mobile trong Blogger preview.
- [ ] Không có lý do nào chỉ để “phủ keyword” hoặc “đủ số lượng bài”.
