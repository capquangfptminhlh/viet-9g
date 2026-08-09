import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { init } from '../../pipeline/daily';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('daily pipeline K0 gate', () => {
  it('fails closed when an explicit K0 decision is HOLD', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'k0-hold-'));
    tempDirs.push(dir);
    const decisionPath = path.join(dir, 'k0-decision.json');
    fs.writeFileSync(decisionPath, JSON.stringify({
      status: 'HOLD',
      approvals: { product: false, seo: false },
      clusters: [],
    }));

    await expect(init({ k0DecisionPath: decisionPath })).resolves.toMatchObject({
      status: 'FAILED',
      data: { killSwitchActive: true, configValid: false }
    });
  });

  it('accepts the repository production K0 decision when it is approved and source-backed', async () => {
    await expect(init()).resolves.toMatchObject({
      status: 'SUCCESS',
      data: { killSwitchActive: false, configValid: true }
    });
  });
});
