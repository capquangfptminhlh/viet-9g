/**
 * KW-2: Keyword Discovery Agent
 * Master Spec v3.2 - Section 7 & Section 9.1
 * 
 * Generates keyword candidates from internal data, GSC queries,
 * topical gaps, freshness events, site search, and CRM support logs.
 */

export type CandidateSource =
  | 'gsc'
  | 'internal_data'
  | 'topical_gap'
  | 'freshness_event'
  | 'site_search'
  | 'crm_support';

export interface KeywordMetrics {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  position?: number;
  growthRate?: number;
  decayRate?: number;
  searchVolume?: number;
}

export interface CandidateEvidence {
  factIds?: string[];
  sourceUrls?: string[];
  internalDocIds?: string[];
  gscQuery?: string;
  matchedPageUrl?: string;
}

export interface KeywordCandidate {
  candidateId: string; // cand_<hash_or_slug>
  keyword: string;
  normalizedKeyword: string;
  candidateSource: CandidateSource;
  metrics: KeywordMetrics;
  evidence: CandidateEvidence;
  reasonCodes: string[];
  createdAt: string;
  businessValueScore: number; // 0-1 estimated business value
  evidenceAvailabilityScore: number; // 0-1 ground truth evidence score
}

export interface GscQueryPerformance {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  previousImpressions?: number;
  previousClicks?: number;
  pageUrl?: string;
}

export interface InternalFactData {
  factId: string;
  entity: string;
  claim: string;
  effectiveAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  relatedKeywords?: string[];
}

export interface ProductServiceOffer {
  id: string;
  name: string;
  targetKeywords: string[];
  category?: string;
  isActive: boolean;
}

export interface TopicalNode {
  topicId: string;
  keyword: string;
  covered: boolean;
  existingUrl?: string;
  parentTopic?: string;
}

export interface InternalSearchQuery {
  query: string;
  searchCount: number;
  hasResults: boolean;
}

export interface CrmSupportTicketData {
  topic: string;
  frequency: number;
  suggestedKeywords: string[];
}

export interface DiscoveryInputs {
  gscPerformance?: GscQueryPerformance[];
  facts?: InternalFactData[];
  offers?: ProductServiceOffer[];
  inventoryUrls?: string[];
  topicalNodes?: TopicalNode[];
  siteSearches?: InternalSearchQuery[];
  crmTickets?: CrmSupportTicketData[];
  minGscImpressions?: number;
}

export class KW2KeywordDiscovery {
  private minGscImpressions: number;

  constructor(options: { minGscImpressions?: number } = {}) {
    this.minGscImpressions = options.minGscImpressions ?? 50;
  }

  /**
   * Main entry point to run keyword discovery across all sources.
   */
  public generateCandidates(inputs: DiscoveryInputs): KeywordCandidate[] {
    const candidateMap = new Map<string, KeywordCandidate>();

    // 1. Discover from GSC Performance Data
    if (inputs.gscPerformance && inputs.gscPerformance.length > 0) {
      const gscCandidates = this.discoverFromGSC(inputs.gscPerformance);
      this.mergeCandidates(candidateMap, gscCandidates);
    }

    // 2. Discover from Internal Facts and Product/Service Offers
    if (inputs.facts || inputs.offers) {
      const internalCandidates = this.discoverFromInternalData(
        inputs.facts ?? [],
        inputs.offers ?? [],
        inputs.inventoryUrls ?? []
      );
      this.mergeCandidates(candidateMap, internalCandidates);
    }

    // 3. Discover from Topical Map Gaps
    if (inputs.topicalNodes && inputs.topicalNodes.length > 0) {
      const gapCandidates = this.discoverFromTopicalGap(inputs.topicalNodes);
      this.mergeCandidates(candidateMap, gapCandidates);
    }

    // 4. Discover from Site Search & CRM Support Tickets
    if (inputs.siteSearches || inputs.crmTickets) {
      const userDemandCandidates = this.discoverFromSiteSearchAndCRM(
        inputs.siteSearches ?? [],
        inputs.crmTickets ?? []
      );
      this.mergeCandidates(candidateMap, userDemandCandidates);
    }

    return Array.from(candidateMap.values());
  }

  /**
   * Discovers keyword candidates from Google Search Console dataset.
   */
  public discoverFromGSC(gscData: GscQueryPerformance[]): KeywordCandidate[] {
    const candidates: KeywordCandidate[] = [];

    for (const item of gscData) {
      if (item.impressions < this.minGscImpressions) continue;

      const norm = this.normalizeKeyword(item.query);
      const reasonCodes: string[] = [];
      let businessValue = 0.5;

      // High Impressions but Low CTR (Opportunity for title/meta optimization or content rewrite)
      const expectedCtr = item.position <= 3 ? 0.15 : item.position <= 10 ? 0.03 : 0.01;
      if (item.ctr < expectedCtr && item.impressions > 100) {
        reasonCodes.push('GSC_HIGH_IMPRESSIONS_LOW_CTR');
        businessValue += 0.2;
      }

      // Striking distance position (Positions 4 to 20)
      if (item.position >= 4 && item.position <= 20) {
        reasonCodes.push('GSC_STRIKING_DISTANCE');
        businessValue += 0.15;
      }

      // Traffic Decay Detection
      if (item.previousImpressions && item.previousImpressions > 0) {
        const decayRate = (item.previousImpressions - item.impressions) / item.previousImpressions;
        if (decayRate >= 0.25) {
          reasonCodes.push('GSC_DECAYING_TRAFFIC');
          businessValue += 0.1;
        }
      }

      if (reasonCodes.length > 0) {
        candidates.push({
          candidateId: this.generateCandidateId(norm),
          keyword: item.query,
          normalizedKeyword: norm,
          candidateSource: 'gsc',
          metrics: {
            impressions: item.impressions,
            clicks: item.clicks,
            ctr: item.ctr,
            position: item.position,
            growthRate: item.previousImpressions
              ? (item.impressions - item.previousImpressions) / item.previousImpressions
              : 0,
          },
          evidence: {
            gscQuery: item.query,
            matchedPageUrl: item.pageUrl,
          },
          reasonCodes,
          createdAt: new Date().toISOString(),
          businessValueScore: Math.min(1.0, businessValue),
          evidenceAvailabilityScore: 0.9,
        });
      }
    }

    return candidates;
  }

  /**
   * Discovers candidates from internal product/service offers and expiring/expired facts.
   */
  public discoverFromInternalData(
    facts: InternalFactData[],
    offers: ProductServiceOffer[],
    inventoryUrls: string[]
  ): KeywordCandidate[] {
    const candidates: KeywordCandidate[] = [];
    const now = Date.now();

    // Fact Freshness Events (Expired or soon-to-expire facts)
    for (const fact of facts) {
      if (!fact.expiresAt) continue;

      const expiresTime = new Date(fact.expiresAt).getTime();
      const isExpired = expiresTime < now;
      const isExpiringSoon = expiresTime - now < 7 * 24 * 60 * 60 * 1000; // within 7 days

      if (isExpired || isExpiringSoon) {
        const keywords = fact.relatedKeywords && fact.relatedKeywords.length > 0
          ? fact.relatedKeywords
          : [fact.entity];

        for (const kw of keywords) {
          const norm = this.normalizeKeyword(kw);
          candidates.push({
            candidateId: this.generateCandidateId(norm),
            keyword: kw,
            normalizedKeyword: norm,
            candidateSource: 'freshness_event',
            metrics: {},
            evidence: {
              factIds: [fact.factId],
            },
            reasonCodes: [isExpired ? 'EXPIRED_FACT_REFRESH' : 'EXPIRING_SOON_FACT'],
            createdAt: new Date().toISOString(),
            businessValueScore: 0.7,
            evidenceAvailabilityScore: 1.0,
          });
        }
      }
    }

    // Active Product/Service Offers not yet present in content inventory
    for (const offer of offers) {
      if (!offer.isActive) continue;

      for (const kw of offer.targetKeywords) {
        const norm = this.normalizeKeyword(kw);
        // Basic check if offer target keyword has coverage
        const isCovered = inventoryUrls.some((url) =>
          url.toLowerCase().includes(norm.replace(/\s+/g, '-'))
        );

        if (!isCovered) {
          candidates.push({
            candidateId: this.generateCandidateId(norm),
            keyword: kw,
            normalizedKeyword: norm,
            candidateSource: 'internal_data',
            metrics: {},
            evidence: {
              internalDocIds: [offer.id],
            },
            reasonCodes: ['INTERNAL_OFFER_UNCOVERED'],
            createdAt: new Date().toISOString(),
            businessValueScore: 0.85,
            evidenceAvailabilityScore: 0.95,
          });
        }
      }
    }

    return candidates;
  }

  /**
   * Discovers candidates from topical map gaps.
   */
  public discoverFromTopicalGap(nodes: TopicalNode[]): KeywordCandidate[] {
    const candidates: KeywordCandidate[] = [];

    for (const node of nodes) {
      if (!node.covered) {
        const norm = this.normalizeKeyword(node.keyword);
        candidates.push({
          candidateId: this.generateCandidateId(norm),
          keyword: node.keyword,
          normalizedKeyword: norm,
          candidateSource: 'topical_gap',
          metrics: {},
          evidence: {
            internalDocIds: [node.topicId],
          },
          reasonCodes: ['TOPICAL_MAP_GAP'],
          createdAt: new Date().toISOString(),
          businessValueScore: 0.65,
          evidenceAvailabilityScore: 0.8,
        });
      }
    }

    return candidates;
  }

  /**
   * Discovers candidates from internal site searches and CRM support logs.
   */
  public discoverFromSiteSearchAndCRM(
    siteSearches: InternalSearchQuery[],
    crmTickets: CrmSupportTicketData[]
  ): KeywordCandidate[] {
    const candidates: KeywordCandidate[] = [];

    for (const search of siteSearches) {
      if (!search.hasResults || search.searchCount > 10) {
        const norm = this.normalizeKeyword(search.query);
        candidates.push({
          candidateId: this.generateCandidateId(norm),
          keyword: search.query,
          normalizedKeyword: norm,
          candidateSource: 'site_search',
          metrics: {
            searchVolume: search.searchCount,
          },
          evidence: {},
          reasonCodes: [search.hasResults ? 'SITE_SEARCH_HIGH_DEMAND' : 'SITE_SEARCH_UNANSWERED'],
          createdAt: new Date().toISOString(),
          businessValueScore: 0.75,
          evidenceAvailabilityScore: 0.85,
        });
      }
    }

    for (const ticket of crmTickets) {
      if (ticket.frequency >= 5) {
        for (const kw of ticket.suggestedKeywords) {
          const norm = this.normalizeKeyword(kw);
          candidates.push({
            candidateId: this.generateCandidateId(norm),
            keyword: kw,
            normalizedKeyword: norm,
            candidateSource: 'crm_support',
            metrics: {
              searchVolume: ticket.frequency,
            },
            evidence: {},
            reasonCodes: ['CRM_FREQUENT_QUERY'],
            createdAt: new Date().toISOString(),
            businessValueScore: 0.8,
            evidenceAvailabilityScore: 0.9,
          });
        }
      }
    }

    return candidates;
  }

  private mergeCandidates(
    targetMap: Map<string, KeywordCandidate>,
    incoming: KeywordCandidate[]
  ): void {
    for (const cand of incoming) {
      const existing = targetMap.get(cand.normalizedKeyword);
      if (!existing) {
        targetMap.set(cand.normalizedKeyword, cand);
      } else {
        // Merge metrics and reason codes
        existing.reasonCodes = Array.from(
          new Set([...existing.reasonCodes, ...cand.reasonCodes])
        );
        existing.businessValueScore = Math.max(
          existing.businessValueScore,
          cand.businessValueScore
        );
        existing.evidenceAvailabilityScore = Math.max(
          existing.evidenceAvailabilityScore,
          cand.evidenceAvailabilityScore
        );

        if (cand.evidence.factIds) {
          existing.evidence.factIds = Array.from(
            new Set([...(existing.evidence.factIds || []), ...cand.evidence.factIds])
          );
        }
        if (cand.evidence.internalDocIds) {
          existing.evidence.internalDocIds = Array.from(
            new Set([...(existing.evidence.internalDocIds || []), ...cand.evidence.internalDocIds])
          );
        }
        if (cand.evidence.gscQuery) {
          existing.evidence.gscQuery = cand.evidence.gscQuery;
        }
        if (cand.evidence.matchedPageUrl) {
          existing.evidence.matchedPageUrl = cand.evidence.matchedPageUrl;
        }

        existing.metrics = {
          ...existing.metrics,
          ...cand.metrics,
        };
      }
    }
  }

  private normalizeKeyword(kw: string): string {
    return kw
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  private generateCandidateId(normalizedKw: string): string {
    let hash = 0;
    for (let i = 0; i < normalizedKw.length; i++) {
      const char = normalizedKw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(36);
    const slug = normalizedKw.replace(/[^a-z0-9]+/g, '-').slice(0, 20);
    return `cand_${slug}_${positiveHash}`;
  }
}
