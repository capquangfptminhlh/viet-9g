export function generateReferralUrl(destination: string, campaign: string): string {
  const url = new URL(`https://${destination}`);
  url.searchParams.set('utm_source', 'blogger');
  url.searchParams.set('utm_medium', 'owned-media');
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}
