import { store } from '../store.js';
import { navigate } from '../router.js';
import { esc, money, fmtRange, cityLabel } from '../utils.js';
import { icon, itemMedia, itemCard, avatar, statusBadge, emptyState, toast, confirmDialog, openModal, roleBadge, verifiedBadge } from '../ui.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'rentals', label: 'My rentals', icon: 'calendar' },
  { id: 'requests', label: 'Requests', icon: 'bag' },
  { id: 'listings', label: 'My listings', icon: 'hanger' },
  { id: 'favorites', label: 'Saved', icon: 'heart' },
  { id: 'settings', label: 'Profile', icon: 'user' },
];

export async function renderDashboard(main, { params }) {
  const tab = TABS.some((t) => t.id === params.tab) ? params.tab : 'overview';
  const user = store.currentUser();
  document.title = `${TABS.find((t) => t.id === tab).label} · Dashboard · RentMyCloset`;
  const pending = await store.pendingRequestsCount();

  main.innerHTML = `
  <section class="page-head compact">
    <div class="container dash-head">
      ${avatar(user, 56)}
      <div><h1>Hi, ${esc(user.name.split(' ')[0])}</h1><div class="badge-row">${roleBadge(user)}${verifiedBadge(user)}${user.verified ? '' : '<span class="badge tone-gray">ID not verified yet</span>'}</div></div>
      <a class="btn btn-primary hide-sm" href="#/list">${icon('plus', 18)} List an outfit</a>
    </div>
  </section>
  <div class="container dash">
    <nav class="dash-tabs" aria-label="Dashboard">
      ${TABS.map((t) => `<a href="#/dashboard/${t.id}" class="${t.id === tab ? 'active' : ''}" ${t.id === tab ? 'aria-current="page"' : ''}>${icon(t.icon, 18)}<span>${t.label}</span>${t.id === 'requests' && pending ? `<span class="count-pill">${pending}</span>` : ''}</a>`).join('')}
    </nav>
    <div class="dash-body" data-body></div>
  </div>`;

  const body = main.querySelector('[data-body]');
  await ({ overview, rentals, requests, listings, favorites, settings }[tab])(body, user);

  // Inline approve / decline on request rows.
  body.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    e.preventDefault();
    const { act, id } = b.dataset;
    try {
      if (act === 'decline') {
        const reason = await askReason();
        if (reason === null) return;
        await store.transition(id, 'decline', { reason });
        toast('Request declined. The renter has been notified.', 'success');
      } else {
        await store.transition(id, act);
        toast(act === 'approve' ? 'Approved! Contact details are now shared.' : 'Done.', 'success');
      }
      navigate(location.hash.slice(1), { replace: true });
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

export function askReason() {
  return new Promise((resolve) => {
    let done = false;
    const { modal, close } = openModal({
      title: 'Decline this request?',
      body: `<label class="field"><span>Reason for the renter <em>(optional)</em></span><textarea rows="3" name="reason" placeholder="Sorry, I need the dress myself that weekend."></textarea></label>`,
      footer: `<button class="btn btn-ghost" data-modal-close>Keep request</button><button class="btn btn-danger" data-ok>Decline</button>`,
      onClose: () => !done && resolve(null),
    });
    modal.querySelector('[data-ok]').addEventListener('click', () => {
      done = true;
      const v = modal.querySelector('[name=reason]').value;
      close();
      resolve(v);
    });
  });
}

export function bookingRow(b, as) {
  const other = as === 'owner' ? b.renter : b.owner;
  return `<a class="booking-row" href="#/booking/${esc(b.id)}">
    <div class="br-media">${itemMedia(b.item)}</div>
    <div class="br-main">
      <strong>${esc(b.item.title)}</strong>
      <span class="muted small">${icon('calendar', 14)} ${esc(fmtRange(b.start, b.end))} · ${b.days} ${b.days === 1 ? 'day' : 'days'}</span>
      <span class="muted small">${avatar(other, 20)} ${as === 'owner' ? 'Renter' : 'Owner'}: ${esc(other.name)}</span>
    </div>
    <div class="br-side">
      ${statusBadge(b.status)}
      <b>${as === 'owner' ? money(b.ownerPayout) : money(b.rental + b.cleaningFee)}</b>
      <small class="muted">${as === 'owner' ? 'you earn' : '+ deposit ' + money(b.deposit)}</small>
      ${as === 'owner' && b.status === 'requested' ? `<span class="br-actions"><button class="btn btn-sm btn-primary" data-act="approve" data-id="${esc(b.id)}">Approve</button><button class="btn btn-sm btn-ghost" data-act="decline" data-id="${esc(b.id)}">Decline</button></span>` : ''}
    </div>
  </a>`;
}

const list = (rows, as) => `<div class="booking-list">${rows.map((b) => bookingRow(b, as)).join('')}</div>`;
const stat = (ic, label, value, href) => `<a class="stat-card" href="${href}"><span class="stat-icon">${icon(ic, 20)}</span><small>${label}</small><strong>${value}</strong></a>`;

async function overview(body, user) {
  const [mine, incoming, myItems] = await Promise.all([store.listBookings({ as: 'renter' }), store.listBookings({ as: 'owner' }), store.listItems({ ownerId: user.id, includeHidden: true })]);
  const upcoming = mine.filter((b) => ['requested', 'approved', 'picked_up'].includes(b.status));
  const pending = incoming.filter((b) => b.status === 'requested');
  const earned = incoming.filter((b) => b.status === 'completed').reduce((a, b) => a + b.ownerPayout, 0);
  const active = incoming.filter((b) => ['approved', 'picked_up'].includes(b.status));

  body.innerHTML = `
    <div class="stat-grid">
      ${stat('calendar', 'Upcoming rentals', upcoming.length, '#/dashboard/rentals')}
      ${stat('bag', 'Requests to answer', pending.length, '#/dashboard/requests')}
      ${stat('hanger', 'Active listings', myItems.filter((i) => i.status === 'active').length, '#/dashboard/listings')}
      ${stat('wallet', 'Total earned', money(earned), '#/dashboard/requests')}
    </div>
    ${pending.length ? `<h3 class="dash-h">${icon('alert', 18)} Waiting for your answer</h3>${list(pending, 'owner')}` : ''}
    ${active.length ? `<h3 class="dash-h">Your items out on rent / ready for pickup</h3>${list(active, 'owner')}` : ''}
    <h3 class="dash-h">Your upcoming rentals</h3>
    ${upcoming.length ? list(upcoming, 'renter') : emptyState('No upcoming rentals', 'Find an outfit for your next event.', '<a class="btn btn-primary" href="#/browse">Browse outfits</a>')}
    ${myItems.length ? '' : `<div class="card promo">${icon('wallet', 28)}<div><h3>Earn from your wardrobe</h3><p class="muted">List an outfit you wore once. It takes about three minutes.</p></div><a class="btn btn-primary" href="#/list">List an outfit</a></div>`}`;
}

async function rentals(body) {
  const rows = await store.listBookings({ as: 'renter' });
  const cur = rows.filter((b) => ['requested', 'approved', 'picked_up'].includes(b.status));
  const past = rows.filter((b) => !cur.includes(b));
  body.innerHTML = rows.length
    ? `${cur.length ? `<h3 class="dash-h">Current</h3>${list(cur, 'renter')}` : ''}${past.length ? `<h3 class="dash-h">Past</h3>${list(past, 'renter')}` : ''}`
    : emptyState('You have not rented anything yet', 'Your bookings will appear here.', '<a class="btn btn-primary" href="#/browse">Find an outfit</a>');
}

async function requests(body) {
  const rows = await store.listBookings({ as: 'owner' });
  if (!rows.length) {
    body.innerHTML = emptyState('No requests yet', 'When someone wants to rent your outfit, you will approve it here.', '<a class="btn btn-primary" href="#/list">List an outfit</a>');
    return;
  }
  const earned = rows.filter((b) => b.status === 'completed').reduce((a, b) => a + b.ownerPayout, 0);
  const upcoming = rows.filter((b) => ['approved', 'picked_up'].includes(b.status)).reduce((a, b) => a + b.ownerPayout, 0);
  const groups = [
    ['Needs your answer', rows.filter((b) => b.status === 'requested')],
    ['Upcoming & active', rows.filter((b) => ['approved', 'picked_up'].includes(b.status))],
    ['History', rows.filter((b) => ['completed', 'declined', 'cancelled'].includes(b.status))],
  ];
  body.innerHTML = `
    <div class="stat-grid two">
      <div class="stat-card"><span class="stat-icon">${icon('wallet', 20)}</span><small>Earned so far</small><strong>${money(earned)}</strong></div>
      <div class="stat-card"><span class="stat-icon">${icon('clock', 20)}</span><small>Coming from confirmed rentals</small><strong>${money(upcoming)}</strong></div>
    </div>
    ${groups.filter(([, r]) => r.length).map(([t, r]) => `<h3 class="dash-h">${t} <span class="muted">(${r.length})</span></h3>${list(r, 'owner')}`).join('')}`;
}

async function listings(body, user) {
  const items = await store.listItems({ ownerId: user.id, includeHidden: true, sort: 'newest' });
  body.innerHTML = items.length
    ? `<div class="dash-toolbar"><p class="muted">${items.length} ${items.length === 1 ? 'listing' : 'listings'}</p><a class="btn btn-primary btn-sm" href="#/list">${icon('plus', 16)} Add new</a></div>
       <div class="listing-table">${items
         .map(
           (i) => `<div class="listing-row ${i.status !== 'active' ? 'paused' : ''}">
          <a class="lr-media" href="#/item/${esc(i.id)}">${itemMedia(i)}</a>
          <div class="lr-main"><a href="#/item/${esc(i.id)}"><strong>${esc(i.title)}</strong></a>
            <span class="muted small">Size ${esc(i.size)} · ${esc(cityLabel(i.city))} · ${money(i.pricePerDay)}/day · ${i.rentals} ${i.rentals === 1 ? 'rental' : 'rentals'}</span>
            ${i.status === 'active' ? '<span class="badge tone-green">Live</span>' : '<span class="badge tone-gray">Paused</span>'}</div>
          <div class="lr-actions">
            <a class="btn btn-sm btn-ghost" href="#/list/${esc(i.id)}" title="Edit">${icon('edit', 16)}<span class="hide-sm">Edit</span></a>
            <button class="btn btn-sm btn-ghost" data-status="${esc(i.id)}" data-to="${i.status === 'active' ? 'paused' : 'active'}">${icon(i.status === 'active' ? 'pause' : 'play', 16)}<span class="hide-sm">${i.status === 'active' ? 'Pause' : 'Resume'}</span></button>
            <button class="btn btn-sm btn-ghost danger" data-delete="${esc(i.id)}" title="Delete">${icon('trash', 16)}</button>
          </div></div>`
         )
         .join('')}</div>`
    : emptyState('No listings yet', 'Turn the outfits you wore once into income.', '<a class="btn btn-primary" href="#/list">List your first outfit</a>');

  body.addEventListener('click', async (e) => {
    const s = e.target.closest('[data-status]');
    const d = e.target.closest('[data-delete]');
    try {
      if (s) {
        await store.setItemStatus(s.dataset.status, s.dataset.to);
        toast(s.dataset.to === 'active' ? 'Listing is live again.' : 'Listing paused.', 'success');
      } else if (d) {
        if (!(await confirmDialog('This permanently removes the listing.', { title: 'Delete listing?', confirmText: 'Delete', danger: true }))) return;
        await store.deleteItem(d.dataset.delete);
        toast('Listing deleted.', 'success');
      } else return;
      navigate('/dashboard/listings', { replace: true });
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

async function favorites(body) {
  const ids = await store.getFavorites();
  const items = ids.length ? await store.listItems({ ids }) : [];
  body.innerHTML = items.length
    ? `<div class="item-grid">${items.map((i) => itemCard(i, ids)).join('')}</div>`
    : emptyState('Nothing saved yet', 'Tap the heart on any outfit to save it here.', '<a class="btn btn-primary" href="#/browse">Browse outfits</a>');
}

async function settings(body, user) {
  body.innerHTML = `
    <form class="card form-card narrow" data-profile>
      <h3>Your profile</h3>
      <label class="field"><span>Full name</span><input name="name" value="${esc(user.name)}" required></label>
      <label class="field"><span>Email</span><input value="${esc(user.email)}" disabled></label>
      <label class="field"><span>Phone</span><input name="phone" type="tel" value="${esc(user.phone || '')}" placeholder="+994 50 123 45 67"><small class="muted">Shared only with people whose booking you have approved (or who approved yours).</small></label>
      <label class="field"><span>About you</span><textarea name="bio" rows="3" maxlength="400" placeholder="A few words for renters and owners.">${esc(user.bio || '')}</textarea></label>
      <div class="form-actions"><a class="btn btn-ghost" href="#/user/${esc(user.id)}">View public profile</a><button class="btn btn-primary">Save</button></div>
    </form>
    <div class="card form-card narrow">
      <h3>${icon('idcard', 18)} ID verification</h3>
      <p class="muted">${user.verified ? 'Your ID has been checked by the team. You have a Verified badge.' : 'During the pilot, the team checks your ID in person at your first pickup. After that you get a Verified badge.'}</p>
    </div>`;
  body.querySelector('[data-profile]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await store.updateProfile({ name: f.get('name'), phone: f.get('phone'), bio: f.get('bio') });
      toast('Profile saved.', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

