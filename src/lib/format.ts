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
