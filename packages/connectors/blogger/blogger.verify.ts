import { BloggerClient, DraftPayload } from './blogger.types';
import { enforceBloggerLinks } from '../../policy-engine/blogger-link-policy';

export async function verifyCreatedDraft(client: BloggerClient, blogId: string, postId: string, expected: DraftPayload): Promise<void> {
  const post = await client.getPost(blogId, postId);
  
  if (post.status !== 'DRAFT') {
    throw new Error(`Verification failed: Expected status DRAFT, got ${post.status}`);
  }
  
  if (post.id !== postId) {
    throw new Error(`Verification failed: Expected postId ${postId}, got ${post.id}`);
  }

  // Note: Blogger API sometimes returns empty content/title if not passed correctly
  if (expected.title && post.title !== expected.title) {
    throw new Error(`Verification failed: Expected title "${expected.title}", got "${post.title}"`);
  }

  if (expected.labels && expected.labels.length > 0) {
    const returnedLabels = post.labels || [];
    const missing = expected.labels.filter(l => !returnedLabels.includes(l));
    if (missing.length > 0) {
      throw new Error(`Verification failed: Missing labels [${missing.join(',')}]`);
    }
  }

  // Verify that the saved content complies with link policy
  if (post.content) {
    enforceBloggerLinks(post.content);
  }
}
