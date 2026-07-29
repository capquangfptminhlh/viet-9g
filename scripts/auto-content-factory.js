import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYWORDS_FILE = path.join(__dirname, '..', 'data', 'keywords.txt');
const POSTS_DIR = path.join(__dirname, '..', 'public', 'posts');
const PACKAGES_FILE = path.join(__dirname, '..', 'src', 'data', 'packages.ts');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helpers: Extract Data
function getSourceOfTruth() {
  const content = fs.readFileSync(PACKAGES_FILE, 'utf-8');
  const pkgRegex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*price:\s*(\d+),\s*duration:\s*'([^']+)',\s*dataLimit:\s*'([^']+)'(?:.|\n)*?description:\s*'([^']+)'/g;
  let truth = 'DỮ LIỆU CÁC GÓI CƯỚC VIETTEL GỐC:\n';
  let match;
  while ((match = pkgRegex.exec(content)) !== null) {
    truth += `- Gói ${match[2]}: Giá ${match[3]}đ, Hạn: ${match[4]}, Data: ${match[5]}. Cú pháp đăng ký: ${match[2]} DA gửi 290. Cú pháp hủy: HUY ${match[2]} gửi 191.\n`;
  }
  return truth;
}

function createSlug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function callGeminiAPI(systemPrompt, userPrompt) {
  if (!GEMINI_API_KEY) throw new Error("Thất bại: Thiếu biến môi trường GEMINI_API_KEY");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n---\n\n" + userPrompt }] }
    ],
    generationConfig: {
      temperature: 0.2
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lỗi API: ${err}`);
  }
  
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function runFactory() {
  console.log('🤖 KHỞI ĐỘNG NHÀ MÁY NỘI DUNG TỰ ĐỘNG (SUBNET 1)');
  
  if (!fs.existsSync(KEYWORDS_FILE)) {
    console.log('⚠️ Không tìm thấy file data/keywords.txt');
    return;
  }
  
  const sourceOfTruth = getSourceOfTruth();
  
  let keywords = fs.readFileSync(KEYWORDS_FILE, 'utf-8').split('\n').map(k => k.trim()).filter(k => k.length > 0);
  if (keywords.length === 0) {
    console.log('✅ Đã viết hết từ khóa trong danh sách.');
    return;
  }

  // Lấy 2 từ khóa đầu tiên để viết mỗi đêm (Tránh spam API)
  const batchSize = Math.min(2, keywords.length);
  const targetKeywords = keywords.splice(0, batchSize);
  
  console.log(`🎯 Hôm nay sẽ xử lý ${batchSize} từ khóa: ${targetKeywords.join(', ')}`);
  
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  for (const kw of targetKeywords) {
    console.log(`\n⏳ Đang gọi WRT-4 viết bài cho từ khóa: "${kw}"...`);
    const wrt4Prompt = `Bạn là WRT-4, chuyên gia viết bài AEO (AI Engine Optimization).
QUY TẮC:
1. ANSWER FIRST: Câu đầu tiên (40-60 chữ) phải trả lời thẳng vào trọng tâm từ khóa, không dạo đầu lôi thôi.
2. Dùng Markdown chuẩn, H1 là tiêu đề chứa từ khóa, H2, H3.
3. Bắt buộc có Bảng thông số gói cước.
4. Bắt buộc có phần FAQ (Câu hỏi thường gặp).
5. Trích xuất chính xác số liệu từ SOURCE OF TRUTH.
SOURCE OF TRUTH:
${sourceOfTruth}`;
    
    try {
      const draft = await callGeminiAPI(wrt4Prompt, `YÊU CẦU: Viết một bài chuẩn SEO/AEO cho từ khóa: "${kw}". Chỉ trả về nội dung bài viết, không giải thích gì thêm.`);
      
      console.log(`🔍 WRT-4 đã viết xong nháp. Chuyển sang trạm VER-7 kiểm duyệt...`);
      
      const ver7Prompt = `Bạn là VER-7, Giám đốc kiểm duyệt số liệu (Gác cổng). Bạn rất khắt khe.
Nhiệm vụ: Đối chiếu BẢN NHÁP với DỮ LIỆU GỐC. 
Nếu BẢN NHÁP chứa giá tiền, số GB, hay cú pháp sai lệch so với gốc -> Kết luận FAIL. Nếu đúng -> Kết luận PASS.
DỮ LIỆU GỐC:
${sourceOfTruth}`;
      
      const reviewResult = await callGeminiAPI(ver7Prompt, `BẢN NHÁP CẦN KIỂM DUYỆT:\n${draft}\n\nHãy trả về PASS hoặc FAIL, và lý do.`);
      
      if (reviewResult.includes('FAIL') || reviewResult.includes('fail')) {
        console.error(`🚨 VER-7 ĐÃ TỪ CHỐI BÀI VIẾT: ${kw}. Lý do sai số liệu! Bỏ qua bài này.`);
        continue;
      }
      
      console.log(`✅ VER-7 Báo PASS! Mọi số liệu chính xác 100%.`);
      
      const slug = createSlug(kw);
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      fs.writeFileSync(filePath, draft, 'utf-8');
      
      console.log(`💾 Đã lưu bài viết thành công vào: public/posts/${slug}.md`);
      
    } catch (error) {
      console.error(`❌ Lỗi hệ thống khi xử lý từ khóa ${kw}:`, error.message);
    }
  }

  // Cập nhật lại danh sách từ khóa sau khi viết xong
  fs.writeFileSync(KEYWORDS_FILE, keywords.join('\n'), 'utf-8');
  console.log('\n🏁 QUÁ TRÌNH NHÀ MÁY KẾT THÚC.');
}

runFactory();
