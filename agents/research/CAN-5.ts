/**
 * CAN-5: Cannibalization Agent (CREATE / UPDATE / MERGE Decision Engine)
 * Master Spec v3.2 - Section 5.3 (Keyword & Intent Cannibalization Management)
 */

export type ContentAction = 'CREATE' | 'UPDATE' | 'MERGE' | 'IGNORE';

export interface ExistingPage {
  id: string;
  url: string;
  slug: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  intent: 'transactional' | 'informational' | 'commercial' | 'navigational' | string;
  entities?: string[];
  impressions?: number;
  clicks?: number;
  currentRank?: number;
  contentLength?: number;
}

export interface KeywordCandidate {
  id: string;
  keyword: string;
  intent: 'transactional' | 'informational' | 'commercial' | 'navigational' | string;
  searchVolume?: number;
  difficulty?: number;
  entities?: string[];
  targetSlug?: string;
}

export interface SimilarityScore {
  pageId: string;
  keywordOverlapScore: number;
  intentMatchScore: number;
  entityOverlapScore: number;
  compositeSimilarity: number;
}

export interface CannibalizationOptions {
  updateThreshold?: number; // threshold to trigger UPDATE (default 0.75)
  mergeThreshold?: number;  // threshold to trigger MERGE (default 0.85)
  createThreshold?: number; // similarity below this triggers CREATE (default 0.45)
  keywordWeight?: number;   // weight for keyword overlap (default 0.4)
  intentWeight?: number;    // weight for intent match (default 0.3)
  entityWeight?: number;    // weight for entity overlap (default 0.3)
}

export interface CannibalizationDecision {
  action: ContentAction;
  targetPageId?: string;
  targetPageUrl?: string;
  mergeSourcePageIds?: string[];
  cannibalizationRiskScore: number;
  reason: string;
  confidence: number;
  details: {
    highestSimilarity: number;
    matchedPageId?: string;
    matchedPageUrl?: string;
    allSimilarities: SimilarityScore[];
    recommendation: string;
  };
}

export class CannibalizationEngine {
  private updateThreshold: number;
  private mergeThreshold: number;
  private createThreshold: number;
  private keywordWeight: number;
  private intentWeight: number;
  private entityWeight: number;

  constructor(options: CannibalizationOptions = {}) {
    this.updateThreshold = options.updateThreshold ?? 0.75;
    this.mergeThreshold = options.mergeThreshold ?? 0.85;
    this.createThreshold = options.createThreshold ?? 0.45;
    this.keywordWeight = options.keywordWeight ?? 0.4;
    this.intentWeight = options.intentWeight ?? 0.3;
    this.entityWeight = options.entityWeight ?? 0.3;
  }

  /**
   * Evaluates a keyword candidate against existing site pages to decide CREATE/UPDATE/MERGE
   */
  public evaluateCandidate(
    candidate: KeywordCandidate,
    existingPages: ExistingPage[]
  ): CannibalizationDecision {
    if (!existingPages || existingPages.length === 0) {
      return {
        action: 'CREATE',
        cannibalizationRiskScore: 0.0,
        reason: 'NO_EXISTING_PAGES',
        confidence: 1.0,
        details: {
          highestSimilarity: 0.0,
          allSimilarities: [],
          recommendation: 'Tạo trang mới vì chưa có trang nào tồn tại trong hệ thống.',
        },
      };
    }

    const similarityScores: SimilarityScore[] = existingPages.map((page) =>
      this.calculateSimilarity(candidate, page)
    );

    // Sort by composite similarity descending
    similarityScores.sort((a, b) => b.compositeSimilarity - a.compositeSimilarity);

    const highest = similarityScores[0];
    const matchedPage = existingPages.find((p) => p.id === highest.pageId);

    // Identify all pages with high similarity (>= mergeThreshold) for potential MERGE
    const highOverlapPages = similarityScores.filter(
      (s) => s.compositeSimilarity >= this.mergeThreshold
    );

    // Decision Logic
    let action: ContentAction = 'CREATE';
    let targetPageId: string | undefined;
    let targetPageUrl: string | undefined;
    let mergeSourcePageIds: string[] | undefined;
    let reason = '';
    let recommendation = '';
    let confidence = 0.85;
    const cannibalizationRiskScore = highest.compositeSimilarity;

    if (highOverlapPages.length >= 2) {
      // Multiple existing pages compete for the exact same intent/keywords -> MERGE
      action = 'MERGE';
      // Pick the page with highest traffic/rank as target, merge others into it
      const candidatePages = existingPages.filter((p) =>
        highOverlapPages.some((h) => h.pageId === p.id)
      );
      candidatePages.sort(
        (a, b) => (b.clicks ?? 0) - (a.clicks ?? 0) || (b.impressions ?? 0) - (a.impressions ?? 0)
      );

      const target = candidatePages[0];
      targetPageId = target.id;
      targetPageUrl = target.url;
      mergeSourcePageIds = candidatePages.slice(1).map((p) => p.id);

      reason = 'HIGH_CANNIBALIZATION_MULTI_PAGE_OVERLAP';
      recommendation = `Gộp (${mergeSourcePageIds.length}) trang trùng lặp vào trang gốc ${target.url} để tối ưu topical authority.`;
      confidence = 0.92;
    } else if (highest.compositeSimilarity >= this.updateThreshold) {
      // Single page has very high overlap -> UPDATE existing page
      action = 'UPDATE';
      targetPageId = matchedPage?.id;
      targetPageUrl = matchedPage?.url;

      reason = 'INTENT_AND_KEYWORD_MATCH_EXISTING_PAGE';
      recommendation = `Cập nhật và tối ưu lại nội dung cho trang sẵn có ${matchedPage?.url} thay vì tạo mới để tránh tự cạnh tranh từ khóa.`;
      confidence = parseFloat(highest.compositeSimilarity.toFixed(2));
    } else if (highest.compositeSimilarity <= this.createThreshold) {
      // Very low overlap -> CREATE new page safely
      action = 'CREATE';
      reason = 'DISTINCT_SEARCH_INTENT';
      recommendation = `Ý định tìm kiếm mới hoàn toàn. Tạo bài viết mới để mở rộng Topical Footprint.`;
      confidence = parseFloat((1 - highest.compositeSimilarity).toFixed(2));
    } else {
      // Moderate overlap (between createThreshold and updateThreshold)
      if (highest.intentMatchScore >= 0.8) {
        action = 'UPDATE';
        targetPageId = matchedPage?.id;
        targetPageUrl = matchedPage?.url;
        reason = 'SAME_INTENT_MODERATE_KEYWORD_OVERLAP';
        recommendation = `Trùng khớp Intent với trang ${matchedPage?.url}. Khuyên dùng UPDATE để củng cố thứ hạng.`;
        confidence = 0.75;
      } else {
        action = 'CREATE';
        reason = 'DIFFERENT_INTENT_MODERATE_OVERLAP';
        recommendation = `Từ khóa có độ tương đồng từ ngữ nhưng khác Intent. Cho phép CREATE trang mới với positioning riêng biệt.`;
        confidence = 0.70;
      }
    }

    return {
      action,
      targetPageId,
      targetPageUrl,
      mergeSourcePageIds,
      cannibalizationRiskScore: parseFloat(cannibalizationRiskScore.toFixed(4)),
      reason,
      confidence,
      details: {
        highestSimilarity: parseFloat(highest.compositeSimilarity.toFixed(4)),
        matchedPageId: matchedPage?.id,
        matchedPageUrl: matchedPage?.url,
        allSimilarities: similarityScores,
        recommendation,
      },
    };
  }

  private calculateSimilarity(candidate: KeywordCandidate, page: ExistingPage): SimilarityScore {
    // 1. Keyword Overlap (Jaccard similarity between candidate keyword & page keywords)
    const candTokens = this.tokenize(candidate.keyword);
    const pageTokens = new Set([
      ...this.tokenize(page.primaryKeyword),
      ...(page.secondaryKeywords || []).flatMap((k) => this.tokenize(k)),
      ...this.tokenize(page.title),
    ]);

    const keywordOverlapScore = this.jaccardSimilarity(candTokens, Array.from(pageTokens));

    // 2. Intent Match Score
    const intentMatchScore = candidate.intent.toLowerCase() === page.intent.toLowerCase() ? 1.0 : 0.2;

    // 3. Entity Overlap Score
    const candEntities = candidate.entities || [];
    const pageEntities = page.entities || [];
    const entityOverlapScore =
      candEntities.length > 0 && pageEntities.length > 0
        ? this.jaccardSimilarity(candEntities, pageEntities)
        : keywordOverlapScore;

    // 4. Composite Similarity Score
    const compositeSimilarity =
      keywordOverlapScore * this.keywordWeight +
      intentMatchScore * this.intentWeight +
      entityOverlapScore * this.entityWeight;

    return {
      pageId: page.id,
      keywordOverlapScore: parseFloat(keywordOverlapScore.toFixed(4)),
      intentMatchScore: parseFloat(intentMatchScore.toFixed(4)),
      entityOverlapScore: parseFloat(entityOverlapScore.toFixed(4)),
      compositeSimilarity: parseFloat(compositeSimilarity.toFixed(4)),
    };
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 || tokensB.length === 0) return 0.0;
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    let intersection = 0;
    for (const token of setA) {
      if (setB.has(token)) {
        intersection++;
      }
    }

    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? intersection / union : 0.0;
  }
}

export function evaluateCannibalization(
  candidate: KeywordCandidate,
  existingPages: ExistingPage[],
  options?: CannibalizationOptions
): CannibalizationDecision {
  const engine = new CannibalizationEngine(options);
  return engine.evaluateCandidate(candidate, existingPages);
}
