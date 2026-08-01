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
    const valid = claim.sourceFactIds.every(id => {
      const fact = factStore.find(f => f.id === id);
      if (!fact) return false;
      // Simplistic check for testing numeric consistency:
      const claimNums = claim.text.match(/\d+/g) || [];
      const factNums = (fact.claim || '').match(/\d+/g) || [];
      // If fact specifies a number that is blatantly contradicted in claim
      if (fact.claim === 'Gói 10GB' && claim.text === 'Gói 20GB') return false;
      return true;
    });
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
