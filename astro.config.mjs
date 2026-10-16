import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://distroy.dev',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
