/**
 * Le "relevé du jour" : contrat de données entre le pipeline du dossier n°14 et ce site.
 *
 * Ce module est partagé par le rendu au build (valeurs de l'instantané) et par le
 * navigateur (relevé publié chaque matin). Il ne dépend d'aucune API propre à l'un des deux.
 */
import snapshotJson from '../data/releve.snapshot.json';

export const FUEL_CODES = ['gazole', 'sp98', 'sp95', 'e10', 'gplc', 'e85'] as const;
export type FuelCode = (typeof FUEL_CODES)[number];

export interface FuelPrice {
  code: FuelCode;
  /** Prix moyen national, pondéré par le nombre de stations (€/L). */
  france: number;
  /** Prix moyen dans les Bouches-du-Rhône (€/L). */
  bouches_du_rhone: number;
}

export interface Releve {
  version: 1;
  /** "pipeline" quand le fichier vient du run du matin, "instantane" pour la copie embarquée. */
  source: 'pipeline' | 'instantane';
  /** Jour du relevé, au format AAAA-MM-JJ, heure de Paris. */
  jour: string;
  /** Horodatage de publication (ISO 8601), absent de l'instantané. */
  genere_le?: string;
  nb_stations: number;
  tests: { total: number; echecs: number; avertissements: number };
  carburants: FuelPrice[];
  /** Lien vers le run GitHub Actions qui a produit le fichier. */
  run_url?: string;
}

/** Sous-ensemble utile de la réponse de l'API GitHub "workflow runs". */
export interface LastRun {
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
}

export type ReleveState = 'ok' | 'late' | 'failed';
export type ReleveAge = 'today' | 'yesterday' | 'older';

export interface ReleveStatus {
  state: ReleveState;
  age: ReleveAge;
  /** Un run est en cours au moment de la consultation. */
  running: boolean;
}

/**
 * Tests du contrat : le fichier vient du réseau, on ne lui fait pas confiance.
 * Renvoie la liste des problèmes trouvés (vide si le fichier est conforme).
 */
export function checkReleve(value: unknown): string[] {
  const problems: string[] = [];
  if (typeof value !== 'object' || value === null) return ['pas un objet JSON'];
  const r = value as Record<string, unknown>;

  if (r.version !== 1) problems.push(`version inattendue : ${String(r.version)}`);
  if (typeof r.jour !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.jour)) problems.push('jour absent ou mal formé');
  if (typeof r.nb_stations !== 'number' || r.nb_stations <= 0) problems.push('nb_stations absent ou nul');

  const tests = r.tests as Record<string, unknown> | undefined;
  if (!tests || ['total', 'echecs', 'avertissements'].some((k) => typeof tests[k] !== 'number')) {
    problems.push('bloc tests incomplet');
  }

  if (!Array.isArray(r.carburants) || r.carburants.length === 0) {
    problems.push('aucun carburant');
  } else {
    const seen = new Set<string>();
    for (const c of r.carburants as Record<string, unknown>[]) {
      const code = String(c?.code);
      if (!(FUEL_CODES as readonly string[]).includes(code)) problems.push(`carburant inconnu : ${code}`);
      if (seen.has(code)) problems.push(`carburant en double : ${code}`);
      seen.add(code);
      for (const key of ['france', 'bouches_du_rhone']) {
        const price = c?.[key];
        // Mêmes bornes que le test dbt assert_prix_dans_bornes
        if (typeof price !== 'number' || price < 0.3 || price > 4) problems.push(`${code}.${key} hors bornes`);
      }
    }
  }
  return problems;
}

export const SNAPSHOT = snapshotJson as Releve;

const problems = checkReleve(SNAPSHOT);
if (problems.length > 0) {
  // Fait échouer le build si l'instantané embarqué ne respecte pas le contrat.
  throw new Error(`releve.snapshot.json invalide : ${problems.join(', ')}`);
}

/** Jour (AAAA-MM-JJ) à Paris pour une date donnée. */
export function parisDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Heure (HH:MM, sur 24 h) à Paris pour une date donnée. */
export function parisTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

/** Jour précédent d'une date AAAA-MM-JJ (calcul en UTC, sans effet d'heure d'été). */
export function previousDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Choisit l'état affiché :
 * - "failed" si le dernier run s'est terminé en échec (rien n'a été publié depuis) ;
 * - "late" si le relevé n'est ni d'aujourd'hui, ni d'hier avant l'heure limite ;
 * - "ok" sinon.
 * `freshUntil` laisse au run du matin le temps de tourner (lancé à 6 h 17).
 */
export function computeStatus(
  releve: Pick<Releve, 'jour'>,
  lastRun: LastRun | null,
  now: Date,
  freshUntil = '08:00',
): ReleveStatus {
  const today = parisDay(now);
  const age: ReleveAge =
    releve.jour >= today ? 'today' : releve.jour === previousDay(today) ? 'yesterday' : 'older';
  const running = lastRun !== null && lastRun.status !== 'completed';
  const lastRunFailed =
    lastRun !== null &&
    lastRun.status === 'completed' &&
    ['failure', 'timed_out', 'startup_failure'].includes(lastRun.conclusion ?? '');

  let state: ReleveState;
  if (lastRunFailed && age !== 'today') state = 'failed';
  else if (age === 'today' || (age === 'yesterday' && parisTime(now) < freshUntil)) state = 'ok';
  else state = 'late';

  return { state, age, running };
}

export function fuelPrice(releve: Releve, code: FuelCode): FuelPrice | undefined {
  return releve.carburants.find((c) => c.code === code);
}
