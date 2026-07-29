import { GoogleGenAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API KEY của Gemini (Cấu hình qua biến môi trường hoặc điền trực tiếp)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "SẾP_ĐIỀN_API_KEY_VÀO_ĐÂY";

if (GEMINI_API_KEY === "SẾP_ĐIỀN_API_KEY_VÀO_ĐÂY") {
  console.error("❌ LỖI: Vui lòng cấu hình GEMINI_API_KEY trong file scripts/generate-content.js hoặc qua biến môi trường!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Danh sách từ khóa ngách cần đánh chiếm lập tức
const KEYWORDS = [
  "đăng ký mxh120 viettel",
  "gói cước mxh150 viettel ưu đãi khủng",
  "gói 4g viettel rẻ nhất cho học sinh",
  "hướng dẫn hủy gói cước viettel tránh trừ tiền",
  "cách đăng ký 4g viettel 1 ngày siêu tốc"
];

async function generateArticle(keyword) {
  console.log(`🤖 Đang tự động viết bài cho từ khóa: "${keyword}"...`);
  
  const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `Bạn là chuyên gia viết bài chuẩn SEO/AEO số 1 thế giới. 
  Hãy viết một bài viết chi tiết, chuẩn xác bằng tiếng Việt về chủ đề: "${keyword}".
  Yêu cầu bắt buộc:
  1. Cấu trúc bài viết phải có H1, H2, H3 rõ ràng.
  2. Phải có phần Hỏi Đáp (FAQ) ở cuối bài viết để tối ưu AEO cho AI trích xuất.
  3. Viết dạng Markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    const fileName = keyword.toLowerCase().replace(/ /g, '-') + '.md';
    const filePath = path.join(__dirname, '..', 'public', 'posts', fileName);
    
    // Đảm bảo thư mục posts tồn tại
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Đã lưu bài viết thành công tại: ${filePath}`);
  } catch (err) {
    console.error(`❌ Lỗi tạo bài viết cho từ khóa "${keyword}":`, err.message);
  }
}

async function run() {
  for (const kw of KEYWORDS) {
    await generateArticle(kw);
    // Delay 5 giây tránh bị rate limit API
    await new Promise(r => setTimeout(r, 5000));
  }
}

run();
