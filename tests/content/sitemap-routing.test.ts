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
});
