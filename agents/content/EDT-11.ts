/**
 * EDT-11: Editor Agent (Content Polishing Engine)
 * Master Spec v3.2 - Section 7 (W3 Content Worker)
 * 
 * Responsibilities:
 * - Polish content for Originality & Information Gain (eliminate filler/clichés).
 * - Enhance Clarity & Readability (sentence flow, paragraph length, active voice).
 * - Maintain Tone & Brand Fit (telecom editorial, professional, trustworthy).
 * - Preserve Fact & Claim Bindings (protect claim tags and primary facts).
 */

export interface ContentDraft {
  id: string;
  title: string;
  content: string;
  jsonLdSchema?: Record<string, unknown>;
  reviewerApproved?: boolean;
  internalDuplicationRisk?: number;
  sourceOverlapRisk?: number;
  hasPromptInjectionFlag?: boolean;
  claimsCount?: number;
}

export interface ContentBrief {
  id?: string;
  primaryQuery?: string;
  answerTarget?: string;
  audience?: string;
  tone?: string;
  riskTier?: 'low' | 'medium' | 'high';
}

export interface BrandToneRules {
  brandName?: string;
  preferredTerms?: Record<string, string>;
  prohibitedHyperboles?: string[];
  toneKeywords?: string[];
  maxSentenceWords?: number;
}

export interface EditorOptions {
  targetTone?: string;
  maxSentenceWords?: number;
  strictBrandRules?: boolean;
  preserveClaimTags?: boolean;
  brandRules?: BrandToneRules;
}

export interface EditorialMetric {
  score: number; // 0.0 to 1.0
  feedback: string[];
}

export interface EditResult {
  contentId: string;
  originalTitle: string;
  polishedTitle: string;
  originalContent: string;
  polishedContent: string;
  originality: EditorialMetric;
  clarity: EditorialMetric;
  tone: EditorialMetric;
  overallScore: number;
  changesApplied: string[];
  preservedClaimCount: number;
}

export const DEFAULT_BRAND_RULES: BrandToneRules = {
  brandName: 'Viettel',
  preferredTerms: {
    'viettel': 'Viettel',
    '4g': '4G',
    '5g': '5G',
    'sim': 'SIM',
    'gb': 'GB',
    'mbps': 'Mbps',
    'sms': 'SMS',
    'cuoc phi': 'cước phí',
    'goi cuoc': 'gói cước',
  },
  prohibitedHyperboles: [
    'rẻ nhất vũ trụ',
    'rẻ nhất thế giới',
    'tốt nhất không đối thủ',
    'đỉnh cao tuyệt đối',
    'bá chủ viễn thông',
    'hoàn hảo 100%',
  ],
  toneKeywords: ['minh bạch', 'chính xác', 'tối ưu', 'tiện lợi', 'chính thức', 'uy tín'],
  maxSentenceWords: 35,
};

const FILLER_PHRASES: string[] = [
  'Như chúng ta đã biết',
  'Có thể thấy rằng',
  'Không thể phủ nhận rằng',
  'Thật vậy',
  'Một trong những',
  'Có một thực tế là',
  'Về cơ bản thì',
  'Hiển nhiên là',
  'Như đã nói ở trên',
  'Có thể nói rằng',
  'Nói một cách khác',
];

export class ContentEditor {
  private options: Required<Omit<EditorOptions, 'brandRules'>> & { brandRules: BrandToneRules };

  constructor(options: EditorOptions = {}) {
    this.options = {
      targetTone: options.targetTone ?? 'clean telecom editorial',
      maxSentenceWords: options.maxSentenceWords ?? 35,
      strictBrandRules: options.strictBrandRules ?? true,
      preserveClaimTags: options.preserveClaimTags ?? true,
      brandRules: {
        ...DEFAULT_BRAND_RULES,
        ...(options.brandRules ?? {}),
        preferredTerms: {
          ...DEFAULT_BRAND_RULES.preferredTerms,
          ...(options.brandRules?.preferredTerms ?? {}),
        },
      },
    };
  }

  /**
   * Main entry point to polish a content draft according to Master Spec v3.2.
   */
  public polish(
    draft: ContentDraft,
    brief?: ContentBrief,
    overrideOptions?: EditorOptions
  ): EditResult {
    const activeOptions = overrideOptions ? { ...this.options, ...overrideOptions } : this.options;
    const originalText = draft.content;
    const originalTitle = draft.title;
    const changes: string[] = [];

    // 1. Protect claim tags / markdown links before transformation
    const { protectedText, claimTags } = this.protectClaimTags(originalText);

    // 2. Polish Title
    const polishedTitle = this.polishTitle(originalTitle, activeOptions.brandRules, changes);

    // 3. Apply Originality, Clarity, and Tone Refinements
    let currentContent = protectedText;

    // 3a. Eliminate filler & cliché corporate phrasing
    const fillerResult = this.removeFillerPhrases(currentContent);
    currentContent = fillerResult.text;
    changes.push(...fillerResult.changes);

    // 3b. Standardize Brand Naming and terms
    const brandResult = this.standardizeTerms(currentContent, activeOptions.brandRules);
    currentContent = brandResult.text;
    changes.push(...brandResult.changes);

    // 3c. Remove baseless hyperboles
    const hyperboleResult = this.removeHyperboles(currentContent, activeOptions.brandRules);
    currentContent = hyperboleResult.text;
    changes.push(...hyperboleResult.changes);

    // 3d. Ensure Answer-First paragraph structure alignment
    if (brief?.answerTarget) {
      const answerFirstResult = this.ensureAnswerFirstStructure(currentContent, brief.answerTarget);
      currentContent = answerFirstResult.text;
      changes.push(...answerFirstResult.changes);
    }

    // 3e. Refine sentence readability and split oversized sentences
    const clarityRefineResult = this.refineSentenceReadability(currentContent, activeOptions.maxSentenceWords);
    currentContent = clarityRefineResult.text;
    changes.push(...clarityRefineResult.changes);

    // 4. Restore protected claim tags / markers
    const restoredContent = this.restoreClaimTags(currentContent, claimTags);

    // 5. Evaluate Metrics (Originality, Clarity, Tone)
    const originality = this.evaluateOriginality(restoredContent, originalText);
    const clarity = this.evaluateClarity(restoredContent, activeOptions.maxSentenceWords);
    const tone = this.evaluateTone(restoredContent, activeOptions.brandRules);

    const overallScore = parseFloat(
      (0.4 * originality.score + 0.35 * clarity.score + 0.25 * tone.score).toFixed(4)
    );

    return {
      contentId: draft.id,
      originalTitle,
      polishedTitle,
      originalContent: originalText,
      polishedContent: restoredContent,
      originality,
      clarity,
      tone,
      overallScore,
      changesApplied: Array.from(new Set(changes)),
      preservedClaimCount: claimTags.length,
    };
  }

  /**
   * Title polishing: Ensures clarity, correct brand casing, and removes fluff.
   */
  private polishTitle(title: string, rules: BrandToneRules, changes: string[]): string {
    let newTitle = title.trim();

    // Standardize brand in title
    for (const [raw, preferred] of Object.entries(rules.preferredTerms ?? {})) {
      const regex = new RegExp(`\\b${this.escapeRegExp(raw)}\\b`, 'gi');
      if (regex.test(newTitle) && !newTitle.includes(preferred)) {
        newTitle = newTitle.replace(regex, preferred);
        changes.push(`Title brand term standardized: "${raw}" -> "${preferred}"`);
      }
    }

    // Remove leading punctuation or unnecessary filler in titles
    if (/^(Hướng dẫn|Chia sẻ|Bật mí|Tổng hợp)\s*:\s*/i.test(newTitle)) {
      const cleaned = newTitle.replace(/^(Hướng dẫn|Chia sẻ|Bật mí|Tổng hợp)\s*:\s*/i, '');
      if (cleaned.length >= 10) {
        changes.push(`Title streamlined by removing filler prefix.`);
        newTitle = cleaned;
      }
    }

    return newTitle;
  }

  /**
   * Protect claim tags (`⟦VERIFIED_CLAIM:...⟧` or `[claim_...]` or `[fact_...]`) from string edits.
   */
  private protectClaimTags(text: string): { protectedText: string; claimTags: string[] } {
    const claimTags: string[] = [];
    const claimRegex = /(⟦VERIFIED_CLAIM:[^⟧]+⟧|\[(?:claim|fact)_[a-zA-Z0-9_\-]+\])/g;

    const protectedText = text.replace(claimRegex, (match) => {
      const index = claimTags.length;
      claimTags.push(match);
      return `__CLAIM_TAG_${index}__`;
    });

    return { protectedText, claimTags };
  }

  /**
   * Restore protected claim tags.
   */
  private restoreClaimTags(text: string, claimTags: string[]): string {
    let restored = text;
    claimTags.forEach((tag, index) => {
      restored = restored.replace(new RegExp(`__CLAIM_TAG_${index}__`, 'g'), tag);
    });
    return restored;
  }

  /**
   * Remove cliché filler phrases to boost Originality & Information Density.
   */
  private removeFillerPhrases(text: string): { text: string; changes: string[] } {
    let updated = text;
    const changes: string[] = [];

    FILLER_PHRASES.forEach((phrase) => {
      const regex = new RegExp(`\\b${this.escapeRegExp(phrase)},?\\s*`, 'gi');
      if (regex.test(updated)) {
        updated = updated.replace(regex, '');
        changes.push(`Removed filler phrase: "${phrase}"`);
      }
    });

    // Fix double spaces or orphaned commas caused by removal
    updated = updated.replace(/\s{2,}/g, ' ').replace(/,\s*,/g, ',');

    return { text: updated, changes };
  }

  /**
   * Standardize brand terms according to BrandToneRules.
   */
  private standardizeTerms(text: string, rules: BrandToneRules): { text: string; changes: string[] } {
    let updated = text;
    const changes: string[] = [];

    for (const [raw, preferred] of Object.entries(rules.preferredTerms ?? {})) {
      const regex = new RegExp(`\\b${this.escapeRegExp(raw)}\\b`, 'g');
      if (regex.test(updated)) {
        updated = updated.replace(regex, preferred);
        changes.push(`Standardized term: "${raw}" -> "${preferred}"`);
      }
    }

    return { text: updated, changes };
  }

  /**
   * Remove unverified hyperboles to maintain editorial tone and credibility.
   */
  private removeHyperboles(text: string, rules: BrandToneRules): { text: string; changes: string[] } {
    let updated = text;
    const changes: string[] = [];

    (rules.prohibitedHyperboles ?? []).forEach((hyperbole) => {
      const regex = new RegExp(`\\b${this.escapeRegExp(hyperbole)}\\b`, 'gi');
      if (regex.test(updated)) {
        updated = updated.replace(regex, 'tối ưu');
        changes.push(`Replaced prohibited hyperbole "${hyperbole}" with factual descriptor.`);
      }
    });

    return { text: updated, changes };
  }

  /**
   * Ensure Answer-First paragraph structure is present and formatted cleanly.
   */
  private ensureAnswerFirstStructure(text: string, answerTarget: string): { text: string; changes: string[] } {
    const changes: string[] = [];
    let updated = text;

    if (!answerTarget || answerTarget.trim().length === 0) {
      return { text: updated, changes };
    }

    const openingSnippet = updated.slice(0, 300).toLowerCase();
    const isAnswerFirstPresent = openingSnippet.includes(answerTarget.toLowerCase().slice(0, 30));

    if (!isAnswerFirstPresent) {
      const calloutBlock = `> **Tóm tắt nhanh:** ${answerTarget.trim()}\n\n`;
      updated = calloutBlock + updated;
      changes.push(`Enhanced Answer-First structure by adding structured summary callout block.`);
    }

    return { text: updated, changes };
  }

  /**
   * Refine sentence length & readability.
   */
  private refineSentenceReadability(text: string, maxWords: number): { text: string; changes: string[] } {
    const changes: string[] = [];
    const paragraphs = text.split(/\n\n+/);

    const refinedParagraphs = paragraphs.map((paragraph) => {
      if (paragraph.startsWith('#') || paragraph.startsWith('>') || paragraph.startsWith('-') || paragraph.startsWith('*')) {
        return paragraph;
      }

      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      const outputSentences: string[] = [];

      sentences.forEach((sentence) => {
        const words = sentence.trim().split(/\s+/);
        if (words.length > maxWords && sentence.includes(' và ') && !sentence.includes('__CLAIM_TAG_')) {
          const splitIndex = sentence.indexOf(' và ');
          if (splitIndex > 20) {
            const part1 = sentence.slice(0, splitIndex).trim();
            const part2 = sentence.slice(splitIndex + 4).trim();
            const capitalizedPart2 = part2.charAt(0).toUpperCase() + part2.slice(1);
            outputSentences.push(`${part1}.`, capitalizedPart2);
            changes.push(`Split oversized sentence (${words.length} words) for clarity.`);
            return;
          }
        }
        outputSentences.push(sentence);
      });

      return outputSentences.join(' ');
    });

    return { text: refinedParagraphs.join('\n\n'), changes };
  }

  /**
   * Evaluate Originality Score.
   */
  public evaluateOriginality(content: string, originalContent?: string): EditorialMetric {
    const feedback: string[] = [];
    let score = 0.85;

    let fillerCount = 0;
    FILLER_PHRASES.forEach((phrase) => {
      if (new RegExp(`\\b${this.escapeRegExp(phrase)}\\b`, 'gi').test(content)) {
        fillerCount++;
      }
    });

    if (fillerCount > 0) {
      score -= fillerCount * 0.05;
      feedback.push(`Detected ${fillerCount} remaining cliché filler phrases.`);
    } else {
      feedback.push(`Originality verified: No cliché filler phrases detected.`);
    }

    const hasCallouts = content.includes('>') || content.includes('**');
    const hasBulletLists = content.includes('\n- ') || content.includes('\n* ');

    if (hasCallouts && hasBulletLists) {
      score += 0.05;
      feedback.push(`Strong information layout with visual callouts and list structures.`);
    }

    return {
      score: Math.min(1.0, Math.max(0.0, parseFloat(score.toFixed(4)))),
      feedback,
    };
  }

  /**
   * Evaluate Clarity Score.
   */
  public evaluateClarity(content: string, maxWords: number = 35): EditorialMetric {
    const feedback: string[] = [];
    let score = 0.88;

    const sentences = content
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('#') && !s.startsWith('>'));

    if (sentences.length === 0) {
      return { score: 1.0, feedback: ['Empty content evaluated.'] };
    }

    let longSentences = 0;
    sentences.forEach((s) => {
      const words = s.split(/\s+/).length;
      if (words > maxWords) {
        longSentences++;
      }
    });

    if (longSentences > 0) {
      const penalty = (longSentences / sentences.length) * 0.3;
      score -= penalty;
      feedback.push(`${longSentences} sentences exceed readability threshold of ${maxWords} words.`);
    } else {
      feedback.push(`Sentence length optimal across all ${sentences.length} sentences.`);
    }

    const startsWithAnswer = content.startsWith('>') || content.startsWith('#') || content.slice(0, 200).includes('**Tóm tắt');
    if (startsWithAnswer) {
      score += 0.05;
      feedback.push(`Answer-first structure present at paragraph start.`);
    }

    return {
      score: Math.min(1.0, Math.max(0.0, parseFloat(score.toFixed(4)))),
      feedback,
    };
  }

  /**
   * Evaluate Tone & Brand Fit Score.
   */
  public evaluateTone(content: string, rules: BrandToneRules = DEFAULT_BRAND_RULES): EditorialMetric {
    const feedback: string[] = [];
    let score = 0.85;

    let hyperboleCount = 0;
    (rules.prohibitedHyperboles ?? []).forEach((hyperbole) => {
      if (new RegExp(`\\b${this.escapeRegExp(hyperbole)}\\b`, 'gi').test(content)) {
        hyperboleCount++;
      }
    });

    if (hyperboleCount > 0) {
      score -= hyperboleCount * 0.1;
      feedback.push(`Found ${hyperboleCount} prohibited hyperbole terms violating brand guidelines.`);
    } else {
      feedback.push(`Tone compliant: No prohibited hyperboles found.`);
    }

    let keywordHits = 0;
    (rules.toneKeywords ?? []).forEach((kw) => {
      if (new RegExp(`\\b${this.escapeRegExp(kw)}\\b`, 'gi').test(content)) {
        keywordHits++;
      }
    });

    if (keywordHits >= 2) {
      score += 0.05;
      feedback.push(`Tone reflects key brand values (${keywordHits} tone keywords present).`);
    }

    return {
      score: Math.min(1.0, Math.max(0.0, parseFloat(score.toFixed(4)))),
      feedback,
    };
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Standalone helper function to run Editor EDT-11 on a ContentDraft.
 */
export function runEditor(
  draft: ContentDraft,
  brief?: ContentBrief,
  options?: EditorOptions
): EditResult {
  const editor = new ContentEditor(options);
  return editor.polish(draft, brief, options);
}
