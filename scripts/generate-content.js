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
      'meta-llama/llama-3-8b-instruct:free',
      'google/gemma-2-9b-it:free',
      'qwen/qwen-2-7b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'microsoft/phi-3-medium-128k-instruct:free'
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
      'meta/llama3-8b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'microsoft/phi-3-mini-128k-instruct'
    ]
  }
];

// List of target keywords to capture
const KEYWORDS = [
  "đăng ký mxh120 viettel",
  "gói cước mxh150 viettel ưu đãi khủng",
  "gói 4g viettel rẻ nhất cho học sinh",
  "hướng dẫn hủy gói cước viettel tránh trừ tiền",
  "cách đăng ký 4g viettel 1 ngày siêu tốc"
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
  const prompt = `Bạn là chuyên gia viết bài chuẩn SEO/AEO số 1 thế giới. 
Hãy viết một bài viết cực kỳ chi tiết, chuẩn xác, hấp dẫn bằng tiếng Việt về chủ đề: "${keyword}".
Yêu cầu bắt buộc:
1. Cấu trúc bài viết phải có H1, H2, H3 rõ ràng, mạch lạc.
2. Bài viết phải có bảng so sánh thông số (giá, data, cuộc gọi) hoặc các bullet points rõ ràng.
3. Phải có phần Hỏi Đáp (FAQ) chi tiết ở cuối bài viết để tối ưu AEO giúp các công cụ AI (Gemini, ChatGPT) dễ trích xuất dữ liệu làm câu trả lời.
4. Viết dưới dạng định dạng Markdown hoàn chỉnh.`;

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
