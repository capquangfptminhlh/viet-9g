import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy({ config, onSearchChange }: any) {
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
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="text-center space-y-2 pb-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">Chính Sách Bảo Mật</h1>
            <p className="text-sm text-gray-500 font-medium">Cập nhật lần cuối: 29/07/2026</p>
          </div>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <p>Tại <strong>tracuugoicuoc.com</strong>, chúng tôi coi trọng sự riêng tư và bảo mật thông tin của khách hàng. Trang web này được xây dựng với mục đích cung cấp thông tin gói cước và hỗ trợ cú pháp nhắn tin trực tiếp trên điện thoại của bạn, chúng tôi cam kết thực hiện đúng các quy định về bảo vệ dữ liệu.</p>
            
            <h3 className="text-base font-bold text-gray-900">1. Thu thập thông tin</h3>
            <p>Chúng tôi KHÔNG yêu cầu bạn phải cung cấp số điện thoại, số CMND/CCCD, hay bất kỳ thông tin cá nhân định danh nào trên website này. Mọi thao tác tìm kiếm và đọc thông tin hoàn toàn ẩn danh. Quá trình đăng ký gói cước được thực hiện thông qua giao thức SMS trên thiết bị di động của bạn, gửi trực tiếp đến hệ thống tổng đài 290 của Viettel.</p>

            <h3 className="text-base font-bold text-gray-900">2. Cookie và Công nghệ theo dõi</h3>
            <p>Trang web sử dụng Cookie cơ bản để phục vụ hệ thống phân tích lưu lượng (Google Analytics) nhằm tối ưu trải nghiệm người dùng, đo lường tốc độ tải trang và xác định các nội dung được quan tâm nhất. Bạn có thể vô hiệu hóa Cookie trong phần cài đặt của trình duyệt.</p>

            <h3 className="text-base font-bold text-gray-900">3. Liên kết bên thứ ba</h3>
            <p>Website có thể chứa các liên kết dẫn ra ngoài hoặc nhắc đến ứng dụng My Viettel. Chúng tôi không chịu trách nhiệm về chính sách bảo mật của các ứng dụng/website độc lập đó.</p>

            <h3 className="text-base font-bold text-gray-900">4. Trách nhiệm và Miễn trừ</h3>
            <p>Thông tin gói cước được chúng tôi cập nhật liên tục dựa trên công bố của Viettel Telecom. Tuy nhiên, trong một số trường hợp nhà mạng thay đổi chính sách đột xuất, có thể có sự trễ nhịp. Khách hàng luôn nhận được tin nhắn xác nhận chi tiết từ 191 trước khi hệ thống trừ tiền.</p>
            
            <div className="bg-red-50 p-4 rounded-lg mt-8 text-red-800 border border-red-100">
              Mọi câu hỏi liên quan đến Chính sách bảo mật, vui lòng liên hệ Hotline: <strong>{config.supportPhone}</strong>.
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
