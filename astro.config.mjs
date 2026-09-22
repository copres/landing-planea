import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
// import node from '@astrojs/node';
// import vercel from '@astrojs/vercel'; // Para SSR (también hay /static)

// https://astro.build/config
export default defineConfig({
  // output: 'server',
  // adapter: vercel(),
  site: 'https://www.metrokubiko.com/',

  viewTransitions: true,

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },

  integrations: [
    tailwind({}), 
    compress(), 
    svelte(), 
    sitemap(),
    mdx()
  ],

  adapter: vercel(),
});