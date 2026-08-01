import { describe, expect, it } from 'vitest';
import { verifyCreatedDraft } from '../../packages/connectors/blogger/blogger.verify';

describe('Blogger draft verify', () => {
  it('fails verification if Blogger returns a published post', async () => {
    const fakeClient = {
      insertPost: async () => ({ id: 'p1', status: 'LIVE' }),
      getPost: async () => ({ id: 'p1', status: 'LIVE' }),
      listPosts: async () => ([]),
    };
    await expect(verifyCreatedDraft(fakeClient, 'blog-1', 'p1', {} as any))
      .rejects.toThrow(/draft/i);
  });
});
