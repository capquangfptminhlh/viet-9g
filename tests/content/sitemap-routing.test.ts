import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('sitemap and canonical routing', () => {
  it('redirects the legacy sitemap URL to the generated Astro sitemap index', () => {
    const vercel = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));

    expect(vercel.redirects).toContainEqual({
      source: '/sitemap.xml',
      destination: '/sitemap-index.xml',
      permanent: true,
    });
  });

  it('does not ship the stale static sitemap inventory', () => {
    expect(fs.existsSync(path.resolve('public/sitemap.xml'))).toBe(false);
  });

  it('links the news archive directly to canonical no-trailing-slash post URLs', () => {
    const newsPage = fs.readFileSync(path.resolve('src/pages/tin-tuc.astro'), 'utf8');

    expect(newsPage).toContain('href={`/posts/${item.slug}`}');
    expect(newsPage).not.toContain('href={`/posts/${item.slug}/`}');
  });

  it('permanently consolidates known thin duplicate routes and removes their source pages', () => {
    const vercel = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
    const expected = [
      ['/posts/topic-b1-esim-5g-tuong-thich', '/posts/esim-5g-kich-hoat-quet-qr'],
      ['/posts/topic-b1-esim-kich-hoat-ket-noi', '/posts/esim-5g-kich-hoat-quet-qr'],
      ['/posts/topic-b1-esim-quet-qr-buoc-dau', '/posts/esim-5g-kich-hoat-quet-qr'],
      ['/posts/topic-b1-iphone-chon-4g-5g-volte', '/posts/cai-dat-4g-5g-volte-iphone-viettel'],
      ['/posts/topic-b1-roaming-nhat-che-do-mang', '/posts/viettel-roaming-nhat-ban-khong-co-mang'],
      ['/posts/topic-b1-roaming-bat-data-truoc-khi-di', '/posts/data-roaming-viettel-iphone-android'],
      ['/posts/topic-b1-iphone-data-roaming-duong-dan', '/posts/data-roaming-viettel-iphone-android'],
      ['/posts/topic-b1-android-data-roaming-duong-dan', '/posts/data-roaming-viettel-iphone-android'],
      ['/posts/topic-b1-roaming-khoi-dong-lai-may', '/posts/data-roaming-viettel-iphone-android'],
      ['/posts/gói-cước-viettel-xem-tiktok-youtube-facebook-miễn-phí-data', '/goi-cuoc/mang-xa-hoi'],
      ['/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động', '/posts/cach-huy-gia-han-4g-viettel'],
      ['/posts/dang-ky-sd70-viettel', '/goi-cuoc/sd70'],
    ];

    for (const [source, destination] of expected) {
      expect(vercel.redirects).toContainEqual({ source: encodeURI(source), destination, permanent: true });
      const markdown = path.resolve('src/content/posts', `${source.split('/').pop()}.md`);
      expect(fs.existsSync(markdown)).toBe(false);
    }
  });

  it('enables render-time normalization for Markdown internal links', () => {
    const config = fs.readFileSync(path.resolve('astro.config.mjs'), 'utf8');
    expect(config).toContain("import rehypeNormalizeInternalLinks from './src/markdown/rehype-normalize-internal-links.mjs';");
    expect(config).toContain('rehypePlugins: [rehypeNormalizeInternalLinks]');
  });

  it('links the package index directly to verified package canonical owners', () => {
    const packageIndex = fs.readFileSync(path.resolve('src/pages/goi-cuoc/index.astro'), 'utf8');
    expect(packageIndex).toContain("import { getPackageRoutes } from '../../data/package-routes';");
    expect(packageIndex).toContain('href={`/goi-cuoc/${pkg.id.toLowerCase()}`}');
  });
});
