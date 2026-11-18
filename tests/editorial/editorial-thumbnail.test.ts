import { describe, expect, it } from 'vitest';
import { findFirstLocalIllustration } from '../../src/lib/editorial-thumbnail';

describe('editorial thumbnail selection', () => {
  it('uses each post own illustration instead of a duplicate category fallback', () => {
    const body = '# MXH150\n\n![MXH150](https://tracuugoicuoc.com/images/blogger/b4-review-15-b-7af4073ef629.svg)';
    expect(findFirstLocalIllustration(body)).toBe('/images/blogger/b4-review-15-b-7af4073ef629.svg');
  });

  it('keeps root-relative image URLs and strips query parameters', () => {
    expect(findFirstLocalIllustration('![Phone](/images/phone.svg?v=2)')).toBe('/images/phone.svg');
  });

  it('does not use third-party URLs or lookalike hosts', () => {
    const body = '![Ad](https://tracuugoicuoc.com.evil.example/images/abc.svg)\n\n![Other](https://example.org/images/abc.svg)';
    expect(findFirstLocalIllustration(body)).toBeNull();
  });

  it('skips remote images to find a later owned illustration', () => {
    const body = '![remote](https://example.org/banner.jpg)\n![owned](https://www.tracuugoicuoc.com/images/local.svg)';
    expect(findFirstLocalIllustration(body)).toBe('/images/local.svg');
  });

  it('returns null when no illustrated image exists', () => {
    expect(findFirstLocalIllustration('# Heading\n\nNo image.')).toBeNull();
  });
});
