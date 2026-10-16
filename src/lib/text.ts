// Term extraction shared by the build-time indexer and the in-browser query
// engine, so a query is analysed exactly like the documents it is matched to.

const STOP = new Set(
  'a an and are as at be by for from has have in into is it its of on or that the their them then there these this to was were with without which who will so than per via up out every each one any all only never not no own same our we my i me you your'.split(
    ' ',
  ),
);

const stem = (w: string): string => {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};

export const terms = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+#]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);

// Query-side expansion: lets "make it faster" find "latency" and "cache".
export const SYNONYMS: Record<string, string[]> = {
  ai: ['llm', 'model', 'rag', 'agent', 'vision', 'langchain'],
  llm: ['model', 'langchain', 'langgraph', 'rag', 'vllm', 'openai', 'agent'],
  rag: ['retrieval', 'augment', 'knowledge', 'cache', 'chatbot', 'langchain'],
  agent: ['multi', 'langgraph', 'pipeline'],
  multi: ['agent', 'langgraph'],
  local: ['device', 'local', 'vllm', 'studio', 'quantiz', 'browser', 'podman'],
  model: ['llm', 'vllm', 'vision', 'studio'],
  fast: ['latency', 'cold', 'load', 'cache', 'pipelin', 'compression', 'faster'],
  faster: ['latency', 'cold', 'load', 'cache', 'pipelin', 'compression'],
  speed: ['latency', 'cold', 'load', 'cache'],
  performance: ['latency', 'cold', 'load', 'cache', 'compression'],
  privacy: ['browser', 'device', 'local', 'privacy', 'zone', 'upload', 'cloud'],
  private: ['browser', 'device', 'local', 'privacy'],
  search: ['meilisearch', 'retrieval', 'algolia', 'full', 'index'],
  reliability: ['retry', 'repair', 'validation', 'uptime', 'isolation', 'guard', 'test', 'reconcile'],
  reliable: ['retry', 'repair', 'validation', 'uptime', 'isolation', 'guard'],
  infra: ['docker', 'gitlab', 'ci', 'cd', 'nginx', 'cloudflare', 'kubernete', 'gitop'],
  devops: ['docker', 'gitlab', 'ci', 'cd', 'pipeline'],
  kubernete: ['gitop', 'control', 'plane', 'docker'],
  k8: ['kubernete', 'gitop', 'control', 'plane'],
  security: ['encrypt', 'aes', 'rsa', 'jwt', 'oauth2', 'authorization', 'tls'],
  test: ['pytest', 'vitest', 'playwright', 'mypy', 'testcontainer'],
  java: ['spring', 'boot'],
  frontend: ['react', 'angular', 'next', 'browser', 'bundle'],
  teach: ['student', 'mentor', 'lab', 'office'],
  observability: ['opentelemetry', 'prometheus', 'grafana', 'tempo', 'loki', 'tracing'],
  data: ['postgresql', 'redis', 'meilisearch', 'mongodb'],
  database: ['postgresql', 'redis', 'mongodb'],
  cache: ['redis', 'cache', 'etag'],
  rust: ['tokio', 'axum'],
  backend: ['spring', 'boot', 'java', 'flask', 'fastapi', 'postgresql', 'sqlite', 'redis', 'nestj', 'express', 'worker', 'queue', 'cache'],
  api: ['api', 'rest', 'endpoint'],
  deployment: ['deploy', 'docker', 'compose', 'ci', 'cd', 'gitlab', 'agent', 'stack', 'container'],
  deploy: ['deployment', 'docker', 'compose', 'ci', 'gitlab'],
  automation: ['automat', 'cli', 'pipeline', 'ci', 'script'],
  visualization: ['visualiz', 'chart', 'dashboard', 'd3', 'map', 'flyover', 'trend'],
  visualisation: ['visualiz', 'chart', 'dashboard', 'd3', 'map', 'flyover', 'trend'],
  chart: ['visualiz', 'd3', 'trend'],
  gis: ['arcgi', 'layer', 'map'],
  ml: ['machine', 'learn', 'classifier', 'cnn', 'model'],
  machine: ['learn', 'classifier', 'model'],
};
