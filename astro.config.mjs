// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Where the site is deployed. If you move to a custom domain (e.g. silasmoracha.dev)
// or rename the repo to `mcmnyages.github.io`, set SITE to the new origin and BASE to '/'.
const SITE = 'https://mcmnyages.github.io';
const BASE = '/silas_moracha.io';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
