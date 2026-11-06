/**
 * Identité et liens du site, au même endroit pour ne jamais les dupliquer.
 */
export const SITE = {
  name: 'Rémy Daura',
  url: 'https://remydaura.github.io',
  email: 'remy.daura.pro@gmail.com',
  github: 'https://github.com/RemyDaura',
  linkedin: 'https://www.linkedin.com/in/r%C3%A9my-d-aura/',
  cv: '/CV_Remy_Daura.pdf',
  /** Dépôt de ce site, cité dans le pied de page ("lignage de ce site"). */
  sourceRepo: 'https://github.com/RemyDaura/RemyDaura.github.io',
} as const;

/**
 * Le pipeline du dossier n°14, qui alimente le relevé du jour.
 */
export const PIPELINE = {
  /**
   * Lire le relevé publié chaque matin. Mettre à false pour n'afficher que l'instantané
   * embarqué (src/data/releve.snapshot.json), sans aucun appel réseau.
   */
  live: true,
  repo: 'https://github.com/RemyDaura/DE-Pipeline-Prix-Carburants',
  dashboard: 'https://datastudio.google.com/reporting/77d153bb-1926-4ad1-a366-4deee23bc762',
  /** Fichier JSON publié chaque matin par le pipeline (ingestion/publier.py du dépôt DE). */
  releveUrl: 'https://remydaura.github.io/DE-Pipeline-Prix-Carburants/releve.json',
  /** Documentation dbt publiée par le même run. */
  docs: 'https://remydaura.github.io/DE-Pipeline-Prix-Carburants/',
  /** Dernier run du workflow, via l'API publique de GitHub (sans jeton, 60 appels/h par visiteur). */
  runsApi:
    'https://api.github.com/repos/RemyDaura/DE-Pipeline-Prix-Carburants/actions/workflows/pipeline.yml/runs?per_page=1',
  /** Heure de lancement quotidienne (Europe/Paris). */
  schedule: '06:17',
} as const;
