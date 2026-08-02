import { google } from 'googleapis';
import { BloggerClient, BloggerPostRequest, BloggerPostResponse } from './blogger.types';
import { getBloggerAuth } from './blogger.auth';

export class RealBloggerClient implements BloggerClient {
  private client: any;

  constructor() {
    const { clientId, clientSecret, refreshToken } = getBloggerAuth();
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.client = google.blogger({ version: 'v3', auth: oauth2Client });
  }

  async insertPost(req: BloggerPostRequest): Promise<BloggerPostResponse> {
    const res = await this.client.posts.insert({
      blogId: req.blogId,
      isDraft: req.isDraft,
      requestBody: req.requestBody,
    });
    return res.data;
  }

  async getPost(blogId: string, postId: string): Promise<BloggerPostResponse> {
    const res = await this.client.posts.get({ blogId, postId, view: 'ADMIN' });
    return res.data;
  }

  async listPosts(blogId: string): Promise<BloggerPostResponse[]> {
    const res = await this.client.posts.list({ blogId, status: ['DRAFT', 'LIVE'] });
    return res.data.items || [];
  }
}

