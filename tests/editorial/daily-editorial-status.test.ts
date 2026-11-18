import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { assessArticle, auditDailyReadiness, sourcePostsForLocalDay } from '../../scripts/daily-editorial-status.mjs';

describe('daily editorial release reliability (actual repository data)', () => {
  it('identifies an existing substantive article as ready for quality review', () => {
    const article = readFileSync('src/content/posts/iphone-viettel-khong-thay-cuoc-goi-wifi-calling.md', 'utf8');
    const assessment = assessArticle(article);
    expect(assessment.words).toBeGreaterThanOrEqual(250);
    expect(assessment.passed).toBe(true);
  });

  it('holds an actual existing generic template article instead of reporting publishable', () => {
    const article = readFileSync('src/content/posts/b4-review-15-b.md', 'utf8');
    const assessment = assessArticle(article);
    expect(assessment.passed).toBe(false);
    expect(assessment.findings).toContain('GENERIC_UNEDITED_CONTENT_TEMPLATE');
    expect(assessment.findings).toContain('THIN_ARTICLE_UNDER_250_WORDS');
  });

  it('never treats an empty article as publication-ready', () => {
    const assessment = assessArticle('');
    expect(assessment.passed).toBe(false);
    expect(assessment.findings).toContain('ARTICLE_HEADINGS_MISSING');
  });

  it('derives same-day publication candidates from real article dates', () => {
    const sources = sourcePostsForLocalDay(new Date('2026-11-18T16:38:00Z'));
    expect(sources).toContain('iphone-viettel-khong-thay-cuoc-goi-wifi-calling');
    expect(sources.every(slug => !slug.endsWith('.md'))).toBe(true);
  });

  it('does not invent article publication for a day with no source entry', () => {
    expect(sourcePostsForLocalDay(new Date('2025-01-01T07:00:00Z'))).toEqual([]);
  });

  it('records real queued topics and source/ownership blockers, not fake production success', () => {
    const audit = auditDailyReadiness(new Date('2026-11-18T16:38:00Z'));
    expect(audit.status).toBe('RESEARCH_ONLY_NOT_APPROVED_FOR_PUBLICATION');
    expect(audit.publishedToProduction).toBe(false);
    expect(audit.blockedTopics + audit.provisionalTopics).toBe(audit.queue);
    expect(audit.blockedReasons.CANONICAL_OWNER_EXISTS).toBeGreaterThan(0);
    expect(audit.blockedReasons.FACT_MISSING_OR_EXPIRED).toBeGreaterThan(0);
  });
});
