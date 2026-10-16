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
  { re: /brain tumou?r/i, why: 'cr-braintumor-guided: never headline it' },
  { re: /speculative[- ]decoding/i, why: 'cr-openaccelerator' },
  { re: /zero network|no backend/i, why: 'cr-activityvisualizer-privacy-integration / cr-trainingstory-privacy' },
  { re: /strava api|garmin api|fitbit api/i, why: 'cr-activityvisualizer-privacy-integration' },
  { re: /857[-.\s]?295|tel:\+1/i, why: 'privacy: no phone number on the public site' },
  { re: /sponsorship|work authori[sz]ation|\bOPT\b|\bCPT\b/, why: 'privacy: work authorisation is not public' },
  { re: /quantization-aware|implemented quantization|CUDA/i, why: 'cr-quantized-model-serving' },
  { re: /production (IaC|kubernetes)|kubernetes expert/i, why: 'cr-kubernetes-not-production / cr-terraform-basics' },
];

const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
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
const html = readFileSync(join(DIST, 'index.html'), 'utf8').replace(/<[^>]+>/g, ' ');
for (const sentence of html.split(/(?<=[.!?])\s+/)) {
  if (/(Java 25|Spring Boot 4|Angular 21)/.test(sentence) && /(4,000\+|200,000\+|1,200\+|99%\+)/.test(sentence) && !/v1/.test(sentence)) {
    failures.push({ file: 'dist/index.html', why: 'cr-documan-eras: production numbers next to the rewrite', near: sentence.slice(0, 160) });
  }
}

if (failures.length) {
  console.error(`\n✗ claims guard: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ${f.why}\n    ${f.file}: …${f.near}…\n`);
  process.exit(1);
}
console.log(`✓ claims guard: ${files.length} files, ${RULES.length + 1} rules, no violations`);
