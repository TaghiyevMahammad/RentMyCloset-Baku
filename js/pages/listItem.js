import { store } from '../store.js';
import { navigate } from '../router.js';
import { esc, money, CATEGORIES, EVENTS, SIZES, GENDERS, CITIES, areasFor, CONDITIONS, COLORS, ART_STYLES, colorHex } from '../utils.js';
import { icon, itemCard, emptyState, toast, setLoading } from '../ui.js';
import { createPhotoPicker } from '../components/photoPicker.js';

const defaultStyle = (cat) => ({ suit: 'suit', national: 'national', accessory: 'clutch' }[cat] || 'gown');

export async function renderListItem(main, { params }) {
  const user = store.currentUser();
  const settings = store.getSettings();
  const pct = Math.round(settings.commissionRate * 100);
  let item = null;
  if (params.id) {
    item = await store.getItem(params.id);
    if (!item || (item.ownerId !== user.id && user.role !== 'admin')) {
      main.innerHTML = `<div class="container section">${emptyState('You cannot edit this listing', '', '<a class="btn btn-primary" href="#/dashboard/listings">My listings</a>')}</div>`;
      return;
    }
  }
  const editing = !!item;
  document.title = `${editing ? 'Edit listing' : 'Lend your outfit'} · RentMyCloset`;
  const v = item || { category: 'dress', gender: 'women', events: [], size: '', color: 'emerald', condition: 'Worn once', city: store.getCity() || 'baku', area: areasFor(store.getCity() || 'baku')[0], photos: [], art: { style: 'gown', color: colorHex('emerald') } };
  let photos = [...(v.photos || [])];

  const opt = (list, cur) => list.map((x) => (typeof x === 'string' ? `<option ${x === cur ? 'selected' : ''}>${esc(x)}</option>` : `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${esc(x.label)}</option>`)).join('');

  main.innerHTML = `
  <section class="page-head">
    <div class="container">
      <h1>${editing ? 'Edit your listing' : 'Lend your outfit'}</h1>
      <p class="muted">${editing ? 'Changes are visible to renters right away.' : `Listing is free. You approve every request and earn ${100 - pct}% of the rental price.`}</p>
    </div>
  </section>
  <div class="container list-layout">
    <form class="list-form" novalidate>
      <fieldset class="card form-card">
        <legend><span class="num">1</span> Photos</legend>
        <p class="muted small">Daylight photos on a hanger or worn, front and back. Up to 6 photos. The first one is the cover.</p>
        <div data-photos></div>
        <div class="art-choice" data-artbox>
          <p class="small"><b>No photos yet?</b> We'll show an illustration until you add some. Pick a style:</p>
          <div class="chip-wrap">${ART_STYLES.map((s) => `<label class="chip-check"><input type="radio" name="artStyle" value="${s.id}" ${v.art?.style === s.id ? 'checked' : ''}><span>${s.label}</span></label>`).join('')}</div>
        </div>
      </fieldset>

      <fieldset class="card form-card">
        <legend><span class="num">2</span> The basics</legend>
        <label class="field"><span>Title</span><input name="title" maxlength="80" value="${esc(v.title || '')}" placeholder="e.g. Emerald satin evening gown" required><em class="err" data-err="title"></em></label>
        <div class="field-row">
          <label class="field"><span>Category</span><select name="category">${opt(CATEGORIES, v.category)}</select></label>
          <label class="field"><span>For</span><select name="gender">${opt(GENDERS, v.gender)}</select></label>
        </div>
        <div class="field"><span>Size</span><div class="chip-wrap">${SIZES.map((s) => `<label class="chip-check"><input type="radio" name="size" value="${s}" ${v.size === s ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div><em class="err" data-err="size"></em></div>
        <div class="field"><span>Perfect for (choose all that fit)</span><div class="chip-wrap">${EVENTS.map((e) => `<label class="chip-check"><input type="checkbox" name="events" value="${e.id}" ${v.events.includes(e.id) ? 'checked' : ''}><span>${e.label}</span></label>`).join('')}</div><em class="err" data-err="events"></em></div>
      </fieldset>

      <fieldset class="card form-card">
        <legend><span class="num">3</span> Details</legend>
        <div class="field"><span>Colour</span><div class="swatches">${COLORS.map((c) => `<label class="swatch" title="${c.label}"><input type="radio" name="color" value="${c.id}" ${v.color === c.id ? 'checked' : ''}><span style="--c:${c.hex}"></span><small>${c.label}</small></label>`).join('')}</div></div>
        <div class="field-row">
          <label class="field"><span>Brand <em>(optional)</em></span><input name="brand" maxlength="40" value="${esc(v.brand || '')}" placeholder="e.g. Zara, Jovani, handmade"></label>
          <label class="field"><span>Condition</span><select name="condition">${opt(CONDITIONS, v.condition)}</select></label>
        </div>
        <label class="field"><span>Description</span><textarea name="description" rows="4" maxlength="1500" placeholder="Fabric, fit, length, what's included, any tiny flaws. Honest descriptions get better reviews.">${esc(v.description || '')}</textarea></label>
      </fieldset>

      <fieldset class="card form-card">
        <legend><span class="num">4</span> Price & deposit</legend>
        <div class="field-row three">
          <label class="field"><span>Retail price (AZN)</span><input type="number" name="retailPrice" min="0" step="1" inputmode="numeric" value="${v.retailPrice ?? ''}" placeholder="650"></label>
          <label class="field"><span>Price per day (AZN)</span><input type="number" name="pricePerDay" min="1" step="1" inputmode="numeric" value="${v.pricePerDay ?? ''}" placeholder="80"><em class="err" data-err="pricePerDay"></em></label>
          <label class="field"><span>Deposit (AZN)</span><input type="number" name="deposit" min="0" step="1" inputmode="numeric" value="${v.deposit ?? ''}" placeholder="50"><em class="err" data-err="deposit"></em></label>
        </div>
        <div class="hint-box" data-suggest></div>
      </fieldset>

      <fieldset class="card form-card">
        <legend><span class="num">5</span> Pickup</legend>
        <div class="field-row">
          <label class="field"><span>City</span><select name="city">${opt(CITIES, v.city)}</select><em class="err" data-err="city"></em></label>
          <label class="field"><span>Pickup area</span><select name="area">${opt(areasFor(v.city), v.area)}</select><em class="err" data-err="area"></em></label>
        </div>
        <p class="muted small">${icon('pin', 14)} Only the area is public. You agree on the exact meeting point after you approve a request.</p>
      </fieldset>

      <div class="form-actions">
        ${editing ? `<a class="btn btn-ghost" href="#/item/${esc(item.id)}">Cancel</a>` : ''}
        <button class="btn btn-primary btn-lg" type="submit">${editing ? `${icon('check', 18)} Save changes` : `${icon('upload', 18)} Publish listing`}</button>
      </div>
    </form>

    <aside class="list-preview">
      <div class="sticky">
        <h4 class="muted small upper">Live preview</h4>
        <div data-preview></div>
        <div class="card earn-card" data-earn></div>
      </div>
    </aside>
  </div>`;

  const form = main.querySelector('form');
  const picker = createPhotoPicker(main.querySelector('[data-photos]'), {
    max: 6,
    photos,
    label: 'Add photos',
    onChange: (list) => {
      photos = list;
      refresh();
    },
  });

  function data() {
    const f = new FormData(form);
    const category = f.get('category');
    const color = f.get('color') || 'emerald';
    return {
      title: f.get('title').trim(),
      category,
      gender: f.get('gender'),
      size: f.get('size') || '',
      events: f.getAll('events'),
      color,
      brand: f.get('brand').trim(),
      condition: f.get('condition'),
      description: f.get('description'),
      retailPrice: Number(f.get('retailPrice')) || 0,
      pricePerDay: Number(f.get('pricePerDay')) || 0,
      deposit: f.get('deposit') === '' ? '' : Number(f.get('deposit')),
      city: f.get('city'),
      area: f.get('area'),
      photos,
      art: { style: f.get('artStyle') || defaultStyle(category), color: colorHex(color) },
    };
  }

  function refresh() {
    const d = data();
    main.querySelector('[data-artbox]').hidden = photos.length > 0;
    main.querySelector('[data-preview]').innerHTML = itemCard({
      ...d, id: item?.id || 'preview', title: d.title || 'Your outfit title', size: d.size || '—',
      events: d.events.length ? d.events : ['wedding'], rating: { count: 0 }, owner: { role: user.role },
    });
    const sug = main.querySelector('[data-suggest]');
    if (d.retailPrice > 0) {
      const lo = Math.round((d.retailPrice * 0.125) / 5) * 5;
      const hi = Math.round((d.retailPrice * 0.175) / 5) * 5;
      const dep = Math.round((d.retailPrice * 0.1) / 10) * 10;
      sug.innerHTML = `${icon('sparkles', 16)}<div>Suggested: <b>${lo}–${hi} AZN/day</b>, so a 2-day rental costs renters 25–35% of retail. Suggested deposit: <b>${Math.max(dep, 20)} AZN</b>. <button type="button" class="link-btn" data-apply="${Math.round((lo + hi) / 2 / 5) * 5}|${Math.max(dep, 20)}">Use these</button></div>`;
    } else sug.innerHTML = `${icon('info', 16)}<div>Enter the retail price and we'll suggest a fair price per day.</div>`;
    const per2 = d.pricePerDay * 2;
    main.querySelector('[data-earn]').innerHTML = d.pricePerDay
      ? `<small>For a 2-day rental you earn</small><strong>${money(per2 * (1 - settings.commissionRate))}</strong><span class="muted small">${money(per2)} minus ${pct}% commission. Rent it 3 times a month: <b>${money(per2 * 3 * (1 - settings.commissionRate))}</b>.</span>`
      : `<small>Your earnings</small><strong>—</strong><span class="muted small">Set a price per day to see what you'll earn.</span>`;
  }

  form.elements.city.addEventListener('change', () => (form.elements.area.innerHTML = opt(areasFor(form.elements.city.value), '')));
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  main.querySelector('[data-suggest]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-apply]');
    if (!b) return;
    const [p, dep] = b.dataset.apply.split('|');
    form.elements.pricePerDay.value = p;
    form.elements.deposit.value = dep;
    refresh();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (picker.isBusy()) return toast('Please wait until photos finish loading.');
    form.querySelectorAll('[data-err]').forEach((x) => (x.textContent = ''));
    const btn = form.querySelector('[type=submit]');
    setLoading(btn, true, editing ? 'Saving...' : 'Publishing...');
    try {
      const d = data();
      const saved = editing ? await store.updateItem(item.id, d) : await store.createItem(d);
      toast(editing ? 'Changes saved.' : 'Your outfit is live!', 'success');
      navigate('/item/' + saved.id);
    } catch (err) {
      setLoading(btn, false);
      if (err.fields) {
        Object.entries(err.fields).forEach(([k, m]) => {
          const el = form.querySelector(`[data-err="${k}"]`);
          if (el) el.textContent = m;
        });
        form.querySelector('[data-err]:not(:empty)')?.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast(err.message, 'error');
    }
  });

  refresh();
}
