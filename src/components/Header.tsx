import React, { useState } from 'react';
import { Search, Phone, Menu, X, Globe, ShieldCheck, Home, Zap, MonitorPlay, Layers, Crown } from 'lucide-react';
import { AgentConfig } from '../types';
import { trackConversion } from '../utils/tracking';

interface HeaderProps {
  config: AgentConfig;
  onOpenSettings?: () => void;
  onOpenAdsGuide?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export default function Header({ 
  config, 
  searchQuery = '', 
  onSearchChange = () => {},
  onCategorySelect = () => {},
  selectedCategory = 'all'
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'TRANG CHỦ', action: 'all', id: 'all', icon: Home },
    { label: 'GÓI HOT', action: 'hot', id: 'hot', icon: Zap, iconColor: 'text-red-500' },
    { label: 'SIÊU TỐC DATA', action: 'data', id: 'data', icon: Zap, iconColor: 'text-orange-500' },
    { label: 'GÓI MXH', action: 'social', id: 'social', icon: MonitorPlay, iconColor: 'text-blue-500' },
    { label: 'COMBO THOẠI', action: 'combo', id: 'combo', icon: Phone, iconColor: 'text-red-400' },
    { label: 'CHU KỲ DÀI', action: 'long_term', id: 'long_term', icon: Crown, iconColor: 'text-red-600' },
  ];

  return (
    <header className="w-full bg-white font-sans border-b border-gray-100">
      {/* Top Red Bar */}
      <div className="bg-[#e60000] text-white text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between font-medium">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Soạn SMS gửi tổng đài Viettel 290 (Miễn phí 100% dịch vụ)
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              Kênh đại lý ủy quyền của Viettel
            </span>
          </div>
          <a 
            href={`tel:${config.supportPhone.replace(/\./g, '')}`} 
            className="flex items-center gap-1.5 hover:underline font-bold"
          >
            <Phone className="w-3.5 h-3.5 fill-white" />
            Hotline: {config.supportPhone}
          </a>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-5 flex items-center justify-between gap-6">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onCategorySelect('all')}>
          <div className="w-12 h-12 bg-[#e60000] rounded-full flex items-center justify-center text-white font-black text-xl italic shadow-md">
            5G
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#e60000] font-black text-2xl italic tracking-tight uppercase">
                TRACUU
              </span>
              <span className="bg-[#e60000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                goicuoc.com
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-500 tracking-wide mt-0.5">
              Kênh tra cứu & đăng ký gói cước Viettel
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm gói cước (ví dụ: SD135, V200B, MXH120...)"
            className="w-full pl-11 pr-14 py-3 text-sm border-2 border-gray-100 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:border-[#e60000] transition-colors"
          />
          <button className="absolute right-1 top-1 bottom-1 px-4 bg-[#e60000] hover:bg-red-700 text-white rounded-full transition-colors flex items-center justify-center">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Contacts */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <a
            href={config.zaloLink}
            target="_blank"
            onClick={() => trackConversion('click_zalo')}
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 text-sm font-bold rounded-full transition-all"
          >
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">Zalo</div>
            Trợ giúp Zalo
          </a>
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#e60000]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-medium">Hotline 24/7</span>
              <a 
                href={`tel:${config.supportPhone.replace(/\./g, '')}`}
                onClick={() => trackConversion('click_hotline')} 
                className="text-sm font-black text-gray-900 hover:text-[#e60000]"
              >
                {config.supportPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation Menu Desktop */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
          <div className="flex items-center h-full gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedCategory === item.action;
              return (
                <button
                  key={item.id}
                  onClick={() => onCategorySelect(item.action)}
                  className={`h-full px-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                    isActive 
                      ? 'bg-[#e60000] text-white' 
                      : 'text-gray-700 hover:text-[#e60000] hover:bg-red-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor || 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
            <a
              href="/tin-tuc"
              className="h-full px-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors text-gray-700 hover:text-[#e60000] hover:bg-red-50"
            >
              <Layers className="w-4 h-4 text-red-500" />
              TIN TỨC & HƯỚNG DẪN
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-2">
          <div className="px-4 pb-4">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm gói cước..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#e60000]"
              />
            </div>
          </div>
          <div className="flex flex-col">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedCategory === item.action;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onCategorySelect(item.action);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-6 py-3 flex items-center gap-3 text-sm font-bold uppercase ${
                    isActive ? 'bg-[#e60000] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.iconColor}`} />
                  {item.label}
                </button>
              );
            })}
            <a
              href="/tin-tuc"
              className="px-6 py-3 flex items-center gap-3 text-sm font-bold uppercase text-gray-700 hover:bg-gray-50 min-h-[48px]"
            >
              <Layers className="w-5 h-5 text-red-500" />
              TIN TỨC & HƯỚNG DẪN
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
