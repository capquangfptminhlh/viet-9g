import { describe, expect, it } from 'vitest';
import { decideBloggerPublication, type AutomationPolicy } from '../../packages/policy-engine/automation-policy';

const policy: AutomationPolicy = {
  policyVersion: '2026-08-03',
  automationMode: 'full_auto',
  publishPolicy: {
    killSwitchActive: false,
    conditionalAutoRiskTiers: ['low'],
    fullAutoRiskTiers: ['low', 'medium'],
  },
};

describe('Blogger automation policy', () => {
  it('allows a fact-verified medium-risk review only in full_auto mode', () => {
    expect(decideBloggerPublication(policy, { intent: 'review', hasVerifiedFacts: true })).toEqual({ allowed: true, riskTier: 'medium', reason: 'POLICY_PASS' });
    expect(decideBloggerPublication({ ...policy, automationMode: 'conditional_auto' }, { intent: 'review', hasVerifiedFacts: true })).toMatchObject({ allowed: false, reason: 'RISK_TIER_REQUIRES_REVIEW' });
  });

  it('rejects an active kill switch and any high-risk topic', () => {
    expect(decideBloggerPublication({ ...policy, publishPolicy: { ...policy.publishPolicy, killSwitchActive: true } }, { intent: 'informational', hasVerifiedFacts: true })).toMatchObject({ allowed: false, reason: 'KILL_SWITCH_ACTIVE' });
    expect(decideBloggerPublication(policy, { intent: 'informational', riskTier: 'high', hasVerifiedFacts: true })).toMatchObject({ allowed: false, reason: 'RISK_TIER_REQUIRES_REVIEW' });
  });

  it('never lets medium-risk content publish without verified facts', () => {
    expect(decideBloggerPublication(policy, { intent: 'review', hasVerifiedFacts: false })).toMatchObject({ allowed: false, reason: 'VERIFIED_FACTS_REQUIRED' });
  });
});
