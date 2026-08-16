import { describe, it, expect } from 'vitest';
import { createTopicDraftHtml, generateBloggerDraftPayload } from '../../packages/content-engine/blogger-content-generator';
import { generateReferralUrl } from '../../packages/measurement-engine/blogger-referral-tracker';
import fs from 'fs';

const factsStore = JSON.parse(fs.readFileSync('data/facts.json', 'utf-8').replace(/^\uFEFF/, ''));

describe('Blogger Content Generator - Multi-Intent Tests', () => {
  it('Cancellation Intent: should have proper structure, correct link, and data loss warning', () => {
    const title = "Cách hủy gói data Viettel qua SMS 191";
    const refUrl = generateReferralUrl("tracuugoicuoc.com", "/huong-dan/huy-goi-cuoc-viettel/", "topic-huy-goi-cuoc");
    const inputFacts = factsStore.filter((f: any) => f.id === 'fact-5');
    const html = createTopicDraftHtml(title, inputFacts, refUrl, "cancellation");
    const payload = generateBloggerDraftPayload({ blogId: "test", title, htmlBody: html });
    const resultHtml = payload.sanitizedHtml;

    expect(resultHtml).toContain('<h2>' + title + '</h2>');
    expect(resultHtml).toContain("HUY TÊN_GÓI gửi 191");
    expect(resultHtml).toContain("mất ưu đãi/data còn lại");
    expect(resultHtml).toContain("<h3>Câu hỏi thường gặp (FAQ)</h3>");
    expect(resultHtml).toContain("<p><strong>Thao tác này có mất phí không?</strong></p>");
    expect(resultHtml).toContain('href="https://tracuugoicuoc.com/huong-dan/huy-goi-cuoc-viettel?utm_source=blogger');
    
    // Cross-contamination
    expect(resultHtml).not.toContain("đăng ký");
    expect(resultHtml).not.toContain("Ai nên dùng");
    expect(resultHtml).not.toContain("undefined");
    expect(resultHtml).not.toContain("..");
  });

  it('Informational Intent: should not have data loss warning or review elements', () => {
    const title = "Cách Kiểm Tra Tốc Độ Mạng";
    const refUrl = generateReferralUrl("tracuugoicuoc.com", "/huong-dan/kiem-tra-toc-do-mang/", "topic-kiem-tra-toc-do");
    const inputFacts = factsStore.filter((f: any) => f.id === 'fact-6');
    const html = createTopicDraftHtml(title, inputFacts, refUrl, "informational");
    const payload = generateBloggerDraftPayload({ blogId: "test", title, htmlBody: html });
    const resultHtml = payload.sanitizedHtml;

    expect(resultHtml).toContain('<h2>' + title + '</h2>');
    expect(resultHtml).toContain("<h3>Câu hỏi thường gặp (FAQ)</h3>");
    expect(resultHtml).toContain("<p><strong>Tại sao kết quả trả về bị chậm?</strong></p>");
    expect(resultHtml).toContain('href="https://tracuugoicuoc.com/huong-dan/kiem-tra-toc-do-mang?utm_source=blogger');
    
    // Cross-contamination
    expect(resultHtml).not.toContain("mất ưu đãi/data còn lại");
    expect(resultHtml).not.toContain("hủy gói");
    expect(resultHtml).not.toContain("Ai nên dùng");
    expect(resultHtml).not.toContain("undefined");
    expect(resultHtml).not.toContain("..");
  });

  it('Review Intent: should require reviewData and format pros/cons correctly', () => {
    const title = "Đánh Giá Gói ST15K";
    const refUrl = generateReferralUrl("tracuugoicuoc.com", "/goi-cuoc/st15k/", "topic-st15k-review");
    const inputFacts = factsStore.filter((f: any) => f.id === 'fact-7');
    const reviewData = {
      pros: ["Giá rẻ"],
      cons: ["Tự động gia hạn"],
      suitableFor: "Khách đi công tác",
      considerations: "Kiểm tra kỹ"
    };
    const html = createTopicDraftHtml(title, inputFacts, refUrl, "review", reviewData);
    const payload = generateBloggerDraftPayload({ blogId: "test", title, htmlBody: html });
    const resultHtml = payload.sanitizedHtml;

    expect(resultHtml).toContain('<h2>' + title + '</h2>');
    expect(resultHtml).toContain("<h3>Câu hỏi thường gặp (FAQ)</h3>");
    expect(resultHtml).toContain("<p><strong>Làm sao biết gói có phù hợp với thuê bao của tôi?</strong></p>");
    expect(resultHtml).toContain("Ai nên dùng");
    expect(resultHtml).toContain("Giá rẻ");
    expect(resultHtml).toContain('href="https://tracuugoicuoc.com/goi-cuoc/st15k?utm_source=blogger');
    expect(resultHtml).toContain("Kiểm tra điều kiện áp dụng và thông tin gia hạn hiện tại");
    expect(resultHtml).not.toContain("Thông thường các gói cước data của Viettel đều có tính năng tự động gia hạn");
    
    // Cross-contamination
    expect(resultHtml).not.toContain("mất ưu đãi/data còn lại");
    expect(resultHtml).not.toContain("hủy hoàn toàn gói cước");
    expect(resultHtml).not.toContain("undefined");
    expect(resultHtml).not.toContain("..");
  });

  it('Review Intent: should throw if reviewData is missing', () => {
    const title = "Đánh Giá Gói ST15K";
    const inputFacts = factsStore.filter((f: any) => f.id === 'fact-7');
    expect(() => {
      createTopicDraftHtml(title, inputFacts, "url", "review");
    }).toThrow(/Missing structured reviewData/);
  });
});
