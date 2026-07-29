/**
 * Gửi sự kiện Google Analytics 4 (GA4) an toàn.
 * Hàm này kiểm tra gtag có tồn tại ở Window Object trước khi đẩy sự kiện.
 */
export const trackConversion = (eventName: string, params: Record<string, any> = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    }
  } catch (error) {
    console.error('GA4 Tracking Error:', error);
  }
};
