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
});
