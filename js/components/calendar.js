// Availability calendar with range selection. Booked days (incl. cleaning buffer) are disabled.
import { toISO, parseISO, addDays, today, rentalDays } from '../utils.js';
import { icon } from '../ui.js';

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function createCalendar(el, { blocked = [], start = null, end = null, maxDays = 7, readOnly = false, onChange = () => {}, onError = () => {} } = {}) {
  const blockedSet = new Set(blocked);
  const min = today();
  let s = start;
  let e = end;
  const view = parseISO(start || min);
  // Near the end of a month, open on the next month so there are dates to pick.
  if (!start && new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate() - view.getDate() < 5) view.setMonth(view.getMonth() + 1, 1);
  view.setDate(1);

  const rangeOk = (a, b) => {
    for (let d = a; d <= b; d = addDays(d, 1)) if (blockedSet.has(d)) return false;
    return true;
  };

  function render() {
    const y = view.getFullYear();
    const m = view.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // weeks start on Monday
    const total = new Date(y, m + 1, 0).getDate();
    const minD = parseISO(min);
    const canPrev = y > minD.getFullYear() || (y === minD.getFullYear() && m > minD.getMonth());
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push('<span class="cal-cell empty"></span>');
    for (let d = 1; d <= total; d++) {
      const iso = toISO(new Date(y, m, d));
      const past = iso < min;
      const booked = blockedSet.has(iso);
      const endD = e || s;
      const sel = s && iso >= s && iso <= endD;
      const cls = [
        past && 'past',
        booked && !past && 'booked',
        sel && 'in-range',
        iso === s && 'range-start',
        s && iso === endD && 'range-end',
        iso === min && 'today',
      ].filter(Boolean).join(' ');
      const label = parseISO(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + (booked ? ', not available' : '');
      cells.push(`<button type="button" class="cal-cell ${cls}" data-date="${iso}" ${past || booked || readOnly ? 'disabled' : ''} aria-label="${label}" aria-pressed="${!!sel}">${d}</button>`);
    }
    el.innerHTML = `<div class="calendar ${readOnly ? 'readonly' : ''}">
      <div class="cal-head">
        <button type="button" class="icon-btn" data-nav="-1" ${canPrev ? '' : 'disabled'} aria-label="Previous month">${icon('chevL', 18)}</button>
        <strong>${view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" class="icon-btn" data-nav="1" aria-label="Next month">${icon('chevR', 18)}</button>
      </div>
      <div class="cal-week">${WEEK.map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="cal-grid">${cells.join('')}</div>
      <div class="cal-legend"><span><i class="lg lg-free"></i>Available</span><span><i class="lg lg-booked"></i>Booked / cleaning</span>${readOnly ? '' : '<span><i class="lg lg-sel"></i>Your dates</span>'}</div>
    </div>`;
  }

  el.addEventListener('click', (ev) => {
    const nav = ev.target.closest('[data-nav]');
    if (nav) {
      if (nav.disabled) return;
      view.setMonth(view.getMonth() + Number(nav.dataset.nav));
      render();
      return;
    }
    const cell = ev.target.closest('[data-date]');
    if (!cell || cell.disabled || readOnly) return;
    const d = cell.dataset.date;
    if (!s || e || d < s) {
      s = d;
      e = null;
    } else if (!rangeOk(s, d)) {
      onError('Some days in that range are already booked. Pick a shorter range.');
      s = d;
      e = null;
    } else if (rentalDays(s, d) > maxDays) {
      onError(`The maximum rental is ${maxDays} days.`);
      return;
    } else {
      e = d;
    }
    render();
    onChange({ start: s, end: e });
  });

  // Hover preview of the range while choosing the return date.
  el.addEventListener('mouseover', (ev) => {
    const cell = ev.target.closest('[data-date]');
    if (!cell || !s || e || readOnly) return;
    const h = cell.dataset.date;
    el.querySelectorAll('[data-date]').forEach((c) => c.classList.toggle('hover-range', h > s && c.dataset.date > s && c.dataset.date <= h));
  });
  el.addEventListener('mouseleave', () => el.querySelectorAll('.hover-range').forEach((c) => c.classList.remove('hover-range')));

  render();
  return {
    get: () => ({ start: s, end: e }),
    clear() {
      s = e = null;
      render();
      onChange({ start: null, end: null });
    },
  };
}
