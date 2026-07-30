/**
 * CST-26: Cost Controller Agent
 * Master Spec v3.2 - Section 7 (Agent Matrix), Section 8 (W1 Orchestrate / Init Check), Section 14 (Cost Control) & Section 19.3 (Block Matrix)
 * 
 * Manages daily/monthly budgets, token/model/image/API costs, per-task cost ceilings,
 * and circuit breaker to prevent runaway expenditure.
 */

export interface ModelPricing {
  modelId: string;
  inputCostPer1kTokensUsd: number;
  outputCostPer1kTokensUsd: number;
}

export type TaskType = 'new_article' | 'update' | 'monitoring' | 'research' | 'image_gen' | 'other';

export interface CostPolicy {
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  maxCostPerNewArticleUsd: number;
  maxCostPerUpdateUsd: number;
  reservePctForRecovery: number; // e.g. 10 for 10%
  onBudgetBreach: 'stop_new_content_allow_monitoring' | 'halt_all';
  circuitBreakerSpikeThresholdUsd: number; // Max USD spent within spike window before tripping
  circuitBreakerWindowMinutes: number;
}

export interface CostRecord {
  id: string;
  timestamp: string;
  taskType: TaskType;
  modelId?: string;
  inputTokens?: number;
  outputTokens?: number;
  imageCount?: number;
  serpCalls?: number;
  calculatedCostUsd: number;
  metadata?: Record<string, unknown>;
}

export interface BudgetStatus {
  allowed: boolean;
  reasonCode:
    | 'BUDGET_OK'
    | 'DAILY_BUDGET_EXCEEDED'
    | 'MONTHLY_BUDGET_EXCEEDED'
    | 'TASK_CEILING_EXCEEDED'
    | 'CIRCUIT_BREAKER_TRIPPED'
    | 'RESERVE_BREACH';
  dailySpentUsd: number;
  dailyBudgetUsd: number;
  dailyRemainingUsd: number;
  monthlySpentUsd: number;
  monthlyBudgetUsd: number;
  monthlyRemainingUsd: number;
  circuitBreakerTripped: boolean;
  actionToTake: 'ALLOW' | 'STOP_NEW_CONTENT_ALLOW_MONITORING' | 'HALT_ALL';
  message: string;
}

export interface CircuitBreakerState {
  tripped: boolean;
  reason?: string;
  lastTrippedAt?: string;
  recentSpikeCostUsd: number;
}

export interface CalculateCostParams {
  modelId?: string;
  inputTokens?: number;
  outputTokens?: number;
  imageCount?: number;
  serpCalls?: number;
  customCostUsd?: number;
}

export interface CostModelReport {
  timestamp: string;
  policy: CostPolicy;
  totals: {
    totalSpentUsd: number;
    dailySpentUsd: number;
    monthlySpentUsd: number;
    recordCount: number;
  };
  averageCostPerTask: {
    newArticleUsd: number;
    updateUsd: number;
  };
  records: CostRecord[];
  circuitBreaker: CircuitBreakerState;
}

export class CostController {
  private policy: CostPolicy;
  private modelPricingMap: Map<string, ModelPricing>;
  private ledger: CostRecord[] = [];
  private circuitBreakerState: CircuitBreakerState;
  private unitImageCostUsd = 0.04;
  private unitSerpCostUsd = 0.002;

  constructor(policy?: Partial<CostPolicy>, customPricing?: ModelPricing[]) {
    this.policy = {
      dailyBudgetUsd: policy?.dailyBudgetUsd ?? 1.00,
      monthlyBudgetUsd: policy?.monthlyBudgetUsd ?? 30.00,
      maxCostPerNewArticleUsd: policy?.maxCostPerNewArticleUsd ?? 0.10,
      maxCostPerUpdateUsd: policy?.maxCostPerUpdateUsd ?? 0.05,
      reservePctForRecovery: policy?.reservePctForRecovery ?? 10,
      onBudgetBreach: policy?.onBudgetBreach ?? 'stop_new_content_allow_monitoring',
      circuitBreakerSpikeThresholdUsd: policy?.circuitBreakerSpikeThresholdUsd ?? 0.35,
      circuitBreakerWindowMinutes: policy?.circuitBreakerWindowMinutes ?? 15,
    };

    this.circuitBreakerState = {
      tripped: false,
      recentSpikeCostUsd: 0,
    };

    this.modelPricingMap = new Map();
    this.initDefaultPricing(customPricing);
  }

  private initDefaultPricing(customPricing?: ModelPricing[]) {
    const defaultPricing: ModelPricing[] = [
      { modelId: 'gpt-4o', inputCostPer1kTokensUsd: 0.0025, outputCostPer1kTokensUsd: 0.010 },
      { modelId: 'claude-3-5-sonnet', inputCostPer1kTokensUsd: 0.003, outputCostPer1kTokensUsd: 0.015 },
      { modelId: 'gemini-1.5-pro', inputCostPer1kTokensUsd: 0.00125, outputCostPer1kTokensUsd: 0.005 },
      { modelId: 'gemini-1.5-flash', inputCostPer1kTokensUsd: 0.000075, outputCostPer1kTokensUsd: 0.0003 },
      { modelId: 'default_small_model', inputCostPer1kTokensUsd: 0.0001, outputCostPer1kTokensUsd: 0.0004 },
    ];

    defaultPricing.forEach((p) => this.modelPricingMap.set(p.modelId, p));
    if (customPricing) {
      customPricing.forEach((p) => this.modelPricingMap.set(p.modelId, p));
    }
  }

  /**
   * Calculates USD cost for model tokens, image generations, and SERP API calls
   */
  public calculateItemCost(params: CalculateCostParams): number {
    if (params.customCostUsd !== undefined) {
      return parseFloat(params.customCostUsd.toFixed(6));
    }

    let total = 0;

    if (params.modelId) {
      const pricing = this.modelPricingMap.get(params.modelId) ?? this.modelPricingMap.get('gemini-1.5-flash')!;
      const inCost = ((params.inputTokens ?? 0) / 1000) * pricing.inputCostPer1kTokensUsd;
      const outCost = ((params.outputTokens ?? 0) / 1000) * pricing.outputCostPer1kTokensUsd;
      total += inCost + outCost;
    }

    if (params.imageCount) {
      total += params.imageCount * this.unitImageCostUsd;
    }

    if (params.serpCalls) {
      total += params.serpCalls * this.unitSerpCostUsd;
    }

    return parseFloat(total.toFixed(6));
  }

  /**
   * Evaluates current budget spend and returns budget status for proposed task execution
   */
  public checkBudget(
    estimatedTaskCostUsd = 0,
    taskType: TaskType = 'new_article',
    currentDailySpentOverride?: number,
    currentMonthlySpentOverride?: number
  ): BudgetStatus {
    const dailySpentUsd = currentDailySpentOverride ?? this.getDailySpent();
    const monthlySpentUsd = currentMonthlySpentOverride ?? this.getMonthlySpent();

    const dailyRemainingUsd = Math.max(0, this.policy.dailyBudgetUsd - dailySpentUsd);
    const monthlyRemainingUsd = Math.max(0, this.policy.monthlyBudgetUsd - monthlySpentUsd);

    // 1. Check Circuit Breaker
    if (this.circuitBreakerState.tripped) {
      return {
        allowed: false,
        reasonCode: 'CIRCUIT_BREAKER_TRIPPED',
        dailySpentUsd,
        dailyBudgetUsd: this.policy.dailyBudgetUsd,
        dailyRemainingUsd,
        monthlySpentUsd,
        monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
        monthlyRemainingUsd,
        circuitBreakerTripped: true,
        actionToTake: 'HALT_ALL',
        message: `Circuit breaker bị ngắt: ${this.circuitBreakerState.reason || 'Chi phí tăng đột biến nghi ngờ vòng lặp vô tận'}.`,
      };
    }

    // 2. Check Per-Task Ceiling
    if (taskType === 'new_article' && estimatedTaskCostUsd > this.policy.maxCostPerNewArticleUsd) {
      return {
        allowed: false,
        reasonCode: 'TASK_CEILING_EXCEEDED',
        dailySpentUsd,
        dailyBudgetUsd: this.policy.dailyBudgetUsd,
        dailyRemainingUsd,
        monthlySpentUsd,
        monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
        monthlyRemainingUsd,
        circuitBreakerTripped: false,
        actionToTake: 'STOP_NEW_CONTENT_ALLOW_MONITORING',
        message: `Chi phí ước tính cho bài mới ($${estimatedTaskCostUsd.toFixed(4)}) vượt trần maxCostPerNewArticleUsd ($${this.policy.maxCostPerNewArticleUsd}).`,
      };
    }

    if (taskType === 'update' && estimatedTaskCostUsd > this.policy.maxCostPerUpdateUsd) {
      return {
        allowed: false,
        reasonCode: 'TASK_CEILING_EXCEEDED',
        dailySpentUsd,
        dailyBudgetUsd: this.policy.dailyBudgetUsd,
        dailyRemainingUsd,
        monthlySpentUsd,
        monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
        monthlyRemainingUsd,
        circuitBreakerTripped: false,
        actionToTake: 'STOP_NEW_CONTENT_ALLOW_MONITORING',
        message: `Chi phí ước tính cho bài update ($${estimatedTaskCostUsd.toFixed(4)}) vượt trần maxCostPerUpdateUsd ($${this.policy.maxCostPerUpdateUsd}).`,
      };
    }

    // 3. Check Daily Reserve
    const reserveAmount = (this.policy.dailyBudgetUsd * this.policy.reservePctForRecovery) / 100;
    const effectiveDailyLimit = this.policy.dailyBudgetUsd - reserveAmount;

    if (taskType === 'new_article' && dailySpentUsd + estimatedTaskCostUsd > effectiveDailyLimit) {
      return {
        allowed: false,
        reasonCode: 'RESERVE_BREACH',
        dailySpentUsd,
        dailyBudgetUsd: this.policy.dailyBudgetUsd,
        dailyRemainingUsd,
        monthlySpentUsd,
        monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
        monthlyRemainingUsd,
        circuitBreakerTripped: false,
        actionToTake: 'STOP_NEW_CONTENT_ALLOW_MONITORING',
        message: `Chi phí bài mới chạm vào ${this.policy.reservePctForRecovery}% ngân sách dự phòng ngày (giới hạn khả dụng $${effectiveDailyLimit.toFixed(2)}).`,
      };
    }

    // 4. Check Daily Budget Total Breach
    if (dailySpentUsd + estimatedTaskCostUsd > this.policy.dailyBudgetUsd) {
      const action = taskType === 'monitoring' ? 'ALLOW' : 'STOP_NEW_CONTENT_ALLOW_MONITORING';
      return {
        allowed: taskType === 'monitoring',
        reasonCode: 'DAILY_BUDGET_EXCEEDED',
        dailySpentUsd,
        dailyBudgetUsd: this.policy.dailyBudgetUsd,
        dailyRemainingUsd,
        monthlySpentUsd,
        monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
        monthlyRemainingUsd,
        circuitBreakerTripped: false,
        actionToTake: action,
        message: `Vượt ngân sách ngày: đã dùng $${dailySpentUsd.toFixed(4)} / $${this.policy.dailyBudgetUsd.toFixed(2)}. ${taskType === 'monitoring' ? 'Cho phép chạy monitoring.' : 'Tạm dừng tạo nội dung mới.'}`,
      };
    }

    // 5. Check Monthly Budget Total Breach
    if (monthlySpentUsd + estimatedTaskCostUsd > this.policy.monthlyBudgetUsd) {
      const action = taskType === 'monitoring' ? 'ALLOW' : 'STOP_NEW_CONTENT_ALLOW_MONITORING';
      return {
        allowed: taskType === 'monitoring',
        reasonCode: 'MONTHLY_BUDGET_EXCEEDED',
        dailySpentUsd,
        dailyBudgetUsd: this.policy.dailyBudgetUsd,
        dailyRemainingUsd,
        monthlySpentUsd,
        monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
        monthlyRemainingUsd,
        circuitBreakerTripped: false,
        actionToTake: action,
        message: `Vượt ngân sách tháng: đã dùng $${monthlySpentUsd.toFixed(4)} / $${this.policy.monthlyBudgetUsd.toFixed(2)}.`,
      };
    }

    return {
      allowed: true,
      reasonCode: 'BUDGET_OK',
      dailySpentUsd,
      dailyBudgetUsd: this.policy.dailyBudgetUsd,
      dailyRemainingUsd,
      monthlySpentUsd,
      monthlyBudgetUsd: this.policy.monthlyBudgetUsd,
      monthlyRemainingUsd,
      circuitBreakerTripped: false,
      actionToTake: 'ALLOW',
      message: 'Ngân sách hợp lệ, cho phép thực hiện.',
    };
  }

  /**
   * Records a cost expense into the ledger and updates circuit breaker monitor
   */
  public recordExpense(
    params: Omit<CostRecord, 'id' | 'timestamp' | 'calculatedCostUsd'> & { customCostUsd?: number }
  ): CostRecord {
    const costUsd = this.calculateItemCost({
      modelId: params.modelId,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      imageCount: params.imageCount,
      serpCalls: params.serpCalls,
      customCostUsd: params.customCostUsd,
    });

    const record: CostRecord = {
      id: `cost_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      taskType: params.taskType,
      modelId: params.modelId,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      imageCount: params.imageCount,
      serpCalls: params.serpCalls,
      calculatedCostUsd: costUsd,
      metadata: params.metadata,
    };

    this.ledger.push(record);
    this.updateCircuitBreaker(costUsd);

    return record;
  }

  /**
   * Checks for cost spikes in the recent window and trips circuit breaker if threshold is exceeded
   */
  private updateCircuitBreaker(addedCostUsd: number): void {
    const now = Date.now();
    const windowMs = this.policy.circuitBreakerWindowMinutes * 60 * 1000;

    const recentRecords = this.ledger.filter(
      (r) => now - new Date(r.timestamp).getTime() <= windowMs
    );

    const spikeCost = recentRecords.reduce((sum, r) => sum + r.calculatedCostUsd, 0);
    this.circuitBreakerState.recentSpikeCostUsd = parseFloat(spikeCost.toFixed(6));

    if (spikeCost > this.policy.circuitBreakerSpikeThresholdUsd && !this.circuitBreakerState.tripped) {
      this.tripCircuitBreaker(
        `Chi phí trong ${this.policy.circuitBreakerWindowMinutes} phút gần đây ($${spikeCost.toFixed(4)}) vượt ngưỡng an toàn ($${this.policy.circuitBreakerSpikeThresholdUsd.toFixed(2)}).`
      );
    }
  }

  public tripCircuitBreaker(reason: string): void {
    this.circuitBreakerState = {
      tripped: true,
      reason,
      lastTrippedAt: new Date().toISOString(),
      recentSpikeCostUsd: this.circuitBreakerState.recentSpikeCostUsd,
    };
  }

  public resetCircuitBreaker(): void {
    this.circuitBreakerState = {
      tripped: false,
      recentSpikeCostUsd: 0,
    };
  }

  public getDailySpent(): number {
    const today = new Date().toISOString().substring(0, 10);
    return parseFloat(
      this.ledger
        .filter((r) => r.timestamp.startsWith(today))
        .reduce((sum, r) => sum + r.calculatedCostUsd, 0)
        .toFixed(6)
    );
  }

  public getMonthlySpent(): number {
    const thisMonth = new Date().toISOString().substring(0, 7);
    return parseFloat(
      this.ledger
        .filter((r) => r.timestamp.startsWith(thisMonth))
        .reduce((sum, r) => sum + r.calculatedCostUsd, 0)
        .toFixed(6)
    );
  }

  /**
   * Generates cost model report matching state/reports/cost-model.json schema
   */
  public generateCostModelReport(): CostModelReport {
    const totalSpentUsd = this.ledger.reduce((sum, r) => sum + r.calculatedCostUsd, 0);
    const newArticles = this.ledger.filter((r) => r.taskType === 'new_article');
    const updates = this.ledger.filter((r) => r.taskType === 'update');

    const avgNewArticleCost = newArticles.length > 0
      ? newArticles.reduce((s, r) => s + r.calculatedCostUsd, 0) / newArticles.length
      : 0;

    const avgUpdateCost = updates.length > 0
      ? updates.reduce((s, r) => s + r.calculatedCostUsd, 0) / updates.length
      : 0;

    return {
      timestamp: new Date().toISOString(),
      policy: this.policy,
      totals: {
        totalSpentUsd: parseFloat(totalSpentUsd.toFixed(6)),
        dailySpentUsd: this.getDailySpent(),
        monthlySpentUsd: this.getMonthlySpent(),
        recordCount: this.ledger.length,
      },
      averageCostPerTask: {
        newArticleUsd: parseFloat(avgNewArticleCost.toFixed(6)),
        updateUsd: parseFloat(avgUpdateCost.toFixed(6)),
      },
      records: this.ledger,
      circuitBreaker: this.circuitBreakerState,
    };
  }
}

export function checkSystemBudget(
  policy?: Partial<CostPolicy>,
  estimatedTaskCostUsd = 0,
  taskType: TaskType = 'new_article'
): BudgetStatus {
  const controller = new CostController(policy);
  return controller.checkBudget(estimatedTaskCostUsd, taskType);
}
