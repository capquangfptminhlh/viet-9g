export interface Claim {
  text: string;
  sourceFactIds: string[];
}

interface Fact {
  id: string;
  claim?: string;
  expiresAt?: string;
  sourceUrl?: string;
}

const VIETTEL_DOMAINS = [
  'viettel.vn',
  'vietteltelecom.vn',
  '098.viettel.vn'
];

function isViettelDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return VIETTEL_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch (e) {
    return false;
  }
}

const QUANTITY_PATTERN = /\d+(?:[.,]\d+)?\s*(?:gb|mb|ng\u00e0y|\u0111|vnd)/gi;

function quantitiesIn(text: string): string[] {
  return text.match(QUANTITY_PATTERN)?.map((quantity) => quantity.toLowerCase().replace(/\s+/g, '')) ?? [];
}

export function validateBloggerFacts(payload: { claims?: Claim[] }, factStore: any[], now: Date = new Date()): { decision: string } {
  if (!payload.claims?.length) return { decision: 'PASS' };

  for (const claim of payload.claims) {
    if (!claim.sourceFactIds?.length) return { decision: 'HOLD' };
    const referencedFacts = claim.sourceFactIds
      .map((id) => factStore.find((candidate: Fact) => candidate.id === id));

    if (referencedFacts.some((fact) => !fact)) return { decision: 'HOLD' };

    for (const fact of referencedFacts) {
      if (!fact.expiresAt) return { decision: 'HOLD' };
      const expiresTimestamp = new Date(fact.expiresAt).getTime();
      if (isNaN(expiresTimestamp) || expiresTimestamp < now.getTime()) return { decision: 'HOLD' };
      if (!fact.sourceUrl || !isViettelDomain(fact.sourceUrl)) return { decision: 'HOLD' };
    }

    const referencedQuantities = new Set(
      referencedFacts.flatMap((fact: Fact) => quantitiesIn(String(fact.claim ?? ''))),
    );
    const claimQuantities = quantitiesIn(claim.text);
    if (claimQuantities.some((quantity) => !referencedQuantities.has(quantity))) {
      return { decision: 'HOLD' };
    }
  }
  return { decision: 'PASS' };
}

export function requireFactStore(factStore: any[]): void {
  if (!factStore?.length) throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');
}
