import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PackageCard, { canRegisterPackage } from '../../src/components/PackageCard';
import PackageModal from '../../src/components/PackageModal';
import HeroCarousel from '../../src/components/HeroCarousel';
import Header from '../../src/components/Header';
import Footer from '../../src/components/Footer';
import PolicyModal from '../../src/components/PolicyModal';
import { getVerifiedDataDisplay } from '../../src/components/package-display';
import { findCatalogPackages, getFinderActionPackages } from '../../src/components/SimLookup';
import { getRecommendationActionPackages, recommendPackages } from '../../src/components/SmartRecommender';
import type { VerifiedPackage } from '../../src/data/verified-package';

const root = process.cwd();
function resolveImport(from: string, specifier: string): string | undefined {
  const base = specifier.startsWith('.')
    ? path.resolve(path.dirname(from), specifier)
    : specifier.startsWith('@/') || specifier.startsWith('~/')
      ? path.resolve(root, 'src', specifier.slice(2))
      : undefined;
  if (!base) return undefined;
  for (const candidate of [base, ...['.ts', '.tsx', '.astro'].map((extension) => `${base}${extension}`), ...['index.ts', 'index.tsx', 'index.astro'].map((index) => path.join(base, index))]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

function collectHomeImports(entry: string, visited = new Set<string>()): Set<string> {
  const file = path.resolve(root, entry);
  if (visited.has(file)) return visited;
  visited.add(file);
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)) {
    const resolved = resolveImport(file, match[1]);
    if (resolved) collectHomeImports(resolved, visited);
  }
  return visited;
}

const unregisteredPackage: VerifiedPackage = {
  id: 'test-offer',
  code: 'TEST',
  name: 'Test offer',
  category: 'data',
  priceVnd: 90000,
  durationDays: 30,
  dataAllowance: '30GB',
  benefits: ['Verified benefit'],
  eligibility: ['Verified eligibility'],
  updatedAt: '2026-08-05T00:00:00.000Z',
  priceValidUntil: '2026-12-31T00:00:00.000Z',
  sourceUrl: 'https://viettel.vn/test',
  price: 90000,
  duration: '30 ngày',
  dataLimit: '30GB',
  description: 'Verified offer description',
  rules: ['Verified eligibility'],
  registrationEligible: false,
  status: 'eligibility_required',
};

const registeredPackage: VerifiedPackage = {
  ...unregisteredPackage,
  id: 'registered-offer',
  registrationEligible: true,
  registration: { syntax: 'TEST SPECIAL GB', smsNumber: 290, channel: 'sms' },
};

describe('homepage verified package source', () => {
  it('passes server-verified packages into the client homepage', () => {
    const page = fs.readFileSync(path.join(root, 'src/pages/index.astro'), 'utf8');

    expect(page).toMatch(/loadPackageCatalog/);
    expect(page).toMatch(/getVerifiedPackages/);
    expect(page).toMatch(/<HomeApp\s+packages=\{packages\}\s+client:load\s*\/>/);
  });

  it('does not import legacy packages anywhere in the recursive HomeApp import tree', () => {
    for (const file of collectHomeImports('src/components/HomeApp.tsx')) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).not.toMatch(/from\s+['"][^'"]*data\/packages['"]/);
    }
  });

  it('does not retain public credential or agent-code editing UI', () => {
    const settings = fs.readFileSync(path.join(root, 'src/components/AgentSettings.tsx'), 'utf8');
    expect(settings).not.toMatch(/admin290|123456|Mã PIN|agentCode/i);
    expect(settings).toContain('Cú pháp đăng ký được xác minh theo từng gói cước');
  });

  it('does not render registration actions for offers without registration evidence', () => {
    expect(canRegisterPackage(unregisteredPackage)).toBe(false);

    const markup = renderToStaticMarkup(React.createElement(PackageCard, {
      pkg: unregisteredPackage,
      onSelect: () => undefined,
      onOpenDetails: () => undefined,
    }));

    expect(markup).not.toContain('Soạn tin đăng ký');
    const modalMarkup = renderToStaticMarkup(React.createElement(PackageModal, {
      pkg: unregisteredPackage,
      onClose: () => undefined,
    }));
    expect(modalMarkup).not.toContain('Cú Pháp SMS');
    expect(modalMarkup).not.toContain('Mở ứng dụng SMS');
  });

  it('uses neutral site disclosures in header, footer, and policies', () => {
    const config = { agentCode: 'GB', supportPhone: '1800.8098', zaloLink: 'https://zalo.me/18008098', agentName: 'Test' };
    const header = renderToStaticMarkup(React.createElement(Header, { config, searchQuery: '', onSearchChange: () => undefined, onCategorySelect: () => undefined, selectedCategory: 'all' }));
    const footer = renderToStaticMarkup(React.createElement(Footer, { config }));
    const policy = renderToStaticMarkup(React.createElement(PolicyModal, { isOpen: true, type: 'disclaimer', onClose: () => undefined }));

    for (const markup of [header, footer, policy]) {
      expect(markup.toLowerCase()).toContain('trang thông tin độc lập');
      expect(markup.toLowerCase()).toContain('viettel xác nhận');
      expect(markup).not.toMatch(/miễn phí|thanh toán|gia hạn|hủy/i);
    }
  });

  it('keeps a registered offer actionable and shows its verified SMS syntax in the modal', () => {
    expect(canRegisterPackage(registeredPackage)).toBe(true);

    const cardMarkup = renderToStaticMarkup(React.createElement(PackageCard, {
      pkg: registeredPackage,
      onSelect: () => undefined,
      onOpenDetails: () => undefined,
    }));
    const modalMarkup = renderToStaticMarkup(React.createElement(PackageModal, {
      pkg: registeredPackage,
      onClose: () => undefined,
      defaultTab: 'sms',
    }));

    expect(cardMarkup).toContain('Soạn tin đăng ký');
    expect(modalMarkup).toContain('TEST SPECIAL GB');
    expect(modalMarkup).toContain(`href="sms:290?body=${encodeURIComponent(registeredPackage.registration!.syntax)}"`);
    expect(modalMarkup).not.toContain('Thông tin đăng ký đang chờ xác minh');
    expect(modalMarkup).not.toContain('Hệ thống gửi trả tin nhắn xác nhận');
    expect(modalMarkup).not.toContain('số dư tối thiểu');
    expect(modalMarkup).not.toContain('Giá cước sẽ được trừ trực tiếp');
    expect(modalMarkup).not.toContain('Kênh bảo trợ:');
    expect(modalMarkup).not.toContain('Điểm cung cấp gói cước');
  });

  it('gates hero, finder, and recommender registration actions on evidence', () => {
    const registeredHero = renderToStaticMarkup(React.createElement(HeroCarousel, {
      packages: [registeredPackage],
      config: { agentCode: 'GB', supportPhone: '1800.8098', zaloLink: 'https://zalo.me/18008098', agentName: 'Test' },
      onSelectPackage: () => undefined,
    }));
    const unregisteredHero = renderToStaticMarkup(React.createElement(HeroCarousel, {
      packages: [unregisteredPackage],
      config: { agentCode: 'GB', supportPhone: '1800.8098', zaloLink: 'https://zalo.me/18008098', agentName: 'Test' },
      onSelectPackage: () => undefined,
    }));

    expect(registeredHero).toContain('ĐĂNG KÝ NGAY');
    expect(unregisteredHero).not.toContain('ĐĂNG KÝ NGAY');
    expect(getFinderActionPackages([registeredPackage, unregisteredPackage])).toEqual([registeredPackage]);
    expect(getRecommendationActionPackages([registeredPackage, unregisteredPackage])).toEqual([registeredPackage]);
  });

  it('labels allowance-only and per-day-only card data accurately', () => {
    const allowanceOnly = renderToStaticMarkup(React.createElement(PackageCard, {
      pkg: { ...unregisteredPackage, dataAllowance: '30GB', dataPerDay: undefined },
      onSelect: () => undefined,
      onOpenDetails: () => undefined,
    }));
    const perDayOnly = renderToStaticMarkup(React.createElement(PackageCard, {
      pkg: { ...unregisteredPackage, dataAllowance: undefined, dataPerDay: '1.5GB/ngày' },
      onSelect: () => undefined,
      onOpenDetails: () => undefined,
    }));

    expect(allowanceOnly).toContain('Tổng dung lượng');
    expect(allowanceOnly).not.toContain('Data mỗi ngày');
    expect(perDayOnly).toContain('Data mỗi ngày');
    expect(perDayOnly).not.toContain('Tổng dung lượng');
  });

  it('finds packages from the verified catalog without fabricating subscriber eligibility', () => {
    expect(findCatalogPackages([registeredPackage, unregisteredPackage], 'test')).toEqual([registeredPackage, unregisteredPackage]);
    expect(findCatalogPackages([registeredPackage, unregisteredPackage], '')).toEqual([registeredPackage, unregisteredPackage]);
  });

  it('ranks recommendations from the need selected for this submission', () => {
    const offers = [
      { ...registeredPackage, id: 'social', category: 'social' as const, dataPerDay: '1GB/ngày' },
      { ...registeredPackage, id: 'combo', category: 'combo' as const, dataPerDay: '2GB/ngày' },
      { ...registeredPackage, id: 'data-low', category: 'data' as const, dataPerDay: '500MB/ngày' },
      { ...registeredPackage, id: 'data-high', category: 'data' as const, dataPerDay: '3GB/ngày' },
      { ...registeredPackage, id: 'long', category: 'long_term' as const, durationDays: 180, dataPerDay: '1GB/ngày' },
    ];

    expect(recommendPackages(offers, 'all', 'social').map((pkg) => pkg.id)).toEqual(['social']);
    expect(recommendPackages(offers, 'all', 'combo').map((pkg) => pkg.id)).toEqual(['combo']);
    expect(recommendPackages(offers, 'all', 'data').map((pkg) => pkg.id)).toEqual(['data-high', 'combo', 'social']);
    expect(recommendPackages(offers, 'all', 'long_term').map((pkg) => pkg.id)).toEqual(['long']);
  });

  it('normalizes verified allowance display and daily-data sorting without placeholders', () => {
    const allowanceOnly = getVerifiedDataDisplay({ ...registeredPackage, dataAllowance: '30GB', dataPerDay: undefined });
    const perDayOnly = getVerifiedDataDisplay({ ...registeredPackage, dataAllowance: undefined, dataPerDay: '1.5GB/ngày' });

    expect(allowanceOnly).toEqual({ primary: '30GB', dailyDataValue: undefined });
    expect(perDayOnly).toEqual({ primary: '1.5GB/ngày', dailyDataValue: 1.5 });
  });
});
