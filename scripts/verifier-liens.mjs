/**
 * Vérifie tous les liens internes du site construit (dist/) :
 * chaque page, image ou fichier cité doit exister, et chaque ancre (#section) aussi.
 * Les liens externes ne sont pas testés ici (ils dépendent d'autres sites).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const DIST = resolve('dist');
const SITE = 'https://remydaura.github.io';
// Autres sites publiés sous la même adresse (pages GitHub d'autres dépôts) : liens externes
const AUTRES_SITES = ['/DE-Pipeline-Prix-Carburants/'];

function pagesHtml(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return pagesHtml(chemin);
    return nom.endsWith('.html') ? [chemin] : [];
  });
}

const attributs = (html, nom) => [...html.matchAll(new RegExp(`\\s${nom}="([^"]*)"`, 'g'))].map((m) => m[1]);

const pages = new Map(
  pagesHtml(DIST).map((fichier) => {
    const html = readFileSync(fichier, 'utf8');
    const liens = [
      ...attributs(html, 'href'),
      ...attributs(html, 'src'),
      ...attributs(html, 'srcset').flatMap((v) => v.split(',').map((s) => s.trim().split(/\s+/)[0])),
    ];
    return [fichier, { liens, ids: new Set(attributs(html, 'id')) }];
  }),
);

function cible(depuis, chemin) {
  const absolu = chemin.startsWith('/') ? join(DIST, chemin) : join(dirname(depuis), chemin);
  return chemin.endsWith('/') || (existsSync(absolu) && statSync(absolu).isDirectory()) ? join(absolu, 'index.html') : absolu;
}

const erreurs = [];
for (const [fichier, { liens, ids }] of pages) {
  for (const brut of liens) {
    if (!brut || /^(mailto|tel|data|javascript):/.test(brut)) continue;
    if (/^https?:\/\//.test(brut) && !brut.startsWith(SITE)) continue;
    const lien = brut.startsWith(SITE) ? brut.slice(SITE.length) || '/' : brut;
    if (AUTRES_SITES.some((prefixe) => lien.startsWith(prefixe))) continue;
    const [chemin, ancre] = lien.split('#');
    const page = relative(DIST, fichier);
    if (chemin === '') {
      if (ancre && !ids.has(decodeURIComponent(ancre))) erreurs.push(`${page} : ancre introuvable #${ancre}`);
      continue;
    }
    const destination = cible(fichier, decodeURIComponent(chemin.split('?')[0]));
    if (!existsSync(destination)) {
      erreurs.push(`${page} : lien cassé ${brut}`);
    } else if (ancre && destination.endsWith('.html') && !pages.get(destination)?.ids.has(decodeURIComponent(ancre))) {
      erreurs.push(`${page} : ancre introuvable ${brut}`);
    }
  }
}

if (erreurs.length > 0) {
  console.error(`${erreurs.length} lien(s) cassé(s) :\n- ${erreurs.join('\n- ')}`);
  process.exit(1);
}
const total = [...pages.values()].reduce((n, p) => n + p.liens.length, 0);
console.log(`Liens internes : ${pages.size} pages, ${total} liens vérifiés, aucun cassé.`);
