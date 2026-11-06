/** Lien de navigation de l'en-tête. */
export interface NavItem {
  label: string;
  href: string;
}

/** Tons d'un noeud du graphe de lignage. */
export type GraphTone = 'source' | 'default' | 'accent' | 'ok' | 'target' | 'planned';

export interface GraphNode {
  name: string;
  desc: string;
  tone?: GraphTone;
  /** Petite étiquette sous la description : "9 tests", "fraîcheur 24 h / 48 h"... */
  tag?: string;
}

export interface GraphColumn {
  title: string;
  nodes: GraphNode[];
}
