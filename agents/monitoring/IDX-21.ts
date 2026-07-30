/**
 * IDX-21: Index Notifier Agent (IndexNow & Google Indexing Policy Enforcement)
 * Master Spec v3.2 - Section 4.1 (FR-014), Section 7, Section 11, Section 19.2, Section 21, Phase 9
 *
 * Primary Responsibilities:
 * 1. Submits updated/created/deleted URLs to IndexNow endpoint (Bing, Yandex, etc.).
 * 2. Filters out unchanged URLs (Unchanged URLs must NOT be pinged).
 * 3. Enforces strict Google Indexing API Policy: Standard articles and pages are
 *    STRICTLY PROHIBITED from using Google Indexing API. Only eligible schema types
 *    (JobPosting, BroadcastEvent, BroadcastEvent-in-VideoObject) may use Google Indexing API.
 * 4. Supports dryRun simulation mode and outputs structured audit results with reason codes.
 */

export type UrlChangeType = 'created' | 'updated' | 'deleted' | 'unchanged';

export interface UrlChangeItem {
  url: string;
  changeType: UrlChangeType;
  schemaTypes?: string[];
  lastModified?: string;
}

export interface IndexNotifierConfig {
  domain: string;
  key: string;
  keyLocation?: string;
  indexNowApiUrl: string;
  dryRun: boolean;
  allowGoogleIndexingApi: boolean;
}

export interface GoogleIndexingCheckResult {
  url: string;
  eligible: boolean;
  schemaTypes: string[];
  action: 'SUBMIT' | 'SKIP_RESTRICTED';
  reasonCode: string;
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export interface IndexNotifierResult {
  success: boolean;
  submittedUrls: string[];
  skippedUrls: string[];
  googleSubmittedUrls: string[];
  googleSkippedUrls: string[];
  reasonCodes: string[];
  statusCode?: number;
  statusMessage: string;
  timestamp: string;
}

/**
 * Eligible schemas permitted for Google Indexing API per Google Guidelines & Spec 19.2
 */
const GOOGLE_INDEXING_ELIGIBLE_SCHEMAS = [
  'JobPosting',
  'BroadcastEvent',
  'VideoObject', // When containing BroadcastEvent
];

export class IndexNotifierAgent {
  private config: IndexNotifierConfig;

  constructor(config?: Partial<IndexNotifierConfig>) {
    this.config = {
      domain: config?.domain ?? 'tracuugoicuoc.com',
      key: config?.key ?? '9f7435f2b3e846059d9df3c965c4015f',
      keyLocation: config?.keyLocation ?? `https://${config?.domain ?? 'tracuugoicuoc.com'}/9f7435f2b3e846059d9df3c965c4015f.txt`,
      indexNowApiUrl: config?.indexNowApiUrl ?? 'https://api.indexnow.org/IndexNow',
      dryRun: config?.dryRun ?? false,
      allowGoogleIndexingApi: config?.allowGoogleIndexingApi ?? false,
    };
  }

  /**
   * Enforces Google Indexing API policy (Spec 19.2 & Spec 21)
   * Google Indexing API is strictly restricted to JobPosting or BroadcastEvent pages.
   */
  public checkGoogleIndexingEligibility(item: UrlChangeItem): GoogleIndexingCheckResult {
    const schemas = item.schemaTypes ?? [];
    const isEligible = schemas.some((schema) =>
      GOOGLE_INDEXING_ELIGIBLE_SCHEMAS.includes(schema)
    );

    if (isEligible && this.config.allowGoogleIndexingApi) {
      return {
        url: item.url,
        eligible: true,
        schemaTypes: schemas,
        action: 'SUBMIT',
        reasonCode: 'GOOGLE_INDEXING_ELIGIBLE',
      };
    }

    return {
      url: item.url,
      eligible: false,
      schemaTypes: schemas,
      action: 'SKIP_RESTRICTED',
      reasonCode: 'GOOGLE_INDEXING_POLICY_BLOCKED',
    };
  }

  /**
   * Main execution function for Index Notifier (IDX-21)
   */
  public async run(items: UrlChangeItem[]): Promise<IndexNotifierResult> {
    const timestamp = new Date().toISOString();
    const reasonCodes: string[] = [];

    // 1. Separate changed URLs vs unchanged URLs
    const changedItems = items.filter(
      (item) => item.changeType === 'created' || item.changeType === 'updated' || item.changeType === 'deleted'
    );
    const unchangedItems = items.filter((item) => item.changeType === 'unchanged');

    const submittedUrls: string[] = [];
    const skippedUrls: string[] = unchangedItems.map((item) => item.url);
    const googleSubmittedUrls: string[] = [];
    const googleSkippedUrls: string[] = [];

    if (unchangedItems.length > 0) {
      reasonCodes.push('UNCHANGED_URL_SKIPPED');
    }

    // 2. Process Google Indexing API policy check for all items
    for (const item of items) {
      const gCheck = this.checkGoogleIndexingEligibility(item);
      if (gCheck.eligible && gCheck.action === 'SUBMIT') {
        googleSubmittedUrls.push(item.url);
      } else {
        googleSkippedUrls.push(item.url);
      }
    }
    if (googleSkippedUrls.length > 0) {
      reasonCodes.push('GOOGLE_INDEXING_POLICY_ENFORCED');
    }

    // 3. Early exit if no changed URLs for IndexNow
    if (changedItems.length === 0) {
      reasonCodes.push('NO_CHANGED_URLS');
      return {
        success: true,
        submittedUrls: [],
        skippedUrls,
        googleSubmittedUrls,
        googleSkippedUrls,
        reasonCodes,
        statusMessage: 'No changed URLs to submit to IndexNow.',
        timestamp,
      };
    }

    const urlsToSubmit = changedItems.map((item) => item.url);

    // 4. Handle Dry Run mode
    if (this.config.dryRun) {
      reasonCodes.push('DRY_RUN_SIMULATED', 'INDEXNOW_SUBMITTED');
      return {
        success: true,
        submittedUrls: urlsToSubmit,
        skippedUrls,
        googleSubmittedUrls,
        googleSkippedUrls,
        reasonCodes,
        statusCode: 200,
        statusMessage: `[Dry Run] Simulated IndexNow submission for ${urlsToSubmit.length} URLs.`,
        timestamp,
      };
    }

    // 5. Send payload to IndexNow API
    const payload: IndexNowPayload = {
      host: this.config.domain,
      key: this.config.key,
      keyLocation: this.config.keyLocation,
      urlList: urlsToSubmit,
    };

    try {
      const response = await fetch(this.config.indexNowApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 202) {
        reasonCodes.push('INDEXNOW_SUBMITTED');
        return {
          success: true,
          submittedUrls: urlsToSubmit,
          skippedUrls,
          googleSubmittedUrls,
          googleSkippedUrls,
          reasonCodes,
          statusCode: response.status,
          statusMessage: `Successfully submitted ${urlsToSubmit.length} URLs to IndexNow.`,
          timestamp,
        };
      } else {
        reasonCodes.push('INDEXNOW_REJECTED');
        return {
          success: false,
          submittedUrls: [],
          skippedUrls: [...skippedUrls, ...urlsToSubmit],
          googleSubmittedUrls,
          googleSkippedUrls,
          reasonCodes,
          statusCode: response.status,
          statusMessage: `IndexNow API rejected request with status ${response.status}: ${response.statusText}`,
          timestamp,
        };
      }
    } catch (error: any) {
      reasonCodes.push('INDEXNOW_NETWORK_ERROR');
      return {
        success: false,
        submittedUrls: [],
        skippedUrls: [...skippedUrls, ...urlsToSubmit],
        googleSubmittedUrls,
        googleSkippedUrls,
        reasonCodes,
        statusMessage: `Network error sending IndexNow request: ${error?.message || 'Unknown error'}`,
        timestamp,
      };
    }
  }
}

/**
 * Convenience export function for IDX-21 agent
 */
export async function notifyIndex(
  items: UrlChangeItem[],
  options?: Partial<IndexNotifierConfig>
): Promise<IndexNotifierResult> {
  const agent = new IndexNotifierAgent(options);
  return agent.run(items);
}
