import { DraftPayload } from '../connectors/blogger/blogger.types';
import { sanitizeBloggerHtml } from '../policy-engine/blogger-html-policy';
import { enforceBloggerLinks } from '../policy-engine/blogger-link-policy';

export interface ProposedPayload {
  blogId: string;
  title: string;
  htmlBody: string;
  labels?: string[];
}

export function generateBloggerDraftPayload(proposed: ProposedPayload): DraftPayload {
  const sanitized = sanitizeBloggerHtml(proposed.htmlBody);
  const validatedHtml = enforceBloggerLinks(sanitized);

  return {
    blogId: proposed.blogId,
    title: proposed.title,
    sanitizedHtml: validatedHtml,
    labels: proposed.labels,
  };
}
