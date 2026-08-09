import { describe, expect, it } from 'vitest';
import { getGuidePackageLinks } from '../../src/data/editorial-links';
import type { VerifiedPackage } from '../../src/data/verified-package';

function verifiedPackage(id: string, name: string): VerifiedPackage {
  return { id, name } as VerifiedPackage;
}

describe('editorial package links', () => {
  it('links a guide only to current verified package IDs', () => {
    const links = getGuidePackageLinks('cach-kiem-tra-tai-khoan-chinh', [
      verifiedPackage('v120b', 'Gói V120B'),
      verifiedPackage('mxh120', 'Gói MXH120'),
    ]);

    expect(links).toEqual([{ href: '/goi-cuoc/v120b', label: 'Gói V120B' }]);
    expect(links.every(({ href }) => href.startsWith('/goi-cuoc/'))).toBe(true);
    expect(links.map(({ href }) => href)).not.toContain('/goi-cuoc/st90k');
  });

  it('omits held or unknown package IDs that are not in the supplied verified list', () => {
    const links = getGuidePackageLinks('cach-huy-gia-han-4g-viettel', [
      verifiedPackage('v120b', 'Gói V120B'),
    ]);

    expect(links).toEqual([{ href: '/goi-cuoc/v120b', label: 'Gói V120B' }]);
  });
});
