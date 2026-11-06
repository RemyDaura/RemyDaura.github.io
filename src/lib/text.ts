/**
 * "Pièce à conviction" -> "piece-a-conviction" (ancres et identifiants).
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Lien externe (http, https, mailto exclu) : ouvert dans un nouvel onglet. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) && !href.startsWith('https://remydaura.github.io/');
}
