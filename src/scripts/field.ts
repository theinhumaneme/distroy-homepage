// The background field: one particle system that re-forms for each chapter.
// 0 Rubik's cube → 1 token sequence → 2 embedding matrix → 3 vector
// clusters → 4 attention arcs → 5 output stream.
// The cube is live: it plays a random scramble, then its exact inverse to
// solve, turning one layer at a time (see Cube below).

import { cssVar, currentTheme, onThemeChange } from './theme';

type Formation = Float32Array;

// the five token hues plus ink, read from the theme so light mode gets its
// deeper set; six colours so the cube has six faces
const readPalette = () => ['--t1', '--t2', '--t3', '--t4', '--t5', '--ink'].map((t) => cssVar(t));
const COLORS = 6;
let PALETTE = readPalette();
const ROTATE = [0.9, 0, 0.12, 1, 0.08, 0]; // how much each formation spins
const TILT = [0.5, 0, 0.55, 0.22, 0, 0];
// offset per formation (in field units) so shapes frame the copy; the cube
// sits up beside the name, clear of the hero's lower copy
const SHIFT = [0.7, 0, 0, 0.1, 0, 0];
const LIFT = [-0.22, 0, 0, 0, 0, 0];

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

/* Rubik's cube ----------------------------------------------------------------
   Coordinates: x right, y down, z away from the viewer (right-handed, as the
   projection draws it). Faces: R +x, L −x, D +y, U −y, B +z, F −z. */
const HALF = 0.3; // half the cube's edge, in field units
const CELL = (HALF * 2) / 3;
const FACES = [
  { axis: 0, sign: 1, name: 'R' },
  { axis: 0, sign: -1, name: 'L' },
  { axis: 1, sign: 1, name: 'D' },
  { axis: 1, sign: -1, name: 'U' },
  { axis: 2, sign: 1, name: 'B' },
  { axis: 2, sign: -1, name: 'F' },
];

/** Dots per sticker edge for a field of n particles. */
const cubeSide = (n: number) => Math.max(2, Math.floor(Math.floor(n / COLORS / 9) / 4));

function cubeHome(out: Float32Array, n: number) {
  // Each sticker is a square of evenly spaced dots, one on every corner, so
  // edges read straight.
  const per = cubeSide(n);
  const side = CELL * 0.8;
  for (let i = 0; i < n; i++) {
    const face = FACES[i % COLORS];
    const slot = Math.floor(i / COLORS);
    const sticker = slot % 9;
    let d = Math.floor(slot / 9);
    if (d >= per * 4) d = 0; // leftovers sit on a corner dot, out of sight
    const su = (sticker % 3) - 1;
    const sv = Math.floor(sticker / 3) - 1;
    const edge = Math.floor(d / per),
      f = (d % per) / per;
    const [pu, pv] = edge === 0 ? [f, 0] : edge === 1 ? [1, f] : edge === 2 ? [1 - f, 1] : [0, 1 - f];
    const p = [0, 0, 0];
    const [a, b] = [(face.axis + 1) % 3, (face.axis + 2) % 3];
    p[face.axis] = face.sign * HALF;
    p[a] = su * CELL + (pu - 0.5) * side;
    p[b] = sv * CELL + (pv - 0.5) * side;
    out.set(p, i * 3);
  }
}

type Move = { axis: number; sign: number; dir: number }; // dir: +1 clockwise, −1 prime
const notation = (m: Move) => FACES.find((f) => f.axis === m.axis && f.sign === m.sign)!.name + (m.dir < 0 ? '′' : '');

/** Rotate (x, y, z) about the axis by angle, right-handed. */
function turn(axis: number, ang: number, x: number, y: number, z: number, out: number[]) {
  const c = Math.cos(ang),
    s = Math.sin(ang);
  if (axis === 0) (out[0] = x), (out[1] = y * c - z * s), (out[2] = y * s + z * c);
  else if (axis === 1) (out[0] = z * s + x * c), (out[1] = y), (out[2] = z * c - x * s);
  else (out[0] = x * c - y * s), (out[1] = x * s + y * c), (out[2] = z);
}

export type CubeEvent = { move: string; phase: 'scramble' | 'solve' | 'solved'; step: number; of: number };

/** The cube's state: particle positions after completed moves, plus the turn in progress. */
class Cube {
  pos: Float32Array;
  now: Float32Array;
  private seq: Move[] = [];
  private idx = 0;
  private t0 = -1;
  private hold = 0;
  private tmp = [0, 0, 0];
  static TURN = 420;
  static GAP = 120;
  constructor(
    home: Float32Array,
    private onMove?: (e: CubeEvent) => void,
  ) {
    this.pos = new Float32Array(home);
    this.now = new Float32Array(home);
  }
  private scramble() {
    const moves: Move[] = [];
    while (moves.length < 9) {
      const f = FACES[Math.floor(Math.random() * 6)];
      const prev = moves[moves.length - 1];
      if (prev && prev.axis === f.axis) continue; // no back-to-back turns on one axis
      moves.push({ axis: f.axis, sign: f.sign, dir: Math.random() < 0.5 ? 1 : -1 });
    }
    const solve = moves
      .slice()
      .reverse()
      .map((m) => ({ ...m, dir: -m.dir }));
    this.seq = [...moves, ...solve];
    this.idx = 0;
  }
  /** Advance to `ms`; writes the animated positions to `now`. */
  step(ms: number) {
    if (this.t0 < 0) {
      this.t0 = ms + 1600; // a beat to read the solved cube first
      this.scramble();
      this.onMove?.({ move: '', phase: 'solved', step: 0, of: 9 });
    }
    if (ms < this.t0) {
      this.now.set(this.pos);
      return;
    }
    const m = this.seq[this.idx];
    const t = Math.min(1, (ms - this.t0) / Cube.TURN);
    if (t === 0 || this.hold !== this.idx + 1) {
      this.hold = this.idx + 1;
      const half = this.seq.length / 2;
      const solving = this.idx >= half;
      this.onMove?.({ move: notation(m), phase: solving ? 'solve' : 'scramble', step: (this.idx % half) + 1, of: half });
    }
    // clockwise seen from outside the face: −90° about its outward normal
    const full = (-Math.PI / 2) * m.sign * m.dir;
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const ang = full * e;
    const P = this.pos,
      N = this.now,
      o = this.tmp;
    for (let i = 0; i < P.length; i += 3) {
      const layer = Math.max(-1, Math.min(1, Math.round(P[i + m.axis] / CELL)));
      if (layer !== m.sign) {
        N[i] = P[i];
        N[i + 1] = P[i + 1];
        N[i + 2] = P[i + 2];
        continue;
      }
      turn(m.axis, ang, P[i], P[i + 1], P[i + 2], o);
      N[i] = o[0];
      N[i + 1] = o[1];
      N[i + 2] = o[2];
    }
    if (t >= 1) {
      // commit the quarter turn exactly, so the grid never drifts
      for (let i = 0; i < P.length; i += 3) {
        const layer = Math.max(-1, Math.min(1, Math.round(P[i + m.axis] / CELL)));
        if (layer !== m.sign) continue;
        turn(m.axis, full, P[i], P[i + 1], P[i + 2], o);
        P[i] = Math.round(o[0] * 1e5) / 1e5;
        P[i + 1] = Math.round(o[1] * 1e5) / 1e5;
        P[i + 2] = Math.round(o[2] * 1e5) / 1e5;
      }
      this.idx++;
      this.t0 = ms + Cube.GAP;
      if (this.idx === this.seq.length / 2) this.t0 = ms + 700; // scrambled: pause, then solve
      if (this.idx >= this.seq.length) {
        this.t0 = -1; // solved: hold, then a fresh scramble
        this.onMove?.({ move: '', phase: 'solved', step: 9, of: 9 });
        this.t0 = ms + 2200;
        this.scramble();
      }
    }
  }
}

function buildFormations(n: number): Formation[] {
  const r = mulberry(1337);
  const f: Formation[] = Array.from({ length: 6 }, () => new Float32Array(n * 3));

  // 0 · cube: a solved 3×3×3, each particle a dot on one sticker. Particle i
  // carries colour i % 6, so face f gets the particles of colour f.
  cubeHome(f[0], n);

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

export function createField(canvas: HTMLCanvasElement, opts: { onCube?: (e: CubeEvent) => void } = {}) {
  const ctx = canvas.getContext('2d', { alpha: true })!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 760;
  const N = small ? 900 : 2200;

  const forms = buildFormations(N);
  const cube = new Cube(forms[0], opts.onCube);
  const cur = new Float32Array(forms[0]);
  const from = new Float32Array(forms[0]);
  const ox = new Float32Array(N);
  const oy = new Float32Array(N);
  const delay = new Float32Array(N).map((_, i) => hash(i) * 0.45);
  const size = new Float32Array(N).map((_, i) => 1.3 + hash(i + 9) * 1.9);
  const group = new Uint8Array(N).map((_, i) => i % COLORS);

  let w = 0,
    h = 0,
    dpr = 1;
  let target = 0;
  let morphStart = -1;
  const MORPH = 1700;
  let rot = ROTATE[0],
    tilt = TILT[0],
    shift = small ? 0 : SHIFT[0],
    lift = LIFT[0];
  let intensity = 1,
    intensityTarget = 1;
  let mx = -9999,
    my = -9999,
    px = 0,
    py = 0;
  let angle = 0;
  // The cube never spins round: it holds a three-quarter view (a corner toward
  // the viewer, three faces showing) and sways a little either side of it.
  let yaw = Math.PI / 4;
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
  // 1 when a cube sticker faces away from the viewer: drawn faintly, so the
  // three near faces read as solid colour rather than mixing with the far ones
  const back = new Uint8Array(N);

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(64, now - last);
    last = now;
    const k = 1 - Math.exp(-dt / 380);

    rot += (ROTATE[target] - rot) * k;
    tilt += (TILT[target] - tilt) * k;
    shift += ((small ? 0 : SHIFT[target]) - shift) * k;
    lift += (LIFT[target] - lift) * k;
    intensity += (intensityTarget - intensity) * k;
    if (!reduce) angle += dt * 0.00006 * rot;

    const nx = mx > -999 ? mx / w - 0.5 : 0;
    const ny = my > -999 ? my / h - 0.5 : 0;
    px += (nx - px) * k * 0.5;
    py += (ny - py) * k * 0.5;

    // morph progress
    const mt = morphStart < 0 ? 1 : Math.min(1, (now - morphStart) / MORPH);
    // the cube turns only while it is the formation on show
    if (target === 0 && !reduce) cube.step(now);
    const to = target === 0 ? cube.now : forms[target];
    const flow = target === 5 ? now * 0.00012 : 0;

    const want = target === 0 ? Math.PI / 4 + (reduce ? 0 : Math.sin(now * 0.00022) * 0.28) : angle;
    yaw += (want - yaw) * k;
    const ay = yaw + px * 0.5;
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
      // a gentle drift keeps the field alive; smaller on the cube so its
      // sticker edges still read straight
      if (!reduce) {
        const amp = target === 0 ? 0.35 : 1;
        ty += Math.sin(t * 0.7 + i) * 0.006 * amp;
        tx += Math.cos(t * 0.5 + i * 1.3) * 0.004 * amp;
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
      let Y = h / 2 + (y1 + lift) * scale * p;

      // pointer repulsion, eased
      const dx = X - mx,
        dy = Y - my;
      const d2 = dx * dx + dy * dy;
      let tox = 0,
        toy = 0;
      if (d2 < 22000) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / 148) * (target === 0 ? 18 : 26);
        tox = (dx / d) * f;
        toy = (dy / d) * f;
      }
      ox[i] += (tox - ox[i]) * 0.12;
      oy[i] += (toy - oy[i]) * 0.12;
      sx[i] = X + ox[i];
      sy[i] = Y + oy[i];
      sz[i] = p;
      if (target === 0) {
        // outward normal = the axis this dot sits furthest along
        const axx = Math.abs(x),
          axy = Math.abs(y),
          axz = Math.abs(z);
        const nx = axx >= axy && axx >= axz ? Math.sign(x) : 0;
        const ny = !nx && axy >= axz ? Math.sign(y) : 0;
        const nz = !nx && !ny ? Math.sign(z) : 0;
        const nz1 = -nx * sy_ + nz * cy;
        back[i] = ny * sx_ + nz1 * cx > 0 ? 1 : 0;
      } else back[i] = 0;
    }

    ctx.clearRect(0, 0, w, h);
    // draw by colour and three depth buckets to keep state changes low
    for (let g = 0; g < COLORS; g++) {
      ctx.fillStyle = PALETTE[g];
      for (let b = 0; b < 3; b++) {
        // the cube's near faces draw at full strength so their colours read
        ctx.globalAlpha = Math.min(1, (target === 0 ? 0.95 : 0.34 + b * 0.3) * intensity);
        for (let i = g; i < N; i += COLORS) {
          if (back[i]) continue;
          const p = sz[i];
          const bucket = p < 0.94 ? 0 : p < 1.04 ? 1 : 2;
          if (bucket !== b) continue;
          // the cube keeps the field's varied dots, in a narrower range so edges read even
          const s = target === 0 ? (2.2 + (size[i] - 1.3) * 0.65) * p : size[i] * p * (target === 2 ? 1.15 : 1);
          ctx.fillRect(sx[i] - s / 2, sy[i] - s / 2, s, s);
        }
      }
      // the far faces show faintly through on a dark ground, for depth; on
      // paper they read as noise
      if (target === 0 && blend === 'lighter') {
        ctx.globalAlpha = 0.12 * intensity;
        for (let i = g; i < N; i += COLORS) {
          if (!back[i]) continue;
          const s = 1.4 * sz[i];
          ctx.fillRect(sx[i] - s / 2, sy[i] - s / 2, s, s);
        }
      }
    }
    // bokeh pass, softer on the cube so the glow doesn't swallow its stickers
    ctx.globalCompositeOperation = blend;
    for (let i = 0; i < N; i++) {
      if (!glowy[i] || (target === 0 && (back[i] || blend !== 'lighter'))) continue;
      const p = sz[i];
      const r = 7 + size[i] * 6 * p;
      ctx.globalAlpha = 0.28 * intensity * Math.min(1.4, p) * (target === 0 ? 0.55 : 1);
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
