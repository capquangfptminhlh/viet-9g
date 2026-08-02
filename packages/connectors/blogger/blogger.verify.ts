import { BloggerClient, DraftPayload } from './blogger.types';
import { enforceBloggerLinks } from '../../policy-engine/blogger-link-policy';

export async function verifyCreatedPost(
  client: BloggerClient,
  blogId: string,
  postId: string,
  expected: DraftPayload,
  expectedStatus: 'DRAFT' | 'LIVE',
): Promise<void> {
  const post = await client.getPost(blogId, postId);
  if (post.blog?.id !== blogId) {
    throw new Error(`Verification failed: Expected blogId ${blogId}, got ${post.blog?.id || 'missing'}`);
  }
  
  if (post.status !== expectedStatus) {
    throw new Error(`Verification failed: Expected status ${expectedStatus}, got ${post.status}`);
  }
  
  if (post.id !== postId) {
    throw new Error(`Verification failed: Expected postId ${postId}, got ${post.id}`);
  }

  // Note: Blogger API sometimes returns empty content/title if not passed correctly
  if (expected.title && post.title !== expected.title) {
    throw new Error(`Verification failed: Expected title "${expected.title}", got "${post.title}"`);
  }

  const returnedLabels = [...(post.labels || [])].sort();
  const expectedLabels = [...(expected.labels || [])].sort();
  if (returnedLabels.join('\u0000') !== expectedLabels.join('\u0000')) {
    throw new Error('Verification failed: Labels do not match');
  }

  // Verify that the saved content complies with link policy
  if (!post.content) throw new Error('Verification failed: Post content is missing');
  enforceBloggerLinks(post.content);
}

export async function verifyCreatedDraft(
  client: BloggerClient,
  blogId: string,
  postId: string,
  expected: DraftPayload,
): Promise<void> {
  return verifyCreatedPost(client, blogId, postId, expected, 'DRAFT');
}
