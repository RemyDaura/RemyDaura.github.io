/**
 * Contenu de la page d'accueil, en français et en anglais.
 * La structure est typée : les deux langues doivent avoir exactement les mêmes blocs.
 */
import type { GraphColumn } from '../lib/types';
import type { Lang } from './ui';

/** Une preuve renvoie soit vers un dossier (par son numéro), soit vers l'expérience terrain. */
export type Evidence = { dossier: number } | { terrain: true };


export interface HomeContent {
  meta: { title: string; description: string };
  hero: {
    label: string;
    title: string;
    lede: string;
    follow: string;
    profileQuery: [string, string];
    profile: { key: string; value: string; ok?: boolean }[];
  };
  freshness: { label: string; title: string; intro: string };
  dossiers: { label: string; aside: (rows: number) => string; title: string; intro: string };
  fieldwork: {
    label: string;
    aside: string;
    title: string;
    subtitle: string;
    items: { strong: string; rest: string }[];
    exhibit: { label: string; tag: string; title: string; body: string; tools: string };
  };
  lineage: {
    label: string;
    aside: string;
    title: string;
    intro: string;
    columns: GraphColumn[];
  };
  skills: {
    label: string;
    aside: (rows: number) => string;
    title: string;
    intro: string;
    headers: [string, string, string];
    terrainLabel: string;
    rows: { skill: string; tools: string; evidence: Evidence[] }[];
  };
  research: {
    label: string;
    aside: (rows: number) => string;
    title: string;
    intro: string;
    headers: [string, string, string];
    rows: { method: string; detected: string; limit: string }[];
    note: string;
    link: string;
  };
  appendices: { label: string; aside: (rows: number) => string; title: string; intro: (n: number) => string };
  destination: { label: string; aside: string; title: string; lede: string };
}

const fr: HomeContent = {
  meta: {
    title: "Rémy Daura · Data Analyst, en spécialisation data engineering",
    description:
      "Portfolio de Rémy Daura : 13 dossiers documentés, dont un pipeline de données en production (Python, BigQuery, dbt, GitHub Actions), et une expérience en entreprise. Disponible pour un CDD de 6 à 8 mois.",
  },
  hero: {
    label: "Source",
    title: "Chaque donnée laisse une trace.",
    lede: "Je la remonte jusqu'à sa source pour trouver ce qui cloche, puis je construis les pipelines qui la gardent fiable. Data Analyst diplômé, en spécialisation data engineering.",
    follow: "Suivre la trace",
    profileQuery: ["select * from", "profil"],
    profile: [
      { key: "rôle", value: "Data Analyst → Data Engineer" },
      { key: "diplôme", value: "Titre RNCP niveau 6 (Bac+3/4)" },
      { key: "statut", value: "Disponible immédiatement", ok: true },
      { key: "contrat", value: "CDD ou mission, 6 à 8 mois" },
      { key: "lieu", value: "Marseille · télétravail" },
      { key: "langues", value: "Français, anglais" },
    ],
  },
  freshness: {
    label: "Fraîcheur",
    title: "Ce site est alimenté par mon pipeline",
    intro:
      "Chaque matin, le pipeline du dossier n°14 charge les prix de toutes les stations de France, les teste, puis publie ce relevé. Choisissez un carburant.",
  },
  dossiers: {
    label: "Dossiers",
    aside: (rows) => `mart_dossiers · ${rows} lignes`,
    title: "Dossiers principaux",
    intro: "Cinq projets, chacun avec son lignage : d'où viennent les données, ce qui leur arrive, et ce qui en sort.",
  },
  fieldwork: {
    label: "Terrain",
    aside: "stage_axiome · sept. - oct. 2026",
    title: "Data Analyst (stage) chez Axiome",
    subtitle: "Éditeur de Lumina, assistant IA pour l'industrie · télétravail",
    items: [
      {
        strong: "Trois tableaux de bord Looker Studio connectés à BigQuery",
        rest: " pour suivre l'usage du produit : volume de questions, réponses sans contexte trouvé, déploiements SaaS et on-premise, qualité des réponses.",
      },
      {
        strong: "Lecture du schéma de données",
        rest: " (deux tables, trois vues) avant de dessiner quoi que ce soit, pour comprendre ce que mesure chaque colonne.",
      },
      {
        strong: "Chaque indicateur contrôlé en SQL",
        rest: " avant d'être montré, ce qui a révélé une colonne mal définie et des erreurs d'agrégation.",
      },
      {
        strong: "Contribution au site de l'entreprise via GitHub",
        rest: " : branches, Pull Requests relues, intégration continue.",
      },
    ],
    exhibit: {
      label: "Pièce à conviction",
      tag: "anomalie",
      title: "Un compteur mensuel traité comme un volume quotidien.",
      body: "Il faussait toutes les comparaisons de volume. Repéré en recalculant chaque indicateur en SQL, corrigé avant la présentation à l'équipe.",
      tools: "BigQuery · SQL · Looker Studio · GitHub",
    },
  },
  lineage: {
    label: "Lignage",
    aside: "parcours · 2021 → aujourd'hui",
    title: "Mon parcours, modélisé comme un projet dbt",
    intro: "Des sources, des transformations, des tables finales, et ce qu'elles alimentent.",
    columns: [
      {
        title: "Sources",
        nodes: [
          { name: "src_bts_sio", desc: "2021-2023 · développement, SQL, réseau", tone: "source" },
          { name: "src_openclassrooms", desc: "2025-2026 · Data Analyst, titre RNCP niveau 6", tone: "source" },
        ],
      },
      {
        title: "Staging · compétences",
        nodes: [
          { name: "stg_sql", desc: "BigQuery, MySQL, Snowflake", tone: "default" },
          { name: "stg_python", desc: "pandas, scikit-learn, pytest", tone: "default" },
          { name: "stg_dataviz", desc: "Power BI, Looker Studio", tone: "default" },
        ],
      },
      {
        title: "Marts · réalisations",
        nodes: [
          { name: "mart_pipeline_carburants", desc: "en production, chaque matin", tone: "accent" },
          { name: "mart_axiome", desc: "stage · 3 tableaux de bord", tone: "default" },
          { name: "mart_dossiers", desc: "13 projets documentés", tone: "default" },
        ],
      },
      {
        title: "Exposures · suite",
        nodes: [
          { name: "cdd_6_8_mois", desc: "disponible maintenant", tone: "ok" },
          { name: "data_engineer", desc: "cible · cloud, orchestration", tone: "target" },
          { name: "ai_engineer", desc: "cible · modèles sur des données fiables", tone: "target" },
        ],
      },
    ],
  },
  skills: {
    label: "Schéma",
    aside: (rows) => `competences · ${rows} lignes`,
    title: "Compétences, avec leurs preuves",
    intro: "Pas de jauges ni d'étoiles : chaque compétence renvoie aux dossiers où elle a servi.",
    headers: ["Compétence", "Outils", "Preuves"],
    terrainLabel: "Axiome",
    rows: [
      { skill: "SQL", tools: "BigQuery, MySQL, Snowflake", evidence: [{ terrain: true }, { dossier: 3 }, { dossier: 5 }, { dossier: 8 }, { dossier: 14 }] },
      { skill: "Python", tools: "pandas, NumPy, pytest", evidence: [{ dossier: 6 }, { dossier: 9 }, { dossier: 13 }, { dossier: 14 }] },
      { skill: "Modélisation et transformation", tools: "dbt, couches staging, intermediate, marts", evidence: [{ dossier: 8 }, { dossier: 14 }] },
      { skill: "Qualité des données", tools: "tests dbt, Pandera, Great Expectations", evidence: [{ dossier: 13 }, { dossier: 14 }] },
      { skill: "Orchestration et conteneurs", tools: "GitHub Actions, Docker", evidence: [{ dossier: 14 }] },
      { skill: "Visualisation", tools: "Power BI (DAX), Looker Studio", evidence: [{ terrain: true }, { dossier: 7 }, { dossier: 10 }, { dossier: 14 }] },
      { skill: "Machine learning", tools: "scikit-learn : régression logistique, K-means, ACP", evidence: [{ dossier: 11 }, { dossier: 12 }] },
      { skill: "Statistiques", tools: "tests, corrélation, ACP", evidence: [{ dossier: 9 }, { dossier: 11 }] },
      { skill: "Git et GitHub", tools: "branches, Pull Requests, intégration continue", evidence: [{ terrain: true }, { dossier: 14 }] },
      { skill: "Excel", tools: "tableaux croisés dynamiques", evidence: [{ dossier: 2 }] },
      { skill: "Communication", tools: "restitution à des publics non techniques", evidence: [{ terrain: true }, { dossier: 10 }, { dossier: 11 }] },
    ],
  },
  research: {
    label: "Veille",
    aside: (rows) => `comparatif_validation · ${rows} lignes`,
    title: "Comparer avant de choisir",
    intro:
      "Extrait de la veille du dossier n°13 : trois méthodes de fiabilisation testées sur les mêmes données, plutôt que de choisir par habitude.",
    headers: ["Méthode", "Ce qu'elle a détecté", "Limite observée"],
    rows: [
      { method: "Pandera", detected: "5/5 anomalies de prix et de stock, en ~9 lignes de code", limit: "Ne détecte que les règles explicitement écrites" },
      { method: "Great Expectations", detected: "Mêmes résultats que Pandera, plus un rapport HTML automatique", limit: "~65 % de code en plus pour la même couverture" },
      { method: "IA générative, données brutes", detected: "2 catégories d'anomalies absentes des deux schémas, trouvées sans indice préalable", limit: "Résultat non reproductible automatiquement" },
    ],
    note: "Ce test a aussi révélé deux angles morts dans mon propre schéma de validation, corrigés depuis.",
    link: "Lire le dossier n°13",
  },
  appendices: {
    label: "Annexes",
    aside: (rows) => `pieces_jointes · ${rows} lignes`,
    title: "Pièces jointes au dossier",
    intro: (n) => `${n === 8 ? "Huit" : n} projets supplémentaires, du plus récent au plus ancien.`,
  },
  destination: {
    label: "Destination",
    aside: "contact",
    title: "La trace s'arrête ici. La suite peut s'écrire chez vous.",
    lede: "Disponible immédiatement pour un CDD ou une mission de 6 à 8 mois, à Marseille ou en télétravail.",
  },
};

const en: HomeContent = {
  meta: {
    title: "Rémy Daura · Data Analyst, specialising in data engineering",
    description:
      "Portfolio of Rémy Daura: 13 documented case files, including a data pipeline in production (Python, BigQuery, dbt, GitHub Actions), and industry experience. Available for a 6 to 8 month contract.",
  },
  hero: {
    label: "Source",
    title: "Every piece of data leaves a trace.",
    lede: "I follow it back to its source to find what's wrong, then I build the pipelines that keep it reliable. Qualified Data Analyst, specialising in data engineering.",
    follow: "Follow the trace",
    profileQuery: ["select * from", "profile"],
    profile: [
      { key: "role", value: "Data Analyst → Data Engineer" },
      { key: "degree", value: "French RNCP level 6 (bachelor's level)" },
      { key: "status", value: "Available now", ok: true },
      { key: "contract", value: "Fixed-term or freelance, 6 to 8 months" },
      { key: "location", value: "Marseille · remote" },
      { key: "languages", value: "French, English" },
    ],
  },
  freshness: {
    label: "Freshness",
    title: "This site is fed by my pipeline",
    intro:
      "Every morning, the pipeline from case file no. 14 loads fuel prices from every station in France, tests them, then publishes this snapshot. Pick a fuel.",
  },
  dossiers: {
    label: "Case files",
    aside: (rows) => `mart_dossiers · ${rows} rows`,
    title: "Main case files",
    intro: "Five projects, each with its lineage: where the data comes from, what happens to it, and what comes out.",
  },
  fieldwork: {
    label: "Fieldwork",
    aside: "stage_axiome · Sep - Oct 2026",
    title: "Data Analyst intern at Axiome",
    subtitle: "Maker of Lumina, an AI assistant for industry · remote",
    items: [
      {
        strong: "Three Looker Studio dashboards connected to BigQuery",
        rest: " to track product usage: question volume, answers with no context found, SaaS and on-premise deployments, answer quality.",
      },
      {
        strong: "Reading the data schema first",
        rest: " (two tables, three views) before drawing anything, to understand what each column measures.",
      },
      {
        strong: "Every metric checked in SQL",
        rest: " before being shown, which revealed a mis-defined column and aggregation errors.",
      },
      {
        strong: "Contributions to the company website through GitHub",
        rest: ": branches, reviewed pull requests, continuous integration.",
      },
    ],
    exhibit: {
      label: "Exhibit",
      tag: "anomaly",
      title: "A monthly counter treated as a daily volume.",
      body: "It skewed every volume comparison. Spotted by recomputing each metric in SQL, fixed before the presentation to the team.",
      tools: "BigQuery · SQL · Looker Studio · GitHub",
    },
  },
  lineage: {
    label: "Lineage",
    aside: "background · 2021 → today",
    title: "My background, modelled as a dbt project",
    intro: "Sources, transformations, final tables, and what they feed.",
    columns: [
      {
        title: "Sources",
        nodes: [
          { name: "src_bts_sio", desc: "2021-2023 · two-year IT degree: development, SQL, networking", tone: "source" },
          { name: "src_openclassrooms", desc: "2025-2026 · Data Analyst, RNCP level 6", tone: "source" },
        ],
      },
      {
        title: "Staging · skills",
        nodes: [
          { name: "stg_sql", desc: "BigQuery, MySQL, Snowflake", tone: "default" },
          { name: "stg_python", desc: "pandas, scikit-learn, pytest", tone: "default" },
          { name: "stg_dataviz", desc: "Power BI, Looker Studio", tone: "default" },
        ],
      },
      {
        title: "Marts · achievements",
        nodes: [
          { name: "mart_pipeline_carburants", desc: "in production, every morning", tone: "accent" },
          { name: "mart_axiome", desc: "internship · 3 dashboards", tone: "default" },
          { name: "mart_dossiers", desc: "13 documented projects", tone: "default" },
        ],
      },
      {
        title: "Exposures · next",
        nodes: [
          { name: "contract_6_8_months", desc: "available now", tone: "ok" },
          { name: "data_engineer", desc: "target · cloud, orchestration", tone: "target" },
          { name: "ai_engineer", desc: "target · models on reliable data", tone: "target" },
        ],
      },
    ],
  },
  skills: {
    label: "Schema",
    aside: (rows) => `skills · ${rows} rows`,
    title: "Skills, with evidence",
    intro: "No gauges, no stars: each skill links to the case files where it was put to work.",
    headers: ["Skill", "Tools", "Evidence"],
    terrainLabel: "Axiome",
    rows: [
      { skill: "SQL", tools: "BigQuery, MySQL, Snowflake", evidence: [{ terrain: true }, { dossier: 3 }, { dossier: 5 }, { dossier: 8 }, { dossier: 14 }] },
      { skill: "Python", tools: "pandas, NumPy, pytest", evidence: [{ dossier: 6 }, { dossier: 9 }, { dossier: 13 }, { dossier: 14 }] },
      { skill: "Modelling and transformation", tools: "dbt, staging, intermediate and mart layers", evidence: [{ dossier: 8 }, { dossier: 14 }] },
      { skill: "Data quality", tools: "dbt tests, Pandera, Great Expectations", evidence: [{ dossier: 13 }, { dossier: 14 }] },
      { skill: "Orchestration and containers", tools: "GitHub Actions, Docker", evidence: [{ dossier: 14 }] },
      { skill: "Visualisation", tools: "Power BI (DAX), Looker Studio", evidence: [{ terrain: true }, { dossier: 7 }, { dossier: 10 }, { dossier: 14 }] },
      { skill: "Machine learning", tools: "scikit-learn: logistic regression, K-means, PCA", evidence: [{ dossier: 11 }, { dossier: 12 }] },
      { skill: "Statistics", tools: "tests, correlation, PCA", evidence: [{ dossier: 9 }, { dossier: 11 }] },
      { skill: "Git and GitHub", tools: "branches, pull requests, continuous integration", evidence: [{ terrain: true }, { dossier: 14 }] },
      { skill: "Excel", tools: "pivot tables", evidence: [{ dossier: 2 }] },
      { skill: "Communication", tools: "presenting to non-technical audiences", evidence: [{ terrain: true }, { dossier: 10 }, { dossier: 11 }] },
    ],
  },
  research: {
    label: "Research",
    aside: (rows) => `validation_comparison · ${rows} rows`,
    title: "Compare before choosing",
    intro:
      "From the research in case file no. 13: three data validation methods tested on the same data, rather than picking one out of habit.",
    headers: ["Method", "What it detected", "Limit observed"],
    rows: [
      { method: "Pandera", detected: "5/5 price and stock anomalies, in ~9 lines of code", limit: "Only catches rules that are explicitly written" },
      { method: "Great Expectations", detected: "Same results as Pandera, plus an automatic HTML report", limit: "~65% more code for the same coverage" },
      { method: "Generative AI, raw data", detected: "2 anomaly categories missing from both schemas, found with no prior hint", limit: "Result not automatically reproducible" },
    ],
    note: "The test also revealed two blind spots in my own validation schema, fixed since.",
    link: "Read case file no. 13",
  },
  appendices: {
    label: "Appendices",
    aside: (rows) => `attachments · ${rows} rows`,
    title: "Attached to the file",
    intro: (n) => `${n === 8 ? "Eight" : n} more projects, from most recent to oldest.`,
  },
  destination: {
    label: "Destination",
    aside: "contact",
    title: "The trace ends here. The next chapter could start at your company.",
    lede: "Available now for a 6 to 8 month fixed-term contract or freelance mission, in Marseille or remote.",
  },
};

export const HOME: Record<Lang, HomeContent> = { fr, en };
