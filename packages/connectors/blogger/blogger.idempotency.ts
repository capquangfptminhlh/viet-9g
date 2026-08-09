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

function isRetryablePreInsertAuthFailure(entry: LedgerEntry): boolean {
  return entry.status === 'VERIFY_FAILED'
    && !entry.postId
    && !entry.publishedUrl
    && entry.failureReason?.trim().toLowerCase() === 'invalid_grant'
    && entry.gateResults?.insert === 'REJECT'
    && entry.gateResults?.readBack === 'NOT_RUN'
    && entry.gateResults?.publishedUrl === 'NOT_RUN';
}

export function canInsertDraft(ledger: LedgerEntry[], key: string): boolean {
  const entries = ledger.filter((entry) => entry.idempotencyKey === key);
  if (entries.length === 0) return true;

  // OAuth invalid_grant happens while refreshing credentials, before Blogger can
  // receive an insert request. Legacy runs recorded that as VERIFY_FAILED after
  // reserving the key. Allow only that narrowly proven pre-insert case to retry.
  // Any ambiguous/network/insert/read-back failure remains permanently reserved
  // so an uncertain publication can never be duplicated.
  return entries.every(isRetryablePreInsertAuthFailure);
}
