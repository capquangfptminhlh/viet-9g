import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';

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

// Danh sách 7 Gemini API Keys
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7
].filter(Boolean); // Bỏ qua key bị undefined

// Configuration for AI providers and models (rotating list of free models)
const PROVIDERS = [
  {
    name: 'Gemini',
    apiKeys: GEMINI_KEYS,
    url: (model, key) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    headers: () => ({
      'Content-Type': 'application/json'
    }),
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    ]
  },
  {
    name: 'OpenRouter',
    apiKeys: [process.env.OPENROUTER_API_KEY].filter(Boolean),
    url: () => 'https://openrouter.ai/api/v1/chat/completions',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://tracuugoicuoc.com/',
      'X-Title': 'TraCuuGoiCuoc'
    }),
    models: [
      'google/gemma-2-9b-it:free'
    ]
  }
];

// Danh sách từ khóa ngách bao phủ 100% thị trường để lên Top 1
// Đọc danh sách từ khóa tự động từ file data/keywords.txt (hoặc fallback nếu không có file)
let KEYWORDS = [
  "đăng ký mxh150 viettel",
  "đăng ký sd90 viettel",
  "đăng ký sd120 viettel",
  "đăng ký st5k viettel",
  "đăng ký st90k viettel",
  "đăng ký sd135 viettel",
  "đăng ký v200b viettel",
  "đăng ký mxh100 viettel",
  "đăng ký v90b viettel"
];

const keywordsFilePath = path.join(__dirname, '..', 'data', 'keywords.txt');
if (fs.existsSync(keywordsFilePath)) {
  const fileKw = fs.readFileSync(keywordsFilePath, 'utf-8')
    .split('\n')
    .map(kw => kw.trim())
    .filter(kw => kw && !kw.startsWith('#'));
  if (fileKw.length > 0) {
    KEYWORDS = fileKw;
    console.log(`📚 Đã nạp thành công ${KEYWORDS.length} từ khóa từ file data/keywords.txt`);
  }
}

// Call API helper
async function callApi(provider, model, apiKey, prompt) {
  let requestBody;
  let url = provider.url(model, apiKey);

  if (provider.name === 'Gemini') {
    requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };
  } else {
    requestBody = {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: provider.headers(apiKey),
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  let content = '';

  if (provider.name === 'Gemini') {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  } else {
    content = data.choices?.[0]?.message?.content;
  }

  if (!content) {
    throw new Error('API returned empty response content.');
  }
  return content;
}

// Generate banner using sharp
async function generateBanner(keyword, fileNamePrefix) {
  const packageMatch = keyword.match(/đăng ký ([a-z0-9]+)/i);
  const packageName = packageMatch ? packageMatch[1].toUpperCase() : 'VIETTEL';
  
  const width = 1200;
  const height = 630;
  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EE0033" />
          <stop offset="100%" stop-color="#880011" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="50%" y="35%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">CÚ PHÁP ĐĂNG KÝ</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="160" font-weight="900" fill="#FFD700" text-anchor="middle">GÓI ${packageName}</text>
      <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">SOẠN: ${packageName} GB GỬI 290</text>
    </svg>
  `;

  const bannerPath = path.join(__dirname, '..', 'public', 'images', `${fileNamePrefix}.jpg`);
  fs.mkdirSync(path.dirname(bannerPath), { recursive: true });
  
  await sharp(Buffer.from(svgImage))
    .jpeg({ quality: 90 })
    .toFile(bannerPath);
    
  console.log(`🎨 Đã tạo banner ảnh: ${bannerPath}`);
}

// Generate article with automatic model rotation when congested or rate-limited
async function generateArticleWithRotation(keyword) {
  const fileName = keyword.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '').replace(/\s+/g, '-') + '.md';
  const filePath = path.join(__dirname, '..', 'src', 'content', 'posts', fileName);
  
  if (fs.existsSync(filePath)) {
    console.log(`⏭️ Bài viết "${keyword}" đã tồn tại. Bỏ qua.`);
    return null;
  }

  // Generate banner first
  await generateBanner(keyword, path.parse(fileName).name);

  const prompt = `Bạn là chuyên gia viết bài chuẩn SEO/AEO và tối ưu hóa Answer Engine (Gemini, ChatGPT, Perplexity) số 1 thế giới.
Hãy viết một bài viết toàn diện, chuyên sâu, chuẩn xác bằng tiếng Việt về chủ đề: "${keyword}".

YÊU CẦU QUAN TRỌNG NHẤT:
1. Bạn phải bắt đầu bài viết bằng Frontmatter YAML như sau:
---
title: "BÀI VIẾT VỀ ${keyword.toUpperCase()}"
description: "Hướng dẫn ${keyword} nhanh nhất."
pubDate: "${new Date().toISOString()}"
author: "Antigravity AI"
tags: ["viettel", "goi-cuoc"]
---

2. Ngay bên dưới dòng tiêu đề (H1), bạn PHẢI chèn chính xác thẻ ảnh Markdown này:
![Đăng ký ${keyword}](/images/${path.parse(fileName).name}.jpg)

YÊU CẦU CẤU TRÚC BÀI VIẾT (CHUẨN SEO ON-PAGE & AEO):
1. TIÊU ĐỀ (H1): Chứa từ khóa chính "${keyword}", thu hút, kích thích click.
2. ĐOẠN MỞ ĐẦU (SAPO): Dưới 150 từ, cuốn hút, chèn từ khóa chính tự nhiên trong 100 từ đầu tiên. Khẳng định vai trò website là kênh CTV/Đại lý chính thức của Viettel.
3. CHI TIẾT ƯU ĐÃI (H2):
   - Trình bày thông tin ưu đãi dưới dạng bảng Markdown (Tên Gói, Giá Cước, Dung Lượng Data, Gọi Nội Mạng, Gọi Ngoại Mạng, Chu Kỳ).
   - Giải thích chi tiết các ưu đãi và điều kiện đi kèm.
4. HƯỚNG DẪN ĐĂNG KÝ (H2):
   - Đưa ra cú pháp soạn tin nhắn trực diện: Soạn "[Tên Gói] GB gửi 290" (ví dụ: Soạn MXH120 GB gửi 290) CHÚ Ý: MÃ ĐẠI LÝ BẮT BUỘC LÀ "GB".
   - Nêu rõ: Cước phí gửi tin nhắn đến đầu số 290 là MIỄN PHÍ 100%.
5. PHẦN HỎI ĐÁP (FAQ - H2) (Tối ưu cho AEO):
   - Tạo 3-5 câu hỏi thường gặp dưới dạng các tiêu đề H3.
   - Trả lời trực diện, ngắn gọn dưới mỗi H3 (dưới 3 dòng), đi thẳng vào câu trả lời.
6. TONE & STYLE: Chuyên nghiệp, trung thực, tin cậy, không phóng đại ("không giới hạn" phải ghi rõ điều kiện hạ băng thông), cấu trúc câu ngắn, dễ đọc trên di động. Viết hoàn toàn bằng định dạng Markdown.`;

  console.log(`\n📝 Bắt đầu tạo bài viết cho từ khóa: "${keyword}"`);

  // Build a flat queue of all available provider-model-key combinations
  const queue = [];
  for (const provider of PROVIDERS) {
    if (!provider.apiKeys || provider.apiKeys.length === 0) {
      console.warn(`⚠️ Bỏ qua nhà cung cấp ${provider.name} do thiếu API Key.`);
      continue;
    }
    for (const key of provider.apiKeys) {
      for (const model of provider.models) {
        queue.push({ provider, model, apiKey: key });
      }
    }
  }

  if (queue.length === 0) {
    console.error('❌ LỖI: Không có API Key hoặc nhà cung cấp nào được cấu hình trong file .env!');
    process.exit(1);
  }

  // Iterate over models/keys until one succeeds
  for (let i = 0; i < queue.length; i++) {
    const { provider, model, apiKey } = queue[i];
    const keyMasked = apiKey.substring(0, 8) + '...';
    console.log(`🤖 [Thử lần ${i + 1}] Sử dụng ${provider.name} | Model: ${model} | Key: ${keyMasked}`);
    
    try {
      const content = await callApi(provider, model, apiKey, prompt);
      
      // Save article to file in src/content/posts
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
      
      console.log(`✅ THÀNH CÔNG! Bài viết đã lưu tại: ${filePath}`);
      return filePath; // Stop trying other models and return path
    } catch (err) {
      console.error(`❌ Thất bại với model ${model} (Key: ${keyMasked}): ${err.message}`);
      if (i < queue.length - 1) {
        console.log(`👉 Tự động chuyển sang Key/Model tiếp theo trong danh sách xoay vòng...`);
      } else {
        console.error(`💥 Tất cả các key và model đều bị lỗi hoặc nghẽn mạng!`);
      }
    }
  }
  return null;
}

async function start() {
  // Tìm keyword chưa được viết
  let targetKw = null;
  for (const kw of KEYWORDS) {
    const fileName = kw.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '').replace(/\s+/g, '-') + '.md';
    const filePath = path.join(__dirname, '..', 'src', 'content', 'posts', fileName);
    if (!fs.existsSync(filePath)) {
      targetKw = kw;
      break;
    }
  }

  if (!targetKw) {
    console.log("🎉 Đã viết xong toàn bộ keyword trong danh sách!");
    return;
  }

  const filePath = await generateArticleWithRotation(targetKw);
  
  if (filePath) {
    console.log(`🚀 Tiến hành Auto Publish lên GitHub...`);
    try {
      execSync('git add .');
      execSync('git commit -m "content: auto publish bài mới ' + targetKw + ' kèm banner"');
      execSync('git push origin main');
      console.log(`✅ Đã push thành công lên GitHub! Vercel sẽ tự động build.`);
    } catch (e) {
      console.error(`❌ Lỗi khi push lên GitHub:`, e.message);
    }
  }
}

start();

