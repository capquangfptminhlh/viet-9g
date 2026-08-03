import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runAutoMainSite } from '../../scripts/auto-main-site';

const directories: string[] = [];
afterEach(() => directories.splice(0).forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })));

describe('auto main-site publication', () => {
  it('writes one fact-validated article and an audit ledger entry', async () => {
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
      automationPolicy: { policyVersion: 'test', automationMode: 'full_auto', publishPolicy: { killSwitchActive: false, conditionalAutoRiskTiers: ['low'], fullAutoRiskTiers: ['low', 'medium'] } },
      ledgerStore: { async load() { return ledger; }, async save(entries: any[]) { ledger.splice(0, ledger.length, ...structuredClone(entries)); } },
      now: new Date('2026-08-03T00:00:00.000Z'),
    });

    expect(result).toMatchObject({ status: 'SUCCESS', topicId: 'esim-5g-guide', slug: 'esim-5g-guide' });
    expect(fs.readFileSync(path.join(outputDir, 'esim-5g-guide.md'), 'utf8')).toContain('eSIM Viettel có thể truy cập 5G trên thiết bị tương thích.');
    expect(ledger).toMatchObject([{ topicId: 'esim-5g-guide', status: 'PUBLISHED' }]);
  });
});
