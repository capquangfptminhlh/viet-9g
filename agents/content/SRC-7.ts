/**
 * SRC-7: Source Retriever & Snapshot Hash Engine
 * Master Spec v3.2 - Section 7 (Content Architecture & Verification)
 */

import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export type RetrievalStatus =
  | 'SUCCESS'
  | 'ALLOWLIST_BLOCKED'
  | 'FETCH_ERROR'
  | 'INVALID_CONTENT'
  | 'UNAUTHORIZED';

export interface AllowlistPolicy {
  allowedDomains: string[];
  blockedDomains?: string[];
  allowSubdomains?: boolean;
  maxContentLengthBytes?: number;
}

export interface SourceRetrievalOptions {
  allowlist?: string[];
  allowSubdomains?: boolean;
  timeoutMs?: number;
  userAgent?: string;
  forceRefresh?: boolean;
  snapshotDir?: string;
  customHeaders?: Record<string, string>;
}

export interface SourceSnapshot {
  sourceId: string;
  url: string;
  domain: string;
  status: RetrievalStatus;
  rawContent: string;
  cleanText: string;
  contentHash: string;
  snapshotHash: string;
  fetchedAt: string;
  contentType: string;
  contentLength: number;
  httpStatus?: number;
  errorMessage?: string;
  metadata: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    etag?: string;
    lastModified?: string;
    isAllowlisted: boolean;
  };
}

export interface BatchRetrievalResult {
  snapshots: SourceSnapshot[];
  total: number;
  successful: number;
  blocked: number;
  failed: number;
}

export const DEFAULT_ALLOWLIST: string[] = [
  'viettel.vn',
  'vietteltelecom.vn',
  'viettelpost.vn',
  'viettelpay.vn',
  'viettelaio.vn',
  'viettelstore.vn',
  'mic.gov.vn',
  'gov.vn',
  'vneconomy.vn',
  'vnexpress.net',
  'tuoitre.vn',
  'thuvienphapluat.vn',
  'wikipedia.org',
];

export class SourceRetriever {
  private allowlist: Set<string>;
  private blockedDomains: Set<string>;
  private allowSubdomains: boolean;
  private maxContentLength: number;
  private userAgent: string;
  private timeoutMs: number;
  private snapshotDir?: string;

  constructor(policy?: Partial<AllowlistPolicy> & { snapshotDir?: string; timeoutMs?: number; userAgent?: string }) {
    const domains = policy?.allowedDomains ?? DEFAULT_ALLOWLIST;
    this.allowlist = new Set(domains.map((d) => d.toLowerCase()));
    this.blockedDomains = new Set((policy?.blockedDomains ?? []).map((d) => d.toLowerCase()));
    this.allowSubdomains = policy?.allowSubdomains ?? true;
    this.maxContentLength = policy?.maxContentLengthBytes ?? 10 * 1024 * 1024;
    this.timeoutMs = policy?.timeoutMs ?? 15000;
    this.userAgent = policy?.userAgent ?? 'Antigravity-SRC7-Retriever/3.2 (+https://viettel.vn)';
    this.snapshotDir = policy?.snapshotDir;
  }

  public isAllowedDomain(targetUrl: string): boolean {
    try {
      const parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      const hostname = parsedUrl.hostname.toLowerCase();

      for (const blocked of Array.from(this.blockedDomains)) {
        if (hostname === blocked || (this.allowSubdomains && hostname.endsWith('.' + blocked))) {
          return false;
        }
      }

      for (const allowed of Array.from(this.allowlist)) {
        if (hostname === allowed) {
          return true;
        }
        if (this.allowSubdomains && hostname.endsWith('.' + allowed)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  public computeHash(data: string): string {
    return createHash('sha256').update(data, 'utf8').digest('hex');
  }

  public computeSnapshotHash(url: string, contentHash: string, fetchedAt: string): string {
    const payload = `SRC7|${url.toLowerCase()}|${contentHash}|${fetchedAt}`;
    return createHash('sha256').update(payload, 'utf8').digest('hex');
  }

  public extractContent(html: string): { cleanText: string; title?: string; description?: string; canonicalUrl?: string } {
    let cleanText = html;
    let title: string | undefined;
    let description: string | undefined;
    let canonicalUrl: string | undefined;

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/\s+/g, ' ').trim();
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
    if (descMatch) {
      description = descMatch[1].trim();
    }

    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["'][^>]*>/i);
    if (canonicalMatch) {
      canonicalUrl = canonicalMatch[1].trim();
    }

    cleanText = cleanText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return { cleanText, title, description, canonicalUrl };
  }

  public async fetchSource(url: string, options?: SourceRetrievalOptions): Promise<SourceSnapshot> {
    const fetchedAt = new Date().toISOString();
    const sourceId = `src_${this.computeHash(url).slice(0, 12)}`;

    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = url;
    }

    const isAllowlisted = this.isAllowedDomain(url);
    if (!isAllowlisted) {
      const contentHash = this.computeHash('');
      const snapshotHash = this.computeSnapshotHash(url, contentHash, fetchedAt);

      return {
        sourceId,
        url,
        domain,
        status: 'ALLOWLIST_BLOCKED',
        rawContent: '',
        cleanText: '',
        contentHash,
        snapshotHash,
        fetchedAt,
        contentType: 'none',
        contentLength: 0,
        errorMessage: `Domain '${domain}' is not in the trusted allowlist policy`,
        metadata: {
          isAllowlisted: false,
        },
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs ?? this.timeoutMs);

      const response = await fetch(url, {
        headers: {
          'User-Agent': options?.userAgent ?? this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          ...(options?.customHeaders ?? {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const contentHash = this.computeHash('');
        const snapshotHash = this.computeSnapshotHash(url, contentHash, fetchedAt);

        return {
          sourceId,
          url,
          domain,
          status: 'FETCH_ERROR',
          rawContent: '',
          cleanText: '',
          contentHash,
          snapshotHash,
          fetchedAt,
          contentType: response.headers.get('content-type') || 'unknown',
          contentLength: 0,
          httpStatus: response.status,
          errorMessage: `HTTP Error ${response.status}: ${response.statusText}`,
          metadata: {
            etag: response.headers.get('etag') || undefined,
            lastModified: response.headers.get('last-modified') || undefined,
            isAllowlisted: true,
          },
        };
      }

      const contentType = response.headers.get('content-type') || 'text/html';
      const rawContent = await response.text();

      if (rawContent.length > this.maxContentLength) {
        const contentHash = this.computeHash('');
        const snapshotHash = this.computeSnapshotHash(url, contentHash, fetchedAt);

        return {
          sourceId,
          url,
          domain,
          status: 'INVALID_CONTENT',
          rawContent: '',
          cleanText: '',
          contentHash,
          snapshotHash,
          fetchedAt,
          contentType,
          contentLength: rawContent.length,
          httpStatus: response.status,
          errorMessage: `Content length (${rawContent.length} bytes) exceeds max limit (${this.maxContentLength} bytes)`,
          metadata: { isAllowlisted: true },
        };
      }

      const { cleanText, title, description, canonicalUrl } = this.extractContent(rawContent);
      const contentHash = this.computeHash(cleanText);
      const snapshotHash = this.computeSnapshotHash(url, contentHash, fetchedAt);

      const snapshot: SourceSnapshot = {
        sourceId,
        url,
        domain,
        status: 'SUCCESS',
        rawContent,
        cleanText,
        contentHash,
        snapshotHash,
        fetchedAt,
        contentType,
        contentLength: rawContent.length,
        httpStatus: response.status,
        metadata: {
          title,
          description,
          canonicalUrl,
          etag: response.headers.get('etag') || undefined,
          lastModified: response.headers.get('last-modified') || undefined,
          isAllowlisted: true,
        },
      };

      if (options?.snapshotDir || this.snapshotDir) {
        const dir = options?.snapshotDir || this.snapshotDir;
        if (dir) {
          await this.saveSnapshot(snapshot, dir);
        }
      }

      return snapshot;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const contentHash = this.computeHash('');
      const snapshotHash = this.computeSnapshotHash(url, contentHash, fetchedAt);

      return {
        sourceId,
        url,
        domain,
        status: 'FETCH_ERROR',
        rawContent: '',
        cleanText: '',
        contentHash,
        snapshotHash,
        fetchedAt,
        contentType: 'unknown',
        contentLength: 0,
        errorMessage: `Failed to retrieve source: ${errorMessage}`,
        metadata: {
          isAllowlisted: true,
        },
      };
    }
  }

  public async fetchBatch(urls: string[], options?: SourceRetrievalOptions): Promise<BatchRetrievalResult> {
    const snapshots: SourceSnapshot[] = [];

    for (const url of urls) {
      const snapshot = await this.fetchSource(url, options);
      snapshots.push(snapshot);
    }

    return {
      snapshots,
      total: snapshots.length,
      successful: snapshots.filter((s) => s.status === 'SUCCESS').length,
      blocked: snapshots.filter((s) => s.status === 'ALLOWLIST_BLOCKED').length,
      failed: snapshots.filter((s) => s.status === 'FETCH_ERROR' || s.status === 'INVALID_CONTENT').length,
    };
  }

  public async saveSnapshot(snapshot: SourceSnapshot, targetDir: string): Promise<string> {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = `${snapshot.sourceId}_${snapshot.snapshotHash.slice(0, 10)}.json`;
    const filePath = path.join(targetDir, filename);

    const payload = JSON.stringify(snapshot, null, 2);
    await fs.promises.writeFile(filePath, payload, 'utf8');

    return filePath;
  }

  public verifySnapshotIntegrity(snapshot: SourceSnapshot): boolean {
    if (snapshot.status === 'SUCCESS') {
      const expectedContentHash = this.computeHash(snapshot.cleanText);
      if (snapshot.contentHash !== expectedContentHash) {
        return false;
      }
    }

    const expectedSnapshotHash = this.computeSnapshotHash(
      snapshot.url,
      snapshot.contentHash,
      snapshot.fetchedAt
    );

    return snapshot.snapshotHash === expectedSnapshotHash;
  }

  public getAllowlist(): string[] {
    return Array.from(this.allowlist);
  }

  public addAllowedDomain(domain: string): void {
    this.allowlist.add(domain.toLowerCase().trim());
  }

  public removeAllowedDomain(domain: string): void {
    this.allowlist.delete(domain.toLowerCase().trim());
  }
}

export async function fetchSource(
  url: string,
  options?: SourceRetrievalOptions
): Promise<SourceSnapshot> {
  const retriever = new SourceRetriever({
    allowedDomains: options?.allowlist,
    allowSubdomains: options?.allowSubdomains,
  });
  return retriever.fetchSource(url, options);
}

export function verifySnapshotIntegrity(snapshot: SourceSnapshot): boolean {
  const retriever = new SourceRetriever();
  return retriever.verifySnapshotIntegrity(snapshot);
}

export function isDomainAllowed(url: string, allowlist?: string[]): boolean {
  const retriever = new SourceRetriever({ allowedDomains: allowlist });
  return retriever.isAllowedDomain(url);
}
