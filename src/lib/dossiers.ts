/**
 * Accès aux dossiers et contrôles d'intégrité de la collection.
 *
 * Comme les tests dbt du dossier n°14, ces contrôles font échouer le build
 * plutôt que de publier un site incohérent (numéro en double, traduction manquante...).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { LANGS, type Lang } from '../i18n/ui';

export type Dossier = CollectionEntry<'dossiers'>;

/** 2 -> "02" */
export const pad = (num: number): string => String(num).padStart(2, '0');

export function langOf(entry: Dossier): Lang {
  return entry.id.split('/')[0] as Lang;
}

export function dossierPath(lang: Lang, num: number): string {
  return getRelativeLocaleUrl(lang, `dossiers/${pad(num)}/`);
}

export function homePath(lang: Lang, hash = ''): string {
  return getRelativeLocaleUrl(lang, '') + hash;
}

function checkIntegrity(entries: Dossier[]): void {
  const problems: string[] = [];
  const byLang = new Map<Lang, Map<number, Dossier>>(LANGS.map((l) => [l, new Map()]));

  for (const entry of entries) {
    const [lang, file] = entry.id.split('/');
    const index = byLang.get(lang as Lang);
    if (!index) {
      problems.push(`${entry.id} : langue inconnue`);
      continue;
    }
    if (file !== pad(entry.data.num)) {
      problems.push(`${entry.id} : le fichier doit s'appeler ${pad(entry.data.num)}.mdx (num = ${entry.data.num})`);
    }
    if (index.has(entry.data.num)) problems.push(`${entry.id} : numéro ${entry.data.num} en double`);
    index.set(entry.data.num, entry);
  }

  // Chaque dossier existe dans toutes les langues, avec le même statut et la même mise en avant
  const [reference, ...others] = LANGS;
  for (const [num, ref] of byLang.get(reference)!) {
    for (const lang of others) {
      const twin = byLang.get(lang)!.get(num);
      if (!twin) {
        problems.push(`dossier ${pad(num)} : traduction "${lang}" manquante`);
        continue;
      }
      for (const key of ['featured', 'status'] as const) {
        if (twin.data[key] !== ref.data[key]) problems.push(`dossier ${pad(num)} : "${key}" diffère entre ${reference} et ${lang}`);
      }
      if (twin.data.stats.length !== ref.data.stats.length) {
        problems.push(`dossier ${pad(num)} : nombre de chiffres clés différent entre ${reference} et ${lang}`);
      }
    }
  }
  for (const lang of others) {
    for (const num of byLang.get(lang)!.keys()) {
      if (!byLang.get(reference)!.has(num)) problems.push(`dossier ${pad(num)} : présent en "${lang}" mais absent en "${reference}"`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Collection "dossiers" incohérente :\n- ${problems.join('\n- ')}`);
  }
}

let all: Promise<Dossier[]> | undefined;

function loadAll(): Promise<Dossier[]> {
  all ??= getCollection('dossiers').then((entries) => {
    checkIntegrity(entries);
    return entries;
  });
  return all;
}

/** Dossiers d'une langue, du plus récent au plus ancien. */
export async function getDossiers(lang: Lang): Promise<Dossier[]> {
  const entries = await loadAll();
  return entries.filter((e) => langOf(e) === lang).sort((a, b) => b.data.num - a.data.num);
}

export async function getDossier(lang: Lang, num: number): Promise<Dossier | undefined> {
  return (await getDossiers(lang)).find((e) => e.data.num === num);
}
