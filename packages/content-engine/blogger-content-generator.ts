import { DraftPayload } from '../connectors/blogger/blogger.types';
import { sanitizeBloggerHtml } from '../policy-engine/blogger-html-policy';
import { enforceBloggerLinks } from '../policy-engine/blogger-link-policy';

export interface ProposedPayload {
  blogId: string;
  title: string;
  htmlBody: string;
  labels?: string[];
}

export function generateBloggerDraftPayload(proposed: ProposedPayload): DraftPayload {
  const sanitized = sanitizeBloggerHtml(proposed.htmlBody);
  const validatedHtml = enforceBloggerLinks(sanitized);

  return {
    blogId: proposed.blogId,
    title: proposed.title,
    sanitizedHtml: validatedHtml,
    labels: proposed.labels,
  };
}

export function createTopicDraftHtml(title: string, facts: any[], referralUrl?: string, intent?: string): string {
  const factClaims = facts.map(f => f.claim).join(' ');
  const linkHtml = referralUrl ? `<a href="${referralUrl}" rel="nofollow noopener noreferrer">xem hướng dẫn chi tiết tại đây</a>` : 'tham khảo thêm trên website';

  let html = `<h2>${title}</h2>\n`;
  html += `<p>Chào mừng bạn đến với bài viết về <strong>${title}</strong>. Nếu bạn đang tìm kiếm thông tin nhanh chóng và chuẩn xác, nội dung dưới đây sẽ giải đáp trực tiếp vấn đề bạn quan tâm.</p>\n`;
  
  if (intent === 'informational') {
    html += `<h3>1. Hướng dẫn thực hiện</h3>\n`;
    if (factClaims) {
      html += `<p>Theo quy định mới nhất từ nhà mạng: ${factClaims}.</p>\n`;
    }
    html += `<p>Bạn có thể ${linkHtml} nếu cần hỗ trợ thêm thao tác.</p>\n`;
    html += `<h3>2. Các lưu ý quan trọng</h3>\n`;
    html += `<ul>\n`;
    html += `  <li>Đảm bảo thực hiện thao tác trên chính số thuê bao của bạn.</li>\n`;
    html += `  <li>Đa phần các thao tác qua tin nhắn đều miễn phí cước viễn thông.</li>\n`;
    html += `  <li>Nếu gặp lỗi, hãy thử khởi động lại máy hoặc chờ vài phút rồi thực hiện lại.</li>\n`;
    html += `</ul>\n`;
  } else {
    html += `<h3>1. Thông tin chi tiết gói cước</h3>\n`;
    if (factClaims) {
      html += `<p>Dữ liệu ưu đãi: ${factClaims}. Bạn có thể ${linkHtml} để nhận ưu đãi.</p>\n`;
    }
    html += `<h3>2. Các bước cài đặt</h3>\n`;
    html += `<ul>\n`;
    html += `  <li>Bước 1: Kiểm tra SIM của bạn có đáp ứng điều kiện không.</li>\n`;
    html += `  <li>Bước 2: Nạp đủ số dư cước phí vào tài khoản chính.</li>\n`;
    html += `  <li>Bước 3: Thực hiện thao tác đăng ký.</li>\n`;
    html += `</ul>\n`;
  }

  html += `<h3>Câu hỏi thường gặp (FAQ)</h3>\n`;
  html += `<h4>Thao tác này có mất phí không?</h4>\n`;
  html += `<p>Các tin nhắn gửi đến tổng đài dịch vụ của nhà mạng đa số là miễn phí cước gửi tin.</p>\n`;
  html += `<h4>Làm sao khi hệ thống báo bận?</h4>\n`;
  html += `<p>Do lưu lượng cao, bạn chỉ cần chờ khoảng 5-10 phút rồi thực hiện lại cú pháp là được.</p>\n`;

  return html;
}
