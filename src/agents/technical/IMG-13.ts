import { glob } from 'glob';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Tác nhân IMG-13: Chuyên viên Tối ưu Hình ảnh (Image Optimization Agent)
 * Nhiệm vụ: Tự động quét toàn bộ kho ảnh tĩnh, chuyển đổi sang WebP để tối ưu tốc độ tải trang trên di động.
 */
export async function optimizeImages(directory: string = 'public', quality: number = 80) {
  console.log(`[IMG-13] Bắt đầu quét hình ảnh tĩnh trong thư mục: ${directory}...`);
  
  const files = await glob(`${directory}/**/*.{png,jpg,jpeg,PNG,JPG,JPEG}`);
  
  if (files.length === 0) {
    console.log(`[IMG-13] Không tìm thấy hình ảnh nào cần tối ưu.`);
    return;
  }

  console.log(`[IMG-13] Tìm thấy ${files.length} ảnh. Bắt đầu quá trình nén WebP...`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let successCount = 0;

  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      totalOriginalSize += stats.size;

      const parsedPath = path.parse(file);
      // Giữ nguyên thư mục gốc, chỉ đổi đuôi
      const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

      await sharp(file)
        .webp({ quality })
        .toFile(outputPath);

      const newStats = await fs.stat(outputPath);
      totalOptimizedSize += newStats.size;

      // Xóa file cũ
      await fs.unlink(file);
      
      console.log(` ✅ Tối ưu: ${parsedPath.base} -> ${parsedPath.name}.webp (-${((1 - newStats.size/stats.size) * 100).toFixed(1)}%)`);
      successCount++;
    } catch (err: any) {
      console.error(` ❌ Lỗi khi tối ưu ${file}:`, err.message);
    }
  }

  const savedMB = ((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2);
  console.log(`[IMG-13] Hoàn tất! Tối ưu thành công ${successCount}/${files.length} ảnh.`);
  console.log(`[IMG-13] Tổng dung lượng tiết kiệm được: ${savedMB} MB.`);
}

// Export only
