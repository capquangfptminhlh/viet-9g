import { describe, expect, it } from 'vitest';
import { generateMainSiteArticle } from '../../packages/content-engine/main-site-content-generator';

describe('main-site content generator', () => {
  it('renders a fact-grounded article with its own image and official citations', () => {
    const article = generateMainSiteArticle({
      topic: {
        topicId: 'esim-5g-guide', title: 'eSIM Viettel có dùng được 5G không?', intent: 'informational',
        targetUrlPath: '/huong-dan/esim-5g/', sourceFactIds: ['fact-esim'],
      },
      facts: [{
        id: 'fact-esim', claim: 'eSIM Viettel có thể truy cập 5G trên thiết bị tương thích.',
        sourceUrl: 'https://098.viettel.vn/huong-dan/esim-5g', expiresAt: '2026-12-31T23:59:59Z',
      }],
      media: { publicUrl: 'https://www.tracuugoicuoc.com/images/blogger/esim-5g-guide.svg', alt: 'Minh họa eSIM Viettel và 5G.' },
      publishedAt: new Date('2026-08-03T00:00:00.000Z'),
    });

    expect(article.slug).toBe('esim-5g-guide');
    expect(article.markdown).toContain('![Minh họa eSIM Viettel và 5G.](https://www.tracuugoicuoc.com/images/blogger/esim-5g-guide.svg)');
    expect(article.markdown).toContain('eSIM Viettel có thể truy cập 5G trên thiết bị tương thích.');
    expect(article.markdown).toContain('[Nguồn Viettel](https://098.viettel.vn/huong-dan/esim-5g)');
    expect(article.markdown).toContain('## Điều cần kiểm tra trước khi thực hiện');
    expect(article.markdown).not.toContain('GB gửi 290');
  });
});
