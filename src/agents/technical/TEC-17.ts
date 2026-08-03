/**
 * TEC-17: Technical Controls (Indexability, Sitemap, Robots, Redirects)
 * Master Spec v3.2 - Section 7 & Phase 6 (SEO Packaging)
 */

export type IndexabilityStatus = 'INDEXABLE' | 'NON_INDEXABLE' | 'BLOCKED';

export interface IndexabilityCheckInput {
  url: string;
  statusCode?: number;
  canonicalUrl?: string;
  metaRobots?: string;
  headers?: Record<string, string>;
  isDraft?: boolean;
  isPreview?: boolean;
}

export interface IndexabilityCheckResult {
  status: IndexabilityStatus;
  isIndexable: boolean;
  reasonCodes: string[];
  violations: string[];
  effectiveCanonical: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapCheckResult {
  valid: boolean;
  entriesCount: number;
  invalidUrls: string[];
  nonCanonicalUrls: string[];
  warnings: string[];
}

export interface RobotsUserAgentConfig {
  allow: string[];
  disallow: string[];
}

export interface RobotsConfig {
  userAgents: Record<string, RobotsUserAgentConfig>;
  sitemapUrl?: string;
}

export interface RobotsCheckResult {
  valid: boolean;
  hasSitemap: boolean;
  disallowedPaths: string[];
  warnings: string[];
}

export interface RedirectRule {
  from: string;
  to: string;
  statusCode: 301 | 302 | 307 | 308;
}

export interface RedirectsCheckResult {
  valid: boolean;
  loopsDetected: string[];
  nonCanonicalTargets: string[];
  warnings: string[];
}

export interface TechnicalControlsOptions {
  domain?: string;
  canonicalHost?: string;
  trailingSlashPolicy?: 'never' | 'always' | 'ignore';
}

export interface TechnicalControlsResult {
  overallStatus: 'PASS' | 'BLOCK' | 'NEEDS_REVIEW';
  indexability: IndexabilityCheckResult[];
  sitemap: SitemapCheckResult;
  robots: RobotsCheckResult;
  redirects: RedirectsCheckResult;
  hardBlockers: string[];
}

export class TechnicalControls {
  private domain: string;
  private canonicalHost: string;
  private trailingSlashPolicy: 'never' | 'always' | 'ignore';

  constructor(options: TechnicalControlsOptions = {}) {
    this.domain = options.domain ?? 'https://tracuugoicuoc.com';
    this.canonicalHost = options.canonicalHost ?? 'tracuugoicuoc.com';
    this.trailingSlashPolicy = options.trailingSlashPolicy ?? 'never';
  }

  /**
   * Evaluates if a single URL is indexable according to technical SEO rules.
   */
  public checkIndexability(input: IndexabilityCheckInput): IndexabilityCheckResult {
    void this.domain;
    const reasonCodes: string[] = [];
    const violations: string[] = [];
    let isIndexable = true;

    // 1. Status code check
    if (input.statusCode !== undefined && input.statusCode !== 200) {
      isIndexable = false;
      violations.push(`NON_200_STATUS_CODE:${input.statusCode}`);
      reasonCodes.push('HTTP_STATUS_NOT_OK');
    }

    // 2. Draft / Preview checks
    if (input.isDraft) {
      isIndexable = false;
      violations.push('DRAFT_CONTENT');
      reasonCodes.push('CONTENT_IS_DRAFT');
    }
    if (input.isPreview) {
      isIndexable = false;
      violations.push('PREVIEW_ENVIRONMENT');
      reasonCodes.push('ENVIRONMENT_IS_PREVIEW');
    }

    // 3. Meta robots header / tag check
    if (input.metaRobots) {
      const robotsLower = input.metaRobots.toLowerCase();
      if (robotsLower.includes('noindex') || robotsLower.includes('none')) {
        isIndexable = false;
        violations.push('META_ROBOTS_NOINDEX');
        reasonCodes.push('ROBOTS_NOINDEX');
      }
    }

    const xRobotsTag = input.headers?.['x-robots-tag'] || input.headers?.['X-Robots-Tag'];
    if (xRobotsTag) {
      const xRobotsLower = xRobotsTag.toLowerCase();
      if (xRobotsLower.includes('noindex') || xRobotsLower.includes('none')) {
        isIndexable = false;
        violations.push('X_ROBOTS_TAG_NOINDEX');
        reasonCodes.push('ROBOTS_NOINDEX');
      }
    }

    // 4. Canonical URL matching check
    const effectiveCanonical = input.canonicalUrl || input.url;
    try {
      const parsedUrl = new URL(input.url);
      const parsedCanonical = new URL(effectiveCanonical);

      if (parsedCanonical.hostname !== this.canonicalHost) {
        isIndexable = false;
        violations.push(`CANONICAL_HOST_MISMATCH:${parsedCanonical.hostname}`);
        reasonCodes.push('CANONICAL_HOST_INVALID');
      }

      if (input.url !== effectiveCanonical) {
        isIndexable = false;
        violations.push(`CANONICAL_URL_MISMATCH:${effectiveCanonical}`);
        reasonCodes.push('NON_CANONICAL_URL');
      }

      // Trailing slash policy enforcement
      if (this.trailingSlashPolicy === 'never' && parsedUrl.pathname !== '/' && parsedUrl.pathname.endsWith('/')) {
        isIndexable = false;
        violations.push('TRAILING_SLASH_POLICY_VIOLATION');
        reasonCodes.push('INVALID_TRAILING_SLASH');
      }
    } catch {
      isIndexable = false;
      violations.push('INVALID_URL_FORMAT');
      reasonCodes.push('MALFORMED_URL');
    }

    const status: IndexabilityStatus = isIndexable
      ? 'INDEXABLE'
      : violations.some((v) => v.startsWith('DRAFT') || v.startsWith('PREVIEW') || v.includes('NOINDEX'))
      ? 'NON_INDEXABLE'
      : 'BLOCKED';

    return {
      status,
      isIndexable,
      reasonCodes,
      violations,
      effectiveCanonical,
    };
  }

  /**
   * Validates sitemap entries ensuring only canonical 200 indexable URLs exist.
   */
  public validateSitemap(entries: SitemapEntry[]): SitemapCheckResult {
    const invalidUrls: string[] = [];
    const nonCanonicalUrls: string[] = [];
    const warnings: string[] = [];

    for (const entry of entries) {
      const check = this.checkIndexability({ url: entry.loc, statusCode: 200 });
      if (!check.isIndexable) {
        invalidUrls.push(entry.loc);
        if (check.reasonCodes.includes('NON_CANONICAL_URL')) {
          nonCanonicalUrls.push(entry.loc);
        }
      }
    }

    return {
      valid: invalidUrls.length === 0,
      entriesCount: entries.length,
      invalidUrls,
      nonCanonicalUrls,
      warnings,
    };
  }

  /**
   * Generates sitemap.xml content string.
   */
  public generateSitemap(entries: SitemapEntry[]): string {
    const urlElements = entries
      .map((e) => {
        let xml = `  <url>\n    <loc>${e.loc}</loc>`;
        if (e.lastmod) xml += `\n    <lastmod>${e.lastmod}</lastmod>`;
        if (e.changefreq) xml += `\n    <changefreq>${e.changefreq}</changefreq>`;
        if (e.priority !== undefined) xml += `\n    <priority>${e.priority.toFixed(1)}</priority>`;
        xml += `\n  </url>`;
        return xml;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElements}\n</urlset>`;
  }

  /**
   * Validates robots.txt rules.
   */
  public validateRobots(robotsContent: string): RobotsCheckResult {
    const warnings: string[] = [];
    const disallowedPaths: string[] = [];
    let hasSitemap = false;

    const lines = robotsContent.split('\n').map((l) => l.trim());
    for (const line of lines) {
      if (line.toLowerCase().startsWith('sitemap:')) {
        hasSitemap = true;
      }
      if (line.toLowerCase().startsWith('disallow:')) {
        const path = line.substring('disallow:'.length).trim();
        if (path) disallowedPaths.push(path);
      }
    }

    if (!hasSitemap) {
      warnings.push('MISSING_SITEMAP_DECLARATION');
    }

    if (disallowedPaths.includes('/')) {
      warnings.push('CRITICAL_SITEWIDE_DISALLOW');
    }

    return {
      valid: !disallowedPaths.includes('/'),
      hasSitemap,
      disallowedPaths,
      warnings,
    };
  }

  /**
   * Generates robots.txt content string.
   */
  public generateRobotsTxt(config: RobotsConfig): string {
    const parts: string[] = [];

    for (const [agent, rules] of Object.entries(config.userAgents)) {
      parts.push(`User-agent: ${agent}`);
      for (const allow of rules.allow) {
        parts.push(`Allow: ${allow}`);
      }
      for (const disallow of rules.disallow) {
        parts.push(`Disallow: ${disallow}`);
      }
      parts.push('');
    }

    if (config.sitemapUrl) {
      parts.push(`Sitemap: ${config.sitemapUrl}`);
    }

    return parts.join('\n');
  }

  /**
   * Validates redirect rules for loops and non-canonical target URLs.
   */
  public validateRedirects(redirects: RedirectRule[]): RedirectsCheckResult {
    const loopsDetected: string[] = [];
    const nonCanonicalTargets: string[] = [];
    const warnings: string[] = [];

    const redirectMap = new Map<string, string>();
    for (const r of redirects) {
      redirectMap.set(r.from, r.to);
    }

    for (const r of redirects) {
      // Loop detection
      let current = r.to;
      const visited = new Set<string>([r.from]);

      while (current && redirectMap.has(current)) {
        if (visited.has(current)) {
          loopsDetected.push(`${r.from} -> ... -> ${current}`);
          break;
        }
        visited.add(current);
        current = redirectMap.get(current)!;
      }

      // Check target canonical host
      try {
        if (r.to.startsWith('http')) {
          const parsedTarget = new URL(r.to);
          if (parsedTarget.hostname !== this.canonicalHost) {
            nonCanonicalTargets.push(r.to);
          }
        }
      } catch {
        warnings.push(`INVALID_REDIRECT_TARGET:${r.to}`);
      }
    }

    return {
      valid: loopsDetected.length === 0 && nonCanonicalTargets.length === 0,
      loopsDetected,
      nonCanonicalTargets,
      warnings,
    };
  }

  /**
   * Runs complete technical controls evaluation.
   */
  public runTechnicalControls(
    urlInputs: IndexabilityCheckInput[],
    sitemapEntries: SitemapEntry[],
    robotsContent: string,
    redirects: RedirectRule[]
  ): TechnicalControlsResult {
    const hardBlockers: string[] = [];

    const indexability = urlInputs.map((input) => this.checkIndexability(input));
    const sitemap = this.validateSitemap(sitemapEntries);
    const robots = this.validateRobots(robotsContent);
    const redirectRes = this.validateRedirects(redirects);

    if (sitemap.invalidUrls.length > 0) {
      hardBlockers.push('SITEMAP_CONTAINS_NON_INDEXABLE_URLS');
    }
    if (!robots.valid) {
      hardBlockers.push('ROBOTS_TXT_SITEWIDE_DISALLOW');
    }
    if (redirectRes.loopsDetected.length > 0) {
      hardBlockers.push('REDIRECT_LOOPS_DETECTED');
    }

    const overallStatus = hardBlockers.length > 0 ? 'BLOCK' : 'PASS';

    return {
      overallStatus,
      indexability,
      sitemap,
      robots,
      redirects: redirectRes,
      hardBlockers,
    };
  }
}

export function runTechnicalControls(
  urlInputs: IndexabilityCheckInput[],
  sitemapEntries: SitemapEntry[],
  robotsContent: string,
  redirects: RedirectRule[],
  options?: TechnicalControlsOptions
): TechnicalControlsResult {
  const controls = new TechnicalControls(options);
  return controls.runTechnicalControls(urlInputs, sitemapEntries, robotsContent, redirects);
}
