/**
 * RFR-24: Refresh Manager (Update / Merge / Prune Proposals)
 * Master Spec v3.2 - Section 7, 8, 5.1, 9.2, 11.4, 19.2
 * 
 * Trách nhiệm:
 * 1. Đánh giá Content Decay (suy giảm lượt hiển thị/truy cập theo thời gian).
 * 2. Đánh giá Hạn dùng Fact (xác định các bài có fact hết hạn expiresAt / reviewByDate).
 * 3. Đánh giá Intent Cannibalization (phát hiện trùng lặp intent để đề xuất MERGE_URLS).
 * 4. Tạo đề xuất Prune an toàn: TUYỆT ĐỐI KHÔNG tự xóa/prune URL có traffic, backlinks, hoặc conversion (Section 19.2).
 * 5. Xuất danh sách Refresh Proposal làm input cho weekly workflow / PR review.
 */

export type RefreshDecisionType = 'UPDATE_EXISTING' | 'MERGE_URLS' | 'PRUNE_PROPOSAL' | 'NO_ACTION';

export interface FactRecord {
  factId: string;
  statement: string;
  effectiveAt: string;
  expiresAt?: string;
  reviewByDate?: string;
  ownerRole?: string;
}

export interface ContentInventoryItem {
  contentId: string;
  url: string;
  slug: string;
  title: string;
  primaryQuery: string;
  publishedAt: string;
  updatedAt: string;
  factIds: string[];
  metrics: {
    impressions30d: number;
    clicks30d: number;
    backlinksCount: number;
    conversions30d: number;
    decayPct?: number; // Ví dụ: 0.35 tức là giảm 35% lượt hiển thị
  };
  isProtected?: boolean; // URL quan trọng, trang chủ, landing page chiến lược
}

export interface RefreshProposal {
  proposalId: string;
  contentId: string;
  url: string;
  decision: RefreshDecisionType;
  reasonCodes: string[];
  priorityScore: number; // 0.0 -> 1.0
  targetMergeUrl?: string;
  suggestedRedirectUrl?: string;
  expiredFactIds?: string[];
  description: string;
  requiresHumanApproval: boolean;
}

export interface RefreshManagerOptions {
  decayThresholdPct?: number; // Mặc định 0.30 (giảm 30%)
  staleDaysThreshold?: number; // Mặc định 90 ngày chưa update
  similarityThreshold?: number; // Mặc định 0.85 cho cannibalization
}

export class RefreshManager {
  private decayThresholdPct: number;
  private staleDaysThreshold: number;
  private similarityThreshold: number;

  constructor(options: RefreshManagerOptions = {}) {
    this.decayThresholdPct = options.decayThresholdPct ?? 0.30;
    this.staleDaysThreshold = options.staleDaysThreshold ?? 90;
    this.similarityThreshold = options.similarityThreshold ?? 0.85;
  }

  /**
   * Đánh giá 1 bài viết để đưa ra quyết định Refresh (Update / Merge / Prune / No Action)
   */
  public evaluateItem(
    item: ContentInventoryItem,
    facts: FactRecord[],
    allInventoryItems: ContentInventoryItem[] = [],
    nowDate: Date = new Date()
  ): RefreshProposal {
    const reasonCodes: string[] = [];
    const nowTime = nowDate.getTime();

    // 1. Kiểm tra Fact Hết hạn (Section 5.1 Lifecycle)
    const expiredFactIds: string[] = [];
    for (const factId of item.factIds) {
      const fact = facts.find((f) => f.factId === factId);
      if (fact) {
        if (fact.expiresAt && new Date(fact.expiresAt).getTime() < nowTime) {
          expiredFactIds.push(factId);
        } else if (fact.reviewByDate && new Date(fact.reviewByDate).getTime() < nowTime) {
          expiredFactIds.push(factId);
        }
      }
    }

    if (expiredFactIds.length > 0) {
      reasonCodes.push('EXPIRED_FACT', 'FACT_REVIEW_OVERDUE');
      return {
        proposalId: `prop-${item.contentId}-${Date.now()}`,
        contentId: item.contentId,
        url: item.url,
        decision: 'UPDATE_EXISTING',
        reasonCodes,
        priorityScore: 0.90,
        expiredFactIds,
        description: `Đề xuất UPDATE bài viết vì chứa ${expiredFactIds.length} fact đã hết hạn hoặc quá hạn kiểm duyệt.`,
        requiresHumanApproval: false,
      };
    }

    // 2. Kiểm tra Intent Cannibalization (Merge proposal)
    const cannibalizingCandidate = this.findCannibalizingPair(item, allInventoryItems);
    if (cannibalizingCandidate) {
      reasonCodes.push('DUPLICATE_INTENT', 'MERGE_URLS');
      return {
        proposalId: `prop-${item.contentId}-${Date.now()}`,
        contentId: item.contentId,
        url: item.url,
        decision: 'MERGE_URLS',
        reasonCodes,
        priorityScore: 0.85,
        targetMergeUrl: cannibalizingCandidate.url,
        suggestedRedirectUrl: cannibalizingCandidate.url,
        description: `Đề xuất MERGE bài viết vào URL chính [${cannibalizingCandidate.url}] do trùng lặp intent.`,
        requiresHumanApproval: true,
      };
    }

    // 3. Kiểm tra Content Decay (Update proposal)
    const daysSinceUpdate = (nowTime - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    const decayPct = item.metrics.decayPct ?? 0;

    if (decayPct >= this.decayThresholdPct || daysSinceUpdate >= this.staleDaysThreshold) {
      if (item.metrics.impressions30d > 0 || item.metrics.clicks30d > 0) {
        reasonCodes.push('CONTENT_DECAY', 'FRESHNESS_NEED');
        const score = Math.min(0.80, 0.4 * (decayPct / 0.5) + 0.4 * (daysSinceUpdate / 180));
        return {
          proposalId: `prop-${item.contentId}-${Date.now()}`,
          contentId: item.contentId,
          url: item.url,
          decision: 'UPDATE_EXISTING',
          reasonCodes,
          priorityScore: parseFloat(score.toFixed(2)),
          description: `Đề xuất UPDATE do suy giảm traffic (${(decayPct * 100).toFixed(1)}%) hoặc nội dung cũ (${Math.floor(daysSinceUpdate)} ngày).`,
          requiresHumanApproval: false,
        };
      }
    }

    // 4. Kiểm tra Prune Proposal (RÀNG BUỘC CỨNG Section 19.2)
    // TUYỆT ĐỐI KHÔNG tự xóa/prune URL có traffic, backlinks, hoặc conversion!
    const isValuableUrl =
      item.metrics.clicks30d > 0 ||
      item.metrics.impressions30d > 50 ||
      item.metrics.backlinksCount > 0 ||
      item.metrics.conversions30d > 0 ||
      item.isProtected === true;

    if (!isValuableUrl && daysSinceUpdate > 180) {
      reasonCodes.push('ZERO_TRAFFIC_STALE', 'PRUNE_PROPOSAL');
      return {
        proposalId: `prop-${item.contentId}-${Date.now()}`,
        contentId: item.contentId,
        url: item.url,
        decision: 'PRUNE_PROPOSAL',
        reasonCodes,
        priorityScore: 0.40,
        description: `Đề xuất PRUNE URL [${item.url}] (0 traffic, 0 backlinks, 0 conversion, >180 ngày cũ).`,
        requiresHumanApproval: true, // Luôn luôn cần con người duyệt PRUNE
      };
    }

    // Mặc định: Không làm gì
    return {
      proposalId: `prop-${item.contentId}-${Date.now()}`,
      contentId: item.contentId,
      url: item.url,
      decision: 'NO_ACTION',
      reasonCodes: ['CONTENT_FRESH_NO_ACTION'],
      priorityScore: 0.0,
      description: 'Nội dung vẫn tươi mới và hoạt động tốt. Không cần can thiệp.',
      requiresHumanApproval: false,
    };
  }

  /**
   * Tạo danh sách proposal cho toàn bộ Content Inventory
   */
  public generateProposals(
    inventory: ContentInventoryItem[],
    facts: FactRecord[],
    nowDate: Date = new Date()
  ): RefreshProposal[] {
    const proposals: RefreshProposal[] = [];

    for (const item of inventory) {
      const proposal = this.evaluateItem(item, facts, inventory, nowDate);
      if (proposal.decision !== 'NO_ACTION') {
        proposals.push(proposal);
      }
    }

    // Sắp xếp đề xuất theo priorityScore giảm dần
    proposals.sort((a, b) => b.priorityScore - a.priorityScore);
    return proposals;
  }

  /**
   * Tìm cặp bài viết có nguy cơ trùng intent (Cannibalization)
   */
  private findCannibalizingPair(
    item: ContentInventoryItem,
    allInventory: ContentInventoryItem[]
  ): ContentInventoryItem | null {
    for (const other of allInventory) {
      if (other.contentId === item.contentId) continue;

      // Nếu có cùng primaryQuery hoặc intent tương đồng
      const sameQuery = other.primaryQuery.toLowerCase().trim() === item.primaryQuery.toLowerCase().trim();
      if (sameQuery) {
        // Trả về bài có traffic/clicks cao hơn làm target merge
        if (other.metrics.clicks30d >= item.metrics.clicks30d && other.metrics.impressions30d >= item.metrics.impressions30d) {
          return other;
        }
      }
    }
    return null;
  }
}

/**
 * Helper function để thực thi Refresh Analysis nhanh cho Weekly Job
 */
export function runRefreshManagerAnalysis(
  inventory: ContentInventoryItem[],
  facts: FactRecord[],
  options?: RefreshManagerOptions
): {
  totalAnalyzed: number;
  proposals: RefreshProposal[];
  summary: {
    updateCount: number;
    mergeCount: number;
    pruneCount: number;
  };
} {
  const manager = new RefreshManager(options);
  const proposals = manager.generateProposals(inventory, facts);

  const summary = {
    updateCount: proposals.filter((p) => p.decision === 'UPDATE_EXISTING').length,
    mergeCount: proposals.filter((p) => p.decision === 'MERGE_URLS').length,
    pruneCount: proposals.filter((p) => p.decision === 'PRUNE_PROPOSAL').length,
  };

  return {
    totalAnalyzed: inventory.length,
    proposals,
    summary,
  };
}
