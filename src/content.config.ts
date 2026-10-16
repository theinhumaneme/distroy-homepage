import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { hugoPosts } from './lib/hugo';

// Hugo frontmatter mixes TOML and YAML, so `draft` arrives as a boolean or a string
const flag = z.preprocess((v) => v === true || v === 'true', z.boolean());

const blog = defineCollection({
  loader: hugoPosts({ base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    summary: z.string().optional(),
    date: z.coerce.date(),
    draft: flag.default(false),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    series: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
