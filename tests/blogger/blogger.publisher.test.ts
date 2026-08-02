import { describe, expect, it } from 'vitest';
import { BloggerPublisher } from '../../packages/connectors/blogger/blogger.publisher';

describe('BloggerPublisher', () => {
  it('creates drafts with isDraft true', async () => {
    const calls: unknown[] = [];
    const publisher = new BloggerPublisher({
      insertPost: async (request) => { calls.push(request); return { id: 'post-1', status: 'DRAFT' }; },
      getPost: async () => ({ id: 'post-1', status: 'DRAFT' }),
      listPosts: async () => ([]),
    });

    await publisher.createDraft({ blogId: 'blog-1', title: 'Title', sanitizedHtml: '<p>Body</p>', labels: ['guide'] } as any);

    expect(calls).toEqual([expect.objectContaining({ blogId: 'blog-1', isDraft: true })]);
  });

  it('publishes posts with isDraft false', async () => {
    const calls: unknown[] = [];
    const publisher = new BloggerPublisher({
      insertPost: async (request) => { calls.push(request); return { id: 'post-1', status: 'LIVE' }; },
      getPost: async () => ({ id: 'post-1', status: 'LIVE' }),
      listPosts: async () => ([]),
    });

    await publisher.publishPost({ blogId: 'blog-1', title: 'Title', sanitizedHtml: '<p>Body</p>', labels: ['guide'] } as any);

    expect(calls).toEqual([expect.objectContaining({ blogId: 'blog-1', isDraft: false })]);
  });
});
