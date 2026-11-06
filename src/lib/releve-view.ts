/**
 * Textes affichés pour le relevé du jour, calculés de la même façon au build
 * et dans le navigateur (le navigateur ne fait que remplacer les textes).
 */
import { formatDayLong, formatDayShort, formatDelta, formatInt, formatPrice } from './format';
import { fuelPrice, type FuelCode, type Releve, type ReleveStatus } from './releve';
import { useTranslations, type Lang } from '../i18n/ui';

/** L'instantané embarqué donne un ordre de grandeur, le fichier du matin un compte exact. */
function stations(releve: Releve, lang: Lang): { value: string; approx: boolean } {
  const approx = releve.source === 'instantane';
  const value = approx ? Math.round(releve.nb_stations / 100) * 100 : releve.nb_stations;
  return { value: formatInt(value, lang), approx };
}

export interface StatusBarView {
  state: ReleveStatus['state'];
  pipeline: string;
  day: string;
  stations: string;
  tests: string;
}

export function statusBarView(releve: Releve, status: ReleveStatus, lang: Lang): StatusBarView {
  const t = useTranslations(lang);
  const st = stations(releve, lang);
  const state = status.running && status.state !== 'ok' ? t.status.running : t.status.state[status.state];
  return {
    state: status.state,
    pipeline: `${t.status.pipeline} · ${state}`,
    day: t.status.day(formatDayShort(releve.jour, lang)),
    stations: t.status.stations(st.value, st.approx),
    tests: t.status.tests(releve.tests.total, releve.tests.echecs),
  };
}

export interface WidgetView {
  state: ReleveStatus['state'];
  chip: string;
  loaded: string;
  tests: string;
  fuelLabel: string;
  france: string;
  department: string;
  perLitre: string;
  comparison: string;
  /** "cheaper" | "dearer" | "same" : pilote la couleur du comparatif. */
  trend: 'cheaper' | 'dearer' | 'same';
  /** Note d'état (retard, échec, instantané), vide si tout va bien. */
  note: string;
}

export function widgetView(releve: Releve, status: ReleveStatus, lang: Lang, fuel: FuelCode): WidgetView {
  const t = useTranslations(lang);
  const st = stations(releve, lang);
  const price = fuelPrice(releve, fuel) ?? releve.carburants[0];
  const fuelLabel = t.releve.fuels[price.code];
  // Écart arrondi au millième, comme les prix affichés
  const delta = Math.round((price.bouches_du_rhone - price.france) * 1000) / 1000;
  const trend = delta < 0 ? 'cheaper' : delta > 0 ? 'dearer' : 'same';
  const deltaText = formatDelta(delta, lang);
  const comparison =
    trend === 'cheaper' ? t.releve.cheaper(deltaText) : trend === 'dearer' ? t.releve.dearer(deltaText) : t.releve.same;

  const day = formatDayLong(releve.jour, lang);
  const notes: string[] = [];
  if (status.state === 'late') notes.push(t.releve.lateNote(day));
  if (status.state === 'failed') notes.push(t.releve.failedNote(day));
  if (status.running) notes.push(t.releve.runningNote);
  if (releve.source === 'instantane') notes.push(t.releve.snapshotNote);

  return {
    state: status.state,
    chip: t.releve.chip[status.state],
    loaded: t.releve.loaded(st.value, st.approx),
    tests: t.releve.tests(releve.tests.total, releve.tests.echecs, releve.tests.avertissements),
    fuelLabel,
    france: formatPrice(price.france, lang),
    department: formatPrice(price.bouches_du_rhone, lang),
    perLitre: t.releve.perLitre(fuelLabel),
    comparison,
    trend,
    note: notes.join(' '),
  };
}
