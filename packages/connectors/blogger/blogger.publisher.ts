import { BloggerClient, BloggerPostRequest, BloggerPostResponse, DraftPayload } from './blogger.types';

export class BloggerPublisher {
  constructor(private readonly client: BloggerClient) {}

  async createDraft(payload: DraftPayload): Promise<BloggerPostResponse> {
    const request: BloggerPostRequest = {
      blogId: payload.blogId,
      isDraft: true,
      requestBody: {
        title: payload.title,
        content: payload.sanitizedHtml,
        labels: payload.labels,
      },
    };
    return this.client.insertPost(request);
  }
}
