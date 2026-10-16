// Light / dark theme. The choice lives on <html data-theme>, set before first
// paint by the inline script in Base.astro: a stored choice wins, otherwise the
// system preference. Canvas and diagram code reads colours from the CSS tokens
// and listens for `themechange` to redraw.

export type Theme = 'light' | 'dark';

const KEY = 'theme';

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/** A token's resolved value, e.g. cssVar('--t1') → '#b6a4ff'. Accepts 'var(--t1)' too. */
export function cssVar(token: string): string {
  const name = token.startsWith('var(') ? token.slice(4, -1).trim() : token;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function onThemeChange(fn: (theme: Theme) => void) {
  document.addEventListener('themechange', (e) => fn((e as CustomEvent<Theme>).detail));
}

export function setTheme(theme: Theme, remember = true) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  // switch in one frame: per-element colour transitions would lag the page
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  if (remember) {
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', cssVar('--bg'));
  document.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

/** Follow the system preference until the visitor picks a theme themselves. */
export function followSystem() {
  const mq = matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', (e) => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    if (!stored) setTheme(e.matches ? 'light' : 'dark', false);
  });
}
