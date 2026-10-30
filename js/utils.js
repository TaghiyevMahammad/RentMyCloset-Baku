// Pure helpers and shared constants (no DOM access here).

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('en-US')} AZN`;

// ---------- Dates (stored as local "YYYY-MM-DD" strings) ----------
export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => toISO(new Date());
export const addDays = (s, n) => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
export const rentalDays = (start, end) => daysBetween(start, end) + 1;
export const fmtDate = (s, opts = { day: 'numeric', month: 'short' }) => parseISO(s).toLocaleDateString('en-GB', opts);
export const fmtRange = (s, e) => (s === e ? fmtDate(s) : `${fmtDate(s)} – ${fmtDate(e, { day: 'numeric', month: 'short', year: 'numeric' })}`);
export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtMonthYear = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const debounce = (fn, ms = 250) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

// ---------- Catalogue constants ----------
export const CATEGORIES = [
  { id: 'dress', label: 'Dresses' },
  { id: 'suit', label: 'Suits' },
  { id: 'national', label: 'National costume' },
  { id: 'accessory', label: 'Accessories' },
];

export const EVENTS = [
  { id: 'wedding', label: 'Wedding', icon: 'ring' },
  { id: 'engagement', label: 'Engagement', icon: 'heart' },
  { id: 'graduation', label: 'Graduation', icon: 'cap' },
  { id: 'corporate', label: 'Corporate event', icon: 'briefcase' },
  { id: 'party', label: 'Party & birthday', icon: 'sparkles' },
  { id: 'photoshoot', label: 'Photoshoot', icon: 'camera' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size'];
export const GENDERS = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'unisex', label: 'Unisex' },
];
export const AREAS = ['Nizami (city centre)', '28 May', 'Ganjlik', 'Narimanov', 'Yasamal', 'Sahil', 'White City', 'Khatai'];
export const CONDITIONS = ['New with tags', 'Worn once', 'Like new', 'Gently used'];

export const COLORS = [
  { id: 'emerald', label: 'Emerald', hex: '#1f7a5a' },
  { id: 'ruby', label: 'Ruby', hex: '#b3123d' },
  { id: 'burgundy', label: 'Burgundy', hex: '#6d1a36' },
  { id: 'blush', label: 'Blush', hex: '#eea3b9' },
  { id: 'lilac', label: 'Lilac', hex: '#9b7bc8' },
  { id: 'sky', label: 'Sky blue', hex: '#76a9da' },
  { id: 'navy', label: 'Navy', hex: '#1f2a5a' },
  { id: 'charcoal', label: 'Charcoal', hex: '#45474f' },
  { id: 'black', label: 'Black', hex: '#1b1b20' },
  { id: 'champagne', label: 'Champagne', hex: '#dcc196' },
  { id: 'gold', label: 'Gold', hex: '#c9a13b' },
  { id: 'silver', label: 'Silver', hex: '#b7bcc6' },
  { id: 'ivory', label: 'Ivory', hex: '#efe8da' },
];

export const ART_STYLES = [
  { id: 'gown', label: 'Long gown' },
  { id: 'cocktail', label: 'Short dress' },
  { id: 'suit', label: 'Suit / blazer' },
  { id: 'national', label: 'National dress' },
  { id: 'clutch', label: 'Bag / clutch' },
];

export const STATUS = {
  requested: { label: 'Awaiting owner', tone: 'amber' },
  approved: { label: 'Approved', tone: 'blue' },
  picked_up: { label: 'With renter', tone: 'purple' },
  completed: { label: 'Completed', tone: 'green' },
  declined: { label: 'Declined', tone: 'red' },
  cancelled: { label: 'Cancelled', tone: 'gray' },
};

export const eventLabel = (id) => EVENTS.find((e) => e.id === id)?.label || id;
export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;
export const colorHex = (id) => COLORS.find((c) => c.id === id)?.hex || id;
export const colorLabel = (id) => COLORS.find((c) => c.id === id)?.label || id;
