import { describe, expect, it } from 'vitest';
import { normalizePath, resolveCanonicalTargetPath } from '../../src/data/canonical-target-path';

describe('canonical target path resolution', () => {
  it('normalizes percent-encoded Unicode paths to the decoded canonical path', () => {
    expect(normalizePath('/posts/g%C3%B3i-c%C6%B0%E1%BB%9Bc-viettel/')).toBe('/posts/gói-cước-viettel');
  });

  it('matches a decoded topic path against an encoded Vercel redirect source', () => {
    const redirects = [
      {
        source: '/posts/g%C3%B3i-c%C6%B0%E1%BB%9Bc-viettel-xem-tiktok-youtube-facebook-mi%E1%BB%85n-ph%C3%AD-data',
        destination: '/goi-cuoc/mang-xa-hoi',
        permanent: true,
      },
    ];

    expect(
      resolveCanonicalTargetPath('/posts/gói-cước-viettel-xem-tiktok-youtube-facebook-miễn-phí-data', redirects),
    ).toBe('/goi-cuoc/mang-xa-hoi');
  });
});
