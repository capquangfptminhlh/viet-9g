/** Consistent newest-first order for all editorial surfaces. */
export type DatedEditorialPost = {
  slug: string;
  data: { date?: Date };
};

function publicationTime(post: DatedEditorialPost): number {
  const value = post.data.date;
  return value instanceof Date && Number.isFinite(value.getTime()) ? value.getTime() : 0;
}

/** Returns a copy; undated posts go last; ties are stable by slug. */
export function newestPostsFirst<T extends DatedEditorialPost>(posts: readonly T[]): T[] {
  return [...posts].sort(
    (left, right) =>
      publicationTime(right) - publicationTime(left) ||
      left.slug.localeCompare(right.slug, 'vi'),
  );
}
