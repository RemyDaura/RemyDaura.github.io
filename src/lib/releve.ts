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

/** Prix d'un jour passé : vide (null) si le carburant manquait ce jour-là. */
export interface HistoryPrice {
  code: FuelCode;
  france: number | null;
  bouches_du_rhone: number | null;
}

export interface HistoryDay {
  jour: string;
  carburants: HistoryPrice[];
}

/** Profondeur maximale de l'historique publié, en jours (JOURS_HISTORIQUE dans publier.py). */
export const MAX_HISTORY_DAYS = 30;

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
  /** Les 30 derniers jours, du plus ancien au plus récent (absent de l'instantané). */
  historique?: HistoryDay[];
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
        if (!isPrice(c?.[key])) problems.push(`${code}.${key} hors bornes`);
      }
    }
  }
  if (r.historique !== undefined) {
    problems.push(...checkHistory(r.historique, r.jour));
    if (problems.length === 0 && !lastDayMatches(r.historique as HistoryDay[], r.carburants as FuelPrice[])) {
      problems.push("historique : le dernier jour ne reprend pas les prix du relevé");
    }
  }
  return problems;
}

/** La courbe se termine exactement sur les prix affichés en grand. */
function lastDayMatches(history: HistoryDay[], fuels: FuelPrice[]): boolean {
  const last = history.at(-1)!;
  return fuels.every((fuel) => {
    const day = last.carburants.find((c) => c.code === fuel.code);
    return day?.france === fuel.france && day?.bouches_du_rhone === fuel.bouches_du_rhone;
  });
}

/** Mêmes bornes que le test dbt assert_prix_dans_bornes. */
function isPrice(value: unknown): value is number {
  return typeof value === 'number' && value >= 0.3 && value <= 4;
}

/** Historique : jours croissants, le dernier égal au jour du relevé, prix vides ou dans les bornes. */
function checkHistory(value: unknown, day: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_HISTORY_DAYS) {
    return [`historique : entre 1 et ${MAX_HISTORY_DAYS} jours attendus`];
  }
  const problems: string[] = [];
  const days = value.map((entry) => (entry as Record<string, unknown>)?.jour);
  const ordered = days.every(
    (d, i) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && (i === 0 || d > (days[i - 1] as string)),
  );
  if (!ordered) problems.push('historique : jours en double ou dans le désordre');
  else if (days.at(-1) !== day) problems.push(`historique : se termine le ${String(days.at(-1))}, pas le jour du relevé`);

  for (const entry of value as Record<string, unknown>[]) {
    const fuels = entry?.carburants;
    const codes = Array.isArray(fuels) ? fuels.map((f) => (f as Record<string, unknown>)?.code) : [];
    if (codes.join() !== FUEL_CODES.join()) {
      problems.push(`historique ${String(entry?.jour)} : carburants inattendus`);
      continue;
    }
    for (const fuel of fuels as Record<string, unknown>[]) {
      for (const key of ['france', 'bouches_du_rhone']) {
        const price = fuel[key];
        if (price !== null && !isPrice(price)) problems.push(`historique ${String(entry.jour)} ${String(fuel.code)}.${key} hors bornes`);
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

/** Une série par zone pour un carburant, alignée sur les jours de l'historique. */
export interface HistorySeries {
  days: string[];
  france: (number | null)[];
  department: (number | null)[];
}

/** Séries de l'historique pour un carburant ; null s'il y a moins de deux jours à tracer. */
export function historySeries(releve: Releve, code: FuelCode): HistorySeries | null {
  const history = releve.historique ?? [];
  if (history.length < 2) return null;
  const pick = (day: HistoryDay) => day.carburants.find((c) => c.code === code);
  return {
    days: history.map((day) => day.jour),
    france: history.map((day) => pick(day)?.france ?? null),
    department: history.map((day) => pick(day)?.bouches_du_rhone ?? null),
  };
}
