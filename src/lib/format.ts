/**
 * Formats de nombres et de dates selon la langue de la page.
 * Utilisés au build et dans le navigateur, pour un rendu identique des deux côtés.
 */
import type { Lang } from '../i18n/ui';

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB' };

/** 2,239 € (fr) ou €2.239 (en). */
export function formatPrice(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

/** Écart signé : −0,002 € (fr) ou −€0.002 (en). */
export function formatDelta(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    signDisplay: 'exceptZero',
  }).format(value);
}

/** 9 800 (fr) ou 9,800 (en). */
export function formatInt(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: 0 }).format(value);
}

/** 05/11/2026 (fr) ou 5 Nov 2026 (en), pour la barre d'état. */
export function formatDayShort(day: string, lang: Lang): string {
  const date = new Date(`${day}T12:00:00Z`);
  return new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: 'UTC',
    ...(lang === 'fr' ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { dateStyle: 'medium' }),
  }).format(date);
}

/** 5 nov. 2026 (fr) ou 5 Nov 2026 (en), dans les phrases. */
export function formatDayLong(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { timeZone: 'UTC', dateStyle: 'medium' }).format(
    new Date(`${day}T12:00:00Z`),
  );
}

/** 3 nov. (fr) ou 3 Nov (en), sous l'axe d'une courbe. */
export function formatDayAxis(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { timeZone: 'UTC', day: 'numeric', month: 'short' }).format(
    new Date(`${day}T12:00:00Z`),
  );
}

/** Dates de réalisation d'un dossier (AAAA-MM-JJ) ; sans fin, il est en cours. */
export interface Period {
  start: string;
  end?: string;
}

const utc = (day: string): Date => new Date(`${day}T12:00:00Z`);
const part = (day: string, lang: Lang, options: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(LOCALES[lang], { timeZone: 'UTC', ...options }).format(utc(day));

/** Jour du mois, avec "1er" en français. */
function dayOfMonth(day: string, lang: Lang): string {
  const n = Number(day.slice(8, 10));
  return lang === 'fr' && n === 1 ? '1er' : String(n);
}

/**
 * Période en toutes lettres, pour la fiche d'un dossier :
 * "Du 25 juillet au 13 août 2025", "Du 4 au 18 septembre 2026", "Depuis le 3 novembre 2026" (fr) ;
 * "25 July to 13 August 2025", "4 to 18 September 2026", "Since 3 November 2026" (en).
 */
export function formatPeriodLong({ start, end }: Period, lang: Lang): string {
  const month = (d: string) => part(d, lang, { month: 'long' });
  const year = (d: string) => d.slice(0, 4);
  const full = (d: string) => `${dayOfMonth(d, lang)} ${month(d)} ${year(d)}`;

  if (!end) return lang === 'fr' ? `Depuis le ${full(start)}` : `Since ${full(start)}`;

  const sameYear = year(start) === year(end);
  const sameMonth = sameYear && start.slice(5, 7) === end.slice(5, 7);
  const from = sameMonth
    ? dayOfMonth(start, lang)
    : sameYear
      ? `${dayOfMonth(start, lang)} ${month(start)}`
      : full(start);
  return lang === 'fr' ? `Du ${from} au ${full(end)}` : `${from} to ${full(end)}`;
}

/**
 * Période au mois près, pour les listes :
 * "juil. - août 2025", "déc. 2025 - janv. 2026", "sept. 2026", "depuis nov. 2026" (fr) ;
 * "Jul - Aug 2025", "Dec 2025 - Jan 2026", "Sept 2026", "since Nov 2026" (en).
 */
export function formatPeriodShort({ start, end }: Period, lang: Lang): string {
  const month = (d: string) => part(d, lang, { month: 'short' });
  const year = (d: string) => d.slice(0, 4);

  if (!end) return `${lang === 'fr' ? 'depuis' : 'since'} ${month(start)} ${year(start)}`;
  if (year(start) !== year(end)) return `${month(start)} ${year(start)} - ${month(end)} ${year(end)}`;
  if (start.slice(5, 7) === end.slice(5, 7)) return `${month(end)} ${year(end)}`;
  return `${month(start)} - ${month(end)} ${year(end)}`;
}

/** Durée arrondie à la semaine : "3 semaines" (fr), "3 weeks" (en). Vide pour un dossier en cours. */
export function formatDuration({ start, end }: Period, lang: Lang): string {
  if (!end) return '';
  const days = Math.round((utc(end).getTime() - utc(start).getTime()) / 86_400_000);
  const weeks = Math.max(1, Math.round(days / 7));
  if (lang === 'fr') return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
}
