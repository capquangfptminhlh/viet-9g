import React from 'react';
import { Globe, Phone } from 'lucide-react';
import type { AgentConfig } from '../types';

interface FooterProps {
  config: AgentConfig;
  onOpenPolicy?: (type: 'privacy' | 'terms' | 'disclaimer') => void;
}

export default function Footer({ config }: FooterProps) {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white text-sm text-gray-600">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-black text-[#e60000]">
            <Globe className="h-5 w-5" />
            tracuugoicuoc.com
          </div>
          <p>Đây là trang thông tin độc lập, cung cấp nội dung tham khảo về gói cước.</p>
          <p>Điều khoản gói và việc đăng ký do Viettel xác nhận.</p>
        </div>
        <div className="space-y-3 md:text-right">
          <p className="font-bold text-gray-800">Liên hệ tham khảo</p>
          <a className="inline-flex items-center gap-2 hover:text-[#e60000]" href={`tel:${config.supportPhone}`}>
            <Phone className="h-4 w-4" />
            {config.supportPhone}
          </a>
        </div>
      </div>
    </footer>
  );
}
