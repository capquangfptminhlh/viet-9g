import React from 'react';
import { BookOpen, Globe, Search, ShieldCheck } from 'lucide-react';

interface HeaderProps {
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

export default function Header({ searchQuery = '', onSearchChange = () => undefined, onCategorySelect = () => undefined, selectedCategory = 'all' }: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-100 bg-white font-sans">
      <div className="bg-[#e60000] text-xs text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />Trang thông tin độc lập; điều khoản gói và đăng ký do Viettel xác nhận.</span>
          <span className="hidden items-center gap-1.5 md:flex"><Globe className="h-4 w-4" />Thông tin tham khảo gói cước</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center">
        <a href="/" className="shrink-0" aria-label="Về trang chủ tracuugoicuoc.com">
          <div className="text-2xl font-black italic tracking-tight text-[#e60000]">TRACUU<span className="ml-1 rounded bg-[#e60000] px-1.5 py-0.5 text-[10px] not-italic text-white">goicuoc.com</span></div>
          <p className="mt-1 text-[10px] font-medium text-gray-500">Trang thông tin gói cước độc lập</p>
        </a>
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm gói cước" className="w-full rounded-full border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#e60000]" />
        </label>
        <a href="/tin-tuc" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 text-sm font-bold text-[#e60000] transition-colors hover:bg-red-100">
          <BookOpen className="h-4 w-4" />
          Tin tức & Hướng dẫn
        </a>
      </div>
      <nav className="border-t border-gray-100" aria-label="Điều hướng gói cước">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          <a href="/" className="shrink-0 px-4 py-3 text-xs font-bold text-gray-600 hover:text-[#e60000]">Trang chủ</a>
          {categories.map(([id, label]) => <button key={id} type="button" onClick={() => onCategorySelect(id)} className={`shrink-0 px-4 py-3 text-xs font-bold ${selectedCategory === id ? 'border-b-2 border-[#e60000] text-[#e60000]' : 'text-gray-600 hover:text-[#e60000]'}`}>{label}</button>)}
          <a href="/tin-tuc" className="ml-auto inline-flex shrink-0 items-center gap-1.5 px-4 py-3 text-xs font-bold text-gray-700 hover:text-[#e60000]"><BookOpen className="h-3.5 w-3.5" />Tin tức</a>
        </div>
      </nav>
    </header>
  );
}
