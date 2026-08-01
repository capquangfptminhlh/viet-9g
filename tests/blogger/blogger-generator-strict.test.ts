import { describe, it, expect } from 'vitest';
import { createTopicDraftHtml } from '../../packages/content-engine/blogger-content-generator';
import fs from 'fs';

describe('Blogger Content Generator - Structural Tests', () => {
  it('should correctly structure an informational post about package cancellation', () => {
    const factsStore = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8').replace(/^\uFEFF/, ''));
    const topicTitle = "Cách Hủy Gói Cước 4G Viettel Đơn Giản, Miễn Phí Qua 191";
    const topicIntent = "informational";
    const topicSourceFactIds = ["fact-5"];
    
    const inputFacts = factsStore.filter((f: any) => topicSourceFactIds.includes(f.id));
    const html = createTopicDraftHtml(topicTitle, inputFacts, "https://tracuugoicuoc.com/huong-dan/huy-goi-cuoc-viettel/", topicIntent);
    
    // Positive Assertions: Title and Headings
    expect(html).toContain(<h2>\</h2>);
    expect(html).toContain("<h3>1. Hướng dẫn thực hiện</h3>");
    expect(html).toContain("<h3>2. Các lưu ý quan trọng</h3>");
    expect(html).toContain("<h3>Câu hỏi thường gặp (FAQ)</h3>");
    
    // Positive Assertions: Facts
    expect(html).toContain("HUY gửi 191");
    expect(html).toContain("HUYDATA gửi 191");
    
    // Positive Assertions: Contextual Link (not a generic buy CTA)
    expect(html).toContain('href="https://tracuugoicuoc.com/huong-dan/huy-goi-cuoc-viettel/"');
    expect(html).toContain('xem hướng dẫn chi tiết tại đây');
    
    // Negative Assertions: Must NOT contain boilerplate from 'review' intent
    expect(html).not.toContain("Nạp đủ số dư cước phí");
    expect(html).not.toContain("Thực hiện thao tác đăng ký");
    expect(html).not.toContain("Thông tin chi tiết gói cước");

    // Negative Assertions: Must NOT contain *098# or "tra cứu" for cancellation
    expect(html).not.toContain("*098#");
    expect(html).not.toContain("tra cứu");
  });
});
