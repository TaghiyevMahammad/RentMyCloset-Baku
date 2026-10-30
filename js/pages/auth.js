import { store } from '../store.js';
import { navigate } from '../router.js';
import { esc } from '../utils.js';
import { icon, logo, toast, setLoading } from '../ui.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../seed.js';

const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('/login') && !n.startsWith('/signup') ? n : null);

function shell(main, inner, side) {
  main.innerHTML = `
  <div class="auth">
    <div class="auth-card">
      <a href="#/" class="brand">${logo()}<span class="brand-text">RentMyCloset<b>Baku</b></span></a>
      ${inner}
    </div>
    <div class="auth-side" aria-hidden="true">${side}</div>
  </div>`;
}

export async function renderLogin(main, { query }) {
  document.title = 'Log in · RentMyCloset Baku';
  const next = safeNext(query.next);
  if (store.currentUser()) return navigate(next || '/dashboard', { replace: true });
  shell(
    main,
    `<h1>Welcome back</h1>
     <p class="muted">Log in to rent, lend and manage your bookings.</p>
     <form data-login novalidate>
       <label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label>
       <label class="field"><span>Password</span><div class="pw"><input type="password" name="password" autocomplete="current-password" required><button type="button" class="icon-btn" data-pw aria-label="Show password">${icon('eye', 18)}</button></div></label>
       <p class="form-error" data-error role="alert"></p>
       <button class="btn btn-primary btn-block btn-lg">Log in</button>
     </form>
     <p class="center small">New here? <a href="#/signup${next ? '?next=' + encodeURIComponent(next) : ''}">Create a free account</a></p>
     <div class="demo-box">
       <p><b>${icon('sparkles', 16)} Demo accounts</b> <span class="muted small">One click to try every side of the marketplace</span></p>
       <div class="demo-list">${DEMO_ACCOUNTS.map((a) => `<button type="button" class="demo-acc" data-email="${esc(a.email)}"><strong>${esc(a.label)}</strong><small>${esc(a.hint)}</small></button>`).join('')}</div>
     </div>`,
    `<blockquote>“I wore an outfit worth 650 AZN to my cousin's wedding and paid 160.”</blockquote><span>Example of what a renter could save</span>`
  );

  const form = main.querySelector('[data-login]');
  const go = (u) => {
    toast(`Welcome, ${u.name.split(' ')[0]}!`, 'success');
    navigate(next || (u.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button.btn');
    const f = new FormData(form);
    setLoading(btn, true);
    try {
      go(await store.login(f.get('email'), f.get('password')));
    } catch (err) {
      form.querySelector('[data-error]').textContent = err.message;
      setLoading(btn, false);
    }
  });
  main.querySelector('[data-pw]').addEventListener('click', (e) => togglePw(e.currentTarget));
  main.querySelectorAll('[data-email]').forEach((b) =>
    b.addEventListener('click', async () => {
      try {
        go(await store.login(b.dataset.email, DEMO_PASSWORD));
      } catch (err) {
        toast(err.message + ' Use "Reset demo data" at the bottom of the page.', 'error');
      }
    })
  );
}

export async function renderSignup(main, { query }) {
  document.title = 'Sign up · RentMyCloset Baku';
  const next = safeNext(query.next);
  if (store.currentUser()) return navigate(next || '/dashboard', { replace: true });
  const salon = query.role === 'salon';
  shell(
    main,
    `<h1>Create your account</h1>
     <p class="muted">Free for renters and owners. No subscription.</p>
     <form data-signup novalidate>
       <div class="radio-cards two">
         <label><input type="radio" name="role" value="user" ${salon ? '' : 'checked'}><span>${icon('user', 18)} <b>Individual</b><small>Rent and lend outfits</small></span></label>
         <label><input type="radio" name="role" value="salon" ${salon ? 'checked' : ''}><span>${icon('store', 18)} <b>Salon</b><small>Dress-hire business</small></span></label>
       </div>
       <label class="field"><span data-name-label>${salon ? 'Salon name' : 'Full name'}</span><input name="name" autocomplete="name" required></label>
       <label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>
       <label class="field"><span>Phone <em>(shared only after a booking is approved)</em></span><input type="tel" name="phone" autocomplete="tel" placeholder="+994 50 123 45 67"></label>
       <label class="field"><span>Password</span><div class="pw"><input type="password" name="password" autocomplete="new-password" minlength="6" required placeholder="At least 6 characters"><button type="button" class="icon-btn" data-pw aria-label="Show password">${icon('eye', 18)}</button></div></label>
       <label class="check"><input type="checkbox" name="terms"> I agree to the <a href="#/how-it-works#rules" target="_blank">rental rules</a> (deposit, cleaning, damage).</label>
       <p class="form-error" data-error role="alert"></p>
       <button class="btn btn-primary btn-block btn-lg">Create account</button>
     </form>
     <p class="center small">Already have an account? <a href="#/login${next ? '?next=' + encodeURIComponent(next) : ''}">Log in</a></p>`,
    `<blockquote>“Your wardrobe can pay for itself.”</blockquote><span>List an outfit in about three minutes</span>`
  );
  const form = main.querySelector('[data-signup]');
  form.addEventListener('change', () => (main.querySelector('[data-name-label]').textContent = form.elements.role.value === 'salon' ? 'Salon name' : 'Full name'));
  main.querySelector('[data-pw]').addEventListener('click', (e) => togglePw(e.currentTarget));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const err = form.querySelector('[data-error]');
    if (!f.get('terms')) return (err.textContent = 'Please accept the rental rules.');
    const btn = form.querySelector('button.btn');
    setLoading(btn, true);
    try {
      const u = await store.signup({ name: f.get('name'), email: f.get('email'), password: f.get('password'), phone: f.get('phone'), role: f.get('role') });
      toast(`Welcome to RentMyCloset, ${u.name.split(' ')[0]}!`, 'success');
      navigate(next || (u.role === 'salon' ? '/list' : '/dashboard'), { replace: true });
    } catch (ex) {
      err.textContent = ex.message;
      setLoading(btn, false);
    }
  });
}

function togglePw(btn) {
  const input = btn.parentElement.querySelector('input');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}
