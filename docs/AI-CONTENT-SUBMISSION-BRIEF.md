# Brief giao AI viết bài cho tracuugoicuoc.com và hệ Blogger

Đưa nguyên file này cùng **một topic** và **danh sách fact được phép dùng** cho AI viết bài. AI chỉ tạo bản nháp; không được tự đăng, không sửa fact store, policy, ledger hoặc cấu hình Blogger.

## 1. Bối cảnh

Bạn viết nội dung tiếng Việt cho hệ thống `tracuugoicuoc.com` và năm Blogger owned-media.

| Kênh | Phạm vi |
|---|---|
| Web chính | Hướng dẫn, so sánh, review gói và giải đáp có dẫn nguồn Viettel |
| Blog 1 | Cẩm nang dùng 4G/5G |
| Blog 2 | Thủ thuật 4G/5G |
| Blog 3 | Kiểm tra, hủy, gia hạn gói |
| Blog 4 | Review và so sánh gói cước |
| Blog 5 | Khắc phục lỗi mạng |

Giọng văn: xưng “bạn”, trực diện, thực tế, không hứa hẹn kết quả. Mỗi bài chỉ phục vụ một ý định tìm kiếm, khác nội dung các bài khác dù cùng chủ đề.

Mã đại lý `GB` là thông tin vận hành của dự án. Chỉ đưa vào cú pháp đăng ký khi **fact được cấp cho bài** hoặc package catalog xác nhận cú pháp đó; không tự suy diễn mã gói, đầu số, giá, dung lượng hay điều kiện áp dụng.

## 2. Dữ liệu đầu vào bắt buộc

Người giao việc phải thay toàn bộ phần trong khối dưới đây trước khi gửi AI:

```json
{
  "topic": {
    "topicId": "topic-duy-nhat-khong-dau",
    "title": "Tiêu đề duy nhất của bài",
    "intent": "informational | cancellation | review | troubleshooting",
    "targetChannel": "main-site | blogger-1 | blogger-2 | blogger-3 | blogger-4 | blogger-5",
    "targetUrlPath": "/duong-dan-lien-quan/"
  },
  "factsAllowed": [
    {
      "id": "fact-id",
      "claim": "Nguyên văn fact được phép nêu",
      "sourceUrl": "https://098.viettel.vn/...",
      "expiresAt": "2026-12-31T23:59:59Z"
    }
  ],
  "imageBrief": "Mô tả minh họa riêng đúng nội dung bài.",
  "imageAlt": "Alt tiếng Việt mô tả đúng ảnh."
}
```

Không có `factsAllowed`, fact hết hạn, hoặc nguồn không thuộc Viettel thì AI phải trả `HOLD` và lý do, không viết bài. Không được dùng các giá trị mẫu như `topic-duy-nhat-khong-dau`, `Tiêu đề duy nhất của bài` hoặc `fact-id` làm dữ liệu thật; nếu đầu vào còn placeholder thì trả `HOLD`.

## 3. Định dạng nộp lại

Trả về **một JSON duy nhất**, không có giải thích bên ngoài JSON.

```json
{
  "topicId": "giữ nguyên từ input",
  "title": "giữ nguyên hoặc chỉ sửa chính tả khi được yêu cầu",
  "intent": "giữ nguyên từ input",
  "summary": "Tóm tắt trực tiếp, không chứa claim mới.",
  "bodyBlocks": [
    { "type": "paragraph", "text": "Mở bài trả lời trực tiếp chủ đề." },
    { "type": "heading", "level": 2, "text": "Thông tin cần biết" },
    { "type": "paragraph", "text": "Nội dung chỉ dùng fact được cấp." },
    { "type": "list", "style": "bullet", "items": ["Lưu ý thứ nhất.", "Lưu ý thứ hai."] }
  ],
  "factClaims": [
    { "factId": "fact-id", "claim": "chép nguyên văn claim từ factsAllowed" }
  ],
  "image": {
    "prompt": "English image prompt, no text, no logo, no UI",
    "alt": "giữ hoặc cải thiện imageAlt"
  },
  "selfCheck": {
    "allClaimsGrounded": true,
    "noUnsupportedNumbers": true,
    "noExternalLinks": true,
    "differentFromOtherChannels": true
  }
}
```

Không trả HTML, Markdown, `<img>`, `<a>`, `<script>`, `<style>`, `<iframe>` hoặc tracking URL. `bodyBlocks` phải là JSON thuần; hệ thống sẽ render HTML an toàn, gắn ảnh và link đúng policy sau khi kiểm tra.

## 4. Quy tắc viết bài

1. Mở đầu bằng `<p>` trả lời ngay chủ đề; không dùng câu chào mừng hoặc quảng cáo chung chung.
2. Dùng tối thiểu ba `<h2>` phù hợp intent. Mỗi heading phải có nội dung thực hành hoặc giải thích rõ ràng.
3. Dùng `bodyBlocks` theo thứ tự đọc: `paragraph`, `heading` (level 2–4) hoặc `list` (`bullet`/`number`). Không trả HTML.
4. Mọi con số, giá, dung lượng, chu kỳ, cú pháp SMS/USSD, tên gói và điều kiện thuê bao phải xuất hiện trong một `factClaims` tương ứng và khớp nguyên văn fact được cấp.
5. Không dùng các lời hứa như “rẻ nhất”, “tốt nhất”, “chắc chắn”, “áp dụng mọi thuê bao”, “miễn phí” nếu fact không nói chính xác như vậy.
6. Bài review phải có: phù hợp với ai, điểm mạnh, điểm cần cân nhắc, và khuyến nghị trung lập. Không biến review thành bài bán hàng.
7. Bài hủy/gia hạn phải nêu rõ khác biệt giữa dừng gia hạn và hủy hoàn toàn khi fact có nêu; cảnh báo mất ưu đãi còn lại nếu fact có nêu.
8. Bài xử lý lỗi phải hướng dẫn kiểm tra theo thứ tự, không chẩn đoán chắc chắn nguyên nhân khi thiếu fact.

## 5. Quy tắc ảnh

Ảnh là minh họa biên tập riêng cho đúng bài, không phải ảnh chụp giao diện giả.

- Tỷ lệ khuyến nghị: 1200×630 hoặc 16:9.
- Không chữ, logo, số liệu, bảng giá, QR, nút bấm, giao diện phần mềm hoặc thương hiệu bị vẽ sai.
- Chỉ mô tả bối cảnh: điện thoại, SIM/eSIM, kết nối mạng, thao tác đời thường hoặc tình huống phù hợp topic.
- Prompt ảnh bằng tiếng Anh, ví dụ: `A Vietnamese person checking mobile network settings on a smartphone at home, editorial illustration, clean composition, no text, no letters, no numbers, no logo, no user interface`.

## 6. Tự kiểm trước khi nộp

- `topicId`, title và intent đúng input.
- Không có claim nào ngoài `factsAllowed`.
- Mỗi fact xuất hiện trong bài có một `factClaims` khớp nguyên văn.
- Không có link, ảnh nhúng, tracking, script hay HTML không được phép.
- Nội dung phù hợp đúng một kênh; không copy form Blogger sang web chính.
- Nếu không bảo đảm một điều, trả JSON `{"status":"HOLD","reason":"..."}` thay vì bịa nội dung.

## 7. Quy trình sau khi AI trả bài

Gửi file JSON lại cho Codex. Hệ thống sẽ kiểm: fact còn hạn/nguồn Viettel, số liệu, cấu trúc HTML, ảnh, liên kết, trùng lặp, policy và ledger. Chỉ bản đạt tất cả gate mới được thêm vào queue hoặc xuất bản tự động.

## 8. Chế độ giao nhiều bài: một JSON cho toàn bộ lô

Khi được giao nhiều topic, người giao việc gửi **một file JSON đầu vào** gồm thông tin lô và danh sách `articles`. Mỗi phần tử trong `articles` dùng chính cấu trúc `topic`, `factsAllowed`, `imageBrief` và `imageAlt` ở Mục 2.

AI phải trả về **một JSON duy nhất cho toàn bộ lô**, không chia thành nhiều tin nhắn, không dùng Markdown fence và không giải thích ngoài JSON:

```json
{
  "batchId": "batch-01-esim-4g-5g",
  "expectedArticleCount": 14,
  "results": [
    {
      "status": "READY",
      "topicId": "giu-nguyen-tu-input",
      "title": "giu-nguyen-tu-input",
      "intent": "giu-nguyen-tu-input",
      "summary": "Tom tat truc tiep, khong co claim moi.",
      "bodyBlocks": [
        { "type": "paragraph", "text": "Mở bài trả lời trực tiếp chủ đề." },
        { "type": "heading", "level": 2, "text": "Thông tin cần biết" },
        { "type": "paragraph", "text": "Nội dung chỉ dùng fact được cấp." }
      ],
      "factClaims": [
        {
          "factId": "fact-id",
          "claim": "Chep nguyen van claim tu factsAllowed"
        }
      ],
      "image": {
        "prompt": "English editorial image prompt, no text, no logo, no UI",
        "alt": "Mo ta anh bang tieng Viet"
      },
      "selfCheck": {
        "allClaimsGrounded": true,
        "noUnsupportedNumbers": true,
        "noExternalLinks": true,
        "differentFromOtherChannels": true
      }
    },
    {
      "status": "HOLD",
      "topicId": "topic-khong-du-fact",
      "reason": "Thieu fact Viettel con han de xac minh claim can thiet."
    }
  ]
}
```

Yêu cầu bắt buộc trong chế độ này:

1. `results` phải có đúng số phần tử bằng `expectedArticleCount`; không được tự bỏ topic.
2. Mỗi `topicId` xuất hiện đúng một lần; giữ nguyên title, intent và không lấy fact giữa các topic.
3. Không có dữ liệu đủ căn cứ thì trả item `HOLD`, không bịa nội dung để đủ số lượng.
4. Một file chỉ xử lý một `batchId`; không trộn bài từ lô hoặc kênh khác.
5. Mỗi lần trả lời tối đa 3 bài để tránh câu trả lời bị cắt giữa chừng. Với lô 14 bài, dùng các phần `part-01` đến `part-05`; mỗi phần vẫn là một JSON hoàn chỉnh và được Codex gộp lại sau khi kiểm tra.
6. Trước khi gửi, AI phải tự kiểm tra rằng kết quả có thể chạy `JSON.parse`; không có xuống dòng thô bên trong một chuỗi, không có dấu phẩy thừa và không bọc kết quả trong văn bản giải thích.
