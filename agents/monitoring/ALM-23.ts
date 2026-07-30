/**
 * ALM-23: Alert / Kill Switch (Anomaly Rules & Emergency Lock)
 * Master Spec v3.2 - Section 7, 8, 13.2, 19.3, 20, 23
 * 
 * Trách nhiệm:
 * 1. Quản lý trạng thái Kill Switch (khóa khẩn cấp).
 * 2. Đánh giá Anomaly trên Search Data (chỉ chạy trên ngày chín <= N-3).
 * 3. Đánh giá Anomaly tức thời (5xx, Secret Leak, Smoke Test Fail, Manual Action).
 * 4. Kiểm tra Heartbeat (phát hiện mất lượt daily.yml > 26h).
 * 5. Đảm bảo quy tắc Resume Kill-Switch KHÔNG BAO GIỜ tự động (chỉ con người gỡ qua PR/commit).
 */

export interface KillSwitchConfig {
  active: boolean;
  reason?: string;
  activatedBy?: string;
  at?: string;
  reasonCode?: string;
}

export interface MetricSample {
  date: string; // YYYY-MM-DD
  segment?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  isImmature?: boolean;
}

export interface AnomalyEvaluationOptions {
  dropThresholdPct?: number; // Mặc định 0.40 (giảm 40%)
  minMatureDaysRequired?: number; // Mặc định 2 ngày chín liên tiếp
  referenceDaysWindow?: number; // Mặc định 7-14 ngày trước đó làm baseline
}

export interface AnomalyEvaluationResult {
  hasAnomaly: boolean;
  shouldActivateKillSwitch: boolean;
  consecutiveBreachDays: number;
  segment: string;
  reasonCodes: string[];
  matureSamplesEvaluated: number;
  immatureSamplesIgnored: number;
  details: string;
}

export interface ImmediateUptimeCheck {
  statusHttp: number;
  is5xx: boolean;
  smokePassed: boolean;
  secretLeakDetected: boolean;
  manualActionDetected: boolean;
  securityIssueDetected: boolean;
  accidentalNoindexDetected: boolean;
}

export interface HeartbeatCheckResult {
  isMissed: boolean;
  hoursSinceLastRun: number;
  lastRunAt: string;
  reasonCode?: string;
  message: string;
}

export interface AlertRecord {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  reasonCode: string;
  message: string;
  segment?: string;
  metadata?: Record<string, unknown>;
}

export class AlertKillSwitch {
  private killSwitchState: KillSwitchConfig;
  private readonly MATURITY_LAG_DAYS = 3; // N-3 trở về trước mới là ngày dữ liệu chín (Section 8)

  constructor(initialState?: KillSwitchConfig) {
    this.killSwitchState = initialState ?? {
      active: false,
    };
  }

  /**
   * Kiểm tra trạng thái hiện tại của Kill Switch
   */
  public isKillSwitchActive(): boolean {
    return this.killSwitchState.active;
  }

  /**
   * Lấy cấu hình chi tiết trạng thái Kill Switch
   */
  public getKillSwitchState(): KillSwitchConfig {
    return { ...this.killSwitchState };
  }

  /**
   * Kích hoạt Kill Switch khẩn cấp (Emergency Lock)
   * Section 13.2 / Section 20
   */
  public activateKillSwitch(reason: string, activatedBy: string, reasonCode: string = 'KILL_SWITCH_ACTIVE'): KillSwitchConfig {
    this.killSwitchState = {
      active: true,
      reason,
      activatedBy,
      at: new Date().toISOString(),
      reasonCode,
    };
    return this.getKillSwitchState();
  }

  /**
   * QUY TẮC BẮT BUỘC (Master Spec v3.2 - Section 20 & 23):
   * Hệ thống KHÔNG BAO GIỜ tự gỡ kill-switch.
   * Resume kill-switch luôn là hành động của con người (commit tắt cờ trong config/kill-switch.json).
   */
  public canAutoResume(): false {
    return false;
  }

  /**
   * Đánh giá Anomaly trên Search Data (GSC / Bing)
   * Phải tuân thủ cửa sổ dữ liệu chín (Section 8):
   * - Ngày N-2..N là `immature` -> Gắn nhãn, KHÔNG dùng để kích hoạt anomaly pause.
   * - Ngày <= N-3 là `mature` -> Chỉ đánh giá trên các ngày này.
   * - Yêu cầu >= 2 ngày chín liên tiếp vượt ngưỡng cùng segment mới kích hoạt pause tự động.
   */
  public evaluateSearchAnomalies(
    samples: MetricSample[],
    currentRunDate: Date = new Date(),
    options: AnomalyEvaluationOptions = {}
  ): AnomalyEvaluationResult {
    const dropThresholdPct = options.dropThresholdPct ?? 0.40;
    const minMatureDaysRequired = options.minMatureDaysRequired ?? 2;

    const reasonCodes: string[] = [];
    const matureSamples: MetricSample[] = [];
    let immatureCount = 0;

    // Phân loại chín (mature) vs chưa chín (immature) dựa theo ngày N-3
    const cutoffDate = new Date(currentRunDate.getTime());
    cutoffDate.setDate(cutoffDate.getDate() - this.MATURITY_LAG_DAYS);
    cutoffDate.setHours(0, 0, 0, 0);

    for (const sample of samples) {
      const sampleDate = new Date(sample.date);
      sampleDate.setHours(0, 0, 0, 0);

      if (sampleDate > cutoffDate || sample.isImmature) {
        immatureCount++;
      } else {
        matureSamples.push(sample);
      }
    }

    // Sắp xếp các mẫu ngày chín theo thời gian tăng dần
    matureSamples.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (matureSamples.length < 2) {
      return {
        hasAnomaly: false,
        shouldActivateKillSwitch: false,
        consecutiveBreachDays: 0,
        segment: matureSamples[0]?.segment || 'all',
        reasonCodes: ['INSUFFICIENT_MATURE_SAMPLES'],
        matureSamplesEvaluated: matureSamples.length,
        immatureSamplesIgnored: immatureCount,
        details: 'Chưa đủ mẫu dữ liệu chín (>= 2 ngày mature) để đánh giá anomaly.',
      };
    }

    // Tính baseline (trung bình của các ngày chín trước đó trừ 2 ngày gần nhất)
    const baselineSamples = matureSamples.slice(0, Math.max(1, matureSamples.length - 2));
    const avgBaselineClicks =
      baselineSamples.reduce((acc, s) => acc + s.clicks, 0) / baselineSamples.length;

    // Kiểm tra 2 ngày chín gần nhất
    const recentMature = matureSamples.slice(-2);
    let consecutiveBreaches = 0;

    for (const sample of recentMature) {
      if (avgBaselineClicks > 0) {
        const dropRatio = (avgBaselineClicks - sample.clicks) / avgBaselineClicks;
        if (dropRatio >= dropThresholdPct) {
          consecutiveBreaches++;
        }
      }
    }

    const hasAnomaly = consecutiveBreaches >= minMatureDaysRequired;
    const shouldActivateKillSwitch = hasAnomaly;

    if (hasAnomaly) {
      reasonCodes.push('ANOMALY_DETECTED', 'SEARCH_IMPRESSIONS_DECAY');
    }

    const segment = matureSamples[0]?.segment || 'all';
    const details = hasAnomaly
      ? `Phát hiện anomaly: ${consecutiveBreaches} ngày chín liên tiếp giảm > ${dropThresholdPct * 100}% so với baseline trên segment [${segment}].`
      : `Bình thường: ${consecutiveBreaches}/${minMatureDaysRequired} ngày chín bị giảm vượt ngưỡng. ${immatureCount} mẫu immature bỏ qua.`;

    return {
      hasAnomaly,
      shouldActivateKillSwitch,
      consecutiveBreachDays: consecutiveBreaches,
      segment,
      reasonCodes,
      matureSamplesEvaluated: matureSamples.length,
      immatureSamplesIgnored: immatureCount,
      details,
    };
  }

  /**
   * Đánh giá sự cố tức thời (Immediate Anomalies)
   * Không áp dụng trễ 3 ngày cho Uptime, 5xx, Smoke Fail, Secret Leak, Manual Action.
   */
  public evaluateImmediateChecks(check: ImmediateUptimeCheck): {
    shouldLock: boolean;
    reasonCode?: string;
    message: string;
  } {
    if (check.is5xx || check.statusHttp >= 500) {
      return {
        shouldLock: true,
        reasonCode: 'SERVER_ERROR_5XX',
        message: `Phát hiện lỗi HTTP ${check.statusHttp} trên hệ thống production.`,
      };
    }

    if (check.secretLeakDetected) {
      return {
        shouldLock: true,
        reasonCode: 'SECRET_PII_LEAK',
        message: 'Khóa khẩn cấp: Phát hiện rò rỉ API Key / Secret / PII trong build hoặc logs.',
      };
    }

    if (check.accidentalNoindexDetected) {
      return {
        shouldLock: true,
        reasonCode: 'ACCIDENTAL_NOINDEX',
        message: 'Khóa khẩn cấp: Phát hiện thẻ noindex hoặc robots.txt chặn production ngoài dự kiến.',
      };
    }

    if (check.manualActionDetected) {
      return {
        shouldLock: true,
        reasonCode: 'MANUAL_ACTION_DETECTED',
        message: 'Khóa khẩn cấp: Phát hiện Manual Action từ Google Search Console.',
      };
    }

    if (check.securityIssueDetected) {
      return {
        shouldLock: true,
        reasonCode: 'SECURITY_ISSUE_DETECTED',
        message: 'Khóa khẩn cấp: Phát hiện vấn đề bảo mật (Security Issue) từ GSC / Webmaster.',
      };
    }

    if (!check.smokePassed) {
      return {
        shouldLock: true,
        reasonCode: 'PRODUCTION_SMOKE_FAILED',
        message: 'Khóa khẩn cấp: Production Smoke Test thất bại sau khi release.',
      };
    }

    return {
      shouldLock: false,
      message: 'Mọi kiểm tra tức thời (Immediate Checks) đạt yêu cầu.',
    };
  }

  /**
   * Kiểm tra Heartbeat (Section 8 & 23)
   * Nếu > 26 giờ không có daily run nào (thành công hoặc thất bại) ->Alert & Lock
   */
  public checkHeartbeat(lastRunIsoTimestamp: string, currentIsoTimestamp: string = new Date().toISOString()): HeartbeatCheckResult {
    const lastRunTime = new Date(lastRunIsoTimestamp).getTime();
    const currentTime = new Date(currentIsoTimestamp).getTime();
    const diffHours = (currentTime - lastRunTime) / (1000 * 60 * 60);

    const isMissed = diffHours > 26;
    return {
      isMissed,
      hoursSinceLastRun: parseFloat(diffHours.toFixed(2)),
      lastRunAt: lastRunIsoTimestamp,
      reasonCode: isMissed ? 'HEARTBEAT_MISSED' : undefined,
      message: isMissed
        ? `CẢNH BÁO: Đã ${diffHours.toFixed(1)} giờ trôi qua không có daily run nào (vượt trần 26h). GitHub Actions cron có thể bị hoãn hoặc disable.`
        : `Heartbeat bình thường. Lần chạy cuối cách đây ${diffHours.toFixed(1)} giờ.`,
    };
  }
}

/**
 * Helper function khởi tạo và chạy kiểm tra nhanh Kill Switch & Anomalies
 */
export function evaluateMonitoringStatus(
  killSwitchConfig: KillSwitchConfig,
  samples: MetricSample[],
  uptimeCheck?: ImmediateUptimeCheck,
  lastRunTimestamp?: string
): {
  killSwitchActive: boolean;
  alerts: AlertRecord[];
  recommendedAction: 'CONTINUE' | 'PAUSE_AND_ALERT';
} {
  const alm = new AlertKillSwitch(killSwitchConfig);
  const alerts: AlertRecord[] = [];

  // 1. Kiểm tra trạng thái Kill Switch hiện tại
  if (alm.isKillSwitchActive()) {
    alerts.push({
      id: `alt-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      reasonCode: killSwitchConfig.reasonCode || 'KILL_SWITCH_ACTIVE',
      message: `Kill switch đang BẬT. Lý do: ${killSwitchConfig.reason || 'Không xác định'}.`,
    });
    return {
      killSwitchActive: true,
      alerts,
      recommendedAction: 'PAUSE_AND_ALERT',
    };
  }

  // 2. Kiểm tra Immediate Uptime Checks
  if (uptimeCheck) {
    const immediateRes = alm.evaluateImmediateChecks(uptimeCheck);
    if (immediateRes.shouldLock) {
      alm.activateKillSwitch(immediateRes.message, 'ALM-23 Auto Detector', immediateRes.reasonCode);
      alerts.push({
        id: `alt-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        reasonCode: immediateRes.reasonCode || 'IMMEDIATE_FAILURE',
        message: immediateRes.message,
      });
      return {
        killSwitchActive: true,
        alerts,
        recommendedAction: 'PAUSE_AND_ALERT',
      };
    }
  }

  // 3. Kiểm tra Search Data Anomalies (trên ngày chín)
  if (samples && samples.length > 0) {
    const searchRes = alm.evaluateSearchAnomalies(samples);
    if (searchRes.shouldActivateKillSwitch) {
      alm.activateKillSwitch(searchRes.details, 'ALM-23 Search Anomaly Detector', 'ANOMALY_DETECTED');
      alerts.push({
        id: `alt-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        reasonCode: 'ANOMALY_DETECTED',
        message: searchRes.details,
        segment: searchRes.segment,
      });
      return {
        killSwitchActive: true,
        alerts,
        recommendedAction: 'PAUSE_AND_ALERT',
      };
    }
  }

  // 4. Kiểm tra Heartbeat
  if (lastRunTimestamp) {
    const hbRes = alm.checkHeartbeat(lastRunTimestamp);
    if (hbRes.isMissed) {
      alerts.push({
        id: `alt-${Date.now()}-4`,
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        reasonCode: 'HEARTBEAT_MISSED',
        message: hbRes.message,
      });
    }
  }

  return {
    killSwitchActive: false,
    alerts,
    recommendedAction: 'CONTINUE',
  };
}
