import React from 'react';
import { Phone } from 'lucide-react';

export default function About({ config }: { config: { supportPhone: string } }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">Về TraCuuGoiCuoc.com</h1>
        <p className="leading-7 text-gray-700">
          TraCuuGoiCuoc.com là kênh giới thiệu/CTV độc lập, hỗ trợ người dùng tra cứu và so sánh thông tin gói cước. Website không phải là website do Viettel Telecom sở hữu hoặc vận hành.
        </p>
        <p className="leading-7 text-gray-700">
          Giá, ưu đãi, điều kiện và khả năng đăng ký phụ thuộc vào hệ thống Viettel tại thời điểm khách hàng thực hiện. Website chỉ hiển thị cú pháp khi có fact nguồn xác minh cho chính cú pháp đó.
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-700"><Phone className="h-4 w-4" /> Liên hệ hỗ trợ: {config.supportPhone}</p>
      </div>
    </main>
  );
}
