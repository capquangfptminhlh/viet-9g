export type AutomationMode = 'dry_run' | 'review_required' | 'conditional_auto' | 'full_auto';
export type RiskTier = 'low' | 'medium' | 'high';

export type AutomationPolicy = {
  policyVersion: string;
  automationMode: AutomationMode;
  publishPolicy: {
    killSwitchActive: boolean;
    conditionalAutoRiskTiers: RiskTier[];
    fullAutoRiskTiers: RiskTier[];
  };
};

export type PublicationPolicyInput = {
  intent: string;
  packageId?: string;
  riskTier?: RiskTier;
  hasVerifiedFacts: boolean;
};

export type PublicationPolicyDecision = {
  allowed: boolean;
  riskTier: RiskTier;
  reason: 'POLICY_PASS' | 'KILL_SWITCH_ACTIVE' | 'AUTOMATION_MODE_REQUIRES_REVIEW' | 'RISK_TIER_REQUIRES_REVIEW' | 'VERIFIED_FACTS_REQUIRED';
};

function inferRiskTier(input: PublicationPolicyInput): RiskTier {
  if (input.riskTier) return input.riskTier;
  if (input.packageId || input.intent === 'review') return 'medium';
  return 'low';
}

export function decideBloggerPublication(policy: AutomationPolicy, input: PublicationPolicyInput): PublicationPolicyDecision {
  const riskTier = inferRiskTier(input);
  if (policy.publishPolicy.killSwitchActive) return { allowed: false, riskTier, reason: 'KILL_SWITCH_ACTIVE' };
  if (policy.automationMode === 'dry_run' || policy.automationMode === 'review_required') {
    return { allowed: false, riskTier, reason: 'AUTOMATION_MODE_REQUIRES_REVIEW' };
  }
  const permittedRiskTiers = policy.automationMode === 'conditional_auto'
    ? policy.publishPolicy.conditionalAutoRiskTiers
    : policy.publishPolicy.fullAutoRiskTiers;
  if (!permittedRiskTiers.includes(riskTier)) return { allowed: false, riskTier, reason: 'RISK_TIER_REQUIRES_REVIEW' };
  if (riskTier !== 'low' && !input.hasVerifiedFacts) return { allowed: false, riskTier, reason: 'VERIFIED_FACTS_REQUIRED' };
  return { allowed: true, riskTier, reason: 'POLICY_PASS' };
}
