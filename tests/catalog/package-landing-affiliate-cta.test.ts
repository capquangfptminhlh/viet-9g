import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSmsSyntax, buildSmsUri, REGISTRATION_CHANNEL } from '../../src/config/agent-code';

const componentPath = path.resolve('src/components/DynamicPostPage.tsx');
const source = fs.readFileSync(componentPath, 'utf8');

describe('package landing affiliate registration CTA', () => {
  it('keeps the canonical GB -> 290 SMS action available independently of source registration metadata', () => {
    expect(buildSmsSyntax('V120B')).toBe('V120B GB');
    expect(buildSmsUri('V120B')).toBe('sms:290?body=V120B%20GB');
    expect(REGISTRATION_CHANNEL).toMatchObject({ agentCode: 'GB', smsNumber: '290' });
    expect(source).toContain('const affiliateSmsUri = buildSmsUri(pkg.code)');
    expect(source).toContain('href={affiliateSmsUri}');
    expect(source).toContain('Đăng ký qua mã đại lý của website');
  });

  it('does not present the affiliate CTA as guaranteed Viettel eligibility or activation', () => {
    expect(source).toContain('Viettel quyết định thuê bao có đủ điều kiện và kích hoạt gói hay không');
    expect(source).not.toMatch(/đảm bảo.{0,30}(đăng ký|kích hoạt)|kích hoạt.{0,30}100%/iu);
  });
});
