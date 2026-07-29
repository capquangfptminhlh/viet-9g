import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
  }),
});

export const collections = {
  'posts': postsCollection,
};
