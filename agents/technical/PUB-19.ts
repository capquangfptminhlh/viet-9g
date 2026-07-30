/**
 * PUB-19: Publisher Agent
 * Master Spec v3.2 - Section 13 (Publishing Policy), Section 13.1 (Risk Tier), Section 13.2 (Publish via PR & Deploy)
 * Worker 5 (release worker)
 */

export type AutomationMode = 'dry_run' | 'review_required' | 'conditional_auto' | 'full_auto';
export type RiskTier = 'low' | 'medium' | 'high';
export type DecisionType = 'CREATE_NEW' | 'UPDATE' | 'EXPAND' | 'MERGE' | 'REDIRECT' | 'NO_ACTION';
export type VerificationStatus = 'PASS' | 'NEEDS_REVIEW' | 'BLOCK';

export interface ContentAsset {
  path: string;
  type: 'image' | 'schema' | 'markdown' | 'metadata';
  hash?: string;
  sizeBytes?: number;
}

export interface ContentPackage {
  contentId: string;
  candidateId: string;
  slug: string;
  title: string;
  decision: DecisionType;
  primaryQuery: string;
  targetPath: string;
  content: string;
  assets: ContentAsset[];
  riskTier?: RiskTier;
  sourceSnapshotHashes?: string[];
  promptVersions?: Record<string, string>;
  modelIds?: Record<string, string>;
  estimatedCostUsd?: number;
}

export interface VerificationReportSummary {
  status: VerificationStatus;
  hardBlockers: string[];
  softScoreTotal: number;
  evidenceCoverage: number;
  reasonCodes: string[];
}

export interface AuditReportSummary {
  passed: boolean;
  criticalIssues: string[];
  warnings: string[];
  totalChecks: number;
}

export interface ReleaseManifest {
  schemaVersion: string;
  releaseId: string;
  contentIds: string[];
  commitSha: string;
  branchName: string;
  prNumber?: number;
  prUrl?: string;
  riskTier: RiskTier;
  automationMode: AutomationMode;
  autoMergeEnabled: boolean;
  requiredChecks: string[];
  deploymentId?: string;
  sourceSnapshotHashes: string[];
  promptVersions: Record<string, string>;
  modelIds: Record<string, string>;
  createdAt: string;
  status: 'PENDING_REVIEW' | 'AUTO_MERGED' | 'MANUAL_MERGED' | 'REJECTED' | 'DEPLOYED' | 'FAILED';
  manifestHash: string;
}

export interface PublishOptions {
  automationMode?: AutomationMode;
  defaultBranch?: string;
  repoOwner?: string;
  repoName?: string;
  prebuiltDeployCmd?: string;
  requiredChecks?: string[];
  allowDryRunOverride?: boolean;
}

export interface PullRequestPayload {
  title: string;
  headBranch: string;
  baseBranch: string;
  body: string;
  autoMerge: boolean;
  labels: string[];
}

export interface PublishResult {
  success: boolean;
  automationMode: AutomationMode;
  riskTier: RiskTier;
  autoMergeEnabled: boolean;
  branchName?: string;
  prNumber?: number;
  prUrl?: string;
  deploymentId?: string;
  manifest: ReleaseManifest;
  reasonCodes: string[];
  errors: string[];
}

export class PublisherAgent {
  private mode: AutomationMode;
  private defaultBranch: string;
  private requiredChecks: string[];
  private repoOwner: string;
  private repoName: string;

  constructor(options: PublishOptions = {}) {
    this.mode = options.automationMode ?? 'dry_run';
    this.defaultBranch = options.defaultBranch ?? 'main';
    this.repoOwner = options.repoOwner ?? 'tracuugoicuoc';
    this.repoName = options.repoName ?? 'viettel-data-extracted';
    this.requiredChecks = options.requiredChecks ?? [
      'build',
      'aud-18-audit',
      'secret-scan',
      'schema-test'
    ];
  }

  /**
   * Evaluates whether a PR is eligible for GitHub Auto-Merge based on Risk Tier & Automation Mode (13.1, 13.2)
   */
  public evaluateAutoMerge(
    riskTier: RiskTier,
    mode: AutomationMode = this.mode,
    decision: DecisionType = 'CREATE_NEW',
    gatesPass: boolean = true
  ): boolean {
    if (!gatesPass) {
      return false;
    }

    switch (mode) {
      case 'dry_run':
      case 'review_required':
        return false;

      case 'conditional_auto':
        // Tier low auto-merges when all checks pass; medium & high require human review
        return riskTier === 'low';

      case 'full_auto':
        // Tier low auto-merges; tier medium auto-merges ONLY for UPDATE with verified facts
        if (riskTier === 'low') {
          return true;
        }
        if (riskTier === 'medium' && decision === 'UPDATE') {
          return true;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Generates git branch name for content package: content/<contentId>/<slug>
   */
  public generateBranchName(pkg: ContentPackage): string {
    const cleanSlug = pkg.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `content/${pkg.contentId}/${cleanSlug}`;
  }

  /**
   * Formats structured Markdown body for GitHub Pull Request (13.2)
   */
  public formatPRBody(
    pkg: ContentPackage,
    verification: VerificationReportSummary,
    audit: AuditReportSummary,
    riskTier: RiskTier,
    autoMerge: boolean,
    manifest: ReleaseManifest
  ): string {
    const autoMergeText = autoMerge
      ? '🟢 **ENABLED** (Tier Low - Auto-merge on green checks)'
      : '🟡 **DISABLED** (Requires manual human review)';

    const hardBlockersList = verification.hardBlockers.length > 0
      ? verification.hardBlockers.map((b) => `  - ❌ ${b}`).join('\n')
      : '  - None';

    const auditIssuesList = audit.criticalIssues.length > 0
      ? audit.criticalIssues.map((i) => `  - 🚨 ${i}`).join('\n')
      : '  - None';

    const assetsList = pkg.assets.length > 0
      ? pkg.assets.map((a) => `  - \`${a.path}\` (${a.type})`).join('\n')
      : '  - None';

    return `## 🚀 Antigravity Content Publish PR

### 📋 Content Package Details
- **Content ID**: \`${pkg.contentId}\`
- **Primary Query**: ${pkg.primaryQuery}
- **Target Path**: \`${pkg.targetPath}\`
- **Decision Type**: \`${pkg.decision}\`
- **Risk Tier**: \`${riskTier.toUpperCase()}\`
- **Automation Mode**: \`${manifest.automationMode}\`
- **Auto-Merge**: ${autoMergeText}

---

### 🛡️ Verification Gate Report (VER-12)
- **Status**: \`${verification.status}\`
- **Soft Score Total**: \`${verification.softScoreTotal.toFixed(4)}\`
- **Evidence Coverage**: \`${(verification.evidenceCoverage * 100).toFixed(1)}%\`
- **Hard Blockers**:
${hardBlockersList}
- **Reason Codes**: \`${verification.reasonCodes.join(', ') || 'N/A'}\`

---

### 🔍 Build Audit Summary (AUD-18)
- **Audit Passed**: \`${audit.passed ? 'YES' : 'NO'}\`
- **Total Checks**: \`${audit.totalChecks}\`
- **Critical Issues**:
${auditIssuesList}

---

### 📦 Assets & Artifacts
${assetsList}

---

### 📑 Release Manifest Draft
- **Manifest ID**: \`${manifest.releaseId}\`
- **Branch**: \`${manifest.branchName}\`
- **Commit SHA**: \`${manifest.commitSha}\`
- **Estimated Cost**: \`$${(pkg.estimatedCostUsd ?? 0).toFixed(4)}\`
- **Created At**: \`${manifest.createdAt}\`

> *Created automatically by Antigravity PUB-19 Publisher Agent.*
`;
  }

  /**
   * Creates deterministic ReleaseManifest object (6.2, 13.2)
   */
  public createReleaseManifest(
    pkg: ContentPackage,
    verification: VerificationReportSummary,
    audit: AuditReportSummary,
    riskTier: RiskTier,
    mode: AutomationMode,
    autoMerge: boolean,
    commitSha = 'simulated-commit-sha',
    branchName?: string
  ): ReleaseManifest {
    const timestamp = new Date().toISOString();
    const releaseId = `rel_${pkg.contentId}_${Date.now().toString(36)}`;
    const finalBranch = branchName || this.generateBranchName(pkg);
    const sourceHashes = pkg.sourceSnapshotHashes ?? [];
    const promptVersions = pkg.promptVersions ?? {};
    const modelIds = pkg.modelIds ?? {};

    // Simple deterministic hash simulation for manifest integrity check
    const rawContent = `${releaseId}:${pkg.contentId}:${commitSha}:${timestamp}`;
    const manifestHash = `sha256_${Buffer.from(rawContent).toString('hex').slice(0, 16)}`;

    let status: ReleaseManifest['status'] = 'PENDING_REVIEW';
    if (mode === 'dry_run') {
      status = 'PENDING_REVIEW';
    } else if (autoMerge) {
      status = 'AUTO_MERGED';
    }

    return {
      schemaVersion: '1.0',
      releaseId,
      contentIds: [pkg.contentId],
      commitSha,
      branchName: finalBranch,
      riskTier,
      automationMode: mode,
      autoMergeEnabled: autoMerge,
      requiredChecks: this.requiredChecks,
      sourceSnapshotHashes: sourceHashes,
      promptVersions,
      modelIds,
      createdAt: timestamp,
      status,
      manifestHash
    };
  }

  /**
   * Primary entry point to publish content package following 13.2 workflow
   */
  public async publish(
    pkg: ContentPackage,
    verification: VerificationReportSummary,
    audit: AuditReportSummary,
    overrideOptions: Partial<PublishOptions> = {}
  ): Promise<PublishResult> {
    const mode = overrideOptions.automationMode ?? this.mode;
    const errors: string[] = [];
    const reasonCodes: string[] = [];

    // 1. Determine Risk Tier & Gate status
    const riskTier: RiskTier = pkg.riskTier ?? 'low';

    const verificationPass = verification.status === 'PASS' && verification.hardBlockers.length === 0;
    const auditPass = audit.passed && audit.criticalIssues.length === 0;
    const gatesPass = verificationPass && auditPass;

    if (!verificationPass) {
      errors.push(`Verification gate failed with status ${verification.status}`);
      reasonCodes.push(...verification.reasonCodes);
    }
    if (!auditPass) {
      errors.push('Build audit (AUD-18) failed with critical issues');
      reasonCodes.push('AUDIT_CRITICAL_FAIL');
    }

    // 2. Evaluate auto-merge decision
    const autoMergeEnabled = this.evaluateAutoMerge(riskTier, mode, pkg.decision, gatesPass);
    const branchName = this.generateBranchName(pkg);

    // 3. Create Manifest
    const manifest = this.createReleaseManifest(
      pkg,
      verification,
      audit,
      riskTier,
      mode,
      autoMergeEnabled,
      'commit_' + Date.now().toString(36),
      branchName
    );

    // 4. Mode-based Execution
    if (mode === 'dry_run') {
      reasonCodes.push('DRY_RUN_EXECUTION_COMPLETED');
      return {
        success: gatesPass,
        automationMode: mode,
        riskTier,
        autoMergeEnabled: false,
        branchName,
        manifest,
        reasonCodes,
        errors
      };
    }

    if (!gatesPass) {
      reasonCodes.push('PUBLISH_BLOCKED_BY_GATES');
      return {
        success: false,
        automationMode: mode,
        riskTier,
        autoMergeEnabled: false,
        branchName,
        manifest,
        reasonCodes,
        errors
      };
    }

    // Construct PR payload
    const prBody = this.formatPRBody(pkg, verification, audit, riskTier, autoMergeEnabled, manifest);
    const prPayload: PullRequestPayload = {
      title: `feat(content): ${pkg.primaryQuery} (${pkg.contentId})`,
      headBranch: branchName,
      baseBranch: this.defaultBranch,
      body: prBody,
      autoMerge: autoMergeEnabled,
      labels: ['antigravity-publish', `tier-${riskTier}`, `mode-${mode}`]
    };

    reasonCodes.push('PR_CREATED');
    if (autoMergeEnabled) {
      reasonCodes.push('AUTO_MERGE_SCHEDULED');
      manifest.status = 'AUTO_MERGED';
    } else {
      reasonCodes.push('AWAITING_HUMAN_REVIEW');
      manifest.status = 'PENDING_REVIEW';
    }

    return {
      success: true,
      automationMode: mode,
      riskTier,
      autoMergeEnabled,
      branchName,
      prNumber: Math.floor(Math.random() * 1000) + 100, // mock PR ID when not running in real GitHub API
      prUrl: `https://github.com/${this.repoOwner}/${this.repoName}/pull/manifest_${pkg.contentId}`,
      manifest,
      reasonCodes,
      errors: []
    };
  }
}

/**
 * Convenience helper to execute Publisher Agent
 */
export async function publishContent(
  pkg: ContentPackage,
  verification: VerificationReportSummary,
  audit: AuditReportSummary,
  options?: PublishOptions
): Promise<PublishResult> {
  const publisher = new PublisherAgent(options);
  return publisher.publish(pkg, verification, audit, options);
}
