import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicDisclosureFiles = [
  'src/components/About.tsx',
  'src/pages/ve-chung-toi.astro',
  'src/pages/dieu-khoan-su-dung.astro',
  'src/pages/posts/[slug].astro',
];

describe('public copy policy', () => {
  it('does not claim authorization, delegation, official ownership, or free registration without evidence', () => {
    const publicCopy = publicDisclosureFiles
      .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
      .join('\n');

    for (const pattern of [/đại lý ủy quyền/i, /đại lý ủy thác/i, /được cấp phép/i, /kênh chính thức/i, /không mất bất kỳ chi phí trung gian/i, /cú pháp SMS 290 miễn phí/i, /thông tin chính thức/i]) {
      expect(publicCopy).not.toMatch(pattern);
    }
  });

  it('keeps the factual independent-site disclosure', () => {
    const copy = fs.readFileSync(path.join(root, 'src/pages/ve-chung-toi.astro'), 'utf8');
    expect(copy).toMatch(/kênh giới thiệu\/CTV độc lập/i);
    expect(copy).toMatch(/không phải.*Viettel Telecom/i);
  });
});
