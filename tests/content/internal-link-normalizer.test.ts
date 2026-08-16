import { describe, expect, it } from 'vitest';
import rehypeNormalizeInternalLinks, { normalizeHref } from '../../src/markdown/rehype-normalize-internal-links.mjs';

describe('normalizeHref', () => {
  it('removes trailing slash from internal canonical paths and preserves suffixes', () => {
    expect(normalizeHref('/goi-cuoc/sd135/')).toBe('/goi-cuoc/sd135');
    expect(normalizeHref('/posts/example/?ref=internal')).toBe('/posts/example?ref=internal');
    expect(normalizeHref('/posts/example/#faq')).toBe('/posts/example#faq');
  });

  it('does not modify root or external URLs', () => {
    expect(normalizeHref('/')).toBe('/');
    expect(normalizeHref('https://098.viettel.vn/path/')).toBe('https://098.viettel.vn/path/');
  });

  it('normalizes href properties in a rehype tree', () => {
    const tree: any = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'a', properties: { href: '/posts/example/' }, children: [] },
        { type: 'element', tagName: 'a', properties: { href: '/goi-cuoc/sd135/' }, children: [] },
      ],
    };
    rehypeNormalizeInternalLinks()(tree);
    expect(tree.children[0].properties.href).toBe('/posts/example');
    expect(tree.children[1].properties.href).toBe('/goi-cuoc/sd135');
  });
});
