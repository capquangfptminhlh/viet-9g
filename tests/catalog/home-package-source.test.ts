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
import FaqAccordion from '../../src/components/FaqAccordion';
import { getVerifiedDataDisplay } from '../../src/components/package-display';
import { findCatalogPackages, getFinderActionPackages } from '../../src/components/SimLookup';
import { getRecommendationActionPackages, recommendPackages } from '../../src/components/SmartRecommender';
import type { VerifiedPackage } from '../../src/data/verified-package';

const root = process.cwd();
function resolveImport(from: string, specifier: string): string | undefined {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
  const base = cleanSpecifier.startsWith('.')
    ? path.resolve(path.dirname(from), cleanSpecifier)
    : cleanSpecifier.startsWith('@/') || cleanSpecifier.startsWith('~/')
      ? path.resolve(root, 'src', cleanSpecifier.slice(2))
      : cleanSpecifier.startsWith('data/')
        ? path.resolve(root, 'src', cleanSpecifier)
      : undefined;
  if (!base) return undefined;
  for (const candidate of [base, ...['.ts', '.tsx', '.astro'].map((extension) => `${base}${extension}`), ...['index.ts', 'index.tsx', 'index.astro'].map((index) => path.join(base, index))]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

function getImportSpecifiers(source: string): string[] {
  return [...source.matchAll(/(?:from\s+|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

function collectHomeImports(entry: string, visited = new Set<string>()): Set<string> {
  const file = path.resolve(root, entry);
  if (visited.has(file)) return visited;
  visited.add(file);
  const source = fs.readFileSync(file, 'utf8');
  for (const specifier of getImportSpecifiers(source)) {
    const resolved = resolveImport(file, specifier);
    if (resolved) collectHomeImports(resolved, visited);
  }
  return visited;
}

function resolvesToLegacyPackages(from: string, specifier: string): boolean {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
  const resolved = resolveImport(from, specifier)?.replace(/\\/g, '/');
  return /(?:^|\/)data\/packages(?:\.[cm]?[jt]sx?)?$/.test(cleanSpecifier)
    || resolved?.endsWith('/src/data/packages.ts') === true;
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
  it('initializes and passes the homepage package prop through the verified catalog boundary', () => {
    const page = fs.readFileSync(path.join(root, 'src/pages/index.astro'), 'utf8');

    expect(page).toMatch(/const\s+packages\s*=\s*getVerifiedPackages\s*\(\s*loadPackageCatalog\s*\(\s*\)\s*\)/);
    expect(page).toMatch(/<HomeApp\s+packages=\{packages\}\s+latestPosts=\{latestPosts\}\s+client:load\s*\/>/);
  });

  it('uses neutral independent-site defaults for BaseLayout metadata and Open Graph', () => {
    const layout = fs.readFileSync(path.join(root, 'src/layouts/BaseLayout.astro'), 'utf8');
    const defaultTitle = 'Tra Cứu Thông Tin Gói Cước Di Động';
    const defaultDescription = 'Trang thông tin độc lập để tra cứu dữ kiện gói cước di động. Điều khoản gói và việc đăng ký do Viettel xác nhận.';

    expect(layout).toContain(defaultTitle);
    expect(layout).toContain(defaultDescription);
    expect(layout).toMatch(/<meta name="description" content=\{description\}/);
    expect(layout).toMatch(/<meta property="og:description" content=\{description\}/);
    expect(layout).not.toMatch(/mới nhất 2026|chính thức|miễn phí|cổng đăng ký|hướng dẫn soạn tin nhắn/i);
  });

  it('rejects legacy package imports from the index entrypoint and dependency tree', () => {
    for (const file of collectHomeImports('src/pages/index.astro')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const specifier of getImportSpecifiers(source)) {
        expect(resolvesToLegacyPackages(file, specifier)).toBe(false);
      }
    }
  });

  it('does not import legacy packages through static, side-effect, or dynamic HomeApp imports', () => {
    for (const file of collectHomeImports('src/components/HomeApp.tsx')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const specifier of getImportSpecifiers(source)) {
        expect(resolvesToLegacyPackages(file, specifier)).toBe(false);
      }
    }
  });

  it('recognizes legacy imports in static, side-effect, and dynamic import syntax', () => {
    const importer = path.join(root, 'src/components/HomeApp.tsx');
    const specifiers = getImportSpecifiers("import './data/packages?raw'; export * from '@/data/packages.ts?url'; const load = import('../data/packages');");

    expect(specifiers).toEqual(['./data/packages?raw', '@/data/packages.ts?url', '../data/packages']);
    for (const specifier of specifiers) expect(resolvesToLegacyPackages(importer, specifier)).toBe(true);
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
      defaultTab: 'sms',
    }));
    expect(modalMarkup).not.toContain('Cú Pháp SMS');
    expect(modalMarkup).not.toContain('Mở ứng dụng SMS');
  });

  it('uses neutral public copy without global agent or contact values', () => {
    const homeAppSource = fs.readFileSync(path.join(root, 'src/components/HomeApp.tsx'), 'utf8');
    const header = renderToStaticMarkup(React.createElement(Header, { searchQuery: '', onSearchChange: () => undefined, onCategorySelect: () => undefined, selectedCategory: 'all' }));
    const footer = renderToStaticMarkup(React.createElement(Footer));
    const policy = renderToStaticMarkup(React.createElement(PolicyModal, { isOpen: true, type: 'disclaimer', onClose: () => undefined }));
    const faq = renderToStaticMarkup(React.createElement(FaqAccordion));

    expect(homeAppSource).not.toMatch(/agentCode|supportPhone|zaloLink/);
    for (const markup of [header, footer, policy]) {
      expect(markup.toLowerCase()).toContain('trang thông tin độc lập');
      expect(markup.toLowerCase()).toContain('viettel xác nhận');
      expect(markup).not.toMatch(/miễn phí|thanh toán|gia hạn|hủy/i);
    }
    for (const markup of [header, footer, policy]) {
      expect(markup).not.toMatch(/\bGB\b|1800\.8098|Liên hệ tham khảo|Hotline/i);
    }
    expect(faq).toContain('Các câu hỏi dưới đây');
    expect(faq).not.toMatch(/Mọi thắc mắc|nạp tiền|hạ băng thông/i);
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
      onSelectPackage: () => undefined,
    }));
    const unregisteredHero = renderToStaticMarkup(React.createElement(HeroCarousel, {
      packages: [unregisteredPackage],
      onSelectPackage: () => undefined,
    }));

    expect(registeredHero).toContain('ĐĂNG KÝ NGAY');
    expect(unregisteredHero).not.toContain('ĐĂNG KÝ NGAY');
    expect(getFinderActionPackages([registeredPackage, unregisteredPackage])).toEqual([registeredPackage]);
    expect(getRecommendationActionPackages([registeredPackage, unregisteredPackage])).toEqual([registeredPackage]);
  });

  it('keeps hero support wording neutral and does not render agent authority or external contact links', () => {
    const hero = renderToStaticMarkup(React.createElement(HeroCarousel, {
      packages: [registeredPackage],
      onSelectPackage: () => undefined,
    }));

    expect(hero).toContain('Thông tin gói đã xác minh');
    expect(hero).not.toMatch(/hỏi đại lý|đại lý|ủy quyền|chính thức/i);
    expect(hero).not.toContain('zalo.me');
    expect(hero).not.toMatch(/href="https?:\/\//i);
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
