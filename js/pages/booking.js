import { store } from '../store.js';
import { navigate } from '../router.js';
import { esc, money, fmtRange, fmtDateTime, fmtDate, placeLabel, STATUS } from '../utils.js';
import { icon, itemMedia, avatar, statusBadge, emptyState, toast, confirmDialog, openModal, setLoading, stars, verifiedBadge, roleBadge } from '../ui.js';
import { createPhotoPicker } from '../components/photoPicker.js';
import { askReason } from './dashboard.js';

const FLOW = [
  ['requested', 'Request sent'],
  ['approved', 'Owner OK'],
  ['picked_up', 'Picked up'],
  ['completed', 'Returned'],
];

export async function renderBooking(main, { params }) {
  let b;
  try {
    b = await store.getBooking(params.id);
  } catch (err) {
    main.innerHTML = `<div class="container section">${emptyState('No access', err.message, '<a class="btn btn-primary" href="#/dashboard">Go to dashboard</a>')}</div>`;
    return;
  }
  if (!b) {
    main.innerHTML = `<div class="container section">${emptyState('Booking not found', '', '<a class="btn btn-primary" href="#/dashboard">Go to dashboard</a>')}</div>`;
    return;
  }
  document.title = `Booking · ${b.item.title} · RentMyCloset`;
  const role = b.viewerRole; // renter | owner | admin
  const isOwnerSide = role === 'owner' || role === 'admin';
  const other = role === 'renter' ? b.owner : b.renter;
  const at = (st) => b.history.find((h) => h.status === st)?.at;
  const stopped = ['declined', 'cancelled'].includes(b.status);
  const reached = FLOW.findIndex(([s]) => s === b.status);

  main.innerHTML = `
  <div class="container">
    <nav class="breadcrumb"><a href="#/dashboard/${role === 'renter' ? 'rentals' : 'requests'}">${icon('arrowL', 14)} Back to ${role === 'renter' ? 'my rentals' : 'requests'}</a></nav>
    <div class="booking-head">
      <div><h1>${esc(b.item.title)}</h1><p class="muted">${esc(fmtRange(b.start, b.end))} · ${b.days} ${b.days === 1 ? 'day' : 'days'} · Booking ${esc(b.id.slice(-6).toUpperCase())}</p></div>
      ${statusBadge(b.status)}
    </div>
  </div>
  <div class="container booking-layout">
    <div class="booking-main">
      <div class="card">
        ${stopped
          ? `<div class="notice notice-${b.status === 'declined' ? 'red' : 'gray'}">${icon('info', 18)}<div><b>This booking was ${b.status}.</b>${b.history.at(-1)?.note ? ` <span>Reason: “${esc(b.history.at(-1).note)}”</span>` : ''}${role === 'renter' ? ' <a href="#/browse">Find another outfit</a>' : ''}</div></div>`
          : `<ol class="timeline">${FLOW.map(([s, label], i) => `<li class="${i <= reached ? 'done' : ''} ${i === reached + 1 ? 'next' : ''}"><span class="tl-dot">${i <= reached ? icon('check', 14) : i + 1}</span><b>${label}</b><small>${at(s) ? esc(fmtDateTime(at(s))) : ''}</small></li>`).join('')}</ol>`}
        <div class="next-step">${nextStep(b, role)}</div>
        <div class="btn-row">${actions(b, role)}</div>
      </div>

      ${b.message ? `<div class="card"><h3>${icon('message', 18)} Message from ${esc(b.renter.name.split(' ')[0])}</h3><p class="quote-msg">“${esc(b.message)}”</p></div>` : ''}

      ${b.pickup || b.return ? `<div class="card"><h3>${icon('camera', 18)} Condition record</h3>
        ${b.pickup ? conditionBlock('At pickup', b.pickup, b.pickup.idChecked ? `${icon('idcard', 14)} ID checked` : '') : ''}
        ${b.return ? conditionBlock('At return', b.return, b.return.condition === 'good' ? `${icon('check', 14)} Returned in good condition` : `${icon('alert', 14)} Damage reported · ${money(b.return.deduction)} kept from deposit`) : ''}
      </div>` : ''}

      ${b.status === 'completed' ? reviewSection(b, role) : ''}

      <div class="card">
        <h3>${icon('clock', 18)} Activity</h3>
        <ul class="activity">${b.history.slice().reverse().map((h) => `<li><span class="act-dot tone-${STATUS[h.status]?.tone}"></span><div><b>${esc(STATUS[h.status]?.label || h.status)}</b><small class="muted">${esc(fmtDateTime(h.at))}</small>${h.note ? `<p>${esc(h.note)}</p>` : ''}</div></li>`).join('')}</ul>
      </div>
    </div>

    <aside class="booking-aside">
      <a class="card summary-item" href="#/item/${esc(b.item.id)}"><div class="si-media">${itemMedia(b.item)}</div><div><strong>${esc(b.item.title)}</strong><small class="muted">Size ${esc(b.item.size || '')} · ${icon('pin', 12)} ${esc(placeLabel(b.item))}</small></div></a>
      <div class="card">
        <h3>Payment summary</h3>
        <div class="quote flat">
          <div class="q-row"><span>${money(b.pricePerDay)} × ${b.days} ${b.days === 1 ? 'day' : 'days'}</span><span>${money(b.rental)}</span></div>
          ${role === 'renter' || role === 'admin' ? `<div class="q-row"><span>Cleaning fee</span><span>${money(b.cleaningFee)}</span></div>` : ''}
          <div class="q-row"><span>Deposit (refundable)</span><span>${money(b.deposit)}</span></div>
          ${role === 'renter' ? `<div class="q-row total"><span>Paid at pickup</span><span>${money(b.total)}</span></div>` : ''}
          ${isOwnerSide ? `<div class="q-row"><span>Commission (${Math.round(b.commissionRate * 100)}%)</span><span>− ${money(b.commission)}</span></div><div class="q-row total"><span>${role === 'admin' ? 'Owner payout' : 'You earn'}</span><span>${money(b.ownerPayout)}</span></div>` : ''}
          ${b.return ? `<div class="q-row refund"><span>Deposit returned</span><span>${money(b.return.depositRefund)}</span></div>` : ''}
        </div>
        ${role === 'admin' ? `<p class="muted small">Platform earns <b>${money(b.commission)}</b> on this booking.</p>` : ''}
      </div>
      <div class="card">
        <h3>${role === 'renter' ? 'Owner' : 'Renter'}</h3>
        <a class="person" href="#/user/${esc(other.id)}">${avatar(other, 44)}<div><strong>${esc(other.name)}</strong><div class="badge-row">${roleBadge(other)}${verifiedBadge(other)}</div></div></a>
        ${role === 'admin' ? `<p class="small muted">Owner: ${esc(b.owner.name)} ${b.owner.phone ? '· ' + esc(b.owner.phone) : ''}</p>` : ''}
        ${other.phone
          ? `<div class="contact"><a href="tel:${esc(other.phone.replace(/\s/g, ''))}">${icon('phone', 16)} ${esc(other.phone)}</a><a href="mailto:${esc(other.email)}">${icon('mail', 16)} ${esc(other.email)}</a></div>`
          : `<p class="muted small">${icon('shield', 14)} Contact details are shared after the owner approves the request.</p>`}
      </div>
      <div class="card">
        <h3>${icon('pin', 18)} Pickup</h3>
        <p class="small">Area: <b>${esc(placeLabel(b.item) || 'Agreed after approval')}</b><br>Pickup on <b>${esc(fmtDate(b.start, { weekday: 'long', day: 'numeric', month: 'long' }))}</b><br>Return by <b>${esc(fmtDate(b.end, { weekday: 'long', day: 'numeric', month: 'long' }))}</b></p>
        <p class="muted small">Agree on the exact place and time by phone. Check the outfit together and take condition photos.</p>
      </div>
    </aside>
  </div>`;

  const reload = () => navigate('/booking/' + b.id, { replace: true });
  const run = async (action, extra, msg) => {
    try {
      await store.transition(b.id, action, extra);
      toast(msg, 'success');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  main.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'approve') run('approve', {}, 'Approved! Contact details are now shared with the renter.');
    if (act === 'decline') {
      const reason = await askReason();
      if (reason !== null) run('decline', { reason }, 'Request declined.');
    }
    if (act === 'cancel' && (await confirmDialog('The owner will be notified and the dates become free again.', { title: 'Cancel this booking?', confirmText: 'Cancel booking', danger: true })))
      run('cancel', { reason: 'Cancelled by renter' }, 'Booking cancelled.');
    if (act === 'pickup') pickupDialog(b, run);
    if (act === 'return') returnDialog(b, run);
  });

  const rf = main.querySelector('[data-review]');
  rf?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(rf);
    const btn = rf.querySelector('button');
    setLoading(btn, true);
    try {
      await store.addReview({ bookingId: b.id, rating: f.get('rating'), text: f.get('text') });
      toast('Thanks for your review!', 'success');
      reload();
    } catch (err) {
      toast(err.message, 'error');
      setLoading(btn, false);
    }
  });
}

function nextStep(b, role) {
  const owner = role !== 'renter';
  const t = {
    requested: owner ? `<b>New request.</b> Approve to share contact details, or decline.` : `<b>Waiting for the owner.</b> You'll see their contact details here as soon as they approve.`,
    approved: owner ? `<b>Approved.</b> Meet the renter on ${fmtDate(b.start)}. Check their ID, take photos and collect payment + deposit, then confirm pickup.` : `<b>You're booked!</b> Call the owner to agree on a time. Bring ${money(b.total)} (incl. ${money(b.deposit)} refundable deposit) and your ID.`,
    picked_up: owner ? `<b>With the renter.</b> Due back on ${fmtDate(b.end)}. When you get it back, check it and confirm the return.` : `<b>Enjoy your event!</b> Please return the outfit on ${fmtDate(b.end)}. Don't wash it, we clean it.`,
    completed: `<b>All done.</b> ${owner ? `You earned ${money(b.ownerPayout)}.` : `Your deposit of ${money(b.return?.depositRefund ?? b.deposit)} was returned.`} ${b.myReview ? '' : 'Please leave a review below.'}`,
    declined: '',
    cancelled: '',
  };
  return t[b.status] ? `<p>${icon('info', 16)}<span>${t[b.status]}</span></p>` : '';
}

function actions(b, role) {
  const owner = role === 'owner' || role === 'admin';
  const renter = role === 'renter' || role === 'admin';
  const out = [];
  if (b.status === 'requested' && owner) out.push(`<button class="btn btn-primary" data-action="approve">${icon('check', 18)} Approve</button>`, `<button class="btn btn-ghost" data-action="decline">Decline</button>`);
  if (b.status === 'approved' && owner) out.push(`<button class="btn btn-primary" data-action="pickup">${icon('camera', 18)} Confirm pickup</button>`);
  if (b.status === 'picked_up' && owner) out.push(`<button class="btn btn-primary" data-action="return">${icon('check', 18)} Confirm return</button>`);
  if (['requested', 'approved'].includes(b.status) && renter) out.push(`<button class="btn btn-ghost danger" data-action="cancel">Cancel booking</button>`);
  return out.join('');
}

function conditionBlock(title, rec, note) {
  return `<div class="cond">
    <div class="cond-head"><b>${title}</b><small class="muted">${esc(fmtDateTime(rec.at))}</small></div>
    ${note ? `<p class="small">${note}</p>` : ''}
    ${rec.note ? `<p class="small muted">“${esc(rec.note)}”</p>` : ''}
    ${rec.photos?.length ? `<div class="cond-photos">${rec.photos.map((p) => `<a href="${esc(p)}" target="_blank" rel="noopener"><img src="${esc(p)}" alt="${title} photo"></a>`).join('')}</div>` : '<p class="small muted">No photos attached.</p>'}
  </div>`;
}

function reviewSection(b, role) {
  const shown = b.reviews
    .map((r) => `<div class="review compact"><div class="review-head">${avatar(r.author, 32)}<div><strong>${esc(r.author.name)}</strong><small class="muted">${r.role === 'renter' ? 'Renter' : 'Owner'}</small></div>${stars(r.rating)}</div>${r.text ? `<p>${esc(r.text)}</p>` : ''}</div>`)
    .join('');
  const form = !b.myReview && role !== 'admin'
    ? `<form data-review class="review-form">
        <p>How was ${role === 'renter' ? 'the outfit and the owner' : 'the renter'}?</p>
        <div class="star-input" role="radiogroup" aria-label="Rating">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="st${n}" value="${n}" ${n === 5 ? 'checked' : ''}><label for="st${n}" title="${n} stars">${icon('star', 26)}</label>`).join('')}</div>
        <textarea name="text" rows="3" maxlength="800" placeholder="${role === 'renter' ? 'Fit, quality, pickup experience...' : 'Was it returned on time and in good condition?'}"></textarea>
        <button class="btn btn-primary">Post review</button>
      </form>`
    : '';
  return `<div class="card"><h3>${icon('star', 18)} Reviews</h3>${shown || '<p class="muted small">No reviews yet.</p>'}${form}</div>`;
}

function pickupDialog(b, run) {
  const { modal, close } = openModal({
    title: 'Confirm pickup',
    wide: true,
    body: `<p class="muted">Check the outfit together with ${esc(b.renter.name.split(' ')[0])} and take a few photos. They are saved to this booking as proof of condition.</p>
      <div data-pp></div>
      <label class="check"><input type="checkbox" name="id"> I checked the renter's ID</label>
      <label class="check"><input type="checkbox" name="paid"> I received ${money(b.rental + b.cleaningFee)} + ${money(b.deposit)} deposit</label>
      <label class="field"><span>Notes <em>(optional)</em></span><textarea name="note" rows="2" placeholder="Tiny mark on the left sleeve, already there."></textarea></label>`,
    footer: `<button class="btn btn-ghost" data-modal-close>Cancel</button><button class="btn btn-primary" data-ok>Confirm pickup</button>`,
  });
  const pp = createPhotoPicker(modal.querySelector('[data-pp]'), { max: 4, maxSize: 700, quality: 0.7, label: 'Condition photos' });
  modal.querySelector('[data-ok]').addEventListener('click', () => {
    if (!modal.querySelector('[name=paid]').checked) return toast('Please confirm you received the payment and deposit.', 'error');
    if (pp.isBusy()) return toast('Photos are still loading.');
    close();
    run('pickup', { photos: pp.get(), idChecked: modal.querySelector('[name=id]').checked, note: modal.querySelector('[name=note]').value }, 'Pickup confirmed. Enjoy the event!');
  });
}

function returnDialog(b, run) {
  const { modal, close } = openModal({
    title: 'Confirm return',
    wide: true,
    body: `<p class="muted">Compare the outfit with the pickup photos. If all is fine, the full deposit of ${money(b.deposit)} goes back to the renter.</p>
      <div data-pp></div>
      <div class="radio-cards">
        <label><input type="radio" name="cond" value="good" checked><span>${icon('check', 18)} <b>Good condition</b><small>Return the full deposit</small></span></label>
        <label><input type="radio" name="cond" value="damaged"><span>${icon('alert', 18)} <b>Damaged or late</b><small>Keep part of the deposit</small></span></label>
      </div>
      <label class="field" data-ded hidden><span>Amount to keep from deposit (max ${money(b.deposit)})</span><input type="number" name="ded" min="0" max="${b.deposit}" value="0"></label>
      <label class="field"><span>Notes</span><textarea name="note" rows="2" placeholder="Returned on time, all good."></textarea></label>`,
    footer: `<button class="btn btn-ghost" data-modal-close>Cancel</button><button class="btn btn-primary" data-ok>Confirm return</button>`,
  });
  const pp = createPhotoPicker(modal.querySelector('[data-pp]'), { max: 4, maxSize: 700, quality: 0.7, label: 'Return photos' });
  modal.addEventListener('change', () => (modal.querySelector('[data-ded]').hidden = modal.querySelector('[name=cond]:checked').value !== 'damaged'));
  modal.querySelector('[data-ok]').addEventListener('click', () => {
    const condition = modal.querySelector('[name=cond]:checked').value;
    const note = modal.querySelector('[name=note]').value;
    if (condition === 'damaged' && !note.trim()) return toast('Please describe the damage in the notes.', 'error');
    if (pp.isBusy()) return toast('Photos are still loading.');
    close();
    run('return', { photos: pp.get(), condition, deduction: modal.querySelector('[name=ded]').value, note }, 'Return confirmed. Booking completed!');
  });
}
