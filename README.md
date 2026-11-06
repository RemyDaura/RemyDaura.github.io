# remy_daura.trace

Portfolio de Rémy Daura, Data Analyst en spécialisation data engineering : [remydaura.github.io](https://remydaura.github.io).

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
| Images | Optimisées au build (WebP, plusieurs largeurs) |
| JavaScript | Trois petits scripts : la trace au défilement, le relevé du jour, le menu mobile |

## Commandes

Node.js 22.23.4 ou plus récent (versions paires).

| Commande | Effet |
| --- | --- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Site en local sur http://localhost:4321, rechargé à chaque modification |
| `npm run build` | Construit le site dans `dist/` |
| `npm run preview` | Sert le contenu de `dist/` en local |
| `npm run check` | Vérifie les types TypeScript et les composants Astro |

## Organisation

```text
src/
├── content/dossiers/{fr,en}/NN.mdx   # un fichier par dossier et par langue
├── content.config.ts                 # schéma des dossiers (champs obligatoires, types)
├── i18n/
│   ├── ui.ts                         # textes d'interface FR / EN
│   └── home.ts                       # contenu de l'accueil FR / EN
├── data/
│   ├── site.ts                       # liens, adresse, pipeline
│   └── releve.snapshot.json          # instantané du relevé du jour
├── lib/                              # accès aux dossiers, formats, contrat du relevé
├── components/
│   ├── trace/Section.astro           # une étape de la trace
│   ├── home/                         # les sections de l'accueil
│   ├── dossier/DossierPage.astro     # gabarit d'une page de dossier
│   ├── mdx/                          # composants utilisables dans les dossiers
│   └── ui/                           # chaîne de lignage, graphe, liens
├── layouts/BaseLayout.astro          # <head>, barre d'état, en-tête, pied de page
├── scripts/                          # JavaScript côté navigateur
└── styles/                           # jetons, base, trace, contenu rédigé
public/                               # fichiers copiés tels quels (CV, icônes, images de partage)
```

## Ajouter ou modifier un dossier

Chaque dossier existe en deux fichiers, `src/content/dossiers/fr/NN.mdx` et `src/content/dossiers/en/NN.mdx`.
L'en-tête (entre les deux lignes `---`) décrit le dossier : numéro, titres, résumé, lignage, fiche, chiffres clés, liens.
Le corps est découpé en sections :

```mdx
<Section label="Contexte" title="Une source vivante, sans historique">

Texte en Markdown...

</Section>
```

Composants disponibles dans un dossier, sans import : `Section`, `Stats`, `Findings` et `Finding`,
`Figure` et `Gallery` (images de `src/assets/`), `Callout`, `Columns` et `Column`, `PipelineGraph`.
Les tableaux Markdown (`| a | b |`) sont mis en forme automatiquement.

## Contrôles intégrés

Comme les tests dbt du dossier n°14, ces contrôles **font échouer le build** plutôt que de publier un site incohérent :

- l'en-tête de chaque dossier respecte le schéma (`src/content.config.ts`) ;
- chaque dossier existe en français et en anglais, avec le même numéro, le même statut et le même nombre de chiffres clés ;
- chaque preuve du tableau des compétences pointe vers un dossier qui existe ;
- l'instantané du relevé respecte le contrat de données (`src/lib/releve.ts`).

Le fichier publié chaque matin par le pipeline passe par les mêmes tests dans le navigateur :
s'il n'est pas conforme, le site garde l'instantané et ne montre jamais une donnée douteuse.

## Relevé du jour

La barre d'état et la section « Fraîcheur » affichent l'un de trois états, distingués par la couleur, la forme et le texte :

| État | Quand | Signe |
| --- | --- | --- |
| Normal | Relevé du jour, ou de la veille avant 8 h | rond vert |
| En retard | Relevé plus ancien | carré orange |
| Échec | Le dernier run du pipeline a échoué | croix rouge |

Tant que `PIPELINE.live` vaut `false` dans `src/data/site.ts`, le navigateur n'appelle rien et le site affiche
l'instantané de `src/data/releve.snapshot.json`.

## Accessibilité

Lien d'évitement, titres hiérarchisés, navigation au clavier, cibles d'au moins 24 px, contrastes AA,
états jamais signalés par la couleur seule, respect du réglage « réduire les animations ».

## Sources

Contenus, textes et CV : © Rémy Daura.
Données des carburants : flux DGCCRF, Licence Ouverte 2.0.
