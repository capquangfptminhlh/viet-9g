import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('allowance-only UI safety', () => {
  it('uses an empty fallback before parsing an optional daily allowance', () => {
    const grid = fs.readFileSync('src/components/PackageGrid.tsx', 'utf8');
    const recommender = fs.readFileSync('src/components/SmartRecommender.tsx', 'utf8');

    expect(grid).toContain("parseData(b.dataPerDay ?? '')");
    expect(recommender).toContain("parseQuota(b.dataPerDay ?? '')");
  });
});
