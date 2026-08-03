import { describe, expect, it } from 'vitest';
import { createTopicMediaAsset } from '../../packages/content-engine/topic-media';

describe('topic media asset', () => {
  const topic = {
    topicId: 'topic-esim-5g',
    title: 'eSIM Viettel có dùng được 5G không?',
    intent: 'informational',
    imageBrief: 'Điện thoại hiển thị eSIM và biểu tượng 5G trên nền trung tính.',
    imageAlt: 'Minh họa eSIM Viettel hoạt động trên điện thoại hỗ trợ 5G.',
  };

  it('creates a deterministic topic-specific public image with provenance', () => {
    const asset = createTopicMediaAsset(topic, 'https://tracuugoicuoc.com', new Date('2026-08-03T00:00:00.000Z'));

    expect(asset.topicId).toBe(topic.topicId);
    expect(asset.publicUrl).toMatch(/^https:\/\/tracuugoicuoc\.com\/images\/blogger\/topic-esim-5g-[a-f0-9]{12}\.svg$/);
    expect(asset.relativePath).toMatch(/^\/images\/blogger\/topic-esim-5g-[a-f0-9]{12}\.svg$/);
    expect(asset.alt).toBe(topic.imageAlt);
    expect(asset.imageBrief).toBe(topic.imageBrief);
    expect(asset.createdAt).toBe('2026-08-03T00:00:00.000Z');
    expect(asset.svg).toContain('<svg');
    expect(asset.svg).toContain('data-topic-id="topic-esim-5g"');
    expect(asset.svg).not.toMatch(/\b(?:GB|290|\d{1,3}\.\d{3}đ)\b/);
  });

  it('rejects missing image provenance fields', () => {
    expect(() => createTopicMediaAsset({ ...topic, imageAlt: '' }, 'https://tracuugooc.com')).toThrow(/imageAlt/i);
    expect(() => createTopicMediaAsset({ ...topic, imageBrief: '' }, 'https://tracuugooc.com')).toThrow(/imageBrief/i);
  });

  it('rejects a non-https public domain', () => {
    expect(() => createTopicMediaAsset(topic, 'http://tracuugoicuoc.com')).toThrow(/https/i);
  });
});
