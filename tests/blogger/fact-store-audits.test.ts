import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Fact = {
  id: string;
  claim?: string;
  sourceUrl?: string;
  retrievedAt?: string;
  effectiveAt?: string;
  expiresAt?: string;
  recheckPolicy?: string;
};

const AUDIT_DATE = '2026-08-02';
const RECHECK_POLICY = 'Recheck the official source before publication after expiresAt.';
const AUDITS = [
  { file: 'usage.md', prefix: 'usage' },
  { file: 'cancellation.md', prefix: 'cancellation' },
  { file: 'packages.md', prefix: 'package' },
  { file: 'troubleshooting.md', prefix: 'troubleshooting' },
  { file: 'news.md', prefix: 'news' },
];

function normalizeClaim(value: string): string {
  return value.replace(/`/g, '').trim();
}

function parseExpiry(value: string): string | undefined {
  if (/expired/i.test(value)) return undefined;
  const match = value.match(/\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?/);
  if (!match) throw new Error(`Missing expiry/recheck date in "${value}"`);
  return match[0].includes('T') ? match[0] : `${match[0]}T23:59:59Z`;
}

function readAudit(file: string, prefix: string): Fact[] {
  const markdown = fs.readFileSync(path.join('docs', 'fact-audits', file), 'utf8');
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\|\s*(?:[a-z]+-)?\d+\s*\|/i.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
    .flatMap(([rawId, claim, source, retrievedAt, rawExpiry]) => {
      const expiresAt = parseExpiry(rawExpiry);
      if (!expiresAt || Date.parse(expiresAt) < Date.parse(AUDIT_DATE)) return [];
      const numericId = rawId.match(/\d+$/)?.[0];
      if (!numericId) throw new Error(`Missing numeric fact ID in "${rawId}"`);
      const sourceUrl = source.match(/\]\((https:\/\/[^)]+)\)/)?.[1];
      if (!sourceUrl) throw new Error(`Missing official source URL for ${rawId}`);
      return [{
        id: rawId.includes('-') ? rawId : `${prefix}-${numericId.padStart(2, '0')}`,
        claim: normalizeClaim(claim),
        sourceUrl,
        retrievedAt,
        effectiveAt: AUDIT_DATE,
        expiresAt,
        recheckPolicy: RECHECK_POLICY,
      }];
    });
}

describe('canonical Blogger fact store audits', () => {
  const facts: Fact[] = JSON.parse(fs.readFileSync('data/facts.json', 'utf8').replace(/^\uFEFF/, ''));
  const auditedFacts = AUDITS.flatMap(({ file, prefix }) => readAudit(file, prefix));

  it('loads every Blog 3 expansion fact from an unexpired official Viettel source', () => {
    const requiredIds = Array.from({ length: 14 }, (_, index) => `blog3-exp-${String(index + 1).padStart(2, '0')}`);
    const officialViettelHost = /^(?:https:\/\/)(?:098\.viettel\.vn|(?:www\.)?vietteltelecom\.vn|shop\.viettel\.vn)\//;

    for (const id of requiredIds) {
      const fact = facts.find((candidate) => candidate.id === id);
      expect(fact, id).toBeDefined();
      expect(fact?.sourceUrl, id).toMatch(officialViettelHost);
      expect(fact?.expiresAt, id).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(Date.parse(fact!.expiresAt!), id).toBeGreaterThan(Date.parse(AUDIT_DATE));
    }
  });

  it('preserves existing facts and has globally unique IDs', () => {
    const ids = facts.map((fact) => fact.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining([
      'fact-1',
      'fact-2',
      'fact-3',
      'fact-4',
      'fact-5',
      'fact-6',
      'fact-7',
    ]));
  });

  it('contains every unexpired verified audit claim with its official evidence and recheck policy', () => {
    expect(auditedFacts).toHaveLength(72);
    for (const expected of auditedFacts) {
      expect(facts.find((fact) => fact.id === expected.id), expected.id).toEqual(expected);
    }
  });

  it('does not import expired promotional rows as current facts', () => {
    expect(facts.map((fact) => fact.id)).not.toEqual(expect.arrayContaining([
      'news-07',
      'news-08',
      'news-09',
    ]));
  });
});
