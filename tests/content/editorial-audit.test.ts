import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditEditorialContent } from '../../scripts/audit-editorial-content';

describe('auditEditorialContent', () => {
  it('creates a deterministic, slug-sorted audit from local Markdown posts', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'editorial-audit-'));
    fs.writeFileSync(path.join(directory, 'z-post.md'), '# Z title\n\n## Details\n\n![hero](./hero.jpg)\n\nUse [V90B](https://viettel.vn) then `ST15K` gửi 290.', 'utf8');
    fs.writeFileSync(path.join(directory, 'a-post.md'), '# A title\n\nBody [guide](/guide).\n\n### FAQ\n\nĐăng ký V120B gửi 290.', 'utf8');

    expect(auditEditorialContent(directory)).toEqual([
      {
        slug: 'a-post', title: 'A title', wordCount: 10, headings: ['A title', 'FAQ'], imageCount: 0,
        outboundLinks: [], packageCodes: ['V120B'], hasRegistrationCta: true,
      },
      {
        slug: 'z-post', title: 'Z title', wordCount: 10, headings: ['Z title', 'Details'], imageCount: 1,
        outboundLinks: ['https://viettel.vn'], packageCodes: ['ST15K', 'V90B'], hasRegistrationCta: false,
      },
    ]);
  });
});
