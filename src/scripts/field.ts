// The background "latent field": one particle system that re-forms for each
// chapter. 0 cloud → 1 token sequence → 2 embedding matrix → 3 vector
// clusters → 4 attention arcs → 5 output stream.

import { cssVar, currentTheme, onThemeChange } from './theme';

type Formation = Float32Array;

// the five token hues, read from the theme so light mode gets its deeper set
const readPalette = () => ['--t1', '--t2', '--t3', '--t4', '--t5'].map((t) => cssVar(t));
let PALETTE = readPalette();
const ROTATE = [1.6, 0, 0.12, 1, 0.08, 0]; // how much each formation spins
const TILT = [0.18, 0, 0.55, 0.22, 0, 0];
// horizontal offset per formation (in field units) so shapes frame the copy
const SHIFT = [0.66, 0, 0, 0.1, 0, 0];

const hash = (i: number) => {
  let x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const gauss = (r: () => number) => {
  const u = Math.max(1e-6, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};
const mulberry = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const smooth = (t: number) => t * t * (3 - 2 * t);

function buildFormations(n: number): Formation[] {
  const r = mulberry(1337);
  const f: Formation[] = Array.from({ length: 6 }, () => new Float32Array(n * 3));

  // 0 · cloud: a loose, slightly flattened galaxy of tokens
  for (let i = 0; i < n; i++) {
    const shell = r() < 0.55;
    const u = r() * 2 - 1;
    const th = r() * Math.PI * 2;
    // a sphere of tokens: a crisp shell, an orbiting ring and a soft core
    const ring = !shell && r() < 0.35;
    const s = Math.sqrt(1 - u * u);
    if (ring) {
      const rr = 0.86 + gauss(r) * 0.03;
      f[0].set([rr * Math.cos(th), gauss(r) * 0.012, rr * Math.sin(th) * 0.32], i * 3);
      // tilt the ring
      const y = f[0][i * 3 + 1],
        x = f[0][i * 3];
      f[0][i * 3] = x * 0.94 - y * 0.34;
      f[0][i * 3 + 1] = x * 0.34 + y * 0.94;
      continue;
    }
    const rad = shell ? 0.56 + gauss(r) * 0.018 : Math.pow(r(), 0.9) * 0.5;
    f[0].set([rad * s * Math.cos(th), rad * u, rad * s * Math.sin(th)], i * 3);
  }

  // 1 · sequence: lines of "words" made of token blocks
  {
    let x = -1.55,
      line = 0,
      word = 0,
      left = 3 + Math.floor(r() * 7);
    for (let i = 0; i < n; i++) {
      f[1].set([x, -0.62 + line * 0.11, 0], i * 3);
      x += 0.026;
      if (--left <= 0) {
        x += 0.05;
        word++;
        left = 2 + Math.floor(r() * 8);
      }
      if (x > 1.55) {
        x = -1.55 + (line % 3) * 0.04;
        line = (line + 1) % 12;
      }
    }
  }

  // 2 · matrix: an embedding table seen in perspective
  {
    const cols = 56;
    const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const rr = Math.floor(i / cols);
      const x = (c / (cols - 1) - 0.5) * 3.0;
      const y = (rr / (rows - 1) - 0.5) * 1.6;
      f[2].set([x, y, 0], i * 3);
    }
  }

  // 3 · clusters: five topics in vector space
  {
    const centers = [
      [-0.95, -0.2, 0.25],
      [0.85, -0.1, -0.2],
      [0.1, 0.62, 0.15],
      [0.2, -0.75, -0.35],
      [-0.25, 0.25, -0.75],
    ];
    for (let i = 0; i < n; i++) {
      const c = centers[i % 5];
      const spread = i % 5 === 0 ? 0.26 : 0.2;
      f[3].set([c[0] + gauss(r) * spread, c[1] + gauss(r) * spread * 0.8, c[2] + gauss(r) * spread], i * 3);
    }
  }

  // 4 · attention: arcs between positions on a sequence
  {
    const slots = 22;
    const xs = Array.from({ length: slots }, (_, k) => -1.5 + (3 * k) / (slots - 1));
    const arcs = 46;
    const pairs = Array.from({ length: arcs }, () => {
      const a = Math.floor(r() * slots);
      let b = Math.floor(r() * slots);
      if (b === a) b = (a + 3) % slots;
      return [xs[a], xs[b]];
    });
    for (let i = 0; i < n; i++) {
      if (i % 9 === 0) {
        const x = xs[i % slots];
        f[4].set([x + gauss(r) * 0.012, 0.55 + gauss(r) * 0.012, 0], i * 3);
        continue;
      }
      const [a, b] = pairs[i % arcs];
      const t = r();
      const x = a + (b - a) * t;
      const h = Math.abs(b - a) * 0.42;
      const y = 0.55 - Math.sin(Math.PI * t) * h;
      f[4].set([x, y, Math.sin(Math.PI * t) * 0.15], i * 3);
    }
  }

  // 5 · stream: generated tokens flowing out (animated in the loop)
  for (let i = 0; i < n; i++) {
    const lane = i % 7;
    f[5].set([r() * 3.4 - 1.7, -0.1 + (lane - 3) * 0.06 + gauss(r) * 0.012, (lane - 3) * 0.05], i * 3);
  }

  return f;
}

export function createField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { alpha: true })!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 760;
  const N = small ? 760 : 1600;

  const forms = buildFormations(N);
  const cur = new Float32Array(forms[0]);
  const from = new Float32Array(forms[0]);
  const ox = new Float32Array(N);
  const oy = new Float32Array(N);
  const delay = new Float32Array(N).map((_, i) => hash(i) * 0.45);
  const size = new Float32Array(N).map((_, i) => 1.3 + hash(i + 9) * 1.9);
  const group = new Uint8Array(N).map((_, i) => i % 5);

  let w = 0,
    h = 0,
    dpr = 1;
  let target = 0;
  let morphStart = -1;
  const MORPH = 1700;
  let rot = ROTATE[0],
    tilt = TILT[0],
    shift = small ? 0 : SHIFT[0];
  let intensity = 1,
    intensityTarget = 1;
  let mx = -9999,
    my = -9999,
    px = 0,
    py = 0;
  let angle = 0;
  let last = performance.now();
  let running = true;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.75);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  addEventListener(
    'pointermove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    mx = my = -9999;
  });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  // soft bokeh sprites, one per hue, drawn for a few near particles
  const makeSprite = (c: string) => {
    const o = document.createElement('canvas');
    o.width = o.height = 48;
    const g = o.getContext('2d')!;
    const grd = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    grd.addColorStop(0, c);
    grd.addColorStop(0.25, c + '88');
    grd.addColorStop(1, c + '00');
    g.fillStyle = grd;
    g.fillRect(0, 0, 48, 48);
    return o;
  };
  let sprites = PALETTE.map(makeSprite);
  // additive glow reads as light on a dark ground; on paper it would wash out
  let blend: GlobalCompositeOperation = currentTheme() === 'light' ? 'source-over' : 'lighter';
  onThemeChange((theme) => {
    PALETTE = readPalette();
    sprites = PALETTE.map(makeSprite);
    blend = theme === 'light' ? 'source-over' : 'lighter';
  });
  const glowy = new Uint8Array(N).map((_, i) => (hash(i + 77) < 0.05 ? 1 : 0));

  // projected positions, reused each frame
  const sx = new Float32Array(N);
  const sy = new Float32Array(N);
  const sz = new Float32Array(N);

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(64, now - last);
    last = now;
    const k = 1 - Math.exp(-dt / 380);

    rot += (ROTATE[target] - rot) * k;
    tilt += (TILT[target] - tilt) * k;
    shift += ((small ? 0 : SHIFT[target]) - shift) * k;
    intensity += (intensityTarget - intensity) * k;
    if (!reduce) angle += dt * 0.00006 * rot;

    const nx = mx > -999 ? mx / w - 0.5 : 0;
    const ny = my > -999 ? my / h - 0.5 : 0;
    px += (nx - px) * k * 0.5;
    py += (ny - py) * k * 0.5;

    // morph progress
    const mt = morphStart < 0 ? 1 : Math.min(1, (now - morphStart) / MORPH);
    const to = forms[target];
    const flow = target === 5 ? now * 0.00012 : 0;

    const ay = angle + px * 0.5;
    const ax = tilt + py * 0.25;
    const cy = Math.cos(ay),
      sy_ = Math.sin(ay),
      cx = Math.cos(ax),
      sx_ = Math.sin(ax);
    const scale = Math.min(w, h * 1.5) * 0.42;
    const cam = 3.2;
    const t = now * 0.001;

    for (let i = 0; i < N; i++) {
      const j = i * 3;
      let local = reduce ? 1 : Math.min(1, Math.max(0, (mt - delay[i]) / 0.55));
      local = smooth(local);
      let tx = to[j],
        ty = to[j + 1];
      const tz = to[j + 2];
      if (flow) tx = ((((tx + 1.7 + flow * (1 + (i % 7) * 0.12)) % 3.4) + 3.4) % 3.4) - 1.7;
      if (!reduce) {
        ty += Math.sin(t * 0.7 + i) * 0.006;
        tx += Math.cos(t * 0.5 + i * 1.3) * 0.004;
      }
      const x = mt >= 1 ? tx : from[j] + (tx - from[j]) * local;
      const y = mt >= 1 ? ty : from[j + 1] + (ty - from[j + 1]) * local;
      const z = mt >= 1 ? tz : from[j + 2] + (tz - from[j + 2]) * local;
      cur[j] = x;
      cur[j + 1] = y;
      cur[j + 2] = z;

      // rotate Y then X
      const x1 = x * cy + z * sy_;
      const z1 = -x * sy_ + z * cy;
      const y1 = y * cx - z1 * sx_;
      const z2 = y * sx_ + z1 * cx;
      const p = cam / (cam + z2);
      let X = w / 2 + (x1 + shift) * scale * p;
      let Y = h / 2 + y1 * scale * p;

      // pointer repulsion, eased
      const dx = X - mx,
        dy = Y - my;
      const d2 = dx * dx + dy * dy;
      let tox = 0,
        toy = 0;
      if (d2 < 22000) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / 148) * 26;
        tox = (dx / d) * f;
        toy = (dy / d) * f;
      }
      ox[i] += (tox - ox[i]) * 0.12;
      oy[i] += (toy - oy[i]) * 0.12;
      sx[i] = X + ox[i];
      sy[i] = Y + oy[i];
      sz[i] = p;
    }

    ctx.clearRect(0, 0, w, h);
    // draw by colour and three depth buckets to keep state changes low
    for (let g = 0; g < 5; g++) {
      ctx.fillStyle = PALETTE[g];
      for (let b = 0; b < 3; b++) {
        ctx.globalAlpha = Math.min(1, (0.34 + b * 0.3) * intensity);
        for (let i = g; i < N; i += 5) {
          const p = sz[i];
          const bucket = p < 0.94 ? 0 : p < 1.04 ? 1 : 2;
          if (bucket !== b) continue;
          const s = size[i] * p * (target === 2 ? 1.15 : 1);
          ctx.fillRect(sx[i] - s / 2, sy[i] - s / 2, s, s);
        }
      }
    }
    // bokeh pass
    ctx.globalCompositeOperation = blend;
    for (let i = 0; i < N; i++) {
      if (!glowy[i]) continue;
      const p = sz[i];
      const r = 7 + size[i] * 6 * p;
      ctx.globalAlpha = 0.28 * intensity * Math.min(1.4, p);
      ctx.drawImage(sprites[group[i]], sx[i] - r, sy[i] - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    to(index: number, level = 1) {
      intensityTarget = level;
      if (index === target) return;
      from.set(cur);
      target = index;
      morphStart = performance.now();
    },
  };
}
