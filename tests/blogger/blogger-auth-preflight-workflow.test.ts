import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { describeBloggerAuthFailure } from '../../scripts/blogger-auth-preflight';

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

  it('classifies invalid_grant as a refresh-token reauthorization requirement', () => {
    expect(describeBloggerAuthFailure(new Error('invalid_grant'))).toContain('BLOGGER_AUTH_REFRESH_REQUIRED');
    expect(describeBloggerAuthFailure({ response: { data: { error: 'invalid_grant' } } })).toContain('BLOGGER_AUTH_REFRESH_REQUIRED');
  });

  it('requests offline consent and state protection when generating a replacement refresh token', () => {
    const root = path.resolve(import.meta.dirname, '../..');
    const setup = fs.readFileSync(path.join(root, 'scripts/blogger-oauth-setup.ts'), 'utf8');

    expect(setup).toContain("access_type: 'offline'");
    expect(setup).toContain("prompt: 'consent'");
    expect(setup).toContain('include_granted_scopes: true');
    expect(setup).toContain('state,');
    expect(setup).toContain('OAUTH_STATE_MISMATCH');
  });
});
