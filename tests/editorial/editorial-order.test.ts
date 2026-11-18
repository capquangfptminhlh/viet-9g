import { describe, expect, it } from 'vitest';
import { newestPostsFirst } from '../../src/lib/editorial-order';

const post = (slug: string, date?: string) => ({
  slug,
  data: date ? { date: new Date(date + 'T00:00:00Z') } : {},
});

describe('editorial date ordering', () => {
  it('puts the most recently published article first regardless of collection order', () => {
    const source = [post('old-guide', '2026-09-06'), post('recent-guide', '2026-11-18'), post('october-guide', '2026-10-19')];
    expect(newestPostsFirst(source).map(p => p.slug)).toEqual(['recent-guide', 'october-guide', 'old-guide']);
    expect(source[0].slug).toBe('old-guide');
  });

  it('keeps undated posts last, with a deterministic tie-breaker', () => {
    const source = [post('z'), post('b', '2026-11-18'), post('a', '2026-11-18'), post('without-date')];
    expect(newestPostsFirst(source).map(p => p.slug)).toEqual(['a', 'b', 'without-date', 'z']);
  });
});
