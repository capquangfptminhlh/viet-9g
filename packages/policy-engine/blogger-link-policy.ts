export function enforceBloggerLinks(html: string): string {
  const links = html.match(/<a\b[^>]*>/gi) || [];
  if (links.length > 1) throw new Error('Policy violation: more than one link found');
  if (!links.length) return html;

  const attributes = parseAttributes(links[0]);
  const href = requiredSingleAttribute(attributes, 'href', 'link href');
  const rel = requiredSingleAttribute(attributes, 'rel', 'rel');
  if (rel !== 'nofollow noopener noreferrer') {
    throw new Error('Policy violation: required rel is missing');
  }

  let url: URL;
  try {
    url = new URL(href.replace(/&amp;/gi, '&'));
  } catch {
    throw new Error('Policy violation: link href is required');
  }

  if (url.protocol !== 'https:' || url.hostname !== 'tracuugoicuoc.com' || url.port) {
    throw new Error('Policy violation: link destination must be https://tracuugoicuoc.com');
  }

  for (const name of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const values = url.searchParams.getAll(name);
    if (values.length !== 1 || !values[0]) throw new Error(`Policy violation: ${name} is required`);
  }

  return html;
}

function parseAttributes(link: string): Map<string, string[]> {
  const attributes = new Map<string, string[]>();
  const attributePattern = /\s([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of link.matchAll(attributePattern)) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attributes.set(name, [...(attributes.get(name) ?? []), value]);
  }

  return attributes;
}

function requiredSingleAttribute(attributes: Map<string, string[]>, name: string, label: string): string {
  const values = attributes.get(name) ?? [];
  if (values.length !== 1 || !values[0]) {
    throw new Error(`Policy violation: ${label} is required`);
  }
  return values[0];
}
