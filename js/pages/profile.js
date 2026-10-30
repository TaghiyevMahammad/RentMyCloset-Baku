import { store } from '../store.js';
import { esc, fmtMonthYear } from '../utils.js';
import { icon, avatar, itemCard, emptyState, ratingInline, roleBadge, verifiedBadge } from '../ui.js';
import { reviewHtml } from './item.js';

export async function renderProfile(main, { params }) {
  const u = await store.getUser(params.id);
  if (!u) {
    main.innerHTML = `<div class="container section">${emptyState('Profile not found', '', '<a class="btn btn-primary" href="#/browse">Browse outfits</a>')}</div>`;
    return;
  }
  document.title = `${u.name} · RentMyCloset Baku`;
  const me = store.currentUser();
  const [items, reviews, favs] = await Promise.all([store.listItems({ ownerId: u.id, sort: 'newest' }), store.listReviews({ targetId: u.id }), store.getFavorites()]);

  main.innerHTML = `
  <section class="page-head">
    <div class="container profile-head">
      ${avatar(u, 96)}
      <div>
        <h1>${esc(u.name)}</h1>
        <div class="badge-row">${roleBadge(u)}${verifiedBadge(u)}</div>
        <p class="muted">${icon('calendar', 14)} Member since ${esc(fmtMonthYear(u.joined))} · ${ratingInline(u.rating)}</p>
        ${u.bio ? `<p class="bio">${esc(u.bio)}</p>` : ''}
      </div>
      ${me?.id === u.id ? `<a class="btn btn-outline" href="#/dashboard/settings">${icon('edit', 16)} Edit profile</a>` : ''}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <h2>${items.length ? `${items.length} ${items.length === 1 ? 'outfit' : 'outfits'} for rent` : 'Outfits'}</h2>
      ${items.length ? `<div class="item-grid">${items.map((i) => itemCard(i, favs)).join('')}</div>` : emptyState('No outfits listed right now')}
    </div>
  </section>
  <section class="section section-tint">
    <div class="container narrow-c">
      <h2>Reviews ${u.rating.count ? `<span class="muted">· ${u.rating.avg.toFixed(1)} ★</span>` : ''}</h2>
      ${reviews.length ? `<div class="review-list">${reviews.map(reviewHtml).join('')}</div>` : '<p class="muted">No reviews yet.</p>'}
    </div>
  </section>`;
}
