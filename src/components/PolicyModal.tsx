import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | 'disclaimer';
  onClose: () => void;
}

const titles = {
  privacy: 'Thông tin riêng tư',
  terms: 'Điều khoản tham khảo',
  disclaimer: 'Lưu ý',
};

export default function PolicyModal({ isOpen, type, onClose }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-gray-900">
            <ShieldCheck className="h-5 w-5 text-[#e60000]" />
            {titles[type]}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-gray-700">
          <p>tracuugoicuoc.com là trang thông tin độc lập. Nội dung chỉ nhằm tham khảo.</p>
          <p>Điều khoản gói cước và việc đăng ký do Viettel xác nhận.</p>
        </div>
      </div>
    </div>
  );
}
