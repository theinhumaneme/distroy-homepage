import { defineConfig } from 'astro/config';

// Chunks built only from node_modules (gsap, mermaid and its renderers) go to
// _astro/vendor/, so the claims guard can tell third-party code from ours.
const isVendor = (chunk) => chunk.moduleIds.length > 0 && chunk.moduleIds.every((id) => id.includes('/node_modules/'));

export default defineConfig({
  site: 'https://distroy.dev',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  markdown: {
    // mermaid blocks in the blog are drawn by mermaid on the page, not highlighted
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { theme: 'github-dark-default', langAlias: { Dockerfile: 'dockerfile', Procfile: 'yaml', env: 'dotenv' } },
  },
  vite: {
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              chunkFileNames: (chunk) => (isVendor(chunk) ? '_astro/vendor/[name].[hash].js' : '_astro/[name].[hash].js'),
            },
          },
        },
      },
    },
  },
});
