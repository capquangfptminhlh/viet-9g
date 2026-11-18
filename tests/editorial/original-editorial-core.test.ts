import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  findOfficialArticleLinks,
  isOfficialViettelUrl,
  renderOriginalEditorialSvg,
  validateOriginalDraft,
} from '../../scripts/original-editorial-core.mjs';

const officialUrl = 'https://098.viettel.vn/tin-tuc/chi-tiet/huong-dan-moi-nhat-cach-bat-mang-5g-viettel-cho-dien-thoai-smartphone/16290128';
const quoteA = 'Trên giao diện di động click vào sim “Viettel” →Chọn “Thoại & dữ liệu” → Chọn “5G tự động”.';
const quoteB = 'Đối với các dòng máy khác, Quý khách vui lòng bật chế độ 5G trên máy, thao tác trong mục “Cài đặt thiết bị”';

function substantiveDraft() {
  const markdown = readFileSync(
    'src/content/posts/iphone-viettel-khong-thay-cuoc-goi-wifi-calling.md', 'utf8',
  ).replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gu, '$1') +
    '\n\n[Nguồn chính thức](' + officialUrl + ')';
  return {
    title: 'Hướng dẫn xác định tùy chọn mạng trong điện thoại khi sử dụng Viettel',
    slug: 'huong-dan-xac-dinh-tuy-chon-mang-viettel',
    description: 'Phân tích các bước kiểm tra cấu hình mạng điện thoại, phân biệt các trường hợp và cách xác minh với nhà mạng.',
    markdown,
    evidenceQuotes: [quoteA, quoteB],
    visualSteps: ['Mở cài đặt mạng', 'Chọn đúng SIM', 'Kiểm tra kết nối'],
  };
}
const sourceText = quoteA + '.\n' + quoteB + '.';

describe('AI editorial original-content and owned-image policy', () => {
  it('accepts real official Viettel URLs and blocks lookalikes', () => {
    expect(isOfficialViettelUrl(officialUrl)).toBe(true);
    expect(isOfficialViettelUrl('https://media.vietteltelecom.vn/upload/file.pdf')).toBe(true);
    expect(isOfficialViettelUrl('https://viettel.vn.evil.example/')).toBe(false);
    expect(isOfficialViettelUrl('http://098.viettel.vn/tin-tuc')).toBe(false);
  });

  it('discovers only on-domain original Viettel article URLs', () => {
    const html = '<a href="/tin-tuc/chi-tiet/bat-5g/123">Official</a>' +
      '<a href="https://fake.example/tin-tuc/chi-tiet/abc/4">Unsafe</a>' +
      '<a href="javascript:alert(1)">Unsafe script</a>';
    expect(findOfficialArticleLinks(html, officialUrl)).toEqual([
      'https://098.viettel.vn/tin-tuc/chi-tiet/bat-5g/123',
    ]);
  });

  it('accepts substantive editorial copy only with source-matched evidence', () => {
    const issues = validateOriginalDraft(substantiveDraft(), sourceText, officialUrl);
    expect(issues).toEqual([]);
  });

  it('holds thin content, invented offers and unsupported source quotes', () => {
    const draft = substantiveDraft();
    draft.markdown = '## Bắt đầu\nLập tức đăng ký 5GB/ngày chỉ 50.000đ.\n' + officialUrl;
    draft.evidenceQuotes = ['Không có thật ở tài liệu gốc', quoteB];
    const issues = validateOriginalDraft(draft, sourceText, officialUrl);
    expect(issues).toContain('THIN_ORIGINAL_ARTICLE');
    expect(issues).toContain('NUMERIC_OFFER_REQUIRES_SEPARATE_VERIFICATION');
    expect(issues).toContain('EVIDENCE_NOT_FOUND_VERBATIM');
  });

  it('blocks ungrounded external links and raw HTML in an AI draft', () => {
    const draft = substantiveDraft();
    draft.markdown += '\n[Website lạ](https://untrusted.example/guide)';
    draft.markdown += '\n<img src=x onerror=alert(1)>';
    const issues = validateOriginalDraft(draft, sourceText, officialUrl);
    expect(issues).toContain('EXTERNAL_LINK_NOT_GROUNDED');
    expect(issues).toContain('UNSAFE_MARKDOWN_HTML');
  });

  it('rejects near-duplicate titles rather than fabricating new intent', () => {
    const draft = substantiveDraft();
    const issues = validateOriginalDraft(draft, sourceText, officialUrl, [draft.title]);
    expect(issues).toContain('SIMILAR_EXISTING_ARTICLE');
  });

  it('renders an original safe SVG and escapes untrusted caption text', () => {
    const svg = renderOriginalEditorialSvg({
      title: 'Kiểm tra eSIM trên iPhone <hacked>',
      visualSteps: ['Kiểm tra thiết bị', 'Đọc hướng dẫn gốc', 'Liên hệ hỗ trợ'],
      alt: 'Minh họa & hướng dẫn', slug: 'kiem-tra-esim',
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain('&lt;hacked&gt;');
    expect(svg).toContain('Minh họa &amp; hướng dẫn');
    expect(svg).not.toContain('<hacked>');
    expect(svg).not.toContain('<script');
  });
});
