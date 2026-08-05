import React, { useState } from 'react';
import { Sparkles, RefreshCw, Zap, CirclePlay, Phone } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { canRegisterPackage } from './PackageCard';
import { getVerifiedDataDisplay } from './package-display';

export type RecommendationBudget = 'under100' | '100to150' | 'over150' | 'all';
export type RecommendationNeed = 'social' | 'combo' | 'data' | 'long_term';

export function recommendPackages(
  packages: VerifiedPackage[],
  budget: RecommendationBudget,
  need: RecommendationNeed,
): VerifiedPackage[] {
  let matches = [...packages];

  if (budget === 'under100') matches = matches.filter((pkg) => pkg.priceVnd < 100000);
  else if (budget === '100to150') matches = matches.filter((pkg) => pkg.priceVnd >= 100000 && pkg.priceVnd <= 150000);
  else if (budget === 'over150') matches = matches.filter((pkg) => pkg.priceVnd > 150000);

  if (need === 'social' || need === 'combo') return matches.filter((pkg) => pkg.category === need).slice(0, 3);
  if (need === 'long_term') return matches.filter((pkg) => pkg.durationDays >= 90).slice(0, 3);

  return matches
    .map((pkg, index) => ({ pkg, index, dailyDataValue: getVerifiedDataDisplay(pkg).dailyDataValue }))
    .sort((left, right) => {
      if (left.dailyDataValue === undefined) return right.dailyDataValue === undefined ? left.index - right.index : 1;
      if (right.dailyDataValue === undefined) return -1;
      return right.dailyDataValue - left.dailyDataValue || left.index - right.index;
    })
    .slice(0, 3)
    .map(({ pkg }) => pkg);
}

interface SmartRecommenderProps {
  packages: VerifiedPackage[];
  onSelectPackage: (pkgId: string) => void;
  onOpenDetails: (pkg: VerifiedPackage) => void;
}

export default function SmartRecommender({ packages, onSelectPackage, onOpenDetails }: SmartRecommenderProps) {
  const [step, setStep] = useState<number>(1);
  const [budget, setBudget] = useState<RecommendationBudget>('all');
  const [need, setNeed] = useState<RecommendationNeed>('social');
  const [result, setResult] = useState<VerifiedPackage[] | null>(null);

  const budgetOptions = [
    { id: 'under100', label: 'Dưới 100.000đ', icon: '💰' },
    { id: '100to150', label: '100k - 150.000đ', icon: '💎' },
    { id: 'over150', label: 'Trên 150.000đ', icon: '👑' },
    { id: 'all', label: 'Mọi mức giá', icon: '⚡' },
  ];

  const needOptions = [
    { id: 'social', label: 'Cày TikTok, Facebook, YouTube', desc: 'Miễn phí Data mạng xã hội', icon: CirclePlay, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { id: 'combo', label: 'Gọi thoại nội/ngoại mạng + Data', desc: 'Cả đàm thoại lẫn lên mạng', icon: Phone, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { id: 'data', label: 'Siêu tốc Data / Chiến game', desc: 'Dung lượng khủng hàng ngày', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { id: 'long_term', label: 'Dài lâu tiện lợi (6-12 tháng)', desc: 'Đăng ký 1 lần dùng cả năm', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ];

  const handleRecommend = (selectedNeed: RecommendationNeed) => {
    setNeed(selectedNeed);
    setResult(recommendPackages(packages, budget, selectedNeed));
    setStep(3);
  };

  const resetQuiz = () => {
    setStep(1);
    setResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 my-8">
      <div className="bg-gradient-to-r from-red-650 via-[#e60000] to-orange-500 rounded-2xl p-0.5 shadow-lg">
        <div className="bg-white rounded-[15px] p-5 sm:p-8">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#e60000] shrink-0 shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-100 text-[#e60000] px-2.5 py-0.5 rounded-full">
                  Tính Năng Trợ Lý AI
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Bạn Chưa Biết Chọn Gói Cước Nào?
                </h3>
              </div>
            </div>
            
            {step === 3 && (
              <button
                type="button"
                onClick={resetQuiz}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e60000] bg-gray-50 hover:bg-red-50 px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm lại từ đầu
              </button>
            )}
          </div>

          {/* Step 1: Choose Budget */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-sm font-bold text-gray-700">
                Bước 1/2: Ngân sách mỗi tháng bạn muốn chi trả cho 4G/5G là bao nhiêu?
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {budgetOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                        setBudget(item.id as RecommendationBudget);
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                      budget === item.id 
                        ? 'border-[#e60000] bg-red-50/50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-sm text-gray-800">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Needs */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  Bước 2/2: Bạn sử dụng mạng di động chủ yếu để làm gì?
                </span>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-400 hover:text-gray-700 underline cursor-pointer"
                >
                  Quay lại
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {needOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleRecommend(item.id as RecommendationNeed);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-4 ${
                        need === item.id ? 'border-[#e60000] bg-red-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${item.bg}`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Recommendations */}
          {step === 3 && result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Dựa trên yêu cầu của bạn, dưới đây là <strong className="text-[#e60000]">Top {result.length} gói cước phù hợp nhất</strong>:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.map((pkg, idx) => (
                  <div 
                    key={pkg.id} 
                    className="border-2 border-red-100 rounded-xl p-5 bg-gradient-to-b from-red-50/40 to-white flex flex-col justify-between relative overflow-hidden shadow-sm"
                  >
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-[#e60000] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl">
                        Đề xuất #1
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase font-mono mb-1">
                        Hạn dùng: {pkg.duration}
                      </div>
                      <h4 className="text-2xl font-black text-[#e60000] mb-2 font-mono">
                        {pkg.name}
                      </h4>
                      <div className="text-xl font-extrabold text-gray-900 mb-3">
                        {pkg.price.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-gray-600 space-y-1.5 mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Data: <strong>{getVerifiedDataDisplay(pkg).primary}</strong></span>
                        </div>
                        {pkg.benefits.slice(0, 2).map((benefit, index) => (
                          <div key={`${pkg.id}-benefit-${index}`} className="flex items-center gap-1.5">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(pkg)}
                        className="flex-1 py-2.5 min-h-[44px] text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
                      >
                        Chi tiết
                      </button>
                      {canRegisterPackage(pkg) && <button
                        type="button"
                        onClick={() => onSelectPackage(pkg.id)}
                        className="flex-1 py-2.5 min-h-[44px] text-xs font-bold text-white bg-[#e60000] hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center justify-center"
                      >
                        Đăng ký
                      </button>}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
