import React from 'react';
import { Globe, Zap, Gift, Info, ArrowRight, Crown } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { trackConversion } from '../utils/tracking';

interface PackageCardProps {
  pkg: VerifiedPackage;
  onSelect: (pkgId: string) => void;
  onOpenDetails: (pkg: VerifiedPackage) => void;
}

export function canRegisterPackage(pkg: Pick<VerifiedPackage, 'registration'>): boolean {
  return Boolean(pkg.registration);
}

export default function PackageCard({ pkg, onSelect, onOpenDetails }: PackageCardProps) {
  const dailyCost = Math.round(pkg.priceVnd / pkg.durationDays);

  const getTheme = () => {
    if (pkg.category === 'social' || pkg.name.includes('MXH')) {
      return { lightBg: 'bg-[#f5f3ff]', text: 'text-[#6d28d9]', border: 'border-[#ede9fe]' };
    }
    return { lightBg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', border: 'border-[#fee2e2]' };
  };

  const getCategoryName = () => {
    if (pkg.durationDays > 30) return 'Chu Kỳ Dài';
    switch (pkg.category) {
      case 'social': return 'Mạng Xã Hội';
      case 'combo': return 'Combo Thoại + Data';
      case 'data': return 'Siêu Tốc Data';
      default: return 'Gói Ưu Đãi';
    }
  };

  const theme = getTheme();
  return (
    <article 
      className="bg-white rounded-2xl flex flex-col justify-between overflow-hidden relative group transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200"
    >
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${theme.lightBg} ${theme.text} text-[10px] font-bold uppercase tracking-wider`}>
            <Crown className="w-3.5 h-3.5" />
            {getCategoryName()}
          </div>
          <div className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${theme.lightBg} ${theme.text}`}>
            Hạn dùng: {pkg.durationDays} ngày
          </div>
        </div>

        {/* Name & Price */}
        <div className="text-center mb-5">
          <h3 className="text-3xl sm:text-4xl font-black text-[#e60000] tracking-tight mb-2">
            {pkg.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {pkg.priceVnd.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-xs text-gray-500 font-medium uppercase">
              / {pkg.durationDays} ngày
            </span>
          </div>
          <p className="text-xs text-gray-500">
            ≈ {dailyCost.toLocaleString('vi-VN')}đ / ngày
          </p>
        </div>

        {/* Data Box */}
        <div className={`rounded-xl border ${theme.border} ${theme.lightBg} p-3.5 mb-4 flex items-center justify-between`}>
          <div className="flex flex-col gap-1 w-1/2 border-r border-gray-200/50">
            <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
              <Globe className={`w-3.5 h-3.5 ${theme.text}`} />
              Tổng dung lượng
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900">
              {pkg.dataAllowance ?? '—'}
            </div>
          </div>
          <div className="flex flex-col gap-1 w-1/2 pl-4">
            <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
              <Zap className={`w-3.5 h-3.5 ${theme.text}`} />
              Tốc độ cao
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900">
              {pkg.dataPerDay ?? '—'}
            </div>
          </div>
        </div>

        {/* Verified benefits */}
        <div className="space-y-2.5 mb-5 flex-1">
          {pkg.benefits.slice(0, 3).map((benefit, index) => (
            <div key={`${pkg.id}-benefit-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
              <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="leading-snug">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Bottom Feature Box */}
        <div className={`p-3 rounded-lg ${theme.lightBg} border ${theme.border} flex items-center gap-3`}>
          <div className={`w-10 h-10 rounded-md shrink-0 flex items-center justify-center ${theme.text === 'text-[#6d28d9]' ? 'bg-[#6d28d9]' : 'bg-[#e60000]'}`}>
             <Gift className="w-5 h-5 text-white" />
          </div>
          <p className="text-[11px] text-gray-700 leading-snug line-clamp-3">
            {pkg.eligibility[0] ?? pkg.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onOpenDetails(pkg)}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-white border border-[#e60000] text-[#e60000] text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
        >
          Chi tiết
          <Info className="w-4 h-4" />
        </button>

        {canRegisterPackage(pkg) && <button
          type="button"
          onClick={() => {
            trackConversion('click_register_sms', { package_id: pkg.id, price: pkg.priceVnd, name: pkg.name });
            onSelect(pkg.id);
          }}
          className="flex-[1.5] min-h-[44px] flex items-center justify-center gap-1.5 bg-[#e60000] text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-md transition-all active:scale-[0.98]"
        >
          Soạn tin đăng ký
          <ArrowRight className="w-4 h-4" />
        </button>}
      </div>
    </article>
  );
}
