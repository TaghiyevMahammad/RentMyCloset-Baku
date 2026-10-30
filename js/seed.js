// Demo data used the first time the site opens (and after "Reset demo data").
// Dates are relative to today so the demo always looks current.
import { today, addDays } from './utils.js';

export const DEMO_PASSWORD = 'demo1234';

export const DEMO_ACCOUNTS = [
  { email: 'aysel@demo.az', label: 'Aysel', hint: 'Renter — has upcoming and past rentals' },
  { email: 'leyla@demo.az', label: 'Leyla', hint: 'Owner — has pending requests to approve' },
  { email: 'salon@demo.az', label: 'Elegance Salon', hint: 'Dress-hire salon with many listings' },
  { email: 'team@rentmycloset.az', label: 'Team (admin)', hint: 'Admin panel, stats and settings' },
];

export function seedData() {
  const T = today();
  const d = (n) => addDays(T, n);
  const ts = (n) => new Date(Date.now() + n * 86400000).toISOString();

  const users = [
    { id: 'u_aysel', name: 'Aysel Mammadova', email: 'aysel@demo.az', phone: '+994 50 111 22 33', role: 'user', bio: 'Always at a wedding or a graduation. Love trying new styles.', avatarColor: '#D6336C', verified: true, joined: ts(-120) },
    { id: 'u_leyla', name: 'Leyla Huseynova', email: 'leyla@demo.az', phone: '+994 55 222 33 44', role: 'user', bio: 'Event lover with a wardrobe full of dresses worn once. Happy to share them.', avatarColor: '#7b5ea7', verified: true, joined: ts(-200) },
    { id: 'u_nigar', name: 'Nigar Aliyeva', email: 'nigar@demo.az', phone: '+994 70 333 44 55', role: 'user', bio: 'Photographer. My outfits from photoshoots are waiting for a second life.', avatarColor: '#1f7a5a', verified: true, joined: ts(-160) },
    { id: 'u_salon', name: 'Elegance Dress Hire', email: 'salon@demo.az', phone: '+994 12 444 55 66', role: 'salon', bio: 'Dress-hire salon near Fountain Square. Evening gowns, suits and national costumes, professionally cleaned.', avatarColor: '#1F2440', verified: true, joined: ts(-300) },
    { id: 'u_rashad', name: 'Rashad Karimov', email: 'rashad@demo.az', phone: '+994 51 555 66 77', role: 'user', bio: 'Suits for every occasion. Each one worn once or twice.', avatarColor: '#45474f', verified: true, joined: ts(-90) },
    { id: 'u_murad', name: 'Murad Hasanov', email: 'murad@demo.az', phone: '+994 77 666 77 88', role: 'user', bio: '', avatarColor: '#c9a13b', verified: false, joined: ts(-40) },
    { id: 'u_admin', name: 'RentMyCloset Team', email: 'team@rentmycloset.az', phone: '+994 50 000 00 00', role: 'admin', bio: 'The team behind RentMyCloset Baku.', avatarColor: '#D6336C', verified: true, joined: ts(-365) },
  ];

  const item = (id, ownerId, o) => ({
    id, ownerId, status: 'active', photos: [], minDays: 1,
    gender: 'women', brand: '', condition: 'Worn once', area: 'Nizami (city centre)',
    createdAt: ts(-(Math.abs(id.charCodeAt(id.length - 1)) % 60) - 1), ...o,
  });

  const items = [
    item('i_emerald', 'u_leyla', { title: 'Emerald satin evening gown', category: 'dress', events: ['wedding', 'engagement'], size: 'M', color: 'emerald', brand: 'Self-Portrait', pricePerDay: 80, deposit: 50, retailPrice: 650, condition: 'Worn once', area: 'Nizami (city centre)', art: { style: 'gown', color: '#1f7a5a' }, description: 'Floor-length satin gown with thin straps and a soft drape. Worn once to a cousin\'s wedding and dry-cleaned. Fits a true M, height 165-175 cm works best.' }),
    item('i_ruby', 'u_nigar', { title: 'Ruby cocktail dress', category: 'dress', events: ['party', 'graduation'], size: 'S', color: 'ruby', brand: 'Zara Studio', pricePerDay: 45, deposit: 40, retailPrice: 320, condition: 'Like new', area: 'Ganjlik', art: { style: 'cocktail', color: '#b3123d' }, description: 'Knee-length structured cocktail dress in deep red. Looks amazing in photos. Hidden zip, fully lined.' }),
    item('i_champagne', 'u_salon', { title: 'Champagne sequin gown', category: 'dress', events: ['wedding', 'party'], size: 'L', color: 'champagne', brand: 'Jovani', pricePerDay: 95, deposit: 100, retailPrice: 900, condition: 'Gently used', area: 'Nizami (city centre)', art: { style: 'gown', color: '#dcc196' }, description: 'Full-sequin gown that catches every light at a wedding hall. Professionally cleaned and steamed by our salon before each rental.' }),
    item('i_navysuit', 'u_rashad', { title: 'Navy slim-fit suit', category: 'suit', gender: 'men', events: ['corporate', 'wedding'], size: 'M', color: 'navy', brand: 'Hugo Boss', pricePerDay: 60, deposit: 80, retailPrice: 700, condition: 'Worn once', area: '28 May', art: { style: 'suit', color: '#1f2a5a' }, description: 'Two-piece wool suit, size 48 (M). Jacket and trousers. Perfect for weddings and business events. Shirt not included.' }),
    item('i_tux', 'u_salon', { title: 'Classic black tuxedo', category: 'suit', gender: 'men', events: ['wedding', 'corporate'], size: 'L', color: 'black', brand: 'Massimo Dutti', pricePerDay: 70, deposit: 100, retailPrice: 850, condition: 'Like new', area: 'Nizami (city centre)', art: { style: 'suit', color: '#1b1b20' }, description: 'Satin-lapel tuxedo, size 50 (L). Includes bow tie. Tailoring adjustments possible at our salon for a small fee.' }),
    item('i_national', 'u_nigar', { title: 'Azerbaijani national dress', category: 'national', events: ['photoshoot', 'engagement'], size: 'M', color: 'burgundy', brand: 'Handmade', pricePerDay: 55, deposit: 60, retailPrice: 500, condition: 'Like new', area: 'Ganjlik', art: { style: 'national', color: '#6d1a36' }, description: 'Velvet national dress with gold embroidery, ideal for engagement (nişan) ceremonies, Novruz and photoshoots.' }),
    item('i_blush', 'u_leyla', { title: 'Blush tulle princess gown', category: 'dress', events: ['engagement', 'photoshoot'], size: 'XS', color: 'blush', brand: 'Needle & Thread', pricePerDay: 75, deposit: 70, retailPrice: 720, condition: 'Worn once', area: 'Nizami (city centre)', art: { style: 'gown', color: '#eea3b9' }, description: 'Layered tulle with delicate embroidery. Worn once for an engagement photoshoot.' }),
    item('i_lilac', 'u_leyla', { title: 'Lilac midi dress', category: 'dress', events: ['graduation', 'party'], size: 'M', color: 'lilac', brand: 'Mango', pricePerDay: 40, deposit: 30, retailPrice: 260, condition: 'Like new', area: 'Nizami (city centre)', art: { style: 'cocktail', color: '#9b7bc8' }, description: 'Flowing midi dress, comfortable for long ceremonies. Great for graduation day.' }),
    item('i_goldclutch', 'u_salon', { title: 'Gold beaded clutch', category: 'accessory', gender: 'women', events: ['wedding', 'party'], size: 'One size', color: 'gold', brand: '', pricePerDay: 15, deposit: 30, retailPrice: 180, condition: 'Like new', area: 'Nizami (city centre)', art: { style: 'clutch', color: '#c9a13b' }, description: 'Hand-beaded evening clutch with a detachable chain. The finishing touch for any gown.' }),
    item('i_ivory', 'u_salon', { title: 'Ivory engagement gown', category: 'dress', events: ['engagement', 'wedding'], size: 'S', color: 'ivory', brand: 'Pronovias', pricePerDay: 110, deposit: 150, retailPrice: 1400, condition: 'Gently used', area: 'Nizami (city centre)', art: { style: 'gown', color: '#efe8da' }, description: 'Elegant ivory gown with a lace bodice. A favourite for engagement ceremonies and civil weddings.' }),
    item('i_sky', 'u_nigar', { title: 'Sky blue graduation dress', category: 'dress', events: ['graduation'], size: 'M', color: 'sky', brand: 'H&M Premium', pricePerDay: 35, deposit: 30, retailPrice: 220, condition: 'Worn once', area: 'Ganjlik', art: { style: 'cocktail', color: '#76a9da' }, description: 'Light, fresh and photogenic. Worn once at my own graduation.' }),
    item('i_velvet', 'u_salon', { title: 'Burgundy velvet gown', category: 'dress', events: ['corporate', 'party'], size: 'L', color: 'burgundy', brand: 'Tadashi Shoji', pricePerDay: 65, deposit: 60, retailPrice: 560, condition: 'Like new', area: 'Nizami (city centre)', art: { style: 'gown', color: '#6d1a36' }, description: 'Rich velvet with a flattering wrap waist. Perfect for winter corporate dinners and New Year parties.' }),
    item('i_charcoal', 'u_rashad', { title: 'Charcoal business suit', category: 'suit', gender: 'men', events: ['corporate'], size: 'XL', color: 'charcoal', brand: 'Zara Man', pricePerDay: 50, deposit: 70, retailPrice: 520, condition: 'Like new', area: '28 May', art: { style: 'suit', color: '#45474f' }, description: 'Size 52 (XL). Great for interviews, conferences and presentations.' }),
    item('i_black', 'u_leyla', { title: 'Little black dress', category: 'dress', events: ['party', 'corporate'], size: 'S', color: 'black', brand: 'COS', pricePerDay: 35, deposit: 30, retailPrice: 240, condition: 'Like new', area: 'Nizami (city centre)', art: { style: 'cocktail', color: '#1b1b20' }, description: 'Timeless and simple. Dress it up with our gold clutch.' }),
    item('i_silverclutch', 'u_nigar', { title: 'Silver crystal clutch', category: 'accessory', events: ['wedding', 'engagement'], size: 'One size', color: 'silver', brand: '', pricePerDay: 12, deposit: 25, retailPrice: 140, condition: 'New with tags', area: 'Ganjlik', art: { style: 'clutch', color: '#b7bcc6' }, description: 'Never used. Crystal-covered hard case clutch.' }),
    item('i_rednational', 'u_salon', { title: 'Red national dress for khina', category: 'national', events: ['wedding', 'photoshoot'], size: 'L', color: 'ruby', brand: 'Handmade', pricePerDay: 60, deposit: 80, retailPrice: 650, condition: 'Gently used', area: 'Nizami (city centre)', art: { style: 'national', color: '#b3123d' }, description: 'Traditional red dress with gold trim, a classic choice for the khina (henna) night.' }),
  ];

  const s = { commissionRate: 0.1, cleaningFee: 10, bufferDays: 1, maxDays: 7 };

  const booking = (id, itemId, renterId, start, end, status, extra = {}) => {
    const it = items.find((i) => i.id === itemId);
    const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
    const rental = days * it.pricePerDay;
    const commission = Math.round(rental * s.commissionRate);
    const createdAt = extra.createdAt || ts(-3);
    const flow = ['requested', 'approved', 'picked_up', 'completed'];
    const history = [];
    if (['declined', 'cancelled'].includes(status)) {
      history.push({ status: 'requested', at: createdAt, by: renterId, note: extra.message || '' }, { status, at: ts(-1), by: renterId, note: '' });
    } else {
      flow.slice(0, flow.indexOf(status) + 1).forEach((st, i) =>
        history.push({ status: st, at: new Date(new Date(createdAt).getTime() + i * 3600000 * 20).toISOString(), by: i === 0 ? renterId : it.ownerId, note: i === 0 ? extra.message || '' : '' })
      );
    }
    return {
      id, itemId, renterId, ownerId: it.ownerId, start, end, days, pricePerDay: it.pricePerDay,
      rental, cleaningFee: s.cleaningFee, deposit: it.deposit, commissionRate: s.commissionRate, commission,
      ownerPayout: rental - commission, total: rental + s.cleaningFee + it.deposit,
      message: extra.message || '', status, history,
      pickup: ['picked_up', 'completed'].includes(status) ? { at: history[2]?.at, photos: [], idChecked: true, note: 'Condition checked together. All good.' } : null,
      return: status === 'completed' ? { at: history[3]?.at, photos: [], condition: 'good', deduction: 0, depositRefund: it.deposit, note: 'Returned on time, clean.' } : null,
      createdAt,
    };
  };

  const bookings = [
    booking('b_1', 'i_emerald', 'u_aysel', d(-32), d(-31), 'completed', { createdAt: ts(-40), message: 'Hi! I need it for a wedding on Saturday.' }),
    booking('b_2', 'i_champagne', 'u_aysel', d(-20), d(-19), 'completed', { createdAt: ts(-26), message: 'For my friend\'s wedding.' }),
    booking('b_3', 'i_ivory', 'u_nigar', d(-15), d(-14), 'completed', { createdAt: ts(-22) }),
    booking('b_4', 'i_tux', 'u_murad', d(-10), d(-9), 'completed', { createdAt: ts(-14) }),
    booking('b_5', 'i_ruby', 'u_aysel', d(5), d(6), 'approved', { createdAt: ts(-2), message: 'Graduation party, can I pick up in the morning?' }),
    booking('b_6', 'i_navysuit', 'u_murad', d(-1), d(1), 'picked_up', { createdAt: ts(-5), message: 'Need it for a business conference.' }),
    booking('b_7', 'i_blush', 'u_nigar', d(8), d(9), 'requested', { createdAt: ts(-1), message: 'Engagement photoshoot in Old City. I am size XS. Thank you!' }),
    booking('b_8', 'i_lilac', 'u_aysel', d(14), d(15), 'requested', { createdAt: ts(0), message: 'My sister\'s graduation. Is the length good for 168 cm?' }),
    booking('b_9', 'i_velvet', 'u_aysel', d(-50), d(-49), 'completed', { createdAt: ts(-55) }),
  ];

  const reviews = [
    { id: 'r_1', bookingId: 'b_1', itemId: 'i_emerald', authorId: 'u_aysel', targetId: 'u_leyla', role: 'renter', rating: 5, text: 'The dress was perfect and exactly like the photos. Leyla was super friendly at pickup. Got so many compliments!', createdAt: ts(-30) },
    { id: 'r_2', bookingId: 'b_1', itemId: 'i_emerald', authorId: 'u_leyla', targetId: 'u_aysel', role: 'owner', rating: 5, text: 'Returned on time and in perfect condition. Welcome back anytime!', createdAt: ts(-30) },
    { id: 'r_3', bookingId: 'b_2', itemId: 'i_champagne', authorId: 'u_aysel', targetId: 'u_salon', role: 'renter', rating: 4, text: 'Beautiful gown, very professional salon. It was a little long, so bring heels!', createdAt: ts(-18) },
    { id: 'r_4', bookingId: 'b_3', itemId: 'i_ivory', authorId: 'u_nigar', targetId: 'u_salon', role: 'renter', rating: 5, text: 'Felt like a princess at my engagement. Clean, steamed and ready to wear.', createdAt: ts(-13) },
    { id: 'r_5', bookingId: 'b_4', itemId: 'i_tux', authorId: 'u_murad', targetId: 'u_salon', role: 'renter', rating: 5, text: 'Great fit and they adjusted the trousers for me. Saved me 800 AZN.', createdAt: ts(-8) },
    { id: 'r_6', bookingId: 'b_9', itemId: 'i_velvet', authorId: 'u_aysel', targetId: 'u_salon', role: 'renter', rating: 5, text: 'Perfect for our company New Year party.', createdAt: ts(-48) },
  ];

  return {
    version: 1,
    users,
    items,
    bookings,
    reviews,
    favorites: { u_aysel: ['i_emerald', 'i_ivory', 'i_blush'] },
    settings: s,
  };
}
