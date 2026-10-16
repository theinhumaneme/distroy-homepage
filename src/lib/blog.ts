import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { dirname } from 'node:path';

export type Post = CollectionEntry<'blog'>;

export const getPosts = async () =>
  (await getCollection('blog', (p) => !p.data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const postHref = (p: Post) => `/blog/${p.id}/`;

// Hugo's original address, kept as the canonical while that blog stays up
export const originalHref = (p: Post) => `https://kalyanmudumby.com/post/${p.id}/`;

export const postDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

// Blowfish uses a bundle's featured.* as its cover; do the same
const covers = import.meta.glob<ImageMetadata>('../content/blog/**/featured.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
export const coverOf = (p: Post) => {
  const dir = dirname(p.filePath ?? '').replace(/^src\/content\//, '../content/');
  return Object.entries(covers).find(([k]) => dirname(k) === dir)?.[1];
};
