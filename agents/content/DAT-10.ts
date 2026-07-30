/**
 * DAT-10: Claim Binder
 * Master Spec v3.2 - Section 7 & Section 11.2
 * Trách nhiệm: Trích xuất (Extract) và liên kết (Bind) claims vào fact/source IDs.
 */

export interface FactItem {
  id: string;
  sourceId?: string;
  statement: string;
  entity?: string;
  attribute?: string;
  value?: string | number;
  effectiveAt?: string;
  expiresAt?: string;
  hasContradiction?: boolean;
  isContradictionResolved?: boolean;
}

export interface SourceItem {
  id: string;
  url?: string;
  title?: string;
  retrievedAt?: string;
  sha256?: string;
}

export interface ExtractedClaim {
  id: string;
  text: string;
  factId?: string;
  sourceId?: string;
  isBound: boolean;
  isLabeledInference: boolean;
  isQuantitative: boolean;
  effectiveAt?: string;
  expiresAt?: string;
  hasContradiction?: boolean;
  isContradictionResolved?: boolean;
  confidence?: number;
}

export interface ClaimBindingResult {
  claims: ExtractedClaim[];
  totalClaims: number;
  boundClaimsCount: number;
  labeledInferenceCount: number;
  unboundClaimsCount: number;
  evidenceCoverage: number;
  quantitativeCoverage: number;
}

export interface ClaimBinderOptions {
  inferenceKeywords?: string[];
  minConfidenceThreshold?: number;
}

export class ClaimBinder {
  private inferenceKeywords: string[];
  private minConfidenceThreshold: number;

  constructor(options: ClaimBinderOptions = {}) {
    this.inferenceKeywords = options.inferenceKeywords ?? [
      'theo phân tích',
      'ước tính',
      'dự đoán',
      'đánh giá',
      'cho thấy',
      'có thể',
      'theo suy luận',
      'dự kiến',
      'nhận định'
    ];
    this.minConfidenceThreshold = options.minConfidenceThreshold ?? 0.6;
  }

  /**
   * Trích xuất các claim từ nội dung văn bản (sentence-level parsing + pattern recognition).
   */
  public extractClaims(content: string): ExtractedClaim[] {
    if (!content || content.trim().length === 0) {
      return [];
    }

    // Tách câu từ nội dung HTML/Markdown
    const cleanText = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/#+\s+/g, '')
      .replace(/[*_~`]/g, '');

    const sentences = cleanText
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const claims: ExtractedClaim[] = [];
    let claimCounter = 1;

    for (const sentence of sentences) {
      const isQuantitative = this.checkIsQuantitative(sentence);
      const isLabeledInference = this.checkIsLabeledInference(sentence);

      // Nếu câu chứa con số, thông tin gói cước, chính sách hoặc từ khóa suy luận -> coi là claim
      if (isQuantitative || isLabeledInference || this.containsFactualKeywords(sentence)) {
        const id = `clm_${String(claimCounter++).padStart(3, '0')}`;
        claims.push({
          id,
          text: sentence,
          isBound: false,
          isLabeledInference,
          isQuantitative,
          confidence: 1.0,
        });
      }
    }

    return claims;
  }

  /**
   * Bind danh sách claim vào danh sách Fact & Source trong Fact Ledger.
   */
  public bindClaims(
    claims: ExtractedClaim[],
    facts: FactItem[],
    sources: SourceItem[] = []
  ): ExtractedClaim[] {
    const sourceMap = new Map<string, SourceItem>();
    sources.forEach((s) => sourceMap.set(s.id, s));

    return claims.map((claim) => {
      const matchedFact = this.findMatchingFact(claim.text, facts);

      if (matchedFact) {
        return {
          ...claim,
          factId: matchedFact.id,
          sourceId: matchedFact.sourceId,
          isBound: true,
          effectiveAt: matchedFact.effectiveAt,
          expiresAt: matchedFact.expiresAt,
          hasContradiction: matchedFact.hasContradiction,
          isContradictionResolved: matchedFact.isContradictionResolved,
        };
      }

      return {
        ...claim,
        isBound: false,
      };
    });
  }

  /**
   * Trích xuất và Bind claim trong một quy trình thống nhất.
   */
  public process(
    content: string,
    facts: FactItem[],
    sources: SourceItem[] = []
  ): ClaimBindingResult {
    const extracted = this.extractClaims(content);
    const boundClaims = this.bindClaims(extracted, facts, sources);

    const totalClaims = boundClaims.length;
    const boundClaimsCount = boundClaims.filter((c) => c.isBound).length;
    const labeledInferenceCount = boundClaims.filter((c) => c.isLabeledInference).length;
    const unboundClaimsCount = boundClaims.filter((c) => !c.isBound && !c.isLabeledInference).length;

    const boundOrLabeledCount = boundClaims.filter((c) => c.isBound || c.isLabeledInference).length;
    const evidenceCoverage = totalClaims > 0 ? parseFloat((boundOrLabeledCount / totalClaims).toFixed(4)) : 1.0;

    const quantClaims = boundClaims.filter((c) => c.isQuantitative);
    const quantBoundOrLabeled = quantClaims.filter((c) => c.isBound || c.isLabeledInference).length;
    const quantitativeCoverage = quantClaims.length > 0 ? parseFloat((quantBoundOrLabeled / quantClaims.length).toFixed(4)) : 1.0;

    return {
      claims: boundClaims,
      totalClaims,
      boundClaimsCount,
      labeledInferenceCount,
      unboundClaimsCount,
      evidenceCoverage,
      quantitativeCoverage,
    };
  }

  private checkIsQuantitative(sentence: string): boolean {
    const quantRegex = /(\b\d+([.,]\d+)?\s*(GB|MB|TB|đ|VND|đồng|k|phút|ngày|tháng|năm|h)\b|\b\d{1,3}(\.\d{3})+\b)/i;
    return quantRegex.test(sentence);
  }

  private checkIsLabeledInference(sentence: string): boolean {
    const lower = sentence.toLowerCase();
    return this.inferenceKeywords.some((kw) => lower.includes(kw));
  }

  private containsFactualKeywords(sentence: string): boolean {
    const factualRegex = /(gói cước|viettel|cú pháp|đăng ký|miễn phí|ưu đãi|tốc độ|hạn dùng|so sánh|giá cước|soạn)/i;
    return factualRegex.test(sentence);
  }

  private findMatchingFact(claimText: string, facts: FactItem[]): FactItem | undefined {
    const claimLower = claimText.toLowerCase();

    for (const fact of facts) {
      // 1. Khớp chính xác theo statement hoặc value
      if (fact.statement && claimLower.includes(fact.statement.toLowerCase())) {
        return fact;
      }

      // 2. Khớp theo entity & attribute / value
      if (fact.entity && fact.value !== undefined) {
        const entityLower = fact.entity.toLowerCase();
        const valueStr = String(fact.value).toLowerCase();
        if (claimLower.includes(entityLower) && claimLower.includes(valueStr)) {
          return fact;
        }
      }
    }

    return undefined;
  }
}

export function extractAndBindClaims(
  content: string,
  facts: FactItem[],
  sources?: SourceItem[],
  options?: ClaimBinderOptions
): ClaimBindingResult {
  const binder = new ClaimBinder(options);
  return binder.process(content, facts, sources);
}
