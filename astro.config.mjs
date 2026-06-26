// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// Update this to your real domain before launch (used for SEO + sitemap).
const SITE = 'https://hoofandclaw.org';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // The site stays static-by-default; only routes that opt out with
  // `export const prerender = false` (e.g. /api/quiz) run on-demand as a
  // Cloudflare Pages Function — that keeps the Claude API key server-side.
  // platformProxy lets `astro dev` read Cloudflare-style env (from .dev.vars).
  // imageService 'compile' optimizes images at build time (all pages are static),
  // so Cloudflare's runtime — which has no sharp — never needs an image service.
  adapter: cloudflare({ platformProxy: { enabled: true }, imageService: 'compile' }),
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
