/**
 * GAP-4: Gap Analyzer Agent
 * Master Spec v3.2 - Section 7 & Section 9
 * 
 * Analyzes topical gaps, competitor keyword gaps, first-party demand gaps,
 * and fact freshness content gaps against site content inventory.
 */

export type GapType =
  | 'topical_gap'
  | 'competitor_gap'
  | 'first_party_gap'
  | 'content_freshness_gap'
  | 'format_gap';

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

export type RecommendedAction = 'CREATE_NEW' | 'UPDATE' | 'EXPAND' | 'MERGE';

export interface TopicalNode {
  topicId: string;
  keyword: string;
  category?: string;
  covered: boolean;
  existingUrl?: string;
  parentTopic?: string;
  subtopics?: string[];
}

export interface ContentInventoryItem {
  id: string;
  url: string;
  title: string;
  primaryKeyword: string;
  coveredKeywords?: string[];
  lastUpdated?: string;
}

export interface CompetitorKeywordData {
  keyword: string;
  competitorDomain: string;
  estimatedVolume?: number;
  category?: string;
}

export interface FirstPartyDemandData {
  query: string;
  impressions?: number;
  searchCount?: number;
  matchedUrl?: string;
  hasResults?: boolean;
}

export interface FactFreshnessData {
  factId: string;
  entity: string;
  claim: string;
  expiresAt?: string;
  affectedUrls?: string[];
}

export interface GapEvidence {
  topicalNodeId?: string;
  competitorDomain?: string;
  gscQuery?: string;
  factIds?: string[];
  matchedUrl?: string;
}

export interface GapReportItem {
  gapId: string;
  gapType: GapType;
  topicOrKeyword: string;
  normalizedKeyword: string;
  category?: string;
  priority: GapPriority;
  businessValueScore: number; // 0-1 scale
  recommendedAction: RecommendedAction;
  reasonCodes: string[];
  evidence: GapEvidence;
  createdAt: string;
}

export interface GapAnalyzerOptions {
  minDemandImpressions?: number;
  freshnessThresholdDays?: number;
}

export interface GapAnalyzerSummary {
  totalGapsFound: number;
  coverageRatio: number; // 0-1 percentage of covered topics
  byGapType: Record<GapType, number>;
  byPriority: Record<GapPriority, number>;
}

export interface GapAnalysisResult {
  gaps: GapReportItem[];
  summary: GapAnalyzerSummary;
}

export interface GapAnalyzerInputs {
  topicalNodes?: TopicalNode[];
  contentInventory?: ContentInventoryItem[];
  competitorKeywords?: CompetitorKeywordData[];
  firstPartyDemand?: FirstPartyDemandData[];
  facts?: FactFreshnessData[];
  options?: GapAnalyzerOptions;
}

export class GapAnalyzer {
  private minDemandImpressions: number;
  private freshnessThresholdDays: number;

  constructor(options: GapAnalyzerOptions = {}) {
    this.minDemandImpressions = options.minDemandImpressions ?? 30;
    this.freshnessThresholdDays = options.freshnessThresholdDays ?? 7;
  }

  /**
   * Main entry point to perform complete gap analysis across all input channels.
   */
  public analyze(inputs: GapAnalyzerInputs): GapAnalysisResult {
    const inventory = inputs.contentInventory ?? [];
    const gapsMap = new Map<string, GapReportItem>();

    // 1. Analyze Topical Map Gaps
    if (inputs.topicalNodes && inputs.topicalNodes.length > 0) {
      const topicalGaps = this.analyzeTopicalMap(inputs.topicalNodes, inventory);
      this.mergeGaps(gapsMap, topicalGaps);
    }

    // 2. Analyze Competitor Gaps
    if (inputs.competitorKeywords && inputs.competitorKeywords.length > 0) {
      const competitorGaps = this.analyzeCompetitorGaps(inputs.competitorKeywords, inventory);
      this.mergeGaps(gapsMap, competitorGaps);
    }

    // 3. Analyze First-Party Demand Gaps (GSC / Internal Search)
    if (inputs.firstPartyDemand && inputs.firstPartyDemand.length > 0) {
      const demandGaps = this.analyzeFirstPartyGaps(inputs.firstPartyDemand, inventory);
      this.mergeGaps(gapsMap, demandGaps);
    }

    // 4. Analyze Content Freshness Gaps (Expiring Facts)
    if (inputs.facts && inputs.facts.length > 0) {
      const freshnessGaps = this.analyzeFactFreshnessGaps(inputs.facts);
      this.mergeGaps(gapsMap, freshnessGaps);
    }

    const gaps = Array.from(gapsMap.values());
    const summary = this.buildSummary(inputs.topicalNodes ?? [], gaps);

    return {
      gaps,
      summary,
    };
  }

  /**
   * Analyzes uncovered topical nodes and missing sub-branches in the topical map.
   */
  public analyzeTopicalMap(
    nodes: TopicalNode[],
    inventory: ContentInventoryItem[]
  ): GapReportItem[] {
    const gaps: GapReportItem[] = [];

    for (const node of nodes) {
      const norm = this.normalizeKeyword(node.keyword);
      const isCoveredInInventory = this.isKeywordCovered(norm, inventory);

      if (!node.covered && !isCoveredInInventory) {
        const reasonCodes: string[] = ['UNCOVERED_TOPICAL_NODE'];
        let priority: GapPriority = 'medium';
        let businessValueScore = 0.65;

        if (node.parentTopic) {
          reasonCodes.push('TOPICAL_SUBBRANCH_MISSING');
          priority = 'high';
          businessValueScore += 0.1;
        }

        if (node.subtopics && node.subtopics.length > 0) {
          reasonCodes.push('PARENT_TOPIC_MISSING_HUB');
          priority = 'high';
          businessValueScore += 0.15;
        }

        gaps.push({
          gapId: this.generateGapId('topical', norm),
          gapType: 'topical_gap',
          topicOrKeyword: node.keyword,
          normalizedKeyword: norm,
          category: node.category,
          priority,
          businessValueScore: Math.min(1.0, businessValueScore),
          recommendedAction: 'CREATE_NEW',
          reasonCodes,
          evidence: {
            topicalNodeId: node.topicId,
          },
          createdAt: new Date().toISOString(),
        });
      }
    }

    return gaps;
  }

  /**
   * Analyzes keywords targeted by competitors that are missing from domain inventory.
   */
  public analyzeCompetitorGaps(
    competitorKws: CompetitorKeywordData[],
    inventory: ContentInventoryItem[]
  ): GapReportItem[] {
    const gaps: GapReportItem[] = [];

    for (const item of competitorKws) {
      const norm = this.normalizeKeyword(item.keyword);
      const isCovered = this.isKeywordCovered(norm, inventory);

      if (!isCovered) {
        const vol = item.estimatedVolume ?? 0;
        let priority: GapPriority = 'medium';
        let businessValueScore = 0.6;

        if (vol >= 1000) {
          priority = 'high';
          businessValueScore = 0.85;
        } else if (vol >= 500) {
          businessValueScore = 0.75;
        }

        gaps.push({
          gapId: this.generateGapId('competitor', norm),
          gapType: 'competitor_gap',
          topicOrKeyword: item.keyword,
          normalizedKeyword: norm,
          category: item.category,
          priority,
          businessValueScore: Math.min(1.0, businessValueScore),
          recommendedAction: 'CREATE_NEW',
          reasonCodes: ['COMPETITOR_KEYWORD_UNCOVERED'],
          evidence: {
            competitorDomain: item.competitorDomain,
          },
          createdAt: new Date().toISOString(),
        });
      }
    }

    return gaps;
  }

  /**
   * Analyzes first-party search demand (GSC/Internal Search) that lacks strong landing page coverage.
   */
  public analyzeFirstPartyGaps(
    demandList: FirstPartyDemandData[],
    inventory: ContentInventoryItem[]
  ): GapReportItem[] {
    const gaps: GapReportItem[] = [];

    for (const item of demandList) {
      const norm = this.normalizeKeyword(item.query);
      const imp = item.impressions ?? item.searchCount ?? 0;

      if (imp < this.minDemandImpressions) continue;

      const matchedInInventory = inventory.find(
        (inv) =>
          inv.url === item.matchedUrl ||
          this.normalizeKeyword(inv.primaryKeyword) === norm ||
          (inv.coveredKeywords && inv.coveredKeywords.map(this.normalizeKeyword).includes(norm))
      );

      if (!matchedInInventory || item.hasResults === false) {
        let priority: GapPriority = 'high';
        let action: RecommendedAction = 'CREATE_NEW';
        const reasonCodes: string[] = ['INTERNAL_DEMAND_UNANSWERED'];

        if (item.hasResults === false) {
          priority = 'critical';
          reasonCodes.push('ZERO_SEARCH_RESULTS');
        }

        gaps.push({
          gapId: this.generateGapId('first_party', norm),
          gapType: 'first_party_gap',
          topicOrKeyword: item.query,
          normalizedKeyword: norm,
          priority,
          businessValueScore: priority === 'critical' ? 0.95 : 0.8,
          recommendedAction: action,
          reasonCodes,
          evidence: {
            gscQuery: item.query,
            matchedUrl: item.matchedUrl,
          },
          createdAt: new Date().toISOString(),
        });
      } else {
        // Matched but query is high demand -> EXPAND existing page coverage
        gaps.push({
          gapId: this.generateGapId('first_party_expand', norm),
          gapType: 'first_party_gap',
          topicOrKeyword: item.query,
          normalizedKeyword: norm,
          priority: 'medium',
          businessValueScore: 0.7,
          recommendedAction: 'EXPAND',
          reasonCodes: ['HIGH_DEMAND_WEAK_COVERAGE'],
          evidence: {
            gscQuery: item.query,
            matchedUrl: matchedInInventory.url,
          },
          createdAt: new Date().toISOString(),
        });
      }
    }

    return gaps;
  }

  /**
   * Analyzes fact freshness gaps where expired/expiring facts require content updates.
   */
  public analyzeFactFreshnessGaps(facts: FactFreshnessData[]): GapReportItem[] {
    const gaps: GapReportItem[] = [];
    const now = Date.now();
    const thresholdMs = this.freshnessThresholdDays * 24 * 60 * 60 * 1000;

    for (const fact of facts) {
      if (!fact.expiresAt) continue;

      const expiresTime = new Date(fact.expiresAt).getTime();
      const isExpired = expiresTime < now;
      const isExpiringSoon = expiresTime - now <= thresholdMs;

      if (isExpired || isExpiringSoon) {
        const norm = this.normalizeKeyword(fact.entity);
        const priority: GapPriority = isExpired ? 'critical' : 'high';
        const action: RecommendedAction = 'UPDATE';

        gaps.push({
          gapId: this.generateGapId('freshness', `${fact.factId}_${norm}`),
          gapType: 'content_freshness_gap',
          topicOrKeyword: `${fact.entity}: ${fact.claim}`,
          normalizedKeyword: norm,
          priority,
          businessValueScore: isExpired ? 0.9 : 0.75,
          recommendedAction: action,
          reasonCodes: [isExpired ? 'EXPIRED_FACT_CONTENT_GAP' : 'EXPIRING_SOON_FACT_CONTENT_GAP'],
          evidence: {
            factIds: [fact.factId],
            matchedUrl: fact.affectedUrls && fact.affectedUrls.length > 0 ? fact.affectedUrls[0] : undefined,
          },
          createdAt: new Date().toISOString(),
        });
      }
    }

    return gaps;
  }

  private isKeywordCovered(normalizedKw: string, inventory: ContentInventoryItem[]): boolean {
    return inventory.some((inv) => {
      const primaryNorm = this.normalizeKeyword(inv.primaryKeyword);
      if (primaryNorm === normalizedKw) return true;
      if (inv.coveredKeywords) {
        return inv.coveredKeywords.some((ckw) => this.normalizeKeyword(ckw) === normalizedKw);
      }
      return false;
    });
  }

  private mergeGaps(targetMap: Map<string, GapReportItem>, incoming: GapReportItem[]): void {
    for (const gap of incoming) {
      const existing = targetMap.get(gap.gapId);
      if (!existing) {
        targetMap.set(gap.gapId, gap);
      } else {
        existing.reasonCodes = Array.from(new Set([...existing.reasonCodes, ...gap.reasonCodes]));
        existing.businessValueScore = Math.max(existing.businessValueScore, gap.businessValueScore);
        if (this.priorityWeight(gap.priority) > this.priorityWeight(existing.priority)) {
          existing.priority = gap.priority;
        }
      }
    }
  }

  private priorityWeight(p: GapPriority): number {
    switch (p) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  }

  private normalizeKeyword(kw: string): string {
    return kw
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  private generateGapId(prefix: string, normKw: string): string {
    let hash = 0;
    for (let i = 0; i < normKw.length; i++) {
      const char = normKw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(36);
    const slug = normKw.replace(/[^a-z0-9]+/g, '-').slice(0, 20);
    return `gap_${prefix}_${slug}_${positiveHash}`;
  }

  private buildSummary(topicalNodes: TopicalNode[], gaps: GapReportItem[]): GapAnalyzerSummary {
    const totalNodes = topicalNodes.length;
    const coveredNodes = topicalNodes.filter((n) => n.covered).length;
    const coverageRatio = totalNodes > 0 ? parseFloat((coveredNodes / totalNodes).toFixed(4)) : 1.0;

    const byGapType: Record<GapType, number> = {
      topical_gap: 0,
      competitor_gap: 0,
      first_party_gap: 0,
      content_freshness_gap: 0,
      format_gap: 0,
    };

    const byPriority: Record<GapPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const gap of gaps) {
      byGapType[gap.gapType] = (byGapType[gap.gapType] || 0) + 1;
      byPriority[gap.priority] = (byPriority[gap.priority] || 0) + 1;
    }

    return {
      totalGapsFound: gaps.length,
      coverageRatio,
      byGapType,
      byPriority,
    };
  }
}

export function runGapAnalysis(
  inputs: GapAnalyzerInputs,
  options?: GapAnalyzerOptions
): GapAnalysisResult {
  const analyzer = new GapAnalyzer(options);
  return analyzer.analyze(inputs);
}

export function analyzeTopicalGaps(
  inputs: GapAnalyzerInputs,
  options?: GapAnalyzerOptions
): GapAnalysisResult {
  return runGapAnalysis(inputs, options);
}
