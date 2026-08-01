import { describe, expect, it } from 'vitest';
import { AGENT_CODE, REGISTRATION_CHANNEL, assertAgentCode, buildSmsSyntax, buildSmsUri } from '../../src/config/agent-code';

describe('central registration channel', () => {
  it('keeps the GB affiliate code and SMS destination 290', () => {
    expect(AGENT_CODE).toBe('GB');
    expect(REGISTRATION_CHANNEL).toMatchObject({ agentCode: 'GB', smsNumber: '290' });
  });

  it('builds the canonical SMS syntax and URI', () => {
    expect(buildSmsSyntax('V120B')).toBe('V120B GB');
    expect(buildSmsUri('V120B')).toBe('sms:290?body=V120B%20GB');
  });

  it('rejects a changed agent code', () => {
    expect(() => assertAgentCode('OTHER')).toThrow('INVALID_AGENT_CODE');
    expect(() => assertAgentCode('GB')).not.toThrow();
  });
});
