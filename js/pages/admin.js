import { store } from '../store.js';
import { navigate } from '../router.js';
import { esc, money, fmtRange, fmtDate, STATUS, categoryLabel } from '../utils.js';
import { icon, itemMedia, statusBadge, toast } from '../ui.js';

export async function renderAdmin(main, { query }) {
  document.title = 'Admin · RentMyCloset Baku';
  const tab = ['bookings', 'listings', 'users'].includes(query.tab) ? query.tab : 'bookings';
  const filter = query.status || '';
  const { stats, bookings, users, items } = await store.adminOverview();
  const s = store.getSettings();
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const rentals30 = bookings.filter((b) => ['approved', 'picked_up', 'completed'].includes(b.status) && b.createdAt >= monthAgo).length;
  const goal = (label, value, target) => {
    const p = Math.min(100, Math.round((value / target) * 100));
    return `<div class="goal"><div class="goal-top"><span>${label}</span><b>${value} / ${target}</b></div><div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div></div>`;
  };

  main.innerHTML = `
  <section class="page-head compact">
    <div class="container dash-head">
      <span class="stat-icon big">${icon('chart', 26)}</span>
      <div><h1>Team admin panel</h1><p class="muted">Run the pilot: watch bookings, help users and test pricing.</p></div>
      <button class="btn btn-outline hide-sm" data-export>${icon('download', 18)} Export data (JSON)</button>
    </div>
  </section>
  <div class="container">
    <div class="stat-grid six">
      ${stat('hanger', 'Active listings', stats.items)}
      ${stat('users', 'Users', stats.users)}
      ${stat('bag', 'Bookings', stats.bookings)}
      ${stat('wallet', 'Booked rental value', money(stats.gmv))}
      ${stat('check', 'Commission earned', money(stats.commission))}
      ${stat('clock', 'Commission in pipeline', money(stats.pipelineCommission))}
    </div>

    <div class="admin-grid">
      <div class="card">
        <h3>${icon('sparkles', 18)} Pilot goals (from our plan)</h3>
        ${goal('Listed items (pilot target)', stats.items, 30)}
        ${goal('Rentals in the last 30 days', rentals30, 20)}
        ${goal('Completed rentals (first 10)', stats.completed, 10)}
        <div class="status-counts">${Object.keys(STATUS).map((k) => `<a href="#/admin?status=${k}" class="sc">${statusBadge(k)}<b>${stats.byStatus[k] || 0}</b></a>`).join('')}</div>
        <p class="muted small">Average rental value: <b>${money(stats.avgRental)}</b> · Listings by category: ${Object.entries(stats.byCategory).map(([k, v]) => `${esc(categoryLabel(k))} ${v}`).join(', ')}</p>
      </div>
      <form class="card" data-settings>
        <h3>${icon('sliders', 18)} Marketplace settings</h3>
        <label class="field"><span>Commission rate</span>
          <select name="commissionRate">${[0.1, 0.12, 0.15].map((r) => `<option value="${r}" ${s.commissionRate === r ? 'selected' : ''}>${Math.round(r * 100)}%${r === 0.1 ? ' (launch)' : r === 0.15 ? ' (target)' : ''}</option>`).join('')}</select></label>
        <div class="field-row">
          <label class="field"><span>Cleaning fee (AZN)</span><input type="number" name="cleaningFee" min="0" value="${s.cleaningFee}"></label>
          <label class="field"><span>Cleaning gap (days)</span><input type="number" name="bufferDays" min="0" max="3" value="${s.bufferDays}"></label>
          <label class="field"><span>Max rental (days)</span><input type="number" name="maxDays" min="1" max="30" value="${s.maxDays}"></label>
        </div>
        <p class="muted small">Changes apply to new bookings only.</p>
        <button class="btn btn-dark">Save settings</button>
      </form>
    </div>

    <nav class="dash-tabs inline">
      <a href="#/admin?tab=bookings" class="${tab === 'bookings' ? 'active' : ''}">${icon('bag', 18)} Bookings</a>
      <a href="#/admin?tab=listings" class="${tab === 'listings' ? 'active' : ''}">${icon('hanger', 18)} Listings</a>
      <a href="#/admin?tab=users" class="${tab === 'users' ? 'active' : ''}">${icon('users', 18)} Users</a>
    </nav>
    <div class="card table-card">${tab === 'bookings' ? bookingsTable(bookings, filter) : tab === 'listings' ? listingsTable(items) : usersTable(users)}</div>
  </div>`;

  const reload = () => navigate(location.hash.slice(1), { replace: true });
  main.querySelector('[data-settings]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await store.updateSettings(Object.fromEntries(f));
      toast('Settings saved.', 'success');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
  main.querySelector('[data-export]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(store.exportData(), null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `rentmycloset-data-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  });
  main.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-item-status]');
    const v = e.target.closest('[data-verify]');
    try {
      if (t) await store.setItemStatus(t.dataset.itemStatus, t.dataset.to);
      else if (v) await store.setUserVerified(v.dataset.verify, v.dataset.to === '1');
      else return;
      toast('Updated.', 'success');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
  main.querySelector('[data-filter]')?.addEventListener('change', (e) => navigate(`/admin?tab=bookings${e.target.value ? '&status=' + e.target.value : ''}`));
}

const stat = (ic, label, value) => `<div class="stat-card"><span class="stat-icon">${icon(ic, 20)}</span><small>${label}</small><strong>${value}</strong></div>`;

function bookingsTable(bookings, filter) {
  const rows = filter ? bookings.filter((b) => b.status === filter) : bookings;
  return `<div class="table-toolbar"><h3>Bookings <span class="muted">(${rows.length})</span></h3>
    <select data-filter aria-label="Filter by status"><option value="">All statuses</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${filter === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
    <div class="table-wrap"><table class="table">
    <thead><tr><th>Item</th><th>Renter</th><th>Owner</th><th>Dates</th><th>Status</th><th class="num">Rental</th><th class="num">Commission</th><th></th></tr></thead>
    <tbody>${rows.map((b) => `<tr>
      <td><div class="t-item"><span class="t-thumb">${itemMedia(b.item)}</span>${esc(b.item.title)}</div></td>
      <td>${esc(b.renter.name)}</td><td>${esc(b.owner.name)}</td>
      <td class="nowrap">${esc(fmtRange(b.start, b.end))}</td><td>${statusBadge(b.status)}</td>
      <td class="num">${money(b.rental)}</td><td class="num">${money(b.commission)}</td>
      <td><a class="btn btn-sm btn-ghost" href="#/booking/${esc(b.id)}">Open</a></td></tr>`).join('') || '<tr><td colspan="8" class="muted center">No bookings.</td></tr>'}</tbody></table></div>`;
}

function listingsTable(items) {
  return `<div class="table-toolbar"><h3>Listings <span class="muted">(${items.length})</span></h3></div>
    <div class="table-wrap"><table class="table">
    <thead><tr><th>Item</th><th>Owner</th><th>Size</th><th class="num">Price/day</th><th class="num">Rentals</th><th>Status</th><th></th></tr></thead>
    <tbody>${items.map((i) => `<tr>
      <td><a class="t-item" href="#/item/${esc(i.id)}"><span class="t-thumb">${itemMedia(i)}</span>${esc(i.title)}</a></td>
      <td>${esc(i.owner.name)}</td><td>${esc(i.size)}</td><td class="num">${money(i.pricePerDay)}</td><td class="num">${i.rentals}</td>
      <td>${i.status === 'active' ? '<span class="badge tone-green">Live</span>' : `<span class="badge tone-gray">${esc(i.status)}</span>`}</td>
      <td><button class="btn btn-sm btn-ghost" data-item-status="${esc(i.id)}" data-to="${i.status === 'active' ? 'hidden' : 'active'}">${i.status === 'active' ? 'Hide' : 'Make live'}</button></td></tr>`).join('')}</tbody></table></div>`;
}

function usersTable(users) {
  return `<div class="table-toolbar"><h3>Users <span class="muted">(${users.length})</span></h3></div>
    <div class="table-wrap"><table class="table">
    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th class="num">Listings</th><th class="num">Rentals</th><th>Joined</th><th>ID check</th></tr></thead>
    <tbody>${users.map((u) => `<tr>
      <td><a href="#/user/${esc(u.id)}">${esc(u.name)}</a></td><td>${esc(u.email)}</td><td class="nowrap">${esc(u.phone || '—')}</td>
      <td>${u.role === 'salon' ? 'Salon' : u.role === 'admin' ? 'Team' : 'Individual'}</td>
      <td class="num">${u.listings}</td><td class="num">${u.bookings}</td><td class="nowrap">${esc(fmtDate(u.joined.slice(0, 10)))}</td>
      <td><button class="btn btn-sm ${u.verified ? 'btn-ghost' : 'btn-outline'}" data-verify="${esc(u.id)}" data-to="${u.verified ? '0' : '1'}">${u.verified ? `${icon('check', 14)} Verified` : 'Mark verified'}</button></td></tr>`).join('')}</tbody></table></div>`;
}
