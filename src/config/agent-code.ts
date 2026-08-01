export const AGENT_CODE = 'GB' as const;
export const SMS_NUMBER = '290' as const;

export const REGISTRATION_CHANNEL = {
  agentCode: AGENT_CODE,
  smsNumber: SMS_NUMBER,
} as const;

export function buildSmsSyntax(packageCode: string): string {
  const code = packageCode.trim();
  if (!code) throw new Error('PACKAGE_CODE_REQUIRED');
  return `${code} ${AGENT_CODE}`;
}

export function buildSmsUri(packageCode: string): string {
  return `sms:${SMS_NUMBER}?body=${encodeURIComponent(buildSmsSyntax(packageCode))}`;
}
