// Shared helpers for the case-study diagrams.
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { onThemeChange } from './theme';
gsap.registerPlugin(MotionPathPlugin);

export { gsap };
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Colours are theme tokens. Tweens resolve them when they start (function-based
// values), and a theme change invalidates every diagram's timeline so the next
// pass picks up the new palette.
export const C = {
  ink: 'var(--ink)',
  line: 'rgb(var(--ink-rgb) / 0.14)',
  box: 'var(--bg-2)',
  t1: 'var(--t1)',
  t2: 'var(--t2)',
  t3: 'var(--t3)',
  t4: 'var(--t4)',
  t5: 'var(--t5)',
};

let probe: HTMLElement | null = null;
/** Any CSS colour (tokens included) as an rgb()/rgba() string GSAP can interpolate. */
export function resolve(color: string): string {
  if (!probe) {
    probe = document.createElement('i');
    probe.hidden = true;
    document.body.append(probe);
  }
  probe.style.color = color;
  return getComputedStyle(probe).color;
}
/** A tween value that resolves `color` each time the tween starts. */
export const col = (color: string) => () => resolve(color);
/** `color` mixed into the diagram's box fill, resolved at tween start. */
export const tint = (color: string, amount: number) => () => gsap.utils.interpolate(resolve(C.box), resolve(color), amount);

// elements whose fill/stroke a tween has written inline, cleared on theme change
const painted = new Set<Element>();
export const paint = <T extends Element | null>(el: T) => (el && painted.add(el), el);
const timelines = new Set<gsap.core.Timeline>();

onThemeChange(() => {
  timelines.forEach((tl) => tl.invalidate());
  if (painted.size) gsap.set([...painted], { clearProps: 'fill,stroke' });
});

/** Run a looping timeline only while its diagram is on screen. */
export function playWhenVisible(root: Element, tl: gsap.core.Timeline) {
  timelines.add(tl);
  tl.pause();
  if (reduceMotion()) {
    tl.progress(1).pause();
    return;
  }
  // a diagram can mark itself busy (e.g. while an on-demand action plays)
  new IntersectionObserver(([e]) => (e.isIntersecting && (root as HTMLElement).dataset.busy !== '1' ? tl.play() : tl.pause()), {
    threshold: 0.2,
  }).observe(root);
}

/** Light a node's box up, then let it settle back. */
export const glow = (tl: gsap.core.Timeline, box: Element | null, color: string, at?: gsap.Position, hold = 0.6) => {
  if (!box) return tl;
  paint(box);
  return tl
    .to(box, { stroke: col(color), fill: tint(color, 0.16), duration: 0.25 }, at)
    .to(box, { stroke: col(C.line), fill: col(C.box), duration: 0.6 }, `>${hold}`);
};

/** Move a packet along an SVG path. */
export const travel = (tl: gsap.core.Timeline, pkt: Element, path: Element | null, dur = 0.7, at?: gsap.Position) => {
  if (!path) return tl;
  return tl
    .set(pkt, { opacity: 1 }, at)
    .to(pkt, { duration: dur, ease: 'power2.inOut', motionPath: { path: path as SVGPathElement, align: path as SVGPathElement, alignOrigin: [0.5, 0.5] } }, '<');
};

export const say = (tl: gsap.core.Timeline, el: HTMLElement | null, text: string, color: string, at?: gsap.Position) =>
  tl.call(
    () => {
      if (!el) return;
      el.textContent = text;
      el.style.setProperty('--sc', color);
    },
    [],
    at,
  );
