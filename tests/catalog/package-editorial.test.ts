import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPackageEditorial } from '../../src/data/package-editorial';

describe('package editorial ownership', () => {
  it('keeps the 5G135 review content on the canonical package owner', () => {
    const editorial = getPackageEditorial('5g135');

    expect(editorial).toBeDefined();
    expect(editorial?.heading).toMatch(/Đánh giá 5G135/);
    expect(editorial?.summary).toContain('135.000đ');
    expect(editorial?.summary).toContain('4 GB/ngày');
    expect(editorial?.summary).toContain('120 GB/tháng');
    expect(editorial?.summary).toContain('TV360 Basic');
    expect(editorial?.summary).toContain('20 GB');
    expect(editorial?.summary).toMatch(/không phải cam kết/i);
    expect(editorial?.sourceUrl).toMatch(/^https:\/\/098\.viettel\.vn\//);
  });

  it('does not invent editorial content for packages without an approved expansion', () => {
    expect(getPackageEditorial('5g150')).toBeUndefined();
    expect(getPackageEditorial('unknown-package')).toBeUndefined();
  });

  it('permanently consolidates the thin duplicate route into /goi-cuoc/5g135', () => {
    const vercel = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
    expect(vercel.redirects).toContainEqual({
      source: '/posts/b4-review-01-a',
      destination: '/goi-cuoc/5g135',
      permanent: true,
    });
  });

  it('removes the duplicate source article so only the canonical owner remains indexable', () => {
    expect(fs.existsSync(path.resolve('src/content/posts/b4-review-01-a.md'))).toBe(false);
  });
});
