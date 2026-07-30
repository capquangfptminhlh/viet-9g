/**
 * ING-1: Ingestion Agent
 * Master Spec v3.2 - Section 5.1, Section 6, Section 7, Section 8, Section 17
 * 
 * Responsibilities:
 *  - Synchronize owned data (project config, entities, topical map, authors)
 *  - Manage Fact Lifecycle & Freshness (data/facts.json, 7/14/30 days expiry, factFreshnessRate)
 *  - Synchronize Content Inventory (scans markdown files, metadata, intent, risk tier)
 *  - Synchronize analytics & GSC/Bing/GA4 metrics
 *  - Propose Fact updates from official sources (PR proposal model, non-auto-merge)
 */

import * as fs from 'fs';
import * as path from 'path';

export type FactSourceType = 'internal' | 'official';

export interface Fact {
  factId: string;
  statement: string;
  value: string | number | boolean;
  unit?: string;
  effectiveAt: string; // ISO date string YYYY-MM-DD
  expiresAt?: string; // ISO date string YYYY-MM-DD
  reviewByDate?: string; // ISO date string YYYY-MM-DD
  sourceType: FactSourceType;
  sourceRef?: string;
  ownerRole: string;
}

export interface FactFreshnessReport {
  totalFacts: number;
  activeFactsCount: number;
  expiredFactsCount: number;
  expiringIn7Days: Fact[];
  expiringIn14Days: Fact[];
  expiringIn30Days: Fact[];
  expiredFacts: Fact[];
  factFreshnessRate: number; // 0.0 to 1.0 (activeValid / total)
}

export interface OwnedData {
  projectConfig: Record<string, unknown>;
  entities: Array<Record<string, unknown>>;
  topicalMap: Array<Record<string, unknown>>;
  authors: Array<Record<string, unknown>>;
}

export interface ContentInventoryItem {
  contentId: string;
  slug: string;
  title: string;
  filePath: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt?: string;
  lastUpdated?: string;
  riskTier?: 'low' | 'medium' | 'high';
  primaryQuery?: string;
  intent?: string;
  factIds: string[];
  wordCount: number;
  gscImpressions?: number;
  gscClicks?: number;
}

export interface ContentInventoryResult {
  totalItems: number;
  publishedCount: number;
  draftCount: number;
  items: ContentInventoryItem[];
}

export interface AnalyticsMetrics {
  gscMetrics?: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  };
  ga4Metrics?: {
    sessions: number;
    aiReferralSessions: number;
    conversions: number;
  };
  syncedAt: string;
}

export interface ProposedFactPR {
  proposalId: string;
  fact: Fact;
  action: 'CREATE' | 'UPDATE';
  reason: string;
  proposedAt: string;
  status: 'PENDING_PR';
}

export interface IngestionOptions {
  rootDir?: string;
  factsPath?: string;
  configPath?: string;
  entitiesPath?: string;
  topicalMapPath?: string;
  contentDir?: string;
  metricsDir?: string;
  now?: Date;
}

export interface IngestionResult {
  timestamp: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  ownedData: OwnedData;
  factsResult: {
    facts: Fact[];
    freshness: FactFreshnessReport;
  };
  contentInventory: ContentInventoryResult;
  metrics: AnalyticsMetrics;
  proposedFactPRs: ProposedFactPR[];
  errors: string[];
}

export class IngestionAgent {
  private rootDir: string;
  private factsPath: string;
  private configPath: string;
  private entitiesPath: string;
  private topicalMapPath: string;
  private contentDir: string;
  private metricsDir: string;
  private currentDate: Date;

  constructor(options: IngestionOptions = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.factsPath = options.factsPath || path.join(this.rootDir, 'data', 'facts.json');
    this.configPath = options.configPath || path.join(this.rootDir, 'config', 'project.json');
    this.entitiesPath = options.entitiesPath || path.join(this.rootDir, 'data', 'entities.json');
    this.topicalMapPath = options.topicalMapPath || path.join(this.rootDir, 'data', 'topical-map.json');
    this.contentDir = options.contentDir || path.join(this.rootDir, 'src', 'content', 'posts');
    this.metricsDir = options.metricsDir || path.join(this.rootDir, 'state', 'metrics');
    this.currentDate = options.now || new Date();
  }

  /**
   * Run the full daily ingestion pipeline (ING-1)
   */
  public async runIngestion(): Promise<IngestionResult> {
    const errors: string[] = [];

    // 1. Sync Owned Data
    let ownedData: OwnedData = {
      projectConfig: {},
      entities: [],
      topicalMap: [],
      authors: [],
    };
    try {
      ownedData = await this.syncOwnedData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to sync owned data: ${msg}`);
    }

    // 2. Sync Facts & Calculate Freshness Lifecycle
    let facts: Fact[] = [];
    let freshness: FactFreshnessReport = {
      totalFacts: 0,
      activeFactsCount: 0,
      expiredFactsCount: 0,
      expiringIn7Days: [],
      expiringIn14Days: [],
      expiringIn30Days: [],
      expiredFacts: [],
      factFreshnessRate: 1.0,
    };

    try {
      const factsResult = await this.syncFacts();
      facts = factsResult.facts;
      freshness = factsResult.freshness;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to sync facts: ${msg}`);
    }

    // 3. Sync Content Inventory
    let contentInventory: ContentInventoryResult = {
      totalItems: 0,
      publishedCount: 0,
      draftCount: 0,
      items: [],
    };
    try {
      contentInventory = await this.syncContentInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to sync content inventory: ${msg}`);
    }

    // 4. Sync Analytics Metrics
    let metrics: AnalyticsMetrics = { syncedAt: new Date().toISOString() };
    try {
      metrics = await this.syncAnalyticsMetrics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to sync metrics: ${msg}`);
    }

    const status: 'SUCCESS' | 'PARTIAL' | 'FAILED' =
      errors.length === 0 ? 'SUCCESS' : errors.length < 4 ? 'PARTIAL' : 'FAILED';

    return {
      timestamp: new Date().toISOString(),
      status,
      ownedData,
      factsResult: {
        facts,
        freshness,
      },
      contentInventory,
      metrics,
      proposedFactPRs: [],
      errors,
    };
  }

  /**
   * Sync owned data from config and data stores
   */
  public async syncOwnedData(): Promise<OwnedData> {
    const projectConfig = this.readJsonFile<Record<string, unknown>>(this.configPath, {});
    const entities = this.readJsonFile<Array<Record<string, unknown>>>(this.entitiesPath, []);
    const topicalMap = this.readJsonFile<Array<Record<string, unknown>>>(this.topicalMapPath, []);
    
    // Extract authors from projectConfig if available
    const authors = Array.isArray(projectConfig.authors)
      ? (projectConfig.authors as Array<Record<string, unknown>>)
      : [];

    return {
      projectConfig,
      entities,
      topicalMap,
      authors,
    };
  }

  /**
   * Sync facts from facts.json and evaluate lifecycle freshness
   */
  public async syncFacts(): Promise<{ facts: Fact[]; freshness: FactFreshnessReport }> {
    const rawFacts = this.readJsonFile<Fact[]>(this.factsPath, []);
    const validFacts: Fact[] = Array.isArray(rawFacts) ? rawFacts : [];
    
    const freshness = this.calculateFactFreshness(validFacts, this.currentDate);

    return {
      facts: validFacts,
      freshness,
    };
  }

  /**
   * Calculate Fact Freshness Lifecycle & Expiry Alerts (MASTER_SPEC 5.1)
   */
  public calculateFactFreshness(facts: Fact[], referenceDate: Date = new Date()): FactFreshnessReport {
    const nowMs = referenceDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    const expiringIn7Days: Fact[] = [];
    const expiringIn14Days: Fact[] = [];
    const expiringIn30Days: Fact[] = [];
    const expiredFacts: Fact[] = [];
    let activeFactsCount = 0;

    for (const fact of facts) {
      // Determine cutoff date (expiresAt takes priority over reviewByDate)
      const expiryStr = fact.expiresAt || fact.reviewByDate;
      
      if (!expiryStr) {
        // Fact missing expiration/review date is considered unverified/expired per spec
        expiredFacts.push(fact);
        continue;
      }

      const expiryMs = new Date(expiryStr).getTime();
      if (isNaN(expiryMs)) {
        expiredFacts.push(fact);
        continue;
      }

      const diffDays = (expiryMs - nowMs) / dayMs;

      if (diffDays < 0) {
        expiredFacts.push(fact);
      } else {
        activeFactsCount++;
        if (diffDays <= 7) {
          expiringIn7Days.push(fact);
        } else if (diffDays <= 14) {
          expiringIn14Days.push(fact);
        } else if (diffDays <= 30) {
          expiringIn30Days.push(fact);
        }
      }
    }

    const totalFacts = facts.length;
    const factFreshnessRate = totalFacts > 0 ? parseFloat((activeFactsCount / totalFacts).toFixed(4)) : 1.0;

    return {
      totalFacts,
      activeFactsCount,
      expiredFactsCount: expiredFacts.length,
      expiringIn7Days,
      expiringIn14Days,
      expiringIn30Days,
      expiredFacts,
      factFreshnessRate,
    };
  }

  /**
   * Scan content directory for markdown files to build content inventory
   */
  public async syncContentInventory(): Promise<ContentInventoryResult> {
    const items: ContentInventoryItem[] = [];
    let publishedCount = 0;
    let draftCount = 0;

    if (!fs.existsSync(this.contentDir)) {
      return { totalItems: 0, publishedCount: 0, draftCount: 0, items: [] };
    }

    const files = fs.readdirSync(this.contentDir);
    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

      const fullPath = path.join(this.contentDir, file);
      const stat = fs.statSync(fullPath);
      const contentStr = fs.readFileSync(fullPath, 'utf-8');

      // Basic frontmatter & metadata extraction
      const slug = file.replace(/\.(md|mdx)$/, '');
      const titleMatch = contentStr.match(/title:\s*["']?([^"'\r\n]+)["']?/i);
      const title = titleMatch ? titleMatch[1] : slug;

      const dateMatch = contentStr.match(/date:\s*["']?([^"'\r\n]+)["']?/i);
      const dateStr = dateMatch ? dateMatch[1] : stat.birthtime.toISOString();

      const draftMatch = contentStr.match(/draft:\s*(true|false)/i);
      const isDraft = draftMatch ? draftMatch[1].toLowerCase() === 'true' : false;

      const status = isDraft ? 'draft' : 'published';
      if (isDraft) draftCount++;
      else publishedCount++;

      // Word count computation
      const cleanContent = contentStr.replace(/---[\s\S]*?---/, '');
      const wordCount = cleanContent.trim().split(/\s+/).filter(Boolean).length;

      // Extract referenced fact IDs if tagged
      const factMatches = [...contentStr.matchAll(/fact_([a-zA-Z0-9_]+)/g)];
      const factIds = Array.from(new Set(factMatches.map((m) => m[0])));

      items.push({
        contentId: `cnt_${slug}`,
        slug,
        title,
        filePath: fullPath,
        status,
        publishedAt: dateStr,
        lastUpdated: stat.mtime.toISOString(),
        riskTier: 'low',
        factIds,
        wordCount,
      });
    }

    return {
      totalItems: items.length,
      publishedCount,
      draftCount,
      items,
    };
  }

  /**
   * Sync analytics and GSC/Bing/GA4 metrics from state/metrics
   */
  public async syncAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    const gscPath = path.join(this.metricsDir, 'gsc.json');
    const ga4Path = path.join(this.metricsDir, 'ga4.json');

    const gscData = this.readJsonFile<AnalyticsMetrics['gscMetrics']>(gscPath, undefined);
    const ga4Data = this.readJsonFile<AnalyticsMetrics['ga4Metrics']>(ga4Path, undefined);

    return {
      gscMetrics: gscData,
      ga4Metrics: ga4Data,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Propose Fact updates from official sources (generates PR proposal items)
   * MASTER_SPEC 5.1: Fact proposals are ALWAYS PR proposals, never auto-merged.
   */
  public proposeFactUpdates(candidateFacts: Partial<Fact>[]): ProposedFactPR[] {
    const proposals: ProposedFactPR[] = [];

    for (const raw of candidateFacts) {
      if (!raw.statement || raw.value === undefined) continue;

      const factId = raw.factId || `fact_prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fact: Fact = {
        factId,
        statement: raw.statement,
        value: raw.value,
        unit: raw.unit,
        effectiveAt: raw.effectiveAt || new Date().toISOString().split('T')[0],
        expiresAt: raw.expiresAt,
        reviewByDate: raw.reviewByDate,
        sourceType: raw.sourceType || 'official',
        sourceRef: raw.sourceRef,
        ownerRole: raw.ownerRole || 'telecom_expert',
      };

      proposals.push({
        proposalId: `prop_${factId}`,
        fact,
        action: raw.factId ? 'UPDATE' : 'CREATE',
        reason: `Fact proposed from official source: ${raw.sourceRef || 'allowlist'}`,
        proposedAt: new Date().toISOString(),
        status: 'PENDING_PR',
      });
    }

    return proposals;
  }

  /**
   * Helper to safely read and parse JSON file
   */
  private readJsonFile<T>(filePath: string, fallback: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        return fallback;
      }
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      if (!content) {
        return fallback;
      }
      return JSON.parse(content) as T;
    } catch {
      return fallback;
    }
  }
}

/**
 * Convenient helper function to execute ING-1 Ingestion
 */
export async function runIngestion(options?: IngestionOptions): Promise<IngestionResult> {
  const agent = new IngestionAgent(options);
  return agent.runIngestion();
}
