import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { canRegisterPackage } from './PackageCard';
import { getVerifiedDataDisplay } from './package-display';

interface SimLookupProps {
  packages: VerifiedPackage[];
  onSelectPackage: (pkgId: string) => void;
}

export function findCatalogPackages(packages: VerifiedPackage[], query: string): VerifiedPackage[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return packages;
  return packages.filter((pkg) => [pkg.name, pkg.code, pkg.description, pkg.category, ...pkg.benefits, ...pkg.eligibility]
    .some((value) => value.toLowerCase().includes(normalizedQuery)));
}

export function getFinderActionPackages(packages: VerifiedPackage[]): VerifiedPackage[] {
  return packages.filter(canRegisterPackage);
}

export default function SimLookup({ packages, onSelectPackage }: SimLookupProps) {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const results = findCatalogPackages(packages, query);
  const actionPackageIds = new Set(getFinderActionPackages(results).map((pkg) => pkg.id));

  const handleSearch = (event: React.SubmitEvent) => {
    event.preventDefault();
    setHasSearched(true);
  };

  return (
    <section id="tra-cuu" className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-red-700 via-[#D71920] to-orange-500 rounded-xl shadow-sm border border-red-200/20 overflow-hidden p-6 sm:p-8 lg:p-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-5 text-white space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-yellow-300">Danh mục đã xác minh</div>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black italic tracking-tighter leading-tight uppercase">Tìm gói cước phù hợp</h2>
            <p className="text-red-100 text-xs leading-relaxed max-w-xl mx-auto lg:mx-0">Tìm trong danh mục gói cước có thông tin hiện hành. Kết quả chỉ mô tả gói cước, không xác nhận khả năng áp dụng cho một thuê bao cụ thể.</p>
          </div>

          <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-xl shadow-sm border border-gray-200 text-gray-800">
            <form onSubmit={handleSearch} className="space-y-4">
              <label htmlFor="catalog-search" className="block text-xs font-bold text-gray-650 uppercase tracking-wider">Tìm theo tên, mã gói hoặc nhu cầu</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input id="catalog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: data, social, 5G" className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" />
                <button type="submit" className="py-3 px-5 bg-[#D71920] hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide rounded-lg transition-all flex items-center justify-center gap-2"><Search className="w-4 h-4" />Tìm gói cước</button>
              </div>
            </form>

            {hasSearched && <div className="mt-6 space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Filter className="w-3.5 h-3.5 text-[#D71920]" />Gói cước trong danh mục đã xác minh</h3>
              {results.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {results.map((pkg) => {
                  const data = getVerifiedDataDisplay(pkg);
                  return <div key={pkg.id} className="p-3 border border-red-100 bg-red-50/20 rounded-lg flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-[#D71920] bg-red-100/50 px-1.5 py-0.5 rounded">{pkg.name}</span>
                      <span className="block text-xs font-bold text-gray-700 font-mono">{pkg.priceVnd.toLocaleString('vi-VN')}đ / {pkg.durationDays} ngày</span>
                      <span className="block text-[10px] text-gray-450">{data.primary}</span>
                    </div>
                    {actionPackageIds.has(pkg.id) && <button type="button" onClick={() => onSelectPackage(pkg.id)} className="px-3 py-1 bg-[#D71920] hover:bg-red-700 text-white font-bold text-xs rounded transition-colors cursor-pointer shrink-0">Đăng ký</button>}
                  </div>;
                })}
              </div> : <p className="text-xs text-gray-500">Không tìm thấy gói cước phù hợp trong danh mục đã xác minh.</p>}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
