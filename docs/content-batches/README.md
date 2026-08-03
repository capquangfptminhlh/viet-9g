# File giao trực tiếp cho model viết bài

Mỗi file `ready-to-send-part-XX.json` đã có sẵn ba `articles`, `factsAllowed`, brief ảnh và alt ảnh thật. Không cần tự chép từ `CONTENT_BATCH_INPUT.json`.

## Cách giao

1. Gửi hoặc đính kèm `AI-CONTENT-SUBMISSION-BRIEF.md`.
2. Gửi hoặc đính kèm **một** file `ready-to-send-part-XX.json` trong cùng cuộc trò chuyện.
3. Dán câu lệnh ở Mục 9 của Brief.
4. Nhận lại một JSON kết quả, gồm đúng ba bài, rồi gửi JSON đó cho Codex kiểm tra.

Không gửi riêng Brief, không gửi riêng link GitHub và không yêu cầu model tự tìm file. Khi thiếu file dữ liệu, model phải trả `HOLD` theo đúng quy tắc.
