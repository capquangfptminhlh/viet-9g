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

export function createTopicDraftHtml(title: string, facts: any[], referralUrl?: string, intent?: string, reviewData?: any): string {
  const factClaims = facts.map(f => f.claim).join(' ');
  const linkHtml = referralUrl ? `<a href="${referralUrl}" rel="nofollow noopener noreferrer">xem hướng dẫn chi tiết tại đây</a>` : 'tham khảo thêm trên website';

  let html = `<h2>${title}</h2>\n`;
  
  if (intent === 'cancellation') {
    html += `<h3>1. Hướng dẫn thực hiện</h3>\n`;
    if (factClaims) {
      html += `<p>Theo hướng dẫn của Viettel, tùy gói cước ${factClaims}.</p>\n`;
    }
    html += `<p>Bạn có thể ${linkHtml} nếu cần hỗ trợ thêm thao tác.</p>\n`;
    html += `<h3>2. Các lưu ý quan trọng</h3>\n`;
    html += `<ul>\n`;
    html += `  <li>Đảm bảo thực hiện thao tác trên chính số thuê bao của bạn.</li>\n`;
    html += `  <li><strong>Cảnh báo:</strong> Hủy hoàn toàn gói cước có thể làm mất ưu đãi/data còn lại. Chỉ nên thao tác hủy nếu bạn chắc chắn không còn nhu cầu sử dụng.</li>\n`;
    html += `  <li>Luôn đọc kỹ và làm theo tin nhắn (SMS) xác nhận phản hồi từ tổng đài.</li>\n`;
    html += `</ul>\n`;
    html += `<h3>Câu hỏi thường gặp (FAQ)</h3>\n`;
    html += `<h4>Thao tác này có mất phí không?</h4>\n`;
    html += `<p>Các tin nhắn gửi đến tổng đài dịch vụ của nhà mạng đa số là miễn phí cước gửi tin.</p>\n`;
    html += `<h4>Làm sao khi hệ thống báo lỗi hoặc không phản hồi?</h4>\n`;
    html += `<p>Hãy kiểm tra lại SMS phản hồi từ hệ thống để xem chi tiết lỗi, hoặc liên hệ trực tiếp tổng đài 198 (miễn phí) để được hỗ trợ kịp thời.</p>\n`;
  } else if (intent === 'informational') {
    html += `<h3>1. Hướng dẫn thực hiện</h3>\n`;
    if (factClaims) {
      html += `<p>${factClaims}</p>\n`;
    }
    html += `<p>Bạn có thể ${linkHtml} để xem chi tiết các bước.</p>\n`;
    html += `<h3>Câu hỏi thường gặp (FAQ)</h3>\n`;
    html += `<h4>Thao tác trên app My Viettel được không?</h4>\n`;
    html += `<p>Có, bạn hoàn toàn có thể đăng nhập vào ứng dụng My Viettel để tra cứu các thông tin liên quan thay vì thao tác qua SMS hay USSD.</p>\n`;
    html += `<h4>Tại sao kết quả trả về bị chậm?</h4>\n`;
    html += `<p>Vào những khung giờ cao điểm, hệ thống có thể cần thêm vài phút để xử lý yêu cầu của bạn. Xin vui lòng kiên nhẫn.</p>\n`;
  } else if (intent === 'review') {
    if (!reviewData || !reviewData.pros || !reviewData.cons || !reviewData.suitableFor || !reviewData.considerations) {
      throw new Error('Missing structured reviewData (pros, cons, suitableFor, considerations) for review intent');
    }
    html += `<h3>1. Thông tin tổng quan</h3>\n`;
    if (factClaims) {
      html += `<p>${factClaims}</p>\n`;
    }
    html += `<h3>2. Đánh giá ưu và nhược điểm</h3>\n`;
    html += `<h4>Ưu điểm:</h4>\n<ul>\n`;
    reviewData.pros.forEach((p: string) => { html += `  <li>${p}</li>\n`; });
    html += `</ul>\n<h4>Nhược điểm:</h4>\n<ul>\n`;
    reviewData.cons.forEach((c: string) => { html += `  <li>${c}</li>\n`; });
    html += `</ul>\n`;
    html += `<h3>3. Ai nên dùng gói cước này?</h3>\n`;
    html += `<p>${reviewData.suitableFor}</p>\n`;
    html += `<h3>4. Điểm cần cân nhắc</h3>\n`;
    html += `<p>${reviewData.considerations} Bạn có thể ${linkHtml} để biết thêm chi tiết.</p>\n`;
    html += `<h3>Câu hỏi thường gặp (FAQ)</h3>\n`;
    html += `<h4>Gói cước có tự động gia hạn không?</h4>\n`;
    html += `<p>Thông thường các gói cước data của Viettel đều có tính năng tự động gia hạn sau khi hết chu kỳ nếu tài khoản chính đủ số dư.</p>\n`;
  } else {
    html += `<h3>1. Thông tin chi tiết</h3>\n`;
    html += `<p>${factClaims}</p>\n`;
  }

  return html;
}
