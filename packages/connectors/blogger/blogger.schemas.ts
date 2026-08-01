import { z } from 'zod';

export const bloggerSiteSchema = z.object({
  blogId: z.string().min(1, 'blogId cannot be empty'),
  name: z.string().min(1),
  url: z.url(),
  enabled: z.boolean(),
  cadenceDays: z.number().int().min(1).max(90),
  contentCharter: z.string().min(1, 'contentCharter cannot be empty'),
  allowedDestination: z.literal('tracuugoicuoc.com'),
  defaultLabels: z.array(z.string()).optional(),
});

export const bloggerSitesConfigSchema = z.object({
  sites: z.array(bloggerSiteSchema)
    .max(3, 'Config allows a maximum of 3 Blogger sites')
    .refine(
      (sites) => new Set(sites.map((s) => s.blogId)).size === sites.length,
      { message: 'blogId values must be unique' }
    ),
});

export const topicSchema = z.object({
  topicId: z.string().min(1),
  targetBlogId: z.string().min(1),
  contentCharter: z.string().min(1),
  title: z.string().min(1),
  intent: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceFactIds: z.array(z.string()),
  status: z.enum(['QUEUE', 'IN_PROGRESS', 'DONE', 'HOLD']),
}).refine(
  (t) => t.sourceFactIds.length > 0,
  { message: 'Quantitative topics must include sourceFactIds' }
);

export const topicsConfigSchema = z.array(topicSchema).refine(
  (topics) => new Set(topics.map((t) => t.topicId)).size === topics.length,
  { message: 'topicId values must be unique' }
);

export function parseBloggerSites(data: unknown) {
  return bloggerSitesConfigSchema.parse(data);
}

export function parseTopics(data: unknown) {
  return topicsConfigSchema.parse(data);
}
