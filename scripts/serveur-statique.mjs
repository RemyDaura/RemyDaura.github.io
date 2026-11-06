/**
 * Petit serveur HTTP pour dist/, sans dépendance, utilisé par les vérifications.
 * Sert index.html pour les dossiers, et 404.html (statut 404) sinon, comme GitHub Pages.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

export function demarrer(dossier = 'dist', port = 4322) {
  const racine = resolve(dossier);
  const serveur = createServer((requete, reponse) => {
    const chemin = decodeURIComponent(new URL(requete.url, 'http://localhost').pathname);
    let fichier = normalize(join(racine, chemin));
    if (!fichier.startsWith(racine)) fichier = join(racine, '404.html');
    if (existsSync(fichier) && statSync(fichier).isDirectory()) fichier = join(fichier, 'index.html');
    const trouve = existsSync(fichier);
    if (!trouve) fichier = join(racine, '404.html');
    reponse.writeHead(trouve ? 200 : 404, { 'Content-Type': TYPES[extname(fichier)] ?? 'application/octet-stream' });
    createReadStream(fichier).pipe(reponse);
  });
  return new Promise((ok) => serveur.listen(port, () => ok(serveur)));
}
