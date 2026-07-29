import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const AUDIT_DIR = path.join(__dirname, '..', 'state', 'audit');

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (filePath.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function runAudit() {
  console.log('🔍 [AUD-21] Bắt đầu Kiểm toán SEO sau Build...');
  const htmlFiles = scanDirectory(DIST_DIR);
  
  let totalPages = htmlFiles.length;
  let missingTitles = 0;
  let missingMeta = 0;
  let schemaErrors = 0;
  let linkErrors = 0; // Simplified internal broken link count

  const titles = new Set();
  let duplicateTitles = 0;

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check title
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch) {
      missingTitles++;
    } else {
      const titleStr = titleMatch[1];
      if (titles.has(titleStr) && !file.includes('index.html')) {
        duplicateTitles++;
      }
      titles.add(titleStr);
    }

    // Check meta desc
    if (!content.includes('name="description"')) missingMeta++;

    // Basic JSON-LD schema check
    if (!content.includes('application/ld+json')) schemaErrors++;

    // Basic broken internal link check (Catch empty hrefs or undefined)
    if (content.includes('href="undefined"') || content.includes('href=""')) linkErrors++;
  }

  const score = 100 - (missingTitles * 5) - (missingMeta * 5) - (schemaErrors * 5) - (linkErrors * 10) - (duplicateTitles * 5);
  const finalScore = score < 0 ? 0 : score;

  const report = {
    timestamp: new Date().toISOString(),
    pagesScanned: totalPages,
    seoScore: finalScore,
    issues: {
      missingTitles,
      missingMetaDescription: missingMeta,
      schemaMissing: schemaErrors,
      brokenLinksDetected: linkErrors,
      duplicateTitles
    }
  };

  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const dateStr = new Date().toISOString().split('T')[0];
  const reportPath = path.join(AUDIT_DIR, `${dateStr}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  console.log(`📊 Đã quét ${totalPages} trang tĩnh.`);
  if (finalScore >= 90) {
    console.log(`✅ Điểm SEO Xuất Sắc: ${finalScore}/100. Không phát hiện lỗi nghiêm trọng.`);
  } else {
    console.log(`⚠️ Cảnh báo SEO: Điểm số chỉ đạt ${finalScore}/100. Xem chi tiết tại state/audit/${dateStr}.json`);
  }
}

runAudit();
