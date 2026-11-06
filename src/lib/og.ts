/**
 * Images de partage (1200 x 630) générées au build : une pour l'accueil et une par dossier,
 * dans chaque langue. Satori transforme la mise en page en SVG (textes vectorisés avec
 * IBM Plex), puis sharp la convertit en PNG.
 *
 * Un caractère absent des polices (une flèche tapée dans un titre, par exemple) fait
 * échouer le build plutôt que de publier une image avec un carré vide.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '../data/site';
import { HOME } from '../i18n/home';
import { useTranslations, type Lang } from '../i18n/ui';
import { pad, type Dossier } from './dossiers';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
/** Largeur de la colonne de texte : image, moins les marges (80 + 72), la trace (24) et l'espace (48). */
const MAIN_WIDTH = OG_WIDTH - 80 - 72 - 24 - 48;

const C = {
  bg: '#0e141b',
  text: '#e6edf3',
  text2: '#b8c3ce',
  text4: '#6b7886',
  line: '#3a4757',
  accent: '#f2b04c',
  source: '#8fb8e8',
  ok: '#4cc38a',
};

/** Textes propres aux images de partage. */
const COPY: Record<Lang, { available: string; stack: string }> = {
  fr: { available: 'disponible · CDD 6-8 mois', stack: 'SQL · BigQuery · dbt · Python' },
  en: { available: 'available · 6-8 month contract', stack: 'SQL · BigQuery · dbt · Python' },
};

type El = string | { type: string; props: Record<string, unknown> };

/** Les polices n'ont pas l'espace fine insécable (U+202F) des nombres français : espace insécable à la place. */
const text = (child: El): El => (typeof child === 'string' ? child.replace(/\u202f/g, '\u00a0') : child);

function h(type: string, style: Record<string, unknown>, ...children: El[]): El {
  const list = children.map(text);
  return { type, props: { style, children: list.length === 1 ? list[0] : list } };
}

/** Flèche dessinée (la police n'a pas le caractère →). */
function arrow(color: string, size = 1): El {
  return {
    type: 'svg',
    props: {
      width: 22 * size,
      height: 14 * size,
      viewBox: '0 0 22 14',
      children: [
        {
          type: 'path',
          props: {
            d: 'M1 7h18M13 1l6 6-6 6',
            stroke: color,
            'stroke-width': 2,
            fill: 'none',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          },
        },
      ],
    },
  };
}

function fonts() {
  const file = (pkg: string, name: string) => readFileSync(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', name));
  return [
    { name: 'Plex', data: file('ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
    { name: 'Plex', data: file('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
    { name: 'Plex', data: file('ibm-plex-sans', 'ibm-plex-sans-latin-ext-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
    { name: 'PlexMono', data: file('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
    { name: 'PlexMono', data: file('ibm-plex-mono', 'ibm-plex-mono-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  ];
}

let loadedFonts: ReturnType<typeof fonts> | undefined;

async function render(element: El, name: string): Promise<Buffer> {
  loadedFonts ??= fonts();
  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: loadedFonts,
    loadAdditionalAsset: async (_code: string, segment: string) => {
      throw new Error(`Image de partage ${name} : caractère absent des polices, "${segment}"`);
    },
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** La trace verticale, à gauche de chaque image. */
function rail(): El {
  const line = (height: number | string) => h('div', { width: 2, height, background: C.accent, flexShrink: 0 });
  return h(
    'div',
    { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 },
    line(76),
    h('div', { width: 20, height: 20, borderRadius: 10, background: C.accent, flexShrink: 0 }),
    line(214),
    h('div', { width: 20, height: 20, borderRadius: 10, border: `3px solid ${C.accent}`, background: C.bg, flexShrink: 0 }),
    h('div', { width: 2, flexGrow: 1, background: C.accent }),
  );
}

function frame(main: El): El {
  return h(
    'div',
    {
      display: 'flex',
      gap: 48,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      padding: '0 72px 0 80px',
      background: C.bg,
      borderBottom: `6px solid ${C.accent}`,
      color: C.text,
      fontFamily: 'Plex',
    },
    rail(),
    main,
  );
}

function brand(size: number): El {
  return h(
    'div',
    { display: 'flex', fontFamily: 'PlexMono', fontSize: size, fontWeight: 600 },
    'remy_daura',
    h('span', { color: C.accent }, '.'),
    'trace',
  );
}

/** "Rémy D'AURA · Data Analyst → Data Engineer" */
function who(size: number, weight: number): El {
  return h(
    'div',
    { display: 'flex', alignItems: 'center', gap: Math.round(size / 3), fontSize: size, fontWeight: weight },
    `${SITE.name} · Data Analyst`,
    arrow(C.text2, size / 24),
    'Data Engineer',
  );
}

const url = (): El => h('div', { display: 'flex', color: C.accent }, SITE.url.replace('https://', ''));

export function homeImage(lang: Lang): Promise<Buffer> {
  const copy = COPY[lang];
  const main = h(
    'div',
    { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: MAIN_WIDTH, padding: '64px 0 60px' },
    h(
      'div',
      { display: 'flex', flexDirection: 'column', gap: 26 },
      brand(26),
      h('div', { display: 'flex', fontSize: lang === 'fr' ? 82 : 76, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 0.98 }, HOME[lang].hero.title),
    ),
    h(
      'div',
      { display: 'flex', flexDirection: 'column', gap: 18 },
      who(32, 500),
      h(
        'div',
        { display: 'flex', flexWrap: 'wrap', gap: '10px 22px', alignItems: 'center', fontFamily: 'PlexMono', fontSize: 21, color: C.text2 },
        h(
          'div',
          { display: 'flex', alignItems: 'center', gap: 10, color: C.ok },
          h('div', { width: 11, height: 11, borderRadius: 6, background: C.ok }),
          copy.available,
        ),
        h('div', { display: 'flex' }, copy.stack),
        url(),
      ),
    ),
  );
  return render(frame(main), `accueil-${lang}`);
}

export function dossierImage(lang: Lang, dossier: Dossier): Promise<Buffer> {
  const t = useTranslations(lang);
  const d = dossier.data;
  const label = t.dossier.number(pad(d.num));
  const kicker = (d.kind ? `${label} · ${d.kind}` : label).toUpperCase();
  const title = d.headline.length > 60 ? d.title : d.headline;
  const size = title.length > 44 ? 58 : title.length > 30 ? 66 : 76;

  const steps: El[] = [];
  d.lineage.forEach((step, i) => {
    const last = i === d.lineage.length - 1;
    if (i > 0) steps.push(arrow(C.text4, 0.8));
    steps.push(
      h(
        'div',
        {
          display: 'flex',
          padding: '7px 12px',
          border: `1px solid ${last ? C.accent : C.line}`,
          background: last ? C.accent : 'transparent',
          color: last ? C.bg : i === 0 ? C.source : C.text,
          fontWeight: last ? 600 : 400,
        },
        step,
      ),
    );
  });

  const main = h(
    'div',
    { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: MAIN_WIDTH, padding: '64px 0 60px' },
    h(
      'div',
      { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24 },
      h('div', { display: 'flex', fontFamily: 'PlexMono', fontSize: 22, letterSpacing: '0.06em', color: C.accent }, kicker),
      brand(22),
    ),
    h('div', { display: 'flex', maxWidth: 960, fontSize: size, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1 }, title),
    h(
      'div',
      { display: 'flex', flexDirection: 'column', gap: 22 },
      h('div', { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', fontFamily: 'PlexMono', fontSize: 20 }, ...steps),
      h(
        'div',
        { display: 'flex', flexWrap: 'wrap', gap: '10px 22px', alignItems: 'center', fontFamily: 'PlexMono', fontSize: 21, color: C.text2 },
        who(21, 400),
        url(),
      ),
    ),
  );
  return render(frame(main), `dossier-${pad(d.num)}-${lang}`);
}
