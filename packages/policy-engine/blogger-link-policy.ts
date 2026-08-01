export function enforceBloggerLinks(html: string): string {
  const linkMatches = html.match(/<a\s+[^>]*href=["'][^"']+["'][^>]*>/gi);
  if (linkMatches && linkMatches.length > 1) {
    throw new Error('Policy violation: more than one link found');
  }
  return html;
}
