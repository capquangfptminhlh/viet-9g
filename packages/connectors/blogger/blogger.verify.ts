import { BloggerClient, DraftPayload } from './blogger.types';

export async function verifyCreatedDraft(client: BloggerClient, blogId: string, postId: string, expected: DraftPayload): Promise<void> {
  const post = await client.getPost(blogId, postId);
  if (post.status !== 'DRAFT') {
    throw new Error(`Verification failed: Expected status DRAFT, got ${post.status}`);
  }
}
