export const AGENT_CODE = 'GB' as const;
export const SMS_NUMBER = '290' as const;

export const REGISTRATION_CHANNEL = {
  agentCode: AGENT_CODE,
  smsNumber: SMS_NUMBER,
} as const;
Object.freeze(REGISTRATION_CHANNEL);

export function assertAgentCode(value: string): asserts value is typeof AGENT_CODE {
  if (value !== AGENT_CODE) throw new Error('INVALID_AGENT_CODE');
}

export function buildSmsSyntax(packageCode: string): string {
  assertAgentCode(AGENT_CODE);
  const code = packageCode.trim();
  if (!code) throw new Error('PACKAGE_CODE_REQUIRED');
  return `${code} ${AGENT_CODE}`;
}

export function buildSmsUri(packageCode: string): string {
  return `sms:${SMS_NUMBER}?body=${encodeURIComponent(buildSmsSyntax(packageCode))}`;
}
