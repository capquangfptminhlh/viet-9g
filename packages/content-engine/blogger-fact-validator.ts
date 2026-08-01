export interface Claim {
  text: string;
  sourceFactIds: string[];
}

export function validateBloggerFacts(payload: { claims?: Claim[] }, factStore: any[]): { decision: string } {
  if (!payload.claims || payload.claims.length === 0) return { decision: 'PASS' };
  for (const claim of payload.claims) {
    if (!claim.sourceFactIds || claim.sourceFactIds.length === 0) {
      return { decision: 'HOLD' };
    }
    // Check if EVERY sourceFactId exists in the factStore
    const valid = claim.sourceFactIds.every(id => factStore.some(f => f.id === id));
    if (!valid) {
      return { decision: 'HOLD' };
    }
  }
  return { decision: 'PASS' };
}

export function requireFactStore(factStore: any[]): void {
  if (!factStore || factStore.length === 0) {
    throw new Error('FACT_STORE_EMPTY: Cannot run with an empty canonical fact store');
  }
}
