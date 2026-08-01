import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('catalog operations guardrails', () => {
  it('exposes deterministic catalog validation commands', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.scripts['validate:catalog']).toBe('tsx scripts/validate-package-catalog.ts');
    expect(pkg.scripts['check:catalog']).toBe('tsx scripts/migrate-package-catalog.ts --check');
  });

  it('keeps scheduled publishing disabled in the daily workflow', () => {
    const workflow = fs.readFileSync('.github/workflows/daily.yml', 'utf8');
    expect(workflow).toMatch(/workflow_dispatch:/);
    expect(workflow).not.toMatch(/^\s*- cron:/m);
    expect(workflow).not.toMatch(/auto-publish|publishPost/i);
  });

  it('documents evidence review, validation and pointer rollback', () => {
    const runbook = fs.readFileSync('docs/PACKAGE-CATALOG-RUNBOOK.md', 'utf8');
    expect(runbook).toMatch(/official.*evidence/i);
    expect(runbook).toMatch(/validate:catalog/);
    expect(runbook).toMatch(/check:catalog/);
    expect(runbook).toMatch(/rollback/i);
  });
});
