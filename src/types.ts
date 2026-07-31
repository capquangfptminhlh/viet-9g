export interface CallBenefits {
  internal?: string; // e.g., "Miễn phí cuộc gọi nội mạng dưới 10 phút"
  external?: string; // e.g., "50 phút gọi ngoại mạng"
}

export type PackageCategory = 'hot' | 'data' | 'social' | 'combo' | 'long_term';

export interface TelecomPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  dataLimit: string;
  dataPerDay: string;
  calls?: CallBenefits;
  social?: string[]; // e.g. ['youtube', 'tiktok', 'facebook']
  category: PackageCategory;
  description: string;
  benefits: string[];
  rules: string[];
  popular?: boolean;
}

export interface AgentConfig {
  agentCode: string; // The affiliate ID, e.g., "GA" or "DA"
  supportPhone: string; // e.g., "0981.234.567"
  zaloLink: string; // e.g., "https://zalo.me/0981234567"
  agentName: string; // e.g., "Đại Lý Cước Viettel Online"
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ==========================================
// MASTER_SPEC v3.2.1 Additions
// ==========================================

export type ReasonCode = 
  | 'ATTRIBUTION_UNTRUSTWORTHY'
  | 'CONSENT_MISSING'
  | 'PII_DETECTED'
  | 'UNAUTHORIZED_PROFILE_CHANGE'
  | 'LOCAL_DOORWAY_RISK'
  | 'FAKE_ENGAGEMENT_RISK'
  | 'EXPERIMENT_INCONCLUSIVE'
  | 'BASELINE_MISSING'
  | 'GUARDRAIL_REGRESSION'
  | 'CAPACITY_CONSTRAINED'
  | 'UPDATE_FACT_REQUIRED'
  | 'UNREALISTIC_RESULT_CLAIM'
  // Existing reason codes from v3.2 could be added here
  | 'CREATE_NEW' | 'UPDATE_EXISTING' | 'MERGE_URLS' | 'NO_ACTION' | 'BLOCK';

export interface Entity {
  entityId: string;
  name: string;
  entityType: 'Organization' | 'Person' | 'Product' | 'Service' | 'Place';
  status: 'active' | 'inactive';
  owner: string;
  effectiveFrom: string; // ISO date
  evidenceIds: string[];
  sourceOfTruth: string;
  lastVerifiedAt: string; // ISO date
  expiresAt?: string; // ISO date
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  
  // Local/Maps specific fields
  legalName?: string;
  address?: string;
  phone?: string;
  hours?: string;
  serviceArea?: string;
  primaryCategory?: string;
  officialProfileUrls?: string[];
  sameAsOwnership?: boolean;
}

export interface ExperimentRecord {
  experimentId: string;
  hypothesis: string;
  targetAudience: string;
  targetUrls: string[];
  primaryMetric: string;
  guardrailMetrics: string[];
  baselineWindow: string; // e.g., '14d'
  minimumObservationWindow: string; // e.g., '7d'
  stopRules: string[];
  owner: string;
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  rollbackPlan: string;
  verdict?: 'RETAIN' | 'ROLLBACK' | 'INCONCLUSIVE';
}
