import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  site: 'https://julien-wyss.ch/',
  base: '/',
  integrations: [sitemap()]
});