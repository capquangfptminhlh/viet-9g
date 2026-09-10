export interface PackageEditorialSection {
  heading: string;
  summary: string;
  decisionPoints: string[];
  sourceUrl: string;
  relatedPath?: string;
  relatedLabel?: string;
}

const PACKAGE_EDITORIAL: Readonly<Record<string, PackageEditorialSection>> = {
  '5g135': {
    heading: 'Đánh giá 5G135 từ thông số Viettel đã xác minh',
    summary:
      '5G135 là gói 30 ngày được Viettel liệt kê ở mức 135.000đ, với 4 GB/ngày (120 GB/tháng), TV360 Basic và 20 GB lưu trữ MyBox. Đây là phần đánh giá dựa trên thông số công bố, không phải cam kết rằng mọi thuê bao đều đăng ký được.',
    decisionPoints: [
      'Mức data công bố là 4 GB mỗi ngày, tương ứng 120 GB trong chu kỳ 30 ngày theo bảng gói trả trước Viettel.',
      'Quyền lợi kèm theo được Viettel liệt kê gồm TV360 Basic và 20 GB lưu trữ MyBox.',
      'Nguồn Viettel ghi gói gia hạn sau 30 ngày; trước khi đăng ký vẫn cần đối chiếu điều kiện thuê bao và phản hồi thực tế từ hệ thống Viettel.',
    ],
    sourceUrl:
      'https://098.viettel.vn/tin-tuc/chi-tiet/cap-nhat-2025-cach-dang-ky-goi-cuoc-tra-truoc-viettel-gia-re-moi-nhat/17031500',
    relatedPath: '/posts/so-sanh-5g135-va-5g150-viettel',
    relatedLabel: 'So sánh 5G135 và 5G150 trước khi chọn',
  },
};

export function getPackageEditorial(packageId: string): PackageEditorialSection | undefined {
  return PACKAGE_EDITORIAL[packageId.toLowerCase()];
}
