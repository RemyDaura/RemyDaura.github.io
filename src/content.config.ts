/**
 * Collection des dossiers : un fichier MDX par dossier et par langue,
 * nommé d'après son numéro (src/content/dossiers/fr/14.mdx, src/content/dossiers/en/14.mdx).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const dossiers = defineCollection({
  loader: glob({ pattern: '{fr,en}/[0-9][0-9].mdx', base: './src/content/dossiers' }),
  schema: z.object({
    /** Numéro du dossier, identique au nom du fichier. */
    num: z.number().int().min(1).max(99),
    /** Nom court, utilisé dans les listes. */
    title: z.string(),
    /** Titre de la page (h1). */
    headline: z.string(),
    /** Précision affichée après le numéro, par exemple "Projet personnel". */
    kind: z.string().optional(),
    status: z.enum(['production', 'archive']).default('archive'),
    /** Dossier principal (mis en avant sur l'accueil) ou pièce jointe. */
    featured: z.boolean().default(false),
    /** Une phrase : cartes de l'accueil et description pour les moteurs de recherche. */
    summary: z.string(),
    /** Le résultat marquant, affiché dans la liste des dossiers principaux. */
    highlight: z.string(),
    /** Paragraphe d'introduction de la page. */
    lede: z.string(),
    /** Chemin de la donnée, de la source au livrable. */
    lineage: z.array(z.string()).min(2),
    meta: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4).default([]),
    links: z.array(z.object({ label: z.string(), href: z.url(), primary: z.boolean().default(false) })).default([]),
    /** Phrase d'appel en bas de page (sinon, phrase par défaut). */
    cta: z.string().optional(),
  }),
});

export const collections = { dossiers };
