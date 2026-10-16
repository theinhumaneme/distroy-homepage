/*
 * Curated site copy.
 *
 * Every fact here comes from kalyan-mudumby.profile.json (the private,
 * gitignored source of truth) and respects its claimRules. When editing:
 * reuse highlight text, never add metrics, and keep each claim attached to a
 * source so it renders with a citation. `npm run guard` checks the built HTML
 * for phrases the profile forbids.
 */

export const person = {
  name: 'Kalyan Mudumby',
  role: 'Applied-AI engineer',
  location: 'Boston, MA',
  email: 'mudumby.k@northeastern.edu',
  github: 'https://github.com/theinhumaneme',
  linkedin: 'https://linkedin.com/in/kalyan-mudumby',
  blog: 'https://kalyanmudumby.com/',
  modelId: 'kalyan-mudumby',
  version: 'v2026.10',
};

/* ------------------------------------------------------------------------ */
/* Sources: every [n] chip on the page resolves to one of these.            */
/* ------------------------------------------------------------------------ */

export type Source = { id: string; label: string; detail: string; url?: string };

export const sources: Source[] = [
  { id: 'documan-v1', label: 'Documan, production era', detail: 'Flask + Telegram bot, Jun 2020 - May 2025', url: 'https://kalyanmudumby.com/post/documan-zero-cost-digital-library/' },
  { id: 'gctc', label: 'Web Administrator, GCET', detail: 'College web portal, Dec 2021 - May 2023' },
  { id: 'smartai', label: 'SMART AI Chat', detail: 'Nebulogic Technologies, Software Engineer' },
  { id: 'langchain', label: 'langchain-ai/langchain#19427', detail: 'Merged 2024-03-26', url: 'https://github.com/langchain-ai/langchain/pull/19427' },
  { id: 'patternsmith', label: 'theinhumaneme/patternsmith', detail: 'MIT, public', url: 'https://github.com/theinhumaneme/patternsmith' },
  { id: 'oaam', label: 'OAAM, Red Hat / IBM hackathon', detail: 'Pods, Prompts & Prototypes, Boston, 2026' },
  { id: 'nebu-perf', label: 'Nebulogic, Software Engineer', detail: 'Jun 2023 - Jul 2025' },
  { id: 'nebu-intern', label: 'Nebulogic, Software Engineer Intern', detail: 'Jun 2022 - Jun 2023' },
  { id: 'hikari', label: 'theinhumaneme/hikari', detail: '9 tagged releases, MIT', url: 'https://github.com/theinhumaneme/hikari' },
  { id: 'documan-v2', label: 'theinhumaneme/documan-public-release', detail: 'Java 25 / Angular 21 rewrite, MIT', url: 'https://github.com/theinhumaneme/documan-public-release' },
  { id: 'activity', label: 'activity-visualizer.distroy.dev', detail: 'Live site', url: 'https://activity-visualizer.distroy.dev' },
  { id: 'training', label: 'theinhumaneme/hevy-visualizer', detail: 'Training Story, live at hevy-visualizer.distroy.dev', url: 'https://github.com/theinhumaneme/hevy-visualizer' },
  { id: 'ta', label: 'Graduate TA, CS4530', detail: 'Khoury College, Northeastern, Sep 2026 -' },
  { id: 'autodeploy', label: 'theinhumaneme/autodeploy', detail: 'Rust CLI', url: 'https://github.com/theinhumaneme/autodeploy' },
  { id: 'obslab', label: 'Spring Boot observability, tutorial', detail: 'kalyanmudumby.com', url: 'https://kalyanmudumby.com/post/complete-springboot-observability/' },
  { id: 'nixos', label: 'theinhumaneme/nixos', detail: '~419 authored commits', url: 'https://github.com/theinhumaneme/nixos' },
  { id: 'homelab', label: 'Encrypted DNS homelab, tutorial', detail: 'kalyanmudumby.com', url: 'https://kalyanmudumby.com/post/complete-adguard-setup-doh-dot-dns/' },
  { id: 'cs5610', label: 'CS5610 social network (team)', detail: 'Northeastern coursework', url: 'https://github.com/theinhumaneme/social-network-webdev-final-project' },
  { id: 'paper', label: 'IoT grain-silo monitoring, PSEN', detail: 'DOI 10.56831/PSEN-02-050', url: 'https://primerascientific.com/journals/psen/PSEN-02-050' },
  { id: 'aws', label: 'AWS Certified AI Practitioner', detail: 'Amazon Web Services, Aug 2026' },
];

export const citeIndex = (id: string): number => {
  const i = sources.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`Unknown source "${id}"`);
  return i + 1;
};

/* ------------------------------------------------------------------------ */
/* 00 Prompt                                                                */
/* ------------------------------------------------------------------------ */

export const hero = {
  prompt: 'who is kalyan mudumby?',
  thesisA: 'The model is',
  thesisB: 'probabilistic.',
  thesisC: 'The system around it',
  thesisD: "shouldn't be.",
  intro:
    "I'm an applied-AI engineer who builds the part most demos skip: the retrieval, caching, validation, serving and infrastructure that let LLMs hold up in front of real users.",
  meta: ['Boston, MA', 'MS CS, Northeastern (2027)', '3 yrs shipping production systems'],
};

/* ------------------------------------------------------------------------ */
/* 01 Tokenize: origin                                                      */
/* ------------------------------------------------------------------------ */

export const origin = {
  title: ['It started with', 'a library.'],
  // Tokenized at build time with o200k_base and rendered token by token.
  text:
    "In June 2020, as an electronics undergrad in Hyderabad, I built Documan: a digital library for my college where every subject has an address (department, year, semester) and everything filed under it lives there. Students reached it through a web app and a Telegram bot. I designed it, ran it, and kept it up. Shipping, it turned out, is where the work starts.",
  stats: [
    { value: '4,000+', label: 'students served', src: 'documan-v1' },
    { value: '200,000+', label: 'file deliveries', src: 'documan-v1' },
    { value: '1,200+', label: 'active users', src: 'documan-v1' },
    { value: '99%+', label: 'uptime', src: 'documan-v1' },
  ],
  span: 'Jun 2020 - May 2025 · Flask, PostgreSQL, Meilisearch, python-telegram-bot',
  aside:
    'Alongside it I maintained the official college portal for 7,000+ students and alumni and built 6+ event and conference sites.',
  asideSrc: 'gctc',
};

/* ------------------------------------------------------------------------ */
/* Evidence documents: what the embedding space, skills matrix and query    */
/* engine are computed from. Each chunk is a sentence lifted from the       */
/* profile's verified highlights.                                           */
/* ------------------------------------------------------------------------ */

export type Cluster = 'ai' | 'systems' | 'product' | 'teaching';

export type Doc = {
  id: string;
  title: string;
  cluster: Cluster;
  anchor: string; // in-page anchor the query results jump to
  src: string;
  skills: string[];
  chunks: string[];
};

export const docs: Doc[] = [
  {
    id: 'smartai',
    title: 'SMART AI Chat',
    cluster: 'ai',
    anchor: 'doc-smartai',
    src: 'smartai',
    skills: ['RAG', 'LangChain', 'OpenAI API', 'Python', 'FastAPI'],
    chunks: [
      "Built SMART AI Chat, a RAG-powered 311 chatbot for the City of Fort Wayne using OpenAI and LangChain to answer residents' questions in plain language.",
      'Implemented a query cache for repeated resident questions, so the questions people ask again and again are served from cache.',
      "Gradually populated the chatbot's knowledge base according to the information residents requested most, so the retrieval corpus grew with real demand.",
      'Delivered the chatbot with very little documentation to lean on, through extensive reading and experimentation with retrieval-augmented generation and LLM tooling.',
    ],
  },
  {
    id: 'langchain',
    title: 'LangChain PR #19427',
    cluster: 'ai',
    anchor: 'doc-smartai',
    src: 'langchain',
    skills: ['LangChain', 'Python', 'Pydantic'],
    chunks: [
      "Open source: fixed a Pydantic validation error in LangChain's GPTCache integration where ChatOpenAI returns a ChatGeneration the LLM cache lookup did not handle; merged upstream on 2024-03-26.",
    ],
  },
  {
    id: 'patternsmith',
    title: 'Patternsmith',
    cluster: 'ai',
    anchor: 'doc-patternsmith',
    src: 'patternsmith',
    skills: ['LangGraph', 'LangChain', 'Python', 'Pydantic', 'vLLM', 'LM Studio', 'pytest', 'mypy --strict', 'Hugo', 'Multi-agent'],
    chunks: [
      'Patternsmith is a multi-agent LLM pipeline that turns a topic into a publication-ready tutorial on design patterns, code smells and programming fundamentals, with prose, idiomatic code and Mermaid diagrams, published as a Hugo static site.',
      'Orchestrated as a LangGraph multi-agent flow, research and teaching then code then writing then Mermaid validation, over a single typed Pydantic state.',
      'Single source of truth: the Code agent owns the code and the Writing agent embeds it verbatim, so prose, code and diagrams never drift apart.',
      'Model-agnostic: the same pipeline runs against hosted APIs or local models through an OpenAI-compatible interface; local models were served with vLLM and LM Studio, including a quantized model with multi-token prediction in LM Studio.',
      'Hardened against unreliable model output with tolerant JSON-envelope parsing and an LLM repair-retry loop of up to four attempts.',
      'Mermaid diagrams are validated with the mmdc CLI in a fix-and-retry loop that degrades gracefully when the renderer is missing.',
      'Deterministic content guards catch charset corruption and diagram-versus-code mismatches, and per-topic failure isolation means one bad topic never halts a batch run, all under mypy strict with offline mock-model tests.',
    ],
  },
  {
    id: 'oaam',
    title: 'OAAM',
    cluster: 'ai',
    anchor: 'doc-oaam',
    src: 'oaam',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MCP', 'Podman AI Lab', 'Local inference'],
    chunks: [
      'OAAM, the Open Agent Applet Marketplace, is a local-first AI web app: drop a file and get structured data back, processed fully on-device with zero cloud dependency.',
      'Invoices are read by a vision model, Llama 3.2 Vision 11B, running locally through Podman AI Lab, and parsed into structured JSON with a re-prompt on malformed output.',
      'A plugin-based tool registry auto-discovers tools from folder conventions, with a shared TypeScript type system across frontend, backend and extension layers.',
      'An optional MCP extension syncs results to Google Sheets; everything else stays on the device. Won Best Podman Container Implementation and People\'s Choice.',
    ],
  },
  {
    id: 'hikari',
    title: 'Hikari',
    cluster: 'systems',
    anchor: 'doc-hikari',
    src: 'hikari',
    skills: ['Rust', 'Tokio', 'Axum', 'WebSockets', 'PostgreSQL', 'Docker', 'Docker Compose'],
    chunks: [
      'Hikari is an open-source GitOps platform in async Rust, a lightweight Kubernetes alternative that manages Docker workloads across VMs from a centralized declarative JSON control plane.',
      'A WebSocket agent-server architecture propagates config in real time across nodes with connection-based liveness, backed by PostgreSQL with compile-time-checked queries.',
      'Each agent reconciles its host against the last-applied declarative config and generates Docker Compose stacks with change detection, applying minimal updates.',
      'Config payloads are encrypted with AES-256-CBC under an RSA-4096 OAEP envelope; agents reconnect with exponential backoff. Nine tagged releases, 53 authored commits.',
    ],
  },
  {
    id: 'documan',
    title: 'Documan',
    cluster: 'systems',
    anchor: 'doc-documan',
    src: 'documan-v2',
    skills: ['Python', 'Flask', 'PostgreSQL', 'Meilisearch', 'Java', 'Spring Boot', 'Angular', 'Redis', 'Docker Compose', 'OAuth2 / JWT', 'Testcontainers', 'OpenTelemetry', 'Nginx'],
    chunks: [
      'Production era: architected and operated a digital library serving 4,000+ students with 200,000+ file deliveries and 1,200+ active users across a Flask web app and a Telegram bot, with 99%+ uptime.',
      'Production era: MeiliSearch full-text search, role-based access control scoped by department, year and semester, and Google Drive-backed file storage and delivery over a shared PostgreSQL user store.',
      'Rewrite: a Java 25 and Spring Boot 4.1 REST API with 12 controllers over 67 endpoints, Redis response caching, Cloudflare R2 storage, virtual threads, HTTP/2 and ETag revalidation.',
      'Rewrite: Meilisearch is kept in step with PostgreSQL through a transactional outbox, so nothing rolled back is ever indexed and search being down never fails a write.',
      'Rewrite: an OAuth2 resource server validating Clerk-issued JWTs with four ranked roles, and a reflection test that fails the build if any write endpoint ships without an authorization rule.',
      'Rewrite: an Angular 21 client on signals where every subject address is its URL, shipped with the API as one Docker Compose deployment where a TLS terminator is the whole attack surface.',
    ],
  },
  {
    id: 'perf',
    title: 'Nebulogic: performance',
    cluster: 'systems',
    anchor: 'doc-attend',
    src: 'nebu-perf',
    skills: ['Redis', 'Nginx', 'Cloudflare', 'OpenTelemetry', 'Performance'],
    chunks: [
      'Reduced cold-start latency 100x, from 20 seconds to 200 milliseconds, on the core CRM product via Redis pipelining that batches cache-warmup writes, with Redis Pub/Sub propagating config across running instances.',
      'Cut page load time 5x, from 30 seconds to 7 seconds, with Brotli and Gzip compression and a 60% smaller JavaScript bundle, plus backend response compression for large payloads.',
      'Cut origin load up to 70% with Cloudflare CDN proxying and tuned Nginx caching at an 80% static-asset cache-hit ratio; instrumented services with OpenTelemetry tracing and metrics.',
    ],
  },
  {
    id: 'cicd',
    title: 'Nebulogic: delivery',
    cluster: 'systems',
    anchor: 'doc-attend',
    src: 'nebu-intern',
    skills: ['Docker', 'GitLab CI', 'Hugo'],
    chunks: [
      'Built reproducible CI/CD with Docker multi-stage builds on GitLab CI across 40+ services, reducing deployment variance across environments.',
      'Upgraded GitLab across two major versions, v14 to v16, keeping every repository and pipeline working, with performance tuning and disaster recovery from backups.',
    ],
  },
  {
    id: 'gis',
    title: 'Fort Wayne 311 GIS',
    cluster: 'product',
    anchor: 'doc-attend',
    src: 'nebu-perf',
    skills: ['ArcGIS'],
    chunks: [
      "Integrated multiple Esri ArcGIS layers for data collection in Nebulogic's 311 product for the City of Fort Wayne, combined with other city providers to give citizens precise trash-collection locations.",
    ],
  },
  {
    id: 'activity',
    title: 'Activity Visualizer',
    cluster: 'product',
    anchor: 'doc-visualizers',
    src: 'activity',
    skills: ['TypeScript', 'React', 'MapLibre GL', 'WebCodecs', 'Web Workers', 'Cloudflare', 'Vitest'],
    chunks: [
      'Activity Visualizer turns GPX and TCX fitness exports into performance analysis, 3D route flyovers and a training library; files stay in the browser and privacy zones hide locations near the start and finish.',
      'Repairs GPS jumps and start-finish drift, filters faulty heart-rate readings and checks device altitude against terrain elevation before analysing grade-adjusted pace, climbs, intervals and best efforts.',
      'Renders shareable MP4 flyover videos in the browser with WebCodecs, ingests up to 5,000 files with a crash-recovering Web Worker pool, and proxies map tiles through an edge-cached Cloudflare Worker.',
    ],
  },
  {
    id: 'training',
    title: 'Training Story',
    cluster: 'product',
    anchor: 'doc-visualizers',
    src: 'training',
    skills: ['React', 'D3.js', 'Playwright', 'Cloudflare', 'Data visualization'],
    chunks: [
      'Training Story turns Hevy workout CSV exports into interactive dashboards and a scroll-animated year-in-review story, parsed and analysed in browser memory without accounts or workout uploads.',
      'One analytics engine cleans and deduplicates workouts and calculates training volume, estimated one-rep max, personal records, streaks and sets per muscle; calculation tests use hand-computed expectations and Playwright exercises the production build.',
    ],
  },
  {
    id: 'autodeploy',
    title: 'Autodeploy',
    cluster: 'systems',
    anchor: 'doc-index',
    src: 'autodeploy',
    skills: ['Rust', 'Docker', 'Docker Compose'],
    chunks: [
      'Autodeploy is an interactive Rust CLI that automates Git and Docker workflows through libgit2 and generates Docker Compose from a TOML configuration.',
    ],
  },
  {
    id: 'obslab',
    title: 'Observability lab',
    cluster: 'systems',
    anchor: 'doc-index',
    src: 'obslab',
    skills: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Spring Boot'],
    chunks: [
      'A local end-to-end observability lab for a Spring Boot service: OpenTelemetry agent to Collector to Prometheus, Tempo and Loki, with trace, metric and log correlation and RED dashboards in Grafana, published as a tutorial.',
    ],
  },
  {
    id: 'nixos',
    title: 'NixOS configuration',
    cluster: 'systems',
    anchor: 'doc-index',
    src: 'nixos',
    skills: ['NixOS', 'Linux'],
    chunks: [
      'Maintained a declarative NixOS workstation and system configuration across roughly 419 authored commits, covering reproducible environment setup and automation.',
    ],
  },
  {
    id: 'homelab',
    title: 'Encrypted DNS homelab',
    cluster: 'systems',
    anchor: 'doc-index',
    src: 'homelab',
    skills: ['Nginx', 'Docker', 'Linux', 'Cloudflare'],
    chunks: [
      'Configured encrypted DNS for a home network with AdGuard Home behind Nginx in Docker, Let\'s Encrypt certificates and UFW, DoH on 443 and DoT on 853, keeping plaintext DNS inside the LAN.',
    ],
  },
  {
    id: 'cs5610',
    title: 'CS5610 social network',
    cluster: 'product',
    anchor: 'doc-index',
    src: 'cs5610',
    skills: ['TypeScript', 'React', 'Next.js', 'NestJS', 'MongoDB', 'OAuth2 / JWT'],
    chunks: [
      'Contributed search, filtering and pagination with Algolia-backed discovery to a team-built Next.js social platform, plus NestJS and MongoDB story and comment CRUD and blocked-user handling in JWT session logic.',
    ],
  },
  {
    id: 'ta',
    title: 'Graduate TA, CS4530',
    cluster: 'teaching',
    anchor: 'doc-attend',
    src: 'ta',
    skills: ['React', 'Vitest', 'Playwright', 'Teaching'],
    chunks: [
      'Supported 250+ students weekly across labs and office hours for Fundamentals of Software Engineering, with hands-on guidance on React, React Hooks and component-based architecture.',
      'Mentored 60+ students on MVC architecture, unit testing with Vitest, usability testing with Playwright and mocking strategies.',
    ],
  },
];

/* ------------------------------------------------------------------------ */
/* 02 Embed: skill dimensions. Brightness = number of docs above that list  */
/* the skill. Only skills with at least one doc are shown.                  */
/* ------------------------------------------------------------------------ */

export const skillRows: { label: string; skills: string[] }[] = [
  { label: 'LLMs & AI', skills: ['RAG', 'LangChain', 'LangGraph', 'Multi-agent', 'OpenAI API', 'vLLM', 'LM Studio', 'Local inference', 'MCP', 'Pydantic', 'Podman AI Lab'] },
  { label: 'Languages', skills: ['Python', 'Rust', 'TypeScript', 'Java'] },
  { label: 'Backend', skills: ['FastAPI', 'Flask', 'Spring Boot', 'Axum', 'Tokio', 'Node.js', 'Express', 'NestJS', 'WebSockets', 'OAuth2 / JWT'] },
  { label: 'Data', skills: ['PostgreSQL', 'Redis', 'Meilisearch', 'MongoDB'] },
  { label: 'Infra', skills: ['Docker', 'Docker Compose', 'GitLab CI', 'Nginx', 'Cloudflare', 'NixOS', 'Linux', 'Performance'] },
  { label: 'Observability', skills: ['OpenTelemetry', 'Prometheus', 'Grafana'] },
  { label: 'Frontend', skills: ['React', 'Angular', 'Next.js', 'D3.js', 'MapLibre GL', 'WebCodecs', 'Web Workers', 'Data visualization'] },
  { label: 'Quality', skills: ['pytest', 'mypy --strict', 'Vitest', 'Playwright', 'Testcontainers'] },
];

/* ------------------------------------------------------------------------ */
/* 03 Query: suggested prompts                                              */
/* ------------------------------------------------------------------------ */

export const suggestedQueries = ['RAG', 'local models', 'multi-agent', 'Rust', 'make it faster', 'privacy', 'search', 'reliability'];

/* ------------------------------------------------------------------------ */
/* 04 Retrieve: case studies                                                */
/* ------------------------------------------------------------------------ */

export type Case = {
  id: string;
  anchor: string;
  slug: string;
  org: string;
  period: string;
  title: string;
  kicker: string;
  body: string;
  points: { text: string; src: string }[];
  stack: string[];
  links: { label: string; url: string }[];
  viz: 'rag' | 'graph' | 'device' | 'fleet' | 'checkpoint' | 'visualizers';
  badges?: string[];
};

export const cases: Case[] = [
  {
    id: 'smartai',
    anchor: 'doc-smartai',
    slug: 'smart-ai-chat',
    org: 'Nebulogic · City of Fort Wayne',
    period: '2023 - 2025',
    title: 'SMART AI Chat',
    kicker: 'A city’s questions, answered in plain language.',
    body:
      'A RAG chatbot for Fort Wayne’s 311 service. There was very little documentation for what we were building, so the team learned it by reading and experimenting until it worked. Then we cached repeat questions and let the knowledge base grow with what residents actually asked.',
    points: [
      { text: 'Retrieval-augmented answers over city information using OpenAI and LangChain.', src: 'smartai' },
      { text: 'A query cache serves the questions residents ask again and again.', src: 'smartai' },
      { text: 'The knowledge base grew from demand: it was populated with the information residents asked for most.', src: 'smartai' },
      { text: 'When LangChain’s GPTCache integration broke on ChatGeneration results, I fixed it upstream. Merged.', src: 'langchain' },
    ],
    stack: ['Python', 'LangChain', 'OpenAI API', 'RAG', 'FastAPI'],
    links: [{ label: 'PR #19427 · merged', url: 'https://github.com/langchain-ai/langchain/pull/19427' }],
    viz: 'rag',
  },
  {
    id: 'patternsmith',
    anchor: 'doc-patternsmith',
    slug: 'patternsmith',
    org: 'Personal · open source (MIT)',
    period: '2026',
    title: 'Patternsmith',
    kicker: 'Small models are unreliable. Design for it.',
    body:
      'A LangGraph pipeline that writes publication-ready programming tutorials (prose, idiomatic code and Mermaid diagrams) and publishes them as a static site. The interesting part is everything that keeps a model honest along the way.',
    points: [
      { text: 'Four agents over one typed Pydantic state: research & teaching → code → writing → Mermaid validation.', src: 'patternsmith' },
      { text: 'The Code agent is the single source of truth; its code is embedded verbatim, so prose and diagrams cannot drift.', src: 'patternsmith' },
      { text: 'Tolerant JSON parsing with a repair-retry loop (up to 4 attempts) and a diagram fix loop validated by mmdc (up to 5).', src: 'patternsmith' },
      { text: 'Runs against hosted APIs or local models: served through vLLM and LM Studio, including a quantized model with multi-token prediction.', src: 'patternsmith' },
    ],
    stack: ['Python 3.11', 'LangGraph', 'Pydantic v2', 'vLLM', 'LM Studio', 'mypy --strict', 'pytest', 'Hugo'],
    links: [
      { label: 'patternsmith.distroy.dev', url: 'https://patternsmith.distroy.dev' },
      { label: 'GitHub', url: 'https://github.com/theinhumaneme/patternsmith' },
    ],
    viz: 'graph',
  },
  {
    id: 'oaam',
    anchor: 'doc-oaam',
    slug: 'oaam',
    org: 'Red Hat / IBM · Pods, Prompts & Prototypes',
    period: '2026',
    title: 'OAAM',
    kicker: 'Your documents shouldn’t have to leave your machine.',
    body:
      'Most “AI automation” means uploading your files to someone else’s server. OAAM, the Open Agent Applet Marketplace, keeps the whole loop local: drop in a file, a vision model on your own machine reads it, and structured data comes back.',
    points: [
      { text: 'Invoices are read on-device by Llama 3.2 Vision 11B through Podman AI Lab, with zero cloud dependency.', src: 'oaam' },
      { text: 'A plugin registry discovers tools from folder conventions, with shared TypeScript types across frontend, backend and extension.', src: 'oaam' },
      { text: 'Malformed model output is re-prompted once, then parsed into a shared result schema.', src: 'oaam' },
      { text: 'The only thing that ever leaves the device is an optional MCP sync to Google Sheets.', src: 'oaam' },
    ],
    stack: ['React 18', 'TypeScript', 'Node.js', 'Express', 'MCP', 'Podman AI Lab'],
    links: [],
    badges: ['Best Podman Container Implementation', 'People’s Choice'],
    viz: 'device',
  },
  {
    id: 'hikari',
    anchor: 'doc-hikari',
    slug: 'hikari',
    org: 'Personal · open source (MIT)',
    period: 'Sep 2024 - Apr 2025',
    title: 'Hikari',
    kicker: 'A control plane small enough to understand.',
    body:
      'Kubernetes is a lot of machinery for a handful of VMs. Hikari is a GitOps platform in async Rust that manages Docker workloads from one declarative control plane, built and released alone.',
    points: [
      { text: 'A WebSocket agent-server architecture pushes config to every node in real time, with connection-based liveness.', src: 'hikari' },
      { text: 'Each agent reconciles its host against the last-applied declarative state and applies minimal Compose changes.', src: 'hikari' },
      { text: 'Payloads are sealed with AES-256-CBC under an RSA-4096 OAEP envelope; agents reconnect with exponential backoff.', src: 'hikari' },
      { text: 'Nine tagged releases and 53 commits, all mine.', src: 'hikari' },
    ],
    stack: ['Rust', 'Tokio', 'Axum', 'WebSockets', 'PostgreSQL', 'SQLx', 'Docker'],
    links: [
      { label: 'GitHub', url: 'https://github.com/theinhumaneme/hikari' },
      { label: 'Write-up', url: 'https://kalyanmudumby.com/post/scale-vm-management-with-hikari-agent-server/' },
    ],
    viz: 'fleet',
  },
  {
    id: 'documan',
    anchor: 'doc-documan',
    slug: 'documan',
    org: 'Personal · two checkpoints',
    period: '2020 - 2026',
    title: 'Documan',
    kicker: 'Same idea, two checkpoints.',
    body:
      'v1 is the Flask system that served my college for years. v2 is a rewrite from scratch in Java and Angular, built to the standard I hold now. They are kept apart on purpose: the production numbers belong to v1, and v2 is public code with no users yet.',
    points: [
      { text: 'v1: 4,000+ students, 200,000+ deliveries and 99%+ uptime over a web app and a Telegram bot.', src: 'documan-v1' },
      { text: 'v2: Java 25 / Spring Boot 4.1 API with 67 endpoints, Redis caching, R2 storage and virtual threads.', src: 'documan-v2' },
      { text: 'v2: a transactional outbox keeps Meilisearch in step with PostgreSQL. A rolled-back write is never indexed.', src: 'documan-v2' },
      { text: 'v2: Clerk JWTs, four ranked roles, and a test that fails the build if a write endpoint ships unauthorized.', src: 'documan-v2' },
    ],
    stack: ['Java 25', 'Spring Boot 4.1', 'Angular 21', 'PostgreSQL', 'Redis', 'Meilisearch', 'Testcontainers', 'Flask'],
    links: [
      { label: 'documan.kalyanmudumby.com (v2)', url: 'https://documan.kalyanmudumby.com' },
      { label: 'GitHub (v2)', url: 'https://github.com/theinhumaneme/documan-public-release' },
    ],
    viz: 'checkpoint',
  },
  {
    id: 'visualizers',
    anchor: 'doc-visualizers',
    slug: 'visualizers',
    org: 'Personal · distroy.dev',
    period: '2026',
    title: 'Activity Visualizer & Training Story',
    kicker: 'Your data stays in your browser.',
    body:
      'Two apps that turn fitness exports into something you want to look at, without accounts or uploads. The analysis runs on your device.',
    points: [
      { text: 'Activity Visualizer repairs GPS jumps and drift, then renders 3D route flyovers and MP4 videos in the browser with WebCodecs.', src: 'activity' },
      { text: 'Privacy zones hide the start and finish on maps and exports, while statistics still use the full activity.', src: 'activity' },
      { text: 'Training Story turns Hevy CSVs into a scroll-driven story, with one analytics engine behind every view.', src: 'training' },
      { text: 'Calculations are tested against hand-computed results; Playwright exercises the production build.', src: 'training' },
    ],
    stack: ['TypeScript', 'React 19', 'MapLibre GL', 'WebCodecs', 'Web Workers', 'D3.js', 'GSAP', 'Cloudflare Workers'],
    links: [
      { label: 'activity-visualizer.distroy.dev', url: 'https://activity-visualizer.distroy.dev' },
      { label: 'hevy-visualizer.distroy.dev', url: 'https://hevy-visualizer.distroy.dev' },
    ],
    viz: 'visualizers',
  },
];

export const indexDocs = [
  { title: 'Autodeploy', line: 'Interactive Rust CLI: Git + Docker workflows via libgit2, Compose generated from TOML.', src: 'autodeploy', url: 'https://github.com/theinhumaneme/autodeploy', tag: 'rust · cli' },
  { title: 'Observability lab', line: 'OpenTelemetry → Collector → Prometheus, Tempo, Loki, with correlated traces, metrics and logs. A local lab and tutorial.', src: 'obslab', url: 'https://kalyanmudumby.com/post/complete-springboot-observability/', tag: 'otel · grafana' },
  { title: 'NixOS configuration', line: 'Declarative workstation and system config, ~419 authored commits.', src: 'nixos', url: 'https://github.com/theinhumaneme/nixos', tag: 'nix · linux' },
  { title: 'Encrypted DNS homelab', line: 'AdGuard Home behind Nginx: DoH on 443, DoT on 853, plaintext DNS kept inside the LAN.', src: 'homelab', url: 'https://kalyanmudumby.com/post/complete-adguard-setup-doh-dot-dns/', tag: 'networking' },
  { title: 'CS5610 social network', line: 'Team project. I contributed Algolia search, filtering and pagination, plus NestJS/MongoDB story and comment CRUD.', src: 'cs5610', url: 'https://github.com/theinhumaneme/social-network-webdev-final-project', tag: 'next.js · nestjs' },
];

/* ------------------------------------------------------------------------ */
/* 05 Attend: experience                                                    */
/* ------------------------------------------------------------------------ */

export const themes = ['AI & LLMs', 'Performance', 'Infra & CI/CD', 'Backend', 'Frontend', 'Teaching'] as const;

export type Role = {
  key: string;
  title: string;
  org: string;
  period: string;
  src: string;
  // one entry per verified highlight: which themes it touches
  evidence: (typeof themes)[number][][];
  points: string[];
};

export const roles: Role[] = [
  {
    key: 'TA',
    title: 'Graduate Teaching Assistant, CS4530',
    org: 'Northeastern University, Khoury College',
    period: 'Sep 2026 - now',
    src: 'ta',
    evidence: [['Teaching', 'Frontend'], ['Teaching']],
    points: [
      'Support 250+ students a week across labs and office hours on React, Hooks and component architecture.',
      'Mentor 60+ students on MVC, unit testing with Vitest, usability testing with Playwright, and mocking.',
    ],
  },
  {
    key: 'SWE',
    title: 'Software Engineer',
    org: 'Nebulogic Technologies',
    period: 'Jun 2023 - Jul 2025',
    src: 'nebu-perf',
    evidence: [['AI & LLMs', 'Backend'], ['AI & LLMs'], ['Performance', 'Frontend'], ['Performance', 'Backend'], ['Performance', 'Infra & CI/CD']],
    points: [
      'Built SMART AI Chat, a RAG chatbot for the City of Fort Wayne’s 311 service, with a query cache and a demand-driven knowledge base.',
      'Cut the core CRM’s cold start 100x (20 s → 200 ms) with Redis pipelining; Redis Pub/Sub propagates config without restarts.',
      'Cut page load 5x (30 s → 7 s) with Brotli/Gzip and a 60% smaller bundle.',
      'Cut origin load up to 70% with Cloudflare and tuned Nginx caching (80% cache-hit ratio), with OpenTelemetry tracing.',
      'Fixed LangChain’s GPTCache integration upstream (PR #19427, merged).',
    ],
  },
  {
    key: 'Intern',
    title: 'Software Engineer Intern',
    org: 'Nebulogic Technologies',
    period: 'Jun 2022 - Jun 2023',
    src: 'nebu-intern',
    evidence: [['Infra & CI/CD'], ['Infra & CI/CD'], ['Infra & CI/CD']],
    points: [
      'Built reproducible CI/CD with Docker multi-stage builds on GitLab CI across 40+ services.',
      'Upgraded GitLab v14 → v16 end to end with every pipeline intact, plus tuning and disaster recovery.',
      'Moved team docs to a Hugo site so non-engineers could contribute.',
    ],
  },
  {
    key: 'Web',
    title: 'Web Administrator',
    org: 'Geethanjali College of Engineering and Technology',
    period: 'Dec 2021 - May 2023',
    src: 'gctc',
    evidence: [['Frontend'], ['Frontend'], ['Backend']],
    points: [
      'Maintained the official college portal for 7,000+ students and alumni.',
      'Built 6+ event and conference sites, including VIBGYOR and BHASWARA.',
      'Built a content automation tool on the Telegram Bot API, Blogger and the Google Drive API.',
    ],
  },
];

export const logits = [
  { value: '100×', label: 'faster cold start', detail: 'core CRM boot, 20 s → 200 ms', src: 'nebu-perf', w: 1 },
  { value: '5×', label: 'faster page load', detail: '30 s → 7 s, 60% smaller bundle', src: 'nebu-perf', w: 0.82 },
  { value: '70%', label: 'less origin load', detail: 'Cloudflare + Nginx, 80% cache hits', src: 'nebu-perf', w: 0.7 },
  { value: '40+', label: 'services on CI/CD', detail: 'Docker multi-stage on GitLab CI', src: 'nebu-intern', w: 0.6 },
  { value: '250+', label: 'students a week', detail: 'CS4530 labs and office hours', src: 'ta', w: 0.52 },
];

/* ------------------------------------------------------------------------ */
/* 06 Model card                                                            */
/* ------------------------------------------------------------------------ */

export const card = {
  tags: ['applied-ai', 'rag', 'multi-agent', 'local-inference', 'backend', 'infrastructure', 'rust', 'python', 'open-source'],
  details: [
    ['Developer', 'Kalyan Mudumby'],
    ['Base', 'Electronics & Communication Engineering'],
    ['Fine-tuned on', '3 years of production systems'],
    ['Location', 'Boston, MA'],
  ],
  training: [
    { name: 'Northeastern University', what: 'MS, Computer Science', when: 'Sep 2025 - May 2027 (expected)', note: 'Algorithms · Web Development · Programming Design Paradigm · Database Management Systems · Machine Learning · Pattern Recognition and Computer Vision (in progress)' },
    { name: 'Geethanjali College of Engineering and Technology', what: "Bachelor's, Electronics and Communication Engineering", when: 'Aug 2019 - May 2023', note: 'Data Structures · Computer Architecture · Operating Systems · Embedded Systems' },
  ],
  evals: [
    { name: 'Best Podman Container Implementation', by: 'Red Hat / IBM · Pods, Prompts & Prototypes', when: '2026' },
    { name: 'People’s Choice', by: 'Red Hat / IBM · Pods, Prompts & Prototypes', when: '2026' },
    { name: 'AWS Certified AI Practitioner', by: 'Amazon Web Services', when: '2026' },
    { name: 'Best Employee of the Month ×4', by: 'Nebulogic Technologies', when: '2023 - 2024' },
    { name: 'INNOVADOR 2.0, First Place', by: 'Bhaswara 2023 paper presentation', when: '2023' },
    { name: 'Microsoft Certified: Azure Fundamentals', by: 'Microsoft · AZ-900', when: '2023' },
    { name: '3rd Place, TECHEXPO 2022', by: 'IEEE GCET Student Branch', when: '2022' },
    { name: '2nd Place, Inter-University Ideathon', by: 'IEEE SSIT SBC, GCET', when: '2021' },
  ],
  publication: {
    title: 'IOT based Smart Food Grain Storage Monitoring System for Silos using Google Apps Script',
    venue: 'Prime Scientific Journal (PSEN), 2023',
    note: 'Published under my legal name, Mudumby Kalyana Ramanuja Swami',
    url: 'https://primerascientific.com/journals/psen/PSEN-02-050',
  },
  intended: ['Applied AI & LLM systems', 'ML / inference infrastructure', 'Backend & platform engineering'],
  training_now: 'CS5330 Pattern Recognition and Computer Vision',
  leadership: ['Vice Chair, Technical Activities: IEEE Signal Processing Society, GCET', 'Entrepreneur Leader: National Entrepreneurship Network'],
  writing: [
    { title: 'Scale VM management with Hikari’s agent-server', url: 'https://kalyanmudumby.com/post/scale-vm-management-with-hikari-agent-server/' },
    { title: 'Documan: a zero-cost digital library', url: 'https://kalyanmudumby.com/post/documan-zero-cost-digital-library/' },
    { title: 'Complete Spring Boot observability', url: 'https://kalyanmudumby.com/post/complete-springboot-observability/' },
    { title: 'Hassle-free deployments with Autodeploy', url: 'https://kalyanmudumby.com/post/hasslefree-deployments-with-autodeploy/' },
    { title: 'AdGuard with DoH and DoT', url: 'https://kalyanmudumby.com/post/complete-adguard-setup-doh-dot-dns/' },
  ],
};

/* ------------------------------------------------------------------------ */
/* 07 Generate                                                              */
/* ------------------------------------------------------------------------ */

export const generation: { text: string; src?: string }[] = [
  { text: 'Kalyan Mudumby builds AI systems that hold up in production: retrieval with a query cache for a city’s 311 residents', src: 'smartai' },
  { text: ', multi-agent pipelines that repair their own output', src: 'patternsmith' },
  { text: ', and vision models that never leave your machine', src: 'oaam' },
  { text: '. Underneath is the systems work most AI engineers skip: a 100× faster cold start', src: 'nebu-perf' },
  { text: ', CI/CD across 40+ services', src: 'nebu-intern' },
  { text: ', a GitOps control plane written in Rust', src: 'hikari' },
  { text: ', and a digital library that served 4,000+ students', src: 'documan-v1' },
  { text: '. Next token: a team that needs both halves.' },
];
