import React from 'react';
import { ShieldCheck, UserCheck, MapPin, Building2, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About({ config, onSearchChange }: any) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header
        config={config}
        onOpenSettings={() => {}}
        onOpenAdsGuide={() => {}}
        searchQuery=""
        onSearchChange={onSearchChange}
        onCategorySelect={() => {}}
        selectedCategory="all"
      />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 space-y-8">
          <div className="text-center space-y-4 pb-8 border-b border-gray-100">
            <h1 className="text-3xl sm:text-4xl font-black text-[#D71920] uppercase tracking-tight">Về Chúng Tôi</h1>
            <p className="text-sm text-gray-500 font-medium max-w-2xl mx-auto">
              Tracuugoicuoc.com là kênh Đại lý ủy quyền chính thức của Tổng Công Ty Viễn Thông Viettel, chuyên cung cấp các giải pháp viễn thông số, data 4G/5G chất lượng cao.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" /> Tầm Nhìn & Sứ Mệnh
              </h2>
              <p>Chúng tôi tự hào là đối tác chiến lược cấp cao của Viettel. Sứ mệnh của chúng tôi là minh bạch hóa các gói cước, giúp hàng triệu khách hàng Việt Nam dễ dàng tra cứu, so sánh và lựa chọn đúng sản phẩm phù hợp nhất với nhu cầu.</p>
              <p>Mọi giao dịch đăng ký thông qua cú pháp gửi <strong>290</strong> đều được xử lý trực tiếp trên hệ thống của Viettel, khách hàng hoàn toàn không mất bất kỳ chi phí trung gian nào.</p>
            </div>
            
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" /> Cam Kết Chất Lượng
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Dữ liệu gói cước cập nhật Real-time từ Viettel Telecom.</li>
                <li>Hỗ trợ xử lý lỗi kỹ thuật, tra cứu dung lượng nhanh chóng 24/7.</li>
                <li>Bảo vệ thông tin cá nhân và số điện thoại khách hàng tuyệt đối.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-gray-200 mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Thông Tin Đại Lý</h2>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <UserCheck className="w-4 h-4 text-gray-500" />
              <strong>Chịu trách nhiệm nội dung:</strong> Kỹ sư Viễn thông Minh Hưng (CTV Ủy quyền)
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-500" />
              <strong>Trụ sở giao dịch:</strong> 155 Ngã Tư Sở, Thanh Xuân, Hà Nội
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-500" />
              <strong>Hotline CSKH:</strong> {config.supportPhone}
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
