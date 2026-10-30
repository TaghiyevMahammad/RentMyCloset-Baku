// Tiny hash router: "#/item/abc?x=1" -> { path: "/item/abc", params: { id: "abc" }, query: { x: "1" } }
const routes = [];
let hooks = {};

export function route(pattern, handler, opts = {}) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
  routes.push({ re, keys, handler, opts, pattern });
}

export function parseHash() {
  const [h, anchor = ''] = (location.hash.slice(1) || '/').split('#');
  const [path, qs = ''] = h.split('?');
  return { path: decodeURI(path) || '/', query: Object.fromEntries(new URLSearchParams(qs)), anchor };
}

export function buildHash(path, query = {}) {
  const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length))).toString();
  return path + (qs ? '?' + qs : '');
}

export function navigate(to, { replace = false } = {}) {
  if ('#' + to === location.hash) return resolve();
  if (replace) {
    history.replaceState(null, '', '#' + to);
    resolve();
  } else location.hash = to;
}

// Update the URL (e.g. filters) without re-rendering the page.
export const setQuery = (path, query) => history.replaceState(null, '', '#' + buildHash(path, query));

export async function resolve() {
  const { path, query, anchor } = parseHash();
  for (const r of routes) {
    const m = path.match(r.re);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    const ctx = { params, query, path, anchor, route: r };
    if (hooks.before && !(await hooks.before(ctx))) return;
    await r.handler(ctx);
    hooks.after?.(ctx);
    return;
  }
  hooks.notFound?.({ path, query });
}

export function startRouter(h = {}) {
  hooks = h;
  window.addEventListener('hashchange', resolve);
  resolve();
}
