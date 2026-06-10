import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Dev-log / blog. Posts live in src/content/blog/*.md(x).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      // Set draft: true to keep a post unpublished (hidden + never emailed).
      draft: z.boolean().default(false),
      tag: z.string().default('Dev log'),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { blog };
