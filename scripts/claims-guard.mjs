// Fails the build if the rendered site says something the profile's
// claimRules forbid. Runs against dist/ after `astro build`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

const RULES = [
  { re: /1st\s*place/i, why: 'cr-award: the hackathon awards are "Best Podman Container Implementation" and "People\'s Choice"' },
  { re: /\bparsel\b|applethub/i, why: 'cr-oaam-name: the project is OAAM' },
  { re: /tauri/i, why: 'cr-oaam-stack: OAAM did not use Tauri' },
  { re: /OAAM[^.]{0,60}desktop app/i, why: 'cr-oaam-stack: OAAM is a web app' },
  { re: /OpenAgentAppletMarketPlace/i, why: 'cr-oaam-public-link: do not link the OAAM fork' },
  { re: /documan-public-archive/i, why: 'cr-repo-credentials: do not link the Documan archive' },
  { re: /documan-angular-22/i, why: 'cr-documan-angular-repo-name: use documan-angular-21' },
  { re: /ramalama/i, why: 'cr-oaam-no-ramalama' },
  { re: /\b\d[\d,]*\+?\s*nodes\b/i, why: 'cr-hikari-nodes: no node counts' },
  { re: /rollbacks?\b(?![^<]{0,40}(path|never indexed|rolled))/i, why: 'cr-hikari-rollback: Hikari has no rollbacks (Documan outbox wording is allowed)' },
  { re: /deployment history/i, why: 'cr-hikari-rollback' },
  { re: /authenticated encryption|\bAEAD\b|secure control plane/i, why: 'cr-hikari-crypto' },
  { re: /\bTUI\b/, why: 'cr-autodeploy-tui: Autodeploy is an interactive CLI' },
  { re: /concurrent users/i, why: 'cr-documan-users' },
  { re: /\bcalert\b|raven-rs/i, why: 'cr-calert / cr-raven' },
  { re: /\btensorflow\b|\bkeras\b|\bopencv\b/i, why: 'cr-learning-skills' },
  { re: /\bgraphql\b/i, why: 'cr-skills-no-graphql-sqlx' },
  { re: /tavily|web search/i, why: 'cr-patternsmith-websearch' },
  { re: /checkpoint\/resume|\d+\+?\s*articles/i, why: 'cr-patternsmith-scope' },
  { re: /15 minutes to 25 seconds|10 minutes to 30 seconds|95% reduction/i, why: 'cr-gctcportal-timing' },
  { re: /97\.8\s*%/, why: 'cr-fetal-protocol' },
  { re: /speculative[- ]decoding/i, why: 'cr-openaccelerator' },
  { re: /zero network|no backend/i, why: 'cr-activityvisualizer-privacy-integration / cr-trainingstory-privacy' },
  { re: /strava api|garmin api|fitbit api/i, why: 'cr-activityvisualizer-privacy-integration' },
  { re: /857[-.\s]?295|tel:\+1/i, why: 'privacy: no phone number on the public site' },
  { re: /sponsorship|work authori[sz]ation|\bOPT\b|\bCPT\b/, why: 'privacy: work authorisation is not public' },
  { re: /quantization-aware|implemented quantization|CUDA/i, why: 'cr-quantized-model-serving' },
  // owner review, Oct 2026
  { re: /\b\d+\s*[×x]\s*(faster|cold|page|speed)|\b(100|5)\s*×/i, why: 'review: state before → after, not multipliers' },
  { re: /tagged releases|\b\d+\s+(authored\s+)?commits\b/i, why: 'review: no release or commit counts' },
  { re: /git push/i, why: 'review: no evidence of a Git-triggered deployment workflow in Hikari' },
  { re: /softmax|logits?\b|\bQ = role/i, why: 'review: no invented attention/logit semantics' },
  { re: /unsupported claims|every claim[^.]{0,30}(links|cited)|most AI (engineers|demos) skip|part most demos skip/i, why: 'review: no self-certifying or comparative claims' },
  { re: /cannot drift|never drift|keeps? (a|the) model honest|four agents/i, why: 'review: Patternsmith wording' },
  { re: /only thing that ever leaves|zero cloud dependency/i, why: 'review: OAAM privacy boundary must stay precise' },
  { re: /tok\/s|reranking|retrieving from \d+/i, why: 'review: no simulated status or throughput' },
  { re: /classical MDS|semantic (search|retrieval)|neural/i, why: 'review: search is keyword TF-IDF; map distances are illustrative' },
  { re: /production (IaC|kubernetes)|kubernetes expert/i, why: 'cr-kubernetes-not-production / cr-terraform-basics' },
];

// The rules cover the portfolio's own claims. The blog (its index at /blog/,
// its posts at their Hugo permalinks under /post/) is published as the author
// wrote it, and vendor chunks are third-party library code (see
// astro.config.mjs), so neither is checked.
const SKIP = [join(DIST, 'blog'), join(DIST, 'post'), join(DIST, '_astro', 'vendor')];

const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (SKIP.includes(p)) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|json|xml|txt)$/.test(f)) files.push(p);
  }
};
walk(DIST);

// Strip tags so a match reports readable text; keep attributes for hrefs.
const failures = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const { re, why } of RULES) {
    const m = src.match(re);
    if (!m) continue;
    const i = m.index ?? 0;
    failures.push({ file: file.replace(DIST, 'dist/'), why, near: src.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ') });
  }
}

// The Documan eras must not blur: no production metric beside the rewrite stack.
// Visible text only: scripts (including the search index JSON) are checked by the rules above.
const html = readFileSync(join(DIST, 'index.html'), 'utf8')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ');
for (const sentence of html.split(/(?<=[.!?])\s+/)) {
  if (/(Java 25|Spring Boot 4|Angular 21)/.test(sentence) && /(4,000\+|200,000\+|1,200\+|99%\+)/.test(sentence) && !/\b(v1|Original)\b/.test(sentence)) {
    failures.push({ file: 'dist/index.html', why: 'cr-documan-eras: production numbers next to the rewrite', near: sentence.slice(0, 160) });
  }
}

// Brain Tumor Detection may appear only as a labelled, guided academic project.
for (const m of html.matchAll(/brain tumou?r/gi)) {
  const near = html.slice(Math.max(0, m.index - 200), m.index + 300);
  if (!/guided/i.test(near)) failures.push({ file: 'dist/index.html', why: 'cr-braintumor-guided: label it a guided academic project', near: near.slice(0, 160) });
}

// The resume button needs a file to download.
const resume = join(DIST, 'kalyan-mudumby-resume.pdf');
try {
  statSync(resume);
} catch {
  console.warn('! claims guard: public/kalyan-mudumby-resume.pdf is missing; the "Download resume" buttons will 404 until it is added');
}

if (failures.length) {
  console.error(`\n✗ claims guard: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ${f.why}\n    ${f.file}: …${f.near}…\n`);
  process.exit(1);
}
console.log(`✓ claims guard: ${files.length} files, ${RULES.length + 1} rules, no violations`);
