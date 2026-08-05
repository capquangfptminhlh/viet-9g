import { describe, expect, it } from 'vitest';
import { getVerifiedDataDisplay } from '../../src/components/package-display';

describe('allowance-only UI safety', () => {
  it('keeps allowance-only offers readable while only sorting known daily data', () => {
    expect(getVerifiedDataDisplay({ dataAllowance: '30GB', dataPerDay: undefined })).toEqual({
      primary: '30GB',
      dailyDataValue: undefined,
    });
    expect(getVerifiedDataDisplay({ dataAllowance: undefined, dataPerDay: '512MB/ngày' })).toEqual({
      primary: '512MB/ngày',
      dailyDataValue: 0.5,
    });
  });
});
