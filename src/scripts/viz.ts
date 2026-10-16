// Shared helpers for the case-study diagrams. Every diagram speaks one
// language: nodes light up in their hue, a packet travels a wire while the wire
// fills behind it in the same hue, and a status line says what is happening.
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { onThemeChange } from './theme';
gsap.registerPlugin(MotionPathPlugin);

export { gsap };
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Colours are theme tokens. Tweens resolve them when they start (function-based
// values), and a theme change invalidates every diagram's timeline so the next
// pass picks up the new palette. Hue meanings, shared by all diagrams:
// t1 model · t5 data and search · t3 cache, retry and repair · t2 success · t4 failure.
export const C = {
  ink: 'var(--ink)',
  line: 'var(--viz-edge)',
  box: 'var(--viz-node)',
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
/** `color` mixed into the node fill, resolved at tween start. */
export const tint = (color: string, amount: number) => () => gsap.utils.interpolate(resolve(C.box), resolve(color), amount);

// elements whose fill/stroke a tween has written inline, cleared on theme change
const painted = new Set<Element>();
export const paint = <T extends Element | null>(el: T) => (el && painted.add(el), el);
const timelines = new Set<gsap.core.Timeline>();

onThemeChange(() => {
  timelines.forEach((tl) => tl.invalidate());
  if (painted.size) gsap.set([...painted], { clearProps: 'fill,stroke' });
});

/* Playback ----------------------------------------------------------------
   One diagram may own several timelines (Documan's two tabs); only the active
   one runs, and only while the diagram is on screen, not paused by the
   visitor, and not busy with an on-demand action. */
type State = { tls: gsap.core.Timeline[]; active?: gsap.core.Timeline; visible: boolean; paused: boolean; busy: boolean; btn: HTMLButtonElement | null };
const states = new WeakMap<Element, State>();

function sync(root: Element) {
  const s = states.get(root)!;
  s.tls.forEach((t) => t !== s.active && t.pause());
  if (s.active && !reduceMotion()) {
    if (s.visible && !s.paused && !s.busy) s.active.play();
    else s.active.pause();
  }
  if (s.btn) {
    s.btn.setAttribute('aria-pressed', String(s.paused));
    s.btn.setAttribute('aria-label', s.paused ? 'Play animation' : 'Pause animation');
  }
}

function state(root: Element): State {
  let s = states.get(root);
  if (s) return s;
  const btn = root.querySelector<HTMLButtonElement>('[data-viz-pause]');
  s = { tls: [], visible: false, paused: false, busy: false, btn };
  states.set(root, s);
  if (reduceMotion()) btn?.remove();
  btn?.addEventListener('click', () => {
    s!.paused = !s!.paused;
    sync(root);
  });
  new IntersectionObserver(
    ([e]) => {
      s!.visible = e.isIntersecting;
      sync(root);
    },
    { threshold: 0.2 },
  ).observe(root);
  return s;
}

/** Register a looping timeline; the first one registered plays when the diagram is on screen. */
export function playWhenVisible(root: Element, tl: gsap.core.Timeline) {
  const s = state(root);
  timelines.add(tl);
  s.tls.push(tl);
  tl.pause();
  tl.eventCallback('onUpdate', () => {
    if (s.active === tl) (root as HTMLElement).style.setProperty('--viz-p', tl.progress().toFixed(3));
  });
  if (reduceMotion()) tl.progress(1).pause();
  if (!s.active) s.active = tl;
  sync(root);
}

/** Make `tl` the diagram's running timeline (e.g. after switching tabs). */
export function activate(root: Element, tl: gsap.core.Timeline) {
  const s = state(root);
  s.active = tl;
  if (reduceMotion()) tl.progress(1);
  else tl.restart();
  sync(root);
}

/** Hold the loop while an on-demand action plays. */
export function setBusy(root: Element, busy: boolean) {
  state(root).busy = busy;
  sync(root);
}

/* Moves ------------------------------------------------------------------- */

/** Light a node up in `color`, then let it settle back. */
export const glow = (tl: gsap.core.Timeline, box: Element | null, color: string, at?: gsap.Position, hold = 0.6) => {
  if (!box) return tl;
  paint(box);
  return tl
    .to(box, { stroke: col(color), fill: tint(color, 0.16), duration: 0.25 }, at)
    .to(box, { stroke: col(C.line), fill: col(C.box), duration: 0.6 }, `>${hold}`);
};

let travels = 0;
// each wire gets one overlay path that fills in behind the packet
const flows = new WeakMap<Element, SVGPathElement>();
function flowOf(path: SVGPathElement) {
  let f = flows.get(path);
  if (!f) {
    f = path.cloneNode() as SVGPathElement;
    f.removeAttribute('data-p');
    f.removeAttribute('style');
    f.setAttribute('class', 'flow');
    const len = path.getTotalLength();
    f.style.strokeDasharray = `${len}`;
    f.style.strokeDashoffset = `${len}`;
    f.style.opacity = '0';
    path.after(f);
    flows.set(path, paint(f));
  }
  return f;
}

/** Send a packet along a wire in `color`; the wire fills behind it, then fades. */
export const travel = (tl: gsap.core.Timeline, pkt: Element, path: Element | null, dur = 0.7, at?: gsap.Position, color = C.t2) => {
  if (!path) return tl;
  const p = path as SVGPathElement;
  const f = flowOf(p);
  const len = p.getTotalLength();
  const at0 = `travel${++travels}`;
  paint(pkt);
  // the packet's move is added last, so '>' after a travel still means "on arrival"
  return tl
    .addLabel(at0, at)
    .set(pkt, { opacity: 1, fill: col(color) }, at0)
    .set(f, { opacity: 1, strokeDashoffset: len, stroke: col(color) }, at0)
    .to(f, { opacity: 0, duration: 0.6 }, `${at0}+=${dur + 0.5}`)
    .to(f, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, at0)
    .to(pkt, { duration: dur, ease: 'power2.inOut', motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5] } }, at0);
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
