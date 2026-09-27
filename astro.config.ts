import { defineConfig } from 'astro/config';

const site = process.env.SITE_ORIGIN ?? 'https://example.github.io';
const base = process.env.SITE_BASE ?? '/SAFTG';

export default defineConfig({
  output: 'static',
  site,
  base,
  trailingSlash: 'always',
  vite: { build: { sourcemap: false } },
});
