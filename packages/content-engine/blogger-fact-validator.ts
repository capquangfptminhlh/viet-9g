export interface Claim {
  text: string;
  sourceFactIds: string[];
}

interface Fact {
  id: string;
  claim?: string;
}

const QUANTITY_PATTERN = /\d+(?:[.,]\d+)?\s*(?:gb|mb|ngày|đ|vnd)/gi;

function quantitiesIn(text: string): string[] {
  return text.match(QUANTITY_PATTERN)?.map((quantity) => quantity.toLowerCase().replace(/\s+/g, '')) ?? [];
}

export function validateBloggerFacts(payload: { claims?: Claim[] }, factStore: any[]): { decision: string } {
  if (!payload.claims?.length) return { decision: 'PASS' };

  for (const claim of payload.claims) {
    if (!claim.sourceFactIds?.length) return { decision: 'HOLD' };
    const referencedFacts = claim.sourceFactIds
      .map((id) => factStore.find((candidate: Fact) => candidate.id === id));

    if (referencedFacts.some((fact) => !fact)) return { decision: 'HOLD' };

    const referencedQuantities = new Set(
      referencedFacts.flatMap((fact: Fact) => quantitiesIn(String(fact.claim ?? ''))),
    );
    if (quantitiesIn(claim.text).some((quantity) => !referencedQuantities.has(quantity))) {
      return { decision: 'HOLD' };
    }
  }
  return { decision: 'PASS' };
}

export function requireFactStore(factStore: any[]): void {
  if (!factStore?.length) throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');
}
