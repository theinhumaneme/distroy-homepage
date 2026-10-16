// Shared helpers for the case-study diagrams.
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
gsap.registerPlugin(MotionPathPlugin);

export { gsap };
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const C = {
  ink: '#eeede8',
  line: 'rgba(238,237,232,0.14)',
  box: '#101017',
  t1: '#b6a4ff',
  t2: '#6fe3c1',
  t3: '#ffc96b',
  t4: '#ff8a80',
  t5: '#7cc4ff',
};

/** Run a looping timeline only while its diagram is on screen. */
export function playWhenVisible(root: Element, tl: gsap.core.Timeline) {
  tl.pause();
  if (reduceMotion()) {
    tl.progress(1).pause();
    return;
  }
  new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.2 }).observe(root);
}

/** Light a node's box up, then let it settle back. */
export const glow = (tl: gsap.core.Timeline, box: Element | null, color: string, at?: gsap.Position, hold = 0.6) => {
  if (!box) return tl;
  return tl
    .to(box, { stroke: color, fill: gsap.utils.interpolate(C.box, color, 0.16), duration: 0.25 }, at)
    .to(box, { stroke: C.line, fill: C.box, duration: 0.6 }, `>${hold}`);
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
