// ============================================================================
// DATA LAYER
// Every read/write in the app goes through this file. Today it saves to the
// browser (localStorage). To move to a real database (e.g. Supabase), keep the
// same function names and replace their bodies with API calls. See README.md.
// All functions are async on purpose so that swap needs no page changes.
// ============================================================================
import { seedData, DEMO_PASSWORD } from './seed.js';
import { today, addDays, rentalDays, CITIES, areasFor } from './utils.js';

const DB_KEY = 'rmc_db_v1';
const SESSION_KEY = 'rmc_session_v1';
const CITY_KEY = 'rmc_city';
const DB_VERSION = 2;
const BLOCKING = ['requested', 'approved', 'picked_up'];
const CONTACT_VISIBLE = ['approved', 'picked_up', 'completed'];

let db = null;
let listening = false;

const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();
const emit = (detail = {}) => window.dispatchEvent(new CustomEvent('rmc:change', { detail }));

function persist() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    db = JSON.parse(localStorage.getItem(DB_KEY)); // roll back the change
    throw new Error('Browser storage is full. Try fewer or smaller photos.');
  }
  emit();
}

async function hash(pw) {
  const data = new TextEncoder().encode('rmc-salt:' + pw);
  if (window.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  for (const c of data) h = (h * 31 + c) | 0;
  return 'x' + h;
}

// ---------- internal helpers ----------
const findUser = (id) => db.users.find((u) => u.id === id);
const findItem = (id) => db.items.find((i) => i.id === id);

function me() {
  const id = localStorage.getItem(SESSION_KEY);
  return id ? findUser(id) || null : null;
}
function requireUser() {
  const u = me();
  if (!u) throw new Error('Please log in first.');
  return u;
}

function userRating(userId) {
  const rs = db.reviews.filter((r) => r.targetId === userId);
  return { avg: rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0, count: rs.length };
}
function itemRating(itemId) {
  const rs = db.reviews.filter((r) => r.itemId === itemId && r.role === 'renter');
  return { avg: rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0, count: rs.length };
}

function publicUser(u, withContact = false) {
  if (!u) return { id: 'deleted', name: 'Deleted user', role: 'user', avatarColor: '#999' };
  const out = {
    id: u.id, name: u.name, role: u.role, bio: u.bio, avatarColor: u.avatarColor,
    verified: u.verified, joined: u.joined, rating: userRating(u.id),
    listings: db.items.filter((i) => i.ownerId === u.id && i.status === 'active').length,
  };
  if (withContact) Object.assign(out, { phone: u.phone, email: u.email });
  return out;
}

function enrichItem(it) {
  return {
    ...clone(it),
    owner: publicUser(findUser(it.ownerId)),
    rating: itemRating(it.id),
    rentals: db.bookings.filter((b) => b.itemId === it.id && b.status === 'completed').length,
  };
}

function blockedSet(itemId, excludeBookingId) {
  const buf = db.settings.bufferDays;
  const set = new Set();
  db.bookings
    .filter((b) => b.itemId === itemId && BLOCKING.includes(b.status) && b.id !== excludeBookingId)
    .forEach((b) => {
      for (let d = addDays(b.start, -buf); d <= addDays(b.end, buf); d = addDays(d, 1)) set.add(d);
    });
  return set;
}
function isFree(itemId, start, end) {
  const blocked = blockedSet(itemId);
  for (let d = start; d <= end; d = addDays(d, 1)) if (blocked.has(d)) return false;
  return true;
}

function enrichBooking(b, viewer) {
  const it = findItem(b.itemId);
  const showContact = CONTACT_VISIBLE.includes(b.status) || viewer?.role === 'admin';
  return {
    ...clone(b),
    item: it ? { id: it.id, title: it.title, photos: it.photos.slice(0, 1), art: it.art, size: it.size, city: it.city, area: it.area } : { id: b.itemId, title: 'Deleted item', photos: [], art: { style: 'gown', color: '#ccc' } },
    renter: publicUser(findUser(b.renterId), showContact),
    owner: publicUser(findUser(b.ownerId), showContact),
  };
}

function validateItem(data) {
  const errors = {};
  if (!data.title || data.title.trim().length < 4) errors.title = 'Give your item a title (at least 4 characters).';
  if (!data.category) errors.category = 'Choose a category.';
  if (!data.size) errors.size = 'Choose a size.';
  if (!data.events?.length) errors.events = 'Pick at least one event type.';
  if (!(Number(data.pricePerDay) > 0)) errors.pricePerDay = 'Enter a price per day.';
  if (!(Number(data.deposit) >= 0)) errors.deposit = 'Enter a deposit (0 or more).';
  if (!CITIES.some((c) => c.id === data.city)) errors.city = 'Choose a city.';
  if (!data.area || (data.city && !areasFor(data.city).includes(data.area))) errors.area = 'Choose a pickup area in this city.';
  if (Object.keys(errors).length) {
    const e = new Error('Please fix the highlighted fields.');
    e.fields = errors;
    throw e;
  }
}

const ITEM_FIELDS = ['title', 'category', 'gender', 'events', 'size', 'color', 'brand', 'condition', 'retailPrice', 'pricePerDay', 'deposit', 'city', 'area', 'description', 'photos', 'art'];
function pickItemFields(data) {
  const out = {};
  ITEM_FIELDS.forEach((k) => data[k] !== undefined && (out[k] = data[k]));
  ['retailPrice', 'pricePerDay', 'deposit'].forEach((k) => out[k] !== undefined && (out[k] = Math.max(0, Number(out[k]) || 0)));
  if (typeof out.title === 'string') out.title = out.title.trim().slice(0, 80);
  if (typeof out.description === 'string') out.description = out.description.trim().slice(0, 1500);
  return out;
}

// Upgrade data saved by an older version of the app, keeping everything users created.
async function migrate() {
  if (db.version === 1) {
    // v2: items have a city. Old data was Baku-only. Also add the new demo cities.
    db.items.forEach((i) => (i.city ||= 'baku'));
    const fresh = seedData();
    const h = await hash(DEMO_PASSWORD);
    fresh.users.filter((u) => !findUser(u.id)).forEach((u) => db.users.push({ ...u, passHash: h }));
    fresh.items.filter((i) => !findItem(i.id)).forEach((i) => db.items.push(i));
    db.version = 2;
  }
  persist();
}

// ============================================================================
// PUBLIC API
// ============================================================================
export const store = {
  async init() {
    try {
      db = JSON.parse(localStorage.getItem(DB_KEY));
    } catch {
      db = null;
    }
    if (!db || !db.version || db.version > DB_VERSION) {
      db = seedData();
      const h = await hash(DEMO_PASSWORD);
      db.users.forEach((u) => (u.passHash = h));
      persist();
    } else if (db.version < DB_VERSION) {
      await migrate();
    }
    // Keep several open tabs in sync.
    if (listening) return;
    listening = true;
    window.addEventListener('storage', (e) => {
      if (e.key === DB_KEY && e.newValue) {
        db = JSON.parse(e.newValue);
        emit({ external: true });
      }
      if (e.key === SESSION_KEY) emit({ external: true, session: true });
    });
  },

  // ---------- Auth ----------
  currentUser() {
    const u = me();
    if (!u) return null;
    const { passHash, ...rest } = clone(u);
    return rest;
  },
  async login(email, password) {
    const u = db.users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!u || u.passHash !== (await hash(password))) throw new Error('Wrong email or password.');
    localStorage.setItem(SESSION_KEY, u.id);
    emit({ session: true });
    return this.currentUser();
  },
  async signup({ name, email, password, phone, role }) {
    email = String(email || '').trim().toLowerCase();
    if (!name || name.trim().length < 2) throw new Error('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (db.users.some((u) => u.email.toLowerCase() === email)) throw new Error('An account with this email already exists.');
    const palette = ['#D6336C', '#7b5ea7', '#1f7a5a', '#1F2440', '#c9a13b', '#3b7bbf'];
    const u = {
      id: uid('u'), name: name.trim(), email, phone: (phone || '').trim(), role: role === 'salon' ? 'salon' : 'user',
      bio: '', avatarColor: palette[Math.floor(Math.random() * palette.length)], verified: false, joined: now(),
      passHash: await hash(password),
    };
    db.users.push(u);
    persist();
    localStorage.setItem(SESSION_KEY, u.id);
    emit({ session: true });
    return this.currentUser();
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
    emit({ session: true });
  },
  async updateProfile(patch) {
    const u = requireUser();
    if (patch.name !== undefined) {
      if (patch.name.trim().length < 2) throw new Error('Name is too short.');
      u.name = patch.name.trim();
    }
    if (patch.phone !== undefined) u.phone = patch.phone.trim();
    if (patch.bio !== undefined) u.bio = patch.bio.trim().slice(0, 400);
    persist();
    return this.currentUser();
  },
  async getUser(id) {
    const u = findUser(id);
    return u ? publicUser(u) : null;
  },

  // ---------- Items ----------
  async listItems(f = {}) {
    const viewer = me();
    let list = db.items.filter((i) => (f.includeHidden && (viewer?.id === i.ownerId || viewer?.role === 'admin')) || i.status === 'active');
    if (f.ownerId) list = list.filter((i) => i.ownerId === f.ownerId);
    if (f.ids) list = list.filter((i) => f.ids.includes(i.id));
    if (f.q) {
      const q = f.q.toLowerCase();
      list = list.filter((i) => [i.title, i.brand, i.color, i.description, i.category, i.size, ...(i.events || [])].join(' ').toLowerCase().includes(q));
    }
    if (f.category) list = list.filter((i) => i.category === f.category);
    if (f.gender) list = list.filter((i) => i.gender === f.gender || i.gender === 'unisex');
    if (f.events?.length) list = list.filter((i) => f.events.some((e) => i.events.includes(e)));
    if (f.sizes?.length) list = list.filter((i) => f.sizes.includes(i.size));
    if (f.maxPrice) list = list.filter((i) => i.pricePerDay <= Number(f.maxPrice));
    if (f.city) list = list.filter((i) => i.city === f.city);
    if (f.area) list = list.filter((i) => i.area === f.area);
    if (f.start) list = list.filter((i) => isFree(i.id, f.start, f.end && f.end >= f.start ? f.end : f.start));
    if (f.excludeId) list = list.filter((i) => i.id !== f.excludeId);

    let out = list.map(enrichItem);
    const sorters = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      price_asc: (a, b) => a.pricePerDay - b.pricePerDay,
      price_desc: (a, b) => b.pricePerDay - a.pricePerDay,
      rating: (a, b) => b.rating.avg - a.rating.avg || b.rating.count - a.rating.count,
      popular: (a, b) => b.rentals - a.rentals || b.rating.avg - a.rating.avg || b.createdAt.localeCompare(a.createdAt),
    };
    out.sort(sorters[f.sort] || sorters.popular);
    if (f.limit) out = out.slice(0, f.limit);
    return out;
  },
  async getItem(id) {
    const it = findItem(id);
    if (!it) return null;
    const viewer = me();
    if (it.status !== 'active' && viewer?.id !== it.ownerId && viewer?.role !== 'admin') return null;
    return enrichItem(it);
  },
  async createItem(data) {
    const u = requireUser();
    const fields = pickItemFields(data);
    validateItem(fields);
    const it = { id: uid('i'), ownerId: u.id, status: 'active', minDays: 1, photos: [], gender: 'women', condition: 'Like new', createdAt: now(), ...fields };
    db.items.push(it);
    persist();
    return enrichItem(it);
  },
  async updateItem(id, data) {
    const u = requireUser();
    const it = findItem(id);
    if (!it) throw new Error('Item not found.');
    if (it.ownerId !== u.id && u.role !== 'admin') throw new Error('You can only edit your own items.');
    const fields = pickItemFields(data);
    validateItem({ ...it, ...fields });
    Object.assign(it, fields);
    if (data.status && ['active', 'paused', 'hidden'].includes(data.status)) it.status = data.status;
    persist();
    return enrichItem(it);
  },
  async setItemStatus(id, status) {
    const u = requireUser();
    const it = findItem(id);
    if (!it) throw new Error('Item not found.');
    if (it.ownerId !== u.id && u.role !== 'admin') throw new Error('Not allowed.');
    it.status = status;
    persist();
  },
  async deleteItem(id) {
    const u = requireUser();
    const it = findItem(id);
    if (!it) return;
    if (it.ownerId !== u.id && u.role !== 'admin') throw new Error('Not allowed.');
    if (db.bookings.some((b) => b.itemId === id && BLOCKING.includes(b.status)))
      throw new Error('This item has open bookings. Finish them first, or pause the listing instead.');
    db.items = db.items.filter((i) => i.id !== id);
    Object.values(db.favorites).forEach((arr) => {
      const k = arr.indexOf(id);
      if (k >= 0) arr.splice(k, 1);
    });
    persist();
  },
  async getBlockedDates(itemId) {
    return [...blockedSet(itemId)];
  },
  async isAvailable(itemId, start, end) {
    return isFree(itemId, start, end);
  },

  // ---------- Bookings ----------
  async quote(itemId, start, end) {
    const it = findItem(itemId);
    const s = db.settings;
    const days = rentalDays(start, end);
    const rental = days * it.pricePerDay;
    return { days, rental, cleaningFee: s.cleaningFee, deposit: it.deposit, total: rental + s.cleaningFee + it.deposit, commission: Math.round(rental * s.commissionRate), commissionRate: s.commissionRate };
  },
  async createBooking({ itemId, start, end, message }) {
    const u = requireUser();
    const it = findItem(itemId);
    const s = db.settings;
    if (!it || it.status !== 'active') throw new Error('This item is not available for rent right now.');
    if (it.ownerId === u.id) throw new Error("You can't rent your own item.");
    if (!start || !end || end < start) throw new Error('Please choose your rental dates.');
    if (start < today()) throw new Error('Dates in the past cannot be booked.');
    const days = rentalDays(start, end);
    if (days > s.maxDays) throw new Error(`Maximum rental is ${s.maxDays} days.`);
    if (!isFree(itemId, start, end)) throw new Error('Some of these dates were just booked. Please choose other dates.');
    const rental = days * it.pricePerDay;
    const commission = Math.round(rental * s.commissionRate);
    const b = {
      id: uid('b'), itemId, renterId: u.id, ownerId: it.ownerId, start, end, days, pricePerDay: it.pricePerDay,
      rental, cleaningFee: s.cleaningFee, deposit: it.deposit, commissionRate: s.commissionRate, commission,
      ownerPayout: rental - commission, total: rental + s.cleaningFee + it.deposit,
      message: (message || '').trim().slice(0, 500), status: 'requested',
      history: [{ status: 'requested', at: now(), by: u.id, note: (message || '').trim() }],
      pickup: null, return: null, createdAt: now(),
    };
    db.bookings.push(b);
    persist();
    return enrichBooking(b, u);
  },
  async listBookings({ as = 'renter', status } = {}) {
    const u = requireUser();
    let list = db.bookings;
    if (as === 'renter') list = list.filter((b) => b.renterId === u.id);
    else if (as === 'owner') list = list.filter((b) => b.ownerId === u.id);
    else if (as === 'all' && u.role !== 'admin') throw new Error('Admins only.');
    if (status) list = list.filter((b) => (Array.isArray(status) ? status.includes(b.status) : b.status === status));
    return list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((b) => enrichBooking(b, u));
  },
  async getBooking(id) {
    const u = requireUser();
    const b = db.bookings.find((x) => x.id === id);
    if (!b) return null;
    if (![b.renterId, b.ownerId].includes(u.id) && u.role !== 'admin') throw new Error('You do not have access to this booking.');
    const out = enrichBooking(b, u);
    out.reviews = db.reviews.filter((r) => r.bookingId === id).map((r) => ({ ...clone(r), author: publicUser(findUser(r.authorId)) }));
    out.myReview = out.reviews.find((r) => r.authorId === u.id) || null;
    out.viewerRole = b.renterId === u.id ? 'renter' : b.ownerId === u.id ? 'owner' : 'admin';
    return out;
  },
  async transition(id, action, extra = {}) {
    const u = requireUser();
    const b = db.bookings.find((x) => x.id === id);
    if (!b) throw new Error('Booking not found.');
    const isOwner = b.ownerId === u.id;
    const isRenter = b.renterId === u.id;
    const isAdmin = u.role === 'admin';
    const rules = {
      approve: { from: ['requested'], allowed: isOwner || isAdmin, to: 'approved' },
      decline: { from: ['requested'], allowed: isOwner || isAdmin, to: 'declined' },
      cancel: { from: ['requested', 'approved'], allowed: isRenter || isAdmin, to: 'cancelled' },
      pickup: { from: ['approved'], allowed: isOwner || isAdmin, to: 'picked_up' },
      return: { from: ['picked_up'], allowed: isOwner || isAdmin, to: 'completed' },
    };
    const r = rules[action];
    if (!r) throw new Error('Unknown action.');
    if (!r.allowed) throw new Error('You are not allowed to do this.');
    if (!r.from.includes(b.status)) throw new Error('This booking has already moved on. Refresh the page.');
    if (action === 'approve') {
      const others = blockedSet(b.itemId, b.id);
      for (let d = b.start; d <= b.end; d = addDays(d, 1)) if (others.has(d)) throw new Error('These dates clash with another booking.');
    }
    if (action === 'pickup') b.pickup = { at: now(), photos: extra.photos || [], idChecked: !!extra.idChecked, note: (extra.note || '').trim() };
    if (action === 'return') {
      const deduction = Math.min(Math.max(0, Math.round(Number(extra.deduction) || 0)), b.deposit);
      const condition = extra.condition === 'damaged' ? 'damaged' : 'good';
      b.return = { at: now(), photos: extra.photos || [], condition, deduction: condition === 'good' ? 0 : deduction, depositRefund: b.deposit - (condition === 'good' ? 0 : deduction), note: (extra.note || '').trim() };
    }
    b.status = r.to;
    b.history.push({ status: r.to, at: now(), by: u.id, note: (extra.note || extra.reason || '').trim() });
    persist();
    return this.getBooking(id);
  },
  async pendingRequestsCount() {
    const u = me();
    if (!u) return 0;
    return db.bookings.filter((b) => b.ownerId === u.id && b.status === 'requested').length;
  },

  // ---------- Reviews ----------
  async addReview({ bookingId, rating, text }) {
    const u = requireUser();
    const b = db.bookings.find((x) => x.id === bookingId);
    if (!b || b.status !== 'completed') throw new Error('You can review only after the item is returned.');
    const role = b.renterId === u.id ? 'renter' : b.ownerId === u.id ? 'owner' : null;
    if (!role) throw new Error('Not allowed.');
    if (db.reviews.some((r) => r.bookingId === bookingId && r.authorId === u.id)) throw new Error('You already left a review.');
    rating = Math.round(Number(rating));
    if (!(rating >= 1 && rating <= 5)) throw new Error('Choose a rating from 1 to 5 stars.');
    db.reviews.push({ id: uid('r'), bookingId, itemId: b.itemId, authorId: u.id, targetId: role === 'renter' ? b.ownerId : b.renterId, role, rating, text: (text || '').trim().slice(0, 800), createdAt: now() });
    persist();
  },
  async listReviews({ itemId, targetId } = {}) {
    let rs = db.reviews;
    if (itemId) rs = rs.filter((r) => r.itemId === itemId && r.role === 'renter');
    if (targetId) rs = rs.filter((r) => r.targetId === targetId);
    return rs
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({ ...clone(r), author: publicUser(findUser(r.authorId)), itemTitle: findItem(r.itemId)?.title || '' }));
  },

  // ---------- Favourites ----------
  async getFavorites() {
    const u = me();
    return u ? clone(db.favorites[u.id] || []) : [];
  },
  async toggleFavorite(itemId) {
    const u = requireUser();
    const list = (db.favorites[u.id] ||= []);
    const k = list.indexOf(itemId);
    if (k >= 0) list.splice(k, 1);
    else list.push(itemId);
    persist();
    return k < 0;
  },

  // ---------- Location preference (saved in this browser) ----------
  getCity() {
    const c = localStorage.getItem(CITY_KEY) || '';
    return CITIES.some((x) => x.id === c) ? c : '';
  },
  setCity(id) {
    if (id && CITIES.some((x) => x.id === id)) localStorage.setItem(CITY_KEY, id);
    else localStorage.removeItem(CITY_KEY);
    emit({ city: true });
  },
  cityCounts() {
    const counts = {};
    db.items.filter((i) => i.status === 'active').forEach((i) => (counts[i.city] = (counts[i.city] || 0) + 1));
    return counts;
  },

  // ---------- Settings & admin ----------
  getSettings() {
    return clone(db.settings);
  },
  async updateSettings(patch) {
    const u = requireUser();
    if (u.role !== 'admin') throw new Error('Admins only.');
    const s = db.settings;
    if (patch.commissionRate !== undefined) s.commissionRate = Math.min(0.5, Math.max(0, Number(patch.commissionRate)));
    if (patch.cleaningFee !== undefined) s.cleaningFee = Math.max(0, Number(patch.cleaningFee) || 0);
    if (patch.bufferDays !== undefined) s.bufferDays = Math.min(3, Math.max(0, parseInt(patch.bufferDays, 10) || 0));
    if (patch.maxDays !== undefined) s.maxDays = Math.min(30, Math.max(1, parseInt(patch.maxDays, 10) || 1));
    persist();
  },
  async adminOverview() {
    const u = requireUser();
    if (u.role !== 'admin') throw new Error('Admins only.');
    const bookings = db.bookings.map((b) => enrichBooking(b, u)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const done = db.bookings.filter((b) => b.status === 'completed');
    const live = db.bookings.filter((b) => ['approved', 'picked_up', 'completed'].includes(b.status));
    const byStatus = {};
    db.bookings.forEach((b) => (byStatus[b.status] = (byStatus[b.status] || 0) + 1));
    const byCategory = {};
    db.items.forEach((i) => (byCategory[i.category] = (byCategory[i.category] || 0) + 1));
    const byCity = {};
    db.items.filter((i) => i.status === 'active').forEach((i) => (byCity[i.city] = (byCity[i.city] || 0) + 1));
    return {
      stats: {
        users: db.users.length,
        items: db.items.filter((i) => i.status === 'active').length,
        bookings: db.bookings.length,
        completed: done.length,
        gmv: live.reduce((a, b) => a + b.rental, 0),
        commission: done.reduce((a, b) => a + b.commission, 0),
        pipelineCommission: live.filter((b) => b.status !== 'completed').reduce((a, b) => a + b.commission, 0),
        avgRental: done.length ? done.reduce((a, b) => a + b.rental, 0) / done.length : 0,
        byStatus,
        byCategory,
        byCity,
      },
      bookings,
      users: db.users.map((x) => ({ ...publicUser(x, true), bookings: db.bookings.filter((b) => b.renterId === x.id).length })),
      items: db.items.map(enrichItem),
    };
  },
  async setUserVerified(userId, verified) {
    const u = requireUser();
    if (u.role !== 'admin') throw new Error('Admins only.');
    const t = findUser(userId);
    if (t) t.verified = !!verified;
    persist();
  },
  exportData() {
    const data = clone(db);
    data.users.forEach((u) => delete u.passHash);
    return data;
  },
  async resetDemo() {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    db = null;
    await this.init();
    emit({ session: true });
  },
};
