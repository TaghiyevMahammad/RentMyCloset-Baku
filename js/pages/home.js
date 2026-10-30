import { store } from '../store.js';
import { navigate, buildHash } from '../router.js';
import { esc, money, today, EVENTS, SIZES } from '../utils.js';
import { icon, itemCard, garmentArt } from '../ui.js';

export async function renderHome(main) {
  document.title = 'RentMyCloset Baku · Wear it once. Share it forever.';
  const [items, favs] = await Promise.all([store.listItems({ sort: 'popular', limit: 8 }), store.getFavorites()]);
  const settings = store.getSettings();
  const pct = Math.round(settings.commissionRate * 100);

  main.innerHTML = `
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">${icon('pin', 15)} Made for Baku</span>
        <h1>Wear it once.<br><em>Share it forever.</em></h1>
        <p class="lead">Rent a stunning outfit for your next wedding, engagement or graduation for a fraction of the price, or earn money from the outfits already in your wardrobe.</p>
        <form class="hero-search" id="heroSearch" role="search">
          <label class="hs-field"><span>Event</span>
            <select name="event"><option value="">Any event</option>${EVENTS.map((e) => `<option value="${e.id}">${e.label}</option>`).join('')}</select></label>
          <label class="hs-field"><span>Size</span>
            <select name="size"><option value="">Any size</option>${SIZES.map((s) => `<option>${s}</option>`).join('')}</select></label>
          <label class="hs-field"><span>Event date</span><input type="date" name="date" min="${today()}"></label>
          <button class="btn btn-primary hs-btn" type="submit">${icon('search', 18)}<span>Search</span></button>
        </form>
        <div class="hero-trust">
          <span>${icon('shield', 16)} Deposit protected</span>
          <span>${icon('droplet', 16)} Dry-cleaned every time</span>
          <span>${icon('pin', 16)} Same-city pickup</span>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="hv-card hv-main">
          ${garmentArt({ style: 'gown', color: '#1f7a5a' })}
          <div class="hv-price"><small>Emerald gown · Size M</small><div><s>650 AZN</s><strong>80 AZN<span>/day</span></strong></div></div>
        </div>
        <div class="hv-card hv-side hv-a">${garmentArt({ style: 'suit', color: '#1f2a5a' })}<span class="hv-chip">Suits from 50 AZN</span></div>
        <div class="hv-card hv-side hv-b">${garmentArt({ style: 'cocktail', color: '#b3123d' })}<span class="hv-chip">${icon('check', 14)} Booking confirmed</span></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head"><div><span class="kicker">Shop by occasion</span><h2>What's the event?</h2></div><a href="#/browse" class="link-arrow">See all outfits ${icon('arrowR', 16)}</a></div>
      <div class="event-grid">
        ${EVENTS.map((e) => `<a class="event-tile" href="#/browse?event=${e.id}"><span class="et-icon">${icon(e.icon, 26)}</span><strong>${e.label}</strong><small>${items.length ? 'Browse outfits' : ''}</small></a>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section-tint" id="how">
    <div class="container">
      <div class="section-head center"><div><span class="kicker">How it works</span><h2>Three simple steps</h2></div></div>
      <div class="seg" role="tablist">
        <button class="seg-btn active" data-how="rent" role="tab" aria-selected="true">I want to rent</button>
        <button class="seg-btn" data-how="lend" role="tab" aria-selected="false">I want to lend</button>
      </div>
      <div class="steps" data-panel="rent">
        ${step(1, 'search', 'Find', 'Search by event, size, price and date. Every listing shows real photos, condition and an availability calendar.')}
        ${step(2, 'calendar', 'Request dates', 'Pick your dates and send a request. The owner confirms, usually within a few hours.')}
        ${step(3, 'bag', 'Pick up & shine', 'Meet in central Baku, check the outfit together, wear it, return it. Your deposit comes back.')}
      </div>
      <div class="steps" data-panel="lend" hidden>
        ${step(1, 'camera', 'List your outfit', 'Add photos, size and a price per day. It takes about three minutes and listing is free.')}
        ${step(2, 'check', 'Approve requests', 'You decide who rents and when. The renter leaves a deposit for peace of mind.')}
        ${step(3, 'wallet', 'Earn money', `Hand it over, get it back, get paid. We keep only ${pct}% commission.`)}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head"><div><span class="kicker">Popular right now</span><h2>Loved in Baku</h2></div><a href="#/browse" class="link-arrow">View all ${icon('arrowR', 16)}</a></div>
      <div class="item-grid">${items.map((i) => itemCard(i, favs)).join('')}</div>
    </div>
  </section>

  <section class="section section-navy" id="trust">
    <div class="container trust-grid">
      <div>
        <span class="kicker light">Trust & safety</span>
        <h2>Lending to a stranger? <br>We've thought about that.</h2>
        <p class="lead light">Every rental is protected by clear rules, so owners feel safe listing and renters feel safe wearing.</p>
        <a class="btn btn-primary" href="#/how-it-works#trust">Read the rules ${icon('arrowR', 18)}</a>
      </div>
      <div class="trust-cards">
        ${trust('shield', 'Deposit held', 'Returned in full when the item comes back in the agreed condition.')}
        ${trust('droplet', 'Dry-cleaned', 'Every outfit is professionally cleaned before every rental.')}
        ${trust('camera', 'Condition photos', 'Photos at pickup and return. No arguments, just proof.')}
        ${trust('idcard', 'ID check', 'First-time renters show ID at pickup. Verified badges build trust.')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container calc-grid">
      <div>
        <span class="kicker">For owners</span>
        <h2>Your wardrobe can pay for itself</h2>
        <p class="lead">That dress you wore once is losing value in your closet. Put it to work. Move the sliders to see what you could earn.</p>
        <ul class="ticks">
          <li>${icon('check', 18)} Free to list, no subscription</li>
          <li>${icon('check', 18)} You approve every request</li>
          <li>${icon('check', 18)} Only ${pct}% commission when you earn</li>
        </ul>
      </div>
      <div class="card calc" id="calc">
        <label class="range-field"><span>Price per day <b data-out="price">80 AZN</b></span><input type="range" name="price" min="20" max="200" step="5" value="80"></label>
        <label class="range-field"><span>Rentals per month <b data-out="rentals">3</b></span><input type="range" name="rentals" min="1" max="10" value="3"></label>
        <label class="range-field"><span>Days per rental <b data-out="days">2</b></span><input type="range" name="days" min="1" max="4" value="2"></label>
        <div class="calc-result"><small>You could earn</small><strong data-out="month">0 AZN</strong><span>per month · <b data-out="year">0 AZN</b> per year</span></div>
        <a class="btn btn-primary btn-block" href="#/list">${icon('plus', 18)} List your first outfit</a>
      </div>
    </div>
  </section>

  <section class="section section-tint">
    <div class="container salon-cta">
      <div class="salon-icon">${icon('store', 34)}</div>
      <div>
        <h3>Own a dress-hire salon?</h3>
        <p>Reach new customers who are already searching for outfits. List your collection, manage bookings in one calendar, and get a verified salon badge.</p>
      </div>
      <a class="btn btn-dark" href="#/signup?role=salon">Join as a salon ${icon('arrowR', 18)}</a>
    </div>
  </section>

  <section class="section">
    <div class="container final-cta">
      <h2>Your next event is closer than you think.</h2>
      <p>Find the outfit today, wear it this weekend.</p>
      <div class="btn-row center"><a class="btn btn-primary btn-lg" href="#/browse">${icon('search', 18)} Find an outfit</a><a class="btn btn-outline btn-lg" href="#/list">Lend your outfit</a></div>
    </div>
  </section>`;

  // Hero search -> browse page with filters.
  main.querySelector('#heroSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const date = f.get('date');
    navigate(buildHash('/browse', { event: f.get('event'), size: f.get('size'), start: date, end: date }));
  });

  // Rent / lend toggle.
  main.querySelectorAll('[data-how]').forEach((btn) =>
    btn.addEventListener('click', () => {
      main.querySelectorAll('[data-how]').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      main.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== btn.dataset.how));
    })
  );

  // Earnings calculator.
  const calc = main.querySelector('#calc');
  const out = (k, v) => (calc.querySelector(`[data-out="${k}"]`).textContent = v);
  const update = () => {
    const price = +calc.querySelector('[name=price]').value;
    const rentals = +calc.querySelector('[name=rentals]').value;
    const days = +calc.querySelector('[name=days]').value;
    const month = price * days * rentals * (1 - settings.commissionRate);
    out('price', money(price));
    out('rentals', rentals);
    out('days', days);
    out('month', money(month));
    out('year', money(month * 12));
  };
  calc.addEventListener('input', update);
  update();
}

const step = (n, ic, title, text) => `
  <div class="step"><div class="step-icon">${icon(ic, 24)}<span>${n}</span></div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
const trust = (ic, title, text) => `<div class="trust-card">${icon(ic, 22)}<h4>${esc(title)}</h4><p>${esc(text)}</p></div>`;
