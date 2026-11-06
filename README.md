# remy_daura.trace

Portfolio de Rémy D'AURA, Data Analyst en spécialisation data engineering : [remydaura.github.io](https://remydaura.github.io).

Le concept : **chaque donnée laisse une trace**. Le site est construit comme un rapport d'enquête,
avec une trace verticale qui suit la lecture, et il est alimenté par un vrai pipeline de données :
le relevé du jour des prix des carburants vient du [dossier n°14](https://github.com/RemyDaura/DE-Pipeline-Prix-Carburants).

## Pile technique

| Élément | Choix |
| --- | --- |
| Générateur | [Astro 7](https://astro.build) (site statique), MDX pour les dossiers |
| Langues | Français à la racine, anglais sous `/en/` (i18n natif d'Astro) |
| Style | CSS sans framework, jetons de design dans `src/styles/tokens.css` |
| Polices | IBM Plex Sans et IBM Plex Mono, auto-hébergées (aucun appel à Google Fonts) |
| Images | Optimisées au build (WebP, plusieurs largeurs), jamais agrandies au-delà de leur taille réelle |
| Images de partage | Générées au build pour chaque page et chaque langue ([Satori](https://github.com/vercel/satori) puis sharp) |
| JavaScript | Quelques petits scripts : la trace au défilement, le relevé du jour et sa courbe sur 30 jours, le menu mobile |
| Mesure d'audience | [GoatCounter](https://www.goatcounter.com), sans cookie ni donnée personnelle |

## Commandes

Node.js 22.23.4 ou plus récent (versions paires).

| Commande | Effet |
| --- | --- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Site en local sur http://localhost:4321, rechargé à chaque modification |
| `npm run build` | Construit le site dans `dist/` |
| `npm run preview` | Sert le contenu de `dist/` en local |
| `npm run check` | Vérifie les types TypeScript et les composants Astro |
| `npm run verifier` | Types, build, validité du HTML et liens internes, comme en intégration continue |

## Organisation

```text
src/
├── content/dossiers/{fr,en}/NN.mdx   # un fichier par dossier et par langue
├── content.config.ts                 # schéma des dossiers (champs obligatoires, types)
├── i18n/
│   ├── ui.ts                         # textes d'interface FR / EN
│   └── home.ts                       # contenu de l'accueil FR / EN
├── assets/dossiers/NN/               # captures de chaque dossier (optimisées au build)
├── data/
│   ├── site.ts                       # liens, adresse, CV, mesure d'audience, pipeline
│   └── releve.snapshot.json          # instantané du relevé du jour
├── lib/                              # accès aux dossiers, formats, contrat du relevé, images de partage
├── components/
│   ├── trace/Section.astro           # une étape de la trace
│   ├── home/                         # les sections de l'accueil
│   ├── dossier/DossierPage.astro     # gabarit d'une page de dossier
│   ├── mdx/                          # composants utilisables dans les dossiers
│   └── ui/                           # chaîne de lignage, graphe, liens
├── layouts/BaseLayout.astro          # <head>, barre d'état, en-tête, pied de page
├── pages/og/[image].png.ts           # images de partage, générées au build
├── scripts/                          # JavaScript côté navigateur (trace, relevé, courbe)
└── styles/                           # jetons, base, trace, contenu rédigé
public/                               # fichiers copiés tels quels (CV en français et en anglais, icônes)
```

## Ajouter ou modifier un dossier

Chaque dossier existe en deux fichiers, `src/content/dossiers/fr/NN.mdx` et `src/content/dossiers/en/NN.mdx`.
L'en-tête (entre les deux lignes `---`) décrit le dossier : numéro, titres, résumé, lignage, dates, fiche, chiffres clés, liens.
Les dates s'écrivent au format AAAA-MM-JJ ; sans date de fin, le dossier est « en cours » :

```yaml
period:
  start: "2026-11-03"
  end: "2026-11-20"   # facultatif
```
Le corps est découpé en sections :

```mdx
<Section label="Contexte" title="Une source vivante, sans historique">

Texte en Markdown...

</Section>
```

Composants disponibles dans un dossier, sans import : `Section`, `Stats`, `Findings` et `Finding`,
`Figure` et `Gallery` (images de `src/assets/`), `Callout`, `Columns` et `Column`, `PipelineGraph`.
Une `Gallery` affiche sa première figure en pleine largeur et les suivantes deux par deux ;
`<Gallery even>` les affiche toutes deux par deux. Chaque `Figure` a un texte alternatif qui décrit
ce que montre l'image (valeurs comprises) et une légende qui dit ce qu'il faut en retenir.
Les tableaux Markdown (`| a | b |`) sont mis en forme automatiquement.

## Contrôles intégrés

Comme les tests dbt du dossier n°14, ces contrôles **font échouer le build** plutôt que de publier un site incohérent :

- l'en-tête de chaque dossier respecte le schéma (`src/content.config.ts`) ;
- chaque dossier existe en français et en anglais, avec le même numéro, le même statut, les mêmes dates et le même nombre de chiffres clés ;
- les numéros suivent l'ordre chronologique : un dossier ne commence pas avant la fin du précédent, et seul le dernier peut être en cours ;
- les images de partage n'utilisent que des caractères présents dans les polices (sinon, un carré vide apparaîtrait) ;
- chaque preuve du tableau des compétences pointe vers un dossier qui existe ;
- l'instantané du relevé respecte le contrat de données (`src/lib/releve.ts`).

Le fichier publié chaque matin par le pipeline passe par les mêmes tests dans le navigateur :
s'il n'est pas conforme, le site garde l'instantané et ne montre jamais une donnée douteuse.

## Intégration continue

À chaque pull request et à chaque push sur `main`, `.github/workflows/deploy.yml` vérifie le site
avant de le publier sur GitHub Pages :

| Contrôle | Outil |
| --- | --- |
| Types et composants | `astro check` |
| Construction | `astro build`, avec les contrôles ci-dessus |
| HTML valide | [html-validate](https://html-validate.org), configuration dans `.htmlvalidate.json` |
| Liens internes et ancres | `scripts/verifier-liens.mjs` |
| Accessibilité, toutes les pages en largeur bureau et mobile | axe-core dans Chromium, `scripts/verifier-accessibilite.mjs` |

Trois règles de html-validate sont désactivées volontairement : `no-redundant-role` (les listes sans puces
gardent `role="list"`, sinon Safari et VoiceOver ne les annoncent plus comme des listes),
`prefer-native-element` (zones de tableaux défilantes en `role="region"`) et `no-inline-style`
(nombre de colonnes du graphe de lignage passé en variable CSS).

Le site n'est publié que si tous les contrôles passent.

## Relevé du jour

La barre d'état et la section « Fraîcheur » affichent l'un de trois états, distingués par la couleur, la forme et le texte :

| État | Quand | Signe |
| --- | --- | --- |
| Normal | Relevé du jour, ou de la veille avant 8 h | rond vert |
| En retard | Relevé plus ancien | carré orange |
| Échec | Le dernier run du pipeline a échoué | croix rouge |

Sous les valeurs du jour, une courbe montre les 30 derniers jours pour le carburant choisi (moyenne France
et Bouches-du-Rhône). Elle se lit au survol, au doigt ou au clavier (flèches, Début, Fin), et un tableau
donne toutes les valeurs sans survol. Un jour manquant interrompt la courbe au lieu d'être inventé.
Le contrat vérifie aussi l'historique : jours croissants, prix dans les bornes, dernier jour identique au relevé.

Le relevé est publié chaque matin par `ingestion/publier.py` (dépôt DE) sur
[remydaura.github.io/DE-Pipeline-Prix-Carburants/releve.json](https://remydaura.github.io/DE-Pipeline-Prix-Carburants/releve.json),
avec la documentation dbt. L'état du dernier run est lu via l'API publique de GitHub Actions.
Hors ligne, ou si `PIPELINE.live` vaut `false` dans `src/data/site.ts`, le site affiche l'instantané de
`src/data/releve.snapshot.json`.

## Performance

Mesurée avec [Lighthouse](https://developer.chrome.com/docs/lighthouse) sur le site construit (6 novembre 2026),
en profil mobile : 96 à 99 en performance, 100 en accessibilité, bonnes pratiques et référencement.
Le CSS est intégré à chaque page (`build.inlineStylesheets`) pour qu'aucun fichier ne bloque le premier affichage.

## Mesure d'audience

[GoatCounter](https://www.goatcounter.com) compte les pages vues et les téléchargements du CV, sans cookie
et sans conserver d'adresse IP. Le code du compte est dans
`src/data/site.ts` (`goatcounter`) ; `null` désactive la mesure.

## Accessibilité

Lien d'évitement, titres hiérarchisés, navigation au clavier, cibles d'au moins 24 px, contrastes AA,
états jamais signalés par la couleur seule, respect du réglage « réduire les animations ».

## Sources

Contenus, textes et CV : © Rémy D'AURA.
Données des carburants : flux DGCCRF, Licence Ouverte 2.0.
