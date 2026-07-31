/**
 * AGT-31: Agentic Readiness
 * Master Spec v3.2 - Optional audit for accessibility tree, ARIA, forms/actions and safe browser-agent interaction.
 */

export interface AuditIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
}

export interface AgentResult {
  score: number;
  issues: AuditIssue[];
  recommendations: string[];
}

export class AgenticReadiness {
  public checkReadiness(htmlContent: string): AgentResult {
    const issues: AuditIssue[] = [];
    
    // Very basic string-based checks for demonstration/audit purposes
    // since we don't have a real DOM parsed here in this isolated unit.
    
    // 1. Accessibility Tree & ARIA
    if (!htmlContent.includes('aria-label') && !htmlContent.includes('aria-labelledby')) {
      issues.push({
        id: 'AGT-31-01',
        title: 'Missing ARIA Labels',
        description: 'No ARIA attributes found. Adding them improves the accessibility tree for both screen readers and AI agents.',
        severity: 'low',
        score: 0.8
      });
    }

    // 2. Forms and Actions
    if (htmlContent.includes('<form') && !htmlContent.includes('action=') && !htmlContent.includes('onsubmit=')) {
      issues.push({
        id: 'AGT-31-02',
        title: 'Form Action Missing',
        description: `Form lacks an 'action' or 'onsubmit' attribute, hindering automated interaction.`,
        severity: 'medium',
        score: 0.5
      });
    }

    // 3. Safe Browser-Agent Interaction (Semantic HTML)
    if (htmlContent.includes('<button') && !htmlContent.includes('type=')) {
      issues.push({
        id: 'AGT-31-03',
        title: 'Missing Button Type',
        description: 'Button explicitly needs a type (button, submit, reset) to prevent ambiguous behavior during AI agent interaction.',
        severity: 'low',
        score: 0.9
      });
    }

    const overallScore = issues.length > 0 
      ? issues.reduce((acc, curr) => acc + curr.score, 0) / issues.length 
      : 1.0;

    return {
      score: overallScore,
      issues,
      recommendations: [
        'Ensure all interactive elements have semantic meaning and accessibility labels.',
        'Use explicit form actions and input types for predictable agentic automation.',
        'Validate the accessibility tree against WAI-ARIA standards for better AI Agent parsing.'
      ]
    };
  }
}

export function runAgenticReadinessAudit(htmlContent: string): AgentResult {
  const readiness = new AgenticReadiness();
  return readiness.checkReadiness(htmlContent);
}
