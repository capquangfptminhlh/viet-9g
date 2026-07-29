import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

console.log('=== Milestone 2 Verification Script ===');
console.log(`Project Root: ${projectRoot}`);

let passes = 0;
let fails = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passes++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    fails++;
  }
}

// 1. Verify Tap Targets in Component Source Files
const componentsToVerify = [
  {
    filePath: 'src/components/Header.tsx',
    checks: [
      { name: 'Mobile menu toggle button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*min-w-\[48px\][^"]*"[^>]*aria-label="Toggle menu"/ },
      { name: 'Mobile Zalo button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*bg-blue-600/ },
      { name: 'Mobile Hotline button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*bg-\[#D71920\]/ },
      { name: 'Mobile menu links min-h-[48px]', pattern: /className={`w-full min-h-\[48px\]/ }
    ]
  },
  {
    filePath: 'src/components/PackageCard.tsx',
    checks: [
      { name: 'Chi Tiết button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*Chi Tiết/ },
      { name: 'Đăng Ký button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*Đăng Ký/ }
    ]
  },
  {
    filePath: 'src/components/FaqAccordion.tsx',
    checks: [
      { name: 'Accordion trigger button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"/ }
    ]
  },
  {
    filePath: 'src/components/HeroCarousel.tsx',
    checks: [
      { name: 'Đăng Ký Ngay CTA min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*Đăng Ký Ngay/ },
      { name: 'Hỏi Đại Lý Zalo CTA min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*<PhoneCall[^>]*\/>\s*Hỏi Đại Lý/ },
      { name: 'Slider prev arrow min-h-[48px]', pattern: /<button[^>]*aria-label="Slide trước"[^>]*min-h-\[48px\]|<button[^>]*min-h-\[48px\][^>]*aria-label="Slide trước"/ },
      { name: 'Slider next arrow min-h-[48px]', pattern: /<button[^>]*aria-label="Slide sau"[^>]*min-h-\[48px\]|<button[^>]*min-h-\[48px\][^>]*aria-label="Slide sau"/ }
    ]
  },
  {
    filePath: 'src/components/PackageModal.tsx',
    checks: [
      { name: 'Close button min-h-[48px]', pattern: /<button[^>]*aria-label="Đóng"[^>]*min-h-\[48px\]|<button[^>]*min-h-\[48px\][^>]*aria-label="Đóng"/ },
      { name: 'SMS Tab min-h-[48px]', pattern: /className={`flex-1 py-3\.5 px-2\.5 min-h-\[48px\]/ },
      { name: 'Copy Syntax button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*{copied/ },
      { name: 'Send SMS link min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*<ExternalLink[^>]*\/>\s*Gửi SMS Đăng Ký Ngay/ },
      { name: 'Footer Close button min-h-[48px]', pattern: /className="[^"]*min-h-\[48px\][^"]*"[^>]*>\s*Đóng Lại/ },
      { name: 'QR Image lazy loading & async decoding', pattern: /loading="lazy"\s*decoding="async"/ }
    ]
  },
  {
    filePath: 'src/components/Footer.tsx',
    checks: [
      { name: 'Policy links min-h-[48px]', pattern: /min-h-\[48px\] inline-flex items-center/ }
    ]
  }
];

console.log('\n--- 1. Checking Tap Target Classes in Component Files ---');
for (const comp of componentsToVerify) {
  const fullPath = path.join(projectRoot, comp.filePath);
  if (!fs.existsSync(fullPath)) {
    assert(false, `File not found: ${comp.filePath}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  for (const check of comp.checks) {
    const matched = check.pattern.test(content);
    assert(matched, `${comp.filePath}: ${check.name}`);
  }
}

// 2. Check Static Image & WebP Audit
console.log('\n--- 2. Static Image & WebP Asset Audit ---');
const publicDir = path.join(projectRoot, 'public');
const assetsDir = path.join(projectRoot, 'src/assets');
let imageFiles = [];

function scanImages(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(f.toString())) {
      imageFiles.push(path.join(dir, f.toString()));
    }
  }
}

scanImages(publicDir);
scanImages(assetsDir);
assert(imageFiles.length === 0, `Static raster/vector image assets count in source tree: ${imageFiles.length} (Icons are inline JSX/lucide-react components)`);

// 3. Verify Dist Build Output
console.log('\n--- 3. Verifying Build Output Directory (dist/) ---');
const distHtml = path.join(projectRoot, 'dist/index.html');
assert(fs.existsSync(distHtml), 'dist/index.html exists');

const distAssetsDir = path.join(projectRoot, 'dist/assets');
if (fs.existsSync(distAssetsDir)) {
  const assets = fs.readdirSync(distAssetsDir);
  const hasJs = assets.some(a => a.endsWith('.js'));
  const hasCss = assets.some(a => a.endsWith('.css'));
  assert(hasJs, 'dist/assets/ contains JS bundle');
  assert(hasCss, 'dist/assets/ contains CSS stylesheet');
} else {
  assert(false, 'dist/assets/ directory exists');
}

console.log(`\n=== Verification Summary ===`);
console.log(`Total Checks Passed: ${passes}`);
console.log(`Total Checks Failed: ${fails}`);

if (fails > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MILESTONE 2 VERIFICATION CHECKS PASSED!');
  process.exit(0);
}
