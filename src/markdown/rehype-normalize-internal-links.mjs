function normalizeHref(href) {
  if (typeof href !== 'string' || !href.startsWith('/') || href === '/') return href;

  const hashIndex = href.indexOf('#');
  const queryIndex = href.indexOf('?');
  const cutAt = [hashIndex, queryIndex].filter((value) => value >= 0).sort((a, b) => a - b)[0] ?? href.length;
  const pathname = href.slice(0, cutAt);
  const suffix = href.slice(cutAt);

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return `${pathname.slice(0, -1)}${suffix}`;
  }
  return href;
}

function visit(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && node.properties && typeof node.properties.href === 'string') {
    node.properties.href = normalizeHref(node.properties.href);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child);
  }
}

export default function rehypeNormalizeInternalLinks() {
  return (tree) => visit(tree);
}

export { normalizeHref };
