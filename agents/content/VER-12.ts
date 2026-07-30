/**
 * VER-12: Verification Gate (2-Tier Verification Engine)
 * Master Spec v3.2 - Section 11
 */

export type VerificationStatus = 'PASS' | 'NEEDS_REVIEW' | 'BLOCK';

export interface RequiredClaim {
  claimId: string;
  factIds: string[];
  required: boolean;
}

export interface ContentBrief {
  id: string;
  requiredClaims?: RequiredClaim[];
  answerTarget?: string;
  riskTier?: 'low' | 'medium' | 'high';
  isYMYL?: boolean;
  intentUrl?: string;
}

export interface ExtractedClaim {
  id: string;
  text: string;
  factId?: string;
  isBound: boolean;
  isLabeledInference: boolean;
  isQuantitative: boolean;
  expiresAt?: string;
  effectiveAt?: string;
  hasContradiction?: boolean;
  isContradictionResolved?: boolean;
}

export interface ContentDraft {
  id: string;
  title: string;
  content: string;
  jsonLdSchema?: Record<string, unknown>;
  reviewerApproved?: boolean;
  internalDuplicationRisk?: number;
  sourceOverlapRisk?: number;
  hasPromptInjectionFlag?: boolean;
}

export interface SoftScores {
  originality: number;
  clarity: number;
  answerFirst: number;
  brandFit: number;
  totalScore: number;
}

export interface VerificationOptions {
  autoThreshold?: number;
  reviewThreshold?: number;
  evidenceCoverageThresholdQuantitative?: number;
  evidenceCoverageThresholdTotal?: number;
}

export interface VerificationResult {
  status: VerificationStatus;
  hardBlockers: string[];
  softScores: SoftScores;
  evidenceCoverage: number;
  reasonCodes: string[];
}

export class VerificationGate {
  private autoThreshold: number;
  private reviewThreshold: number;
  private coverageThresholdQuant: number;
  private coverageThresholdTotal: number;

  constructor(options: VerificationOptions = {}) {
    this.autoThreshold = options.autoThreshold ?? 0.78;
    this.reviewThreshold = options.reviewThreshold ?? 0.60;
    this.coverageThresholdQuant = options.evidenceCoverageThresholdQuantitative ?? 1.0;
    this.coverageThresholdTotal = options.evidenceCoverageThresholdTotal ?? 0.9;
  }

  public runVerification(
    draft: ContentDraft,
    brief: ContentBrief,
    claims: ExtractedClaim[]
  ): VerificationResult {
    const hardBlockers: string[] = [];
    const reasonCodes: string[] = [];

    // 1. Hard Blockers Check (Tier 1)

    // Check required claims binding
    if (brief.requiredClaims && brief.requiredClaims.length > 0) {
      for (const req of brief.requiredClaims) {
        if (req.required) {
          const bound = claims.find((c) => c.id === req.claimId && c.isBound);
          if (!bound) {
            hardBlockers.push(`UNBOUND_REQUIRED_CLAIM:${req.claimId}`);
          }
        }
      }
    }

    // Check draft claim bindings & inference labels
    for (const claim of claims) {
      if (!claim.isBound && !claim.isLabeledInference) {
        hardBlockers.push(`UNBOUND_CLAIM:${claim.id}`);
      }

      // Check fact dates
      if (!claim.effectiveAt) {
        hardBlockers.push(`MISSING_EFFECTIVE_DATE:${claim.id}`);
      }
      if (claim.expiresAt && new Date(claim.expiresAt).getTime() < Date.now()) {
        hardBlockers.push(`EXPIRED_FACT:${claim.id}`);
      }

      // Check primary source contradiction
      if (claim.hasContradiction && !claim.isContradictionResolved) {
        hardBlockers.push(`UNRESOLVED_CONTRADICTION:${claim.id}`);
      }
    }

    // Evidence coverage calculation (11.2)
    const boundOrLabeledCount = claims.filter((c) => c.isBound || c.isLabeledInference).length;
    const totalClaims = claims.length;
    const evidenceCoverage = totalClaims > 0 ? boundOrLabeledCount / totalClaims : 1.0;

    const quantClaims = claims.filter((c) => c.isQuantitative);
    const quantBoundCount = quantClaims.filter((c) => c.isBound || c.isLabeledInference).length;
    const quantCoverage = quantClaims.length > 0 ? quantBoundCount / quantClaims.length : 1.0;

    if (quantCoverage < this.coverageThresholdQuant) {
      hardBlockers.push('QUANTITATIVE_EVIDENCE_COVERAGE_FAILED');
    }
    if (evidenceCoverage < this.coverageThresholdTotal) {
      hardBlockers.push('TOTAL_EVIDENCE_COVERAGE_FAILED');
    }

    // Check duplication risks (11.4)
    if ((draft.internalDuplicationRisk ?? 0) >= 0.85) {
      hardBlockers.push('DUPLICATE_INTENT');
    }
    if ((draft.sourceOverlapRisk ?? 0) >= 0.30) {
      hardBlockers.push('HIGH_SOURCE_OVERLAP');
    }

    // Check YMYL / High Tier reviewer approval
    const isHighRisk = brief.isYMYL || brief.riskTier === 'high';
    if (isHighRisk && !draft.reviewerApproved) {
      hardBlockers.push('MISSING_REVIEWER_APPROVAL');
    }

    // Check Secret / PII exposure
    if (this.detectSecretsOrPii(draft.content)) {
      hardBlockers.push('SECRET_OR_PII_DETECTED');
    }

    // Check prompt injection flag
    if (draft.hasPromptInjectionFlag) {
      hardBlockers.push('PROMPT_INJECTION_SUSPECTED');
    }

    // 2. Soft Scores Check (Tier 2 - Mocked LLM Scoring)
    const softScores = this.evaluateSoftScores(draft, brief);

    // 3. Final Decision
    let status: VerificationStatus;
    if (hardBlockers.length > 0) {
      status = 'BLOCK';
      reasonCodes.push(...hardBlockers);
    } else if (softScores.totalScore >= this.autoThreshold) {
      status = 'PASS';
      reasonCodes.push('ALL_CHECKS_PASSED');
    } else if (softScores.totalScore >= this.reviewThreshold) {
      status = 'NEEDS_REVIEW';
      reasonCodes.push('LOW_SOFT_SCORE_NEEDS_REVIEW');
    } else {
      status = 'BLOCK';
      reasonCodes.push('LOW_QUALITY');
    }

    return {
      status,
      hardBlockers,
      softScores,
      evidenceCoverage,
      reasonCodes,
    };
  }

  private detectSecretsOrPii(content: string): boolean {
    const piiOrSecretRegex = /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|bearer\s+[a-zA-Z0-9_\-\.]+|\b\d{3}-\d{2}-\d{4}\b)/i;
    return piiOrSecretRegex.test(content);
  }

  private evaluateSoftScores(draft: ContentDraft, brief: ContentBrief): SoftScores {
    // Stub implementation of LLM evaluation for Tier 2 soft scores
    const originality = 0.85;
    const clarity = 0.80;
    const answerFirst = brief.answerTarget && draft.content.includes(brief.answerTarget) ? 0.90 : 0.70;
    const brandFit = 0.85;

    // softScore = 0.35*originality + 0.30*clarity + 0.20*answerFirst + 0.15*brandFit
    const totalScore = parseFloat(
      (0.35 * originality + 0.30 * clarity + 0.20 * answerFirst + 0.15 * brandFit).toFixed(4)
    );

    return {
      originality,
      clarity,
      answerFirst,
      brandFit,
      totalScore,
    };
  }
}

export function runVerification(
  draft: ContentDraft,
  brief: ContentBrief,
  claims: ExtractedClaim[],
  options?: VerificationOptions
): VerificationResult {
  const gate = new VerificationGate(options);
  return gate.runVerification(draft, brief, claims);
}
