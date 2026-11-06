/**
 * Audit d'accessibilité automatique (axe-core, règles WCAG 2.2 A et AA + bonnes pratiques)
 * sur toutes les pages du site construit, en largeur bureau et mobile.
 *
 * Utilisé en intégration continue : `playwright` et `axe-core` y sont installés à la volée
 * (voir .github/workflows/deploy.yml), pour ne pas alourdir l'installation locale.
 * Les appels réseau externes sont bloqués : le relevé du jour affiche alors l'instantané,
 * ce qui rend l'audit reproductible.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { chromium } from 'playwright';
import { demarrer } from './serveur-statique.mjs';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const PORT = 4322;
const LARGEURS = [1440, 390];

function pagesHtml(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return pagesHtml(chemin);
    return nom.endsWith('.html') ? [chemin] : [];
  });
}

// Les anciennes adresses p2.html... sont de simples redirections : pas d'audit
const urls = pagesHtml('dist')
  .map((f) => '/' + relative('dist', f).replaceAll('\\', '/').replace(/index\.html$/, ''))
  .filter((u) => !/^\/p\d+\.html$/.test(u))
  .sort();

const serveur = await demarrer('dist', PORT);
const navigateur = await chromium.launch();
const problemes = [];

for (const largeur of LARGEURS) {
  const page = await navigateur.newPage({ viewport: { width: largeur, height: 900 } });
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === 'localhost' ? route.continue() : route.abort(),
  );
  for (const url of urls) {
    await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: 'load' });
    await page.addScriptTag({ content: AXE });
    const resultat = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      }),
    );
    for (const v of resultat.violations) {
      const cibles = v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ');
      problemes.push(`${url} (${largeur}px) : ${v.id} [${v.impact}] ${v.help} -> ${cibles}`);
    }
  }
  await page.close();
}

await navigateur.close();
serveur.close();

if (problemes.length > 0) {
  console.error(`${problemes.length} problème(s) d'accessibilité :\n- ${problemes.join('\n- ')}`);
  process.exit(1);
}
console.log(`Accessibilité : ${urls.length} pages x ${LARGEURS.length} largeurs, aucun problème détecté par axe-core.`);
