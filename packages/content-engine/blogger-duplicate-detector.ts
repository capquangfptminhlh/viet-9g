export function detectDuplicate(candidate: { contentHash?: string }, ledger: Array<{ contentHash?: string }>): { decision: string } {
  if (!candidate.contentHash) return { decision: 'PASS' };
  const exists = ledger.some((entry) => entry.contentHash === candidate.contentHash);
  if (exists) {
    return { decision: 'REJECT' };
  }
  return { decision: 'PASS' };
}
