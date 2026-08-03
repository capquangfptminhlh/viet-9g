# Brief hoàn chỉnh giao AI viết bài và tạo brief ảnh

Đưa file này **cùng với một lô dữ liệu thật** cho AI viết bài. AI không được tự tìm hoặc tự bịa dữ liệu ngoài lô được giao.

Mục tiêu là tạo nội dung hữu ích, đúng dữ kiện, khác nhau về ý định tìm kiếm cho `tracuugoicuoc.com` và mạng Blogger Viettel. AI chỉ trả bản nội dung; hệ thống dự án sẽ kiểm duyệt, sinh ảnh, chèn liên kết và xuất bản sau.

## 1. Cách dùng bắt buộc

Bạn luôn gửi cho AI hai phần:

1. File brief này.
2. **Một object trong mảng `batches`** của [CONTENT_BATCH_INPUT.json](content-batches/CONTENT_BATCH_INPUT.json). Mỗi lô có tối đa ba bài.

Không gửi riêng brief, không dùng các ví dụ trong brief làm dữ liệu. Nếu không có `articles`, `factsAllowed` hoặc dữ liệu còn placeholder, AI chỉ được trả:

```json
{
  "status": "HOLD",
  "reason": "Không có lô dữ liệu thật gồm topic và factsAllowed để viết bài."
}
```

## 2. Bối cảnh thương hiệu và kênh

Giọng văn là tiếng Việt tự nhiên, xưng “bạn”, trực tiếp, bình tĩnh và có ích. Viết như người am hiểu dịch vụ di động giải thích cho khách hàng; không giật gân, không hứa hẹn kết quả, không biến bài hướng dẫn thành quảng cáo.

| Kênh | Phạm vi độc lập |
|---|---|
| Web chính | Hướng dẫn, giải đáp, so sánh và review có trang đích đúng ngữ cảnh |
| Blogger 1 | Cẩm nang dùng 4G/5G, eSIM, thiết bị và roaming |
| Blogger 2 | Thao tác kiểm tra tài khoản, dung lượng và ứng dụng |
| Blogger 3 | Hủy, gia hạn, quản lý gói cước và SMS/USSD |
| Blogger 4 | Review và lựa chọn gói cước theo nhu cầu |
| Blogger 5 | Khắc phục lỗi mạng, SIM/eSIM và kết nối |

Một bài chỉ phục vụ một `topicId`, một `intent` và một kênh. Không sao chép cấu trúc, câu mở đầu hay kết luận giữa các bài.

Mã đại lý `GB` là dữ liệu vận hành nội bộ. Chỉ được nhắc đến khi một fact trong chính bài đó nêu rõ cú pháp có `GB`; nếu không có fact, tuyệt đối không tự thêm.

## 3. Dữ liệu đầu vào

Mỗi `articles` trong lô có dạng sau:

```json
{
  "topic": {
    "topicId": "b4-review-07-a",
    "title": "Đánh giá SD120 Viettel: đọc thông số chính thức trước khi chọn",
    "intent": "review",
    "targetChannel": "main-site",
    "targetUrlPath": "/goi-cuoc/sd120/"
  },
  "factsAllowed": [
    {
      "id": "package-07",
      "claim": "SD120 is listed at 120,000đ for 30 days with 60GB high-speed data (2GB/day).",
      "sourceUrl": "https://098.viettel.vn/...",
      "expiresAt": "2026-11-01T23:59:59Z"
    }
  ],
  "imageBrief": "Mô tả minh họa riêng cho bài.",
  "imageAlt": "Mô tả ảnh bằng tiếng Việt."
}
```

`factsAllowed` là giới hạn dữ kiện, không phải gợi ý chung. Không có quyền nêu giá khác, ưu đãi gọi, điều kiện thuê bao, tự gia hạn, cú pháp đăng ký/hủy, phạm vi áp dụng hoặc so sánh với gói khác nếu fact không ghi rõ.

## 4. Định dạng nộp lại: một JSON hợp lệ

Trả đúng **một JSON object**, không có câu giải thích trước/sau, không Markdown và không HTML. `results` phải có đúng số bài trong `expectedArticleCount`.

```json
{
  "batchId": "giu-nguyen-tu-input",
  "expectedArticleCount": 3,
  "results": [
    {
      "status": "READY",
      "topicId": "giu-nguyen-tu-input",
      "title": "giu-nguyen-tu-input",
      "intent": "giu-nguyen-tu-input",
      "summary": "Tóm tắt trực tiếp, không có dữ kiện mới.",
      "bodyBlocks": [
        {
          "type": "paragraph",
          "text": "Mở bài trả lời trực tiếp điều người đọc cần biết."
        },
        {
          "type": "heading",
          "level": 2,
          "text": "Thông số được xác minh"
        },
        {
          "type": "paragraph",
          "text": "Nội dung chỉ diễn đạt từ fact được cấp."
        },
        {
          "type": "list",
          "style": "bullet",
          "items": ["Lưu ý đầu tiên.", "Lưu ý thứ hai."]
        }
      ],
      "factClaims": [
        {
          "factId": "giu-nguyen-tu-input",
          "claim": "Chép nguyên văn claim của fact tương ứng từ factsAllowed."
        }
      ],
      "image": {
        "prompt": "English editorial illustration prompt, no text, no logo, no user interface",
        "alt": "Mô tả ảnh tiếng Việt, đúng nội dung bài."
      },
      "selfCheck": {
        "validJson": true,
        "utf8Clean": true,
        "allClaimsGrounded": true,
        "noUnsupportedNumbers": true,
        "noExternalLinks": true,
        "differentFromOtherChannels": true
      }
    }
  ]
}
```

Nếu một bài không thể viết an toàn, giữ đủ `topicId` nhưng dùng `status: "HOLD"` và `reason`. Không bịa nội dung để đủ số lượng.

## 5. Luật viết `bodyBlocks`

`bodyBlocks` là dữ liệu cấu trúc để hệ thống render HTML an toàn. Chỉ dùng ba loại:

| `type` | Trường bắt buộc |
|---|---|
| `paragraph` | `text` |
| `heading` | `level` từ 2 đến 4, `text` |
| `list` | `style` là `bullet` hoặc `number`, `items` là mảng chuỗi |

Quy tắc:

1. Block đầu tiên luôn là `paragraph`, trả lời ngay tiêu đề; không chào mừng, không quảng cáo chung chung.
2. Có ít nhất ba `heading` level 2 hoặc 3, mỗi heading phải có nội dung thực tế phía sau.
3. Không dùng `bodyHtml`, HTML, Markdown, link, ảnh nhúng, tracking URL, script hoặc style.
4. Nội dung review phải có ba ý: thông số được xác minh, điểm phù hợp với nhu cầu, và điều cần cân nhắc. “Phù hợp” là nhận định có điều kiện; không nói “tốt nhất”, “rẻ nhất”, “lý tưởng”, “đảm bảo” hay “áp dụng cho mọi thuê bao”.
5. Nội dung hủy/gia hạn chỉ nêu sự khác nhau, cú pháp và cảnh báo mất ưu đãi nếu các dữ kiện đó có trong `factsAllowed`.
6. Nội dung xử lý lỗi chỉ hướng dẫn kiểm tra theo thứ tự; không chẩn đoán chắc chắn nguyên nhân khi fact không nêu.

## 6. Luật fact và số liệu

1. Mọi số, giá, dung lượng, chu kỳ, ngày, tên gói, cú pháp SMS/USSD và quyền lợi phải có fact tương ứng.
2. `factClaims[].claim` phải chép **nguyên văn từng ký tự** từ `factsAllowed[].claim`, bao gồm `đ`, dấu câu và tiếng Anh nếu fact gốc dùng tiếng Anh.
3. Có thể diễn đạt nội dung fact bằng tiếng Việt trong `bodyBlocks`, nhưng không được đổi giá trị, cộng/trừ dữ liệu hoặc suy ra quyền lợi mới.
4. Cấm các suy luận không có fact: có/không phút gọi, giá cao/rẻ hơn gói khác, tự gia hạn, đối tượng thuê bao, tốc độ thực tế, phạm vi dùng, cách đăng ký/hủy, ưu đãi ứng dụng hoặc khuyến mãi.
5. Khi fact thiếu điều cần thiết, trả `HOLD`; không dùng kiến thức ngoài, kết quả Google hay thông tin nhớ được.

## 7. Brief ảnh riêng cho từng bài

Mỗi bài `READY` cần `image.prompt` bằng tiếng Anh và `image.alt` tiếng Việt.

- Ảnh là minh họa biên tập, tỷ lệ ưu tiên 1200×630 hoặc 16:9.
- Không chữ, không số, không logo, không QR, không giao diện ứng dụng, không nút bấm giả và không bảng giá.
- Không mô tả màn hình điện thoại cụ thể như ảnh chụp thật; dùng bối cảnh đời thường liên quan đến SIM/eSIM, kết nối mạng, roaming hoặc nhu cầu dùng data.
- Prompt phải khác giữa các bài, bám đúng `imageBrief`; không dùng prompt chung chung như “smartphone on a desk”.

Ví dụ: `Vietnamese commuter checking a smartphone mobile data connection on a bus, editorial illustration, clean composition, no text, no letters, no numbers, no logo, no user interface`.

## 8. Kiểm tra trước khi nộp

Trước khi trả lời, AI phải tự kiểm toàn bộ lô:

1. JSON parse được; không có dấu phẩy thừa hoặc xuống dòng thô bên trong chuỗi.
2. Không có chuỗi lỗi mã hóa như `Ä`, `Ã`, `á»`, `Æ` trong bất kỳ trường nào.
3. Có đủ số `results`, `topicId` không trùng và đúng input.
4. `title`, `intent`, `targetChannel` và fact IDs không bị đổi.
5. Mọi fact dùng trong body đều có `factClaims` tương ứng, chép đúng nguyên văn.
6. Không có claim, số liệu, link hoặc CTA ngoài dữ liệu được cấp.
7. Ảnh có prompt riêng, alt đúng bài và không có chữ/logo/UI.

Nếu không đạt một điều nào, trả `HOLD` cho riêng bài đó.

## 9. Câu lệnh giao việc để copy

```text
Bạn nhận được Brief và một lô dữ liệu thật. Chỉ xử lý các articles trong lô này.

Hãy trả đúng một JSON hợp lệ theo Mục 4 của Brief. Không viết bất kỳ giải thích nào ngoài JSON. Dùng bodyBlocks, không dùng HTML.

Không dùng giá trị mẫu trong Brief. Không tự tìm dữ liệu ngoài factsAllowed. Khi fact không đủ, trả HOLD cho bài đó. Trước khi gửi, tự kiểm tra JSON.parse được, UTF-8 tiếng Việt chuẩn và không có ký tự lỗi mã hóa.
```

## 10. Sau khi AI trả bài

Gửi JSON lại cho Codex. Dự án sẽ kiểm tra lại fact còn hạn, nguồn Viettel, cấu trúc, encoding, ảnh, trùng lặp, link policy và ledger. Chỉ bài qua tất cả gate mới được nhập vào queue hoặc xuất bản tự động.
