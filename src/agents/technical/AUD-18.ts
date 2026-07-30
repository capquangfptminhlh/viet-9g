/**
 * AUD-18: Build Auditor (Audit dist static output directory)
 * Master Spec v3.2 - Section 7 & Phase 8 (Build Audit & Release Gate)
 */

import fs from 'fs/promises';
import path from 'path';

export type AuditIssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AuditIssue {
  id: string;
  file: string;
  severity: AuditIssueSeverity;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AuditOptions {
  distDir?: string;
  domain?: string;
  canonicalHost?: string;
  strictMode?: boolean;
  allowedBrokenLinks?: string[];
}

export interface AuditSummary {
  totalPagesScanned: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  seoScore: number;
}

export interface AuditReport {
  status: 'PASS' | 'BLOCK' | 'NEEDS_REVIEW';
  timestamp: string;
  summary: AuditSummary;
  issues: AuditIssue[];
  hardBlockers: string[];
}

export class BuildAuditor {
  private distDir: string;
  private domain: string;
  private canonicalHost: string;
  private strictMode: boolean;

  constructor(options: AuditOptions = {}) {
    this.distDir = options.distDir ?? 'dist';
    this.domain = options.domain ?? 'https://tracuugoicuoc.com';
    this.canonicalHost = options.canonicalHost ?? 'tracuugoicuoc.com';
    this.strictMode = options.strictMode ?? true;
  }

  public async runAudit(): Promise<AuditReport> {
    const issues: AuditIssue[] = [];
    const hardBlockers: string[] = [];

    let htmlFiles: string[] = [];
    try {
      htmlFiles = await this.scanDirectory(this.distDir, '.html');
    } catch {
      issues.push({
        id: 'dist_not_found',
        file: this.distDir,
        severity: 'CRITICAL',
        code: 'DIST_DIR_MISSING',
        message: `Thư mục static build (${this.distDir}) không tồn tại hoặc không thể đọc.`,
      });
      hardBlockers.push('DIST_DIR_MISSING');

      return {
        status: 'BLOCK',
        timestamp: new Date().toISOString(),
        summary: {
          totalPagesScanned: 0,
          criticalCount: 1,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          seoScore: 0,
        },
        issues,
        hardBlockers,
      };
    }

    const titlesMap = new Map<string, string[]>();

    for (const filePath of htmlFiles) {
      const relativePath = path.relative(this.distDir, filePath).replace(/\\/g, '/');
      const content = await fs.readFile(filePath, 'utf-8');

      // 1. Title Tag Check
      const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
      if (!titleMatch || !titleMatch[1].trim()) {
        issues.push({
          id: `title_missing_${relativePath}`,
          file: relativePath,
          severity: 'CRITICAL',
          code: 'MISSING_TITLE_TAG',
          message: 'Trang HTML thiếu thẻ <title> hoặc tiêu đề rỗng.',
        });
      } else {
        const titleText = titleMatch[1].trim();
        const existing = titlesMap.get(titleText) || [];
        existing.push(relativePath);
        titlesMap.set(titleText, existing);
      }

      // 2. Meta Description Check
      const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      if (!metaDescMatch || !metaDescMatch[1].trim()) {
        issues.push({
          id: `meta_desc_missing_${relativePath}`,
          file: relativePath,
          severity: 'HIGH',
          code: 'MISSING_META_DESCRIPTION',
          message: 'Trang HTML thiếu meta description hoặc mô tả rỗng.',
        });
      }

      // 3. Canonical Tag Check
      const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
      if (!canonicalMatch || !canonicalMatch[1].trim()) {
        issues.push({
          id: `canonical_missing_${relativePath}`,
          file: relativePath,
          severity: 'CRITICAL',
          code: 'MISSING_CANONICAL_LINK',
          message: 'Trang HTML thiếu thẻ canonical link.',
        });
      } else {
        const canonicalUrl = canonicalMatch[1].trim();
        try {
          const parsed = new URL(canonicalUrl);
          if (parsed.hostname !== this.canonicalHost) {
            issues.push({
              id: `canonical_host_mismatch_${relativePath}`,
              file: relativePath,
              severity: 'CRITICAL',
              code: 'CANONICAL_HOST_MISMATCH',
              message: `Canonical URL (${canonicalUrl}) không khớp với canonical host (${this.canonicalHost}).`,
            });
          }
        } catch {
          issues.push({
            id: `canonical_invalid_${relativePath}`,
            file: relativePath,
            severity: 'CRITICAL',
            code: 'INVALID_CANONICAL_URL',
            message: `Canonical URL (${canonicalUrl}) không hợp lệ.`,
          });
        }
      }

      // 4. Meta Robots Check (Unexpected noindex on prod)
      const metaRobotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
      if (metaRobotsMatch) {
        const robotsVal = metaRobotsMatch[1].toLowerCase();
        if (robotsVal.includes('noindex')) {
          issues.push({
            id: `unexpected_noindex_${relativePath}`,
            file: relativePath,
            severity: 'CRITICAL',
            code: 'UNEXPECTED_NOINDEX',
            message: 'Phát hiện thẻ meta robots noindex trên trang production dist.',
          });
        }
      }

      // 5. Schema JSON-LD Check
      if (!content.includes('application/ld+json')) {
        issues.push({
          id: `schema_missing_${relativePath}`,
          file: relativePath,
          severity: 'HIGH',
          code: 'MISSING_STRUCTURED_DATA',
          message: 'Trang HTML thiếu script JSON-LD structured data.',
        });
      }

      // 6. Secret / PII Scan
      if (this.detectSecretsOrPii(content)) {
        issues.push({
          id: `secret_pii_detected_${relativePath}`,
          file: relativePath,
          severity: 'CRITICAL',
          code: 'SECRET_OR_PII_LEAK',
          message: 'Phát hiện API key, secret token hoặc PII trong file dist static HTML.',
        });
      }

      // 7. Internal Broken Links Check
      const hrefRegex = /href=["']([^"']*)["']/gi;
      let match;
      while ((match = hrefRegex.exec(content)) !== null) {
        const href = match[1].trim();
        if (href === 'undefined' || href === 'null') {
          issues.push({
            id: `broken_href_${relativePath}`,
            file: relativePath,
            severity: 'CRITICAL',
            code: 'INVALID_HREF_VALUE',
            message: `Phát hiện thuộc tính href không hợp lệ: "${href}"`,
          });
        }
      }

      // 8. Image Alt & Broken Media Check
      const imgRegex = /<img\s+([^>]*)\/?>/gi;
      while ((match = imgRegex.exec(content)) !== null) {
        const imgTag = match[1];
        if (!imgTag.includes('alt=')) {
          issues.push({
            id: `img_missing_alt_${relativePath}`,
            file: relativePath,
            severity: 'MEDIUM',
            code: 'MISSING_IMAGE_ALT',
            message: 'Phát hiện thẻ <img> thiếu thuộc tính alt.',
          });
        }
      }
    }

    // Duplicate titles check across non-index files
    for (const [titleText, files] of titlesMap.entries()) {
      if (files.length > 1) {
        const nonIndexFiles = files.filter((f) => !f.endsWith('index.html'));
        if (nonIndexFiles.length > 1) {
          issues.push({
            id: `duplicate_title_${titleText.substring(0, 20)}`,
            file: nonIndexFiles.join(', '),
            severity: 'HIGH',
            code: 'DUPLICATE_TITLE_TAG',
            message: `Trùng lặp thẻ title ("${titleText}") trên nhiều trang: ${nonIndexFiles.join(', ')}`,
          });
        }
      }
    }

    // Tally issue severities
    const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
    const highCount = issues.filter((i) => i.severity === 'HIGH').length;
    const mediumCount = issues.filter((i) => i.severity === 'MEDIUM').length;
    const lowCount = issues.filter((i) => i.severity === 'LOW').length;

    if (criticalCount > 0) {
      hardBlockers.push(`CRITICAL_AUDIT_FAILURES:${criticalCount}_ISSUES`);
    }

    // Calculate SEO Score (100 - penalties)
    const penalty = criticalCount * 25 + highCount * 10 + mediumCount * 3 + lowCount * 1;
    const seoScore = Math.max(0, 100 - penalty);

    let status: 'PASS' | 'BLOCK' | 'NEEDS_REVIEW';
    if (criticalCount > 0 || seoScore < 60) {
      status = 'BLOCK';
    } else if (highCount > 0 || seoScore < 85) {
      status = 'NEEDS_REVIEW';
    } else {
      status = 'PASS';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      summary: {
        totalPagesScanned: htmlFiles.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        seoScore,
      },
      issues,
      hardBlockers,
    };
  }

  private async scanDirectory(dir: string, extension: string): Promise<string[]> {
    const fileList: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const resPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.scanDirectory(resPath, extension);
        fileList.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        fileList.push(resPath);
      }
    }

    return fileList;
  }

  private detectSecretsOrPii(content: string): boolean {
    const piiOrSecretRegex = /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|bearer\s+[a-zA-Z0-9_\-\.]+|\b\d{3}-\d{2}-\d{4}\b)/i;
    return piiOrSecretRegex.test(content);
  }
}

export async function runBuildAudit(options?: AuditOptions): Promise<AuditReport> {
  const auditor = new BuildAuditor(options);
  return auditor.runAudit();
}
