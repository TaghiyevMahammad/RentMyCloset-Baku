import { store } from '../store.js';
import { navigate } from '../router.js';
import { esc, money, fmtRange, fmtMonthYear, eventLabel, categoryLabel, colorLabel, GENDERS } from '../utils.js';
import { icon, itemMedia, itemCard, avatar, stars, ratingInline, roleBadge, verifiedBadge, emptyState, toast, setLoading, confirmDialog } from '../ui.js';
import { createCalendar } from '../components/calendar.js';

export async function renderItem(main, { params }) {
  const item = await store.getItem(params.id);
  if (!item) {
    document.title = 'Item not found · RentMyCloset Baku';
    main.innerHTML = `<div class="container section">${emptyState('This outfit is no longer available', 'It may have been rented out or removed by the owner.', '<a class="btn btn-primary" href="#/browse">Browse other outfits</a>')}</div>`;
    return;
  }
  document.title = `${item.title} · RentMyCloset Baku`;
  const user = store.currentUser();
  const isOwner = user?.id === item.ownerId;
  const settings = store.getSettings();
  const [blocked, reviews, similar, favs] = await Promise.all([
    store.getBlockedDates(item.id),
    store.listReviews({ itemId: item.id }),
    store.listItems({ category: item.category, excludeId: item.id, limit: 4 }),
    store.getFavorites(),
  ]);
  const fav = favs.includes(item.id);
  const save = item.retailPrice ? Math.round((1 - (item.pricePerDay * 2) / item.retailPrice) * 100) : 0;
  const photos = item.photos.length ? item.photos : [null];

  main.innerHTML = `
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/browse">Browse</a>${icon('chevR', 14)}<a href="#/browse?category=${esc(item.category)}">${esc(categoryLabel(item.category))}</a>${icon('chevR', 14)}<span>${esc(item.title)}</span></nav>
    ${item.status !== 'active' ? `<div class="notice notice-amber">${icon('pause', 18)} This listing is paused and hidden from search. ${isOwner ? 'Resume it from the panel on the right.' : ''}</div>` : ''}
  </div>

  <div class="container item-layout">
    <section class="item-gallery" aria-label="Photos">
      <div class="gallery-main">
        <div data-main>${itemMedia(item, 0, 'meet')}</div>
        <button class="fav-btn lg ${fav ? 'on' : ''}" data-fav="${esc(item.id)}" aria-label="Save" aria-pressed="${fav}">${icon('heart', 20)}</button>
        ${photos.length > 1 ? `<button class="gal-nav prev" data-step="-1" aria-label="Previous photo">${icon('chevL')}</button><button class="gal-nav next" data-step="1" aria-label="Next photo">${icon('chevR')}</button>` : ''}
      </div>
      ${photos.length > 1 ? `<div class="gallery-thumbs">${photos.map((_, i) => `<button class="thumb ${i === 0 ? 'active' : ''}" data-photo="${i}" aria-label="Photo ${i + 1}">${itemMedia(item, i)}</button>`).join('')}</div>` : ''}
    </section>

    <aside class="item-aside" id="book">
      <div class="aside-card">
        <div class="tag-row">${item.events.map((e) => `<a class="tag" href="#/browse?event=${esc(e)}">${esc(eventLabel(e))}</a>`).join('')}</div>
        <h1 class="item-title">${esc(item.title)}</h1>
        <div class="item-sub">${ratingInline(item.rating)}${item.rentals ? `<span class="muted">· Rented ${item.rentals}×</span>` : ''}</div>
        <div class="price-row">
          <div><strong>${money(item.pricePerDay)}</strong><span>/ day</span></div>
          ${item.retailPrice ? `<div class="retail"><s>${money(item.retailPrice)}</s>${save > 0 ? `<span class="save">Save ${save}% on a 2-day rental</span>` : ''}</div>` : ''}
        </div>
        <div class="facts">
          <div><small>Size</small><b>${esc(item.size)}</b></div>
          <div><small>Condition</small><b>${esc(item.condition)}</b></div>
          <div><small>Pickup</small><b>${esc(item.area)}</b></div>
        </div>

        ${isOwner ? ownerPanel(item) : `
        <div class="booking-box">
          <h3>${icon('calendar', 18)} Choose your dates</h3>
          <p class="muted small">Click your pickup day, then your return day. Click the same day twice for a 1-day rental.</p>
          <div data-cal></div>
          <div data-quote></div>
          <label class="field"><span>Message to ${esc(item.owner.name.split(' ')[0])} <em>(optional)</em></span>
            <textarea name="message" rows="2" maxlength="500" placeholder="Hi! I need it for a wedding on Saturday. I'm 168 cm."></textarea></label>
          <button class="btn btn-primary btn-block btn-lg" data-request ${item.status !== 'active' ? 'disabled' : ''}>Request to rent</button>
          <p class="fine">${icon('info', 14)} You won't pay anything yet. The owner confirms first, then you pay at pickup.</p>
        </div>`}
      </div>
    </aside>

    <section class="item-details">
      <div class="detail-block">
        <h2>About this outfit</h2>
        <p class="pre">${esc(item.description || 'No description yet.')}</p>
        <dl class="spec">
          ${spec('Brand', item.brand || '—')}${spec('Colour', colorLabel(item.color) || '—')}${spec('Size', item.size)}
          ${spec('For', GENDERS.find((g) => g.id === item.gender)?.label || '—')}${spec('Category', categoryLabel(item.category))}
          ${spec('Retail price', item.retailPrice ? money(item.retailPrice) : '—')}${spec('Deposit', money(item.deposit) + ' (refundable)')}
        </dl>
      </div>

      <div class="detail-block owner-card">
        <a href="#/user/${esc(item.owner.id)}" class="owner-link">${avatar(item.owner, 56)}
          <div><span class="muted small">Listed by</span><strong>${esc(item.owner.name)}</strong>
            <div class="badge-row">${roleBadge(item.owner)}${verifiedBadge(item.owner)}</div></div></a>
        <div class="owner-stats">
          <div>${ratingInline(item.owner.rating)}<small>Owner rating</small></div>
          <div><b>${item.owner.listings}</b><small>Listings</small></div>
          <div><b>${esc(fmtMonthYear(item.owner.joined))}</b><small>Member since</small></div>
        </div>
      </div>

      <div class="detail-block">
        <h2>Rental rules</h2>
        <ul class="rules">
          <li>${icon('droplet', 18)}<div><b>Professionally cleaned</b><span>A ${money(settings.cleaningFee)} cleaning fee is added to every rental. Please don't wash the item yourself.</span></div></li>
          <li>${icon('shield', 18)}<div><b>${money(item.deposit)} refundable deposit</b><span>Paid at pickup, returned when the item comes back in the same condition.</span></div></li>
          <li>${icon('camera', 18)}<div><b>Condition photos</b><span>Taken together at pickup and return, saved to the booking.</span></div></li>
          <li>${icon('clock', 18)}<div><b>Return on time</b><span>Return on your last rental day. Late returns are charged one extra day per day late.</span></div></li>
        </ul>
      </div>

      <div class="detail-block" id="reviews">
        <h2>Reviews ${item.rating.count ? `<span class="muted">· ${item.rating.avg.toFixed(1)} ★ (${item.rating.count})</span>` : ''}</h2>
        ${reviews.length ? `<div class="review-list">${reviews.map(reviewHtml).join('')}</div>` : '<p class="muted">No reviews yet. Be the first to rent it!</p>'}
      </div>
    </section>
  </div>

  ${similar.length ? `<section class="section"><div class="container"><div class="section-head"><h2>You might also like</h2></div><div class="item-grid">${similar.map((i) => itemCard(i, favs)).join('')}</div></div></section>` : ''}

  ${isOwner ? '' : `<div class="mobile-book-bar"><div><strong>${money(item.pricePerDay)}</strong><span>/ day</span></div><a class="btn btn-primary" href="#/item/${esc(item.id)}#book" data-jump>Check dates</a></div>`}`;

  // ---------- Gallery ----------
  let current = 0;
  const show = (i) => {
    current = (i + photos.length) % photos.length;
    main.querySelector('[data-main]').innerHTML = itemMedia(item, current, 'meet');
    main.querySelectorAll('[data-photo]').forEach((t) => t.classList.toggle('active', Number(t.dataset.photo) === current));
  };
  main.querySelectorAll('[data-photo]').forEach((t) => t.addEventListener('click', () => show(Number(t.dataset.photo))));
  main.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => show(current + Number(b.dataset.step))));
  main.querySelector('[data-jump]')?.addEventListener('click', (e) => {
    e.preventDefault();
    main.querySelector('#book').scrollIntoView({ behavior: 'smooth' });
  });

  if (isOwner) return bindOwnerPanel(main, item);

  // ---------- Booking ----------
  let range = { start: null, end: null };
  const quoteEl = main.querySelector('[data-quote]');
  const renderQuote = async () => {
    if (!range.start) return (quoteEl.innerHTML = '');
    if (!range.end) return (quoteEl.innerHTML = `<p class="quote-hint">${icon('calendar', 16)} Pickup ${esc(fmtRange(range.start, range.start))}. Now choose your return day.</p>`);
    const q = await store.quote(item.id, range.start, range.end);
    quoteEl.innerHTML = `<div class="quote">
      <div class="q-dates">${icon('calendar', 16)} <b>${esc(fmtRange(range.start, range.end))}</b> <button type="button" class="link-btn" data-clear-dates>Change</button></div>
      <div class="q-row"><span>${money(item.pricePerDay)} × ${q.days} ${q.days === 1 ? 'day' : 'days'}</span><span>${money(q.rental)}</span></div>
      <div class="q-row"><span>Cleaning fee</span><span>${money(q.cleaningFee)}</span></div>
      <div class="q-row"><span>Deposit <em>(refunded after return)</em></span><span>${money(q.deposit)}</span></div>
      <div class="q-row total"><span>Total at pickup</span><span>${money(q.total)}</span></div>
      <div class="q-row refund"><span>You get back</span><span>${money(q.deposit)}</span></div>
    </div>`;
  };
  const cal = createCalendar(main.querySelector('[data-cal]'), {
    blocked,
    maxDays: settings.maxDays,
    onChange: (r) => {
      range = r;
      renderQuote();
    },
    onError: (m) => toast(m, 'error'),
  });
  quoteEl.addEventListener('click', (e) => e.target.closest('[data-clear-dates]') && cal.clear());

  main.querySelector('[data-request]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (!user) {
      toast('Log in or create a free account to send a request.');
      return navigate('/login?next=' + encodeURIComponent('/item/' + item.id));
    }
    if (!range.start) return toast('Choose your dates on the calendar first.', 'error');
    const end = range.end || range.start;
    if (!range.end && !(await confirmDialog(`Rent for one day only (${fmtRange(range.start, range.start)})?`, { title: 'One-day rental', confirmText: 'Yes, 1 day' }))) return;
    setLoading(btn, true, 'Sending request...');
    try {
      const b = await store.createBooking({ itemId: item.id, start: range.start, end, message: main.querySelector('[name=message]').value });
      toast('Request sent! The owner will confirm soon.', 'success', 4000);
      navigate('/booking/' + b.id);
    } catch (err) {
      toast(err.message, 'error');
      setLoading(btn, false);
    }
  });
}

const spec = (k, v) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;

export const reviewHtml = (r) => `
  <article class="review">
    <div class="review-head">${avatar(r.author, 40)}<div><strong>${esc(r.author.name)}</strong><small class="muted">${esc(new Date(r.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))}</small></div>${stars(r.rating)}</div>
    ${r.text ? `<p>${esc(r.text)}</p>` : ''}
  </article>`;

function ownerPanel(item) {
  return `<div class="owner-panel">
    <p class="muted small">${icon('info', 14)} This is your listing. Renters see the booking calendar here.</p>
    <div class="btn-col">
      <a class="btn btn-dark btn-block" href="#/list/${esc(item.id)}">${icon('edit', 18)} Edit listing</a>
      <button class="btn btn-outline btn-block" data-toggle-status>${item.status === 'active' ? `${icon('pause', 18)} Pause listing` : `${icon('play', 18)} Resume listing`}</button>
      <a class="btn btn-ghost btn-block" href="#/dashboard/requests">${icon('bag', 18)} View requests</a>
    </div>
    <h4 class="mt">Booked dates</h4>
    <div data-cal></div>
  </div>`;
}

async function bindOwnerPanel(main, item) {
  createCalendar(main.querySelector('[data-cal]'), { blocked: await store.getBlockedDates(item.id), readOnly: true });
  main.querySelector('[data-toggle-status]').addEventListener('click', async () => {
    await store.setItemStatus(item.id, item.status === 'active' ? 'paused' : 'active');
    toast(item.status === 'active' ? 'Listing paused. It is hidden from search.' : 'Listing is live again.', 'success');
    navigate('/item/' + item.id, { replace: true });
  });
}
