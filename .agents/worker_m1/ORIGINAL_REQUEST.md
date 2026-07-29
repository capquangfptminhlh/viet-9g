## 2026-07-29T06:20:17Z
You are a Worker subagent for Milestone 1 (Technical SEO & AEO Optimization).
Your working directory for metadata is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\worker_m1 (create directory if needed).
The project root directory is D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task:
Read the Explorer M1 handoff report at D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m1\handoff.md and analysis report at D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.agents\explorer_m1\analysis.md.

Implement all Milestone 1 technical SEO & AEO requirements:
1. Sửa/xác nhận `<html lang="vi">` trong `index.html`.
2. Thêm đầy đủ Meta Description, Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale`, `og:image:width`, `og:image:height`, `og:image:alt`) và Canonical URL (`https://tracuugoicuoc.com/`) trong `index.html`.
3. Cập nhật mã JSON-LD Schema trong `index.html`:
   - WebSite Schema hợp lệ với `alternateName: "Tra Cứu Gói Cước Viettel"`, `inLanguage: "vi"`.
   - FAQPage Schema hợp lệ đồng bộ 100% với 5 câu hỏi/câu trả lời trong `src/data/packages.ts`.
4. Tạo/cập nhật `public/robots.txt` chứa cấu hình đầy đủ (Allow all, explicit AI crawlers `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, chỉ hướng Sitemap: `https://tracuugoicuoc.com/sitemap.xml`).
5. Tạo/cập nhật `public/sitemap.xml` hợp lệ cho `https://tracuugoicuoc.com/`.

Verification:
- Run verification tests/checks (e.g. JSON syntax check or node script test, build test if applicable).
- Write `changes.md` and `handoff.md` in `.agents/worker_m1`.
- Send report back to orchestrator via `send_message`.
