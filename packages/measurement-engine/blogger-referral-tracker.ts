import { resolveCanonicalTargetPath } from '../../src/data/canonical-target-path';

export function generateReferralUrl(domain: string, targetUrlPath: string, campaign: string): string {
  if (!targetUrlPath || !targetUrlPath.startsWith('/')) {
    throw new Error('targetUrlPath must be an internal path starting with /');
  }
  if (targetUrlPath.includes('..')) {
    throw new Error('targetUrlPath must not contain ..');
  }

  const canonicalTargetPath = resolveCanonicalTargetPath(targetUrlPath);
  const url = new URL(`https://${domain}${canonicalTargetPath}`);
  url.searchParams.set('utm_source', 'blogger');
  url.searchParams.set('utm_medium', 'owned-media');
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}
