import React, { useState } from 'react';
import type { VerifiedPackage } from '../data/verified-package';
import Header from './Header';
import HeroCarousel from './HeroCarousel';
import SimLookup from './SimLookup';
import SmartRecommender from './SmartRecommender';
import PackageGrid from './PackageGrid';
import FaqAccordion from './FaqAccordion';
import Footer from './Footer';
import PackageModal from './PackageModal';

interface HomeAppProps {
  packages: VerifiedPackage[];
}

export default function HomeApp({ packages }: HomeAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'sms' | 'qr' | 'details'>('details');
  const activePackage = packages.find((pkg) => pkg.id === selectedPkgId) ?? null;

  const selectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setModalTab('sms');
  };
  const openDetails = (pkg: VerifiedPackage) => {
    setSelectedPkgId(pkg.id);
    setModalTab('details');
  };
  const scrollToPackages = () => document.getElementById('goi-cuoc')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) scrollToPackages();
  };
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    scrollToPackages();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-950">
        Đây là trang thông tin độc lập. Thông tin gói cước, điều kiện và việc đăng ký do Viettel xác nhận.
      </div>
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white" aria-labelledby="home-primary-heading">
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">Tra cứu gói cước Viettel</p>
            <h1 id="home-primary-heading" className="mt-2 max-w-4xl text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              Gói cước Viettel 4G/5G: tra cứu data, combo và gói mạng xã hội
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
              Chọn nhóm gói theo nhu cầu, xem các dữ kiện đã được xác minh và mở trang từng mã gói trước khi quyết định đăng ký.
            </p>
            <nav className="mt-5 flex flex-wrap gap-2" aria-label="Nhóm gói cước Viettel chính">
              <a href="/goi-cuoc" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:text-red-700">Tất cả gói cước</a>
              <a href="/goi-cuoc/data" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:text-red-700">Gói data</a>
              <a href="/goi-cuoc/5g" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:text-red-700">Gói 5G</a>
              <a href="/goi-cuoc/mang-xa-hoi" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:text-red-700">Gói mạng xã hội</a>
              <a href="/goi-cuoc/combo" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:text-red-700">Gói combo</a>
            </nav>
          </div>
        </section>
        <HeroCarousel packages={packages} onSelectPackage={selectPackage} />
        <SmartRecommender packages={packages} onSelectPackage={selectPackage} onOpenDetails={openDetails} />
        <SimLookup packages={packages} onSelectPackage={selectPackage} />
        <PackageGrid packages={packages} onSelectPackage={selectPackage} onOpenDetails={openDetails} searchQuery={searchQuery} onSearchReset={() => setSearchQuery('')} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" aria-labelledby="support-guides-heading">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 id="support-guides-heading" className="text-lg font-black text-slate-950">Hướng dẫn tra cứu và quản lý gói</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Nếu nhu cầu của bạn là kiểm tra tài khoản hoặc quản lý gói đang dùng, xem hướng dẫn theo đúng mục đích thay vì chọn một gói mới ngay.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/posts/cach-kiem-tra-tai-khoan-chinh" className="text-sm font-bold text-red-700 underline decoration-red-200 underline-offset-4 hover:decoration-red-500">Kiểm tra tài khoản Viettel</a>
              <a href="/posts/cach-huy-goi-mxh120" className="text-sm font-bold text-red-700 underline decoration-red-200 underline-offset-4 hover:decoration-red-500">Cách hủy gói MXH120</a>
              <a href="/tin-tuc" className="text-sm font-bold text-red-700 underline decoration-red-200 underline-offset-4 hover:decoration-red-500">Xem tất cả hướng dẫn</a>
            </div>
          </div>
        </section>
        <FaqAccordion />
      </main>
      <Footer />
      {activePackage && <PackageModal pkg={activePackage} onClose={() => setSelectedPkgId(null)} defaultTab={modalTab} />}
    </div>
  );
}
