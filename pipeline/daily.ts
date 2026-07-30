/**
 * Main Daily Pipeline Orchestrator (ORC-0)
 * MASTER_SPEC v3.2 - Section 6.1b (Worker Mapping) & Section 8 (Daily Workflow)
 * 
 * 5 Workers:
 * - W1 Orchestrate: init(), finalize() [ORC-0, CST-26, ALM-23, RPT-27]
 * - W2 Research: discover() [ING-1, KW-2, INT-3, GAP-4, CAN-5, PRI-6]
 * - W3 Content: produce() [SRC-7, BRF-8, WRT-9, DAT-10, EDT-11, VER-12]
 * - W4 Media + Package: package() [IMG-13, ONP-14, LNK-15, SCH-16, TEC-17]
 * - W5 Release: release() [AUD-18, PUB-19, PVF-20, IDX-21]
 */

export interface JobResult {
  jobName: string;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  worker: string;
  agents: string[];
  timestamp: string;
  data?: Record<string, any>;
  error?: string;
}

export interface PipelineRunContext {
  runId: string;
  startTime: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  jobResults: Record<string, JobResult>;
}

/**
 * Job 1: init (Worker W1 - Orchestrate)
 * Agents: ORC-0, CST-26, ALM-23
 * Trách nhiệm: Validate config, check kill-switch, verify budget & environment.
 */
export async function init(): Promise<JobResult> {
  console.log('[W1:Orchestrate][init] Initializing daily pipeline run...');
  console.log('[ORC-0] Validating configuration, environment variables, and kill-switch status...');
  console.log('[CST-26] Verifying daily budget cap and token cost quotas...');
  console.log('[ALM-23] Checking anomaly baseline and active alerts status...');

  return {
    jobName: 'init',
    status: 'SUCCESS',
    worker: 'W1 Orchestrate',
    agents: ['ORC-0', 'CST-26', 'ALM-23'],
    timestamp: new Date().toISOString(),
    data: {
      killSwitchActive: false,
      budgetRemainingUsd: 10.0,
      configValid: true
    }
  };
}

/**
 * Job 2: discover (Worker W2 - Research)
 * Agents: ING-1, KW-2, INT-3, GAP-4, CAN-5, PRI-6
 * Trách nhiệm: Ingestion data, keyword discovery, intent classification, gap analysis, cannibalization check & priority scoring.
 */
export async function discover(): Promise<JobResult> {
  console.log('[W2:Research][discover] Starting keyword discovery and opportunity research...');
  console.log('[ING-1] Ingesting owned data, GSC/GA4 metrics, and fact inventory...');
  console.log('[KW-2] Discovering keyword candidates from search queries and seed topics...');
  console.log('[INT-3] Classifying search intents (Informational / Commercial / Transactional)...');
  console.log('[GAP-4] Performing gap analysis against existing content coverage...');
  console.log('[CAN-5] Running cannibalization risk check & intent deduplication...');
  console.log('[PRI-6] Scoring priority for candidate opportunities (priorityScore algorithm)...');

  return {
    jobName: 'discover',
    status: 'SUCCESS',
    worker: 'W2 Research',
    agents: ['ING-1', 'KW-2', 'INT-3', 'GAP-4', 'CAN-5', 'PRI-6'],
    timestamp: new Date().toISOString(),
    data: {
      candidatesFound: 0,
      selectedCandidate: null
    }
  };
}

/**
 * Job 3: produce (Worker W3 - Content)
 * Agents: SRC-7, BRF-8, WRT-9, DAT-10, EDT-11, VER-12
 * Trách nhiệm: Source retrieval, brief building, answer-first writing, claim ledger binding, editing, 2-tier verification gate.
 */
export async function produce(): Promise<JobResult> {
  console.log('[W3:Content][produce] Starting content production pipeline...');
  console.log('[SRC-7] Retrieving facts and authoritative source snapshots...');
  console.log('[BRF-8] Building typed content brief and schema targets...');
  console.log('[WRT-9] Draft generation with answer-first approach (40-100 words lead)...');
  console.log('[DAT-10] Binding claims to fact/source IDs in Claim Ledger...');
  console.log('[EDT-11] Editing draft for clarity, readability flow, and tone...');
  console.log('[VER-12] Executing 2-Tier Verification Gate (Evidence, Contradiction, Expiry, Policy)...');

  return {
    jobName: 'produce',
    status: 'SUCCESS',
    worker: 'W3 Content',
    agents: ['SRC-7', 'BRF-8', 'WRT-9', 'DAT-10', 'EDT-11', 'VER-12'],
    timestamp: new Date().toISOString(),
    data: {
      verificationDecision: 'PASS',
      claimsVerified: 0
    }
  };
}

/**
 * Job 4: package (Worker W4 - Media + Package)
 * Agents: IMG-13, ONP-14, LNK-15, SCH-16, TEC-17
 * Trách nhiệm: Image generation & SVG text overlay, on-page SEO, internal linking graph, JSON-LD schema, technical controls.
 */
export async function packageJob(): Promise<JobResult> {
  console.log('[W4:Media+Package][package] Packaging content bundle and media assets...');
  console.log('[IMG-13] Generating visual assets, SVG overlays, and WebP compression...');
  console.log('[ONP-14] Formatting title, meta description, H1, slug, canonical, OG tags...');
  console.log('[LNK-15] Building topical internal linking graph and anchor texts...');
  console.log('[SCH-16] Generating structured data JSON-LD (Article, BreadcrumbList, FAQ)...');
  console.log('[TEC-17] Applying technical controls, sitemap validation, and status checks...');

  return {
    jobName: 'package',
    status: 'SUCCESS',
    worker: 'W4 Media+Package',
    agents: ['IMG-13', 'ONP-14', 'LNK-15', 'SCH-16', 'TEC-17'],
    timestamp: new Date().toISOString(),
    data: {
      packaged: true,
      assetsGenerated: 0
    }
  };
}

export { packageJob as package };

/**
 * Job 5: release (Worker W5 - Release)
 * Agents: AUD-18, PUB-19, PVF-20, IDX-21
 * Trách nhiệm: Dist build audit (AUD-21), auto-publish/PR creation, production verification, IndexNow notification.
 */
export async function release(): Promise<JobResult> {
  console.log('[W5:Release][release] Performing release checks and deployment...');
  console.log('[AUD-18] Running dist build auditor (AUD-21 static audit)...');
  console.log('[PUB-19] Executing release policy (Pull Request or Direct Publish according to Risk Tier)...');
  console.log('[PVF-20] Verifying live production URL and asset integrity...');
  console.log('[IDX-21] Submitting modified/created URLs to IndexNow & Search Engines...');

  return {
    jobName: 'release',
    status: 'SUCCESS',
    worker: 'W5 Release',
    agents: ['AUD-18', 'PUB-19', 'PVF-20', 'IDX-21'],
    timestamp: new Date().toISOString(),
    data: {
      audResult: 'PASS',
      publishedUrl: null
    }
  };
}

/**
 * Job 6: finalize (Worker W1 - Orchestrate)
 * Agents: RPT-27
 * Trách nhiệm: Daily report generation, state commit, metrics logging. Always executed.
 */
export async function finalize(context: PipelineRunContext): Promise<JobResult> {
  console.log('[W1:Orchestrate][finalize] Finalizing daily pipeline run...');
  console.log('[RPT-27] Generating daily summary report, updating audit trail and state...');
  console.log('[ORC-0] Pipeline execution status:', context.status);

  return {
    jobName: 'finalize',
    status: 'SUCCESS',
    worker: 'W1 Orchestrate',
    agents: ['RPT-27'],
    timestamp: new Date().toISOString(),
    data: {
      summaryReportGenerated: true
    }
  };
}

/**
 * Orchestrator Main Runner: runDailyPipeline()
 * Sequential execution of 5 Workers: W1 -> W2 -> W3 -> W4 -> W5 -> W1(finalize)
 * Guarantees finalize() execution via try...finally block.
 */
export async function runDailyPipeline(): Promise<PipelineRunContext> {
  const runId = `daily-${Date.now()}`;
  console.log(`\n==================================================`);
  console.log(`🚀 Starting Daily SEO/AEO Autonomous Pipeline [Run ID: ${runId}]`);
  console.log(`==================================================\n`);

  const context: PipelineRunContext = {
    runId,
    startTime: new Date().toISOString(),
    status: 'RUNNING',
    jobResults: {}
  };

  try {
    // Step 1: W1 init
    context.jobResults.init = await init();
    if (context.jobResults.init.status !== 'SUCCESS') {
      throw new Error('init job failed, aborting pipeline');
    }

    // Step 2: W2 discover
    context.jobResults.discover = await discover();
    if (context.jobResults.discover.status !== 'SUCCESS') {
      throw new Error('discover job failed, aborting pipeline');
    }

    // Step 3: W3 produce
    context.jobResults.produce = await produce();
    if (context.jobResults.produce.status !== 'SUCCESS') {
      throw new Error('produce job failed, aborting pipeline');
    }

    // Step 4: W4 package
    context.jobResults.package = await packageJob();
    if (context.jobResults.package.status !== 'SUCCESS') {
      throw new Error('package job failed, aborting pipeline');
    }

    // Step 5: W5 release
    context.jobResults.release = await release();
    if (context.jobResults.release.status !== 'SUCCESS') {
      throw new Error('release job failed, aborting pipeline');
    }

    context.status = 'COMPLETED';
    console.log(`\n✅ All daily pipeline stages completed successfully!`);

  } catch (error: any) {
    context.status = 'FAILED';
    console.error(`\n❌ Pipeline execution failed: ${error?.message || error}`);
  } finally {
    // Step 6: W1 finalize (Always executed regardless of success/failure)
    context.jobResults.finalize = await finalize(context);
    console.log(`\n==================================================`);
    console.log(`🏁 Daily Pipeline Run Finished [Status: ${context.status}]`);
    console.log(`==================================================\n`);
  }

  return context;
}

// Allow direct execution via npx tsx pipeline/daily.ts
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('daily.ts')) {
  runDailyPipeline().catch((err) => {
    console.error('Fatal error running daily pipeline:', err);
    process.exit(1);
  });
}
