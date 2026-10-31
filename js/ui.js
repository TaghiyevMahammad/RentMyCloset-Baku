// Shared UI building blocks: icons, logo, illustrations, cards, toasts, modals.
import { esc, money, eventLabel, cityLabel, STATUS } from './utils.js';

// ---------- Icons (24x24, stroke-based) ----------
const ICONS = {
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v5M16.5 18.5h5"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3v3a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  arrowL: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  droplet: '<path d="M12 2.7s-6 6.3-6 11.3a6 6 0 0 0 12 0c0-5-6-11.3-6-11.3z"/>',
  idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  chart: '<path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-8"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="M9 4h6l-3 5z"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
  hanger: '<path d="M12 7V6a2 2 0 1 0-2-2"/><path d="M12 7 2.6 15.4A1.5 1.5 0 0 0 3.6 18h16.8a1.5 1.5 0 0 0 1-2.6z"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
};

export const icon = (name, size = 20, cls = '') =>
  `<svg class="i ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

// Logo: a clothes hanger whose hook is a location pin ("fashion + local").
export const logo = (size = 34) => `
<svg class="logo-mark" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
  <path d="M20 2.5a6.5 6.5 0 0 1 6.5 6.5c0 4.8-6.5 10.5-6.5 10.5S13.5 13.8 13.5 9A6.5 6.5 0 0 1 20 2.5z" fill="#D6336C"/>
  <circle cx="20" cy="9" r="2.4" fill="#fff"/>
  <path d="M20 19.5 4.6 31.2c-1.3 1-.6 2.8 1 2.8h28.8c1.6 0 2.3-1.8 1-2.8L20 19.5z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
</svg>`;

// ---------- Garment illustrations (used when an item has no photos) ----------
let artSeq = 0;
function mix(hex, amt) {
  // amt > 0 lightens toward white, amt < 0 darkens toward black
  const n = parseInt(hex.replace('#', ''), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt > 0 ? 255 : 0, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function garmentArt(art = {}, { bg = true, fit = 'slice' } = {}) {
  const style = art.style || 'gown';
  const color = /^#[0-9a-f]{6}$/i.test(art.color || '') ? art.color : '#D6336C';
  const id = `ga${++artSeq}`;
  const light = mix(color, 0.3), dark = mix(color, -0.3), back = mix(color, 0.88), back2 = mix(color, 0.78);
  const fill = `url(#${id}f)`;
  const hanger = `<g stroke="#9097ab" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M150 64V52q0-7 7-10t6-11q-2-9-11-8-7 1-8 8"/><path d="M150 64 96 82M150 64l54 18"/></g>`;
  let body = '';
  switch (style) {
    case 'cocktail':
      body = `${hanger}<path d="M118 72h10q22 34 44 0h10l6 50-10 40q22 55 42 126H72q20-71 42-126l-10-40z" fill="${fill}"/>
        <path d="M122 162q28 9 56 0" stroke="${dark}" stroke-width="4" fill="none" opacity=".55"/>
        <path d="M150 168q-6 60-24 118M150 168q10 60 30 118" stroke="${dark}" stroke-width="2" fill="none" opacity=".22"/>`;
      break;
    case 'suit':
      body = `${hanger}<path d="M110 70h80l38 20 10 214h-34l-4 34H100l-4-34H62l10-214z" fill="${fill}"/>
        <path d="M128 70 150 150 172 70z" fill="#f7f6f2"/>
        <path d="M144 84h12l-2 8 6 52-10 12-10-12 6-52z" fill="${dark}"/>
        <path d="M110 70l40 150 40-150" stroke="${dark}" stroke-width="3" fill="none" opacity=".7"/>
        <path d="M110 70l-6 44 22 12M190 70l6 44-22 12" stroke="${dark}" stroke-width="3" fill="none" opacity=".55"/>
        <circle cx="150" cy="240" r="4" fill="${dark}"/><circle cx="150" cy="268" r="4" fill="${dark}"/>
        <path d="M86 300V120M214 300V120" stroke="${dark}" stroke-width="2" opacity=".3"/>`;
      break;
    case 'national':
      body = `${hanger}<path d="M120 72h60l36 22 36 112-26 12-30-74-12 22q30 100 54 220H60q24-120 54-220l-12-22-30 74-26-12 36-112z" fill="${fill}"/>
        <path d="M120 72q30 26 60 0" stroke="#d8b34a" stroke-width="5" fill="none"/>
        <path d="M150 80v86" stroke="#d8b34a" stroke-width="4"/>
        <path d="M110 166q40 12 80 0" stroke="#d8b34a" stroke-width="6" fill="none"/>
        <path d="M64 372q86 16 172 0" stroke="#d8b34a" stroke-width="7" fill="none"/>
        <g fill="#d8b34a">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${96 + i * 27}" cy="${352 - (i === 2 ? 2 : 0)}" r="4"/>`).join('')}
          ${[0, 1, 2].map((i) => `<path d="M${132 + i * 18} 120l4 8-4 8-4-8z"/>`).join('')}</g>
        <path d="M226 210l20-8M74 210l-20-8" stroke="#d8b34a" stroke-width="5"/>`;
      break;
    case 'clutch':
      body = `<path d="M100 186q50-130 100 0" stroke="#b9952f" stroke-width="5" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>
        <rect x="70" y="180" width="160" height="104" rx="16" fill="${fill}"/>
        <path d="M70 196q80 64 160 0v-2q0-14-16-14H86q-16 0-16 14z" fill="${dark}" opacity=".35"/>
        <circle cx="150" cy="226" r="9" fill="#f5e7b5" stroke="${dark}" stroke-width="2"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${92 + i * 23}" cy="268" r="3" fill="#fff" opacity=".6"/>`).join('')}`;
      break;
    default: // gown
      body = `${hanger}<path d="M118 72h10q22 34 44 0h10l6 50-10 40q38 100 78 226H44q40-126 78-226l-10-40z" fill="${fill}"/>
        <path d="M122 162q28 9 56 0" stroke="${dark}" stroke-width="4" fill="none" opacity=".55"/>
        <path d="M150 168q-2 110-14 218M150 168q22 110 62 218M150 168q-26 110-66 218" stroke="${dark}" stroke-width="2" fill="none" opacity=".2"/>`;
  }
  return `<svg class="garment" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid ${fit === 'meet' ? 'meet' : 'slice'}" role="img" aria-label="${esc(style)} illustration">
    <defs>
      <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
      <radialGradient id="${id}b" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="${back}"/><stop offset="1" stop-color="${back2}"/></radialGradient>
    </defs>
    ${bg ? `<rect width="300" height="400" fill="url(#${id}b)"/>` : ''}
    <ellipse cx="150" cy="392" rx="110" ry="6" fill="#000" opacity=".06"/>
    ${body}
  </svg>`;
}

// fit 'meet' shows the whole illustration (used in the big gallery) and fills the sides with a matching colour.
export function itemMedia(item, index = 0, fit = 'slice') {
  const photo = item.photos?.[index];
  if (photo) return `<img src="${esc(photo)}" alt="${esc(item.title)}" loading="lazy">`;
  const c = /^#[0-9a-f]{6}$/i.test(item.art?.color || '') ? item.art.color : '#D6336C';
  const style = fit === 'meet' ? ` style="background:${mix(c, 0.8)}"` : '';
  return `<div class="art"${style}>${garmentArt(item.art, { fit })}</div>`;
}

// ---------- Small components ----------
export function avatar(user, size = 40) {
  const initials = (user?.name || '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return `<span class="avatar" style="--s:${size}px;background:${esc(user?.avatarColor || '#1F2440')}">${esc(initials)}</span>`;
}

export function stars(value = 0, size = 14) {
  return `<span class="stars" aria-label="${value.toFixed(1)} out of 5">${[1, 2, 3, 4, 5]
    .map((n) => `<span class="${value >= n - 0.25 ? 'on' : ''}">${icon('star', size)}</span>`)
    .join('')}</span>`;
}

export function ratingInline(r) {
  if (!r?.count) return '<span class="muted small">No reviews yet</span>';
  return `<span class="rating-inline">${icon('star', 14)} <b>${r.avg.toFixed(1)}</b> <span class="muted">(${r.count})</span></span>`;
}

export const statusBadge = (status) => `<span class="badge tone-${STATUS[status]?.tone || 'gray'}">${esc(STATUS[status]?.label || status)}</span>`;

export function roleBadge(user) {
  if (user?.role === 'salon') return `<span class="badge tone-navy">${icon('store', 12)} Salon</span>`;
  if (user?.role === 'admin') return `<span class="badge tone-rose">Team</span>`;
  return '';
}
export const verifiedBadge = (user) => (user?.verified ? `<span class="badge tone-green" title="ID checked by the team">${icon('shield', 12)} Verified</span>` : '');

export function itemCard(item, favIds = []) {
  const fav = favIds.includes(item.id);
  const r = item.rating;
  return `<article class="item-card">
    <a href="#/item/${esc(item.id)}" class="ic-media" aria-label="${esc(item.title)}">${itemMedia(item)}
      ${item.owner?.role === 'salon' ? `<span class="ic-tag">${icon('store', 12)} Salon</span>` : ''}
      ${item.status && item.status !== 'active' ? `<span class="ic-tag ic-tag-muted">Paused</span>` : ''}
    </a>
    <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${esc(item.id)}" aria-label="${fav ? 'Remove from saved' : 'Save'}" aria-pressed="${fav}">${icon('heart', 18)}</button>
    <div class="ic-body">
      <div class="ic-top">
        <span class="ic-meta">Size ${esc(item.size)} · ${esc(cityLabel(item.city) || eventLabel(item.events?.[0]))}</span>
        ${r?.count ? `<span class="ic-rating">${icon('star', 13)} ${r.avg.toFixed(1)}</span>` : `<span class="ic-new">New</span>`}
      </div>
      <h3 class="ic-title"><a href="#/item/${esc(item.id)}">${esc(item.title)}</a></h3>
      <div class="ic-price"><strong>${money(item.pricePerDay)}</strong><span>/ day</span>${item.retailPrice ? `<s title="Retail price">${money(item.retailPrice)}</s>` : ''}</div>
    </div>
  </article>`;
}

export const emptyState = (title, text = '', action = '') => `
  <div class="empty-state">
    <div class="empty-icon">${icon('hanger', 34)}</div>
    <h3>${esc(title)}</h3>
    ${text ? `<p>${esc(text)}</p>` : ''}
    ${action}
  </div>`;

export const skeletonGrid = (n = 8) =>
  `<div class="item-grid">${Array.from({ length: n }, () => '<div class="item-card skeleton"><div class="ic-media"></div><div class="ic-body"><div class="sk-line"></div><div class="sk-line short"></div></div></div>').join('')}</div>`;

// ---------- Toasts ----------
export function toast(message, type = 'info', ms = 3200) {
  const root = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `${icon(type === 'success' ? 'check' : type === 'error' ? 'alert' : 'info', 18)}<span>${esc(message)}</span>`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, ms);
}

// ---------- Modals ----------
let lastFocus = null;
export function openModal({ title, body, footer = '', wide = false, onClose }) {
  const root = document.getElementById('modal-root');
  lastFocus = document.activeElement;
  root.innerHTML = `<div class="modal-backdrop">
    <div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-head"><h3 id="modal-title">${esc(title)}</h3><button class="icon-btn" data-modal-close aria-label="Close">${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div></div>`;
  document.body.classList.add('no-scroll');
  const backdrop = root.querySelector('.modal-backdrop');
  const modal = root.querySelector('.modal');
  const close = () => {
    root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
    lastFocus?.focus?.();
    onClose?.();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('mousedown', (e) => e.target === backdrop && close());
  modal.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', close));
  requestAnimationFrame(() => (modal.querySelector('input, textarea, select, button:not([data-modal-close])') || modal).focus());
  return { modal, close };
}

export function confirmDialog(message, { title = 'Are you sure?', confirmText = 'Confirm', danger = false } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    const { modal, close } = openModal({
      title,
      body: `<p>${esc(message)}</p>`,
      footer: `<button class="btn btn-ghost" data-modal-close>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(confirmText)}</button>`,
      onClose: () => !answered && resolve(false),
    });
    modal.querySelector('[data-ok]').addEventListener('click', () => {
      answered = true;
      close();
      resolve(true);
    });
  });
}

// ---------- Images ----------
export function resizeImage(file, maxSize = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error(`${file.name} is not an image.`));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}.`));
    };
    img.src = url;
  });
}

export function setLoading(btn, loading, text) {
  if (!btn) return;
  if (loading) {
    btn.dataset.label = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>${text ? esc(text) : ''}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
  }
}
