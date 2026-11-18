import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runAutoMainSite, type AutoMainSiteOptions } from '../../scripts/auto-main-site';
import type { AutomationPolicy } from '../../packages/policy-engine/automation-policy';

const directories: string[] = [];
afterEach(() => directories.splice(0).forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })));

const policy: AutomationPolicy = {
  policyVersion: 'test',
  automationMode: 'full_auto',
  publishPolicy: {
    killSwitchActive: false,
    conditionalAutoRiskTiers: ['low'],
    fullAutoRiskTiers: ['low', 'medium'],
  },
};

describe('auto main-site publication', () => {
  it('stages one fact-validated article and an audit ledger entry without claiming a live publication', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'main-site-'));
    directories.push(outputDir);
    const ledger: any[] = [];

    const result = await runAutoMainSite({
      outputDir,
      topics: [{
        topicId: 'esim-5g-guide', title: 'eSIM Viettel có dùng được 5G không?', status: 'QUEUE', intent: 'informational',
        sourceFactIds: ['fact-esim'],
      }],
      facts: [{ id: 'fact-esim', claim: 'eSIM Viettel có thể truy cập 5G trên thiết bị tương thích.', sourceUrl: 'https://098.viettel.vn/huong-dan/esim-5g', expiresAt: '2026-12-31T23:59:59Z' }],
      mediaManifest: { assets: [{ topicId: 'esim-5g-guide', publicUrl: 'https://www.tracuugoicuoc.com/images/blogger/esim-5g-guide.svg', alt: 'Minh họa eSIM Viettel và 5G.', imageBrief: 'Điện thoại và eSIM.' }] },
      automationPolicy: policy,
      ledgerStore: { async load() { return ledger; }, async save(entries: any[]) { ledger.splice(0, ledger.length, ...structuredClone(entries)); } },
      now: new Date('2026-08-03T00:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'STAGED', topicId: 'esim-5g-guide', slug: 'esim-5g-guide' });
    expect(fs.readFileSync(path.join(outputDir, 'esim-5g-guide.md'), 'utf8')).toContain('eSIM Viettel có thể truy cập 5G trên thiết bị tương thích.');
    expect(ledger).toMatchObject([{ topicId: 'esim-5g-guide', status: 'STAGED' }]);
  });

  it('holds an already-owned canonical topic and continues to the next independent candidate', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'main-site-'));
    directories.push(outputDir);
    fs.writeFileSync(path.join(outputDir, 'ussd-viettel-qua-4g-volte-ims.md'), '# Canonical USSD owner\n', 'utf8');
    const ledger: any[] = [];

    const result = await runAutoMainSite({
      outputDir,
      topics: [
        {
          topicId: 'topic-b1-ussd-thiet-bi-khong-tuong-thich',
          title: 'Thiết bị chưa tương thích có thể không dùng được USSD qua 4G',
          status: 'QUEUE',
          intent: 'informational',
          sourceFactIds: ['fact-ussd'],
          targetUrlPath: '/posts/ussd-viettel-qua-4g-volte-ims/',
        },
        {
          topicId: 'independent-support-guide',
          title: 'Hướng dẫn hỗ trợ độc lập',
          status: 'QUEUE',
          intent: 'informational',
          sourceFactIds: ['fact-independent'],
        },
      ],
      facts: [
        { id: 'fact-ussd', claim: 'Thiết bị không tương thích có thể không dùng được USSD qua 4G.', sourceUrl: 'https://098.viettel.vn/huong-dan/ussd-4g', expiresAt: '2026-12-31T23:59:59Z' },
        { id: 'fact-independent', claim: 'Hướng dẫn hỗ trợ độc lập đã được xác minh.', sourceUrl: 'https://098.viettel.vn/huong-dan/support', expiresAt: '2026-12-31T23:59:59Z' },
      ],
      mediaManifest: { assets: [
        { topicId: 'topic-b1-ussd-thiet-bi-khong-tuong-thich', publicUrl: 'https://www.tracuugoicuoc.com/images/blogger/ussd.svg', alt: 'USSD qua 4G.', imageBrief: 'USSD.' },
        { topicId: 'independent-support-guide', publicUrl: 'https://www.tracuugoicuoc.com/images/blogger/support.svg', alt: 'Hỗ trợ.', imageBrief: 'Hỗ trợ.' },
      ] },
      automationPolicy: policy,
      ledgerStore: { async load() { return ledger; }, async save(entries: any[]) { ledger.splice(0, ledger.length, ...structuredClone(entries)); } },
      now: new Date('2026-09-06T06:01:55.000Z'),
    });

    expect(result).toMatchObject({ status: 'STAGED', topicId: 'independent-support-guide', slug: 'independent-support-guide' });
    expect(fs.existsSync(path.join(outputDir, 'topic-b1-ussd-thiet-bi-khong-tuong-thich.md'))).toBe(false);
    expect(ledger[0]).toMatchObject({
      topicId: 'topic-b1-ussd-thiet-bi-khong-tuong-thich',
      status: 'HOLD',
      failureReason: 'CANONICAL_OWNER_EXISTS_REQUIRES_GOVERNED_UPDATE',
    });
    expect(ledger[1]).toMatchObject({ topicId: 'independent-support-guide', status: 'STAGED' });
  });

  it('resolves a legacy redirect before deciding canonical ownership', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'main-site-'));
    directories.push(outputDir);
    fs.writeFileSync(path.join(outputDir, 'cach-huy-gia-han-4g-viettel.md'), '# Canonical cancellation owner\n', 'utf8');
    const ledger: any[] = [];

    const result = await runAutoMainSite({
      outputDir,
      topics: [
        {
          topicId: 'topic-b3-gic70-cancel-package',
          title: 'GIC70/GIC70T: khi nào dùng HUYDATA 191 để hủy gói?',
          status: 'QUEUE',
          intent: 'cancellation',
          sourceFactIds: ['fact-gic70'],
          targetUrlPath: '/posts/hướng-dẫn-hủy-gói-cước-viettel-tránh-trừ-tiền-tự-động/',
        },
        {
          topicId: 'independent-support-guide',
          title: 'Hướng dẫn hỗ trợ độc lập',
          status: 'QUEUE',
          intent: 'informational',
          sourceFactIds: ['fact-independent'],
        },
      ],
      facts: [
        { id: 'fact-gic70', claim: 'Với GIC70/GIC70T, soạn HUYDATA gửi 191 để hủy gói cước.', sourceUrl: 'https://shop.viettel.vn/tin-tuc/gic70', expiresAt: '2026-12-31T23:59:59Z' },
        { id: 'fact-independent', claim: 'Hướng dẫn hỗ trợ độc lập đã được xác minh.', sourceUrl: 'https://098.viettel.vn/huong-dan/support', expiresAt: '2026-12-31T23:59:59Z' },
      ],
      mediaManifest: { assets: [
        { topicId: 'topic-b3-gic70-cancel-package', publicUrl: 'https://www.tracuugoicuoc.com/images/blogger/gic70.svg', alt: 'GIC70.', imageBrief: 'GIC70.' },
        { topicId: 'independent-support-guide', publicUrl: 'https://www.tracuugoicuoc.com/images/blogger/support.svg', alt: 'Hỗ trợ.', imageBrief: 'Hỗ trợ.' },
      ] },
      automationPolicy: policy,
      ledgerStore: { async load() { return ledger; }, async save(entries: any[]) { ledger.splice(0, ledger.length, ...structuredClone(entries)); } },
      now: new Date('2026-09-09T06:00:46.000Z'),
    });

    expect(result).toMatchObject({ status: 'STAGED', topicId: 'independent-support-guide', slug: 'independent-support-guide' });
    expect(fs.existsSync(path.join(outputDir, 'topic-b3-gic70-cancel-package.md'))).toBe(false);
    expect(ledger[0]).toMatchObject({
      topicId: 'topic-b3-gic70-cancel-package',
      status: 'HOLD',
      failureReason: 'CANONICAL_OWNER_EXISTS_REQUIRES_GOVERNED_UPDATE',
    });
    expect(ledger[1]).toMatchObject({ topicId: 'independent-support-guide', status: 'STAGED' });
  });

  it('returns NO_ELIGIBLE_TOPIC without duplicates or false publication when canonical is owned', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'main-site-'));
    directories.push(outputDir);
    fs.writeFileSync(path.join(outputDir, 'canonical-owner.md'), '# Existing canonical owner\n', 'utf8');
    const ledger: any[] = [];
    const options: AutoMainSiteOptions = {
      outputDir,
      topics: [{ topicId: 'another-topic', title: 'Duplicate guide', status: 'QUEUE', intent: 'informational', targetUrlPath: '/posts/canonical-owner', sourceFactIds: ['verified-fact'] }],
      facts: [{ id: 'verified-fact', claim: 'Thông tin đã được xác minh.', sourceUrl: 'https://www.vietteltelecom.vn/', expiresAt: '2026-12-31T23:59:59Z' }],
      mediaManifest: { assets: [{ topicId: 'another-topic', publicUrl: 'https://www.tracuugoicuoc.com/images/verified.svg', alt: 'Thông tin Viettel', imageBrief: 'Hình minh họa' }] },
      automationPolicy: policy,
      ledgerStore: { async load() { return ledger; }, async save(entries: any[]) { ledger.splice(0, ledger.length, ...structuredClone(entries)); } },
      now: new Date('2026-11-18T09:20:00Z'),
    };
    const first = await runAutoMainSite(options);
    const second = await runAutoMainSite(options);
    expect(first.status).toBe('NO_ELIGIBLE_TOPIC');
    expect(second.status).toBe('NO_ELIGIBLE_TOPIC');
    expect(ledger).toHaveLength(1);
    expect(ledger[0]).toMatchObject({ status: 'HOLD', failureReason: 'CANONICAL_OWNER_EXISTS_REQUIRES_GOVERNED_UPDATE' });
    expect(fs.existsSync(path.join(outputDir, 'another-topic.md'))).toBe(false);
    expect(ledger.some(entry => entry.status === 'PUBLISHED')).toBe(false);
  });

  it('does not restage a previously staged topic on the next run', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'main-site-'));
    directories.push(outputDir);
    const ledger: any[] = [];
    const options: AutoMainSiteOptions = {
      outputDir,
      topics: [{ topicId: 'fresh-guide', title: 'Hướng dẫn độc lập', status: 'QUEUE', intent: 'informational', sourceFactIds: ['one'] }],
      facts: [{ id: 'one', claim: 'Thông tin hướng dẫn từ Viettel.', sourceUrl: 'https://www.vietteltelecom.vn/', expiresAt: '2026-12-31T23:59:59Z' }],
      mediaManifest: { assets: [{ topicId: 'fresh-guide', publicUrl: 'https://www.tracuugoicuoc.com/images/verified.svg', alt: 'Hình minh họa', imageBrief: 'Hướng dẫn' }] },
      automationPolicy: policy,
      ledgerStore: { async load() { return ledger; }, async save(entries: any[]) { ledger.splice(0, ledger.length, ...structuredClone(entries)); } },
      now: new Date('2026-11-18T09:20:00Z'),
    };
    const first = await runAutoMainSite(options);
    const second = await runAutoMainSite(options);
    expect(first.status).toBe('STAGED');
    expect(second.status).toBe('NO_ELIGIBLE_TOPIC');
    expect(ledger).toHaveLength(1);
    expect(ledger[0].status).toBe('STAGED');
    expect(fs.existsSync(path.join(outputDir, 'fresh-guide.md'))).toBe(true);
  });
});
