// Background formations for three sections, drawn by the particle field
// (field.ts): Experience's commit graph, Skills' stack and About's keyboard.
// Each scene moves its dots in field units and colours them from its own hues.

const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const ease01 = (v: number) => smooth(Math.max(0, Math.min(1, v)));

export type Scene = {
  n: number;
  /** positions in field units, x right, y down, z away; updated by step */
  pos: Float32Array;
  /** each dot's colour, an index into hues; scenes may change it as they run */
  col: Uint8Array;
  hues: string[];
  step(ms: number): void;
  /** half-extents (x, y) the drawing must fit */
  fit: [number, number];
  tilt: number;
  yaw: number;
  sway: number;
};

/* Experience: a git commit graph ---------------------------------------------
   The roles as branches off main, oldest first: web administrator at GCET,
   the Nebulogic internship, software engineer at Nebulogic, and the
   Northeastern TA role, still open because it is ongoing. Each branch forks
   from main, carries a few commits along its lane and merges back. Commits
   flow along every branch. */
type Lane = { from: number; to: number; y: number; z: number; open?: boolean };
const LANES: Lane[] = [
  { from: -1.3, to: -0.42, y: -0.32, z: 0.06 },
  { from: -0.62, to: 0.1, y: 0.3, z: -0.05 },
  { from: -0.12, to: 0.98, y: -0.34, z: 0.05 },
  { from: 0.7, to: 1.45, y: 0.32, z: -0.06, open: true },
];
const MAIN = { from: -1.45, to: 1.45 };
const RAMP = 0.22; // how far a branch travels to reach its lane
const RING = 14; // dots in a commit ring

function lanePoint(k: number, x: number, out: number[]) {
  const l = LANES[k];
  const a = ease01((x - l.from) / RAMP);
  const b = l.open ? 1 : ease01((l.to - x) / RAMP);
  out[0] = x;
  out[1] = l.y * a * b;
  out[2] = l.z * a * b;
}

export function graphScene(n: number): Scene {
  type Dot = { lane: number; ring: number; u: number }; // lane −1 = main; ring −1 = a flowing line dot
  const rings: { lane: number; x: number; head?: boolean }[] = [];
  LANES.forEach((l, k) => {
    const span = l.to - l.from;
    [0.38, 0.64].forEach((t) => rings.push({ lane: k, x: l.from + span * t }));
    if (l.open) rings.push({ lane: k, x: l.from + span * 0.9, head: true });
    rings.push({ lane: -1, x: l.from });
    if (!l.open) rings.push({ lane: -1, x: l.to });
  });
  // main takes a third of the dots, the branches share the rest
  const dots: Dot[] = [];
  const share = [-1, ...LANES.map((_, k) => k)].map((lane) => ({ lane, n: Math.floor(n * (lane < 0 ? 0.32 : 0.68 / LANES.length)) }));
  share[0].n += n - share.reduce((t, s) => t + s.n, 0);
  for (const { lane, n: count } of share) {
    const mine = rings.map((r, ri) => ({ ...r, ri })).filter((r) => r.lane === lane);
    let used = 0;
    for (const r of mine) for (let d = 0; d < RING; d++, used++) dots.push({ lane, ring: r.ri, u: d / RING });
    for (let j = 0; j < count - used; j++) dots.push({ lane, ring: -1, u: j / (count - used) });
  }
  const pos = new Float32Array(n * 3);
  // lane hues, oldest role first; main is ink
  const col = new Uint8Array(n).map((_, i) => (dots[i].lane < 0 ? 4 : dots[i].lane));
  const o = [0, 0, 0];
  const step = (ms: number) => {
    const t = ms * 0.001;
    for (let i = 0; i < n; i++) {
      const d = dots[i];
      if (d.ring >= 0) {
        const r = rings[d.ring];
        if (r.lane < 0) (o[0] = r.x), (o[1] = 0), (o[2] = 0);
        else lanePoint(r.lane, r.x, o);
        // commits breathe a little; the open branch's head commit pulses
        const rad = (r.head ? 0.045 : 0.034) * (1 + (r.head ? 0.22 : 0.06) * Math.sin(t * (r.head ? 3 : 1.4) + d.ring));
        const a = d.u * Math.PI * 2;
        pos[i * 3] = o[0] + Math.cos(a) * rad;
        pos[i * 3 + 1] = o[1] + Math.sin(a) * rad;
        pos[i * 3 + 2] = o[2];
        continue;
      }
      const u = (d.u + t * 0.035) % 1; // commits flow toward the merge
      if (d.lane < 0) (o[0] = MAIN.from + (MAIN.to - MAIN.from) * u), (o[1] = 0), (o[2] = 0);
      else lanePoint(d.lane, LANES[d.lane].from + (LANES[d.lane].to - LANES[d.lane].from) * u, o);
      pos.set(o, i * 3);
    }
  };
  step(0);
  return { n, pos, col, hues: ['--t3', '--t5', '--t1', '--t2', '--ink'], step, fit: [1.55, 0.6], tilt: 0.06, yaw: 0, sway: 0.08 };
}

/* Skills: the stack ----------------------------------------------------------
   Four layers, top to bottom: frontend, backend, data, infrastructure. Each
   is a square plate of dots; requests travel down through the layers and the
   responses come back up. */
export function stackScene(n: number): Scene {
  const LAYERS = 4;
  const S = 0.5; // half a plate's side
  const Y = (k: number) => -0.45 + k * 0.3;
  const COLUMNS: [number, number][] = [
    [-S / 3, -S / 3],
    [S / 3, S / 3],
    [S / 3, -S / 3],
    [-S / 3, S / 3],
    [0, 0],
  ];
  const packets = Math.floor(n * 0.16);
  const perPlate = Math.floor((n - packets) / LAYERS);
  const pos = new Float32Array(n * 3);
  const col = new Uint8Array(n);
  const trail = Math.max(4, Math.floor(packets / COLUMNS.length));
  let i = 0;
  for (let k = 0; k < LAYERS; k++) {
    // the plate's outline, then a grid inside it
    const edge = Math.floor(perPlate * 0.5);
    for (let d = 0; d < edge; d++, i++) {
      const t = (d / edge) * 4,
        side = Math.floor(t),
        f = t - side;
      const [u, v] = side === 0 ? [f, 0] : side === 1 ? [1, f] : side === 2 ? [1 - f, 1] : [0, 1 - f];
      pos.set([(u - 0.5) * 2 * S, Y(k), (v - 0.5) * 2 * S], i * 3);
      col[i] = k;
    }
    const grid = perPlate - edge;
    for (let d = 0; d < grid; d++, i++) {
      const line = d % 4,
        f = Math.floor(d / 4) / Math.ceil(grid / 4);
      const at = (line % 2 ? 1 : -1) * (S / 3);
      const along = (f - 0.5) * 2 * S;
      pos.set(line < 2 ? [at, Y(k), along] : [along, Y(k), at], i * 3);
      col[i] = k;
    }
  }
  const first = i;
  for (; i < n; i++) col[i] = 4;
  const step = (ms: number) => {
    const t = ms * 0.001;
    for (let j = first; j < n; j++) {
      const c = (j - first) % COLUMNS.length,
        d = Math.floor((j - first) / COLUMNS.length) % trail;
      // down then back up, each column a little out of step
      const u = (t * 0.22 + c * 0.19) % 1;
      const down = u < 0.5;
      const head = down ? u * 2 : 2 - u * 2;
      const y = Y(0) + (Y(LAYERS - 1) - Y(0)) * Math.max(0, Math.min(1, head - (down ? 1 : -1) * d * 0.018));
      pos.set([COLUMNS[c][0], y, COLUMNS[c][1]], j * 3);
    }
  };
  step(0);
  return { n, pos, col, hues: ['--t5', '--t1', '--t3', '--t2', '--ink'], step, fit: [0.78, 0.78], tilt: 0.62, yaw: Math.PI / 4, sway: 0.2 };
}

/* About: a keyboard that types ------------------------------------------------
   Three letter rows and a space bar, each key a dotted keycap. It types a few
   short phrases a key at a time; a pressed key dips and lights up. */
export function keysScene(onText?: (text: string) => void) {
  return (n: number): Scene => {
    const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    const U = 0.17; // key pitch
    const K = U * 0.82; // keycap size
    const STAGGER = [-0.12, 0.02, 0.3];
    type Key = { x: number; y: number; w: number; ch: string };
    const keys: Key[] = [];
    ROWS.forEach((row, r) =>
      [...row].forEach((ch, i) => keys.push({ x: (i - (row.length - 1) / 2 + STAGGER[r]) * U, y: -0.27 + r * U, w: K, ch })),
    );
    keys.push({ x: 0.03, y: -0.27 + 3 * U, w: U * 5.6, ch: ' ' });

    // dots per key, more for the long space bar
    const unit = Math.floor(n / (keys.length - 1 + 3));
    const owner = new Int16Array(n);
    const home = new Float32Array(n * 3);
    let i = 0;
    keys.forEach((k, ki) => {
      const count = k.ch === ' ' ? n - i : unit;
      for (let d = 0; d < count; d++, i++) {
        const t = (d / count) * 4,
          side = Math.floor(t),
          f = t - side;
        const [u, v] = side === 0 ? [f, 0] : side === 1 ? [1, f] : side === 2 ? [1 - f, 1] : [0, 1 - f];
        home.set([k.x + (u - 0.5) * k.w, k.y + (v - 0.5) * K, 0], i * 3);
        owner[i] = ki;
      }
    });
    const pos = new Float32Array(home);
    const col = new Uint8Array(n);
    const pressed = new Float32Array(keys.length).fill(-1e9);
    const keyOf = new Map(keys.map((k, ki) => [k.ch, ki]));

    const PHRASES = ['hello world', 'kalyan mudumby', 'lgtm ship it', 'cube solved'];
    let phrase = 0,
      at = 0,
      next = 0;
    const step = (ms: number) => {
      if (!next) next = ms + 600;
      if (ms >= next) {
        const text = PHRASES[phrase];
        if (at < text.length) {
          pressed[keyOf.get(text[at])!] = ms;
          at++;
          onText?.(text.slice(0, at));
          next = ms + 95 + hash(at + phrase * 31) * 110; // an uneven, human rhythm
        } else {
          phrase = (phrase + 1) % PHRASES.length;
          at = 0;
          next = ms + 1500;
          setTimeout(() => onText?.(''), 1100);
        }
      }
      for (let j = 0; j < n; j++) {
        const age = (ms - pressed[owner[j]]) / 1000;
        const p = age < 0.35 ? 1 - age / 0.35 : 0; // a press dips and fades back
        pos[j * 3 + 2] = home[j * 3 + 2] + 0.05 * p;
        col[j] = p > 0.15 ? 1 : 0;
      }
    };
    return { n, pos, col, hues: ['--ink-3', '--t3'], step, fit: [0.98, 0.3], tilt: 0.7, yaw: 0, sway: 0.12 };
  };
}

/* Explore: keyword search ----------------------------------------------------
   A grid of document dots with a magnifying lens drifting over it. Dots under
   the lens spread out, magnified, and light up as matches. */
export function searchScene(n: number): Scene {
  const LENS = 72; // dots in the lens ring
  const HANDLE = 30;
  const ROWS = 20;
  const cols = Math.max(8, Math.floor((n - LENS - HANDLE) / ROWS));
  const GAP = 0.05;
  const R = 0.26; // lens radius
  const grid = cols * ROWS;
  const home = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const g = i % grid; // leftovers double up on grid points, out of sight
    home.set([(g % cols - (cols - 1) / 2) * GAP, (Math.floor(g / cols) - (ROWS - 1) / 2) * GAP, 0], i * 3);
  }
  const pos = new Float32Array(home);
  const col = new Uint8Array(n);
  const ringStart = n - LENS - HANDLE;
  const step = (ms: number) => {
    const t = ms * 0.001;
    // the lens wanders across the documents on a slow figure-of-eight
    const cx = Math.sin(t * 0.45) * (cols * GAP * 0.36);
    const cy = Math.sin(t * 0.9) * (ROWS * GAP * 0.3);
    for (let i = 0; i < ringStart; i++) {
      const x = home[i * 3] - cx,
        y = home[i * 3 + 1] - cy;
      const d = Math.hypot(x, y);
      if (d < R) {
        // fisheye: pull the inside outward so it reads as magnified
        const m = Math.pow(d / R, 0.5) * R;
        const k = d > 1e-6 ? m / d : 0;
        pos[i * 3] = cx + x * k;
        pos[i * 3 + 1] = cy + y * k;
        pos[i * 3 + 2] = -0.04;
        col[i] = 1;
      } else {
        pos[i * 3] = home[i * 3];
        pos[i * 3 + 1] = home[i * 3 + 1];
        pos[i * 3 + 2] = 0;
        col[i] = 0;
      }
    }
    for (let j = 0; j < LENS; j++) {
      const a = (j / LENS) * Math.PI * 2;
      pos.set([cx + Math.cos(a) * R * 1.04, cy + Math.sin(a) * R * 1.04, -0.05], (ringStart + j) * 3);
      col[ringStart + j] = 2;
    }
    for (let j = 0; j < HANDLE; j++) {
      const s = R * 1.04 + (j / HANDLE) * 0.3;
      pos.set([cx + s * Math.SQRT1_2, cy + s * Math.SQRT1_2, -0.05], (ringStart + LENS + j) * 3);
      col[ringStart + LENS + j] = 2;
    }
  };
  step(0);
  return { n, pos, col, hues: ['--ink-3', '--t2', '--t3'], step, fit: [cols * GAP * 0.62, ROWS * GAP * 0.62], tilt: 0.42, yaw: -0.12, sway: 0.1 };
}

/* Contact: a letter ------------------------------------------------------------
   An envelope whose flap swings open and a letter rises out, then tucks back
   in and closes. */
export function mailScene(n: number): Scene {
  const W = 1.0,
    H = 0.62;
  const top = -H / 2;
  const pos = new Float32Array(n * 3);
  const col = new Uint8Array(n);
  type Part = 'body' | 'fold' | 'flap' | 'letter' | 'lines';
  const kind: Part[] = [];
  const base: number[][] = [];
  const along = (pts: number[][], m: number) => {
    // m dots evenly along a polyline
    const segs = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
    const total = segs.reduce((s, v) => s + v, 0);
    const out: number[][] = [];
    for (let d = 0; d < m; d++) {
      let u = (d / m) * total,
        k = 0;
      while (k < segs.length - 1 && u > segs[k]) u -= segs[k++];
      const f = u / segs[k];
      out.push([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]);
    }
    return out;
  };
  const add = (p: Part, pts: number[][], m: number, z = 0) => along(pts, m).forEach((q) => (kind.push(p), base.push([q[0], q[1], z])));
  const L = { w: W * 0.82, h: H * 0.78 };
  const share = (f: number) => Math.floor(n * f);
  add('body', [[-W / 2, top], [W / 2, top], [W / 2, -top], [-W / 2, -top], [-W / 2, top]], share(0.3));
  add('fold', [[-W / 2, -top], [0, 0.04], [W / 2, -top]], share(0.12));
  add('flap', [[-W / 2, top], [0, 0.06], [W / 2, top]], share(0.16));
  add('letter', [[-L.w / 2, top], [-L.w / 2, top + L.h], [L.w / 2, top + L.h], [L.w / 2, top], [-L.w / 2, top]], share(0.24), 0.02);
  const lines = n - kind.length;
  for (let r = 0; r < 4; r++) {
    const y = top + 0.1 + r * 0.09;
    add('lines', [[-L.w / 2 + 0.08, y], [L.w / 2 - (r === 3 ? 0.3 : 0.08), y]], Math.floor(lines / 4) + (r < lines % 4 ? 1 : 0), 0.02);
  }
  const HUE: Record<Part, number> = { body: 0, fold: 1, flap: 2, letter: 3, lines: 1 };
  const T = 6.4; // seconds a loop
  const phase = (t: number, a: number, b: number) => ease01((t - a) / (b - a));
  const step = (ms: number) => {
    const t = (ms * 0.001) % T;
    const open = phase(t, 0.9, 1.8) - phase(t, 5.4, 6.2); // flap angle 0..1
    const rise = phase(t, 1.7, 2.8) - phase(t, 4.4, 5.4); // letter 0..1
    const ang = open * Math.PI * 0.86;
    for (let i = 0; i < n; i++) {
      const [x, y, z] = base[i];
      const p = kind[i];
      let X = x,
        Y = y,
        Z = z;
      if (p === 'flap') {
        // swing up and back about the envelope's top edge
        const yr = y - top;
        Y = top + yr * Math.cos(ang);
        Z = -yr * Math.sin(ang);
      } else if (p === 'letter' || p === 'lines') {
        Y = y - rise * 0.5;
      }
      pos[i * 3] = X;
      pos[i * 3 + 1] = Y;
      pos[i * 3 + 2] = Z;
      // the letter shows only where it has risen above the envelope
      col[i] = (p === 'letter' || p === 'lines') && Y > top ? 4 : HUE[p];
    }
  };
  step(0);
  return { n, pos, col, hues: ['--ink', '--ink-3', '--t3', '--t2', 'rgba(0, 0, 0, 0)'], step, fit: [0.62, 0.62], tilt: 0.25, yaw: -0.22, sway: 0.12 };
}

/* More to explore: an orrery --------------------------------------------------
   A small sun with dotted orbits and planets circling at their own pace, the
   outer ones slower; one wears a ring. Side projects as worlds to explore. */
export function orbitScene(n: number): Scene {
  const ORBITS = [0.24, 0.36, 0.5, 0.64, 0.8, 0.95];
  const SUN = Math.floor(n * 0.1);
  const PLANET = 28; // dots per planet
  const RINGED = 3; // the orbit whose planet has a ring
  const RING = 40;
  const planets = ORBITS.length * PLANET + RING;
  const perOrbit = Math.floor((n - SUN - planets) / ORBITS.length);
  const pos = new Float32Array(n * 3);
  const col = new Uint8Array(n);
  // even points on a sphere (Fibonacci), for the sun and the planets
  const sphere = (k: number, m: number, r: number) => {
    const y = 1 - (2 * (k + 0.5)) / m;
    const s = Math.sqrt(1 - y * y);
    const a = k * 2.39996;
    return [Math.cos(a) * s * r, y * r, Math.sin(a) * s * r];
  };
  const PLANET_HUE = [2, 3, 4, 5, 2, 3]; // lilac, mint, coral, sky…
  const speed = ORBITS.map((r) => 0.55 / Math.pow(r / ORBITS[0], 1.5)); // outer worlds move slower
  const start = ORBITS.map((_, k) => hash(k + 11) * Math.PI * 2);
  const radius = ORBITS.map((_, k) => 0.026 + hash(k + 5) * 0.022);
  let i = 0;
  const sunAt = i;
  i += SUN;
  const orbitAt = i;
  i += perOrbit * ORBITS.length;
  const planetAt = i;
  // the orbits never move, so set them once; the leftovers sit on the last one
  for (let k = 0; k < ORBITS.length; k++)
    for (let d = 0; d < perOrbit; d++) {
      const a = (d / perOrbit) * Math.PI * 2;
      pos.set([Math.cos(a) * ORBITS[k], 0, Math.sin(a) * ORBITS[k]], (orbitAt + k * perOrbit + d) * 3);
    }
  for (let j = planetAt + planets; j < n; j++) pos.set([ORBITS[5], 0, 0], j * 3);
  for (let j = sunAt; j < sunAt + SUN; j++) col[j] = 1;
  for (let k = 0; k < ORBITS.length; k++) for (let d = 0; d < PLANET; d++) col[planetAt + k * PLANET + d] = PLANET_HUE[k];
  for (let d = 0; d < RING; d++) col[planetAt + ORBITS.length * PLANET + d] = 1;

  const step = (ms: number) => {
    const t = ms * 0.001;
    // the sun turns slowly
    for (let d = 0; d < SUN; d++) {
      const [x, y, z] = sphere(d, SUN, 0.085);
      const a = t * 0.3;
      pos.set([x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a)], (sunAt + d) * 3);
    }
    for (let k = 0; k < ORBITS.length; k++) {
      const a = start[k] + t * speed[k];
      const cx = Math.cos(a) * ORBITS[k],
        cz = Math.sin(a) * ORBITS[k];
      for (let d = 0; d < PLANET; d++) {
        const [x, y, z] = sphere(d, PLANET, radius[k]);
        pos.set([cx + x, y, cz + z], (planetAt + k * PLANET + d) * 3);
      }
      if (k === RINGED) {
        // a tilted ring around this one
        for (let d = 0; d < RING; d++) {
          const b = (d / RING) * Math.PI * 2;
          const rx = Math.cos(b) * radius[k] * 2.3,
            rz = Math.sin(b) * radius[k] * 2.3;
          pos.set([cx + rx, rz * 0.9, cz + rz * 0.45], (planetAt + ORBITS.length * PLANET + d) * 3);
        }
      }
    }
  };
  step(0);
  return { n, pos, col, hues: ['--ink-3', '--t3', '--t1', '--t2', '--t4', '--t5'], step, fit: [1, 0.6], tilt: 0.42, yaw: 0, sway: 0.12 };
}
