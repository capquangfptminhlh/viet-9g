import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceDir = path.join(__dirname, '..');

// Danh sách các file/thư mục KHÔNG COPY sang dự án mới
const IGNORE_LIST = [
  '.git',
  'node_modules',
  'dist',
  '.env',
  'src/content/posts', // Xóa sạch bài viết cũ
  'public/images'      // Xóa sạch ảnh cũ
];

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  const items = fs.readdirSync(from);
  for (const item of items) {
    const fromPath = path.join(from, item);
    const relativePath = path.relative(sourceDir, fromPath).replace(/\\/g, '/');

    // Bỏ qua các mục trong IGNORE_LIST
    if (IGNORE_LIST.some(ignore => relativePath === ignore || relativePath.startsWith(ignore + '/'))) {
      continue;
    }

    const toPath = path.join(to, item);
    const stat = fs.statSync(fromPath);

    if (stat.isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

function startReplication() {
  const args = process.argv.slice(2);
  const targetName = args[0];

  if (!targetName) {
    console.log("❌ Vui lòng nhập tên thư mục dự án vệ tinh. Ví dụ: node scripts/replicate-pbn.js viettel-genz");
    process.exit(1);
  }

  const targetDir = path.resolve(sourceDir, '..', targetName);
  
  if (fs.existsSync(targetDir)) {
    console.log(`❌ Thư mục ${targetDir} đã tồn tại! Vui lòng chọn tên khác.`);
    process.exit(1);
  }

  console.log(`🚀 Đang clone bộ não gốc sang vệ tinh mới: ${targetName}...`);
  copyFolderSync(sourceDir, targetDir);

  // Cập nhật package.json
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = targetName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  // Tái tạo thư mục rỗng cần thiết
  fs.mkdirSync(path.join(targetDir, 'src', 'content', 'posts'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'public', 'images'), { recursive: true });

  console.log(`✅ Hoàn tất! Vệ tinh đã được tạo tại: ${targetDir}`);
  console.log(`👉 Để khởi chạy vệ tinh này, hãy cd vào ${targetName} và chạy npm install`);
}

startReplication();
