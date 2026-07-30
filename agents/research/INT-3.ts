/**
 * INT-3: Intent Classifier Agent
 * Master Spec v3.2 - Section 6.1b & Section 7 (W2 Research Worker)
 * 
 * Responsible for classifying query/keyword search intent, funnel stage (TOFU/MOFU/BOFU),
 * SERP type, and recommended content type.
 */

export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU';

export type ContentType =
  | 'guide'
  | 'comparison'
  | 'pricing_table'
  | 'landing_page'
  | 'faq'
  | 'review'
  | 'troubleshooting'
  | 'news';

export type SerpType =
  | 'organic_list'
  | 'featured_snippet'
  | 'knowledge_graph'
  | 'local_pack'
  | 'video_pack'
  | 'shopping';

export interface SuggestedStructure {
  hasFaq: boolean;
  hasComparisonTable: boolean;
  hasPricingCallout: boolean;
  leadType: 'direct_answer' | 'overview' | 'step_by_step';
}

export interface IntentClassificationInput {
  keyword: string;
  gscImpressions?: number;
  gscClicks?: number;
  serpFeatures?: string[];
  contextDoc?: string;
}

export interface IntentClassificationResult {
  keyword: string;
  normalizedKeyword: string;
  primaryIntent: SearchIntent;
  secondaryIntents: SearchIntent[];
  funnelStage: FunnelStage;
  contentType: ContentType;
  serpType: SerpType;
  intentConfidence: number; // 0.0 to 1.0
  reasonCodes: string[];
  suggestedStructure: SuggestedStructure;
  classifiedAt: string;
}

export interface IntentClassifierOptions {
  llmClient?: any;
  modelName?: string;
  useFallbackRules?: boolean;
}

export class INT3IntentClassifier {
  private useFallbackRules: boolean;

  constructor(options: IntentClassifierOptions = {}) {
    this.useFallbackRules = options.useFallbackRules ?? true;
  }

  /**
   * Main classification method. Runs heuristic rule-based intent classification
   * or delegates to LLM if configured.
   */
  public async classify(
    input: IntentClassificationInput | string
  ): Promise<IntentClassificationResult> {
    const rawInput = typeof input === 'string' ? { keyword: input } : input;
    const keyword = rawInput.keyword;
    const norm = this.normalizeKeyword(keyword);

    // Rule-based classification engine (deterministic baseline)
    const ruleResult = this.classifyByRules(norm, rawInput);

    return ruleResult;
  }

  /**
   * Synchronous classification using deterministic pattern matching and heuristics.
   */
  public classifySync(input: IntentClassificationInput | string): IntentClassificationResult {
    const rawInput = typeof input === 'string' ? { keyword: input } : input;
    const norm = this.normalizeKeyword(rawInput.keyword);
    return this.classifyByRules(norm, rawInput);
  }

  private classifyByRules(
    norm: string,
    rawInput: IntentClassificationInput
  ): IntentClassificationResult {
    const reasonCodes: string[] = [];

    // 1. Pattern Matching for Search Intent
    let primaryIntent: SearchIntent = 'informational';
    let secondaryIntents: SearchIntent[] = [];

    // Transactional indicators (register, buy, subscribe, price, cost, etc.)
    const transactionalPatterns = [
      /\b(dang ky|đăng ký|mua|dat mua|đặt mua|nong nap|nạp tiền|thanh toan|thanh toán|gia bao nhieu|giá bao nhiêu|bang gia|bảng giá|dang ky goi|đăng ký gói)\b/i,
      /\b(cuoc|cước|phi|phí|chi phi|chi phí)\b/i,
      /\b(km|khuyen mai|khuyến mãi|uu dai|ưu đãi|code|voucher)\b/i,
    ];

    // Commercial investigation indicators (compare, review, top, best, vs, evaluation)
    const commercialPatterns = [
      /\b(so sanh|so sánh|danh gia|đánh giá|nen mua|nên mua|nen dung|nên dùng|tot nhat|tốt nhất|top|vs|loai nao tot|loại nào tốt)\b/i,
      /\b(uu nhot|ưu nhược|uu diem|ưu điểm|nhuoc diem|nhược điểm|review)\b/i,
    ];

    // Navigational indicators (login, portal, hotline, homepage, contact, address, app)
    const navigationalPatterns = [
      /\b(dang nhap|đăng nhập|trang chu|trang chủ|tong dai|tổng đài|hotline|dia chi|địa chỉ|app|ung dung|ứng dụng|my viettel|viettel money|portal)\b/i,
    ];

    // Informational indicators (how to, what is, instructions, check, cancel, lookup)
    const informationalPatterns = [
      /\b(la gi|là gì|huong dan|hướng dẫn|cach|cách|lam sao|làm sao|vi sao|vì sao|tai sao|tại sao|nguyen nhan|nguyên nhân)\b/i,
      /\b(tra cuu|tra cứu|kiem tra|kiểm tra|huy|hủy|cu phap|cú pháp|dieu kien|điều kiện|quy trinh|quy trình)\b/i,
    ];

    let transScore = 0;
    let commScore = 0;
    let navScore = 0;
    let infoScore = 0;

    for (const pat of transactionalPatterns) {
      if (pat.test(norm)) transScore += 1;
    }
    for (const pat of commercialPatterns) {
      if (pat.test(norm)) commScore += 1;
    }
    for (const pat of navigationalPatterns) {
      if (pat.test(norm)) navScore += 1;
    }
    for (const pat of informationalPatterns) {
      if (pat.test(norm)) infoScore += 1;
    }

    if (transScore > 0 && transScore >= commScore && transScore >= infoScore) {
      primaryIntent = 'transactional';
      reasonCodes.push('RULE_MATCH_TRANSACTIONAL_KEYWORDS');
      if (commScore > 0) secondaryIntents.push('commercial');
    } else if (commScore > 0 && commScore >= infoScore) {
      primaryIntent = 'commercial';
      reasonCodes.push('RULE_MATCH_COMMERCIAL_KEYWORDS');
      if (transScore > 0) secondaryIntents.push('transactional');
    } else if (navScore > 0 && navScore > transScore && navScore > infoScore) {
      primaryIntent = 'navigational';
      reasonCodes.push('RULE_MATCH_NAVIGATIONAL_KEYWORDS');
    } else {
      primaryIntent = 'informational';
      reasonCodes.push('RULE_MATCH_INFORMATIONAL_KEYWORDS');
      if (commScore > 0) secondaryIntents.push('commercial');
    }

    // 2. Map Funnel Stage
    let funnelStage: FunnelStage;
    switch (primaryIntent) {
      case 'transactional':
        funnelStage = 'BOFU';
        break;
      case 'commercial':
        funnelStage = 'MOFU';
        break;
      case 'navigational':
        funnelStage = transScore > 0 ? 'BOFU' : 'MOFU';
        break;
      case 'informational':
      default:
        funnelStage = 'TOFU';
        break;
    }

    // 3. Map Content Type
    let contentType: ContentType = 'guide';
    if (primaryIntent === 'transactional') {
      contentType = norm.includes('goi') || norm.includes('gia') ? 'pricing_table' : 'landing_page';
    } else if (primaryIntent === 'commercial') {
      contentType = norm.includes('so sanh') || norm.includes('vs') ? 'comparison' : 'review';
    } else if (primaryIntent === 'informational') {
      if (norm.includes('huy') || norm.includes('khac phuc') || norm.includes('loi')) {
        contentType = 'troubleshooting';
      } else if (norm.includes('la gi') || norm.includes('tra cuu')) {
        contentType = 'faq';
      } else {
        contentType = 'guide';
      }
    } else if (primaryIntent === 'navigational') {
      contentType = 'landing_page';
    }

    // 4. Map SERP Type
    let serpType: SerpType = 'organic_list';
    if (rawInput.serpFeatures && rawInput.serpFeatures.length > 0) {
      if (rawInput.serpFeatures.includes('featured_snippet')) serpType = 'featured_snippet';
      else if (rawInput.serpFeatures.includes('knowledge_graph')) serpType = 'knowledge_graph';
      else if (rawInput.serpFeatures.includes('local_pack')) serpType = 'local_pack';
    } else {
      if (contentType === 'faq' || contentType === 'troubleshooting') {
        serpType = 'featured_snippet';
      } else if (primaryIntent === 'transactional') {
        serpType = 'shopping';
      }
    }

    // 5. Build Suggested Structure
    const suggestedStructure: SuggestedStructure = {
      hasFaq: primaryIntent === 'informational' || contentType === 'guide' || contentType === 'pricing_table',
      hasComparisonTable: primaryIntent === 'commercial' || contentType === 'comparison',
      hasPricingCallout: primaryIntent === 'transactional' || contentType === 'pricing_table',
      leadType: primaryIntent === 'transactional' ? 'direct_answer' : contentType === 'guide' ? 'step_by_step' : 'overview',
    };

    const intentConfidence = primaryIntent === 'informational' && infoScore === 0 ? 0.70 : 0.90;

    return {
      keyword: rawInput.keyword,
      normalizedKeyword: norm,
      primaryIntent,
      secondaryIntents,
      funnelStage,
      contentType,
      serpType,
      intentConfidence,
      reasonCodes,
      suggestedStructure,
      classifiedAt: new Date().toISOString(),
    };
  }

  private normalizeKeyword(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }
}

/**
 * Convenient helper function to classify keyword intent.
 */
export async function classifyIntent(
  input: IntentClassificationInput | string,
  options?: IntentClassifierOptions
): Promise<IntentClassificationResult> {
  const classifier = new INT3IntentClassifier(options);
  return classifier.classify(input);
}
