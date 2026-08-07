import fs from 'node:fs';

export type K0Cluster = {
  id?: unknown;
  intent?: unknown;
  canonicalUrl?: unknown;
  keywords?: unknown;
  sourceUrls?: unknown;
};

export type K0Decision = {
  status?: unknown;
  approvals?: { product?: unknown; seo?: unknown };
  clusters?: K0Cluster[];
};

export type K0GateResult = { ok: true } | { ok: false; reasons: string[] };

const FIXTURE_MARKERS = ['example.com', 'fixture', 'reference-only'];
const CANONICAL_HOST = 'www.tracuugoicuoc.com';

function containsFixtureMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return FIXTURE_MARKERS.some((marker) => normalized.includes(marker));
  }
  if (Array.isArray(value)) return value.some(containsFixtureMarker);
  if (value && typeof value === 'object') return Object.values(value).some(containsFixtureMarker);
  return false;
}

function isCanonicalUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.host === CANONICAL_HOST && url.pathname !== '/';
  } catch {
    return false;
  }
}

function hasSourceUrls(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((source) => {
    if (typeof source !== 'string') return false;
    try { return new URL(source).protocol === 'https:'; } catch { return false; }
  });
}

export function validateK0Decision(decision: K0Decision): K0GateResult {
  const reasons: string[] = [];
  if (decision.status !== 'APPROVED') reasons.push('K0 decision status must be APPROVED');
  if (decision.approvals?.product !== true || decision.approvals?.seo !== true) {
    reasons.push('K0 decision requires product and SEO approvals');
  }
  if (!Array.isArray(decision.clusters) || decision.clusters.length === 0) {
    reasons.push('K0 decision requires at least one intent cluster');
  } else {
    const canonicalUrls = new Set<string>();
    for (const [index, cluster] of decision.clusters.entries()) {
      const prefix = `cluster ${index + 1}`;
      if (typeof cluster.id !== 'string' || !cluster.id.trim()) reasons.push(`${prefix} needs an id`);
      if (typeof cluster.intent !== 'string' || !cluster.intent.trim()) reasons.push(`${prefix} needs an intent`);
      if (!isCanonicalUrl(cluster.canonicalUrl)) reasons.push(`${prefix} needs a canonical URL on ${CANONICAL_HOST}`);
      if (!Array.isArray(cluster.keywords) || cluster.keywords.length === 0 || !cluster.keywords.every((keyword) => typeof keyword === 'string' && keyword.trim())) {
        reasons.push(`${prefix} needs at least one keyword`);
      }
      if (!hasSourceUrls(cluster.sourceUrls)) reasons.push(`${prefix} needs at least one HTTPS source URL`);
      if (typeof cluster.canonicalUrl === 'string') {
        if (canonicalUrls.has(cluster.canonicalUrl)) reasons.push(`${prefix} duplicates a canonical URL`);
        canonicalUrls.add(cluster.canonicalUrl);
      }
    }
  }
  if (containsFixtureMarker(decision)) reasons.push('K0 decision contains fixture or reference-only data');
  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

export function validateK0DecisionFile(decisionPath = 'state/k0-decision.json'): K0GateResult {
  if (!fs.existsSync(decisionPath)) return { ok: false, reasons: [`missing decision file ${decisionPath}`] };
  try {
    return validateK0Decision(JSON.parse(fs.readFileSync(decisionPath, 'utf8').replace(/^\uFEFF/, '')));
  } catch (error) {
    return { ok: false, reasons: [`invalid decision JSON: ${error instanceof Error ? error.message : String(error)}`] };
  }
}
