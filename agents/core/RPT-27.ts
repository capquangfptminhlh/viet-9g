/**
 * RPT-27: Reporter Agent
 * Master Spec v3.2 - Section 6.1 (W1 Orchestrate) & Section 15 (state/reports)
 * Handles Daily, Weekly, and Monthly reporting and logs state to state/reports/
 */

import * as fs from 'fs';
import * as path from 'path';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface ReportMetrics {
  articlesCreated: number;
  articlesUpdated: number;
  totalCostUsd: number;
  tokensIn: number;
  tokensOut: number;
  imagesGenerated: number;
  passCount: number;
  needsReviewCount: number;
  blockCount: number;
  backlogPending: number;
}

export interface CostRunDetail {
  tokensIn: number;
  tokensOut: number;
  imagesGenerated: number;
}

export interface CostRunEntry {
  date: string;
  articlesCreated: number;
  articlesUpdated: number;
  totalCostUsd: number;
  details: CostRunDetail;
}

export interface CostModelData {
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  runs: CostRunEntry[];
}

export interface DailyReport {
  schemaVersion: '1.0';
  reportId: string;
  agentId: 'RPT-27';
  period: 'daily';
  date: string;
  generatedAt: string;
  metrics: ReportMetrics;
  costStatus: {
    dailyBudgetUsd: number;
    dailySpentUsd: number;
    budgetBreached: boolean;
  };
  summary: string;
}

export interface WeeklyReport {
  schemaVersion: '1.0';
  reportId: string;
  agentId: 'RPT-27';
  period: 'weekly';
  week: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  aggregatedMetrics: ReportMetrics;
  dailyBreakdown: Array<{
    date: string;
    articlesCreated: number;
    articlesUpdated: number;
    totalCostUsd: number;
  }>;
  summary: string;
}

export interface MonthlyReport {
  schemaVersion: '1.0';
  reportId: string;
  agentId: 'RPT-27';
  period: 'monthly';
  month: string;
  generatedAt: string;
  aggregatedMetrics: ReportMetrics;
  budgetStatus: {
    monthlyBudgetUsd: number;
    totalSpentUsd: number;
    remainingBudgetUsd: number;
    breachRisk: boolean;
  };
  summary: string;
}

export interface ReporterOptions {
  reportsDir?: string;
  stateDir?: string;
}

export class ReporterAgent {
  private reportsDir: string;
  private stateDir: string;

  constructor(options: ReporterOptions = {}) {
    this.stateDir = options.stateDir || path.resolve(process.cwd(), 'state');
    this.reportsDir = options.reportsDir || path.join(this.stateDir, 'reports');
  }

  /**
   * Ensures output directory exists
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Reads existing state/reports/cost-model.json if available
   */
  public readCostModel(costModelPath?: string): CostModelData | null {
    const filePath = costModelPath || path.join(this.reportsDir, 'cost-model.json');
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as CostModelData;
    } catch {
      return null;
    }
  }

  /**
   * Updates state/reports/cost-model.json with new run data
   */
  public updateCostModel(metrics: Partial<ReportMetrics>, dateStr?: string): void {
    this.ensureDirectoryExists(this.reportsDir);
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const filePath = path.join(this.reportsDir, 'cost-model.json');

    let costModel = this.readCostModel(filePath);
    if (!costModel) {
      costModel = {
        dailyBudgetUsd: 1.0,
        monthlyBudgetUsd: 30.0,
        runs: []
      };
    }

    const existingRunIndex = costModel.runs.findIndex((r) => r.date === targetDate);
    const runEntry: CostRunEntry = {
      date: targetDate,
      articlesCreated: metrics.articlesCreated ?? 0,
      articlesUpdated: metrics.articlesUpdated ?? 0,
      totalCostUsd: metrics.totalCostUsd ?? 0.0,
      details: {
        tokensIn: metrics.tokensIn ?? 0,
        tokensOut: metrics.tokensOut ?? 0,
        imagesGenerated: metrics.imagesGenerated ?? 0
      }
    };

    if (existingRunIndex >= 0) {
      costModel.runs[existingRunIndex] = runEntry;
    } else {
      costModel.runs.push(runEntry);
    }

    fs.writeFileSync(filePath, JSON.stringify(costModel, null, 2), 'utf-8');
  }

  /**
   * Generates a Daily Report object
   */
  public generateDailyReport(dateStr?: string, customMetrics?: Partial<ReportMetrics>): DailyReport {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const costModel = this.readCostModel();
    const runForDate = costModel?.runs.find((r) => r.date === today);

    const metrics: ReportMetrics = {
      articlesCreated: customMetrics?.articlesCreated ?? runForDate?.articlesCreated ?? 0,
      articlesUpdated: customMetrics?.articlesUpdated ?? runForDate?.articlesUpdated ?? 0,
      totalCostUsd: customMetrics?.totalCostUsd ?? runForDate?.totalCostUsd ?? 0,
      tokensIn: customMetrics?.tokensIn ?? runForDate?.details.tokensIn ?? 0,
      tokensOut: customMetrics?.tokensOut ?? runForDate?.details.tokensOut ?? 0,
      imagesGenerated: customMetrics?.imagesGenerated ?? runForDate?.details.imagesGenerated ?? 0,
      passCount: customMetrics?.passCount ?? 0,
      needsReviewCount: customMetrics?.needsReviewCount ?? 0,
      blockCount: customMetrics?.blockCount ?? 0,
      backlogPending: customMetrics?.backlogPending ?? 0
    };

    const dailyBudget = costModel?.dailyBudgetUsd ?? 1.0;
    const budgetBreached = metrics.totalCostUsd > dailyBudget;

    return {
      schemaVersion: '1.0',
      reportId: `rpt_daily_${today.replace(/-/g, '')}`,
      agentId: 'RPT-27',
      period: 'daily',
      date: today,
      generatedAt: new Date().toISOString(),
      metrics,
      costStatus: {
        dailyBudgetUsd: dailyBudget,
        dailySpentUsd: metrics.totalCostUsd,
        budgetBreached
      },
      summary: `Daily Report for ${today}: ${metrics.articlesCreated} created, ${metrics.articlesUpdated} updated. Total cost: $${metrics.totalCostUsd.toFixed(4)}.`
    };
  }

  /**
   * Generates a Weekly Report object
   */
  public generateWeeklyReport(weekStr?: string, dailyReports?: DailyReport[]): WeeklyReport {
    const today = new Date();
    const targetWeek = weekStr || this.getIsoWeekString(today);

    const reportsToAggregate = dailyReports || this.loadDailyReportsForWeek(targetWeek);

    const aggregatedMetrics: ReportMetrics = {
      articlesCreated: 0,
      articlesUpdated: 0,
      totalCostUsd: 0,
      tokensIn: 0,
      tokensOut: 0,
      imagesGenerated: 0,
      passCount: 0,
      needsReviewCount: 0,
      blockCount: 0,
      backlogPending: 0
    };

    const dailyBreakdown: Array<{
      date: string;
      articlesCreated: number;
      articlesUpdated: number;
      totalCostUsd: number;
    }> = [];

    for (const report of reportsToAggregate) {
      aggregatedMetrics.articlesCreated += report.metrics.articlesCreated;
      aggregatedMetrics.articlesUpdated += report.metrics.articlesUpdated;
      aggregatedMetrics.totalCostUsd += report.metrics.totalCostUsd;
      aggregatedMetrics.tokensIn += report.metrics.tokensIn;
      aggregatedMetrics.tokensOut += report.metrics.tokensOut;
      aggregatedMetrics.imagesGenerated += report.metrics.imagesGenerated;
      aggregatedMetrics.passCount += report.metrics.passCount;
      aggregatedMetrics.needsReviewCount += report.metrics.needsReviewCount;
      aggregatedMetrics.blockCount += report.metrics.blockCount;
      aggregatedMetrics.backlogPending = report.metrics.backlogPending; // latest

      dailyBreakdown.push({
        date: report.date,
        articlesCreated: report.metrics.articlesCreated,
        articlesUpdated: report.metrics.articlesUpdated,
        totalCostUsd: report.metrics.totalCostUsd
      });
    }

    const startDate = dailyBreakdown.length > 0 ? dailyBreakdown[0].date : today.toISOString().split('T')[0];
    const endDate = dailyBreakdown.length > 0 ? dailyBreakdown[dailyBreakdown.length - 1].date : startDate;

    return {
      schemaVersion: '1.0',
      reportId: `rpt_weekly_${targetWeek.replace('-', '_')}`,
      agentId: 'RPT-27',
      period: 'weekly',
      week: targetWeek,
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
      aggregatedMetrics,
      dailyBreakdown,
      summary: `Weekly Report for ${targetWeek}: ${aggregatedMetrics.articlesCreated} created, ${aggregatedMetrics.articlesUpdated} updated across ${dailyBreakdown.length} active days. Total cost: $${aggregatedMetrics.totalCostUsd.toFixed(4)}.`
    };
  }

  /**
   * Generates a Monthly Report object
   */
  public generateMonthlyReport(monthStr?: string, dailyReports?: DailyReport[]): MonthlyReport {
    const today = new Date();
    const targetMonth = monthStr || today.toISOString().slice(0, 7); // YYYY-MM

    const reportsToAggregate = dailyReports || this.loadDailyReportsForMonth(targetMonth);
    const costModel = this.readCostModel();
    const monthlyBudgetUsd = costModel?.monthlyBudgetUsd ?? 30.0;

    const aggregatedMetrics: ReportMetrics = {
      articlesCreated: 0,
      articlesUpdated: 0,
      totalCostUsd: 0,
      tokensIn: 0,
      tokensOut: 0,
      imagesGenerated: 0,
      passCount: 0,
      needsReviewCount: 0,
      blockCount: 0,
      backlogPending: 0
    };

    for (const report of reportsToAggregate) {
      aggregatedMetrics.articlesCreated += report.metrics.articlesCreated;
      aggregatedMetrics.articlesUpdated += report.metrics.articlesUpdated;
      aggregatedMetrics.totalCostUsd += report.metrics.totalCostUsd;
      aggregatedMetrics.tokensIn += report.metrics.tokensIn;
      aggregatedMetrics.tokensOut += report.metrics.tokensOut;
      aggregatedMetrics.imagesGenerated += report.metrics.imagesGenerated;
      aggregatedMetrics.passCount += report.metrics.passCount;
      aggregatedMetrics.needsReviewCount += report.metrics.needsReviewCount;
      aggregatedMetrics.blockCount += report.metrics.blockCount;
      aggregatedMetrics.backlogPending = report.metrics.backlogPending;
    }

    const remainingBudgetUsd = Math.max(0, monthlyBudgetUsd - aggregatedMetrics.totalCostUsd);
    const breachRisk = aggregatedMetrics.totalCostUsd > monthlyBudgetUsd * 0.85;

    return {
      schemaVersion: '1.0',
      reportId: `rpt_monthly_${targetMonth.replace('-', '_')}`,
      agentId: 'RPT-27',
      period: 'monthly',
      month: targetMonth,
      generatedAt: new Date().toISOString(),
      aggregatedMetrics,
      budgetStatus: {
        monthlyBudgetUsd,
        totalSpentUsd: aggregatedMetrics.totalCostUsd,
        remainingBudgetUsd,
        breachRisk
      },
      summary: `Monthly Report for ${targetMonth}: ${aggregatedMetrics.articlesCreated} created, ${aggregatedMetrics.articlesUpdated} updated. Total cost: $${aggregatedMetrics.totalCostUsd.toFixed(4)} of $${monthlyBudgetUsd} budget.`
    };
  }

  /**
   * Saves any report object to state/reports/
   */
  public saveReport(filename: string, reportData: object): string {
    this.ensureDirectoryExists(this.reportsDir);
    const filePath = path.join(this.reportsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2), 'utf-8');
    return filePath;
  }

  /**
   * Executes RPT-27 agent workflow to output daily, weekly, and monthly reports
   */
  public run(options: {
    period?: ReportPeriod;
    date?: string;
    customMetrics?: Partial<ReportMetrics>;
  } = {}): {
    generatedFiles: string[];
    reports: {
      daily?: DailyReport;
      weekly?: WeeklyReport;
      monthly?: MonthlyReport;
    };
  } {
    const period = options.period || 'daily';
    const dateStr = options.date || new Date().toISOString().split('T')[0];
    const generatedFiles: string[] = [];
    const reports: { daily?: DailyReport; weekly?: WeeklyReport; monthly?: MonthlyReport } = {};

    if (options.customMetrics) {
      this.updateCostModel(options.customMetrics, dateStr);
    }

    if (period === 'daily' || period === 'weekly' || period === 'monthly') {
      const dailyReport = this.generateDailyReport(dateStr, options.customMetrics);
      reports.daily = dailyReport;
      const dailyFile = this.saveReport(`daily-${dateStr}.json`, dailyReport);
      generatedFiles.push(dailyFile);
    }

    if (period === 'weekly' || period === 'monthly') {
      const weekStr = this.getIsoWeekString(new Date(dateStr));
      const weeklyReport = this.generateWeeklyReport(weekStr, reports.daily ? [reports.daily] : undefined);
      reports.weekly = weeklyReport;
      const weeklyFile = this.saveReport(`weekly-${weekStr}.json`, weeklyReport);
      generatedFiles.push(weeklyFile);
    }

    if (period === 'monthly') {
      const monthStr = dateStr.slice(0, 7);
      const monthlyReport = this.generateMonthlyReport(monthStr, reports.daily ? [reports.daily] : undefined);
      reports.monthly = monthlyReport;
      const monthlyFile = this.saveReport(`monthly-${monthStr}.json`, monthlyReport);
      generatedFiles.push(monthlyFile);
    }

    return { generatedFiles, reports };
  }

  // Private helper utilities

  private getIsoWeekString(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  private loadDailyReportsForWeek(weekStr: string): DailyReport[] {
    const reports: DailyReport[] = [];
    if (!fs.existsSync(this.reportsDir)) return reports;

    const files = fs.readdirSync(this.reportsDir);
    for (const file of files) {
      if (file.startsWith('daily-') && file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(this.reportsDir, file), 'utf-8');
          const report = JSON.parse(content) as DailyReport;
          const reportWeek = this.getIsoWeekString(new Date(report.date));
          if (reportWeek === weekStr) {
            reports.push(report);
          }
        } catch {
          // ignore invalid files
        }
      }
    }
    return reports;
  }

  private loadDailyReportsForMonth(monthStr: string): DailyReport[] {
    const reports: DailyReport[] = [];
    if (!fs.existsSync(this.reportsDir)) return reports;

    const files = fs.readdirSync(this.reportsDir);
    for (const file of files) {
      if (file.startsWith('daily-') && file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(this.reportsDir, file), 'utf-8');
          const report = JSON.parse(content) as DailyReport;
          if (report.date.startsWith(monthStr)) {
            reports.push(report);
          }
        } catch {
          // ignore invalid files
        }
      }
    }
    return reports;
  }
}

/**
 * Helper function to run ReporterAgent (RPT-27)
 */
export function runReporter(options?: {
  period?: ReportPeriod;
  date?: string;
  customMetrics?: Partial<ReportMetrics>;
  reportsDir?: string;
}) {
  const agent = new ReporterAgent({ reportsDir: options?.reportsDir });
  return agent.run({
    period: options?.period,
    date: options?.date,
    customMetrics: options?.customMetrics
  });
}

/**
 * Helper function to export Daily Report
 */
export function exportDailyReport(dateStr?: string, customMetrics?: Partial<ReportMetrics>, reportsDir?: string): string {
  const agent = new ReporterAgent({ reportsDir });
  const report = agent.generateDailyReport(dateStr, customMetrics);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  return agent.saveReport(`daily-${targetDate}.json`, report);
}

/**
 * Helper function to export Weekly Report
 */
export function exportWeeklyReport(weekStr?: string, dailyReports?: DailyReport[], reportsDir?: string): string {
  const agent = new ReporterAgent({ reportsDir });
  const report = agent.generateWeeklyReport(weekStr, dailyReports);
  const targetWeek = weekStr || report.week;
  return agent.saveReport(`weekly-${targetWeek}.json`, report);
}

/**
 * Helper function to export Monthly Report
 */
export function exportMonthlyReport(monthStr?: string, dailyReports?: DailyReport[], reportsDir?: string): string {
  const agent = new ReporterAgent({ reportsDir });
  const report = agent.generateMonthlyReport(monthStr, dailyReports);
  const targetMonth = monthStr || report.month;
  return agent.saveReport(`monthly-${targetMonth}.json`, report);
}
