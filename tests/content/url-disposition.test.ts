import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateUrlDisposition } from '../../scripts/validate-url-disposition';

function writeCsv(contents: string): string {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'url-disposition-')), 'disposition.csv');
  fs.writeFileSync(file, contents, 'utf8');
  return file;
}

describe('validateUrlDisposition', () => {
  it('accepts the approved disposition vocabulary and non-301 review rows', () => {
    const file = writeCsv('source,target,disposition,intentMatch,ownerApproved,notes\n/blog/a,,keep,,,Current canonical article\n/blog/b,,improve,,,Needs factual refresh\n/blog/c,/blog/a,canonicalize,,,Duplicate intent\n/blog/d,,noindex,,,Thin utility page\n/blog/e,,404,,true,Retired unsupported URL\n');
    expect(() => validateUrlDisposition(file)).not.toThrow();
  });

  it('requires 301 rows to have source, target, intent match, and owner approval', () => {
    const file = writeCsv('source,target,disposition,intentMatch,ownerApproved,notes\n/blog/a,/blog/b,301,true,false,Pending approval\n');
    expect(() => validateUrlDisposition(file)).toThrow(/ownerApproved/i);
  });

  it('requires 404 rows to be owner approved and targetless', () => {
    const withTarget = writeCsv('source,target,disposition,intentMatch,ownerApproved,notes\n/blog/a,/blog/b,404,,true,Retire\n');
    expect(() => validateUrlDisposition(withTarget)).toThrow(/must not have a target/i);

    const withoutApproval = writeCsv('source,target,disposition,intentMatch,ownerApproved,notes\n/blog/a,,404,,false,Retire\n');
    expect(() => validateUrlDisposition(withoutApproval)).toThrow(/ownerApproved/i);
  });

  it('rejects dispositions outside the approved vocabulary', () => {
    const file = writeCsv('source,target,disposition,intentMatch,ownerApproved,notes\n/blog/a,,redirect,,,\n');
    expect(() => validateUrlDisposition(file)).toThrow(/disposition/i);
  });
});
