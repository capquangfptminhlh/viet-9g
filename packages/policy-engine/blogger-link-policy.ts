export function enforceBloggerLinks(html: string): string {
  const linkMatches = html.match(/<a\s+[^>]*href=["'][^"']+["'][^>]*>/gi);
  if (linkMatches) {
    if (linkMatches.length > 1) {
      throw new Error('Policy violation: more than one link found');
    }
    for (const link of linkMatches) {
      if (!/href=["']https:\/\/tracuugoicuoc\.com/.test(link)) {
        throw new Error('Policy violation: link destination must be https://tracuugoicuoc.com');
      }
      if (!/utm_source=/.test(link)) {
        throw new Error('Policy violation: link must have utm tracking');
      }
    }
  }
  return html;
}
