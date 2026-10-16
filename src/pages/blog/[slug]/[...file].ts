// Serves the non-image files that ship inside a post's bundle (the AdGuard
// slide deck, the observability config files) at the same relative paths
// the posts link to. Images go through astro:assets instead.
import type { APIRoute, GetStaticPaths } from 'astro';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { getPosts } from '../../../lib/blog';

const IMAGE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const TYPES: Record<string, string> = { '.pdf': 'application/pdf', '.yml': 'text/yaml', '.yaml': 'text/yaml' };

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.flatMap((p) => {
    const dir = dirname(p.filePath!);
    return readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile() && !d.name.endsWith('.md') && !IMAGE.test(d.name) && d.name !== '.DS_Store')
      .map((d) => {
        const path = join(d.parentPath, d.name);
        return { params: { slug: p.id, file: relative(dir, path) }, props: { path } };
      });
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(readFileSync(props.path), {
    headers: { 'Content-Type': TYPES[extname(props.path).toLowerCase()] ?? 'application/octet-stream' },
  });
