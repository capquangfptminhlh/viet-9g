import React, { useState } from 'react';
import { ClipboardCheck, Copy, MessageSquare, QrCode, Send, Sparkles, X } from 'lucide-react';
import type { VerifiedPackage } from '../data/verified-package';
import { trackConversion } from '../utils/tracking';
import { canRegisterPackage } from './PackageCard';

interface PackageModalProps {
  pkg: VerifiedPackage | null;
  onClose: () => void;
  defaultTab?: 'sms' | 'qr' | 'details';
}

export default function PackageModal({ pkg, onClose, defaultTab = 'details' }: PackageModalProps) {
  const [copied, setCopied] = useState(false);
  const [requestedTab, setRequestedTab] = useState<'sms' | 'qr' | 'details'>(defaultTab);
  if (!pkg) return null;

  const registrationEligible = canRegisterPackage(pkg);
  const activeTab = registrationEligible ? requestedTab : 'details';
  const smsBody = pkg.registration?.syntax ?? '';
  const smsNumber = pkg.registration?.smsNumber ?? 290;

  const copySyntax = async () => {
    await navigator.clipboard.writeText(smsBody);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative bg-gradient-to-br from-[#e60000] to-[#b30000] p-6 text-white">
          <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 rounded p-1 hover:bg-white/20"><X className="h-5 w-5" /></button>
          <div className="pr-8">
            <p className="text-xs font-bold uppercase tracking-wider">Chi tiết gói cước</p>
            <h3 className="mt-2 text-2xl font-black">{pkg.name}</h3>
            <p className="mt-1 text-sm text-white/90">{pkg.priceVnd.toLocaleString('vi-VN')}đ / {pkg.durationDays} ngày</p>
            <p className="mt-3 text-sm text-white/90">{pkg.description}</p>
          </div>
        </div>
        <div className="flex border-b border-gray-200 text-sm font-bold text-gray-500">
          {registrationEligible && <button type="button" onClick={() => setRequestedTab('sms')} className={`flex-1 px-3 py-4 ${activeTab === 'sms' ? 'border-b-2 border-[#e60000] text-[#e60000]' : ''}`}><MessageSquare className="mr-2 inline h-4 w-4" />Cú Pháp SMS</button>}
          {registrationEligible && <button type="button" onClick={() => setRequestedTab('qr')} className={`flex-1 px-3 py-4 ${activeTab === 'qr' ? 'border-b-2 border-[#e60000] text-[#e60000]' : ''}`}><QrCode className="mr-2 inline h-4 w-4" />Quét Mã QR</button>}
          <button type="button" onClick={() => setRequestedTab('details')} className={`flex-1 px-3 py-4 ${activeTab === 'details' ? 'border-b-2 border-[#e60000] text-[#e60000]' : ''}`}><Sparkles className="mr-2 inline h-4 w-4" />Chi Tiết Gói</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && <div className="space-y-6 text-sm text-gray-700">
            <div><h4 className="mb-3 font-bold text-gray-900">Quyền lợi được ghi nhận</h4><ul className="space-y-2">{pkg.benefits.map((benefit, index) => <li key={`${pkg.id}-benefit-${index}`}>{benefit}</li>)}</ul></div>
            <div><h4 className="mb-3 font-bold text-gray-900">Điều kiện áp dụng</h4><ul className="space-y-2">{pkg.rules.map((rule, index) => <li key={`${pkg.id}-rule-${index}`}>{rule}</li>)}</ul></div>
          </div>}
          {registrationEligible && activeTab === 'sms' && <div className="space-y-5 text-center">
            <p className="text-sm font-bold text-gray-700">Cú pháp đã được xác minh cho gói này</p>
            <div className="rounded-xl border border-red-100 bg-red-50 p-5"><p className="font-mono text-2xl font-black text-[#e60000]">{smsBody}</p><p className="mt-2 text-sm font-bold text-gray-600">Gửi {smsNumber}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={copySyntax} className="rounded-xl border border-[#e60000] px-4 py-3 font-bold text-[#e60000]">{copied ? <><ClipboardCheck className="mr-2 inline h-4 w-4" />Đã sao chép</> : <><Copy className="mr-2 inline h-4 w-4" />Sao chép cú pháp</>}</button>
              <a href={`sms:${smsNumber}?body=${encodeURIComponent(smsBody)}`} onClick={() => trackConversion('click_open_sms_app', { package_id: pkg.id, price: pkg.priceVnd, name: pkg.name })} className="rounded-xl bg-[#e60000] px-4 py-3 font-bold text-white"><Send className="mr-2 inline h-4 w-4" />Mở ứng dụng SMS</a>
            </div>
          </div>}
          {registrationEligible && activeTab === 'qr' && <div className="flex flex-col items-center gap-4 text-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=H&data=${encodeURIComponent(`SMSTO:${smsNumber}:${smsBody}`)}`} alt={`Mã QR đăng ký ${pkg.name}`} className="h-56 w-56" referrerPolicy="no-referrer" /><p className="text-sm text-gray-600">Quét mã để soạn tin nhắn theo cú pháp đã xác minh.</p></div>}
        </div>
        <div className="border-t border-gray-100 p-4 text-right"><button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-bold text-gray-700">Đóng</button></div>
      </div>
    </div>
  );
}
