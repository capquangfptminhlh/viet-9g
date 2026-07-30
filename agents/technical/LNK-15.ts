/**
 * LNK-15: Internal Link Optimization & Anti-Orphan Page Engine
 * Master Spec v3.2 - Section 15 (Internal Linking & Topical Graph Architecture)
 * 
 * Provides automated topical graph construction, orphan page detection, PageRank-based
 * topical authority computation, and contextual link insertion recommendations.
 */

export type LinkType = 'contextual' | 'navigation' | 'sidebar' | 'footer' | 'breadcrumbs';

export interface PageNode {
  id: string; // Absolute URL or unique identifier
  url: string;
  title: string;
  topicCluster: string;
  keywords: string[];
  isPillar?: boolean;
  depth?: number;
  topicalAuthority?: number;
  wordCount?: number;
  incomingCount?: number;
  outgoingCount?: number;
}

export interface LinkEdge {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  relevanceScore: number;
  isContextual: boolean;
  type?: LinkType;
  isFollow?: boolean;
}

export interface TopicalGraph {
  nodes: Map<string, PageNode>;
  edges: LinkEdge[];
  clusters: Map<string, string[]>;
  createdAt: string;
}

export interface LinkRecommendation {
  sourceUrl: string;
  sourceTitle: string;
  targetUrl: string;
  targetTitle: string;
  suggestedAnchorText: string;
  relevanceScore: number;
  reason: string;
  cluster: string;
}

export interface OrphanPageReport {
  totalPages: number;
  orphanPages: PageNode[];
  nearOrphanPages: PageNode[]; // Pages with exactly 1 incoming link
  orphanRatio: number;
  recommendations: LinkRecommendation[];
}

export interface GraphAnalysisSummary {
  totalPages: number;
  totalLinks: number;
  orphanCount: number;
  nearOrphanCount: number;
  avgLinksPerPage: number;
  maxDepth: number;
  isolatedClusters: string[];
}

export interface TopicalGraphOptions {
  minIncomingLinks?: number;
  dampingFactor?: number;
  maxIterations?: number;
  similarityThreshold?: number;
  homeUrl?: string;
}

export class TopicalGraphEngine {
  private nodes: Map<string, PageNode> = new Map();
  private edges: LinkEdge[] = [];
  private clusters: Map<string, string[]> = new Map();
  private minIncomingLinks: number;
  private dampingFactor: number;
  private maxIterations: number;
  private similarityThreshold: number;
  private homeUrl: string;

  constructor(options: TopicalGraphOptions = {}) {
    this.minIncomingLinks = options.minIncomingLinks ?? 2;
    this.dampingFactor = options.dampingFactor ?? 0.85;
    this.maxIterations = options.maxIterations ?? 20;
    this.similarityThreshold = options.similarityThreshold ?? 0.3;
    this.homeUrl = options.homeUrl ?? 'https://tracuugoicuoc.com/';
  }

  /**
   * Import nodes and edges to build the topical graph
   */
  public buildGraph(nodes: PageNode[], edges: LinkEdge[]): TopicalGraph {
    this.nodes.clear();
    this.edges = [];
    this.clusters.clear();

    // Index nodes
    for (const node of nodes) {
      const normalizedUrl = this.normalizeUrl(node.url);
      const cleanNode: PageNode = {
        ...node,
        id: normalizedUrl,
        url: normalizedUrl,
        keywords: node.keywords || [],
        isPillar: node.isPillar ?? false,
        incomingCount: 0,
        outgoingCount: 0,
        topicalAuthority: 1.0,
      };
      this.nodes.set(normalizedUrl, cleanNode);

      // Group into clusters
      const cluster = cleanNode.topicCluster || 'uncategorized';
      if (!this.clusters.has(cluster)) {
        this.clusters.set(cluster, []);
      }
      this.clusters.get(cluster)!.push(normalizedUrl);
    }

    // Process & sanitize edges
    for (const edge of edges) {
      const source = this.normalizeUrl(edge.sourceUrl);
      const target = this.normalizeUrl(edge.targetUrl);

      // Self-referential link check
      if (source === target) continue;

      if (this.nodes.has(source) && this.nodes.has(target)) {
        const sanitizedEdge: LinkEdge = {
          ...edge,
          sourceUrl: source,
          targetUrl: target,
          isContextual: edge.isContextual ?? true,
          relevanceScore: edge.relevanceScore ?? 0.5,
          isFollow: edge.isFollow ?? true,
        };
        this.edges.push(sanitizedEdge);

        // Update counts
        const srcNode = this.nodes.get(source)!;
        const tgtNode = this.nodes.get(target)!;
        srcNode.outgoingCount = (srcNode.outgoingCount || 0) + 1;
        tgtNode.incomingCount = (tgtNode.incomingCount || 0) + 1;
      }
    }

    // Calculate depths & authorities
    this.calculateClickDepths();
    this.computeTopicalAuthority();

    return {
      nodes: this.nodes,
      edges: this.edges,
      clusters: this.clusters,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Detect orphan pages (0 incoming internal links) and near-orphans (< minIncomingLinks)
   */
  public detectOrphans(minIncoming: number = this.minIncomingLinks): OrphanPageReport {
    const orphanPages: PageNode[] = [];
    const nearOrphanPages: PageNode[] = [];

    for (const node of this.nodes.values()) {
      const incoming = node.incomingCount || 0;
      if (incoming === 0) {
        orphanPages.push(node);
      } else if (incoming < minIncoming) {
        nearOrphanPages.push(node);
      }
    }

    const totalPages = this.nodes.size;
    const orphanRatio = totalPages > 0 ? parseFloat((orphanPages.length / totalPages).toFixed(4)) : 0;
    const recommendations = this.generateRecommendationsForOrphans(orphanPages.concat(nearOrphanPages));

    return {
      totalPages,
      orphanPages,
      nearOrphanPages,
      orphanRatio,
      recommendations,
    };
  }

  /**
   * Compute Topical Authority (Weighted PageRank for topical nodes)
   */
  public computeTopicalAuthority(
    iterations: number = this.maxIterations,
    damping: number = this.dampingFactor
  ): Map<string, number> {
    const N = this.nodes.size;
    if (N === 0) return new Map();

    const authorityMap = new Map<string, number>();
    const initialScore = 1.0 / N;

    for (const url of this.nodes.keys()) {
      authorityMap.set(url, initialScore);
    }

    // Map incoming links per target node
    const incomingMap = new Map<string, LinkEdge[]>();
    for (const edge of this.edges) {
      if (!incomingMap.has(edge.targetUrl)) {
        incomingMap.set(edge.targetUrl, []);
      }
      incomingMap.get(edge.targetUrl)!.push(edge);
    }

    for (let iter = 0; iter < iterations; iter++) {
      const newScores = new Map<string, number>();

      for (const [url, node] of this.nodes.entries()) {
        const incomingEdges = incomingMap.get(url) || [];
        let rankSum = 0;

        for (const edge of incomingEdges) {
          const sourceNode = this.nodes.get(edge.sourceUrl);
          if (sourceNode && (sourceNode.outgoingCount || 0) > 0) {
            const sourceScore = authorityMap.get(edge.sourceUrl) || 0;
            const relevanceWeight = edge.relevanceScore || 0.5;
            rankSum += (sourceScore / sourceNode.outgoingCount!) * relevanceWeight;
          }
        }

        // Base formula: (1 - d) + d * sum(Score(in) / OutDegree * relevance)
        const pillarBoost = node.isPillar ? 1.2 : 1.0;
        const newScore = ((1 - damping) + damping * rankSum) * pillarBoost;
        newScores.set(url, newScore);
      }

      // Normalize scores
      for (const [url, score] of newScores.entries()) {
        authorityMap.set(url, score);
      }
    }

    // Attach to node objects
    for (const [url, score] of authorityMap.entries()) {
      const node = this.nodes.get(url);
      if (node) {
        node.topicalAuthority = parseFloat(score.toFixed(4));
      }
    }

    return authorityMap;
  }

  /**
   * Calculate shortest click depth from home page using Breadth-First Search (BFS)
   */
  public calculateClickDepths(startUrl: string = this.homeUrl): Map<string, number> {
    const depths = new Map<string, number>();
    const normalizedStart = this.normalizeUrl(startUrl);

    if (!this.nodes.has(normalizedStart)) {
      // Pick first node or pillar page as fallback start
      const firstKey = Array.from(this.nodes.keys())[0];
      if (!firstKey) return depths;
      startUrl = firstKey;
    } else {
      startUrl = normalizedStart;
    }

    // Build adjacency list (out-edges)
    const adj = new Map<string, string[]>();
    for (const edge of this.edges) {
      if (!adj.has(edge.sourceUrl)) {
        adj.set(edge.sourceUrl, []);
      }
      adj.get(edge.sourceUrl)!.push(edge.targetUrl);
    }

    const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
    const visited = new Set<string>([startUrl]);
    depths.set(startUrl, 0);

    while (queue.length > 0) {
      const { url, depth } = queue.shift()!;
      const neighbors = adj.get(url) || [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          depths.set(neighbor, depth + 1);
          queue.push({ url: neighbor, depth: depth + 1 });
        }
      }
    }

    // Set depth on nodes (unreachable pages stay depth 99)
    for (const [url, node] of this.nodes.entries()) {
      node.depth = depths.has(url) ? depths.get(url)! : 99;
    }

    return depths;
  }

  /**
   * Compute topical similarity between two nodes using keyword overlap & topic cluster matching
   */
  public calculateTopicalSimilarity(nodeA: PageNode, nodeB: PageNode): number {
    if (nodeA.id === nodeB.id) return 1.0;

    let score = 0;

    // Cluster match bonus
    if (nodeA.topicCluster && nodeB.topicCluster && nodeA.topicCluster === nodeB.topicCluster) {
      score += 0.4;
    }

    // Jaccard similarity of keywords
    const setA = new Set((nodeA.keywords || []).map((k) => k.toLowerCase().trim()));
    const setB = new Set((nodeB.keywords || []).map((k) => k.toLowerCase().trim()));

    if (setA.size > 0 && setB.size > 0) {
      let intersection = 0;
      for (const item of setA) {
        if (setB.has(item)) intersection++;
      }
      const union = setA.size + setB.size - intersection;
      const jaccard = union > 0 ? intersection / union : 0;
      score += jaccard * 0.6;
    }

    return parseFloat(Math.min(1.0, score).toFixed(4));
  }

  /**
   * Generate internal link recommendations for orphan or target pages
   */
  public generateRecommendationsForOrphans(targetOrphans: PageNode[]): LinkRecommendation[] {
    const recommendations: LinkRecommendation[] = [];
    const existingEdgeSet = new Set(this.edges.map((e) => `${e.sourceUrl}->${e.targetUrl}`));

    for (const orphan of targetOrphans) {
      // Find candidate source nodes in the same cluster or pillar pages
      const candidates: Array<{ node: PageNode; similarity: number }> = [];

      for (const candidateNode of this.nodes.values()) {
        if (candidateNode.id === orphan.id) continue;
        const edgeKey = `${candidateNode.id}->${orphan.id}`;
        if (existingEdgeSet.has(edgeKey)) continue;

        // Favor pillar pages or nodes with high topical authority
        const sim = this.calculateTopicalSimilarity(candidateNode, orphan);
        const authorityBonus = (candidateNode.topicalAuthority || 1.0) * 0.1;
        const totalSim = sim + authorityBonus;

        if (totalSim >= this.similarityThreshold) {
          candidates.push({ node: candidateNode, similarity: totalSim });
        }
      }

      // Sort by similarity score descending
      candidates.sort((a, b) => b.similarity - a.similarity);

      // Select top 2-3 source pages
      const topCandidates = candidates.slice(0, 3);
      for (const candidate of topCandidates) {
        const suggestedAnchorText = orphan.keywords && orphan.keywords.length > 0
          ? orphan.keywords[0]
          : orphan.title;

        recommendations.push({
          sourceUrl: candidate.node.url,
          sourceTitle: candidate.node.title,
          targetUrl: orphan.url,
          targetTitle: orphan.title,
          suggestedAnchorText,
          relevanceScore: parseFloat(candidate.similarity.toFixed(4)),
          reason: candidate.node.topicCluster === orphan.topicCluster
            ? `Cùng Topic Cluster (${orphan.topicCluster}) - Chống orphan page`
            : `Độ tương quan chủ đề cao (${(candidate.similarity * 100).toFixed(0)}%) - Củng cố topical graph`,
          cluster: orphan.topicCluster || 'uncategorized',
        });
      }
    }

    return recommendations;
  }

  /**
   * Auto-fix orphan pages by inserting missing edges into graph
   */
  public fixOrphans(): { updatedGraph: TopicalGraph; insertedLinks: LinkEdge[]; resolvedOrphansCount: number } {
    const report = this.detectOrphans();
    const insertedLinks: LinkEdge[] = [];

    for (const rec of report.recommendations) {
      const edgeKey = `${rec.sourceUrl}->${rec.targetUrl}`;
      const exists = this.edges.some((e) => `${e.sourceUrl}->${e.targetUrl}` === edgeKey);

      if (!exists) {
        const newEdge: LinkEdge = {
          sourceUrl: rec.sourceUrl,
          targetUrl: rec.targetUrl,
          anchorText: rec.suggestedAnchorText,
          relevanceScore: rec.relevanceScore,
          isContextual: true,
          type: 'contextual',
          isFollow: true,
        };
        this.edges.push(newEdge);
        insertedLinks.push(newEdge);

        // Update counts
        const src = this.nodes.get(rec.sourceUrl);
        const tgt = this.nodes.get(rec.targetUrl);
        if (src) src.outgoingCount = (src.outgoingCount || 0) + 1;
        if (tgt) tgt.incomingCount = (tgt.incomingCount || 0) + 1;
      }
    }

    // Recalculate graph metrics after fix
    this.calculateClickDepths();
    this.computeTopicalAuthority();

    const postReport = this.detectOrphans();
    const resolvedOrphansCount = report.orphanPages.length - postReport.orphanPages.length;

    return {
      updatedGraph: {
        nodes: this.nodes,
        edges: this.edges,
        clusters: this.clusters,
        createdAt: new Date().toISOString(),
      },
      insertedLinks,
      resolvedOrphansCount: Math.max(0, resolvedOrphansCount),
    };
  }

  /**
   * Analyze graph overview & health
   */
  public analyzeGraph(): GraphAnalysisSummary {
    const totalPages = this.nodes.size;
    const totalLinks = this.edges.length;
    let orphanCount = 0;
    let nearOrphanCount = 0;
    let maxDepth = 0;

    for (const node of this.nodes.values()) {
      const inc = node.incomingCount || 0;
      if (inc === 0) orphanCount++;
      else if (inc < this.minIncomingLinks) nearOrphanCount++;

      if (node.depth !== undefined && node.depth !== 99 && node.depth > maxDepth) {
        maxDepth = node.depth;
      }
    }

    const isolatedClusters: string[] = [];
    for (const [clusterName, urls] of this.clusters.entries()) {
      let internalClusterEdges = 0;
      for (const edge of this.edges) {
        const srcNode = this.nodes.get(edge.sourceUrl);
        const tgtNode = this.nodes.get(edge.targetUrl);
        if (srcNode?.topicCluster === clusterName && tgtNode?.topicCluster === clusterName) {
          internalClusterEdges++;
        }
      }
      if (internalClusterEdges === 0 && urls.length > 1) {
        isolatedClusters.push(clusterName);
      }
    }

    const avgLinksPerPage = totalPages > 0 ? parseFloat((totalLinks / totalPages).toFixed(2)) : 0;

    return {
      totalPages,
      totalLinks,
      orphanCount,
      nearOrphanCount,
      avgLinksPerPage,
      maxDepth,
      isolatedClusters,
    };
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    try {
      if (url.startsWith('/')) {
        url = `https://tracuugoicuoc.com${url}`;
      }
      const parsed = new URL(url);
      let pathname = parsed.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      return `${parsed.origin}${pathname}`;
    } catch {
      return url.trim().toLowerCase().replace(/\/$/, '');
    }
  }
}

/**
 * Standalone Helper Functions for Easy Export & Agent Execution
 */

export function buildTopicalGraph(nodes: PageNode[], edges: LinkEdge[], options?: TopicalGraphOptions): TopicalGraph {
  const engine = new TopicalGraphEngine(options);
  return engine.buildGraph(nodes, edges);
}

export function detectOrphanPages(nodes: PageNode[], edges: LinkEdge[], minIncoming?: number): OrphanPageReport {
  const engine = new TopicalGraphEngine({ minIncomingLinks: minIncoming });
  engine.buildGraph(nodes, edges);
  return engine.detectOrphans(minIncoming);
}

export function preventOrphanPages(nodes: PageNode[], edges: LinkEdge[]): { newEdges: LinkEdge[]; report: OrphanPageReport } {
  const engine = new TopicalGraphEngine();
  engine.buildGraph(nodes, edges);
  const fixResult = engine.fixOrphans();
  const report = engine.detectOrphans();

  return {
    newEdges: fixResult.insertedLinks,
    report,
  };
}

export function analyzeInternalLinks(nodes: PageNode[], edges: LinkEdge[]): GraphAnalysisSummary {
  const engine = new TopicalGraphEngine();
  engine.buildGraph(nodes, edges);
  return engine.analyzeGraph();
}
