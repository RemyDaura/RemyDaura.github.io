/**
 * La trace suit la lecture : le rail se remplit jusqu'à la ligne de lecture
 * (le milieu de l'écran) et chaque noeud s'allume quand on l'atteint.
 *
 * Amélioration progressive : sans ce script, ou avec "réduire les animations",
 * la trace reste dessinée en entier (voir src/styles/trace.css).
 */

const READING_LINE = 0.5; // fraction de la hauteur de l'écran

interface Segment {
  section: HTMLElement;
  node: HTMLElement | null;
  isStart: boolean;
  isEnd: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function centerOf(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
}

function initTrace(): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const segments: Segment[] = [];

  // Même règle que trace.css : la première section d'un conteneur .trace ouvre la trace,
  // la dernière la ferme.
  for (const trace of document.querySelectorAll<HTMLElement>('.trace')) {
    const sections = Array.from(trace.querySelectorAll<HTMLElement>(':scope > section.trace-section'));
    sections.forEach((section, i) => {
      segments.push({
        section,
        node: section.querySelector<HTMLElement>(':scope > .trace-node'),
        isStart: i === 0,
        isEnd: i === sections.length - 1,
      });
    });
  }
  if (segments.length === 0) return;

  let frame = 0;

  const update = () => {
    frame = 0;
    const line = window.innerHeight * READING_LINE;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    let current: HTMLElement | null = null;

    for (const { section, node, isStart, isEnd } of segments) {
      const rect = section.getBoundingClientRect();
      const nodeY = node ? centerOf(node) : rect.top;
      const start = isStart ? nodeY : rect.top;
      const end = isEnd ? nodeY : rect.bottom;
      const progress = atBottom ? 1 : clamp((line - start) / Math.max(end - start, 1), 0, 1);
      section.style.setProperty('--trace-p', progress.toFixed(4));

      const reached = atBottom || nodeY <= line;
      section.toggleAttribute('data-reached', reached);
      if (reached) current = section;
    }

    for (const { section } of segments) section.toggleAttribute('data-current', section === current);
  };

  const schedule = () => {
    if (frame === 0) frame = window.requestAnimationFrame(update);
  };

  const enable = () => {
    document.documentElement.classList.add('trace-live');
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  };

  const disable = () => {
    document.documentElement.classList.remove('trace-live');
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };

  if (!motion.matches) enable();
  motion.addEventListener('change', () => (motion.matches ? disable() : enable()));
}

initTrace();
