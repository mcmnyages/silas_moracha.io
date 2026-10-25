// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Where the site is deployed: a custom domain served from the root.
// `public/CNAME` must hold the same hostname so GitHub Pages keeps it.
const SITE = 'https://silas.lacefi.co.ke';
const BASE = '/';

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
