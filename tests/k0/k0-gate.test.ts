import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateK0Decision } from '../../packages/content-engine/k0-gate';

const approvedDecision = {
  status: 'APPROVED',
  approvals: { product: true, seo: true },
  clusters: [{
    id: 'viettel-4g-usage',
    intent: 'informational',
    canonicalUrl: 'https://www.tracuugoicuoc.com/posts/kiem-tra-dung-luong',
    keywords: ['kiểm tra dung lượng Viettel'],
    sourceUrls: ['https://www.viettel.vn/']
  }]
};

describe('K0 keyword-intelligence gate', () => {
  it('accepts one approved, source-backed canonical mapping per cluster', () => {
    expect(validateK0Decision(approvedDecision).ok).toBe(true);
  });

  it('rejects a cluster without an explicit canonical URL', () => {
    const decision = structuredClone(approvedDecision);
    delete decision.clusters[0].canonicalUrl;
    expect(validateK0Decision(decision).ok).toBe(false);
  });

  it('rejects fixture and reference-only evidence', () => {
    const decision = structuredClone(approvedDecision);
    decision.clusters[0].sourceUrls = ['https://example.com/fixture'];
    expect(validateK0Decision(decision).ok).toBe(false);
  });

  it('requires the K0 gate before every content publisher', () => {
    const root = path.resolve(import.meta.dirname, '../..');
    for (const file of [
      '.github/workflows/daily-publish.yml',
      '.github/workflows/daily-blogger.yml',
      '.github/workflows/daily.yml'
    ]) {
      const workflow = fs.readFileSync(path.join(root, file), 'utf8');
      expect(workflow).toMatch(/npm run k0:check/);
    }
  });
});
