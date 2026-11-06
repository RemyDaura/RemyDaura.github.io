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
   * Passer à true quand le pipeline publiera releve.json (étape 7). Tant que c'est faux,
   * le navigateur n'appelle rien et le site affiche l'instantané embarqué.
   */
  live: false,
  repo: 'https://github.com/RemyDaura/DE-Pipeline-Prix-Carburants',
  dashboard: 'https://datastudio.google.com/reporting/77d153bb-1926-4ad1-a366-4deee23bc762',
  /**
   * Fichier JSON publié chaque matin par le pipeline (étape 7, pas encore en ligne).
   * Tant qu'il n'existe pas, le site affiche l'instantané de src/data/releve.snapshot.json.
   */
  releveUrl: 'https://remydaura.github.io/DE-Pipeline-Prix-Carburants/releve.json',
  /** Dernier run du workflow, via l'API publique de GitHub (sans jeton, 60 appels/h par visiteur). */
  runsApi:
    'https://api.github.com/repos/RemyDaura/DE-Pipeline-Prix-Carburants/actions/workflows/pipeline.yml/runs?per_page=1',
  /** Heure de lancement quotidienne (Europe/Paris). */
  schedule: '06:17',
} as const;
