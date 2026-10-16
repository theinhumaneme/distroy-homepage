/*
 * Curated site copy.
 *
 * Every fact here comes from kalyan-mudumby.profile.json (the private,
 * gitignored source of truth) and respects its claimRules. When editing:
 * reuse highlight text, never add metrics, and keep claims scoped to what the
 * evidence shows. `npm run guard` checks the built HTML for phrases the
 * profile forbids.
 */

export const person = {
  name: 'Kalyan Mudumby',
  role: 'AI, backend and infrastructure engineer',
  location: 'Boston, MA',
  email: 'mudumby.k@northeastern.edu',
  github: 'https://github.com/theinhumaneme',
  linkedin: 'https://linkedin.com/in/kalyan-mudumby',
  blog: 'https://kalyanmudumby.com/',
  // Drop the PDF at public/kalyan-mudumby-resume.pdf; the guard warns if it is missing.
  resume: '/kalyan-mudumby-resume.pdf',
};

/* ------------------------------------------------------------------------ */
/* Sources. A citation chip renders only for sources with a public URL.     */
/* ------------------------------------------------------------------------ */

export type Source = { id: string; label: string; detail: string; url?: string };

export const sources: Source[] = [
  { id: 'documan-v1', label: 'Documan write-up', detail: 'kalyanmudumby.com', url: 'https://kalyanmudumby.com/post/documan-zero-cost-digital-library/' },
  { id: 'documan-v2', label: 'theinhumaneme/documan-public-release', detail: 'Java / Angular rewrite, MIT', url: 'https://github.com/theinhumaneme/documan-public-release' },
  { id: 'langchain', label: 'langchain-ai/langchain#19427', detail: 'Merged March 2024', url: 'https://github.com/langchain-ai/langchain/pull/19427' },
  { id: 'patternsmith', label: 'theinhumaneme/patternsmith', detail: 'MIT', url: 'https://github.com/theinhumaneme/patternsmith' },
  { id: 'hikari', label: 'theinhumaneme/hikari', detail: 'MIT', url: 'https://github.com/theinhumaneme/hikari' },
  { id: 'hikari-post', label: 'Hikari agent-server write-up', detail: 'kalyanmudumby.com', url: 'https://kalyanmudumby.com/post/scale-vm-management-with-hikari-agent-server/' },
  { id: 'activity', label: 'activity-visualizer.distroy.dev', detail: 'Live site', url: 'https://activity-visualizer.distroy.dev' },
  { id: 'training', label: 'theinhumaneme/hevy-visualizer', detail: 'Training Story', url: 'https://github.com/theinhumaneme/hevy-visualizer' },
  { id: 'autodeploy', label: 'theinhumaneme/autodeploy', detail: 'Rust CLI', url: 'https://github.com/theinhumaneme/autodeploy' },
  { id: 'obslab', label: 'Spring Boot observability tutorial', detail: 'kalyanmudumby.com', url: 'https://kalyanmudumby.com/post/complete-springboot-observability/' },
  { id: 'nixos', label: 'theinhumaneme/nixos', detail: 'NixOS configuration', url: 'https://github.com/theinhumaneme/nixos' },
  { id: 'homelab', label: 'Encrypted DNS tutorial', detail: 'kalyanmudumby.com', url: 'https://kalyanmudumby.com/post/complete-adguard-setup-doh-dot-dns/' },
  { id: 'cs5610', label: 'CS5610 social network (team)', detail: 'GitHub', url: 'https://github.com/theinhumaneme/social-network-webdev-final-project' },
  { id: 'fetal', label: 'theinhumaneme/major', detail: 'Academic capstone', url: 'https://github.com/theinhumaneme/major' },
  { id: 'iot', label: 'theinhumaneme/ESP32', detail: 'Academic project', url: 'https://github.com/theinhumaneme/ESP32' },
  { id: 'paper', label: 'PSEN paper', detail: 'DOI 10.56831/PSEN-02-050', url: 'https://primerascientific.com/journals/psen/PSEN-02-050' },
  // no public URL: these render without a chip
  { id: 'smartai', label: 'SMART AI Chat', detail: 'Nebulogic Technologies' },
  { id: 'oaam', label: 'OAAM', detail: 'Red Hat / IBM hackathon, 2026' },
  { id: 'nebulogic', label: 'Nebulogic Technologies', detail: '2022 - 2025' },
  { id: 'ta', label: 'Graduate TA, CS4530', detail: 'Northeastern' },
  { id: 'gctc', label: 'Web Administrator', detail: 'GCET' },
  { id: 'braintumor', label: 'Brain Tumor Detection', detail: 'Guided academic project' },
];

export const sourceById = (id: string) => sources.find((s) => s.id === id);

/* ------------------------------------------------------------------------ */
/* Introduction                                                             */
/* ------------------------------------------------------------------------ */

export const hero = {
  prompt: 'who is kalyan mudumby?',
  // `em` marks the three kinds of work; each gets its own token hue, with equal weight
  statement: [
    { text: 'I build ' },
    { text: 'AI systems', em: 1, tail: ',' },
    { text: ' ' },
    { text: 'backends', em: 5, tail: ',' },
    { text: ' and the ' },
    { text: 'infrastructure', em: 3 },
    { text: ' behind them.' },
  ],
  availability: 'Available for a Spring 2027 co-op, and full-time from May 2027.',
  intro:
    'From a city’s 311 chatbot to a college digital library, I build tools that make information easier to find and systems easier to run.',
  meta: ['Boston, MA', 'MS Computer Science · Northeastern', 'Expected May 2027'],
};

/* ------------------------------------------------------------------------ */
/* Featured work                                                            */
/* ------------------------------------------------------------------------ */

export type Case = {
  id: string;
  anchor: string;
  title: string;
  org: string;
  period?: string;
  headline: string;
  body: { label?: string; text: string }[];
  points: { label?: string; text: string; src?: string }[];
  pointsTitle?: string;
  note?: { label: string; text: string };
  privacy?: string;
  stack: string[];
  links: { label: string; url: string }[];
  badges?: string[];
  viz?: 'rag' | 'graph' | 'device' | 'fleet' | 'checkpoint' | 'route' | 'bars';
  compact?: boolean;
};

export const casesCopy = {
  title: 'Selected work',
};

export const cases: Case[] = [
  {
    id: 'smartai',
    anchor: 'work-smartai',
    title: 'SMART AI Chat',
    org: 'Nebulogic Technologies · City of Fort Wayne',
    period: 'Software Engineer, 2023 - 2025',
    headline: 'City-service information, in plain language.',
    body: [
      {
        text: "I built a chatbot for Fort Wayne’s 311 service that answered residents’ questions using retrieval-augmented generation, as a solo project I owned end to end. A query cache handled repeated questions, while the knowledge base grew around the information residents asked for most.",
      },
    ],
    points: [],
    note: {
      label: 'Implementation note',
      text: 'I built it while LangChain was new and RAG and prompt engineering were still taking shape, so there was little documentation to work from. I designed and developed it through research and hands-on experiments with retrieval and LLM tools.',
    },
    stack: ['Python', 'LangChain', 'OpenAI API', 'RAG', 'FastAPI'],
    links: [],
    viz: 'rag',
  },
  {
    id: 'langchain',
    anchor: 'work-langchain',
    title: 'LangChain',
    org: 'Open-source contribution',
    period: 'March 2024',
    headline: 'A cache fix, contributed upstream.',
    body: [
      {
        text: "Corrected a validation error in LangChain's GPTCache integration when handling chat-generation results. PR #19427 was merged in March 2024.",
      },
    ],
    points: [],
    stack: ['Python', 'LangChain', 'Pydantic'],
    links: [{ label: 'PR #19427 · merged', url: 'https://github.com/langchain-ai/langchain/pull/19427' }],
    compact: true,
  },
  {
    id: 'patternsmith',
    anchor: 'work-patternsmith',
    title: 'Patternsmith',
    org: 'Personal project · open source (MIT)',
    headline: 'From a design pattern to an illustrated tutorial.',
    body: [
      {
        text: 'Patternsmith turns software design patterns and code smells into tutorials with explanations, code, and diagrams. A staged pipeline develops and assembles each article, checks the output, and retries errors within set limits. If one topic fails, the rest of the batch can continue.',
      },
    ],
    points: [
      { text: 'Research, code generation, and writing share a typed state, followed by a separate diagram-validation step.', src: 'patternsmith' },
      { text: 'The article reuses generated code verbatim. Additional checks flag specific inconsistencies between code and diagrams.', src: 'patternsmith' },
      { text: 'Invalid JSON and diagrams are retried within fixed limits.', src: 'patternsmith' },
      { text: 'Models can run through hosted APIs, vLLM, or LM Studio, including quantized models and multi-token prediction in LM Studio.', src: 'patternsmith' },
    ],
    stack: ['Python 3.11', 'LangGraph', 'Pydantic v2', 'vLLM', 'LM Studio', 'mypy --strict', 'pytest', 'Hugo'],
    links: [
      { label: 'patternsmith.distroy.dev', url: 'https://patternsmith.distroy.dev' },
      { label: 'GitHub', url: 'https://github.com/theinhumaneme/patternsmith' },
    ],
    viz: 'graph',
  },
  {
    id: 'documan',
    anchor: 'work-documan',
    title: 'Documan',
    org: 'Personal project · original platform and rewrite',
    period: '2020 - 2026',
    headline: 'Course materials, in one searchable place.',
    body: [
      { text: 'I built Documan to bring scattered notes, lab manuals, and past papers into one library, available on the web and through Telegram.' },
      { label: 'Original platform', text: 'The Python/Flask system served 4,000+ students and delivered 200,000+ files before its retirement in May 2025.' },
      {
        label: 'Current rewrite',
        text: 'The Java/Angular rewrite adds four-tier access control and keeps search in sync with saved content. It is publicly available, with no users yet.',
      },
    ],
    pointsTitle: 'Design decisions',
    points: [
      { label: 'Local reads', text: 'On startup, the original platform copied PostgreSQL data into local SQLite, removing a transcontinental round trip from each read.', src: 'documan-v1' },
      { label: 'Background writes', text: 'A queue-backed worker handled database and metrics writes, so requests could return without waiting.', src: 'documan-v1' },
      { label: 'Separate refresh', text: 'Catalog updates ran separately, keeping the bot available as files changed in Drive.', src: 'documan-v1' },
      { label: 'Rewrite', text: 'A transactional outbox synchronizes Meilisearch with PostgreSQL. A rolled-back write is never indexed, and a search outage does not block writes.', src: 'documan-v2' },
    ],
    stack: ['Python', 'Flask', 'PostgreSQL', 'Meilisearch', 'Java 25', 'Spring Boot 4.1', 'Angular 21', 'Redis'],
    links: [
      { label: 'documan.kalyanmudumby.com (rewrite)', url: 'https://documan.kalyanmudumby.com' },
      { label: 'GitHub (rewrite)', url: 'https://github.com/theinhumaneme/documan-public-release' },
      { label: 'Write-up', url: 'https://kalyanmudumby.com/post/documan-zero-cost-digital-library/' },
    ],
    viz: 'checkpoint',
  },
  {
    id: 'hikari',
    anchor: 'work-hikari',
    title: 'Hikari',
    org: 'Personal project · open source (MIT)',
    period: '2024 - 2025',
    headline: 'One configuration. Only the changes get deployed.',
    body: [
      {
        text: 'Hikari manages container deployments across machines from one configuration. It sends updates to an agent on each machine, which compares the new configuration with its last-applied state and updates only the affected stacks.',
      },
    ],
    points: [
      { text: 'Agents compare incoming configuration with the last-applied state.', src: 'hikari' },
      { text: 'The agent-server mode pushes updates over persistent connections.', src: 'hikari-post' },
      { text: 'Disconnected agents reconnect automatically.', src: 'hikari' },
    ],
    stack: ['Rust', 'Tokio', 'Axum', 'WebSockets', 'PostgreSQL', 'Docker Compose'],
    links: [
      { label: 'GitHub', url: 'https://github.com/theinhumaneme/hikari' },
      { label: 'Write-up', url: 'https://kalyanmudumby.com/post/scale-vm-management-with-hikari-agent-server/' },
    ],
    viz: 'fleet',
  },
  {
    id: 'oaam',
    anchor: 'work-oaam',
    title: 'OAAM',
    org: 'Red Hat / IBM · Pods, Prompts & Prototypes hackathon',
    period: '2026',
    headline: 'Extract document data with local AI.',
    body: [
      {
        text: "OAAM processes documents on the user's machine through a browser interface. A local vision model reads an invoice and returns structured data. An optional MCP integration sends extracted results to Google Sheets.",
      },
    ],
    badges: ['Best Podman Container Implementation', 'People’s Choice'],
    pointsTitle: 'How it works',
    points: [
      { text: 'Invoices are read by Llama 3.2 Vision 11B, served locally through Podman AI Lab.' },
      { text: 'Malformed model output is re-prompted once, then parsed into a shared result schema.' },
      { text: 'A plugin registry discovers tools from folder conventions, with TypeScript types shared across the frontend, backend and extension.' },
    ],
    stack: ['React 18', 'TypeScript', 'Node.js', 'Express', 'MCP', 'Podman AI Lab'],
    links: [],
    viz: 'device',
  },
];

/* ------------------------------------------------------------------------ */
/* More projects and experiments                                            */
/* ------------------------------------------------------------------------ */

export type MiniDoc = { anchor: string; title: string; line: string; tag: string; url?: string; group: 'tools' | 'academic' };

export const moreWork: MiniDoc[] = [
  { anchor: 'more-activity', group: 'tools', title: 'Activity Visualizer', tag: 'react · maplibre', url: 'https://activity-visualizer.distroy.dev', line: 'Turns GPX and TCX exports into performance analysis, 3D route flyovers and shareable videos, processed in the browser.' },
  { anchor: 'more-training', group: 'tools', title: 'Training Story', tag: 'react · d3', url: 'https://hevy-visualizer.distroy.dev', line: 'Turns a Hevy workout export into exercise trends, personal records and comparisons, processed in the browser.' },
  { anchor: 'more-autodeploy', group: 'tools', title: 'Autodeploy', tag: 'rust · cli', url: 'https://github.com/theinhumaneme/autodeploy', line: 'Prepare repositories and Docker deployments from one reusable configuration.' },
  { anchor: 'more-obslab', group: 'tools', title: 'Observability lab', tag: 'opentelemetry · grafana', url: 'https://kalyanmudumby.com/post/complete-springboot-observability/', line: 'Follow a metric spike to the relevant request trace and logs in a local Spring Boot lab.' },
  { anchor: 'more-nixos', group: 'tools', title: 'NixOS configuration', tag: 'nix · linux', url: 'https://github.com/theinhumaneme/nixos', line: 'Version-controlled configuration for reproducible personal development environments.' },
  { anchor: 'more-network', group: 'tools', title: 'Home networking', tag: 'dns · tunnels', url: 'https://kalyanmudumby.com/post/complete-adguard-setup-doh-dot-dns/', line: 'Personal setups for remote access, DNS filtering, and encrypted DNS.' },
  { anchor: 'more-cs5610', group: 'tools', title: 'CS5610 social network', tag: 'team · next.js', url: 'https://github.com/theinhumaneme/social-network-webdev-final-project', line: 'Team project. I contributed Algolia search, filtering and pagination, plus NestJS and MongoDB story and comment features.' },
  { anchor: 'more-fetal', group: 'academic', title: 'Fetal Health Classification', tag: 'academic · 2023', url: 'https://github.com/theinhumaneme/major', line: 'Capstone project: classifying fetal health risk from cardiotocogram data, comparing algorithms such as KNN and logistic regression, served through an Angular front end and a Flask API in Docker.' },
  { anchor: 'more-iot', group: 'academic', title: 'IoT Grain Silo Monitoring', tag: 'academic · 2022', url: 'https://github.com/theinhumaneme/ESP32', line: 'An ESP32 tracks CO2, humidity and temperature inside grain silos and reports to a Google Apps Script backend that sends alerts. The basis of a 2023 PSEN paper.' },
  { anchor: 'more-braintumor', group: 'academic', title: 'Brain Tumor Detection', tag: 'guided · 2021', line: 'Guided five-person academic project: a CNN image classifier for MRI scans with an augmentation pipeline and a Flask interface.' },
];

/* ------------------------------------------------------------------------ */
/* Search corpus: every chunk is a sentence from the profile's verified     */
/* highlights. `anchor` is where a result jumps to.                         */
/* ------------------------------------------------------------------------ */

export type Cluster = 'ai' | 'systems' | 'product' | 'teaching' | 'academic';

// `note` replaces the category label wherever the title is listed on its own.
// `eras` splits a project whose versions must never blur: search shows each
// era as its own labelled result, so a metric never sits beside the wrong stack.
export type Doc = {
  id: string;
  title: string;
  cluster: Cluster;
  anchor: string;
  skills: string[];
  chunks: string[];
  note?: string;
  eras?: { label: string; chunks: number[] }[];
};

export const docs: Doc[] = [
  {
    id: 'smartai',
    title: 'SMART AI Chat',
    cluster: 'ai',
    anchor: 'work-smartai',
    skills: ['RAG', 'LangChain', 'OpenAI API', 'Python', 'FastAPI'],
    chunks: [
      "SMART AI Chat, a RAG-powered 311 chatbot for the City of Fort Wayne built with OpenAI and LangChain, answered residents' questions in plain language.",
      'A query cache served repeated resident questions.',
      "The chatbot's knowledge base was gradually populated with the information residents requested most.",
      'Built with very little documentation, through extensive reading and experimentation with retrieval-augmented generation and LLM tooling.',
    ],
  },
  {
    id: 'langchain',
    title: 'LangChain PR #19427',
    cluster: 'ai',
    anchor: 'work-langchain',
    skills: ['LangChain', 'Python', 'Pydantic'],
    chunks: ["Open source: fixed a Pydantic validation error in LangChain's GPTCache integration when handling chat-generation results; merged upstream in March 2024."],
  },
  {
    id: 'patternsmith',
    title: 'Patternsmith',
    cluster: 'ai',
    anchor: 'work-patternsmith',
    skills: ['LangGraph', 'LangChain', 'Python', 'Pydantic', 'vLLM', 'LM Studio', 'pytest', 'mypy --strict', 'Multi-agent'],
    chunks: [
      'Patternsmith turns a software design pattern or code smell into an illustrated programming tutorial with prose, idiomatic code and Mermaid diagrams, published as a Hugo static site.',
      'A LangGraph multi-agent pipeline: research and teaching, code generation and writing stages over one typed Pydantic state, followed by a separate Mermaid diagram-validation tool step.',
      'The article reuses generated code verbatim, and additional checks flag specific inconsistencies between code and diagrams.',
      'Malformed JSON enters a bounded LLM repair-retry loop, and invalid Mermaid diagrams enter a bounded fix loop validated with the mmdc CLI.',
      'Per-topic failure isolation lets a batch continue when one topic fails; type-checked with mypy strict and tested offline with mock models.',
      'Supports hosted APIs and local model serving through vLLM and LM Studio, including quantized-model serving and multi-token prediction in LM Studio.',
    ],
  },
  {
    id: 'documan',
    title: 'Documan',
    cluster: 'systems',
    anchor: 'work-documan',
    skills: ['Python', 'Flask', 'PostgreSQL', 'Meilisearch', 'Java', 'Spring Boot', 'Angular', 'Redis', 'Docker Compose', 'OAuth2 / JWT', 'Testcontainers', 'Nginx'],
    eras: [
      { label: 'Original platform', chunks: [1, 2, 3] },
      { label: 'Current rewrite', chunks: [4, 5] },
    ],
    chunks: [
      'Documan is a searchable library for college course materials, available through the web and a Telegram bot.',
      'The original Python and Flask platform served 4,000+ students and delivered 200,000+ files before its retirement in May 2025.',
      'Local reads: the original platform hydrated a local SQLite read copy from PostgreSQL on boot, removing a transcontinental database round trip.',
      'Background writes: database and metrics writes moved onto a queue-backed worker so handlers returned without blocking; catalog refresh ran separately from serving.',
      'The Java and Angular rewrite adds four-tier role-based access control with Clerk-issued JWTs, Redis caching and Cloudflare R2 storage. It is public and has no users yet.',
      'In the rewrite, a transactional outbox keeps Meilisearch search aligned with PostgreSQL, so a rolled-back write is never indexed.',
    ],
  },
  {
    id: 'hikari',
    title: 'Hikari',
    cluster: 'systems',
    anchor: 'work-hikari',
    skills: ['Rust', 'Tokio', 'Axum', 'WebSockets', 'PostgreSQL', 'Docker', 'Docker Compose'],
    chunks: [
      'Hikari keeps container deployments consistent across machines: one declarative configuration describes what runs where, and agents on each machine apply updates.',
      'Each agent compares incoming configuration with its last-applied state and updates only the affected Docker Compose stacks, leaving unrelated services running.',
      'The agent-server mode, written in async Rust with Tokio and Axum, pushes updates over persistent WebSocket connections; disconnected agents reconnect automatically.',
    ],
  },
  {
    id: 'oaam',
    title: 'OAAM',
    cluster: 'ai',
    anchor: 'work-oaam',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MCP', 'Podman AI Lab', 'Local inference'],
    chunks: [
      "OAAM extracts document data with local AI: documents are processed on the user's machine through a browser interface.",
      'A local vision model, Llama 3.2 Vision 11B served through Podman AI Lab, reads an invoice and returns structured data.',
      'An optional MCP integration sends extracted results to Google Sheets. Won Best Podman Container Implementation and People\'s Choice.',
    ],
  },
  {
    id: 'activity',
    title: 'Activity Visualizer',
    cluster: 'product',
    anchor: 'more-activity',
    skills: ['TypeScript', 'React', 'MapLibre GL', 'WebCodecs', 'Web Workers', 'Cloudflare', 'Vitest', 'Data visualization'],
    chunks: [
      'Activity Visualizer turns GPX and TCX exports into performance analysis, 3D route flyovers and shareable videos, with privacy zones near the start and finish.',
      'A data-review step repairs GPS jumps and drift, filters faulty heart-rate readings and checks altitude against terrain elevation.',
      'Flyover videos render in the browser with WebCodecs, and bulk imports are parsed in parallel by Web Workers; a Cloudflare Worker proxies map tiles.',
    ],
  },
  {
    id: 'training',
    title: 'Training Story',
    cluster: 'product',
    anchor: 'more-training',
    skills: ['React', 'D3.js', 'Playwright', 'Cloudflare', 'Data visualization'],
    chunks: [
      'Training Story turns a Hevy workout export into exercise trends, personal records, comparisons and an interactive data visualization story, processed in the browser.',
      'One analytics engine keeps every view consistent; calculation tests use hand-computed expectations and Playwright exercises the production build.',
    ],
  },
  {
    id: 'perf',
    title: 'Nebulogic: performance',
    cluster: 'systems',
    anchor: 'exp-swe',
    skills: ['Redis', 'Nginx', 'Cloudflare', 'OpenTelemetry', 'Performance'],
    chunks: [
      "Cut the core CRM product's startup from 20 seconds to 200 milliseconds with Redis pipelining that batches cache-warmup writes; Redis Pub/Sub propagates config across instances.",
      'Cut page load from 30 seconds to 7 seconds with Brotli and Gzip compression and a smaller JavaScript bundle, plus backend response compression.',
      'Reduced origin load by up to 70% with Cloudflare CDN proxying and tuned Nginx caching; instrumented services with OpenTelemetry tracing and metrics for observability.',
    ],
  },
  {
    id: 'cicd',
    title: 'Nebulogic: deployment',
    cluster: 'systems',
    anchor: 'exp-intern',
    skills: ['Docker', 'GitLab CI'],
    chunks: [
      'Built reproducible CI/CD deployment automation with Docker multi-stage builds on GitLab CI across 40+ services.',
      'Upgraded GitLab from v14 to v16 with every repository and pipeline intact, plus performance tuning and disaster recovery.',
    ],
  },
  {
    id: 'autodeploy',
    title: 'Autodeploy',
    cluster: 'systems',
    anchor: 'more-autodeploy',
    skills: ['Rust', 'Docker', 'Docker Compose'],
    chunks: ['Autodeploy is an interactive Rust CLI for deployment automation: it prepares repositories through libgit2 and generates Docker Compose from one reusable TOML configuration.'],
  },
  {
    id: 'obslab',
    title: 'Observability lab',
    cluster: 'systems',
    anchor: 'more-obslab',
    skills: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Spring Boot'],
    chunks: ['A local Spring Boot observability lab: OpenTelemetry, Prometheus, Tempo, Loki and Grafana connect a metric spike to the relevant request trace and logs.'],
  },
  {
    id: 'nixos',
    title: 'NixOS configuration',
    cluster: 'systems',
    anchor: 'more-nixos',
    skills: ['NixOS', 'Linux'],
    chunks: ['Version-controlled NixOS configuration for reproducible personal development environments.'],
  },
  {
    id: 'homelab',
    title: 'Home networking',
    cluster: 'systems',
    anchor: 'more-network',
    skills: ['Nginx', 'Docker', 'Linux', 'Cloudflare'],
    chunks: ['Personal networking setups for remote access with Cloudflare Tunnel, DNS filtering with AdGuard Home, and encrypted DNS over HTTPS and TLS.'],
  },
  {
    id: 'cs5610',
    title: 'CS5610 social network',
    cluster: 'product',
    anchor: 'more-cs5610',
    skills: ['TypeScript', 'React', 'Next.js', 'NestJS', 'MongoDB'],
    chunks: ['Team project: contributed Algolia search, filtering and pagination to a Next.js social platform, plus NestJS and MongoDB backend story and comment features.'],
  },
  {
    id: 'fetal',
    title: 'Fetal Health Classification',
    cluster: 'academic',
    anchor: 'more-fetal',
    skills: ['Python', 'Flask', 'Angular', 'Docker'],
    chunks: ['Academic capstone: a machine learning classifier for fetal health risk from cardiotocogram data, comparing KNN and logistic regression, served by Flask and Angular in Docker.'],
  },
  {
    id: 'iot',
    title: 'IoT Grain Silo Monitoring',
    cluster: 'academic',
    anchor: 'more-iot',
    skills: [],
    chunks: ['Academic IoT project: an ESP32 tracks CO2, humidity and temperature in grain silos and reports through a REST API to Google Apps Script, which sends alerts.'],
  },
  {
    id: 'braintumor',
    title: 'Brain Tumor Detection',
    note: 'Guided academic project',
    cluster: 'academic',
    anchor: 'more-braintumor',
    skills: ['Python', 'Flask'],
    chunks: ['Guided five-person academic project: a CNN image classifier for MRI scans with an augmentation pipeline and a Flask interface.'],
  },
  {
    id: 'ta',
    title: 'Graduate TA, CS4530',
    cluster: 'teaching',
    anchor: 'exp-ta',
    skills: ['React', 'Vitest', 'Playwright'],
    chunks: [
      'Supported 250+ students weekly across labs and office hours for Fundamentals of Software Engineering, guiding React, React Hooks and component-based frontend architecture.',
      'Mentored 60+ students on MVC architecture, unit testing with Vitest, usability testing with Playwright and mocking strategies.',
    ],
  },
];

export const suggestedQueries = ['RAG', 'local models', 'backend', 'deployment automation', 'observability', 'data visualization', 'multi-agent', 'search'];

export const clusterLabels: Record<Cluster, string> = { ai: 'AI', systems: 'Systems', product: 'Product', teaching: 'Teaching', academic: 'Academic' };

/* Copy for the Explore section. `{n}`-style tokens are filled in the browser. */
export const queryCopy = {
  title: 'Find your way through the work',
  lede: 'Looking for a particular technology or problem? Search the projects and roles below, then follow a result to the details.',
  inputLabel: 'Search my work',
  placeholder: 'Search backend, deployment, RAG…',
  suggestedLabel: 'Suggested queries',
  idle: 'Choose a topic or enter a search to begin',
  meta: '{docs} of {total} projects and roles · {passages} matching passages',
  timing: '{ms} ms in your browser',
  matched: 'matched',
  relatedTitle: 'Matched through a related term',
  more: { one: '1 more matching passage', many: '{n} more matching passages' },
  empty: 'Nothing matched. Try “backend”, “Redis” or “data visualization”.',
  keys: '↑ ↓ to move through results · esc to return to search',
  howSummary: 'How this search works',
  how: 'Browser-local keyword retrieval: each passage is a TF-IDF vector built when the site is compiled. Your query is analysed the same way, expanded with a short list of related terms, and ranked by cosine similarity over {chunks} passages. Results are grouped by project and ranked by their best passage. The map combines text similarity with category grouping; distances are illustrative.',
  mapBar: 'map of the work',
  mapLabel: 'Illustrative 3D map of my work. Each point is a passage, grouped by project. The result list beside it is the accessible equivalent.',
  mapCaption: '{chunks} passages · {docs} projects and roles · distances are illustrative · drag to rotate, click a point to open it',
  queryNode: 'query',
};

/* ------------------------------------------------------------------------ */
/* Skills in practice: intensity = number of listed examples                */
/* ------------------------------------------------------------------------ */

export const skillRows: { label: string; skills: string[] }[] = [
  { label: 'AI & LLMs', skills: ['RAG', 'LangChain', 'LangGraph', 'Multi-agent', 'OpenAI API', 'vLLM', 'LM Studio', 'Local inference', 'MCP', 'Pydantic', 'Podman AI Lab'] },
  { label: 'Languages', skills: ['Python', 'Rust', 'TypeScript', 'Java'] },
  { label: 'Backend', skills: ['FastAPI', 'Flask', 'Spring Boot', 'Axum', 'Tokio', 'Node.js', 'Express', 'NestJS', 'WebSockets', 'OAuth2 / JWT'] },
  { label: 'Data', skills: ['PostgreSQL', 'Redis', 'Meilisearch', 'MongoDB'] },
  { label: 'Infrastructure', skills: ['Docker', 'Docker Compose', 'GitLab CI', 'Nginx', 'Cloudflare', 'NixOS', 'Linux', 'Performance'] },
  { label: 'Observability', skills: ['OpenTelemetry', 'Prometheus', 'Grafana'] },
  { label: 'Frontend', skills: ['React', 'Angular', 'Next.js', 'D3.js', 'MapLibre GL', 'WebCodecs', 'Web Workers', 'Data visualization'] },
  { label: 'Testing', skills: ['pytest', 'mypy --strict', 'Vitest', 'Playwright', 'Testcontainers'] },
];

export const skillsCopy = {
  title: 'The tools behind the work',
  lede: 'Select a technology to see where I’ve used it. Each number counts the projects and roles listed here.',
  bar: 'skills in practice · {n} technologies',
  groupLabel: 'Skills, grouped by area. Use the arrow keys to move between skills.',
  chipLabel: { one: '{skill}, 1 listed example', many: '{skill}, {n} listed examples' },
  usedIn: { one: 'Used in 1 listed example', many: 'Used in {n} listed examples' },
  alongside: 'Used alongside',
  none: 'Not used alongside any other listed skill.',
};

/* ------------------------------------------------------------------------ */
/* Experience                                                               */
/* ------------------------------------------------------------------------ */

export type Role = { anchor: string; title: string; org: string; period: string; points: string[] };

export const experienceCopy = {
  title: 'Experience, from building to teaching',
};

export const roles: Role[] = [
  {
    anchor: 'exp-ta',
    title: 'Graduate Teaching Assistant, CS4530: Fundamentals of Software Engineering',
    org: 'Northeastern University, Khoury College of Computer Sciences',
    period: 'Sep 2026 - present',
    points: [
      'Support 250+ students weekly across labs and office hours, with hands-on guidance on React, React Hooks and component-based architecture.',
      'Mentor 60+ students on MVC architecture, unit testing with Vitest, usability testing with Playwright, and mocking strategies.',
    ],
  },
  {
    anchor: 'exp-swe',
    title: 'Software Engineer',
    org: 'Nebulogic Technologies, Hyderabad',
    period: 'Jun 2023 - Jul 2025',
    points: [
      'Built SMART AI Chat, a RAG chatbot for the City of Fort Wayne’s 311 service, with a query cache and a knowledge base expanded around what residents asked most.',
      'Cut the core CRM product’s startup from 20 seconds to 200 milliseconds with Redis pipelining; Redis Pub/Sub propagates config without restarts.',
      'Cut page load from 30 seconds to 7 seconds with Brotli/Gzip compression and a 60% smaller bundle.',
      'Reduced origin load by up to 70% with Cloudflare proxying and tuned Nginx caching, and added OpenTelemetry tracing and metrics.',
    ],
  },
  {
    anchor: 'exp-intern',
    title: 'Software Engineer Intern',
    org: 'Nebulogic Technologies, Hyderabad',
    period: 'Jun 2022 - Jun 2023',
    points: [
      'Built reproducible CI/CD with Docker multi-stage builds on GitLab CI across 40+ services.',
      'Upgraded GitLab from v14 to v16 with every repository and pipeline intact, plus performance tuning and disaster recovery.',
      'Moved team documentation to a Hugo site so non-engineers could contribute.',
    ],
  },
  {
    anchor: 'exp-web',
    title: 'Web Administrator',
    org: 'Geethanjali College of Engineering and Technology, Hyderabad',
    period: 'Dec 2021 - May 2023',
    points: [
      'Maintained the official college portal for 7,000+ students and alumni.',
      'Built 6+ event and conference sites, including VIBGYOR and BHASWARA.',
      'Built a content automation tool on the Telegram Bot API, Blogger and the Google Drive API.',
    ],
  },
];

export const outcomes = [
  { label: 'CRM startup', value: '20 seconds → 200 milliseconds', role: 'Software Engineer, Nebulogic' },
  { label: 'Page load', value: '30 seconds → 7 seconds', role: 'Software Engineer, Nebulogic' },
  { label: 'Origin load', value: 'Reduced by up to 70%', role: 'Software Engineer, Nebulogic' },
  { label: 'CI/CD', value: 'Across 40+ services', role: 'Software Engineer Intern, Nebulogic' },
  { label: 'Teaching', value: '250+ students supported weekly', role: 'Graduate TA, Northeastern' },
];

/* ------------------------------------------------------------------------ */
/* About                                                                    */
/* ------------------------------------------------------------------------ */

export const about = {
  title: 'About me',
  intro:
    'I started Documan as an electronics engineering student who wanted a better way to share course materials. At Nebulogic, that interest grew into work on backend systems, deployment tools, and a city-service chatbot. Today, I’m studying computer science at Northeastern and teaching software engineering, while building projects across applied AI, infrastructure, and data visualization.',
  interests: ['Applied AI and LLM systems', 'Backend engineering', 'Infrastructure and deployment', 'Data visualization'],
  coursework: [
    { code: 'CS5330', title: 'Pattern Recognition and Computer Vision' },
    { code: 'CS6140', title: 'Machine Learning' },
    { code: 'CS5800', title: 'Algorithms' },
    { code: 'CS5200', title: 'Database Management Systems' },
    { code: 'CS5610', title: 'Web Development' },
    { code: 'CS5010', title: 'Programming Design Paradigm' },
  ],
  education: [
    { name: 'Northeastern University', what: 'MS, Computer Science', when: 'Sep 2025 - May 2027 (expected)' },
    { name: 'Geethanjali College of Engineering and Technology', what: "Bachelor's, Electronics and Communication Engineering", when: 'Aug 2019 - May 2023' },
  ],
  awards: [
    { name: 'Best Podman Container Implementation', by: 'Red Hat / IBM · Pods, Prompts & Prototypes', when: '2026' },
    { name: 'People’s Choice', by: 'Red Hat / IBM · Pods, Prompts & Prototypes', when: '2026' },
    { name: 'AWS Certified AI Practitioner', by: 'Amazon Web Services', when: '2026' },
    { name: 'Best Employee of the Month (4 times)', by: 'Nebulogic Technologies', when: '2023 - 2024' },
    { name: 'INNOVADOR 2.0, First Place', by: 'Bhaswara 2023 paper presentation', when: '2023' },
    { name: 'Microsoft Certified: Azure Fundamentals (AZ-900)', by: 'Microsoft', when: '2023' },
    { name: '3rd Place, TECHEXPO 2022', by: 'IEEE GCET Student Branch', when: '2022' },
    { name: '2nd Place, Inter-University Ideathon', by: 'IEEE SSIT SBC, GCET', when: '2021' },
  ],
  publication: {
    title: 'IOT based Smart Food Grain Storage Monitoring System for Silos using Google Apps Script',
    venue: 'Prime Scientific Journal (PSEN), 2023',
    note: 'Published under my legal name, Mudumby Kalyana Ramanuja Swami',
    url: 'https://primerascientific.com/journals/psen/PSEN-02-050',
  },
  leadership: ['Vice Chair, Technical Activities, IEEE Signal Processing Society, GCET', 'Entrepreneur Leader, National Entrepreneurship Network'],
  writing: [
    { title: 'Scale VM management with Hikari’s agent-server', url: 'https://kalyanmudumby.com/post/scale-vm-management-with-hikari-agent-server/' },
    { title: 'Documan: a zero-cost digital library', url: 'https://kalyanmudumby.com/post/documan-zero-cost-digital-library/' },
    { title: 'Complete Spring Boot observability', url: 'https://kalyanmudumby.com/post/complete-springboot-observability/' },
    { title: 'Hassle-free deployments with Autodeploy', url: 'https://kalyanmudumby.com/post/hasslefree-deployments-with-autodeploy/' },
    { title: 'AdGuard with DoH and DoT', url: 'https://kalyanmudumby.com/post/complete-adguard-setup-doh-dot-dns/' },
  ],
};

/* ------------------------------------------------------------------------ */
/* Contact                                                                  */
/* ------------------------------------------------------------------------ */

export const contact = {
  title: 'Let’s build something useful',
  text: 'Have a role, a project, or a technical problem in mind? I’d like to hear about it.',
};

/* Chapters, in page order. */
export const chapters = [
  { id: 'top', label: 'Introduction' },
  { id: 'work', label: 'Featured work' },
  { id: 'experience', label: 'Experience' },
  { id: 'explore', label: 'Explore' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const blogCopy = {
  title: 'Blog',
  lede: 'Tutorials and write-ups, from Telegram bots and Android ROMs to self-hosting, deployment tools, observability and Nix.',
  all: 'All posts',
  back: 'All posts',
  latest: 'Latest post',
  minutes: '{n} min read',
  writeup: '{name} write-up',
};
