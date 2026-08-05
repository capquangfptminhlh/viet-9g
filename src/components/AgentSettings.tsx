import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface AgentSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentSettings({ isOpen, onClose }: AgentSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-900"><ShieldCheck className="h-5 w-5 text-[#e60000]" />Thông tin đăng ký</div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded p-1 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">Cú pháp đăng ký được xác minh theo từng gói cước. Xem chi tiết gói để tham khảo thông tin hiện có.</p>
      </div>
    </div>
  );
}
