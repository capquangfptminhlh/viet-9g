import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeNormalizeInternalLinks from './src/markdown/rehype-normalize-internal-links.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.tracuugoicuoc.com',
  output: 'static',
  trailingSlash: 'never',
  markdown: {
    rehypePlugins: [rehypeNormalizeInternalLinks],
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => new URL(page).pathname !== '/404',
    })
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
});
