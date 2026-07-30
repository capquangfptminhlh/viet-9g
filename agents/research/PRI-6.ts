/**
 * PRI-6: Priority Scoring Engine
 * Master Spec v3.2 - Section 5.4 (Keyword & Topic Prioritization Algorithm)
 */

export type PriorityTier = 'P0' | 'P1' | 'P2' | 'P3';

export interface PriorityFactorWeights {
  searchVolumeWeight: number;        // Mức độ phổ biến tìm kiếm (default 0.25)
  businessValueWeight: number;       // Giá trị chuyển đổi thương mại (default 0.30)
  competitionWeight: number;          // Độ dễ SEO (100 - difficulty) (default 0.15)
  topicalAuthorityGapWeight: number; // Mức độ thiếu hụt trong Topical Map (default 0.15)
  cannibalizationBonusWeight: number;// Bonus cho CREATE an toàn hoặc UPDATE tối ưu (default 0.15)
}

export interface KeywordPriorityInput {
  id: string;
  keyword: string;
  searchVolume: number;             // Lượt tìm kiếm / tháng
  difficulty: number;               // KD: 0 - 100
  businessValue: number;            // Score 1 - 5 (5: Đăng ký gói cước trực tiếp, 1: Thông tin chung)
  topicalRelevance?: number;        // 0.0 - 1.0
  coverageGapScore?: number;        // 0.0 - 1.0 (1.0 = chưa có bài nào phủ chủ đề này)
  cannibalizationRisk?: number;     // 0.0 - 1.0 (0.0 = không trùng lặp, 1.0 = rất trùng)
  actionType?: 'CREATE' | 'UPDATE' | 'MERGE' | 'IGNORE';
  estimatedCpcUsd?: number;
}

export interface PriorityScoreBreakdown {
  volumeScore: number;              // 0 - 100
  businessScore: number;            // 0 - 100
  competitionScore: number;         // 0 - 100
  topicalGapScore: number;          // 0 - 100
  cannibalizationModifier: number;  // 0 - 100
}

export interface PriorityScoreResult {
  id: string;
  keyword: string;
  priorityScore: number;            // 0 - 100
  priorityTier: PriorityTier;
  breakdown: PriorityScoreBreakdown;
  recommendedAction: string;
  rank: number;
}

export interface PriorityScorerOptions {
  weights?: Partial<PriorityFactorWeights>;
  maxVolumeBaseline?: number;       // Baseline search volume for 100 score normalization (default 10,000)
}

export class PriorityScorer {
  private weights: PriorityFactorWeights;
  private maxVolumeBaseline: number;

  constructor(options: PriorityScorerOptions = {}) {
    const defaultWeights: PriorityFactorWeights = {
      searchVolumeWeight: 0.25,
      businessValueWeight: 0.30,
      competitionWeight: 0.15,
      topicalAuthorityGapWeight: 0.15,
      cannibalizationBonusWeight: 0.15,
    };

    this.weights = { ...defaultWeights, ...options.weights };
    this.maxVolumeBaseline = options.maxVolumeBaseline ?? 10000;
  }

  /**
   * Calculates priority score for a single keyword candidate
   */
  public calculateScore(input: KeywordPriorityInput): PriorityScoreResult {
    // 1. Search Volume Score (logarithmic scaling to avoid extreme outlier skewing)
    const normalizedVol = Math.max(1, input.searchVolume);
    const logVol = Math.log10(normalizedVol);
    const maxLogVol = Math.log10(Math.max(100, this.maxVolumeBaseline));
    const volumeScore = Math.min(100, Math.max(0, (logVol / maxLogVol) * 100));

    // 2. Business Value Score (1-5 scaled to 0-100)
    const clampedBizVal = Math.min(5, Math.max(1, input.businessValue));
    const businessScore = ((clampedBizVal - 1) / 4) * 100;

    // 3. Competition Score (Inverse of difficulty: lower KD = higher score)
    const clampedKD = Math.min(100, Math.max(0, input.difficulty));
    const competitionScore = 100 - clampedKD;

    // 4. Topical Gap Score (0.0 - 1.0 scaled to 0-100)
    const gap = input.coverageGapScore ?? 0.8;
    const topicalGapScore = Math.min(100, Math.max(0, gap * 100));

    // 5. Cannibalization Modifier (0 - 100)
    let cannibalizationModifier = 100 - (input.cannibalizationRisk ?? 0) * 100;
    if (input.actionType === 'UPDATE' || input.actionType === 'MERGE') {
      // Quick wins: updating or merging existing pages gets high ROI booster (+20 pts)
      cannibalizationModifier = Math.min(100, cannibalizationModifier + 20);
    } else if (input.actionType === 'IGNORE') {
      cannibalizationModifier = 0;
    }

    // Weighted Priority Score Calculation
    const totalScore =
      volumeScore * this.weights.searchVolumeWeight +
      businessScore * this.weights.businessValueWeight +
      competitionScore * this.weights.competitionWeight +
      topicalGapScore * this.weights.topicalAuthorityGapWeight +
      cannibalizationModifier * this.weights.cannibalizationBonusWeight;

    const priorityScore = parseFloat(totalScore.toFixed(2));
    const priorityTier = this.determineTier(priorityScore);
    const recommendedAction = this.getRecommendedAction(priorityTier, input.actionType);

    return {
      id: input.id,
      keyword: input.keyword,
      priorityScore,
      priorityTier,
      breakdown: {
        volumeScore: parseFloat(volumeScore.toFixed(2)),
        businessScore: parseFloat(businessScore.toFixed(2)),
        competitionScore: parseFloat(competitionScore.toFixed(2)),
        topicalGapScore: parseFloat(topicalGapScore.toFixed(2)),
        cannibalizationModifier: parseFloat(cannibalizationModifier.toFixed(2)),
      },
      recommendedAction,
      rank: 0,
    };
  }

  /**
   * Ranks an array of keyword candidates in descending order of priority score
   */
  public rankKeywords(inputs: KeywordPriorityInput[]): PriorityScoreResult[] {
    const results = inputs.map((item) => this.calculateScore(item));

    // Sort descending by priority score
    results.sort((a, b) => b.priorityScore - a.priorityScore);

    // Assign rank
    return results.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  private determineTier(score: number): PriorityTier {
    if (score >= 80) return 'P0'; // Critical / Immediate Quick-Win
    if (score >= 65) return 'P1'; // High Priority
    if (score >= 45) return 'P2'; // Medium Priority
    return 'P3';                  // Low Priority / Backlog
  }

  private getRecommendedAction(tier: PriorityTier, actionType?: string): string {
    const prefix = actionType ? `[${actionType}] ` : '';
    switch (tier) {
      case 'P0':
        return `${prefix}Ưu tiên hàng đầu. Đưa ngay vào Sprint sản xuất nội dung tiếp theo.`;
      case 'P1':
        return `${prefix}Ưu tiên cao. Lên kế hoạch sản xuất trong tuần.`;
      case 'P2':
        return `${prefix}Ưu tiên trung bình. Xử lý sau khi hoàn thành các mục P0/P1.`;
      case 'P3':
        return `${prefix}Ưu tiên thấp. Lưu trữ trong Backlog nghiên cứu.`;
    }
  }
}

export function rankKeywordsPriority(
  inputs: KeywordPriorityInput[],
  options?: PriorityScorerOptions
): PriorityScoreResult[] {
  const scorer = new PriorityScorer(options);
  return scorer.rankKeywords(inputs);
}
