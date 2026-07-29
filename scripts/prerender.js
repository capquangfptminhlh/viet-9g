import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const PACKAGES_FILE = path.join(__dirname, '..', 'src', 'data', 'packages.ts');

function extractData() {
  const content = fs.readFileSync(PACKAGES_FILE, 'utf-8');
  
  // Rất cẩn thận lấy mảng FAQS
  const faqsRegex = /export const FAQS:\s*FAQItem\[\]\s*=\s*\[([\s\S]*?)\];/;
  const faqsMatch = content.match(faqsRegex);
  let faqs = [];
  if (faqsMatch) {
    // Chuyển mảng string JS thành Object
    const faqString = faqsMatch[0].replace('export const FAQS: FAQItem[] = ', '').replace(/;$/, '');
    faqs = eval(faqString);
  }

  // Cực kì đơn giản, ta sẽ dùng JSON-LD tĩnh cho các gói cước để tiêm vào thẻ <head>
  // Ta trích xuất bằng RegExp các id, name, price, description
  const packages = [];
  const pkgRegex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*price:\s*(\d+),\s*duration:\s*'([^']+)',\s*dataLimit:\s*'([^']+)'(?:.|\n)*?description:\s*'([^']+)'/g;
  
  let match;
  while ((match = pkgRegex.exec(content)) !== null) {
    packages.push({
      id: match[1],
      name: match[2],
      price: parseInt(match[3], 10),
      duration: match[4],
      dataLimit: match[5],
      description: match[6]
    });
  }

  return { packages, faqs };
}

function generateSSG() {
  console.log('🔄 Bắt đầu sinh HTML tĩnh (SSG) cho 17 Pillar Pages...');

  if (!fs.existsSync(INDEX_HTML)) {
    console.error('❌ Không tìm thấy dist/index.html. Hãy chạy vite build trước.');
    return;
  }

  const baseHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
  const { packages, faqs } = extractData();

  // Tạo JSON-LD cho FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  packages.forEach(pkg => {
    const pkgDir = path.join(DIST_DIR, 'goi-cuoc', pkg.id);
    fs.mkdirSync(pkgDir, { recursive: true });

    // Sinh HTML SEO thô (Whitehat)
    const title = `Đăng ký gói ${pkg.name} Viettel - ${pkg.dataLimit}/${pkg.duration}`;
    const seoHtml = `
      <div id="seo-content" style="opacity: 0; position: absolute; z-index: -1;">
        <h1>Hướng dẫn đăng ký gói cước ${pkg.name} mạng Viettel</h1>
        <p>${pkg.description}</p>
        <table border="1">
          <tr><th>Tên gói</th><td>${pkg.name}</td></tr>
          <tr><th>Giá cước</th><td>${pkg.price.toLocaleString('vi-VN')} VNĐ</td></tr>
          <tr><th>Lưu lượng</th><td>${pkg.dataLimit}</td></tr>
          <tr><th>Chu kỳ</th><td>${pkg.duration}</td></tr>
          <tr><th>Cú pháp SMS</th><td>${pkg.name} DA gửi 290</td></tr>
        </table>
      </div>
    `;

    const schemaLd = `
      <script type="application/ld+json">
        ${JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": `Gói cước 4G ${pkg.name} Viettel`,
          "description": pkg.description,
          "offers": {
            "@type": "Offer",
            "url": `https://tracuugoicuoc.com/goi-cuoc/${pkg.id}`,
            "priceCurrency": "VND",
            "price": pkg.price
          }
        })}
      </script>
      <script type="application/ld+json">
        ${JSON.stringify(faqSchema)}
      </script>
    `;

    // Thay thế Title và chèn Schema + SEO HTML vào HTML tĩnh
    let pageHtml = baseHtml.replace('<title>Đăng ký 4G Viettel</title>', `<title>${title}</title>`);
    pageHtml = pageHtml.replace('</head>', `${schemaLd}</head>`);
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${seoHtml}</div>`);

    fs.writeFileSync(path.join(pkgDir, 'index.html'), pageHtml, 'utf-8');
    console.log(`✅ Đã render SSG: /goi-cuoc/${pkg.id}`);
  });

  // Render HTML tĩnh cho TRANG CHỦ (Homepage)
  const homeSeoHtml = `
    <div id="seo-content" style="opacity: 0; position: absolute; z-index: -1;">
      <h1>Tra Cứu & Đăng Ký Gói Cước 4G/5G Viettel Mới Nhất 2026</h1>
      <p>Chào mừng bạn đến với Cổng thông tin tra cứu và đăng ký gói cước mạng Viettel chính thức qua tổng đài 290. Dưới đây là danh sách các gói data, combo gọi thoại giá rẻ cực hot:</p>
      <h2>Danh sách các gói cước Viettel tiêu biểu</h2>
      <ul>
        ${packages.map(p => `<li><strong>Gói ${p.name}</strong>: ${p.price.toLocaleString('vi-VN')}đ/ ${p.duration} - Có ${p.dataLimit} Data. Cú pháp: ${p.name} DA gửi 290</li>`).join('\n        ')}
      </ul>
    </div>
  `;
  const homeHtml = baseHtml.replace('<div id="root"></div>', `<div id="root">${homeSeoHtml}</div>`);
  fs.writeFileSync(INDEX_HTML, homeHtml, 'utf-8');
  console.log('✅ Đã render SSG cho Trang Chủ (Homepage).');

  console.log('✅ Hoàn tất quá trình Pre-render SSG cho 17 Pillar Pages.');
}

// ==========================================
// 4. SSG PRERENDER CHO CÁC BÀI VIẾT MARKDOWN
// ==========================================
import { marked } from 'marked';

async function prerenderMarkdownPosts() {
  const POSTS_DIR = path.join(__dirname, '..', 'public', 'posts');
  const POSTS_OUTPUT_DIR = path.join(DIST_DIR, 'posts');
  
  if (!fs.existsSync(POSTS_DIR)) return;
  fs.mkdirSync(POSTS_OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) return;

  console.log(`🔄 Bắt đầu sinh HTML tĩnh cho ${files.length} bài Markdown...`);
  
  if (!fs.existsSync(INDEX_HTML)) {
    console.error('❌ Không tìm thấy dist/index.html. Hãy chạy vite build trước.');
    return;
  }
  const baseHtml = fs.readFileSync(INDEX_HTML, 'utf-8');

  for (const file of files) {
    const slug = file.replace('.md', '');
    const mdContent = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    
    // Parse Markdown to HTML
    const htmlSnippet = await marked.parse(mdContent);

    // Tiêm vào thẻ <div id="markdown-seo-content">
    let newHtml = baseHtml.replace(
      '<div id="markdown-seo-content" className="hidden"></div>',
      `<div id="markdown-seo-content" class="hidden">${htmlSnippet}</div>`
    );

    // Bổ sung Title cho bài viết (lấy từ H1 đầu tiên)
    const titleMatch = mdContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      const pageTitle = `${titleMatch[1]} - Tracuugoicuoc`;
      newHtml = newHtml.replace(
        /<title>.*<\/title>/,
        `<title>${pageTitle}</title>`
      );
    }

    const outputPath = path.join(POSTS_OUTPUT_DIR, `${slug}.html`);
    fs.writeFileSync(outputPath, newHtml, 'utf-8');
    console.log(`✅ Đã render SSG bài viết: /posts/${slug}`);
  }
  console.log('✅ Hoàn tất quá trình Pre-render SSG cho Markdown Posts.');
}

// Run all Prerender tasks sequentially
async function runAll() {
  generateSSG();
  await prerenderMarkdownPosts();
}

runAll();
