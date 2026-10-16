// Build-time only. Everything here runs in Astro frontmatter, so the
// tokenizer tables and the maths never reach the browser.
import { encode, decode } from 'gpt-tokenizer/encoding/o200k_base';
import { terms } from './text';
import { docs, skillRows, type Cluster } from '../data/content';

/* ---------------------------------------------------------------- tokens */

export type Tok = { t: string; id: number };

/** Real o200k_base tokens. Pieces that split a multi-byte char are merged. */
export const tokenize = (text: string): Tok[] => {
  const ids = encode(text);
  const out: Tok[] = [];
  let pending: number[] = [];
  for (const id of ids) {
    pending.push(id);
    const t = decode(pending);
    if (t.includes('�')) continue;
    out.push({ t, id: pending[0] });
    pending = [];
  }
  if (pending.length) out.push({ t: decode(pending), id: pending[0] });
  return out;
};

export const countTokens = (text: string) => encode(text).length;

/* ------------------------------------------------------------ embeddings */

type Sparse = [number, number][];

const cosine = (a: Map<number, number>, b: Map<number, number>) => {
  let s = 0;
  for (const [k, v] of a) s += v * (b.get(k) ?? 0);
  return s;
};

const normalize = (m: Map<number, number>) => {
  let n = 0;
  for (const v of m.values()) n += v * v;
  n = Math.sqrt(n) || 1;
  for (const [k, v] of m) m.set(k, v / n);
  return m;
};

/** Seeded PRNG so the layout is identical on every build. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

/** Classical MDS: top-3 eigenvectors of the double-centred distance matrix. */
const mds3 = (D: number[][]): number[][] => {
  const n = D.length;
  const D2 = D.map((r) => r.map((d) => d * d));
  const rowMean = D2.map((r) => r.reduce((a, b) => a + b, 0) / n);
  const all = rowMean.reduce((a, b) => a + b, 0) / n;
  const B = D2.map((r, i) => r.map((d, j) => -0.5 * (d - rowMean[i] - rowMean[j] + all)));
  const rand = rng(7);
  const coords = Array.from({ length: n }, () => [0, 0, 0]);
  for (let k = 0; k < 3; k++) {
    let v = Array.from({ length: n }, () => rand() - 0.5);
    let lambda = 0;
    for (let it = 0; it < 300; it++) {
      const w = B.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
      const norm = Math.sqrt(w.reduce((s, x) => s + x * x, 0)) || 1;
      v = w.map((x) => x / norm);
    }
    const Bv = B.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
    lambda = v.reduce((s, x, i) => s + x * Bv[i], 0);
    const scale = Math.sqrt(Math.max(lambda, 0));
    v.forEach((x, i) => (coords[i][k] = x * scale));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) B[i][j] -= lambda * v[i] * v[j];
  }
  return coords;
};

// Where each cluster is pulled to, so the map always reads the same way:
// AI on the left and forward, systems on the right, product below.
const ANCHOR: Record<Cluster, [number, number, number]> = {
  ai: [-1.05, -0.3, 0.3],
  systems: [0.95, -0.15, -0.25],
  product: [0.05, 0.95, 0.05],
  teaching: [0.35, -1.05, 0.4],
  academic: [-0.55, 0.9, -0.45],
};

export const buildIndex = () => {
  const chunkTexts: { doc: number; text: string }[] = [];
  docs.forEach((d, di) => d.chunks.forEach((text) => chunkTexts.push({ doc: di, text })));

  // vocabulary + document frequency
  const vocab = new Map<string, number>();
  const df: number[] = [];
  const tfs = chunkTexts.map(({ text }) => {
    const tf = new Map<number, number>();
    for (const w of terms(text)) {
      let id = vocab.get(w);
      if (id === undefined) {
        id = vocab.size;
        vocab.set(w, id);
        df[id] = 0;
      }
      tf.set(id, (tf.get(id) ?? 0) + 1);
    }
    for (const id of tf.keys()) df[id]++;
    return tf;
  });
  const N = chunkTexts.length;
  const idf = df.map((d) => Math.log(1 + N / d));
  const vecs = tfs.map((tf) => {
    const m = new Map<number, number>();
    for (const [id, c] of tf) m.set(id, (1 + Math.log(c)) * idf[id]);
    return normalize(m);
  });

  // document centroids → MDS layout, blended with cluster anchors
  const docVecs = docs.map((_, di) => {
    const m = new Map<number, number>();
    vecs.forEach((v, ci) => {
      if (chunkTexts[ci].doc !== di) return;
      for (const [k, x] of v) m.set(k, (m.get(k) ?? 0) + x);
    });
    return normalize(m);
  });
  const D = docVecs.map((a) => docVecs.map((b) => Math.max(0, 1 - cosine(a, b))));
  const raw = mds3(D);
  const maxAbs = Math.max(...raw.flat().map(Math.abs)) || 1;
  const docPos = raw.map((p, i) => {
    const a = ANCHOR[docs[i].cluster];
    return p.map((x, k) => +(0.55 * (x / maxAbs) + 0.75 * a[k]).toFixed(4));
  });

  // chunks orbit their document on a deterministic shell
  const rand = rng(42);
  const chunkPos = chunkTexts.map(({ doc }) => {
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const r = 0.12 + rand() * 0.14;
    const s = Math.sqrt(1 - u * u);
    const c = docPos[doc];
    return [c[0] + r * s * Math.cos(th), c[1] + r * u, c[2] + r * s * Math.sin(th)].map((x) => +x.toFixed(4));
  });

  const sparse: Sparse[] = vecs.map((m) => [...m].map(([k, v]) => [k, +v.toFixed(4)] as [number, number]));

  return {
    vocab: [...vocab.keys()],
    idf: idf.map((x) => +x.toFixed(4)),
    docs: docs.map((d, i) => ({ id: d.id, title: d.title, cluster: d.cluster, anchor: d.anchor, pos: docPos[i] })),
    chunks: chunkTexts.map((c, i) => ({ doc: c.doc, text: c.text, v: sparse[i], pos: chunkPos[i] })),
  };
};

/* ---------------------------------------------------------- skill matrix */

export const buildSkills = () => {
  const evidence = new Map<string, string[]>();
  for (const d of docs) for (const s of d.skills) evidence.set(s, [...(evidence.get(s) ?? []), d.title]);
  const max = Math.max(...[...evidence.values()].map((v) => v.length));
  const rows = skillRows.map((row) => ({
    label: row.label,
    cells: row.skills
      .filter((s) => evidence.has(s))
      .map((s) => {
        const used = evidence.get(s)!;
        return { skill: s, n: used.length, w: +(used.length / max).toFixed(3), used };
      }),
  }));
  return { rows, max, dims: rows.reduce((a, r) => a + r.cells.length, 0) };
};
