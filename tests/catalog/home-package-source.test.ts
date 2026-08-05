import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PackageCard, { canRegisterPackage } from '../../src/components/PackageCard';
import PackageModal from '../../src/components/PackageModal';
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
    expect(modalMarkup).not.toContain('Thông tin đăng ký đang chờ xác minh');
  });
});
