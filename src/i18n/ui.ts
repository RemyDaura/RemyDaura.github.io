/**
 * Textes d'interface, en français (référence) et en anglais.
 * Le type de l'objet anglais est déduit du français : une clé oubliée fait échouer
 * la vérification TypeScript (npm run check).
 */
import type { FuelCode, ReleveState } from '../lib/releve';

export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'fr';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

const fr = {
  htmlLang: "fr",
  ogLocale: "fr_FR",
  skip: "Aller au contenu",
  brandLabel: "remy_daura.trace, retour à l'accueil",
  newTab: "(nouvel onglet)",
  table: "Tableau, défilement horizontal possible",
  tableOf: (title: string) => `${title} (tableau défilant)`,
  langSwitch: "Choix de la langue",
  langNames: { fr: "Français", en: "English" },
  menu: { open: "Menu", close: "Fermer", label: "Menu" },
  nav: {
    label: "Navigation principale",
    dossiers: "Dossiers",
    terrain: "Expérience",
    lignage: "Parcours",
    schema: "Compétences",
    destination: "Contact",
  },
  dossierNav: {
    label: "Navigation du dossier",
    all: "Tous les dossiers",
    code: "Code sur GitHub",
    dashboard: "Tableau de bord",
  },
  status: {
    label: "État du pipeline",
    pipeline: "pipeline_quotidien",
    state: { ok: "succès", late: "en retard", failed: "échec" } satisfies Record<ReleveState, string>,
    running: "run en cours",
    day: (date: string) => `relevé du ${date}`,
    stations: (n: string, approx: boolean) => `${approx ? "≈ " : ""}${n} stations`,
    tests: (total: number, failures: number) => `${total} tests · ${failures} échec${failures > 1 ? "s" : ""}`,
    why: "d'où viennent ces chiffres ?",
  },
  releve: {
    fuelGroup: "Carburant",
    fuels: { gazole: "Gazole", sp98: "SP98", sp95: "SP95", e10: "E10", gplc: "GPLc", e85: "E85" } satisfies Record<FuelCode, string>,
    chip: {
      ok: "run réussi",
      late: "en retard · relevé de plus de 24 h",
      failed: "échec · le dernier run s'est arrêté",
    } satisfies Record<ReleveState, string>,
    loaded: (n: string, approx: boolean) => `${approx ? "≈ " : ""}${n} stations chargées`,
    tests: (total: number, failures: number, warnings: number) =>
      `${total} tests · ${failures} échec${failures > 1 ? "s" : ""} · ${warnings} avertissement${warnings > 1 ? "s" : ""}`,
    france: "Moyenne France",
    department: "Bouches-du-Rhône",
    perLitre: (fuel: string) => `${fuel}, prix au litre`,
    cheaper: (delta: string) => `Moins cher que la moyenne nationale (${delta})`,
    dearer: (delta: string) => `Plus cher que la moyenne nationale (${delta})`,
    same: "Identique à la moyenne nationale",
    lateNote: (date: string) => `Le run du matin n'a pas encore publié de relevé. Valeurs du dernier relevé valide, le ${date}.`,
    failedNote: (date: string) =>
      `Rien n'a été publié par le dernier run : les données douteuses s'arrêtent avant l'écran. Valeurs du dernier relevé valide, le ${date}.`,
    snapshotNote: "Instantané embarqué dans le site : le relevé publié ce matin n'a pas pu être lu.",
    runningNote: "Un run est en cours : le relevé sera mis à jour dans quelques minutes.",
    method:
      "Moyennes pondérées par le nombre de stations, sur les prix de moins de 30 jours et hors prix suspects. Source : flux DGCCRF, Licence Ouverte 2.0.",
    howBuilt: "Voir comment c'est construit",
    runLink: "Voir le run",
  },
  dossier: {
    number: (n: string) => `Dossier n°${n}`,
    code: (n: string) => `D${n}`,
    production: "En production",
    open: "Ouvrir le dossier",
    lineage: "Lignage du projet",
    stats: "En chiffres",
    previous: "Dossier précédent",
    next: "Dossier suivant",
    back: "Retour",
    others: "Autres dossiers",
    defaultCta: "Des données à fiabiliser ?",
    write: "Écrivez-moi",
  },
  footer: {
    lineageTitle: "Lignage de ce site",
    lineage: ["contenu FR · EN", "Astro", "contrôles : HTML, liens, accessibilité", "GitHub Pages"],
    note: "Le relevé du jour vient du pipeline du dossier n°14.",
    source: "Code du site",
    up: "Remonter à la source",
    rights: "Rémy Daura · 2026",
  },
  contact: {
    email: "Email",
    cv: "CV (PDF)",
    cvDownload: "Télécharger le CV",
  },
  notFound: {
    title: "Trace perdue",
    kicker: "Erreur 404",
    lede: "Cette page n'existe pas, ou plus. Les anciennes adresses des dossiers (p2.html à p14.html) redirigent vers leurs nouvelles pages.",
    home: "Revenir à l'accueil",
    dossiers: "Voir les dossiers",
  },
};

export type UI = typeof fr;

const en: UI = {
  htmlLang: "en",
  ogLocale: "en_GB",
  skip: "Skip to content",
  brandLabel: "remy_daura.trace, back to home",
  newTab: "(opens in a new tab)",
  table: "Table, may scroll horizontally",
  tableOf: (title: string) => `${title} (scrollable table)`,
  langSwitch: "Language",
  langNames: { fr: "Français", en: "English" },
  menu: { open: "Menu", close: "Close", label: "Menu" },
  nav: {
    label: "Main navigation",
    dossiers: "Case files",
    terrain: "Experience",
    lignage: "Background",
    schema: "Skills",
    destination: "Contact",
  },
  dossierNav: {
    label: "Case file navigation",
    all: "All case files",
    code: "Code on GitHub",
    dashboard: "Dashboard",
  },
  status: {
    label: "Pipeline status",
    pipeline: "pipeline_quotidien",
    state: { ok: "success", late: "late", failed: "failed" },
    running: "run in progress",
    day: (date: string) => `snapshot of ${date}`,
    stations: (n: string, approx: boolean) => `${approx ? "≈ " : ""}${n} stations`,
    tests: (total: number, failures: number) => `${total} tests · ${failures} failure${failures === 1 ? "" : "s"}`,
    why: "where do these numbers come from?",
  },
  releve: {
    fuelGroup: "Fuel",
    fuels: { gazole: "Diesel", sp98: "SP98", sp95: "SP95", e10: "E10", gplc: "LPG", e85: "E85" },
    chip: {
      ok: "run succeeded",
      late: "late · snapshot older than 24 h",
      failed: "failed · the last run stopped",
    },
    loaded: (n: string, approx: boolean) => `${approx ? "≈ " : ""}${n} stations loaded`,
    tests: (total: number, failures: number, warnings: number) =>
      `${total} tests · ${failures} failure${failures === 1 ? "" : "s"} · ${warnings} warning${warnings === 1 ? "" : "s"}`,
    france: "France average",
    department: "Bouches-du-Rhône (Marseille area)",
    perLitre: (fuel: string) => `${fuel}, price per litre`,
    cheaper: (delta: string) => `Cheaper than the national average (${delta})`,
    dearer: (delta: string) => `More expensive than the national average (${delta})`,
    same: "Same as the national average",
    lateNote: (date: string) => `This morning's run has not published a snapshot yet. Values from the last valid snapshot, ${date}.`,
    failedNote: (date: string) =>
      `The last run published nothing: questionable data stops before the screen. Values from the last valid snapshot, ${date}.`,
    snapshotNote: "Snapshot bundled with the site: this morning's published file could not be read.",
    runningNote: "A run is in progress: the snapshot will update in a few minutes.",
    method:
      "Averages weighted by number of stations, on prices less than 30 days old, suspicious prices excluded. Source: DGCCRF feed (French consumer authority), Open Licence 2.0.",
    howBuilt: "See how it's built",
    runLink: "See the run",
  },
  dossier: {
    number: (n: string) => `Case file no. ${n}`,
    code: (n: string) => `D${n}`,
    production: "In production",
    open: "Open the case file",
    lineage: "Project lineage",
    stats: "Key figures",
    previous: "Previous case file",
    next: "Next case file",
    back: "Back",
    others: "Other case files",
    defaultCta: "Data that needs to be reliable?",
    write: "Get in touch",
  },
  footer: {
    lineageTitle: "Lineage of this site",
    lineage: ["content FR · EN", "Astro", "checks: HTML, links, accessibility", "GitHub Pages"],
    note: "Today's snapshot comes from the case file no. 14 pipeline.",
    source: "Site source code",
    up: "Back to the source",
    rights: "Rémy Daura · 2026",
  },
  contact: {
    email: "Email",
    cv: "CV (PDF, in French)",
    cvDownload: "Download my CV",
  },
  notFound: {
    title: "Trace lost",
    kicker: "Error 404",
    lede: "This page does not exist, or no longer does. The old case file addresses (p2.html to p14.html) redirect to their new pages.",
    home: "Back to home",
    dossiers: "See the case files",
  },
};

const UI_BY_LANG: Record<Lang, UI> = { fr, en };

export function useTranslations(lang: Lang): UI {
  return UI_BY_LANG[lang];
}
