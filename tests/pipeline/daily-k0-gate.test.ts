import { describe, expect, it } from 'vitest';
import { init } from '../../pipeline/daily';

describe('daily pipeline K0 gate', () => {
  it('fails initialization when the repository decision is HOLD', async () => {
    await expect(init()).resolves.toMatchObject({
      status: 'FAILED',
      data: { killSwitchActive: true, configValid: false }
    });
  });
});
