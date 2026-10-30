// App entry: starts the data store, registers routes, handles global UI events.
import { store } from './store.js';
import { route, startRouter, navigate, resolve } from './router.js';
import { renderHeader, renderFooter } from './layout.js';
import { toast, emptyState, icon } from './ui.js';

import { renderHome } from './pages/home.js';
import { renderBrowse } from './pages/browse.js';
import { renderItem } from './pages/item.js';
import { renderListItem } from './pages/listItem.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderBooking } from './pages/booking.js';
import { renderLogin, renderSignup } from './pages/auth.js';
import { renderHowItWorks } from './pages/howItWorks.js';
import { renderProfile } from './pages/profile.js';
import { renderAdmin } from './pages/admin.js';

let main = document.getElementById('main');

// Each page gets a fresh <main> element so event listeners never pile up between pages.
function freshMain() {
  const el = main.cloneNode(false);
  main.replaceWith(el);
  main = el;
  return el;
}

const page = (fn) => async (ctx) => {
  freshMain();
  try {
    await fn(main, ctx);
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="container section">${emptyState('Something went wrong', err.message, '<a class="btn btn-primary" href="#/">Back to home</a>')}</div>`;
  }
};

route('/', page(renderHome));
route('/browse', page(renderBrowse));
route('/item/:id', page(renderItem));
route('/list', page(renderListItem), { auth: true });
route('/list/:id', page(renderListItem), { auth: true });
route('/dashboard', page(renderDashboard), { auth: true });
route('/dashboard/:tab', page(renderDashboard), { auth: true });
route('/booking/:id', page(renderBooking), { auth: true });
route('/login', page(renderLogin));
route('/signup', page(renderSignup));
route('/how-it-works', page(renderHowItWorks));
route('/user/:id', page(renderProfile));
route('/admin', page(renderAdmin), { auth: true, admin: true });

// ---------- Global: save/unsave buttons anywhere on the site ----------
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-fav]');
  if (btn) {
    e.preventDefault();
    if (!store.currentUser()) {
      toast('Log in to save outfits you like.');
      navigate('/login?next=' + encodeURIComponent(location.hash.slice(1)));
      return;
    }
    const on = await store.toggleFavorite(btn.dataset.fav);
    document.querySelectorAll(`[data-fav="${CSS.escape(btn.dataset.fav)}"]`).forEach((b) => {
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
      b.classList.remove('pop');
      void b.offsetWidth;
      if (on) b.classList.add('pop');
    });
    toast(on ? 'Saved to your favourites.' : 'Removed from saved.', 'success', 1800);
    return;
  }
  // Close the account menu when clicking elsewhere.
  document.querySelectorAll('details.user-menu[open]').forEach((d) => !d.contains(e.target) && d.removeAttribute('open'));
});

// Keep the header (badge counts, login state) fresh after any data change.
window.addEventListener('rmc:change', (e) => {
  renderHeader();
  if (e.detail?.external && e.detail?.session) resolve();
});

(async function boot() {
  try {
    await store.init();
  } catch (err) {
    main.innerHTML = `<div class="container section">${emptyState('Could not start the app', err.message)}</div>`;
    return;
  }
  renderFooter();
  startRouter({
    before: (ctx) => {
      const user = store.currentUser();
      if (ctx.route.opts.auth && !user) {
        toast('Please log in to continue.');
        navigate('/login?next=' + encodeURIComponent(location.hash.slice(1)), { replace: true });
        return false;
      }
      if (ctx.route.opts.admin && user?.role !== 'admin') {
        toast('This page is for the RentMyCloset team only.', 'error');
        navigate('/', { replace: true });
        return false;
      }
      return true;
    },
    after: (ctx) => {
      renderHeader();
      const target = ctx.anchor && document.getElementById(ctx.anchor);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo(0, 0);
    },
    notFound: ({ path }) => {
      document.title = 'Page not found · RentMyCloset Baku';
      renderHeader();
      freshMain().innerHTML = `<div class="container section">${emptyState('Page not found', `We couldn't find "${path}".`, `<a class="btn btn-primary" href="#/browse">${icon('search', 18)} Browse outfits</a>`)}</div>`;
    },
  });
})();
