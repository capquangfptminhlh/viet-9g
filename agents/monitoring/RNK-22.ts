/**
 * RNK-22: Metrics Normalizer Agent (GSC / Bing / GA4 / AI Visibility Normalization)
 * Master Spec v3.2 - Section 3.5 (KPIs), Section 7, Section 8 (Maturity Window N-3), Phase 9, Phụ lục D #14
 *
 * Primary Responsibilities:
 * 1. Ingests and normalizes multi-channel metrics from Google Search Console, Bing Webmaster, and GA4.
 * 2. Enforces GSC Data Maturity Window (N-3 rule):
 *    Search performance data for dates N-2..N is marked `isMature: false` ('immature').
 *    Only mature data (≤ N-3) is eligible for anomaly detection rules to prevent false penalty alerts.
 * 3. Tracks AEO / AI Visibility metrics:
 *    Identifies AI referral sessions (ChatGPT, Perplexity, Gemini, Copilot, etc.),
 *    landing pages receiving AI referrals, and extractable answer blocks coverage.
 * 4. Aggregates data into structured metrics reports conforming to system schema contracts.
 */

export interface RawGSCRow {
  date: string; // YYYY-MM-DD
  query?: string;
  page?: string;
  device?: string;
  country?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface NormalizedGSCRow extends RawGSCRow {
  isMature: boolean;
  dataMaturityStatus: 'mature' | 'immature';
}

export interface RawBingRow {
  date: string; // YYYY-MM-DD
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface NormalizedBingRow extends RawBingRow {
  isMature: boolean;
  dataMaturityStatus: 'mature' | 'immature';
}

export interface RawGA4Row {
  date: string; // YYYY-MM-DD
  pagePath: string;
  source: string;
  medium: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
  revenue: number;
}

export interface NormalizedGA4Row extends RawGA4Row {
  isMature: boolean;
  dataMaturityStatus: 'mature' | 'immature';
  isAiReferral: boolean;
  aiPlatform?: string;
  engagementRate: number;
}

export interface AIVisibilityMetrics {
  totalAiReferralSessions: number;
  aiReferralByPlatform: Record<string, number>;
  topAiLandingPages: Array<{ pagePath: string; sessions: number }>;
  totalPagesWithExtractableAnswerBlocks: number;
  totalPagesCount: number;
  extractableAnswerBlocksPct: number;
  timestamp: string;
}

export interface MetricsSummary {
  totalGscClicks: number;
  totalGscImpressions: number;
  avgGscCtr: number;
  avgGscPosition: number;
  totalBingClicks: number;
  totalBingImpressions: number;
  totalGa4Sessions: number;
  totalGa4EngagedSessions: number;
  totalGa4Conversions: number;
  totalGa4Revenue: number;
  aiVisibility: AIVisibilityMetrics;
  matureDataRange: { start: string; end: string };
  immatureRecordCount: number;
  matureRecordCount: number;
  reasonCodes: string[];
  generatedAt: string;
}

export interface MetricsNormalizerConfig {
  domain: string;
  maturityDaysWindow: number; // Default 3 days (N-3)
  aiReferralSources: Record<string, string>; // Pattern -> Platform Name
  dryRun: boolean;
}

const DEFAULT_AI_REFERRAL_SOURCES: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'gemini.google.com': 'Gemini',
  'bard.google.com': 'Gemini',
  'copilot.microsoft.com': 'Copilot',
  'bing.com/chat': 'Copilot',
  'claude.ai': 'Claude',
  'poe.com': 'Poe',
  'you.com': 'You.com',
  'phind.com': 'Phind',
};

export class MetricsNormalizerAgent {
  private config: MetricsNormalizerConfig;

  constructor(config?: Partial<MetricsNormalizerConfig>) {
    this.config = {
      domain: config?.domain ?? 'tracuugoicuoc.com',
      maturityDaysWindow: config?.maturityDaysWindow ?? 3,
      aiReferralSources: { ...DEFAULT_AI_REFERRAL_SOURCES, ...(config?.aiReferralSources ?? {}) },
      dryRun: config?.dryRun ?? false,
    };
  }

  /**
   * Enforces GSC Data Maturity Rule (Spec 8 & Phụ lục D #14).
   * Data is mature if date <= (referenceDate - maturityDaysWindow).
   */
  public evaluateMaturity(dateStr: string, referenceDateStr?: string): { isMature: boolean; dataMaturityStatus: 'mature' | 'immature' } {
    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
    const targetDate = new Date(dateStr);

    // Calculate cutoff date: reference date minus maturityDaysWindow (e.g. 3 days)
    const cutoffDate = new Date(refDate);
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - this.config.maturityDaysWindow);
    cutoffDate.setUTCHours(23, 59, 59, 999);

    const isMature = targetDate.getTime() <= cutoffDate.getTime();
    return {
      isMature,
      dataMaturityStatus: isMature ? 'mature' : 'immature',
    };
  }

  /**
   * Identifies AI Referral traffic sources for AEO tracking
   */
  public detectAiReferral(source: string): { isAiReferral: boolean; aiPlatform?: string } {
    const lowerSource = source.toLowerCase().trim();
    for (const [pattern, platform] of Object.entries(this.config.aiReferralSources)) {
      if (lowerSource.includes(pattern)) {
        return { isAiReferral: true, aiPlatform: platform };
      }
    }
    return { isAiReferral: false };
  }

  /**
   * Normalizes raw GSC performance rows
   */
  public normalizeGSCData(rawRows: RawGSCRow[], referenceDateStr?: string): NormalizedGSCRow[] {
    return rawRows.map((row) => {
      const maturity = this.evaluateMaturity(row.date, referenceDateStr);
      return {
        ...row,
        ctr: parseFloat(row.ctr.toFixed(4)),
        position: parseFloat(row.position.toFixed(2)),
        isMature: maturity.isMature,
        dataMaturityStatus: maturity.dataMaturityStatus,
      };
    });
  }

  /**
   * Normalizes raw Bing Webmaster performance rows
   */
  public normalizeBingData(rawRows: RawBingRow[], referenceDateStr?: string): NormalizedBingRow[] {
    return rawRows.map((row) => {
      const maturity = this.evaluateMaturity(row.date, referenceDateStr);
      return {
        ...row,
        ctr: parseFloat(row.ctr.toFixed(4)),
        position: parseFloat(row.position.toFixed(2)),
        isMature: maturity.isMature,
        dataMaturityStatus: maturity.dataMaturityStatus,
      };
    });
  }

  /**
   * Normalizes raw GA4 analytics rows
   */
  public normalizeGA4Data(rawRows: RawGA4Row[], referenceDateStr?: string): NormalizedGA4Row[] {
    return rawRows.map((row) => {
      const maturity = this.evaluateMaturity(row.date, referenceDateStr);
      const aiDetection = this.detectAiReferral(row.source);
      const engagementRate = row.sessions > 0 ? parseFloat((row.engagedSessions / row.sessions).toFixed(4)) : 0;

      return {
        ...row,
        isMature: maturity.isMature,
        dataMaturityStatus: maturity.dataMaturityStatus,
        isAiReferral: aiDetection.isAiReferral,
        aiPlatform: aiDetection.aiPlatform,
        engagementRate,
      };
    });
  }

  /**
   * Computes AEO / AI Visibility metrics from normalized GA4 data
   */
  public computeAIVisibility(
    ga4Rows: NormalizedGA4Row[],
    pagesWithExtractableAnswerBlocksCount: number = 0,
    totalPagesCount: number = 0
  ): AIVisibilityMetrics {
    const aiRows = ga4Rows.filter((r) => r.isAiReferral);
    const totalAiReferralSessions = aiRows.reduce((sum, r) => sum + r.sessions, 0);

    const aiReferralByPlatform: Record<string, number> = {};
    const pageSessionMap: Record<string, number> = {};

    for (const row of aiRows) {
      const platform = row.aiPlatform || 'Other AI';
      aiReferralByPlatform[platform] = (aiReferralByPlatform[platform] || 0) + row.sessions;

      pageSessionMap[row.pagePath] = (pageSessionMap[row.pagePath] || 0) + row.sessions;
    }

    const topAiLandingPages = Object.entries(pageSessionMap)
      .map(([pagePath, sessions]) => ({ pagePath, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const extractableAnswerBlocksPct =
      totalPagesCount > 0
        ? parseFloat((pagesWithExtractableAnswerBlocksCount / totalPagesCount).toFixed(4))
        : 0;

    return {
      totalAiReferralSessions,
      aiReferralByPlatform,
      topAiLandingPages,
      totalPagesWithExtractableAnswerBlocks: pagesWithExtractableAnswerBlocksCount,
      totalPagesCount,
      extractableAnswerBlocksPct,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Combines all normalized data sources into a unified MetricsSummary
   */
  public aggregateMetrics(
    gscRows: NormalizedGSCRow[],
    bingRows: NormalizedBingRow[],
    ga4Rows: NormalizedGA4Row[],
    pagesWithExtractableAnswerBlocksCount: number = 0,
    totalPagesCount: number = 0
  ): MetricsSummary {
    const reasonCodes: string[] = ['METRICS_NORMALIZED'];

    const totalGscClicks = gscRows.reduce((sum, r) => sum + r.clicks, 0);
    const totalGscImpressions = gscRows.reduce((sum, r) => sum + r.impressions, 0);
    const avgGscCtr = totalGscImpressions > 0 ? parseFloat((totalGscClicks / totalGscImpressions).toFixed(4)) : 0;
    const avgGscPosition =
      gscRows.length > 0
        ? parseFloat((gscRows.reduce((sum, r) => sum + r.position, 0) / gscRows.length).toFixed(2))
        : 0;

    const totalBingClicks = bingRows.reduce((sum, r) => sum + r.clicks, 0);
    const totalBingImpressions = bingRows.reduce((sum, r) => sum + r.impressions, 0);

    const totalGa4Sessions = ga4Rows.reduce((sum, r) => sum + r.sessions, 0);
    const totalGa4EngagedSessions = ga4Rows.reduce((sum, r) => sum + r.engagedSessions, 0);
    const totalGa4Conversions = ga4Rows.reduce((sum, r) => sum + r.conversions, 0);
    const totalGa4Revenue = ga4Rows.reduce((sum, r) => sum + r.revenue, 0);

    const allRows = [...gscRows, ...bingRows, ...ga4Rows];
    const immatureRecordCount = allRows.filter((r) => !r.isMature).length;
    const matureRecordCount = allRows.filter((r) => r.isMature).length;

    if (immatureRecordCount > 0) {
      reasonCodes.push('IMMATURE_DATA_EXCLUDED_FROM_ANOMALY');
    }

    const matureDates = allRows
      .filter((r) => r.isMature)
      .map((r) => r.date)
      .sort();

    const matureDataRange = {
      start: matureDates[0] || '',
      end: matureDates[matureDates.length - 1] || '',
    };

    const aiVisibility = this.computeAIVisibility(
      ga4Rows,
      pagesWithExtractableAnswerBlocksCount,
      totalPagesCount
    );

    return {
      totalGscClicks,
      totalGscImpressions,
      avgGscCtr,
      avgGscPosition,
      totalBingClicks,
      totalBingImpressions,
      totalGa4Sessions,
      totalGa4EngagedSessions,
      totalGa4Conversions,
      totalGa4Revenue,
      aiVisibility,
      matureDataRange,
      immatureRecordCount,
      matureRecordCount,
      reasonCodes,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper execution wrapper for RNK-22
   */
  public run(
    rawGsc: RawGSCRow[] = [],
    rawBing: RawBingRow[] = [],
    rawGa4: RawGA4Row[] = [],
    pagesWithExtractableAnswerBlocksCount: number = 0,
    totalPagesCount: number = 0,
    referenceDateStr?: string
  ): MetricsSummary {
    const normGsc = this.normalizeGSCData(rawGsc, referenceDateStr);
    const normBing = this.normalizeBingData(rawBing, referenceDateStr);
    const normGa4 = this.normalizeGA4Data(rawGa4, referenceDateStr);

    return this.aggregateMetrics(
      normGsc,
      normBing,
      normGa4,
      pagesWithExtractableAnswerBlocksCount,
      totalPagesCount
    );
  }
}

/**
 * Convenience function for RNK-22 agent
 */
export function normalizeMetrics(
  rawGsc: RawGSCRow[] = [],
  rawBing: RawBingRow[] = [],
  rawGa4: RawGA4Row[] = [],
  options?: Partial<MetricsNormalizerConfig>
): MetricsSummary {
  const agent = new MetricsNormalizerAgent(options);
  return agent.run(rawGsc, rawBing, rawGa4);
}
