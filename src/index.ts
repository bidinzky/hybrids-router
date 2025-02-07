import { getCurrentPath, hash, unhash } from './util';
import { RouterOptions, HybridRouter } from './interfaces';

export function createRouter(hybrids: any) {
  const template = (host: HybridRouter) => {
    const historyMode = host.mode === 'history';
    const matchingRoute = historyMode
      ? host.routes.find((route) => unhash(route.path) === host.currentPath)
      : host.routes.find((route) => hash(route.path) === host.currentPath);
    if(matchingRoute?.component) {
        if(typeof matchingRoute.component == "function") {
            return matchingRoute.component();
        }
    }
    return matchingRoute?.component || hybrids.html``;
  };

  return function Router({
    mode = 'hash',
    routes = [],
    shadowRoot = true,
  }: RouterOptions): hybrids.Hybrids<HybridRouter> {
    return {
      mode,
      routes,
      currentPath: getCurrentPath(window),
      render: hybrids.render(template, { shadowRoot }),
    };
  };
}

export function push(host: HybridRouter, path: string): void {
  const hashed = hash(path);
  const unhashed = unhash(path);
  const currentPath = getCurrentPath(window);

  if (currentPath === hashed || currentPath === unhashed) return;

  const { state } = window.history;
  const { pathname } = window.location;
  const historyMode = host.mode === 'history';

  host.currentPath = historyMode ? unhashed : hashed;

  if (historyMode) window.history.pushState(state, pathname, host.currentPath);
  else window.location.href = host.currentPath;

  window.addEventListener('popstate', () => (host.currentPath = getCurrentPath(window)));
}
