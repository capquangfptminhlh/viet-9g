import React, { useState } from 'react';
import { X, MessageSquare, Copy, ClipboardCheck, Send, QrCode, Sparkles } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { trackConversion } from '../utils/tracking';
import { canRegisterPackage } from './PackageCard';

interface PackageModalProps {
  pkg: VerifiedPackage | null;
  onClose: () => void;
  defaultTab?: 'sms' | 'qr' | 'details';
}

export default function PackageModal({ pkg, onClose, defaultTab = 'sms' }: PackageModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sms' | 'qr' | 'details'>(defaultTab);

  if (!pkg) return null;

  const registrationEligible = canRegisterPackage(pkg);
  const smsBody = pkg.registration?.syntax ?? '';
  const smsNumber = pkg.registration?.smsNumber ?? 290;
  
  const getSmsHref = () => {
    return `sms:${smsNumber}?body=${encodeURIComponent(smsBody)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(smsBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">
        
        {/* Banner Header */}
        <div className="relative bg-gradient-to-br from-[#e60000] to-[#b30000] p-6 sm:p-8 text-white shrink-0 overflow-hidden">
          {/* Decorative background curves */}
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
             <svg viewBox="0 0 400 400" className="absolute right-[-10%] top-[-20%] w-[120%] h-[150%]">
               <path fill="#ffffff" d="M37.5,-63.9C49.9,-55.8,62,-46.7,71.2,-34.5C80.4,-22.3,86.6,-7,84.9,8C83.2,23,73.6,37.8,61.9,49.8C50.2,61.8,36.4,71.1,21.1,76C5.8,80.9,-11.1,81.3,-26.8,77.1C-42.5,72.9,-57.1,64.1,-66.4,51C-75.7,37.9,-79.8,20.6,-79.5,4.3C-79.3,-12,-74.7,-27.2,-65.4,-39.8C-56.1,-52.4,-42.2,-62.4,-27.9,-68.8C-13.6,-75.2,1.1,-77.9,13.6,-74.3C26.1,-70.7,25.1,-72.1,37.5,-63.9Z" transform="translate(200 200) scale(1.1)" />
             </svg>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative z-10 space-y-3 pr-8">
            <div className="inline-flex items-center gap-1.5 bg-[#ffc107] text-black px-2.5 py-1 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              HƯỚNG DẪN CÚ PHÁP ĐĂNG KÝ
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-black flex flex-wrap items-baseline gap-2 uppercase tracking-tight">
              GÓI CƯỚC {pkg.name} 
              <span className="text-sm sm:text-base font-bold text-white/90 italic tracking-normal normal-case">
                ({pkg.priceVnd.toLocaleString('vi-VN')}đ/ {pkg.durationDays} ngày)
              </span>
            </h3>
            
            <p className="text-sm text-white/90 font-medium leading-relaxed max-w-xl">
              {pkg.description}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-white text-sm font-bold text-gray-500 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-4 px-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'sms' ? 'border-[#e60000] text-[#e60000]' : 'border-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            Cú Pháp SMS
          </button>
          {registrationEligible && <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-4 px-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'qr' ? 'border-[#e60000] text-[#e60000]' : 'border-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <QrCode className="w-4.5 h-4.5" />
            Quét Mã QR
          </button>}
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 px-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'details' ? 'border-[#e60000] text-[#e60000]' : 'border-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            Chi Tiết Gói
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* TAB 1: SMS SYNTAX */}
          {activeTab === 'sms' && (
            registrationEligible ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-center gap-3 text-[#e60000] text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                <span className="w-6 h-[1px] bg-[#e60000]"></span>
                SOẠN TIN NHẮN THEO CÚ PHÁP:
                <span className="w-6 h-[1px] bg-[#e60000]"></span>
              </div>

              {/* Big Syntax Box */}
              <div className="bg-[#fef2f2] border border-red-200/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center">
                
                {/* Decorative Icon Left */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-red-100/80 rounded-full hidden sm:flex items-center justify-center">
                  <Send className="w-7 h-7 text-[#e60000] ml-1" />
                </div>

                {/* Agent Tag */}
                <div className="absolute top-4 right-4 bg-red-50 text-[#e60000] font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded border border-red-100">
                  Kênh SMS: {smsNumber}
                </div>

                <div className="text-center space-y-3 z-10 w-full pt-4 sm:pt-0">
                  <h4 className="text-3xl sm:text-4xl font-black text-[#e60000] tracking-wider select-all font-mono">
                    {smsBody}
                  </h4>
                  <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">GỬI</p>
                  <div className="inline-block bg-white border border-gray-200 shadow-sm rounded-xl px-10 py-3">
                    <span className="text-3xl sm:text-4xl font-black text-[#e60000] font-mono leading-none">
                      {smsNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-3.5 px-4 min-h-[50px] bg-white hover:bg-red-50 text-[#e60000] text-sm font-bold rounded-xl border border-[#e60000] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="w-5 h-5 text-[#e60000]" />
                      Đã Sao Chép Cú Pháp
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-[#e60000]" />
                      Sao Chép Cú Pháp
                    </>
                  )}
                </button>

                {registrationEligible && <a
                  href={getSmsHref()}
                  onClick={() => trackConversion('click_open_sms_app', { package_id: pkg.id, price: pkg.priceVnd, name: pkg.name })}
                  className="w-full py-3.5 px-4 min-h-[50px] bg-[#e60000] hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-5 h-5" />
                  Mở ứng dụng SMS
                </a>}
              </div>

              <p className="text-[11px] text-gray-500 italic text-center px-4">
                Cú pháp và số gửi được hiển thị từ thông tin xác minh của gói cước.
              </p>
            </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-semibold text-amber-900">
                Thông tin đăng ký đang chờ xác minh.
              </div>
            )
          )}

          {/* TAB 2: QR CODE SCAN */}
          {registrationEligible && activeTab === 'qr' && (
            <div className="space-y-6 flex flex-col items-center animate-fade-in py-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center">Quét Thẻ Để Soạn Tin Bản Nháp</p>
              
              <div className="relative border-4 border-[#e60000] p-4 bg-white rounded-2xl shadow-lg flex items-center justify-center w-56 h-56">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=H&data=${encodeURIComponent(`SMSTO:${smsNumber}:${smsBody}`)}`}
                  alt={`Mã QR Đăng ký ${pkg.name}`}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#e60000] border-[3px] border-white flex items-center justify-center shadow-md">
                  <span className="text-[12px] font-black text-white tracking-tighter">VT</span>
                </div>
              </div>

              <div className="text-center max-w-sm space-y-3 mt-2">
                <p className="text-sm font-bold text-gray-800">📱 Hướng dẫn quét mã QR</p>
                <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-left text-[13px] text-gray-600 space-y-2">
                  <p><strong className="text-gray-900">Cách 1:</strong> Mở ứng dụng <strong className="text-[#e60000]">Zalo</strong>, nhấp biểu tượng Quét QR bên cạnh thanh tìm kiếm.</p>
                  <p><strong className="text-gray-900">Cách 2:</strong> Mở ứng dụng <strong className="text-gray-900">Camera</strong> mặc định của điện thoại để quét mã.</p>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-[11px] mt-3">
                    <strong>Lưu ý:</strong> Chạm vào liên kết xuất hiện sau khi quét để mở SMS tự động.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIFIC DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-fade-in text-sm text-gray-800 py-2">
              <div className="space-y-3">
                <h4 className="font-bold text-[#e60000] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Đặc quyền nhận được:
                </h4>
                <ul className="space-y-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  {pkg.benefits.map((benefit, idx) => (
                    <li key={`${pkg.id}-benefit-${idx}`} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 shrink-0 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Điều kiện áp dụng đăng ký:</h4>
                <ul className="space-y-2">
                  {pkg.rules.map((rule, idx) => (
                    <li key={idx} className="text-[13px] text-gray-600 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0 mt-1.5"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <div className="text-[13px] text-gray-500 flex items-center gap-1.5">
            <span>Kênh bảo trợ:</span>
            <span className="font-bold text-[#e60000]">Điểm cung cấp gói cước</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            Đóng Lại
          </button>
        </div>

      </div>
    </div>
  );
}
