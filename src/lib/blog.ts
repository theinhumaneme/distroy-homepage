import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { dirname } from 'node:path';
import { blogCopy, cases, moreWork } from '../data/content';

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

// about 230 words a minute; code blocks count as words, which is close enough
export const readingTime = (p: Post) => blogCopy.minutes.replace('{n}', String(Math.max(1, Math.round((p.body ?? '').split(/\s+/).length / 230))));

// the project a post was written about, when that project's entry links to it
export const projectOf = (p: Post) => {
  const url = originalHref(p);
  return cases.find((c) => c.links.some((l) => l.url === url))?.title ?? moreWork.find((m) => m.url === url)?.title;
};
