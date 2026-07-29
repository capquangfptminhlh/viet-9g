import { execSync } from 'child_process';
import { optimizeImages } from '../agents/technical/IMG-13';
import { submitToIndexNow } from '../agents/technical/IDX-14';

/**
 * Tác nhân ORC-0: Nhạc Trưởng Điều Phối Đêm (Nightly Orchestrator)
 * Nhiệm vụ: Chạy tự động vào lúc 0:00 mỗi ngày qua Github Actions hoặc Cron.
 */
async function runNightlyPipeline() {
  console.log(`[ORC-0] Bắt đầu kích hoạt Pipeline Hạm Đội (Nightly Batch) lúc ${new Date().toISOString()}`);

  try {
    // Bước 1: Gọi WRT-4 để sinh bài viết mới (Mô phỏng ở đây, tương lai sẽ nạp module WRT-4)
    console.log(`[ORC-0] Đã phân công WRT-4: Kiểm tra và xuất bản nội dung mới...`);
    // await runContentAgent(); 

    // Bước 2: Build lại toàn bộ hệ thống tĩnh bằng Astro
    console.log(`[ORC-0] Đang gọi lệnh Build kiến trúc Astro (SSG)...`);
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`[ORC-0] Build thành công HTML tĩnh tại thư mục /dist.`);

    // Bước 3: IMG-13 nén toàn bộ kho ảnh mới
    console.log(`[ORC-0] Đánh thức IMG-13 tối ưu ảnh...`);
    await optimizeImages('public', 80);

    // Bước 4: Đẩy Index siêu tốc (IDX-14)
    console.log(`[ORC-0] Kích hoạt IDX-14: Lập chỉ mục siêu tốc...`);
    await submitToIndexNow('tracuugoicuoc.com', 'dist');

    console.log(`\n🎉 [ORC-0] NIGHTLY PIPELINE KẾT THÚC THẮNG LỢI! HỆ THỐNG ĐÃ CẬP NHẬT THEO THỜI GIAN THỰC.`);

  } catch (error: any) {
    console.error(`❌ [ORC-0] Pipeline bị gãy vỡ do sự cố:`, error.message);
    process.exit(1);
  }
}

// Khởi chạy ngay lập tức khi file được thực thi qua tsx
runNightlyPipeline().catch(console.error);
