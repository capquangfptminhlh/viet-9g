import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    image: z.string().regex(/^\/images\/editorial\/[a-z0-9-]+\.svg$/).optional(),
  }),
});

export const collections = {
  'posts': postsCollection,
};
