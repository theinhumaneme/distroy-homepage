// "Query my work": a real retrieval engine over this page's content.
// TF-IDF vectors are built at compile time; the query is embedded here with
// the same analyser and ranked by cosine similarity. No network calls.
import { terms, SYNONYMS } from '../lib/text';

type Index = {
  vocab: string[];
  idf: number[];
  docs: { id: string; title: string; cluster: string; anchor: string; pos: number[] }[];
  chunks: { doc: number; text: string; v: [number, number][]; pos: number[] }[];
};
export type Hit = { chunk: number; score: number };

const CLUSTER_COLOR: Record<string, string> = {
  ai: '#b6a4ff',
  systems: '#7cc4ff',
  product: '#ffc96b',
  teaching: '#6fe3c1',
};

export function createEngine(index: Index) {
  const vocab = new Map(index.vocab.map((w, i) => [w, i]));
  const vecs = index.chunks.map((c) => new Map(c.v));

  const add = (q: Map<number, number>, w: string, weight: number) => {
    const id = vocab.get(w);
    if (id !== undefined) q.set(id, Math.max(q.get(id) ?? 0, weight));
    else if (w.length >= 3)
      // prefix match lets "quantiz" find "quantized", "kube" find "kubernetes"
      for (const [term, tid] of vocab) if (term.startsWith(w)) q.set(tid, Math.max(q.get(tid) ?? 0, weight * 0.8));
  };

  return {
    search(text: string, k = 6): Hit[] {
      const q = new Map<number, number>();
      for (const t of terms(text)) {
        add(q, t, 1);
        for (const s of SYNONYMS[t] ?? []) add(q, s, 0.45);
      }
      if (!q.size) return [];
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
      return hits
        .filter((h) => h.score > 0.02)
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
    },
  };
}

export function createSpace(canvas: HTMLCanvasElement, index: Index) {
  const ctx = canvas.getContext('2d')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0,
    h = 0,
    dpr = 1;
  let rotY = -0.35,
    rotX = 0.18,
    vel = reduce ? 0 : 0.0016;
  let dragging = false,
    lastX = 0,
    lastY = 0;
  let hits: Hit[] = [];
  let hitMap = new Map<number, number>();
  let qPos: number[] | null = null;
  let qAlpha = 0;
  let hover = -1;
  let visible = false;
  let onHover: ((i: number, x: number, y: number) => void) | null = null;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const proj = (p: number[]) => {
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
    return [w / 2 + x1 * scale * s, h / 2 + y1 * scale * s, s];
  };

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', () => (dragging = false));
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left,
      my = e.clientY - r.top;
    if (dragging) {
      rotY += (e.clientX - lastX) * 0.006;
      rotX = Math.max(-0.9, Math.min(0.9, rotX + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    let best = -1,
      bd = 180;
    index.chunks.forEach((c, i) => {
      const [x, y] = proj(c.pos);
      const d = (x - mx) ** 2 + (y - my) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    hover = best;
    onHover?.(best, mx, my);
  });
  canvas.addEventListener('pointerleave', () => {
    hover = -1;
    onHover?.(-1, 0, 0);
  });

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) requestAnimationFrame(frame);
  }).observe(canvas);

  let t0 = performance.now();
  function frame(now: number) {
    if (!visible) return;
    const dt = Math.min(50, now - t0);
    t0 = now;
    if (!dragging) rotY += vel * dt * 0.06;
    qAlpha += ((qPos ? 1 : 0) - qAlpha) * 0.08;

    ctx.clearRect(0, 0, w, h);
    const P = index.chunks.map((c) => proj(c.pos));
    const D = index.docs.map((d) => proj(d.pos));
    const anyHit = hits.length > 0;

    // constellation lines doc → chunk
    ctx.lineWidth = 1;
    index.chunks.forEach((c, i) => {
      const a = D[c.doc],
        b = P[i];
      const lit = hitMap.has(i);
      ctx.strokeStyle = CLUSTER_COLOR[index.docs[c.doc].cluster];
      ctx.globalAlpha = (anyHit ? (lit ? 0.5 : 0.05) : 0.16) * Math.min(a[2], 1.2);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    });

    // retrieval lines from the query
    if (qPos && qAlpha > 0.01) {
      const q = proj(qPos);
      const top = hits[0]?.score || 1;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -now * 0.03;
      hits.forEach((hh) => {
        const p = P[hh.chunk];
        ctx.strokeStyle = '#eeede8';
        ctx.globalAlpha = qAlpha * (0.25 + 0.65 * (hh.score / top));
        ctx.lineWidth = 0.6 + 1.6 * (hh.score / top);
        ctx.beginPath();
        ctx.moveTo(q[0], q[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      // query node
      ctx.globalAlpha = qAlpha;
      const pulse = 1 + Math.sin(now * 0.004) * 0.15;
      ctx.strokeStyle = '#6fe3c1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 9 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#6fe3c1';
      ctx.beginPath();
      ctx.arc(q[0], q[1], 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '500 11px "Geist Mono Variable", ui-monospace, monospace';
      ctx.fillText('query', q[0] + 14, q[1] + 4);
    }

    // chunk points, far to near
    const order = P.map((p, i) => i).sort((a, b) => P[a][2] - P[b][2]);
    for (const i of order) {
      const [x, y, s] = P[i];
      const c = index.chunks[i];
      const col = CLUSTER_COLOR[index.docs[c.doc].cluster];
      const lit = hitMap.has(i);
      const r = (lit ? 4.2 : 2.4) * s + (i === hover ? 2 : 0);
      ctx.globalAlpha = anyHit ? (lit ? 1 : 0.22) : 0.85;
      if (lit) {
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // document labels
    // document labels: retrieved docs first, nearest next; skip any that collide
    ctx.font = '450 11.5px "Geist Mono Variable", ui-monospace, monospace';
    const litDocs = new Set(hits.map((hh) => index.chunks[hh.chunk].doc));
    const placed: number[][] = [];
    index.docs
      .map((_, di) => di)
      .sort((a, b) => Number(litDocs.has(b)) - Number(litDocs.has(a)) || D[b][2] - D[a][2])
      .forEach((di) => {
        const [x, y, s] = D[di];
        const label = index.docs[di].title;
        const bw = ctx.measureText(label).width;
        // flip labels that would run off the right edge
        const lx = x + 8 + bw > w - 8 ? x - 8 - bw : x + 8;
        const box = [lx, y - 20, lx + bw + 4, y - 4];
        if (placed.some((p) => box[0] < p[2] && box[2] > p[0] && box[1] < p[3] && box[3] > p[1])) return;
        placed.push(box);
        const lit = litDocs.has(di);
        ctx.globalAlpha = anyHit ? (lit ? 1 : 0.3) : Math.min(1, 0.5 + (s - 0.8));
        ctx.fillStyle = lit ? '#eeede8' : '#b0afa8';
        ctx.fillText(label, lx, y - 8);
      });
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  return {
    setHits(next: Hit[]) {
      hits = next;
      hitMap = new Map(next.map((hh) => [hh.chunk, hh.score]));
      if (!next.length) {
        qPos = null;
        return;
      }
      // the query sits at the score-weighted centroid of what it retrieved
      const tot = next.reduce((a, hh) => a + hh.score, 0);
      qPos = [0, 1, 2].map((k) => next.reduce((a, hh) => a + index.chunks[hh.chunk].pos[k] * hh.score, 0) / tot);
      qPos = qPos.map((x) => x * 0.8);
    },
    onHover(fn: (i: number, x: number, y: number) => void) {
      onHover = fn;
    },
  };
}
