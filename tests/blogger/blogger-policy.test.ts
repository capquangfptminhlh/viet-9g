import { describe, expect, it } from 'vitest';
import { sanitizeBloggerHtml } from '../../packages/policy-engine/blogger-html-policy';
import { enforceBloggerLinks } from '../../packages/policy-engine/blogger-link-policy';

describe('Blogger policies', () => {
  it('removes scripts and event handlers from draft HTML', () => {
    expect(sanitizeBloggerHtml('<p onclick="x()">Safe</p><script>alert(1)</script>'))
      .toBe('<p>Safe</p>');
  });

  it('rejects a second referral link', () => {
    expect(() => enforceBloggerLinks('<a href="https://tracuugoicuoc.com/a?utm_source=blogger">one</a><a href="https://tracuugoicuoc.com/b?utm_source=blogger">two</a>'))
      .toThrow(/one link/i);
  });

  it('rejects a link without the required destination, UTM, and rel policy', () => {
    expect(() => enforceBloggerLinks('<a href="http://example.com/x">read</a>'))
      .toThrow(/https|destination|utm|rel/i);
  });

  it('requires all UTM fields and the nofollow rel value', () => {
    expect(() => enforceBloggerLinks('<a href="https://tracuugoicuoc.com/?utm_source=blogger">read</a>'))
      .toThrow(/utm_medium|rel/i);
  });

  it('accepts the one permitted referral link with all required attributes', () => {
    const html = '<a href="https://tracuugoicuoc.com/goi?utm_source=blogger&utm_medium=organic&utm_campaign=4g" rel="nofollow noopener noreferrer">read</a>';

    expect(enforceBloggerLinks(html)).toBe(html);
  });

  it('rejects an anchor whose effective rel is not exactly the required value', () => {
    const html = '<a href="https://tracuugoicuoc.com/goi?utm_source=blogger&utm_medium=organic&utm_campaign=4g" rel="noopener" rel="nofollow noopener noreferrer">read</a>';

    expect(() => enforceBloggerLinks(html)).toThrow(/rel/i);
  });
});
