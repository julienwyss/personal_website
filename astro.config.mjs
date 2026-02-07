// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://julienwyss.github.io/personal_website/',
  base: import.meta.env.PROD ? '/personal_website/' : '/'
});