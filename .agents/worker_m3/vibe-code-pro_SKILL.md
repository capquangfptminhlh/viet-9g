---
name: vibe-code-pro
description: BẮT BUỘC dùng cho mọi tác vụ code - viết mới, sửa bug, fix lỗi, refactor, review, tạo tính năng, tạo API/component/function. Quy trình khảo sát trước - viết sau - tự verify - tự sửa lỗi trong tối đa 3 vòng trước khi giao. Kích hoạt với từ khóa như code, viết, sửa, fix, bug, lỗi, refactor, tạo, build, implement, thêm tính năng.
---

# VIBE CODE PRO — vòng lặp: Khảo sát → Viết → Verify → Tự sửa

## PHA 1 — KHẢO SÁT (bắt buộc, kể cả việc nhỏ)

Chạy nhanh, không kể lể:
1. Dự án dùng gì? → đọc package.json / pyproject.toml / go.mod (chỉ phần dependencies + scripts).
2. Lệnh verify của dự án là gì? → tìm trong scripts: `typecheck`, `lint`, `build`, `test`.
   Ghi nhớ để dùng ở Pha 3.
3. File sắp sửa: ĐỌC nó. Hàm sắp đổi signature: GREP mọi chỗ gọi nó.
4. Convention: nhìn 1-2 file cùng loại để bắt chước style.

CẤM viết dòng code nào trước khi xong pha này.

## PHA 2 — VIẾT

- Bám convention vừa khảo sát. Diff tối thiểu.
- Checklist ngầm mỗi đoạn code:
  - Input được validate? Async có try/catch? Null/undefined được check?
  - Có bịa hàm/API nào không chắc tồn tại không? → quay lại Pha 1 kiểm chứng.
  - Có gì ngoài phạm vi yêu cầu không? → xóa.
  - Secret có bị hardcode không? → chuyển sang env.

## PHA 3 — VERIFY & TỰ SỬA (vòng lặp, tối đa 3 lần)

```
LOOP (max 3):
  chạy: typecheck → lint → test liên quan → (build nếu cần)
  nếu PASS hết → thoát loop, sang Pha 4
  nếu FAIL:
    - đọc CHÍNH XÁC message lỗi, không đoán
    - lỗi ở code mình vừa viết → sửa đúng chỗ đó
    - lỗi có sẵn từ trước, không liên quan thay đổi của mình
      → KHÔNG sửa, ghi chú lại để báo ở Pha 4
    - quay lại đầu loop
```

Sau 3 vòng vẫn fail → DỪNG. Báo: lỗi gì, đã thử gì (3 gạch đầu dòng),
nghi ngờ nguyên nhân gì. CẤM giao code lỗi và giả vờ xong.

Dự án không có lệnh test/lint nào → tự chạy file/hàm bằng cách khả thi nhất
(node -e, python -c, curl endpoint...) để xác nhận không crash.

## PHA 4 — BÁO CÁO

Việc nhỏ: 1 dòng. `✅ Fix null check trong parseUser() — src/utils/user.ts, test pass`

Việc vừa/lớn, tối đa 4 dòng:
```
✅ <tóm tắt 1 câu>
📁 <files>
▶️ <lệnh verify đã pass>
⚠️ <chỉ khi có: lỗi tồn tại từ trước / trade-off đã chọn>
```

KHÔNG: giải thích code, dán lại code trong báo cáo, hỏi "bạn có muốn tôi..." trừ
khi thật sự có nhánh quyết định quan trọng.
