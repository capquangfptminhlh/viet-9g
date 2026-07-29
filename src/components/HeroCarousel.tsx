import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { AgentConfig } from '../types';

interface HeroCarouselProps {
  config: AgentConfig;
  onSelectPackage: (pkgCode: string) => void;
  onOpenSettings: () => void;
}

export default function HeroCarousel({ config, onSelectPackage }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: 'GÓI CƯỚC KHỦNG NHẤT 2026',
      title: 'MXH120 - Miễn Phí Trọn Gói Mạng Xã Hội',
      subtitle: 'Xem TikTok, lướt Facebook & cày YouTube không tốn một giọt data tốc độ cao!',
      features: [
        'Dùng Data thả ga cho YouTube, TikTok, Facebook, Messenger',
        'Tặng 30 GB Data tốc độ cao sử dụng ngoài ứng dụng (1GB/ngày)',
        'Miễn phí hoàn toàn gọi nội mạng cuộc gọi dưới 10 phút',
        'Tặng thêm 30 phút đàm thoại ngoại mạng miễn phí'
      ],
      price: '120.000đ',
      duration: '30 ngày',
      packageId: 'mxh120',
      gradient: 'from-[#cc0000] to-[#ff5e00]'
    },
    {
      badge: 'COMBO LÊN MẠNG & GỌI ĐIỆN QUỐC DÂN',
      title: 'V120B - Đăng Ký Nhiều Nhất',
      subtitle: 'Thăng hoa truyền thông với combo data tốc độ cao hằng ngày kết hợp đàm thoại không giới hạn.',
      features: [
        '1.5 GB Data tốc độ tốc cực cao mỗi ngày (tổng 45 GB/tháng)',
        'Miễn phí 100% cuộc gọi nội mạng Viettel dưới 10 phút',
        'Tặng 50 phút gọi mạng di động khác hằng tháng',
        'Cú pháp đăng ký nhanh thông qua cổng 290 bảo mật'
      ],
      price: '120.000đ',
      duration: '30 ngày',
      packageId: 'v120b',
      gradient: 'from-[#6d28d9] to-[#9333ea]'
    },
    {
      badge: 'SIÊU TỐC DI ĐỘNG KHÔNG GIỚI HẠN',
      title: 'SD120 - 60GB Data Tốc Độ Cao',
      subtitle: 'Trải nghiệm đỉnh cao của mạng 4G/5G Viettel với băng tần ưu tiên lớn nhất phục vụ công nghệ.',
      features: [
        '2 GB/ngày Data tốc độ cao liên tục trong tháng (tổng 60 GB)',
        'Hỗ trợ công nghệ 5G Ultra siêu mượt thế hệ mới',
        'Miễn phí gói Standard trên ứng dụng giải trí TV360',
        'Hạn chế ngắt kết nối đột ngột hoặc trừ cước âm tài khoản'
      ],
      price: '120.000đ',
      duration: '30 ngày',
      packageId: 'sd120',
      gradient: 'from-[#cc0000] to-[#b91c1c]'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="w-full bg-slate-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Banner Container */}
        <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r ${slide.gradient} text-white transition-all duration-700 ease-in-out flex flex-col md:flex-row min-h-[400px]`}>
          
          {/* Large Watermark */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end overflow-hidden pointer-events-none opacity-[0.08]">
            <span className="text-[200px] md:text-[300px] font-black italic tracking-tighter leading-none pr-8">
              5G
            </span>
          </div>

          {/* Content Area */}
          <div className="relative z-10 p-6 md:p-10 lg:p-12 w-full max-w-3xl flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 mb-4">
               <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                 {slide.badge}
               </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight uppercase">
              {slide.title}
            </h2>
            
            <p className="text-white/90 text-sm sm:text-base font-medium mb-6 leading-relaxed max-w-2xl">
              {slide.subtitle}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {slide.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                  <div className="w-4 h-4 rounded-full bg-white/25 shrink-0 flex items-center justify-center mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="opacity-90">{feat}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6 mt-auto">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Giá gói đăng ký</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-yellow-300">
                    {slide.price}
                  </span>
                  <span className="text-sm font-bold">/ {slide.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectPackage(slide.packageId)}
                  className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-red-900 font-black text-sm uppercase rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                >
                  ĐĂNG KÝ NGAY
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={config.zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-transparent border-2 border-white/40 hover:bg-white/10 text-white font-bold text-sm rounded-full transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
                  </svg>
                  Hỏi Đại Lý
                </a>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors text-white"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
