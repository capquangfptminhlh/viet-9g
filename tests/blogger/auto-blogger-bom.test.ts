import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('Auto Blogger BOM handling', () => {
  it('strips BOM from ledger json to prevent JSON.parse error', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bod-32-'));
    const ledgerPath = path.join(directory, 'ledger.json');
    fs.writeFileSync(ledgerPath, '\uFEFF[{"idempotencyKey":"test","status":"DRAFT_CREATED"}]', 'utf-8');
    const parsed = JSON.parse(fs.readFileSync(ledgerPath, 'utf-8').replace(/^\uFEFF/, ''));
    expect(parsed[0].idempotencyKey).toBe('test');
    fs.rmSync(directory, { recursive: true, force: true });
  });
});
