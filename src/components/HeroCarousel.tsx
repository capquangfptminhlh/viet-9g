import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { canRegisterPackage } from './PackageCard';

interface HeroCarouselProps {
  packages: VerifiedPackage[];
  onSelectPackage: (pkgId: string) => void;
}

const gradients: Record<VerifiedPackage['category'], string> = {
  hot: 'from-[#cc0000] to-[#ff5e00]',
  data: 'from-[#cc0000] to-[#b91c1c]',
  social: 'from-[#6d28d9] to-[#9333ea]',
  combo: 'from-[#0f766e] to-[#0ea5e9]',
  long_term: 'from-[#92400e] to-[#f59e0b]',
};

export default function HeroCarousel({ packages, onSelectPackage }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = useMemo(() => packages.map((pkg) => ({
    pkg,
    gradient: gradients[pkg.category],
    features: [...pkg.benefits, ...pkg.eligibility].slice(0, 4),
  })), [packages]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide % slides.length];
  const { pkg } = slide;

  return (
    <div className="w-full bg-slate-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r ${slide.gradient} text-white transition-all duration-700 ease-in-out flex flex-col md:flex-row min-h-[400px]`}>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end overflow-hidden pointer-events-none opacity-[0.08]">
            <span className="text-[200px] md:text-[300px] font-black italic tracking-tighter leading-none pr-8">5G</span>
          </div>

          <div className="relative z-10 p-6 md:p-10 lg:p-12 w-full max-w-3xl flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm">Thông tin gói đã xác minh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight uppercase">{pkg.name}</h2>
            <p className="text-white/90 text-sm sm:text-base font-medium mb-6 leading-relaxed max-w-2xl">{pkg.description}</p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {slide.features.map((feature, index) => (
                <li key={`${pkg.id}-feature-${index}`} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                  <div className="w-4 h-4 rounded-full bg-white/25 shrink-0 flex items-center justify-center mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="opacity-90">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6 mt-auto">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Giá gói đã xác minh</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-yellow-300">{pkg.priceVnd.toLocaleString('vi-VN')}đ</span>
                  <span className="text-sm font-bold">/ {pkg.durationDays} ngày</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {canRegisterPackage(pkg) && <button type="button" onClick={() => onSelectPackage(pkg.id)} className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-red-900 font-black text-sm uppercase rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                  ĐĂNG KÝ NGAY <ArrowRight className="w-4 h-4" />
                </button>}
                <span className="px-6 py-3.5 text-sm font-bold text-white/90">Thông tin tham khảo</span>
              </div>
            </div>
          </div>

          {slides.length > 1 && <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
            <button type="button" onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors text-white"><ArrowLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors text-white"><ArrowRight className="w-5 h-5" /></button>
          </div>}
        </div>
      </div>
    </div>
  );
}
