// Site header (desktop + mobile drawer) and footer.
import { store } from './store.js';
import { icon, logo, avatar, toast, confirmDialog, openModal } from './ui.js';
import { esc } from './utils.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from './seed.js';
import { navigate, parseHash } from './router.js';

export async function renderHeader() {
  const el = document.getElementById('site-header');
  const user = store.currentUser();
  const pending = user ? await store.pendingRequestsCount() : 0;
  const { path } = parseHash();
  const active = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? 'active' : '');

  el.innerHTML = `
  <div class="container header-inner">
    <a href="#/" class="brand" aria-label="RentMyCloset Baku home">${logo()}<span class="brand-text">RentMyCloset<b>Baku</b></span></a>
    <nav class="main-nav" aria-label="Main">
      <a href="#/browse" class="${active('/browse')}">Browse</a>
      <a href="#/how-it-works" class="${active('/how-it-works')}">How it works</a>
      <a href="#/list" class="${active('/list')}">Lend your outfit</a>
    </nav>
    <div class="header-actions">
      ${user
        ? `<a href="#/dashboard/favorites" class="icon-btn hide-sm" aria-label="Saved items" title="Saved">${icon('heart')}</a>
           <a href="#/dashboard/requests" class="icon-btn has-badge" aria-label="Requests on your items" title="Requests on your items">${icon('bag')}${pending ? `<span class="dot-badge">${pending}</span>` : ''}</a>
           <details class="user-menu">
             <summary aria-label="Account menu">${avatar(user, 34)}<span class="hide-sm um-name">${esc(user.name.split(' ')[0])}</span>${icon('chevD', 16, 'hide-sm')}</summary>
             <div class="menu-pop">
               <div class="menu-head">${avatar(user, 40)}<div><strong>${esc(user.name)}</strong><small>${esc(user.email)}</small></div></div>
               <a href="#/dashboard">${icon('grid', 18)} Dashboard</a>
               <a href="#/dashboard/rentals">${icon('calendar', 18)} My rentals</a>
               <a href="#/dashboard/listings">${icon('hanger', 18)} My listings</a>
               <a href="#/user/${esc(user.id)}">${icon('user', 18)} Public profile</a>
               ${user.role === 'admin' ? `<a href="#/admin">${icon('chart', 18)} Admin panel</a>` : ''}
               <button type="button" data-action="switch">${icon('users', 18)} Switch demo account</button>
               <button type="button" data-action="logout">${icon('logout', 18)} Log out</button>
             </div>
           </details>`
        : `<a href="#/login" class="btn btn-ghost btn-sm hide-sm">Log in</a>
           <a href="#/signup" class="btn btn-primary btn-sm">Sign up</a>`}
      <button class="icon-btn menu-toggle" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
    </div>
  </div>
  <div class="mobile-drawer" hidden>
    <nav aria-label="Mobile">
      <a href="#/browse">${icon('search', 18)} Browse outfits</a>
      <a href="#/list">${icon('plus', 18)} Lend your outfit</a>
      <a href="#/how-it-works">${icon('info', 18)} How it works</a>
      ${user
        ? `<a href="#/dashboard">${icon('grid', 18)} Dashboard</a><a href="#/dashboard/favorites">${icon('heart', 18)} Saved</a>${user.role === 'admin' ? `<a href="#/admin">${icon('chart', 18)} Admin panel</a>` : ''}<button type="button" data-action="logout">${icon('logout', 18)} Log out</button>`
        : `<a href="#/login">${icon('user', 18)} Log in</a>`}
    </nav>
  </div>`;

  const drawer = el.querySelector('.mobile-drawer');
  const toggle = el.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = icon(open ? 'x' : 'menu');
  });
  el.onclick = async (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    el.querySelector('.user-menu')?.removeAttribute('open');
    if (a.dataset.action === 'logout') {
      store.logout();
      toast('You are logged out.', 'success');
      navigate('/');
    }
    if (a.dataset.action === 'switch') switchAccountDialog();
  };
}

export async function switchAccountDialog() {
  const { modal, close } = openModal({
    title: 'Switch demo account',
    body: `<p class="muted">Try the site from different sides of the marketplace. All demo passwords are <code>${DEMO_PASSWORD}</code>.</p>
      <div class="demo-list">${DEMO_ACCOUNTS.map((a) => `<button class="demo-acc" data-email="${esc(a.email)}"><strong>${esc(a.label)}</strong><small>${esc(a.hint)}</small></button>`).join('')}</div>`,
  });
  modal.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-email]');
    if (!b) return;
    try {
      const u = await store.login(b.dataset.email, DEMO_PASSWORD);
      close();
      toast(`Now logged in as ${u.name}.`, 'success');
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast(err.message + ' Try "Reset demo data" in the footer.', 'error');
    }
  });
}

export function renderFooter() {
  const el = document.getElementById('site-footer');
  el.innerHTML = `
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="#/" class="brand">${logo()}<span class="brand-text">RentMyCloset<b>Baku</b></span></a>
      <p>Wear it once. Share it forever. A local marketplace for occasion outfits in Baku.</p>
      <div class="socials">
        <a href="https://instagram.com/" target="_blank" rel="noopener" class="icon-btn" aria-label="Instagram">${icon('instagram')}</a>
        <a href="mailto:hello@rentmycloset.az" class="icon-btn" aria-label="Email">${icon('mail')}</a>
      </div>
    </div>
    <div><h4>Rent</h4><a href="#/browse">Browse outfits</a><a href="#/browse?event=wedding">Wedding guest</a><a href="#/browse?event=graduation">Graduation</a><a href="#/browse?category=suit">Men's suits</a></div>
    <div><h4>Lend</h4><a href="#/list">List an item</a><a href="#/how-it-works#owners">How lending works</a><a href="#/how-it-works#pricing">Pricing & commission</a><a href="#/signup?role=salon">For salons</a></div>
    <div><h4>Help</h4><a href="#/how-it-works#trust">Trust & safety</a><a href="#/how-it-works#rules">Rental rules</a><a href="#/how-it-works#faq">FAQ</a><a href="mailto:hello@rentmycloset.az">hello@rentmycloset.az</a></div>
  </div>
  <div class="container footer-bottom">
    <span>© ${new Date().getFullYear()} RentMyCloset Baku · MVP demo. Data is saved in this browser only.</span>
    <button class="link-btn" data-reset>${icon('refresh', 14)} Reset demo data</button>
  </div>`;
  el.querySelector('[data-reset]').addEventListener('click', async () => {
    if (!(await confirmDialog('This deletes everything you created in this browser and restores the demo data.', { title: 'Reset demo data?', confirmText: 'Reset', danger: true }))) return;
    await store.resetDemo();
    toast('Demo data restored.', 'success');
    navigate('/');
  });
}
