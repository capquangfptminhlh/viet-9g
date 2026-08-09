import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Blogger workflow auth safety', () => {
  it('checks OAuth before K0 and before any Blogger publication attempt', () => {
    const root = path.resolve(import.meta.dirname, '../..');
    const workflow = fs.readFileSync(path.join(root, '.github/workflows/daily-blogger.yml'), 'utf8');

    const authPreflight = workflow.indexOf('npx tsx scripts/blogger-auth-preflight.ts');
    const k0Gate = workflow.indexOf('npm run k0:check');
    const publisher = workflow.indexOf('npx tsx scripts/auto-blogger.ts');

    expect(authPreflight).toBeGreaterThan(-1);
    expect(k0Gate).toBeGreaterThan(authPreflight);
    expect(publisher).toBeGreaterThan(k0Gate);
  });
});
