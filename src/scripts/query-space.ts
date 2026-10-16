// "Query my work": a real retrieval engine over this page's content.
// TF-IDF vectors are built at compile time; the query is embedded here with
// the same analyser and ranked by cosine similarity. No network calls.
import { terms, SYNONYMS } from '../lib/text';
import { cssVar, onThemeChange } from './theme';

type Index = {
  vocab: string[];
  idf: number[];
  docs: { id: string; title: string; cluster: string; anchor: string; pos: number[] }[];
  chunks: { doc: number; text: string; era?: string; v: [number, number][]; pos: number[] }[];
};
export type Hit = { chunk: number; score: number };
/** Vocabulary ids in the analysed query; `true` = typed (or a prefix of it), `false` = a related term. */
export type QueryTerms = Map<number, boolean>;
export type Result = { hits: Hit[]; terms: QueryTerms };

// cluster hues and inks come from the theme tokens, re-read when it changes
const CLUSTER_TOKEN: Record<string, string> = { ai: '--t1', systems: '--t5', product: '--t3', teaching: '--t2', academic: '--t4' };
const CLUSTER_COLOR: Record<string, string> = {};
const INK = { ink: '', ink2: '', accent: '' };
const readColors = () => {
  for (const [k, t] of Object.entries(CLUSTER_TOKEN)) CLUSTER_COLOR[k] = cssVar(t);
  INK.ink = cssVar('--ink');
  INK.ink2 = cssVar('--ink-2');
  INK.accent = cssVar('--t2');
};

export function createEngine(index: Index) {
  const vocab = new Map(index.vocab.map((w, i) => [w, i]));
  const vecs = index.chunks.map((c) => new Map(c.v));

  const add = (q: Map<number, number>, kind: QueryTerms, w: string, weight: number, direct: boolean) => {
    const put = (id: number, x: number) => {
      q.set(id, Math.max(q.get(id) ?? 0, x));
      kind.set(id, kind.get(id) || direct);
    };
    const id = vocab.get(w);
    if (id !== undefined) put(id, weight);
    else if (w.length >= 3)
      // prefix match lets "quantiz" find "quantized", "kube" find "kubernetes"
      for (const [term, tid] of vocab) if (term.startsWith(w)) put(tid, weight * 0.8);
  };

  return {
    /** Every passage above the noise floor, best first. */
    search(text: string): Result {
      const q = new Map<number, number>();
      const kind: QueryTerms = new Map();
      for (const t of terms(text)) {
        add(q, kind, t, 1, true);
        for (const s of SYNONYMS[t] ?? []) add(q, kind, s, 0.45, false);
      }
      if (!q.size) return { hits: [], terms: kind };
      let n = 0;
      for (const [id, w] of q) {
        const x = w * index.idf[id];
        q.set(id, x);
        n += x * x;
      }
      n = Math.sqrt(n);
      const hits: Hit[] = vecs.map((v, chunk) => {
        let s = 0;
        for (const [id, x] of q) s += x * (v.get(id) ?? 0);
        return { chunk, score: s / n };
      });
      return { hits: hits.filter((h) => h.score > 0.02).sort((a, b) => b.score - a.score), terms: kind };
    },
  };
}

export function createSpace(canvas: HTMLCanvasElement, index: Index, opts: { queryLabel: string }) {
  const ctx = canvas.getContext('2d')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nC = index.chunks.length;
  const nD = index.docs.length;
  let w = 0,
    h = 0,
    dpr = 1;
  let rotY = -0.35,
    rotX = 0.18;
  const vel = reduce ? 0 : 0.0016;
  let dragging = false,
    moved = 0,
    lastX = 0,
    lastY = 0;
  let hits: Hit[] = [];
  let hitMap = new Map<number, number>();
  let litDocs = new Set<number>();
  let qPos: number[] | null = null;
  let qAlpha = 0;
  let hover = -1;
  let focusDoc = -1;
  const focusAlpha = new Float32Array(nD);
  let visible = false;
  let running = false;
  let onHover: ((i: number, x: number, y: number) => void) | null = null;
  let onPick: ((doc: number) => void) | null = null;

  // projected positions, reused every frame: x, y, perspective scale
  const P = new Float32Array(nC * 3);
  const D = new Float32Array(nD * 3);
  const order = Array.from({ length: nC }, (_, i) => i);
  const docOrder = Array.from({ length: nD }, (_, i) => i);
  const q3 = new Float32Array(3);

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    kick();
  };

  const proj = (p: number[], out: Float32Array, o: number) => {
    const cy = Math.cos(rotY),
      sy = Math.sin(rotY),
      cx = Math.cos(rotX),
      sx = Math.sin(rotX);
    const x1 = p[0] * cy + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cy;
    const y1 = p[1] * cx - z1 * sx;
    const z2 = p[1] * sx + z1 * cx;
    const s = 3 / (3 + z2);
    const scale = Math.min(w, h) * 0.4;
    out[o] = w / 2 + x1 * scale * s;
    out[o + 1] = h / 2 + y1 * scale * s;
    out[o + 2] = s;
  };
  const project = () => {
    for (let i = 0; i < nC; i++) proj(index.chunks[i].pos, P, i * 3);
    for (let i = 0; i < nD; i++) proj(index.docs[i].pos, D, i * 3);
  };

  const nearest = (mx: number, my: number) => {
    let best = -1,
      bd = 180;
    for (let i = 0; i < nC; i++) {
      const d = (P[i * 3] - mx) ** 2 + (P[i * 3 + 1] - my) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  };
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    // a press that barely moved is a click: open the passage's project
    if (moved < 6) {
      const [mx, my] = local(e);
      const i = nearest(mx, my);
      if (i >= 0) onPick?.(index.chunks[i].doc);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    const [mx, my] = local(e);
    if (dragging) {
      moved += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
      rotY += (e.clientX - lastX) * 0.006;
      rotX = Math.max(-0.9, Math.min(0.9, rotX + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
      kick();
      return;
    }
    if (e.pointerType !== 'mouse') return;
    const best = nearest(mx, my);
    if (best !== hover) kick();
    hover = best;
    canvas.style.cursor = best >= 0 ? 'pointer' : '';
    onHover?.(best, mx, my);
  });
  canvas.addEventListener('pointerleave', () => {
    hover = -1;
    canvas.style.cursor = '';
    onHover?.(-1, 0, 0);
    kick();
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  }).observe(canvas);
  document.addEventListener('visibilitychange', kick);

  // with reduced motion the map only redraws when something changes
  readColors();
  onThemeChange(() => {
    readColors();
    if (!running) requestAnimationFrame(draw);
  });

  function kick() {
    if (running || !visible || document.hidden) return;
    running = true;
    requestAnimationFrame(frame);
  }

  let t0 = performance.now();
  function frame(now: number) {
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    const dt = Math.min(50, now - t0);
    t0 = now;
    if (!dragging) rotY += vel * dt * 0.06;
    const ease = reduce ? 1 : 0.1;
    qAlpha += ((qPos ? 1 : 0) - qAlpha) * ease;
    let settling = Math.abs((qPos ? 1 : 0) - qAlpha) > 0.01;
    for (let d = 0; d < nD; d++) {
      const target = d === focusDoc ? 1 : 0;
      focusAlpha[d] += (target - focusAlpha[d]) * ease;
      if (Math.abs(target - focusAlpha[d]) > 0.01) settling = true;
    }
    project();
    draw(now);
    if (vel > 0 || dragging || settling) requestAnimationFrame(frame);
    else running = false;
  }

  function draw(now: number) {
    ctx.clearRect(0, 0, w, h);
    const anyHit = hits.length > 0;
    const anyFocus = focusDoc >= 0;

    // constellation lines doc → chunk
    ctx.lineWidth = 1;
    for (let i = 0; i < nC; i++) {
      const doc = index.chunks[i].doc;
      const lit = hitMap.has(i);
      ctx.strokeStyle = CLUSTER_COLOR[index.docs[doc].cluster];
      let a = anyHit ? (lit ? 0.5 : 0.05) : 0.16;
      if (anyFocus) a = a * (1 - 0.6 * (1 - focusAlpha[doc])) + 0.5 * focusAlpha[doc];
      ctx.globalAlpha = a * Math.min(D[doc * 3 + 2], 1.2);
      ctx.beginPath();
      ctx.moveTo(D[doc * 3], D[doc * 3 + 1]);
      ctx.lineTo(P[i * 3], P[i * 3 + 1]);
      ctx.stroke();
    }

    // retrieval lines from the query
    if (qPos && qAlpha > 0.01) {
      proj(qPos, q3, 0);
      const top = hits[0]?.score || 1;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = reduce ? 0 : -now * 0.03;
      for (const hh of hits) {
        const doc = index.chunks[hh.chunk].doc;
        const dim = anyFocus ? 0.35 + 0.65 * focusAlpha[doc] : 1;
        ctx.strokeStyle = INK.ink;
        ctx.globalAlpha = qAlpha * (0.25 + 0.65 * (hh.score / top)) * dim;
        ctx.lineWidth = 0.6 + 1.6 * (hh.score / top);
        ctx.beginPath();
        ctx.moveTo(q3[0], q3[1]);
        ctx.lineTo(P[hh.chunk * 3], P[hh.chunk * 3 + 1]);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = qAlpha;
      const pulse = reduce ? 1 : 1 + Math.sin(now * 0.004) * 0.15;
      ctx.strokeStyle = INK.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(q3[0], q3[1], 9 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = INK.accent;
      ctx.beginPath();
      ctx.arc(q3[0], q3[1], 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '500 11px "Geist Mono Variable", ui-monospace, monospace';
      ctx.fillText(opts.queryLabel, q3[0] + 14, q3[1] + 4);
    }

    // chunk points, far to near
    order.sort((a, b) => P[a * 3 + 2] - P[b * 3 + 2]);
    for (const i of order) {
      const x = P[i * 3],
        y = P[i * 3 + 1],
        s = P[i * 3 + 2];
      const doc = index.chunks[i].doc;
      const col = CLUSTER_COLOR[index.docs[doc].cluster];
      const lit = hitMap.has(i);
      const f = focusAlpha[doc];
      const r = (lit ? 4.2 : 2.4) * s + (i === hover ? 2 : 0) + f * 1.6;
      let a = anyHit ? (lit ? 1 : 0.22) : 0.85;
      if (anyFocus) a = Math.max(a * (0.45 + 0.55 * f), f);
      if (lit || f > 0.05) {
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.18 * Math.max(lit ? 1 : 0, f) * a;
        ctx.beginPath();
        ctx.arc(x, y, r * (3.2 + f), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // document labels: focused first, then retrieved, then nearest; skip any that
    // collide. While a query is active only retrieved projects are labelled.
    ctx.font = '450 11.5px "Geist Mono Variable", ui-monospace, monospace';
    const placed: number[] = [];
    // keep project labels clear of the query node and its label
    if (qPos && qAlpha > 0.5) placed.push(q3[0] - 12, q3[1] - 14, q3[0] + 18 + ctx.measureText(opts.queryLabel).width, q3[1] + 12);
    docOrder.sort(
      (a, b) =>
        Number(b === focusDoc) - Number(a === focusDoc) ||
        Number(litDocs.has(b)) - Number(litDocs.has(a)) ||
        D[b * 3 + 2] - D[a * 3 + 2],
    );
    for (const di of docOrder) {
      const lit = litDocs.has(di);
      if (anyHit && !lit && di !== focusDoc) continue;
      const x = D[di * 3],
        y = D[di * 3 + 1],
        s = D[di * 3 + 2];
      const label = index.docs[di].title;
      const bw = ctx.measureText(label).width;
      // flip labels that would run off the right edge
      const lx = x + 8 + bw > w - 8 ? x - 8 - bw : x + 8;
      const b0 = lx,
        b1 = y - 20,
        b2 = lx + bw + 4,
        b3 = y - 4;
      let hit = false;
      for (let k = 0; k < placed.length; k += 4)
        if (b0 < placed[k + 2] && b2 > placed[k] && b1 < placed[k + 3] && b3 > placed[k + 1]) {
          hit = true;
          break;
        }
      if (hit) continue;
      placed.push(b0, b1, b2, b3);
      const f = focusAlpha[di];
      ctx.globalAlpha = anyFocus ? 0.45 + 0.55 * f : anyHit ? 1 : Math.min(1, 0.5 + (s - 0.8));
      ctx.fillStyle = lit || f > 0.5 ? INK.ink : INK.ink2;
      ctx.fillText(label, lx, y - 8);
    }
    ctx.globalAlpha = 1;
  }

  return {
    setHits(next: Hit[]) {
      hits = next;
      hitMap = new Map(next.map((hh) => [hh.chunk, hh.score]));
      litDocs = new Set(next.map((hh) => index.chunks[hh.chunk].doc));
      if (!next.length) qPos = null;
      else {
        // the query sits at the score-weighted centroid of what it retrieved
        const tot = next.reduce((a, hh) => a + hh.score, 0);
        qPos = [0, 1, 2].map((k) => (0.8 * next.reduce((a, hh) => a + index.chunks[hh.chunk].pos[k] * hh.score, 0)) / tot);
      }
      kick();
    },
    /** Emphasise one project (doc index), or -1 to clear. */
    focus(doc: number) {
      if (doc === focusDoc) return;
      focusDoc = doc;
      kick();
    },
    onHover(fn: (i: number, x: number, y: number) => void) {
      onHover = fn;
    },
    onPick(fn: (doc: number) => void) {
      onPick = fn;
    },
  };
}
