/**
 * Images de partage générées au build : /og/accueil-fr.png, /og/dossier-14-en.png...
 * Le gabarit est dans src/lib/og.ts.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { LANGS, type Lang } from '../../i18n/ui';
import { getDossiers, pad, type Dossier } from '../../lib/dossiers';
import { dossierImage, homeImage } from '../../lib/og';

type Props = { lang: Lang; dossier?: Dossier };

export const getStaticPaths = (async () => {
  const paths: { params: { image: string }; props: Props }[] = [];
  for (const lang of LANGS) {
    paths.push({ params: { image: `accueil-${lang}` }, props: { lang } });
    for (const dossier of await getDossiers(lang)) {
      paths.push({ params: { image: `dossier-${pad(dossier.data.num)}-${lang}` }, props: { lang, dossier } });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = props.dossier ? await dossierImage(props.lang, props.dossier) : await homeImage(props.lang);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
