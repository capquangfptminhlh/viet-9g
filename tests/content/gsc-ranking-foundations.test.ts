import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('GSC ranking foundations', () => {
  it('uses one visible homepage H1 and links to the core package hubs', () => {
    const page = fs.readFileSync(path.resolve('src/pages/index.astro'), 'utf8');
    const app = fs.readFileSync(path.resolve('src/components/HomeApp.tsx'), 'utf8');

    expect(page).not.toContain('<h1');
    expect(app.match(/<h1\b/g)?.length).toBe(1);
    expect(app).toContain('Gói cước Viettel 4G/5G: tra cứu data, combo và gói mạng xã hội');

    for (const href of ['/goi-cuoc', '/goi-cuoc/data', '/goi-cuoc/5g', '/goi-cuoc/mang-xa-hoi', '/goi-cuoc/combo']) {
      expect(app).toContain(`href="${href}"`);
    }
  });

  it('uses an existing default social image and exposes an Organization logo', () => {
    const layout = fs.readFileSync(path.resolve('src/layouts/BaseLayout.astro'), 'utf8');

    expect(fs.existsSync(path.resolve('public/images/viettel-4g-speed-banner.jpg'))).toBe(true);
    expect(layout).toContain("imageProp ?? '/images/viettel-4g-speed-banner.jpg'");
    expect(layout).not.toContain("imageProp ?? '/og-image.jpg'");
    expect(layout).toContain("logoHref = new URL('/favicon.svg', site).href");
    expect(layout).toContain("'@type': 'ImageObject'");
  });

  it('passes article-specific image, canonical owner and publication time into shared SEO metadata', () => {
    const postPage = fs.readFileSync(path.resolve('src/pages/posts/[slug].astro'), 'utf8');

    expect(postPage).toContain('const seoTitle = entry.data?.title || displayTitle;');
    expect(postPage).toContain('image={heroImage}');
    expect(postPage).toContain('canonical={`/posts/${entry.slug}`}');
    expect(postPage).toContain('pageType="article"');
    expect(postPage).toContain('publishedTime={publishedTime}');
  });

  it('keeps source-backed metadata on the GSC-visible account-check guide', () => {
    const guide = fs.readFileSync(path.resolve('src/content/posts/cach-kiem-tra-tai-khoan-chinh.md'), 'utf8');

    expect(guide.startsWith('---\n')).toBe(true);
    expect(guide).toContain('title: "Kiểm tra tài khoản Viettel *101#/*102#"');
    expect(guide).toContain('date: 2026-07-29');
    expect(guide).toContain('Viettel Store');
  });

  it('keeps the GSC-visible support titles concise and intent-aligned', () => {
    const accountGuide = fs.readFileSync(path.resolve('src/content/posts/cach-kiem-tra-tai-khoan-chinh.md'), 'utf8');
    const cancelGuide = fs.readFileSync(path.resolve('src/content/posts/cach-huy-goi-mxh120.md'), 'utf8');

    expect(accountGuide).toContain('title: "Kiểm tra tài khoản Viettel *101#/*102#"');
    expect(cancelGuide).toContain('title: "Hủy MXH120 Viettel qua 191"');
  });

  it('turns the package catalog into a descriptive canonical hub instead of a thin link list', () => {
    const hub = fs.readFileSync(path.resolve('src/pages/goi-cuoc/index.astro'), 'utf8');

    expect(hub).toContain('canonical="/goi-cuoc"');
    expect(hub).toContain('Gói cước Viettel 4G/5G: Data, Combo, Mạng Xã Hội');
    expect(hub).toContain('href="/posts/cach-kiem-tra-tai-khoan-chinh"');
    expect(hub).toContain('href="/posts/cach-huy-goi-mxh120"');
  });
});