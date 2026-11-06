/**
 * Courbe des 30 derniers jours dans le widget "Fraîcheur" : moyenne France et
 * Bouches-du-Rhône pour le carburant choisi, d'après l'historique du relevé publié.
 *
 * Dessinée dans le navigateur (l'instantané embarqué n'a pas d'historique).
 * Survol et clavier (flèches, Début, Fin) affichent les valeurs d'un jour ;
 * le tableau sous la courbe donne toutes les valeurs, sans survol.
 */
import { useTranslations, type Lang } from '../i18n/ui';
import { formatDayAxis, formatDayLong, formatPrice } from '../lib/format';
import type { HistorySeries } from '../lib/releve';

const SVG_NS = 'http://www.w3.org/2000/svg';
const HEIGHT = 200;
const PAD = { top: 14, right: 18, bottom: 30, left: 62 };
const DAY_MS = 86_400_000;

type SeriesKey = 'france' | 'department';
const SERIES: SeriesKey[] = ['france', 'department'];

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}

const dayNumber = (day: string): number => Date.parse(`${day}T12:00:00Z`) / DAY_MS;

/** Pas "rond" pour les graduations de prix (au millième d'euro près). */
function niceStep(rough: number): number {
  const steps = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
  return steps.find((s) => s >= rough) ?? 1;
}

function formatTick(value: number, step: number, lang: Lang): string {
  const digits = step < 0.01 ? 3 : 2;
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export interface HistoryChart {
  update(series: HistorySeries | null, fuelLabel: string): void;
}

export function createHistoryChart(figure: HTMLElement, lang: Lang): HistoryChart {
  const t = useTranslations(lang);
  const plot = figure.querySelector<HTMLElement>('[data-history-plot]')!;
  const tooltip = figure.querySelector<HTMLElement>('[data-history-tooltip]')!;
  const title = figure.querySelector<HTMLElement>('[data-field="history-title"]')!;
  const rows = figure.querySelector<HTMLElement>('[data-history-rows]')!;

  let current: HistorySeries | null = null;
  let fuel = '';
  let width = 0;
  let active: number | null = null;
  let xs: number[] = [];
  let yOf: (v: number) => number = () => 0;
  let crosshair: { line: SVGLineElement; dots: Record<SeriesKey, SVGCircleElement> } | null = null;

  const priceText = (value: number | null) => (value === null ? t.releve.noData : formatPrice(value, lang));
  const seriesLabel = (key: SeriesKey) => (key === 'france' ? t.releve.france : t.releve.historyDepartment);

  function draw(): void {
    plot.querySelector('svg')?.remove();
    crosshair = null;
    if (!current) return;
    width = Math.max(plot.clientWidth, 280);

    const { days } = current;
    const first = dayNumber(days[0]);
    const span = Math.max(dayNumber(days.at(-1)!) - first, 1);
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    xs = days.map((d) => PAD.left + ((dayNumber(d) - first) / span) * innerW);

    // Échelle des prix : graduations rondes qui encadrent les deux séries
    const values = [...current.france, ...current.department].filter((v): v is number => v !== null);
    let lo = Math.min(...values);
    let hi = Math.max(...values);
    if (hi - lo < 0.004) {
      lo -= 0.002;
      hi += 0.002;
    }
    const step = niceStep((hi - lo) / 3);
    const yMin = Math.floor(lo / step) * step;
    const yMax = Math.ceil(hi / step) * step;
    yOf = (v) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

    const root = svg('svg', { width, height: HEIGHT, viewBox: `0 0 ${width} ${HEIGHT}`, 'aria-hidden': 'true', focusable: 'false' });

    const grid = svg('g', { class: 'chart-grid' });
    for (let v = yMin; v <= yMax + step / 2; v += step) {
      const y = Math.round(yOf(v)) + 0.5;
      grid.append(svg('line', { x1: PAD.left, x2: width - PAD.right, y1: y, y2: y }));
      const label = svg('text', { x: PAD.left - 10, y, 'text-anchor': 'end', 'dominant-baseline': 'middle' });
      label.textContent = formatTick(v, step, lang);
      grid.append(label);
    }
    root.append(grid);

    // Dates : premier et dernier jour, et le jour du milieu si la période est assez longue
    const axis = svg('g', { class: 'chart-axis' });
    const ticks = days.length >= 7 ? [0, Math.floor((days.length - 1) / 2), days.length - 1] : [0, days.length - 1];
    ticks.forEach((i, n) => {
      const anchor = n === 0 ? 'start' : n === ticks.length - 1 ? 'end' : 'middle';
      const label = svg('text', { x: xs[i], y: HEIGHT - 8, 'text-anchor': anchor });
      label.textContent = formatDayAxis(days[i], lang);
      axis.append(label);
    });
    root.append(axis);

    for (const key of SERIES) {
      const values = current[key];
      // Une ligne par suite de jours consécutifs : un jour manquant interrompt la courbe
      let d = '';
      values.forEach((v, i) => {
        if (v === null) return;
        const joined = i > 0 && values[i - 1] !== null && dayNumber(days[i]) - dayNumber(days[i - 1]) === 1;
        d += `${joined ? 'L' : 'M'}${xs[i].toFixed(1)},${yOf(v).toFixed(1)}`;
      });
      root.append(svg('path', { d, class: `chart-line series-${key}` }));

      const last = values.findLastIndex((v) => v !== null);
      if (last >= 0) root.append(svg('circle', { cx: xs[last], cy: yOf(values[last]!), r: 4, class: `chart-dot series-${key}` }));
    }

    const line = svg('line', { y1: PAD.top, y2: HEIGHT - PAD.bottom, class: 'chart-crosshair' });
    const dots = {
      france: svg('circle', { r: 4, class: 'chart-dot series-france' }),
      department: svg('circle', { r: 4, class: 'chart-dot series-department' }),
    };
    const group = svg('g', { class: 'chart-focus' });
    group.append(line, dots.france, dots.department);
    root.append(group);
    crosshair = { line, dots };

    plot.prepend(root);
    show(active);
  }

  function show(index: number | null): void {
    active = index;
    const group = crosshair?.line.parentNode as SVGGElement | undefined;
    if (!current || !crosshair || !group || index === null) {
      group?.setAttribute('visibility', 'hidden');
      tooltip.hidden = true;
      return;
    }
    group.setAttribute('visibility', 'visible');
    const x = xs[index];
    crosshair.line.setAttribute('x1', String(x));
    crosshair.line.setAttribute('x2', String(x));
    for (const key of SERIES) {
      const v = current[key][index];
      const dot = crosshair.dots[key];
      dot.setAttribute('visibility', v === null ? 'hidden' : 'visible');
      if (v !== null) {
        dot.setAttribute('cx', String(x));
        dot.setAttribute('cy', String(yOf(v)));
      }
    }

    // Infobulle : la valeur d'abord, la série ensuite
    const date = document.createElement('p');
    date.className = 'tip-date';
    date.textContent = formatDayLong(current.days[index], lang);
    const list = document.createElement('ul');
    list.setAttribute('role', 'list');
    for (const key of SERIES) {
      const item = document.createElement('li');
      const keyMark = document.createElement('span');
      keyMark.className = `line-key series-${key}`;
      const value = document.createElement('strong');
      value.textContent = priceText(current[key][index]);
      const label = document.createElement('span');
      label.textContent = seriesLabel(key);
      item.append(keyMark, value, label);
      list.append(item);
    }
    tooltip.replaceChildren(date, list);
    tooltip.hidden = false;
    const tipWidth = tooltip.offsetWidth;
    const left = x + 12 + tipWidth > width ? x - 12 - tipWidth : x + 12;
    tooltip.style.left = `${Math.max(0, left)}px`;
  }

  function nearest(clientX: number): number {
    const bounds = plot.getBoundingClientRect();
    const x = clientX - bounds.left;
    let best = 0;
    xs.forEach((value, i) => {
      if (Math.abs(value - x) < Math.abs(xs[best] - x)) best = i;
    });
    return best;
  }

  plot.addEventListener('pointermove', (event) => show(nearest(event.clientX)));
  plot.addEventListener('pointerdown', (event) => show(nearest(event.clientX)));
  // Au doigt, l'infobulle reste affichée après le toucher (pointerleave suit chaque pointerup)
  plot.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'touch' && document.activeElement !== plot) show(null);
  });
  plot.addEventListener('focus', () => show(active ?? (current ? current.days.length - 1 : null)));
  plot.addEventListener('blur', () => show(null));
  plot.addEventListener('keydown', (event) => {
    if (!current) return;
    const lastIndex = current.days.length - 1;
    const moves: Record<string, number> = {
      ArrowLeft: Math.max((active ?? lastIndex) - 1, 0),
      ArrowRight: Math.min((active ?? lastIndex) + 1, lastIndex),
      Home: 0,
      End: lastIndex,
    };
    if (event.key in moves) {
      event.preventDefault();
      show(moves[event.key]);
    } else if (event.key === 'Escape') {
      show(null);
    }
  });

  new ResizeObserver(() => {
    if (current && Math.max(plot.clientWidth, 280) !== width) draw();
  }).observe(plot);

  function fillTable(series: HistorySeries): void {
    const lines = series.days.map((day, i) => {
      const row = document.createElement('tr');
      const head = document.createElement('th');
      head.scope = 'row';
      head.textContent = formatDayLong(day, lang);
      row.append(head);
      for (const key of SERIES) {
        const cell = document.createElement('td');
        cell.textContent = priceText(series[key][i]);
        row.append(cell);
      }
      return row;
    });
    rows.replaceChildren(...lines);
  }

  function summary(series: HistorySeries): string {
    const ends = (key: SeriesKey) => {
      const values = series[key];
      const a = values.find((v) => v !== null) ?? null;
      const b = values.findLast((v) => v !== null) ?? null;
      return [priceText(a), priceText(b)] as const;
    };
    return t.releve.historySummary(
      fuel,
      formatDayLong(series.days[0], lang),
      formatDayLong(series.days.at(-1)!, lang),
      ends('france'),
      ends('department'),
    );
  }

  return {
    update(series, fuelLabel) {
      current = series;
      fuel = fuelLabel;
      figure.hidden = series === null;
      if (!series) return;
      const days = Math.round(dayNumber(series.days.at(-1)!) - dayNumber(series.days[0])) + 1;
      title.textContent = t.releve.historyTitle(fuelLabel, days);
      plot.setAttribute('aria-label', summary(series));
      fillTable(series);
      active = null;
      draw();
    },
  };
}
