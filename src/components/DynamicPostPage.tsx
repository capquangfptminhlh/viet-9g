import React from 'react';
import { TelecomPackage, AgentConfig } from '../types';
import { ShieldCheck, Phone, ArrowLeft, Send } from 'lucide-react';
import { SMS_NUMBER, buildSmsSyntax, buildSmsUri } from '../config/agent-code';

interface DynamicPostPageProps {
  pkg: TelecomPackage;
  config: AgentConfig;
  rawPath?: string;
}

export default function DynamicPostPage({ pkg, config, rawPath }: DynamicPostPageProps) {
  // Convert URL path back to readable title query
  const titleQuery = rawPath
    ? rawPath
        .replace(/-/g, ' ')
        .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    : pkg.name;

  const registrationEligible = pkg.registrationEligible === true && pkg.status === 'active';
  const packageCode = pkg.code ?? pkg.name;
  const smsSyntax = registrationEligible ? buildSmsSyntax(packageCode) : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-red-200 selection:text-red-900">
      {/* Mini Brand Banner */}
      <div className="bg-[#D71920] text-white text-xs py-3 px-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a 
            href="/" 
            className="flex items-center gap-1 hover:underline font-bold text-xs cursor-pointer text-white/90 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </a>
          <a href={`tel:${config.supportPhone.replace(/\./g, '')}`} className="flex items-center gap-1 hover:underline font-bold text-xs">
            <Phone className="w-3.5 h-3.5 fill-white" />
            Hotline: {config.supportPhone}
          </a>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 space-y-8 w-full">
        {/* Article Header */}
        <article className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 lg:p-10 space-y-6 shadow-sm">
          <span className="inline-flex items-center gap-1 bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Cẩm nang đăng ký 4G Viettel
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
            Hướng dẫn {titleQuery} - Nhận ngay {pkg.dataLimit} Data siêu tốc
          </h1>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium pb-2 border-b border-gray-100">
            <span>Tác giả: Ban Biên Tập Tracuugoicuoc</span>
            <span>•</span>
            <span>Cập nhật: Mới nhất 2026</span>
          </div>

          {/* Intro block */}
          <p className="text-sm sm:text-base text-gray-655 leading-relaxed">
            Bạn đang tìm hiểu về <strong>{titleQuery}</strong>? Gói cước <strong>{pkg.name} Viettel</strong> là một trong những lựa chọn hàng đầu hiện nay với mức giá cực kỳ tiết kiệm chỉ <strong>{(pkg.price).toLocaleString('vi-VN')}đ</strong>. Dưới đây là bài viết hướng dẫn chi tiết cú pháp đăng ký, thông tin ưu đãi và các câu hỏi thường gặp về gói cước này từ kênh đại lý ủy quyền của Viettel.
          </p>

          {/* Package Info Table */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
              1. Bảng Thông Số Chi Tiết Ưu Đãi Gói {pkg.name} Viettel
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                    <th className="px-4 py-3">Thông Số</th>
                    <th className="px-4 py-3">Chi Tiết Ưu Đãi Gói {pkg.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-600">
                  <tr>
                    <td className="px-4 py-3 font-semibold bg-gray-50/50">Giá Cước</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{(pkg.price).toLocaleString('vi-VN')}đ / {pkg.duration}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold bg-gray-50/50">Dung Lượng Data</td>
                    <td className="px-4 py-3 font-medium">{pkg.dataLimit} tốc độ cao {pkg.dataPerDay ? `(${pkg.dataPerDay})` : ''}</td>
                  </tr>
                  {pkg.calls && (
                    <>
                      <tr>
                        <td className="px-4 py-3 font-semibold bg-gray-50/50">Gọi Nội Mạng</td>
                        <td className="px-4 py-3">{pkg.calls.internal}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold bg-gray-50/50">Gọi Ngoại Mạng</td>
                        <td className="px-4 py-3">{pkg.calls.external}</td>
                      </tr>
                    </>
                  )}
                  {pkg.social && pkg.social.length > 0 && (
                    <tr>
                      <td className="px-4 py-3 font-semibold bg-gray-50/50">Ưu Đãi Mạng Xã Hội</td>
                      <td className="px-4 py-3 capitalize">Miễn phí data truy cập {pkg.social.join(', ')}</td>
                    </tr>
                  )}
                  {registrationEligible && (
                    <tr>
                      <td className="px-4 py-3 font-semibold bg-gray-50/50">Cú Pháp Đăng Ký</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#D71920]">{smsSyntax} gửi {SMS_NUMBER}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 italic">
              * Lưu ý: Khi sử dụng hết data tốc độ cao trong ngày, hệ thống sẽ tạm ngắt kết nối để tránh làm phát sinh cước phí ngoài ý muốn trong tài khoản của bạn.
            </p>
          </div>

          {/* Registration Section */}
          {registrationEligible ? <div className="bg-red-50/50 border border-red-200 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-red-950 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              2. Hướng Dẫn Cú Pháp Soạn SMS Đăng Ký
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Để đăng ký nhanh gói cước <strong>{pkg.name}</strong> qua cổng tổng đài 290 của Viettel, bạn chỉ cần soạn tin nhắn điện thoại theo cú pháp chuẩn sau:
            </p>
            <div className="bg-white border border-red-150 rounded-2xl p-4 text-center space-y-2.5 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 block leading-none">CÚ PHÁP SOẠN SMS</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-[#D71920] bg-red-50/30 px-4 py-1.5 rounded-lg border border-red-100 inline-block tracking-wider selection:bg-red-200">
                {smsSyntax}
              </span>
              <span className="text-gray-450 text-[11px] block leading-none">Gửi đến Tổng Đài: <strong className="text-red-700">290</strong></span>
            </div>
            {registrationEligible ? <a
              href={buildSmsUri(packageCode)}
              className="w-full min-h-[48px] bg-[#D71920] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 shadow-sm hover:shadow-md transition-all text-sm sm:text-base cursor-pointer"
            >
              <Send className="w-4 h-4 fill-white" />
              Mở ứng dụng SMS
            </a> : (
              <p className="w-full min-h-[48px] rounded-2xl bg-gray-100 px-4 text-center text-sm font-bold text-gray-600 flex items-center justify-center">
                Thông tin đăng ký đang chờ xác minh.
              </p>
            )}
            <p className="text-[11px] text-gray-400 text-center italic">
              (Miễn phí 100% cước gửi tin nhắn đến đầu số 290. Bạn chỉ trả đúng {(pkg.price).toLocaleString('vi-VN')}đ tiền gói cước đăng ký)
            </p>
          </div> : (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-semibold text-amber-900">
              Thông tin đăng ký đang chờ xác minh.
            </div>
          )}

          {/* FAQ Section (AEO optimized) */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
              3. Câu Hỏi Thường Gặp Về Gói Cước {pkg.name} (FAQ)
            </h2>
            <div className="space-y-4 divide-y divide-gray-150">
              <div className="pt-0 space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-gray-850">
                  Làm thế nào để kiểm tra lưu lượng data còn lại của gói {pkg.name}?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Bạn có thể tra cứu dung lượng data tốc độ cao còn lại của gói bằng cách soạn tin nhắn miễn phí: <strong>KTTK gửi 191</strong> hoặc truy cập ứng dụng My Viettel.
                </p>
              </div>
              <div className="pt-4 space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-gray-850">
                  Gói {pkg.name} có tự động gia hạn khi hết chu kỳ không?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Có, gói cước {pkg.name} sẽ tự động gia hạn sau mỗi {pkg.duration} với điều kiện tài khoản chính của SIM có đủ số dư tối thiểu là {(pkg.price).toLocaleString('vi-VN')}đ.
                </p>
              </div>
              <div className="pt-4 space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-gray-850">
                  Làm thế nào để hủy gói cước {pkg.name} Viettel?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Để hủy gia hạn (bảo lưu ưu đãi còn lại dùng đến hết chu kỳ): Soạn <strong>HUY {pkg.name} gửi 191</strong> (sau đó soạn Y gửi 191). Để hủy hoàn toàn gói ngay lập tức: Soạn <strong>HUYDATA {pkg.name} gửi 191</strong>.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Legal Disclaimer block */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 text-xs text-amber-900/80 leading-relaxed">
          <p className="font-bold text-amber-950 mb-1">Tuyên bố miễn trừ trách nhiệm (Disclaimer):</p>
          Trang web này l&agrave; k&ecirc;nh đại l&yacute; cộng t&aacute;c vi&ecirc;n độc lập giới thiệu dịch vụ di động của Viettel. Ch&uacute;ng t&ocirc;i cung cấp giải ph&aacute;p tạo c&uacute; ph&aacute;p đăng k&yacute; soạn sẵn miễn ph&iacute; gửi đến đầu số 290 của Viettel. Hệ thống kh&ocirc;ng thu bất kỳ chi ph&iacute; trung gian n&agrave;o, tiền gói cước được trừ trực tiếp từ t&agrave;i khoản chính của SIM tương đương bảng gi&aacute; ni&ecirc;m yết của Viettel.
        </div>

        {/* Back Button bottom */}
        <div className="text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-800 text-white text-xs font-bold rounded-full hover:bg-gray-900 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            QUAY LẠI TRANG CHỦ TRACUUGOICUOC.COM
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-xs border-t border-gray-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>© 2026 Bản quyền thuộc về đại lý tiếp thị liên kết Viettel tracuugoicuoc.com</p>
          <p className="text-[10px] text-gray-500">Website giới thiệu các gói cước 4G/5G Viettel và hỗ trợ tạo cú pháp SMS đăng ký miễn phí.</p>
        </div>
      </footer>
    </div>
  );
}
