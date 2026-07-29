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

  console.log('✅ Hoàn tất quá trình Pre-render SSG cho SEO.');
}

generateSSG();
