// Loads the Hugo blog (src/content/blog, copied verbatim from the blog repo)
// through Astro's own glob loader. The post files are never edited: the
// Hugo/Blowfish shortcodes they use are rewritten to plain Markdown/HTML in
// memory, just before Astro renders each body.
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';

type PostRef = { slug: string; title: string; description: string };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const attrs = (s: string): Record<string, string> =>
  Object.fromEntries([...s.matchAll(/(\w+)=(?:"([^"]*)"|(\S+))/g)].map((m) => [m[1], m[2] ?? m[3]]));

const card = (href: string, kicker: string, title: string, line = '', external = true) =>
  `<a class="post-card" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>` +
  `<span class="pc-k mono">${esc(kicker)}</span><span class="pc-t">${esc(title)}</span>` +
  (line ? `<span class="pc-l">${esc(line)}</span>` : '') +
  `</a>`;

const walk = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && d.name !== '.DS_Store')
    .map((d) => join(d.parentPath, d.name));

type EntryType = NonNullable<ReturnType<LoaderContext['entryTypes']['get']>>;

/** Hugo addresses posts by folder name or by `slug`; both map to the slug. */
async function indexPosts(root: string, md: EntryType, hold: string[]) {
  const refs = new Map<string, PostRef>();
  for (const file of walk(root).filter((f) => basename(f) === 'index.md' && !hold.some((h) => relative(root, f).startsWith(h + '/')))) {
    const { data: fm } = await md.getEntryInfo({ contents: readFileSync(file, 'utf8'), fileUrl: pathToFileURL(file) });
    const ref = { slug: String(fm.slug), title: String(fm.title), description: String(fm.description ?? '') };
    refs.set(ref.slug, ref);
    refs.set(basename(dirname(file)), ref);
  }
  return refs;
}

/** Some image paths in the posts point at files that moved inside the bundle
 *  (`images/2022/04/x.png`, `imagesregrambot-4.jpg`); resolve them by name. */
function resolveImage(path: string, dir: string, files: string[]) {
  if (/^(https?:|\/|data:)/.test(path)) return path;
  const want = decodeURIComponent(path.replace(/^\.\//, ''));
  if (files.includes(join(dir, want))) return path;
  const hit = files.filter((f) => want.endsWith(basename(f))).sort((a, b) => basename(b).length - basename(a).length)[0];
  return hit ? './' + relative(dir, hit) : path;
}

export function hugoToMarkdown(body: string, file: string, posts: Map<string, PostRef>, warn: (m: string) => void) {
  const dir = dirname(file);
  const files = walk(dir);
  const postHref = (link: string) => {
    const m = link.match(/(?:^|\/)post\/([^/)]+)\/?(?:index\.md)?$/);
    const ref = m && posts.get(m[1]);
    return ref ? `/blog/${ref.slug}/` : undefined;
  };

  return (
    body
      .replace(/\{\{<\s*mermaid\s*>\}\}([\s\S]*?)\{\{<\s*\/mermaid\s*>\}\}/g, (_, code: string) => '```mermaid\n' + code.trim() + '\n```')
      .replace(/\{\{<\s*alert\s*>\}\}([\s\S]*?)\{\{<\s*\/alert\s*>\}\}/g, (_, inner: string) => `<aside class="post-alert">\n\n${inner.trim()}\n\n</aside>`)
      .replace(/\{\{<\s*button\s+(.*?)\s*>\}\}([\s\S]*?)\{\{<\s*\/button\s*>\}\}/g, (_, a: string, label: string) => {
        const { href = '#' } = attrs(a);
        const ext = /^https?:/.test(href);
        return `<a class="btn" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(label.trim())}${ext ? ' <span class="arr" aria-hidden="true">↗</span>' : ''}</a>`;
      })
      .replace(/\{\{<\s*github\s+(.*?)\s*>\}\}/g, (_, a: string) => {
        const { repo } = attrs(a);
        return card(`https://github.com/${repo}`, 'github.com', repo);
      })
      .replace(/\{\{<\s*youtubeLite\s+(.*?)\s*>\}\}/g, (_, a: string) => {
        const { id, label = 'YouTube video' } = attrs(a);
        return card(`https://www.youtube.com/watch?v=${id}`, 'youtube.com', label);
      })
      .replace(/\{\{<\s*article\s+(.*?)\s*>\}\}/g, (_, a: string) => {
        const { link = '' } = attrs(a);
        const href = postHref(link.replace(/\/$/, ''));
        const ref = href && posts.get(href.split('/')[2]);
        if (!ref) {
          warn(`${relative(process.cwd(), file)}: article shortcode points at ${link}, which is not a post; left out`);
          return '';
        }
        return card(href, 'Related post', ref.title, ref.description, false);
      })
      // links to other posts: Hugo paths, .md paths and absolute blog URLs
      .replace(/\]\(((?:https?:\/\/(?:www\.)?kalyanmudumby\.com)?[./]*\/?post\/[^)\s]+)\)/g, (m, link: string) => {
        const href = postHref(link.replace(/\/$/, ''));
        return href ? `](${href})` : m;
      })
      .replace(/(!\[[^\]]*\]\()([^)\s]+)/g, (_, pre: string, path: string) => pre + resolveImage(path, dir, files))
  );
}

/** The glob loader, with the Markdown entry type taught Hugo's shortcodes. */
/** `hold` lists post folders to leave out of the site for now. */
export function hugoPosts(opts: { base: string; hold?: string[] }): Loader {
  const hold = opts.hold ?? [];
  const inner = glob({ pattern: ['**/index.md', ...hold.map((h) => `!${h}/**`)], base: opts.base });
  return {
    name: 'hugo-posts',
    async load(ctx: LoaderContext) {
      const md = ctx.entryTypes.get('.md');
      if (!md) throw new Error('hugo-posts: no Markdown entry type');
      const root = fileURLToPath(new URL(opts.base.replace(/\/?$/, '/'), ctx.config.root));
      const posts = await indexPosts(root, md, hold);
      const entryTypes = new Map(ctx.entryTypes);
      entryTypes.set('.md', {
        ...md,
        getEntryInfo: async (p) => {
          const info = await md.getEntryInfo(p);
          return { ...info, body: hugoToMarkdown(info.body, fileURLToPath(p.fileUrl), posts, (m) => ctx.logger.warn(m)) };
        },
      });
      return inner.load({ ...ctx, entryTypes });
    },
  };
}
