/**
 * BRF-8: Brief Builder Agent
 * Master Spec v3.2 - Section 10.1 (Content Brief Contract) & Section 13.1 (Risk Tier Engine)
 */

export type DecisionType = 'CREATE_NEW' | 'UPDATE' | 'EXPAND' | 'MERGE' | 'REDIRECT' | 'NO_ACTION';
export type RiskTier = 'low' | 'medium' | 'high';

export interface RequiredClaimSpec {
  claimId: string;
  factIds: string[];
  required: boolean;
}

export interface CTAConfig {
  type: string;
  message: string;
}

export interface ContentBrief {
  schemaVersion: string;
  contentId: string;
  candidateId: string;
  decision: DecisionType;
  primaryQuery: string;
  intent: string;
  audience: string;
  businessGoal: string;
  answerTarget: string;
  requiredSections: string[];
  requiredClaims: RequiredClaimSpec[];
  internalLinkTargets: string[];
  schemaTypes: string[];
  cta: CTAConfig;
  imageBriefIds: string[];
  authorId: string;
  riskTier: RiskTier;
}

export interface CandidateData {
  candidateId: string;
  primaryQuery: string;
  intent?: string;
  audience?: string;
  businessGoal?: string;
  decision?: DecisionType;
  riskTier?: RiskTier;
  isYMYL?: boolean;
  hasPricing?: boolean;
  hasPromotions?: boolean;
}

export interface FactData {
  factId: string;
  statement?: string;
  isRequired?: boolean;
}

export interface BriefBuilderInput {
  candidate: CandidateData;
  facts?: FactData[];
  answerTarget?: string;
  requiredSections?: string[];
  internalLinkTargets?: string[];
  schemaTypes?: string[];
  cta?: CTAConfig;
  imageBriefIds?: string[];
  authorId?: string;
  customContentId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class BriefBuilder {
  private defaultAuthorId: string;

  constructor(defaultAuthorId = 'auth_viettel_telecom') {
    this.defaultAuthorId = defaultAuthorId;
  }

  /**
   * Evaluates deterministic Risk Tier according to MASTER_SPEC Section 13.1
   */
  public determineRiskTier(candidate: CandidateData): RiskTier {
    if (candidate.isYMYL) {
      return 'high';
    }
    if (candidate.hasPricing || candidate.hasPromotions) {
      return 'medium';
    }
    return candidate.riskTier ?? 'low';
  }

  /**
   * Generates a unique content ID following pattern ^cnt_[a-zA-Z0-9_-]+$
   */
  public generateContentId(candidateId: string): string {
    const cleanId = candidateId.replace(/^cand_/, '');
    const timestamp = Date.now().toString(36);
    return `cnt_${cleanId}_${timestamp}`;
  }

  /**
   * Generates a default answer-first target text if not provided
   */
  private buildDefaultAnswerTarget(candidate: CandidateData): string {
    const query = candidate.primaryQuery;
    return `Thông tin chi tiết và hướng dẫn đầy đủ về "${query}". Bài viết cung cấp câu trả lời chính xác, thông số cập nhật và các bước thực hiện nhanh chóng theo quy định chính thức.`;
  }

  /**
   * Generates default required sections based on intent
   */
  private buildDefaultSections(intent: string, query: string): string[] {
    if (intent === 'transactional' || intent === 'commercial_investigation') {
      return [
        `Tổng quan gói cước / dịch vụ ${query}`,
        'Ưu đãi & Chi tiết thông số',
        'Cú pháp đăng ký & Điều kiện áp dụng',
        'Các lưu ý khi sử dụng & Hủy dịch vụ'
      ];
    }
    return [
      `Giới thiệu về ${query}`,
      'Nội dung chi tiết & Bằng chứng kiểm chứng',
      'Hướng dẫn thực hiện từng bước',
      'Giải đáp thắc mắc thường gặp (FAQ)'
    ];
  }

  /**
   * Builds a structured ContentBrief compliant with schema 10.1
   */
  public buildBrief(input: BriefBuilderInput): ContentBrief {
    const { candidate, facts = [], customContentId } = input;

    const contentId = customContentId || this.generateContentId(candidate.candidateId);
    const riskTier = this.determineRiskTier(candidate);

    // Map input facts to required claims
    const requiredClaims: RequiredClaimSpec[] = facts.map((fact, index) => ({
      claimId: `clm_${(index + 1).toString().padStart(3, '0')}`,
      factIds: [fact.factId],
      required: fact.isRequired ?? true
    }));

    const intent = candidate.intent || 'commercial_investigation';
    const primaryQuery = candidate.primaryQuery;
    const answerTarget = input.answerTarget || this.buildDefaultAnswerTarget(candidate);
    const requiredSections = input.requiredSections && input.requiredSections.length > 0
      ? input.requiredSections
      : this.buildDefaultSections(intent, primaryQuery);

    const schemaTypes = input.schemaTypes && input.schemaTypes.length > 0
      ? input.schemaTypes
      : ['Article', 'BreadcrumbList'];

    const cta: CTAConfig = input.cta || {
      type: 'register_button',
      message: `Đăng ký ngay ${primaryQuery} để nhận ưu đãi mới nhất.`
    };

    const imageBriefIds = input.imageBriefIds || [
      `imgbrief_${contentId}_cover`
    ];

    return {
      schemaVersion: '1.0',
      contentId,
      candidateId: candidate.candidateId,
      decision: candidate.decision || 'CREATE_NEW',
      primaryQuery,
      intent,
      audience: candidate.audience || 'Người dùng smartphone tại VN',
      businessGoal: candidate.businessGoal || 'generate_lead',
      answerTarget,
      requiredSections,
      requiredClaims,
      internalLinkTargets: input.internalLinkTargets || [],
      schemaTypes,
      cta,
      imageBriefIds,
      authorId: input.authorId || this.defaultAuthorId,
      riskTier
    };
  }

  /**
   * Validates ContentBrief against Schema 10.1 constraints
   */
  public validateBrief(brief: ContentBrief): ValidationResult {
    const errors: string[] = [];

    if (brief.schemaVersion !== '1.0') {
      errors.push(`Invalid schemaVersion: expected "1.0", got "${brief.schemaVersion}"`);
    }

    if (!/^cnt_[a-zA-Z0-9_-]+$/.test(brief.contentId)) {
      errors.push(`Invalid contentId format: "${brief.contentId}" must match ^cnt_[a-zA-Z0-9_-]+$`);
    }

    if (!/^cand_[a-zA-Z0-9_-]+$/.test(brief.candidateId)) {
      errors.push(`Invalid candidateId format: "${brief.candidateId}" must match ^cand_[a-zA-Z0-9_-]+$`);
    }

    const validDecisions: DecisionType[] = ['CREATE_NEW', 'UPDATE', 'EXPAND', 'MERGE', 'REDIRECT', 'NO_ACTION'];
    if (!validDecisions.includes(brief.decision)) {
      errors.push(`Invalid decision: "${brief.decision}"`);
    }

    if (!brief.primaryQuery || brief.primaryQuery.trim() === '') {
      errors.push('primaryQuery is required and cannot be empty');
    }

    if (!brief.answerTarget || brief.answerTarget.trim() === '') {
      errors.push('answerTarget is required and cannot be empty');
    }

    if (!Array.isArray(brief.requiredClaims)) {
      errors.push('requiredClaims must be an array');
    }

    const validRiskTiers: RiskTier[] = ['low', 'medium', 'high'];
    if (!validRiskTiers.includes(brief.riskTier)) {
      errors.push(`Invalid riskTier: "${brief.riskTier}"`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Convenience helper function to create a content brief
 */
export function buildContentBrief(input: BriefBuilderInput, defaultAuthorId?: string): ContentBrief {
  const builder = new BriefBuilder(defaultAuthorId);
  return builder.buildBrief(input);
}
