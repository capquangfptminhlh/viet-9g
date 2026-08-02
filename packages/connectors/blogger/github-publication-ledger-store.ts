import type { LedgerEntry } from './blogger.idempotency';

const LEDGER_PATH = 'state/blogger-publication-ledger.json';

type Fetch = typeof fetch;
type LedgerSnapshot = { entries: LedgerEntry[]; sha?: string };

const MAX_WRITE_ATTEMPTS = 3;

function cloneEntries(entries: LedgerEntry[]): LedgerEntry[] {
  return JSON.parse(JSON.stringify(entries)) as LedgerEntry[];
}

function changedEntries(baseline: LedgerEntry[], desired: LedgerEntry[]): LedgerEntry[] {
  const baselineByKey = new Map(baseline.map((entry) => [entry.idempotencyKey, entry]));
  return desired.filter((entry) => JSON.stringify(baselineByKey.get(entry.idempotencyKey)) !== JSON.stringify(entry));
}

function applyChanges(remote: LedgerEntry[], changes: LedgerEntry[]): LedgerEntry[] {
  const rebased = cloneEntries(remote);
  for (const change of changes) {
    const index = rebased.findIndex((entry) => entry.idempotencyKey === change.idempotencyKey);
    if (index === -1) rebased.push(cloneEntries([change])[0]);
    else rebased[index] = cloneEntries([change])[0];
  }
  return rebased;
}

export type GitHubPublicationLedgerStoreOptions = {
  token: string;
  repository: string;
  branch: string;
  fetch?: Fetch;
};

export class GitHubPublicationLedgerStore {
  private sha: string | undefined;
  private baseEntries: LedgerEntry[] = [];
  private readonly fetchImpl: Fetch;
  private readonly endpoint: string;

  constructor(private readonly options: GitHubPublicationLedgerStoreOptions) {
    if (!options.token || !options.repository || !options.branch) {
      throw new Error('DURABLE_LEDGER_CONFIG_REQUIRED: GITHUB_TOKEN, GITHUB_REPOSITORY and GITHUB_REF_NAME are required');
    }
    this.fetchImpl = options.fetch || fetch;
    this.endpoint = `https://api.github.com/repos/${options.repository}/contents/${LEDGER_PATH}`;
  }

  async load(): Promise<LedgerEntry[]> {
    const snapshot = await this.readSnapshot();
    this.sha = snapshot.sha;
    this.baseEntries = cloneEntries(snapshot.entries);
    return cloneEntries(snapshot.entries);
  }

  private async readSnapshot(): Promise<LedgerSnapshot> {
    const response = await this.fetchImpl(`${this.endpoint}?ref=${encodeURIComponent(this.options.branch)}`, {
      headers: this.headers(),
    });
    if (response.status === 404) {
      return { entries: [] };
    }
    if (!response.ok) throw new Error(`DURABLE_LEDGER_READ_FAILED: GitHub returned ${response.status}`);
    const body = await response.json() as { sha?: unknown; content?: unknown };
    if (typeof body.sha !== 'string' || typeof body.content !== 'string') {
      throw new Error('DURABLE_LEDGER_READ_FAILED: GitHub response omitted sha or content');
    }
    const decoded = Buffer.from(body.content.replace(/\s/g, ''), 'base64').toString('utf-8').replace(/^\uFEFF/, '');
    const entries = JSON.parse(decoded);
    if (!Array.isArray(entries)) throw new Error('DURABLE_LEDGER_READ_FAILED: ledger must be a JSON array');
    return { entries, sha: body.sha };
  }

  async save(entries: LedgerEntry[]): Promise<void> {
    const changes = changedEntries(this.baseEntries, entries);
    let rebasedEntries = applyChanges(this.baseEntries, changes);
    let currentSha = this.sha;

    for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt += 1) {
      const requestBody: Record<string, string> = {
        message: 'chore(state): update blogger publication ledger [skip ci]',
        content: Buffer.from(JSON.stringify(rebasedEntries, null, 2)).toString('base64'),
        branch: this.options.branch,
      };
      if (currentSha) requestBody.sha = currentSha;
      const response = await this.fetchImpl(this.endpoint, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const body = await response.json() as { content?: { sha?: unknown } };
        if (typeof body.content?.sha !== 'string') {
          throw new Error('DURABLE_LEDGER_WRITE_FAILED: GitHub response omitted the new blob sha');
        }
        this.sha = body.content.sha;
        this.baseEntries = cloneEntries(rebasedEntries);
        return;
      }
      if (![409, 422].includes(response.status) || attempt === MAX_WRITE_ATTEMPTS) {
        throw new Error(`DURABLE_LEDGER_WRITE_FAILED: GitHub returned ${response.status}`);
      }
      const latest = await this.readSnapshot();
      currentSha = latest.sha;
      rebasedEntries = applyChanges(latest.entries, changes);
    }

    throw new Error('DURABLE_LEDGER_WRITE_FAILED: stale SHA retry limit reached');
  }

  private headers(): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${this.options.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    };
  }
}
