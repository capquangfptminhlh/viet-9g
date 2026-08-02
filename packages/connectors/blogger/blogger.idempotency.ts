import crypto from 'crypto';

export interface LedgerEntry {
  idempotencyKey: string;
  blogId: string;
  topicId: string;
  contentHash: string;
  postId?: string;
  publishedAt?: string;
  status: string;
  createdAt: string;
  packageId?: string;
  catalogVersion?: string;
  contentVersion?: string;
  publishedUrl?: string;
  failureReason?: string;
  gateResults?: Record<string, 'PASS' | 'REJECT' | 'NOT_RUN'>;
}

export function createIdempotencyKey(blogId: string, topicId: string, contentVersion: string): string {
  return crypto.createHash('sha256').update(`${blogId}:${topicId}:${contentVersion}`).digest('hex');
}

export function createRunAuditKey(blogId: string, topicId: string, contentVersion: string, reason: string, runAt: Date): string {
  return crypto.createHash('sha256')
    .update(`run-audit:${blogId}:${topicId}:${contentVersion}:${reason}:${runAt.toISOString()}`)
    .digest('hex');
}

export function findLedgerEntry(ledger: LedgerEntry[], key: string): LedgerEntry | undefined {
  return ledger.find((e) => e.idempotencyKey === key);
}

export function canInsertDraft(ledger: LedgerEntry[], key: string): boolean {
  const entry = findLedgerEntry(ledger, key);
  if (!entry) return true;
  return false;
}
