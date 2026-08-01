import sanitizeHtml from 'sanitize-html';

export function sanitizeBloggerHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'a', 'br'],
    allowedAttributes: {
      'a': ['href', 'rel', 'target']
    },
    disallowedTagsMode: 'discard',
  });
}
