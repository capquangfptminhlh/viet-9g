import React, { useState } from 'react';
import type { AgentConfig } from '../types';
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
  const [config] = useState<AgentConfig>({
    agentCode: 'GB',
    supportPhone: '1800.8098',
    zaloLink: '',
    agentName: 'Thông tin tham khảo gói cước',
  });
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
      <Header config={config} searchQuery={searchQuery} onSearchChange={handleSearchChange} onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-950">
        Đây là trang thông tin độc lập. Thông tin gói cước, điều kiện và việc đăng ký do Viettel xác nhận.
      </div>
      <main className="flex-1">
        <HeroCarousel packages={packages} onSelectPackage={selectPackage} />
        <SmartRecommender packages={packages} onSelectPackage={selectPackage} onOpenDetails={openDetails} />
        <SimLookup packages={packages} onSelectPackage={selectPackage} />
        <PackageGrid packages={packages} onSelectPackage={selectPackage} onOpenDetails={openDetails} searchQuery={searchQuery} onSearchReset={() => setSearchQuery('')} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <FaqAccordion />
      </main>
      <Footer config={config} />
      {activePackage && <PackageModal pkg={activePackage} onClose={() => setSelectedPkgId(null)} defaultTab={modalTab} />}
    </div>
  );
}
