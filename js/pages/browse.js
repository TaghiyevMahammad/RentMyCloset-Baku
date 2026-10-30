import { store } from '../store.js';
import { setQuery } from '../router.js';
import { esc, debounce, today, fmtRange, CATEGORIES, EVENTS, SIZES, GENDERS, AREAS, eventLabel, categoryLabel } from '../utils.js';
import { icon, itemCard, emptyState } from '../ui.js';

const PRICE_MAX = 200;

export async function renderBrowse(main, { query }) {
  document.title = 'Browse outfits · RentMyCloset Baku';
  const state = {
    q: query.q || '',
    category: query.category || '',
    gender: query.gender || '',
    events: query.event ? query.event.split(',') : [],
    sizes: query.size ? query.size.split(',') : [],
    max: Number(query.max) || PRICE_MAX,
    area: query.area || '',
    start: query.start || '',
    end: query.end || '',
    sort: query.sort || 'popular',
  };

  const radio = (name, value, label, current) =>
    `<label class="chip-check"><input type="radio" name="${name}" value="${esc(value)}" ${current === value ? 'checked' : ''}><span>${esc(label)}</span></label>`;
  const check = (name, value, label, list) =>
    `<label class="chip-check"><input type="checkbox" name="${name}" value="${esc(value)}" ${list.includes(value) ? 'checked' : ''}><span>${esc(label)}</span></label>`;

  main.innerHTML = `
  <section class="page-head">
    <div class="container">
      <h1>Browse outfits</h1>
      <p class="muted">Occasion wear from people and salons across Baku. Pick your dates to see only what's free.</p>
    </div>
  </section>
  <div class="container browse">
    <form class="filters" id="filters" aria-label="Filters">
      <div class="filters-head"><h3>${icon('filter', 18)} Filters</h3>
        <button type="button" class="link-btn" data-clear>Clear all</button>
        <button type="button" class="icon-btn filters-close" aria-label="Close filters">${icon('x')}</button>
      </div>
      <div class="filter-group"><h4>Your dates</h4>
        <div class="date-pair">
          <label><span>From</span><input type="date" name="start" min="${today()}" value="${esc(state.start)}"></label>
          <label><span>To</span><input type="date" name="end" min="${today()}" value="${esc(state.end)}"></label>
        </div>
      </div>
      <div class="filter-group"><h4>Category</h4><div class="chip-wrap">${radio('category', '', 'All', state.category)}${CATEGORIES.map((c) => radio('category', c.id, c.label, state.category)).join('')}</div></div>
      <div class="filter-group"><h4>For</h4><div class="chip-wrap">${radio('gender', '', 'Everyone', state.gender)}${GENDERS.filter((g) => g.id !== 'unisex').map((g) => radio('gender', g.id, g.label, state.gender)).join('')}</div></div>
      <div class="filter-group"><h4>Event</h4><div class="chip-wrap">${EVENTS.map((e) => check('event', e.id, e.label, state.events)).join('')}</div></div>
      <div class="filter-group"><h4>Size</h4><div class="chip-wrap">${SIZES.map((s) => check('size', s, s, state.sizes)).join('')}</div></div>
      <div class="filter-group"><h4>Max price per day <b data-maxout>${state.max >= PRICE_MAX ? 'Any' : state.max + ' AZN'}</b></h4>
        <input type="range" name="max" min="10" max="${PRICE_MAX}" step="5" value="${state.max}" aria-label="Maximum price per day">
      </div>
      <div class="filter-group"><h4>Pickup area</h4>
        <select name="area"><option value="">Anywhere in Baku</option>${AREAS.map((a) => `<option ${state.area === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>
      </div>
      <button type="button" class="btn btn-primary btn-block filters-apply">Show results</button>
    </form>
    <div class="filters-overlay" hidden></div>

    <div class="results">
      <div class="results-bar">
        <label class="search-input">${icon('search', 18)}<input type="search" name="q" placeholder="Search: emerald, suit, Jovani..." value="${esc(state.q)}" aria-label="Search outfits"></label>
        <button type="button" class="btn btn-outline filters-toggle">${icon('sliders', 18)} Filters <span class="count-pill" data-fcount></span></button>
        <label class="sort"><span class="hide-sm">Sort</span>
          <select name="sort" aria-label="Sort by">
            ${[['popular', 'Most popular'], ['newest', 'Newest'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['rating', 'Top rated']].map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="active-chips" data-chips></div>
      <p class="results-count" data-count aria-live="polite"></p>
      <div data-grid></div>
    </div>
  </div>`;

  const form = main.querySelector('#filters');
  const grid = main.querySelector('[data-grid]');
  const qInput = main.querySelector('[name=q]');
  const sortSel = main.querySelector('[name=sort]');
  const overlay = main.querySelector('.filters-overlay');

  function readForm() {
    const f = new FormData(form);
    state.category = f.get('category') || '';
    state.gender = f.get('gender') || '';
    state.events = f.getAll('event');
    state.sizes = f.getAll('size');
    state.max = Number(f.get('max'));
    state.area = f.get('area') || '';
    state.start = f.get('start') || '';
    state.end = f.get('end') || '';
    if (state.start && state.end && state.end < state.start) {
      state.end = state.start;
      form.elements.end.value = state.start;
    }
    form.elements.end.min = state.start || today();
    state.q = qInput.value.trim();
    state.sort = sortSel.value;
    main.querySelector('[data-maxout]').textContent = state.max >= PRICE_MAX ? 'Any' : state.max + ' AZN';
  }

  async function update() {
    readForm();
    setQuery('/browse', {
      q: state.q, category: state.category, gender: state.gender, event: state.events.join(','), size: state.sizes.join(','),
      max: state.max < PRICE_MAX ? state.max : '', area: state.area, start: state.start, end: state.end, sort: state.sort !== 'popular' ? state.sort : '',
    });
    const [items, favs] = await Promise.all([
      store.listItems({
        q: state.q, category: state.category, gender: state.gender, events: state.events, sizes: state.sizes,
        maxPrice: state.max < PRICE_MAX ? state.max : 0, area: state.area, start: state.start, end: state.end || state.start, sort: state.sort,
      }),
      store.getFavorites(),
    ]);
    renderChips();
    main.querySelector('[data-count]').innerHTML = `<b>${items.length}</b> ${items.length === 1 ? 'outfit' : 'outfits'}${state.start ? ` available ${esc(fmtRange(state.start, state.end || state.start))}` : ''}`;
    main.querySelector('.filters-apply').textContent = `Show ${items.length} results`;
    grid.innerHTML = items.length
      ? `<div class="item-grid">${items.map((i) => itemCard(i, favs)).join('')}</div>`
      : emptyState('No outfits match', 'Try removing a filter or choosing different dates.', '<button class="btn btn-outline" data-clear>Clear all filters</button>');
  }

  function renderChips() {
    const chips = [];
    if (state.q) chips.push(['q', '', `“${state.q}”`]);
    if (state.start) chips.push(['dates', '', fmtRange(state.start, state.end || state.start)]);
    if (state.category) chips.push(['category', '', categoryLabel(state.category)]);
    if (state.gender) chips.push(['gender', '', state.gender === 'men' ? 'Men' : 'Women']);
    state.events.forEach((e) => chips.push(['event', e, eventLabel(e)]));
    state.sizes.forEach((s) => chips.push(['size', s, 'Size ' + s]));
    if (state.max < PRICE_MAX) chips.push(['max', '', `Up to ${state.max} AZN`]);
    if (state.area) chips.push(['area', '', state.area]);
    main.querySelector('[data-chips]').innerHTML = chips
      .map(([k, v, label]) => `<button type="button" class="chip removable" data-rm="${k}" data-v="${esc(v)}">${esc(label)} ${icon('x', 14)}</button>`)
      .join('');
    const n = chips.filter(([k]) => k !== 'q').length;
    main.querySelector('[data-fcount]').textContent = n || '';
  }

  function clearAll() {
    form.reset();
    form.querySelectorAll('input[type=radio][value=""]').forEach((r) => (r.checked = true));
    form.querySelectorAll('input[type=checkbox]').forEach((c) => (c.checked = false));
    form.elements.max.value = PRICE_MAX;
    form.elements.start.value = form.elements.end.value = '';
    form.elements.area.value = '';
    qInput.value = '';
    update();
  }

  const toggleDrawer = (open) => {
    form.classList.toggle('open', open);
    overlay.hidden = !open;
    document.body.classList.toggle('no-scroll', open);
  };

  form.addEventListener('input', debounce(update, 120));
  form.addEventListener('submit', (e) => e.preventDefault());
  qInput.addEventListener('input', debounce(update, 250));
  sortSel.addEventListener('change', update);
  main.querySelector('.filters-toggle').addEventListener('click', () => toggleDrawer(true));
  main.querySelector('.filters-close').addEventListener('click', () => toggleDrawer(false));
  main.querySelector('.filters-apply').addEventListener('click', () => toggleDrawer(false));
  overlay.addEventListener('click', () => toggleDrawer(false));

  main.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear]')) return clearAll();
    const rm = e.target.closest('[data-rm]');
    if (!rm) return;
    const { rm: k, v } = rm.dataset;
    if (k === 'q') qInput.value = '';
    else if (k === 'dates') form.elements.start.value = form.elements.end.value = '';
    else if (k === 'category' || k === 'gender') form.querySelector(`input[name=${k}][value=""]`).checked = true;
    else if (k === 'event' || k === 'size') form.querySelector(`input[name=${k}][value="${CSS.escape(v)}"]`).checked = false;
    else if (k === 'max') form.elements.max.value = PRICE_MAX;
    else if (k === 'area') form.elements.area.value = '';
    update();
  });

  // Leaving the page must not leave the body locked.
  window.addEventListener('hashchange', () => document.body.classList.remove('no-scroll'), { once: true });
  await update();
}
