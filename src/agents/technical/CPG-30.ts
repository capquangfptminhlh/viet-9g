/**
 * @file CPG-30.ts
 * @description Crawler Policy Governance (CPG-30): Quản lý chính sách cho Search/Training/Agent bot, sinh robots.txt, expiry và regression tests.
 * @module CPG-30
 */

export interface BotPolicy {
  botName: string;
  botType: 'Search' | 'Training' | 'Agent' | 'All';
  allowedPaths: string[];
  disallowedPaths: string[];
  crawlDelay?: number;
  expiryDate?: Date;
}

export class CrawlerPolicyGovernance {
  private policies: BotPolicy[] = [];
  private sitemapUrls: string[] = [];

  constructor(initialPolicies?: BotPolicy[], sitemapUrls?: string[]) {
    if (initialPolicies) {
      this.policies = initialPolicies;
    }
    if (sitemapUrls) {
      this.sitemapUrls = sitemapUrls;
    }
  }

  /**
   * Adds a new policy or updates an existing one for a bot.
   */
  public upsertPolicy(policy: BotPolicy): void {
    const existingIndex = this.policies.findIndex(p => p.botName === policy.botName);
    if (existingIndex >= 0) {
      this.policies[existingIndex] = policy;
    } else {
      this.policies.push(policy);
    }
  }

  /**
   * Removes a policy by bot name.
   */
  public removePolicy(botName: string): void {
    this.policies = this.policies.filter(p => p.botName !== botName);
  }

  /**
   * Cleans up expired policies.
   */
  public cleanupExpiredPolicies(): void {
    const now = new Date();
    this.policies = this.policies.filter(p => !p.expiryDate || p.expiryDate > now);
  }

  /**
   * Generates the robots.txt content based on current active policies.
   */
  public generateRobotsTxt(): string {
    this.cleanupExpiredPolicies(); // Ensure expired policies are not included
    let content = '';

    for (const policy of this.policies) {
      content += `User-agent: ${policy.botName}\n`;
      if (policy.crawlDelay) {
        content += `Crawl-delay: ${policy.crawlDelay}\n`;
      }
      for (const path of policy.disallowedPaths) {
        content += `Disallow: ${path}\n`;
      }
      for (const path of policy.allowedPaths) {
        content += `Allow: ${path}\n`;
      }
      content += '\n';
    }

    for (const sitemap of this.sitemapUrls) {
      content += `Sitemap: ${sitemap}\n`;
    }

    return content.trim();
  }

  /**
   * Run regression tests to verify that critical paths are properly protected or allowed
   * for specific bots.
   */
  public runRegressionTests(tests: { botName: string, path: string, expectedAccess: boolean }[]): { passed: boolean, results: any[] } {
    const results = tests.map(test => {
      const policy = this.policies.find(p => p.botName === test.botName) || this.policies.find(p => p.botName === '*');
      
      let accessGranted = true; // Default allow unless disallowed
      
      if (policy) {
        // Simple logic for matching (real implementation would use regex or path matching like robots-parser)
        const isDisallowed = policy.disallowedPaths.some(dp => test.path.startsWith(dp));
        const isAllowed = policy.allowedPaths.some(ap => test.path.startsWith(ap));

        if (isDisallowed && !isAllowed) {
            accessGranted = false;
        }
      }

      const passed = accessGranted === test.expectedAccess;
      return {
        test,
        passed,
        actualAccess: accessGranted
      };
    });

    return {
      passed: results.every(r => r.passed),
      results
    };
  }
}
