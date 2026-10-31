import { store } from '../store.js';
import { esc, money, CITIES } from '../utils.js';
import { icon } from '../ui.js';

const FAQ = [
  ['Why would owners lend to strangers?', 'They earn money from clothes that would otherwise stay in the wardrobe. A deposit, condition photos and clear rules reduce the risk, and owners approve every request themselves.'],
  ['What if an item is damaged?', 'The deposit covers it, with photos from pickup and return as proof. Normal light wear is accepted. If there is damage, the owner keeps part or all of the deposit and explains why.'],
  ['Is it hygienic to wear a rented outfit?', 'Yes. Every outfit is professionally dry-cleaned before every rental. The cleaning fee is included in the price you see at checkout.'],
  ['How is this different from Instagram dress-hire pages?', 'One searchable place with availability calendars, standard rules, deposits and reviews, instead of messaging many separate pages one by one.'],
  ['How do I pay?', 'During the pilot you pay the owner in person at pickup: rental + cleaning fee + refundable deposit. Secure online payment is coming soon.'],
  ['What if I need to cancel?', 'You can cancel for free until pickup from your booking page. The dates become available again for others.'],
  ['How does RentMyCloset make money?', 'We take a small commission from the owner on each completed rental. Listing is free and renters pay no sign-up or subscription fee.'],
  ['Can men rent too?', 'Of course. We have suits and tuxedos for weddings, business events and graduations, and we are adding more every month.'],
];

export async function renderHowItWorks(main) {
  document.title = 'How it works · RentMyCloset';
  const s = store.getSettings();
  const pct = Math.round(s.commissionRate * 100);
  const ex = { price: 80, days: 2 };
  const rental = ex.price * ex.days;

  main.innerHTML = `
  <section class="page-head center">
    <div class="container narrow-c">
      <span class="kicker">How it works</span>
      <h1>Renting an outfit should be as easy as borrowing from a friend</h1>
      <p class="lead">Built for local communities: same-city pickup, clear rules and people you can trust.</p>
      <p class="muted small mt">${icon('pin', 14)} Now in ${CITIES.map((c) => esc(c.label)).join(', ')}.</p>
    </div>
  </section>

  <section class="section" id="renters">
    <div class="container">
      <div class="section-head"><div><span class="kicker">For renters</span><h2>Look amazing, pay a fraction</h2></div></div>
      <div class="steps four">
        ${step('search', 'Find your outfit', 'Filter by event, size, price and your dates. Only free outfits are shown.')}
        ${step('calendar', 'Request dates', 'Choose pickup and return days and send a request with a short message.')}
        ${step('phone', 'Get confirmed', 'The owner approves and you see their phone number to agree on a time.')}
        ${step('bag', 'Pick up & return', 'Pay at pickup, wear it, bring it back. Your deposit is returned.')}
      </div>
      <div class="btn-row"><a href="#/browse" class="btn btn-primary">Browse outfits</a></div>
    </div>
  </section>

  <section class="section section-tint" id="owners">
    <div class="container">
      <div class="section-head"><div><span class="kicker">For owners & salons</span><h2>Turn your wardrobe into income</h2></div></div>
      <div class="steps four">
        ${step('camera', 'List for free', 'Add photos, size, price per day and a deposit. We suggest a fair price.')}
        ${step('check', 'Approve requests', 'You decide who rents and when. Decline any request, no questions asked.')}
        ${step('idcard', 'Hand over safely', 'Check ID, take condition photos, collect payment and deposit.')}
        ${step('wallet', 'Get it back & earn', 'Confirm the return, release the deposit and get great reviews.')}
      </div>
      <div class="btn-row"><a href="#/list" class="btn btn-primary">List an outfit</a><a href="#/signup?role=salon" class="btn btn-outline">Join as a salon</a></div>
    </div>
  </section>

  <section class="section" id="pricing">
    <div class="container price-grid">
      <div>
        <span class="kicker">Pricing</span>
        <h2>Simple and fair</h2>
        <ul class="ticks">
          <li>${icon('check', 18)} Free to sign up and list</li>
          <li>${icon('check', 18)} No subscription for renters</li>
          <li>${icon('check', 18)} ${pct}% commission from the owner, only when they earn</li>
          <li>${icon('check', 18)} ${money(s.cleaningFee)} cleaning fee per rental</li>
          <li>${icon('check', 18)} Up to ${s.maxDays} days per rental, with a ${s.bufferDays}-day cleaning gap between rentals</li>
        </ul>
      </div>
      <div class="card example">
        <h3>Example: 2-day rental of an 80 AZN/day gown</h3>
        <div class="ex-cols">
          <div><h4>Renter pays</h4>
            <div class="q-row"><span>Rental (2 × 80)</span><span>${money(rental)}</span></div>
            <div class="q-row"><span>Cleaning</span><span>${money(s.cleaningFee)}</span></div>
            <div class="q-row"><span>Deposit (refunded)</span><span>${money(50)}</span></div>
            <div class="q-row total"><span>Net cost</span><span>${money(rental + s.cleaningFee)}</span></div>
          </div>
          <div><h4>Owner earns</h4>
            <div class="q-row"><span>Rental</span><span>${money(rental)}</span></div>
            <div class="q-row"><span>Commission ${pct}%</span><span>− ${money(rental * s.commissionRate)}</span></div>
            <div class="q-row total"><span>Payout</span><span>${money(rental * (1 - s.commissionRate))}</span></div>
          </div>
        </div>
        <p class="muted small">Buying the same gown: about 650 AZN, worn once.</p>
      </div>
    </div>
  </section>

  <section class="section section-navy" id="trust">
    <div class="container">
      <div class="section-head"><div><span class="kicker light">Trust & safety</span><h2>Protection built into every rental</h2></div></div>
      <div class="trust-cards four">
        ${trust('shield', 'Refundable deposit', 'Held until the outfit is returned in the agreed condition.')}
        ${trust('droplet', 'Dry-cleaned every time', 'Before every rental, at a partner cleaner.')}
        ${trust('camera', 'Condition photos', 'At pickup and return, saved to the booking.')}
        ${trust('idcard', 'ID check', 'First-time renters show ID at pickup. Verified badges after.')}
        ${trust('star', 'Two-way reviews', 'Owners review renters, renters review owners.')}
        ${trust('phone', 'Private contact', 'Phone numbers are shared only after approval.')}
        ${trust('users', 'Trusted circles first', 'We started with friends, classmates and known salons.')}
        ${trust('message', 'Team support', 'Something wrong? Our team helps solve it.')}
      </div>
    </div>
  </section>

  <section class="section" id="rules">
    <div class="container narrow-c">
      <span class="kicker">Rental rules</span>
      <h2>The rules everyone agrees to</h2>
      <ol class="rule-list">
        <li><b>Cleaning.</b> Renters must not wash or alter items. Professional cleaning is included in the cleaning fee.</li>
        <li><b>Deposit.</b> Paid at pickup in cash or by card transfer, returned at return if the outfit is in the same condition.</li>
        <li><b>Damage.</b> Small stains that come out in cleaning are normal wear. Tears, burns, lost items or permanent stains are deducted from the deposit, up to its full amount.</li>
        <li><b>Late return.</b> Each day late costs one extra rental day, deducted from the deposit.</li>
        <li><b>Cancellation.</b> Free until pickup. Please cancel as early as possible.</li>
        <li><b>Honesty.</b> Owners describe items accurately, including any flaws. Renters treat items as their own.</li>
      </ol>
    </div>
  </section>

  <section class="section section-tint" id="faq">
    <div class="container narrow-c">
      <span class="kicker">FAQ</span>
      <h2>Questions people ask</h2>
      <div class="faq">${FAQ.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(q)}${icon('chevD', 18)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      <p class="center mt">Still have a question? <a href="mailto:hello@rentmycloset.az">hello@rentmycloset.az</a></p>
    </div>
  </section>`;
}

const step = (ic, t, d) => `<div class="step"><div class="step-icon">${icon(ic, 24)}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`;
const trust = (ic, t, d) => `<div class="trust-card">${icon(ic, 22)}<h4>${esc(t)}</h4><p>${esc(d)}</p></div>`;
