import { describe, expect, it } from 'vitest';
import { deltaPercent, normalizeTotals, reportWindows } from '../../scripts/gsc-report-window.js';

describe('real GSC 28-day reporting windows', () => {
  it('makes adjacent 28-day UTC windows ending on the settled day', () => {
    expect(reportWindows(new Date('2026-11-18T22:00:00Z'))).toEqual({
      current: { startDate: '2026-10-20', endDate: '2026-11-16' },
      previous: { startDate: '2026-09-22', endDate: '2026-10-19' },
    });
  });

  it('handles month and year boundaries', () => {
    expect(reportWindows(new Date('2027-01-01T01:00:00Z'))).toEqual({
      current: { startDate: '2026-12-03', endDate: '2026-12-30' },
      previous: { startDate: '2026-11-05', endDate: '2026-12-02' },
    });
  });

  it('normalizes API ratios without inventing absent data', () => {
    expect(normalizeTotals({ clicks: 42, impressions: 1000, ctr: 0.042, position: 12.3456 })).toEqual({
      clicks: 42, impressions: 1000, ctrPercent: 4.2, averagePosition: 12.35,
    });
    expect(normalizeTotals(undefined)).toBeNull();
  });

  it('never divides by zero or turns missing values into a fabricated percentage', () => {
    expect(deltaPercent(60, 40)).toBe(50);
    expect(deltaPercent(1, 0)).toBeNull();
    expect(deltaPercent(NaN, 40)).toBeNull();
  });
});
