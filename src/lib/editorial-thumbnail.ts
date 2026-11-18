/** Use a post's own on-site markdown illustration for editorial cards. */
export function findFirstLocalIllustration(body: string): string | null {
  const imagePattern = /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
  for (const match of body.matchAll(imagePattern)) {
    const source = (match[1] ?? match[2] ?? '').trim();
    if (source.startsWith('/images/') && !source.startsWith('//')) {
      return source.split(/[?#]/, 1)[0];
    }
    try {
      const url = new URL(source);
      if (
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        (url.hostname === 'tracuugoicuoc.com' || url.hostname === 'www.tracuugoicuoc.com') &&
        url.pathname.startsWith('/images/')
      ) {
        return url.pathname;
      }
    } catch {
      // External, relative, or malformed URLs are not safe local card assets.
    }
  }
  return null;
}
