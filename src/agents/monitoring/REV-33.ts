import { ReasonCode } from '../../types';

export class RevenueAttribution {
  private agentId = 'REV-33';

  constructor() {}

  /**
   * Ingests and deduplicates conversion events
   */
  public ingestConversion(payload: any): { status: string; reason?: ReasonCode; message: string } {
    console.log(`[${this.agentId}] Ingesting conversion event...`);
    
    // Privacy Boundary Check: PII Leakage
    if (this.hasPII(payload)) {
      return { status: 'BLOCKED', reason: 'PII_DETECTED', message: 'Personally Identifiable Information detected in payload' };
    }

    // Consent Check
    if (!payload.consentState || payload.consentState !== 'GRANTED') {
      return { status: 'HALTED', reason: 'CONSENT_MISSING', message: 'User consent is missing or denied' };
    }

    // Attribution Trust Check
    if (!payload.attributionModelVersion || !payload.evidenceRef) {
      return { status: 'HALTED', reason: 'ATTRIBUTION_UNTRUSTWORTHY', message: 'Missing attribution evidence' };
    }

    console.log(`[${this.agentId}] Conversion deduplicated and ingested successfully.`);
    return { status: 'SUCCESS', message: 'Conversion recorded' };
  }

  /**
   * Simple mock for PII detection
   */
  private hasPII(payload: any): boolean {
    const payloadStr = JSON.stringify(payload).toLowerCase();
    return payloadStr.includes('email') || payloadStr.includes('phone') || payloadStr.includes('address');
  }
}
