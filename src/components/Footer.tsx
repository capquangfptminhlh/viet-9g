import React from 'react';
import { BookOpen, CheckCircle2, ExternalLink, Info, Search, ShieldCheck } from 'lucide-react';

const packageLinks = [
  ['Gói data', '/goi-cuoc/data'],
  ['Gói mạng xã hội', '/goi-cuoc/social'],
  ['Gói combo thoại + data', '/goi-cuoc/combo'],
  ['Gói chu kỳ dài', '/goi-cuoc/long_term'],
];

const guideLinks = [
  ['Tin tức & Hướng dẫn', '/tin-tuc'],
  ['Kiểm tra dung lượng', '/posts/cú-pháp-kiểm-tra-dung-lượng-data-4g-viettel-còn-lại'],
  ['Hủy gia hạn 4G', '/posts/cach-huy-gia-han-4g-viettel'],
  ['Kiểm tra số điện thoại', '/posts/cach-kiem-tra-so-dien-thoai-viettel-dang-dung'],
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-[#0b1220] text-sm text-slate-300">
      <div className="border-b border-slate-800 bg-[#0f172a]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div><p className="font-bold text-white">Thông tin có nguồn</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Ưu tiên dữ kiện gói cước đã được đối chiếu với nguồn Viettel trước khi hiển thị.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div><p className="font-bold text-white">Kiểm tra điều kiện trước khi đăng ký</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Khả năng đăng ký và ưu đãi có thể phụ thuộc từng thuê bao tại thời điểm thực hiện.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
            <div><p className="font-bold text-white">Trang thông tin độc lập</p><p className="mt-1 text-xs leading-relaxed text-slate-400">tracuugoicuoc.com không phải website chính thức của Viettel.</p></div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <a href="/" className="inline-flex items-center font-black text-white" aria-label="tracuugoicuoc.com">
            <span className="text-xl italic tracking-tight">TRACUU</span>
            <span className="ml-1 rounded bg-[#e60000] px-1.5 py-0.5 text-[10px] not-italic">goicuoc.com</span>
          </a>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Trang thông tin độc lập hỗ trợ tra cứu dữ kiện gói cước, hướng dẫn sử dụng và các lưu ý liên quan đến dịch vụ di động. Điều kiện gói và việc đăng ký cuối cùng do hệ thống Viettel xác nhận.
          </p>
          <a href="https://098.viettel.vn/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 px-4 font-bold text-white transition-colors hover:border-red-500 hover:text-red-300">
            <ExternalLink className="h-4 w-4" />
            Kiểm tra trực tiếp trên Viettel
          </a>
        </div>

        <div className="md:col-span-3">
          <h3 className="mb-4 font-bold uppercase tracking-wider text-white">Gói cước</h3>
          <ul className="space-y-3">
            {packageLinks.map(([label, href]) => <li key={href}><a href={href} className="text-slate-400 transition-colors hover:text-white">{label}</a></li>)}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="mb-4 flex items-center gap-2 font-bold uppercase tracking-wider text-white"><BookOpen className="h-4 w-4 text-red-400" />Tin tức & Tiện ích</h3>
          <ul className="space-y-3">
            {guideLinks.map(([label, href]) => <li key={href}><a href={href} className="text-slate-400 transition-colors hover:text-white">{label}</a></li>)}
          </ul>
          <a href="/tin-tuc" className="mt-5 inline-flex items-center gap-2 font-bold text-red-300 hover:text-red-200"><Search className="h-4 w-4" />Xem tất cả bài hướng dẫn</a>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-[#070d18]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 tracuugoicuoc.com. Nội dung tham khảo, không đại diện cho Viettel.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/ve-chung-toi" className="hover:text-white">Về chúng tôi</a>
            <a href="/chinh-sach-bao-mat" className="hover:text-white">Chính sách bảo mật</a>
            <a href="/dieu-khoan-su-dung" className="hover:text-white">Điều khoản sử dụng</a>
            <a href="/tin-tuc" className="hover:text-white">Tin tức</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
