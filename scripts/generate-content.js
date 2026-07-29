import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file using pure JS (avoiding external dependency)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (key) {
      process.env[key] = val;
    }
  });
}

// Configuration for AI providers and models (rotating list of free models)
const PROVIDERS = [
  {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://tracuugoicuoc.com/',
      'X-Title': 'TraCuuGoiCuoc'
    }),
    models: [
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'openai/gpt-oss-20b:free',
      'inclusionai/ling-3.0-flash:free',
      'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
    ]
  },
  {
    name: 'Nvidia',
    apiKey: process.env.NVIDIA_API_KEY,
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    models: [
      'meta/llama-3.1-8b-instruct',
      'meta/llama-3.3-70b-instruct',
      'google/gemma-3-12b-it',
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'deepseek-ai/deepseek-v4-flash'
    ]
  }
];

// Danh sách từ khóa ngách bao phủ 100% thị trường để lên Top 1
const KEYWORDS = [
  "đăng ký mxh120 viettel",
  "đăng ký mxh150 viettel",
  "đăng ký v120b viettel",
  "đăng ký sd90 viettel",
  "đăng ký sd120 viettel",
  "đăng ký st5k viettel",
  "đăng ký st90k viettel",
  "đăng ký sd135 viettel",
  "đăng ký v200b viettel",
  "đăng ký mxh100 viettel",
  "đăng ký v90b viettel",
  "gói 4g viettel rẻ nhất cho học sinh sinh viên",
  "gói cước 4g viettel không giới hạn dung lượng",
  "gói cước viettel xem tiktok youtube facebook miễn phí data",
  "gói combo viettel data thoại rẻ nhất",
  "cách đăng ký 4g viettel 1 ngày siêu tốc giá rẻ",
  "đăng ký mạng viettel tháng ưu đãi khủng nhất",
  "hướng dẫn hủy gói cước viettel tránh trừ tiền tự động",
  "cú pháp kiểm tra dung lượng data 4g viettel còn lại",
  "lỗi đăng ký 4g viettel không thành công và cách khắc phục",
  "cách đăng ký mạng viettel cho sim mới kích hoạt"
];

// Call API helper
async function callApi(provider, model, prompt) {
  const response = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers(provider.apiKey),
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API returned empty response content.');
  }
  return content;
}

// Generate article with automatic model rotation when congested or rate-limited
async function generateArticleWithRotation(keyword) {
  const prompt = `Bạn là chuyên gia viết bài chuẩn SEO/AEO và tối ưu hóa Answer Engine (Gemini, ChatGPT, Perplexity) số 1 thế giới.
Hãy viết một bài viết toàn diện, chuyên sâu, chuẩn xác bằng tiếng Việt về chủ đề: "${keyword}".

YÊU CẦU CẤU TRÚC BÀI VIẾT (CHUẨN SEO ON-PAGE & AEO):
1. TIÊU ĐỀ (H1): Chứa từ khóa chính "${keyword}", thu hút, kích thích click.
2. ĐOẠN MỞ ĐẦU (SAPO): Dưới 150 từ, cuốn hút, chèn từ khóa chính tự nhiên trong 100 từ đầu tiên. Khẳng định vai trò website là kênh CTV/Đại lý chính thức của Viettel.
3. CHI TIẾT ƯU ĐÃI (H2):
   - Trình bày thông tin ưu đãi dưới dạng bảng Markdown (Tên Gói, Giá Cước, Dung Lượng Data, Gọi Nội Mạng, Gọi Ngoại Mạng, Chu Kỳ).
   - Giải thích chi tiết các ưu đãi và điều kiện đi kèm (nếu hết data tốc độ cao thì dừng truy cập để tránh phát sinh cước phí).
4. HƯỚNG DẪN ĐĂNG KÝ (H2):
   - Đưa ra cú pháp soạn tin nhắn trực diện: Soạn "[Tên Gói] [Mã CTV] gửi 290" (ví dụ: Soạn MXH120 352525287 gửi 290).
   - Nêu rõ: Cước phí gửi tin nhắn đến đầu số 290 là MIỄN PHÍ 100%.
5. PHẦN HỎI ĐÁP (FAQ - H2) (Tối ưu cho AEO):
   - Tạo 3-5 câu hỏi thường gặp dưới dạng các tiêu đề H3 (Ví dụ: "Hủy gói cước X thế nào?", "Kiểm tra dung lượng gói X ra sao?").
   - Trả lời trực diện, ngắn gọn dưới mỗi H3 (dưới 3 dòng), đi thẳng vào câu trả lời để AI dễ dàng trích xuất đưa vào AI Overview.
6. TONE & STYLE: Chuyên nghiệp, trung thực, tin cậy, không phóng đại ("không giới hạn" phải ghi rõ điều kiện hạ băng thông), cấu trúc câu ngắn, dễ đọc trên di động. Viết hoàn toàn bằng định dạng Markdown.`;

  console.log(`\n📝 Bắt đầu tạo bài viết cho từ khóa: "${keyword}"`);

  // Build a flat queue of all available provider-model combinations
  const queue = [];
  for (const provider of PROVIDERS) {
    if (!provider.apiKey) {
      console.warn(`⚠️ Bỏ qua nhà cung cấp ${provider.name} do thiếu API Key.`);
      continue;
    }
    for (const model of provider.models) {
      queue.push({ provider, model });
    }
  }

  if (queue.length === 0) {
    console.error('❌ LỖI: Không có API Key hoặc nhà cung cấp nào được cấu hình trong file .env!');
    process.exit(1);
  }

  // Iterate over models until one succeeds
  for (let i = 0; i < queue.length; i++) {
    const { provider, model } = queue[i];
    console.log(`🤖 [Thử lần ${i + 1}] Sử dụng ${provider.name} | Model: ${model}...`);
    
    try {
      const content = await callApi(provider, model, prompt);
      
      // Save article to file
      const fileName = keyword.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '').replace(/\s+/g, '-') + '.md';
      const filePath = path.join(__dirname, '..', 'public', 'posts', fileName);
      
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
      
      console.log(`✅ THÀNH CÔNG! Bài viết đã lưu tại: ${filePath}`);
      return; // Stop trying other models
    } catch (err) {
      console.error(`❌ Thất bại với model ${model}: ${err.message}`);
      if (i < queue.length - 1) {
        console.log(`👉 Tự động chuyển sang model tiếp theo trong danh sách xoay vòng...`);
      } else {
        console.error(`💥 Tất cả các model và nhà cung cấp đều bị lỗi hoặc nghẽn mạng!`);
      }
    }
  }
}

async function start() {
  for (const kw of KEYWORDS) {
    await generateArticleWithRotation(kw);
    // Cool down for 5 seconds between articles to prevent trigger limits
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

start();
