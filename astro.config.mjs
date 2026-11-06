// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://remydaura.github.io',
  trailingSlash: 'always',

  // Français à la racine, anglais sous /en/
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: { prefixDefaultLocale: false },
  },

  markdown: {
    // Pas de typographie automatique : apostrophes droites et tirets simples, comme dans le reste du site.
    processor: satteri({ features: { smartPunctuation: false } }),
  },

  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr-FR', en: 'en-GB' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
