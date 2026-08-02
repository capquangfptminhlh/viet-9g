export interface BloggerPostRequest {
  blogId: string;
  isDraft: boolean;
  requestBody: {
    title: string;
    content: string;
    labels?: string[];
  };
}

export interface BloggerPostResponse {
  id: string;
  blog?: { id?: string };
  status: string;
  title?: string;
  content?: string;
  labels?: string[];
  url?: string;
}

export interface BloggerClient {
  insertPost(req: BloggerPostRequest): Promise<BloggerPostResponse>;
  getPost(blogId: string, postId: string): Promise<BloggerPostResponse>;
  listPosts(blogId: string): Promise<BloggerPostResponse[]>;
}

export interface DraftPayload {
  blogId: string;
  title: string;
  sanitizedHtml: string;
  labels?: string[];
}
