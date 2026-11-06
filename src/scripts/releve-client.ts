/**
 * Côté navigateur : récupère le relevé publié chaque matin et l'état du dernier run,
 * puis met à jour la barre d'état et le widget "Fraîcheur".
 *
 * Un seul appel réseau par page, partagé par tous les composants (promesse mise en cache).
 * En cas d'échec (hors ligne, fichier absent ou non conforme), l'instantané embarqué reste affiché.
 */
import { PIPELINE } from '../data/site';
import { DEFAULT_LANG, isLang, useTranslations, type Lang } from '../i18n/ui';
import {
  FUEL_CODES,
  SNAPSHOT,
  checkReleve,
  computeStatus,
  historySeries,
  type FuelCode,
  type LastRun,
  type Releve,
  type ReleveStatus,
} from '../lib/releve';
import { statusBarView, widgetView } from '../lib/releve-view';
import { createHistoryChart } from './releve-chart';

export interface LiveData {
  releve: Releve;
  lastRun: LastRun | null;
  status: ReleveStatus;
}

export function pageLang(): Lang {
  const lang = document.documentElement.lang;
  return isLang(lang) ? lang : DEFAULT_LANG;
}

/** État calculé tout de suite avec l'instantané, avant toute réponse réseau. */
export function snapshotData(): LiveData {
  return { releve: SNAPSHOT, lastRun: null, status: computeStatus(SNAPSHOT, null, new Date()) };
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status} sur ${url}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function pickLastRun(payload: unknown): LastRun | null {
  const run = (payload as { workflow_runs?: Record<string, unknown>[] })?.workflow_runs?.[0];
  if (!run || typeof run.status !== 'string' || typeof run.created_at !== 'string') return null;
  return {
    status: run.status,
    conclusion: typeof run.conclusion === 'string' ? run.conclusion : null,
    created_at: run.created_at,
    html_url: typeof run.html_url === 'string' ? run.html_url : PIPELINE.repo,
  };
}

async function load(): Promise<LiveData> {
  if (!PIPELINE.live) return snapshotData();

  const [releveResult, runsResult] = await Promise.allSettled([
    fetchJson(PIPELINE.releveUrl),
    fetchJson(PIPELINE.runsApi),
  ]);

  let releve: Releve = SNAPSHOT;
  if (releveResult.status === 'fulfilled') {
    const problems = checkReleve(releveResult.value);
    if (problems.length === 0) releve = releveResult.value as Releve;
    else console.warn('[relevé] fichier publié non conforme, instantané affiché :', problems);
  } else {
    console.info('[relevé] fichier du matin indisponible, instantané affiché.', releveResult.reason);
  }

  const lastRun = runsResult.status === 'fulfilled' ? pickLastRun(runsResult.value) : null;
  return { releve, lastRun, status: computeStatus(releve, lastRun, new Date()) };
}

let pending: Promise<LiveData> | undefined;

export function loadLiveData(): Promise<LiveData> {
  pending ??= load().catch((error: unknown) => {
    console.warn('[relevé] erreur inattendue, instantané affiché :', error);
    return snapshotData();
  });
  return pending;
}

/** Remplace un texte seulement s'il change (évite des annonces inutiles aux lecteurs d'écran). */
function setText(root: ParentNode, field: string, value: string): void {
  const el = root.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (el && el.textContent !== value) el.textContent = value;
}

export function renderStatusBar(root: HTMLElement, data: LiveData): void {
  const view = statusBarView(data.releve, data.status, pageLang());
  root.querySelector('[data-state]')?.setAttribute('data-state', view.state);
  setText(root, 'pipeline', view.pipeline);
  setText(root, 'day', view.day);
  setText(root, 'stations', view.stations);
  setText(root, 'tests', view.tests);
}

export function initWidget(root: HTMLElement): void {
  const lang = pageLang();
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-fuel]'));
  const runLink = root.querySelector<HTMLAnchorElement>('[data-field="run-link"]');
  const historyFigure = root.querySelector<HTMLElement>('[data-history]');
  const chart = historyFigure ? createHistoryChart(historyFigure, lang) : null;
  const t = useTranslations(lang);
  let data = snapshotData();
  let fuel: FuelCode = 'gazole';

  const render = () => {
    const view = widgetView(data.releve, data.status, lang, fuel);
    root.dataset.state = view.state;
    root.querySelector('[data-state]')?.setAttribute('data-state', view.state);
    root.querySelector('[data-trend]')?.setAttribute('data-trend', view.trend);
    setText(root, 'chip', view.chip);
    setText(root, 'loaded', view.loaded);
    setText(root, 'tests', view.tests);
    setText(root, 'france', view.france);
    setText(root, 'department', view.department);
    setText(root, 'per-litre', view.perLitre);
    setText(root, 'comparison', view.comparison);
    setText(root, 'note', view.note);
    root.querySelector<HTMLElement>('[data-field="note"]')?.toggleAttribute('hidden', view.note === '');
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.fuel === fuel));

    chart?.update(historySeries(data.releve, fuel), t.releve.fuels[fuel]);

    const runUrl = data.releve.run_url ?? data.lastRun?.html_url;
    if (runLink && runUrl) {
      runLink.href = runUrl;
      runLink.hidden = false;
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const code = button.dataset.fuel;
      if (code && (FUEL_CODES as readonly string[]).includes(code)) {
        fuel = code as FuelCode;
        render();
      }
    });
  }

  render();
  void loadLiveData().then((live) => {
    data = live;
    render();
  });
}
