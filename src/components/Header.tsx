import React from 'react';
import { Globe, Phone, Search, ShieldCheck } from 'lucide-react';
import type { AgentConfig } from '../types';

interface HeaderProps {
  config: AgentConfig;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

const categories = [
  ['all', 'Tất cả'],
  ['data', 'Gói data'],
  ['social', 'Gói mạng xã hội'],
  ['combo', 'Gói combo'],
  ['long_term', 'Chu kỳ dài'],
] as const;

export default function Header({ config, searchQuery = '', onSearchChange = () => undefined, onCategorySelect = () => undefined, selectedCategory = 'all' }: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-100 bg-white font-sans">
      <div className="bg-[#e60000] text-xs text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />Trang thông tin độc lập; điều khoản gói và đăng ký do Viettel xác nhận.</span>
          <span className="hidden items-center gap-1.5 md:flex"><Globe className="h-4 w-4" />Thông tin tham khảo gói cước</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <div className="text-2xl font-black italic tracking-tight text-[#e60000]">TRACUU<span className="ml-1 rounded bg-[#e60000] px-1.5 py-0.5 text-[10px] not-italic text-white">goicuoc.com</span></div>
          <p className="mt-1 text-[10px] font-medium text-gray-500">Trang thông tin gói cước độc lập</p>
        </div>
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm gói cước" className="w-full rounded-full border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#e60000]" />
        </label>
        <a href={`tel:${config.supportPhone}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#e60000]"><Phone className="h-4 w-4" />Liên hệ tham khảo: {config.supportPhone}</a>
      </div>
      <nav className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {categories.map(([id, label]) => <button key={id} type="button" onClick={() => onCategorySelect(id)} className={`shrink-0 px-4 py-3 text-xs font-bold ${selectedCategory === id ? 'border-b-2 border-[#e60000] text-[#e60000]' : 'text-gray-600 hover:text-[#e60000]'}`}>{label}</button>)}
        </div>
      </nav>
    </header>
  );
}
