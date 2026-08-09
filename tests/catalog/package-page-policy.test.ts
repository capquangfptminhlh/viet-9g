import { describe, expect, it } from 'vitest';
import { getPackagePageModel } from '../../src/data/package-page';
import type { VerifiedPackage } from '../../src/data/verified-package';

const pkg: VerifiedPackage = {
  id: 'v120b', code: 'V120B', name: 'V120B', category: 'combo',
  priceVnd: 120000, durationDays: 30, dataAllowance: '45 GB/tháng', dataPerDay: '1,5 GB/ngày',
  benefits: ['Kèm 50 phút ngoại mạng theo điều kiện trong bảng Viettel.'],
  eligibility: ['Khả năng đăng ký phụ thuộc điều kiện thuê bao và hệ thống Viettel tại thời điểm thực hiện.'],
  updatedAt: '2026-08-09T00:00:00.000Z', priceValidUntil: '2026-08-23T00:00:00.000Z',
  sourceUrl: 'https://098.viettel.vn/example', price: 120000, duration: '30 ngày', dataLimit: '45 GB/tháng',
  description: 'V120B · 120000 VND · 30 days · 45 GB/tháng', rules: [], registrationEligible: false,
  status: 'eligibility_required',
};

describe('package page policy', () => {
  it('renders only evidenced package data when no registration fact is available', () => {
    const page = getPackagePageModel(pkg);

    expect(page.registration).toBeUndefined();
    expect(page.facts).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Giá', value: '120.000đ / 30 ngày' }),
      expect.objectContaining({ label: 'Dung lượng', value: '45 GB/tháng' }),
    ]));
    expect(JSON.stringify(page)).not.toMatch(/KTTK|HUYDATA|tự động gia hạn|miễn phí 100%/i);
  });

  it('includes the SMS CTA only when the verified model carries registration evidence', () => {
    const page = getPackagePageModel({ ...pkg, registration: { syntax: 'V120B GB', smsNumber: 290, channel: 'sms' } });

    expect(page.registration).toEqual({ syntax: 'V120B GB', smsNumber: 290 });
  });
});
