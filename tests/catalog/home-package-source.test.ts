import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PackageCard, { canRegisterPackage } from '../../src/components/PackageCard';
import PackageModal from '../../src/components/PackageModal';
import HeroCarousel from '../../src/components/HeroCarousel';
import { getVerifiedDataDisplay } from '../../src/components/package-display';
import { findCatalogPackages } from '../../src/components/SimLookup';
import { recommendPackages } from '../../src/components/SmartRecommender';
import type { VerifiedPackage } from '../../src/data/verified-package';

const root = process.cwd();
const homepageComponents = [
  'src/components/HomeApp.tsx',
  'src/components/PackageGrid.tsx',
  'src/components/SmartRecommender.tsx',
  'src/components/SimLookup.tsx',
  'src/components/PackageCard.tsx',
  'src/components/HeroCarousel.tsx',
  'src/components/FaqAccordion.tsx',
  'src/components/Header.tsx',
  'src/components/HeroCarousel.tsx',
  'src/components/Footer.tsx',
  'src/components/AgentSettings.tsx',
  'src/components/PackageModal.tsx',
  'src/components/AdsGuideModal.tsx',
  'src/components/PolicyModal.tsx',
];

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

  it('does not import legacy packages in the homepage client tree', () => {
    for (const file of homepageComponents) {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      expect(source).not.toMatch(/from\s+['"][^'"]*data\/packages['"]/);
    }
  });

  it('does not render registration actions for offers without registration evidence', () => {
    expect(canRegisterPackage(unregisteredPackage)).toBe(false);

    const markup = renderToStaticMarkup(React.createElement(PackageCard, {
      pkg: unregisteredPackage,
      onSelect: () => undefined,
      onOpenDetails: () => undefined,
    }));

    expect(markup).not.toContain('Soạn tin đăng ký');
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
  });

  it('gates hero, finder, and recommender registration actions on evidence', () => {
    const registeredHero = renderToStaticMarkup(React.createElement(HeroCarousel, {
      packages: [registeredPackage],
      config: { agentCode: 'GB', supportPhone: '1800.8098', zaloLink: 'https://zalo.me/18008098', agentName: 'Test' },
      onSelectPackage: () => undefined,
      onOpenSettings: () => undefined,
    }));
    const unregisteredHero = renderToStaticMarkup(React.createElement(HeroCarousel, {
      packages: [unregisteredPackage],
      config: { agentCode: 'GB', supportPhone: '1800.8098', zaloLink: 'https://zalo.me/18008098', agentName: 'Test' },
      onSelectPackage: () => undefined,
      onOpenSettings: () => undefined,
    }));

    expect(registeredHero).toContain('ĐĂNG KÝ NGAY');
    expect(unregisteredHero).not.toContain('ĐĂNG KÝ NGAY');
    for (const file of ['src/components/SimLookup.tsx', 'src/components/SmartRecommender.tsx']) {
      expect(fs.readFileSync(path.join(root, file), 'utf8')).toContain('canRegisterPackage(pkg) && <button');
    }
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
