import React, { useState, useMemo } from 'react';
import { Zap, MonitorPlay, Phone, Crown, LayoutGrid } from 'lucide-react';
import { TelecomPackage } from '../types';
import { VIETTEL_PACKAGES } from '../data/packages';
import PackageCard from './PackageCard';

interface PackageGridProps {
  onSelectPackage: (pkgId: string) => void;
  onOpenDetails: (pkg: TelecomPackage) => void;
  searchQuery: string;
  onSearchReset: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function PackageGrid({
  onSelectPackage,
  onOpenDetails,
  searchQuery,
  selectedCategory,
  onCategoryChange
}: PackageGridProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  const categories = [
    { label: 'Tất cả gói', value: 'all', icon: LayoutGrid, iconColor: 'text-red-500' },
    { label: 'Gói HOT', value: 'hot', icon: Zap, iconColor: 'text-orange-500' },
    { label: 'Siêu tốc Data', value: 'data', icon: Zap, iconColor: 'text-red-500' },
    { label: 'Gói MXH', value: 'social', icon: MonitorPlay, iconColor: 'text-blue-600' },
    { label: 'Combo thoại', value: 'combo', icon: Phone, iconColor: 'text-red-400' },
    { label: 'Chu kỳ dài', value: 'long_term', icon: Crown, iconColor: 'text-red-600' },
  ];

  const filteredPackages = useMemo(() => {
    let result = [...VIETTEL_PACKAGES];

    // 1. Category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'hot') {
        result = result.filter((p) => p.popular);
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.dataLimit.toLowerCase().includes(q)
      );
    }

    // 3. Additional Filter (Lọc)
    if (filterType !== 'all') {
      if (filterType === 'under100') result = result.filter((p) => p.price < 100000);
      else if (filterType === '100to150') result = result.filter((p) => p.price >= 100000 && p.price <= 150000);
      else if (filterType === 'over150') result = result.filter((p) => p.price > 150000);
    }

    // 4. Sorting (Sắp xếp)
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'data_desc') {
      const parseData = (str: string) => parseFloat(str) || 0;
      result.sort((a, b) => parseData(b.dataPerDay) - parseData(a.dataPerDay));
    }

    return result;
  }, [selectedCategory, searchQuery, filterType, sortBy]);

  return (
    <section id="goi-cuoc" className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Sleek unified Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Categories (Left) */}
        <div className="flex items-center overflow-x-auto scrollbar-none gap-2">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.value;
            return (
              <React.Fragment key={cat.value}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : cat.iconColor}`} />
                  {cat.label}
                </button>
                {/* Subtle divider between items (except last) */}
                {index < categories.length - 1 && (
                  <div className="w-[1px] h-4 bg-gray-200 shrink-0"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dropdowns (Right) */}
        <div className="flex items-center gap-3 shrink-0 pl-2 md:border-l border-gray-100">
          <div className="relative bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-gray-200/60">
             <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Lọc:</span>
             <select
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="bg-transparent text-[13px] font-bold text-gray-800 focus:outline-none cursor-pointer appearance-none pr-4"
             >
               <option value="all">Tất cả</option>
               <option value="under100">Dưới 100k</option>
               <option value="100to150">100k - 150k</option>
               <option value="over150">Trên 150k</option>
             </select>
             <svg className="w-3.5 h-3.5 text-gray-500 absolute right-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>

          <div className="relative bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-gray-200/60">
             <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Sắp xếp:</span>
             <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-transparent text-[13px] font-bold text-gray-800 focus:outline-none cursor-pointer appearance-none pr-4"
             >
               <option value="popular">Phổ biến</option>
               <option value="price_asc">Giá tăng dần</option>
               <option value="price_desc">Giá giảm dần</option>
               <option value="data_desc">Data nhiều nhất</option>
             </select>
             <svg className="w-3.5 h-3.5 text-gray-500 absolute right-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

      </div>

      {/* Grid of Results */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelectPackage}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300 space-y-3">
          <p className="text-sm text-gray-500">Không tìm thấy gói cước phù hợp với bộ lọc.</p>
        </div>
      )}

    </section>
  );
}
