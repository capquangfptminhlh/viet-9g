/**
 * CTR-25: Conversion Optimizer Agent
 * Master Spec v3.2 - Section 7 (Agent Matrix) & Section 8 (W5 Release / Weekly Monitor)
 * 
 * Formulates CTR & CVR optimization hypotheses while enforcing strict safety rules:
 * - NO uncontrolled automatic A/B testing without human review / policy approval.
 * - Experiments on High or Medium Risk URLs require explicit human approval.
 */

export type RiskTier = 'low' | 'medium' | 'high';
export type HypothesisTarget = 'CTR' | 'CVR' | 'BOTH';
export type HypothesisType = 
  | 'TITLE_OPTIMIZATION'
  | 'META_DESCRIPTION_OPTIMIZATION'
  | 'CTA_COPY_OPTIMIZATION'
  | 'ANSWER_SNIPPET_OPTIMIZATION'
  | 'OFFER_ALIGNMENT';

export type HypothesisStatus = 
  | 'PROPOSED'
  | 'REQUIRES_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE_EXPERIMENT'
  | 'COMPLETED';

export interface PerformanceMetrics {
  url: string;
  query: string;
  impressions: number;
  clicks: number;
  ctr: number; // e.g. 0.035 for 3.5%
  position: number; // average position (1-indexed)
  conversions: number;
  cvr: number; // e.g. 0.012 for 1.2%
  periodDays: number;
}

export interface ProposedChange {
  field: 'title' | 'metaDescription' | 'ctaCopy' | 'answerSnippet';
  currentValue: string;
  proposedValue: string;
}

export interface CTRHypothesis {
  id: string;
  url: string;
  query: string;
  targetMetric: HypothesisTarget;
  hypothesisType: HypothesisType;
  rationale: string;
  baselineMetrics: {
    ctr: number;
    cvr: number;
    impressions: number;
    clicks: number;
    conversions: number;
    position: number;
  };
  expectedCtrLiftPct?: number;
  expectedCvrLiftPct?: number;
  proposedChanges: ProposedChange[];
  riskTier: RiskTier;
  requiresHumanApproval: boolean;
  status: HypothesisStatus;
  createdAt: string;
}

export interface CTROptimizerOptions {
  minImpressionsThreshold?: number;
  minClicksThreshold?: number;
  targetCvrThreshold?: number;
  allowAutoExperiments?: boolean; // Default false as per MASTER_SPEC
}

export interface CTRAnalysisResult {
  totalAnalyzed: number;
  lowCtrCount: number;
  lowCvrCount: number;
  hypotheses: CTRHypothesis[];
  requiresApprovalCount: number;
  summary: string;
}

export interface ExperimentEvaluationResult {
  hypothesisId: string;
  baselineCtr: number;
  postCtr: number;
  ctrDeltaPct: number;
  baselineCvr: number;
  postCvr: number;
  cvrDeltaPct: number;
  winner: 'variant' | 'baseline' | 'inconclusive';
  recommendation: 'ADOPT' | 'REVERT' | 'CONTINUE_DATA_COLLECTION';
}

export class ConversionOptimizer {
  private minImpressions: number;
  private minClicks: number;
  private targetCvr: number;
  private allowAutoExperiments: boolean;

  constructor(options: CTROptimizerOptions = {}) {
    this.minImpressions = options.minImpressionsThreshold ?? 100;
    this.minClicks = options.minClicksThreshold ?? 50;
    this.targetCvr = options.targetCvrThreshold ?? 0.015; // 1.5%
    this.allowAutoExperiments = options.allowAutoExperiments ?? false;
  }

  /**
   * Expected baseline CTR curve by average Search Console position
   */
  public getExpectedCtrForPosition(position: number): number {
    if (position <= 1.5) return 0.25;
    if (position <= 2.5) return 0.15;
    if (position <= 3.5) return 0.10;
    if (position <= 5.0) return 0.06;
    if (position <= 10.0) return 0.025;
    return 0.01;
  }

  /**
   * Analyzes performance metrics to generate hypotheses for underperforming URLs
   */
  public analyzePerformance(
    metricsList: PerformanceMetrics[],
    riskTierMap: Record<string, RiskTier> = {}
  ): CTRAnalysisResult {
    const hypotheses: CTRHypothesis[] = [];
    let lowCtrCount = 0;
    let lowCvrCount = 0;
    let requiresApprovalCount = 0;

    metricsList.forEach((metric, index) => {
      const riskTier = riskTierMap[metric.url] ?? 'medium';
      const expectedCtr = this.getExpectedCtrForPosition(metric.position);

      // Check CTR underperformance: Impressions high enough, CTR below 70% of expected benchmark
      const isLowCtr = metric.impressions >= this.minImpressions && metric.ctr < expectedCtr * 0.70;

      // Check CVR underperformance: Clicks high enough, CVR below target CVR threshold
      const isLowCvr = metric.clicks >= this.minClicks && metric.cvr < this.targetCvr;

      if (isLowCtr) {
        lowCtrCount++;
        const hypId = `hyp_ctr_${Date.now().toString(36)}_${index + 1}`;
        const requiresApproval = riskTier !== 'low' || !this.allowAutoExperiments;

        const hypothesis: CTRHypothesis = {
          id: hypId,
          url: metric.url,
          query: metric.query,
          targetMetric: 'CTR',
          hypothesisType: metric.position <= 3 ? 'ANSWER_SNIPPET_OPTIMIZATION' : 'TITLE_OPTIMIZATION',
          rationale: `CTR thực tế (${(metric.ctr * 100).toFixed(2)}%) thấp hơn kỳ vọng vị trí ${metric.position.toFixed(1)} (${(expectedCtr * 100).toFixed(2)}%) cho từ khóa "${metric.query}".`,
          baselineMetrics: {
            ctr: metric.ctr,
            cvr: metric.cvr,
            impressions: metric.impressions,
            clicks: metric.clicks,
            conversions: metric.conversions,
            position: metric.position,
          },
          expectedCtrLiftPct: 20.0,
          proposedChanges: [
            {
              field: 'title',
              currentValue: `Tiêu đề hiện tại cho ${metric.query}`,
              proposedValue: `[Tối ưu CTR] ${metric.query} Mới Nhất - Hướng Dẫn Chi Tiết & Đăng Ký Fast`,
            },
            {
              field: 'metaDescription',
              currentValue: `Thẻ mô tả hiện tại`,
              proposedValue: `Đăng ký và tra cứu ${metric.query} nhận ưu đãi cực hot. Thông tin chính thức, đầy đủ cú pháp và lưu ý quan trọng. Xem ngay!`,
            },
          ],
          riskTier,
          requiresHumanApproval: requiresApproval,
          status: requiresApproval ? 'REQUIRES_APPROVAL' : 'PROPOSED',
          createdAt: new Date().toISOString(),
        };

        if (requiresApproval) requiresApprovalCount++;
        hypotheses.push(hypothesis);
      }

      if (isLowCvr) {
        lowCvrCount++;
        const hypId = `hyp_cvr_${Date.now().toString(36)}_${index + 1}`;
        // CVR changes involve CTA / pricing / offer -> always requires human approval per spec
        const requiresApproval = true;

        const hypothesis: CTRHypothesis = {
          id: hypId,
          url: metric.url,
          query: metric.query,
          targetMetric: 'CVR',
          hypothesisType: 'CTA_COPY_OPTIMIZATION',
          rationale: `Tỷ lệ chuyển đổi CVR (${(metric.cvr * 100).toFixed(2)}%) thấp hơn mục tiêu ${(this.targetCvr * 100).toFixed(2)}% mặc dù có ${metric.clicks} lượt click.`,
          baselineMetrics: {
            ctr: metric.ctr,
            cvr: metric.cvr,
            impressions: metric.impressions,
            clicks: metric.clicks,
            conversions: metric.conversions,
            position: metric.position,
          },
          expectedCvrLiftPct: 25.0,
          proposedChanges: [
            {
              field: 'ctaCopy',
              currentValue: 'Đăng ký ngay',
              proposedValue: 'Đăng ký ngay nhận ưu đãi 4G/5G Viettel siêu tốc - Nút hành động nổi bật',
            },
          ],
          riskTier,
          requiresHumanApproval: true,
          status: 'REQUIRES_APPROVAL',
          createdAt: new Date().toISOString(),
        };

        requiresApprovalCount++;
        hypotheses.push(hypothesis);
      }
    });

    const summary = `Đã phân tích ${metricsList.length} URLs. Phát hiện ${lowCtrCount} URL CTR thấp, ${lowCvrCount} URL CVR thấp. Đã tạo ${hypotheses.length} đề xuất (${requiresApprovalCount} yêu cầu duyệt thủ công).`;

    return {
      totalAnalyzed: metricsList.length,
      lowCtrCount,
      lowCvrCount,
      hypotheses,
      requiresApprovalCount,
      summary,
    };
  }

  /**
   * Enforces MASTER_SPEC rule: "no uncontrolled auto tests".
   * Returns whether an experiment can be automatically launched.
   */
  public validateExperimentExecution(
    hypothesis: CTRHypothesis,
    policy: { allowAutoExperiments?: boolean } = {}
  ): { allowed: boolean; reasonCode: string; message: string } {
    const isAutoAllowed = policy.allowAutoExperiments ?? this.allowAutoExperiments;

    if (!isAutoAllowed) {
      return {
        allowed: false,
        reasonCode: 'AUTO_EXPERIMENT_DISABLED_BY_POLICY',
        message: 'Thử nghiệm tự động đang tắt theo policy hệ thống (Master Spec v3.2: no uncontrolled auto tests).',
      };
    }

    if (hypothesis.requiresHumanApproval && hypothesis.status !== 'APPROVED') {
      return {
        allowed: false,
        reasonCode: 'HUMAN_APPROVAL_REQUIRED',
        message: `Giả thuyết ${hypothesis.id} thuộc riskTier="${hypothesis.riskTier}" hoặc ảnh hưởng CVR, bắt buộc phải có phê duyệt trước khi triển khai.`,
      };
    }

    return {
      allowed: true,
      reasonCode: 'EXPERIMENT_EXECUTION_ALLOWED',
      message: `Giả thuyết ${hypothesis.id} đã đáp ứng điều kiện triển khai thử nghiệm.`,
    };
  }

  /**
   * Evaluates post-experiment performance against baseline
   */
  public evaluateExperiment(
    hypothesis: CTRHypothesis,
    postMetrics: PerformanceMetrics
  ): ExperimentEvaluationResult {
    const baselineCtr = hypothesis.baselineMetrics.ctr;
    const postCtr = postMetrics.ctr;
    const ctrDeltaPct = baselineCtr > 0 ? ((postCtr - baselineCtr) / baselineCtr) * 100 : 0;

    const baselineCvr = hypothesis.baselineMetrics.cvr;
    const postCvr = postMetrics.cvr;
    const cvrDeltaPct = baselineCvr > 0 ? ((postCvr - baselineCvr) / baselineCvr) * 100 : 0;

    let winner: 'variant' | 'baseline' | 'inconclusive' = 'inconclusive';
    let recommendation: 'ADOPT' | 'REVERT' | 'CONTINUE_DATA_COLLECTION' = 'CONTINUE_DATA_COLLECTION';

    if (postMetrics.clicks < this.minClicks) {
      // Not enough sample size yet
      winner = 'inconclusive';
      recommendation = 'CONTINUE_DATA_COLLECTION';
    } else if (hypothesis.targetMetric === 'CTR') {
      if (ctrDeltaPct >= 10.0 && cvrDeltaPct >= -5.0) {
        winner = 'variant';
        recommendation = 'ADOPT';
      } else if (ctrDeltaPct <= -10.0) {
        winner = 'baseline';
        recommendation = 'REVERT';
      }
    } else if (hypothesis.targetMetric === 'CVR') {
      if (cvrDeltaPct >= 10.0) {
        winner = 'variant';
        recommendation = 'ADOPT';
      } else if (cvrDeltaPct <= -10.0) {
        winner = 'baseline';
        recommendation = 'REVERT';
      }
    }

    return {
      hypothesisId: hypothesis.id,
      baselineCtr,
      postCtr,
      ctrDeltaPct: parseFloat(ctrDeltaPct.toFixed(2)),
      baselineCvr,
      postCvr,
      cvrDeltaPct: parseFloat(cvrDeltaPct.toFixed(2)),
      winner,
      recommendation,
    };
  }
}

export function runConversionOptimization(
  metrics: PerformanceMetrics[],
  riskTierMap?: Record<string, RiskTier>,
  options?: CTROptimizerOptions
): CTRAnalysisResult {
  const optimizer = new ConversionOptimizer(options);
  return optimizer.analyzePerformance(metrics, riskTierMap);
}
