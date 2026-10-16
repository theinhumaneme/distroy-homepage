// Page-level motion: smooth scroll, the latent field, chapter reveals and the
// HUD. Component-specific animation lives next to each component.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { createField } from './field';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export const scrollToEl = (el: Element | null) => {
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
};

function smoothScroll() {
  if (reduce) return;
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    const el = id ? document.getElementById(id) : document.body;
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
    history.replaceState(null, '', `#${id}`);
  });
}

function field() {
  const canvas = document.getElementById('field') as HTMLCanvasElement | null;
  if (!canvas) return;
  // the hero's caption names each move the background cube makes
  const cap = document.querySelector<HTMLElement>('[data-cube-caption]');
  const f = createField(canvas, {
    onCube: (e) => {
      if (!cap) return;
      cap.dataset.phase = e.phase;
      cap.textContent = e.phase === 'solved' ? 'solved' : `${e.phase === 'scramble' ? 'scrambling' : 'solving'} · ${e.move} · ${e.step}/${e.of}`;
    },
  });
  document.querySelectorAll<HTMLElement>('[data-field]').forEach((sec) => {
    const idx = Number(sec.dataset.field);
    const level = Number(sec.dataset.fieldLevel ?? 1);
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => self.isActive && f.to(idx, level),
    });
  });
}

function reveals() {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      delay: Number(el.dataset.revealDelay ?? 0),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  if (reduce) return;
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words,chars', mask: 'words' });
    gsap.from(split.chars, {
      yPercent: 115,
      rotate: 4,
      duration: 1.15,
      ease: 'expo.out',
      stagger: 0.018,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

function hud() {
  // The section links (desktop bar and mobile menu) mark where the reader is.
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-stage-link]')];
  document.querySelectorAll<HTMLElement>('[data-stage]').forEach((sec) => {
    const href = `#${sec.dataset.stage}`;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (!self.isActive) return;
        links.forEach((l) => {
          const on = l.getAttribute('href')?.endsWith(href) ?? false;
          l.classList.toggle('on', on);
          if (on) l.setAttribute('aria-current', 'location');
          else l.removeAttribute('aria-current');
        });
      },
    });
  });
}

export function initMotion() {
  document.documentElement.classList.add('js');
  smoothScroll();
  field();
  reveals();
  hud();
  // fonts change line metrics, so re-measure once they land
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
