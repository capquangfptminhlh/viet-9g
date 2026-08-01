import { describe, expect, it } from 'vitest';
import { verifyCreatedDraft } from '../../packages/connectors/blogger/blogger.verify';

describe('Blogger draft verify', () => {
  it('fails verification if Blogger returns a published post', async () => {
    const fakeClient = {
      insertPost: async () => ({ id: 'p1', status: 'LIVE' }),
      getPost: async () => ({ id: 'p1', blog: { id: 'blog-1' }, status: 'LIVE' }),
      listPosts: async () => ([]),
    };
    await expect(verifyCreatedDraft(fakeClient as any, 'blog-1', 'p1', {} as any))
      .rejects.toThrow(/draft/i);
  });

  it('fails verification if titles do not match', async () => {
    const fakeClient = {
      getPost: async () => ({ id: 'p1', blog: { id: 'blog-1' }, status: 'DRAFT', title: 'Wrong title', content: '<p>ok</p>' }),
    };
    await expect(verifyCreatedDraft(fakeClient as any, 'blog-1', 'p1', { title: 'Correct title' } as any))
      .rejects.toThrow(/title/i);
  });

  it('fails verification if labels are missing', async () => {
    const fakeClient = {
      getPost: async () => ({ id: 'p1', blog: { id: 'blog-1' }, status: 'DRAFT', title: 'A', labels: ['Tag 1'], content: '<p>ok</p>' }),
    };
    await expect(verifyCreatedDraft(fakeClient as any, 'blog-1', 'p1', { title: 'A', labels: ['Tag 1', 'Tag 2'] } as any))
      .rejects.toThrow(/labels/i);
  });

  it('fails verification if content violates link policy', async () => {
    const fakeClient = {
      getPost: async () => ({ id: 'p1', blog: { id: 'blog-1' }, status: 'DRAFT', title: 'A', content: '<a href="1"></a><a href="2"></a>' }),
    };
    await expect(verifyCreatedDraft(fakeClient as any, 'blog-1', 'p1', { title: 'A' } as any))
      .rejects.toThrow(/policy/i);
  });
});
