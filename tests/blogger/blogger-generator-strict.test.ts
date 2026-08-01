import { describe, it, expect } from 'vitest';
import { createTopicDraftHtml } from '../../packages/content-engine/blogger-content-generator';
import fs from 'fs';

describe('Blogger Content Generator Strict Tests', () => {
  it('topic hủy gói không thể sinh title hoặc claim MXH120', () => {
    // 1. Tải facts từ JSON thật
    const factsStore = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8'));
    
    // 2. Định nghĩa dữ liệu của Topic Hủy gói (giả lập theo đúng config)
    const topicTitle = "Cách Hủy Gói Cước 4G Viettel Đơn Giản, Miễn Phí Qua 191";
    const topicIntent = "informational";
    const topicSourceFactIds = ["fact-5"]; // fact hủy gói
    
    // 3. Lọc facts
    const inputFacts = factsStore.filter((f: any) => topicSourceFactIds.includes(f.id));
    
    // 4. Sinh HTML
    const html = createTopicDraftHtml(topicTitle, inputFacts, "https://example.com/huy", topicIntent);
    
    // 5. Kiểm tra bắt buộc:
    // a. Chứa đúng title của topic
    expect(html).toContain(topicTitle);
    // b. Chứa nội dung của fact-5
    expect(html).toContain("HUY gửi 191");
    
    // 6. KIỂM TRA CHỐNG LỌT DATA (MXH120 rò rỉ)
    expect(html).not.toContain("MXH120");
    expect(html).not.toContain("120.000đ");
    expect(html).not.toContain("TikTok");
    expect(html).not.toContain("Nạp đủ số dư cước phí"); // Vì intent = informational, không được dùng boilerplate bán hàng
  });
});
