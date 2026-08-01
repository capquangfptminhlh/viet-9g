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

export function createTopicDraftHtml(title: string, facts: any[], referralUrl?: string): string {
  const factClaims = facts.map(f => f.claim).join(' ');
  const linkHtml = referralUrl ? <a href="${referralUrl}" rel="nofollow noopener noreferrer">đăng ký tại đây</a> : 'tham khảo thêm';

  let html = <h2> + title + </h2>\n;
  html += <p>Chào mừng bạn đến với bài viết chi tiết về <strong> + title + </strong>. Nội dung dưới đây được tổng hợp chuyên sâu để giúp bạn nắm bắt ngay thông tin chính xác nhất.</p>\n;
  
  html += <h3>1. Thông tin chi tiết</h3>\n;
  if (factClaims) {
    html += <p>Theo thông tin mới nhất:  + factClaims + . Bạn có thể  + linkHtml +  để nhận ưu đãi.</p>\n;
  } else {
    html += <p>Hiện chưa có thông số cụ thể cho gói này, nhưng bạn có thể  + linkHtml +  để biết chi tiết.</p>\n;
  }

  html += <h3>2. Hướng dẫn cài đặt</h3>\n;
  html += <ul>\n;
  html +=   <li>Bước 1: Kiểm tra SIM của bạn đã hỗ trợ 4G/5G chưa.</li>\n;
  html +=   <li>Bước 2: Nạp đủ tiền vào tài khoản chính (trước khi đăng ký).</li>\n;
  html +=   <li>Bước 3: Thực hiện thao tác đăng ký qua SMS hoặc link  + linkHtml + .</li>\n;
  html +=   <li>Bước 4: Khởi động lại điện thoại để cập nhật lưu lượng mạng.</li>\n;
  html += </ul>\n;
  
  html += <h3>3. Lưu ý khi sử dụng</h3>\n;
  html += <p>Dữ liệu sẽ được gia hạn tự động sau 30 ngày. Hãy kiểm tra lưu lượng thường xuyên qua ứng dụng MyViettel để tránh phát sinh cước ngoài ý muốn.</p>\n;

  html += <h3>Câu hỏi thường gặp (FAQ)</h3>\n;
  html += <h4>Gói cước có tự động gia hạn không?</h4>\n;
  html += <p>Có, đa số các gói cước sẽ tự động gia hạn khi hết chu kỳ nếu tài khoản còn đủ số dư.</p>\n;
  html += <h4>Làm sao để hủy gia hạn?</h4>\n;
  html += <p>Bạn có thể soạn tin nhắn HUY gửi tổng đài tương ứng hoặc thao tác trực tiếp trên ứng dụng quản lý.</p>\n;

  return html;
}
