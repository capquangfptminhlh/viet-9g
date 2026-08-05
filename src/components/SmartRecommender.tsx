import React, { useState } from 'react';
import { CirclePlay, RefreshCw, Sparkles, Zap, Phone } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { canRegisterPackage } from './PackageCard';
import { getVerifiedDataDisplay } from './package-display';

export type RecommendationBudget = 'under100' | '100to150' | 'over150' | 'all';
export type RecommendationNeed = 'social' | 'combo' | 'data' | 'long_term';

export function recommendPackages(packages: VerifiedPackage[], budget: RecommendationBudget, need: RecommendationNeed): VerifiedPackage[] {
  let matches = [...packages];
  if (budget === 'under100') matches = matches.filter((pkg) => pkg.priceVnd < 100000);
  else if (budget === '100to150') matches = matches.filter((pkg) => pkg.priceVnd >= 100000 && pkg.priceVnd <= 150000);
  else if (budget === 'over150') matches = matches.filter((pkg) => pkg.priceVnd > 150000);
  if (need === 'social' || need === 'combo') return matches.filter((pkg) => pkg.category === need).slice(0, 3);
  if (need === 'long_term') return matches.filter((pkg) => pkg.durationDays >= 90).slice(0, 3);
  return matches.map((pkg, index) => ({ pkg, index, dailyDataValue: getVerifiedDataDisplay(pkg).dailyDataValue }))
    .sort((left, right) => {
      if (left.dailyDataValue === undefined) return right.dailyDataValue === undefined ? left.index - right.index : 1;
      if (right.dailyDataValue === undefined) return -1;
      return right.dailyDataValue - left.dailyDataValue || left.index - right.index;
    }).slice(0, 3).map(({ pkg }) => pkg);
}

export function getRecommendationActionPackages(packages: VerifiedPackage[]): VerifiedPackage[] {
  return packages.filter(canRegisterPackage);
}

interface SmartRecommenderProps {
  packages: VerifiedPackage[];
  onSelectPackage: (pkgId: string) => void;
  onOpenDetails: (pkg: VerifiedPackage) => void;
}

const budgetOptions: { id: RecommendationBudget; label: string }[] = [
  { id: 'under100', label: 'Dưới 100.000đ' }, { id: '100to150', label: '100.000đ–150.000đ' }, { id: 'over150', label: 'Trên 150.000đ' }, { id: 'all', label: 'Mọi mức giá' },
];
const needOptions: { id: RecommendationNeed; label: string; desc: string; icon: typeof Zap }[] = [
  { id: 'social', label: 'Nhóm mạng xã hội', desc: 'Lọc theo nhóm danh mục đã xác minh', icon: CirclePlay },
  { id: 'combo', label: 'Nhóm combo', desc: 'Lọc theo nhóm danh mục đã xác minh', icon: Phone },
  { id: 'data', label: 'Ưu tiên dữ liệu', desc: 'Sắp xếp theo dữ liệu đã ghi nhận', icon: Zap },
  { id: 'long_term', label: 'Chu kỳ từ 90 ngày', desc: 'Lọc theo thời hạn đã ghi nhận', icon: Sparkles },
];

export default function SmartRecommender({ packages, onSelectPackage, onOpenDetails }: SmartRecommenderProps) {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState<RecommendationBudget>('all');
  const [result, setResult] = useState<VerifiedPackage[] | null>(null);
  const actionIds = new Set(getRecommendationActionPackages(result ?? []).map((pkg) => pkg.id));
  const reset = () => { setStep(1); setResult(null); };

  return <section className="mx-auto my-8 max-w-7xl px-4">
    <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3"><Sparkles className="h-7 w-7 text-[#e60000]" /><div><p className="text-xs font-bold uppercase tracking-wide text-[#e60000]">Bộ lọc gói đã xác minh</p><h3 className="text-xl font-black text-gray-900">Lọc danh mục gói cước</h3></div></div>
        {step === 3 && <button type="button" onClick={reset} className="text-xs font-bold text-gray-600"><RefreshCw className="mr-1 inline h-3.5 w-3.5" />Làm lại</button>}
      </div>
      {step === 1 && <div className="space-y-5"><p className="text-sm font-bold text-gray-700">Bước 1/2: Chọn khoảng giá để lọc danh mục.</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{budgetOptions.map((item) => <button key={item.id} type="button" onClick={() => { setBudget(item.id); setStep(2); }} className="rounded-xl border border-gray-200 p-4 text-left text-sm font-bold text-gray-800 hover:border-[#e60000]">{item.label}</button>)}</div></div>}
      {step === 2 && <div className="space-y-5"><div className="flex justify-between"><p className="text-sm font-bold text-gray-700">Bước 2/2: Chọn cách lọc danh mục.</p><button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 underline">Quay lại</button></div><div className="grid gap-3 sm:grid-cols-2">{needOptions.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => { setResult(recommendPackages(packages, budget, item.id)); setStep(3); }} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#e60000]"><Icon className="h-6 w-6 text-[#e60000]" /><span><span className="block text-sm font-bold text-gray-900">{item.label}</span><span className="text-xs text-gray-500">{item.desc}</span></span></button>; })}</div></div>}
      {step === 3 && result && <div className="space-y-5"><p className="text-sm text-gray-700">Các gói khớp bộ lọc đã chọn.</p><div className="grid gap-4 sm:grid-cols-3">{result.map((pkg) => <article key={pkg.id} className="flex flex-col justify-between rounded-xl border border-red-100 p-5"><div><p className="text-xs text-gray-500">{pkg.durationDays} ngày</p><h4 className="mt-1 text-2xl font-black text-[#e60000]">{pkg.name}</h4><p className="mt-2 font-bold text-gray-900">{pkg.priceVnd.toLocaleString('vi-VN')}đ</p><p className="mt-3 text-sm text-gray-600">Data: {getVerifiedDataDisplay(pkg).primary}</p><ul className="mt-2 text-xs text-gray-600">{pkg.benefits.slice(0, 2).map((benefit, index) => <li key={`${pkg.id}-${index}`}>{benefit}</li>)}</ul></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => onOpenDetails(pkg)} className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700">Chi tiết</button>{actionIds.has(pkg.id) && <button type="button" onClick={() => onSelectPackage(pkg.id)} className="flex-1 rounded-lg bg-[#e60000] px-3 py-2 text-xs font-bold text-white">Đăng ký</button>}</div></article>)}</div></div>}
    </div>
  </section>;
}
