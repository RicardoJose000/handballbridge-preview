import { db, ensureSeed, resetAll, currentUser, currentAdmin, trackVisit, session } from './store.js';
import { LANGS, lang, langInfo, setLang, onLang, site, t, setOverrides } from './i18n.js';
import { applyPlan, setPlan, getPlan, onPlan, isB } from './plan.js';
import { $, $$, esc, hasGsap, reduced, toast, flag } from './ui.js';
import { initInbox, closeInbox, renderList } from './mail.js';
import { renderHome, renderAbout, renderParents, renderContact } from './views/home.js';
import { renderRegister, renderVerify, renderDeclarations, renderLogin, renderForgot } from './views/auth.js';
import { renderAccount } from './views/account.js';
import { renderAdmin } from './views/admin.js';

const routes = {
  '': renderHome, about: renderAbout, parents: renderParents, contact: renderContact,
  register: renderRegister, verify: renderVerify, declarations: renderDeclarations, login: renderLogin, forgot: renderForgot,
  account: renderAccount, admin: renderAdmin
};

const main = $('#main');
let cleanup = null, busy = false, queued = false, lastView = null, first = true;

// gold and navy curtain between pages
async function wipe(dir) {
  if (!hasGsap() || reduced()) return;
  const [a, b] = $$('.wipe span');
  if (dir === 'in') {
    gsap.set([a, b], { transformOrigin: 'bottom' });
    await gsap.timeline().to(a, { scaleY: 1, duration: .38, ease: 'power3.in' }).to(b, { scaleY: 1, duration: .38, ease: 'power3.in' }, .08);
  } else {
    gsap.set([a, b], { transformOrigin: 'top' });
    await gsap.timeline().to(b, { scaleY: 0, duration: .55, ease: 'expo.out' }).to(a, { scaleY: 0, duration: .55, ease: 'expo.out' }, .06);
  }
}

if (hasGsap()) gsap.registerPlugin(ScrollTrigger);

async function navigate({ soft = false } = {}) {
  if (busy) { queued = true; return; }
  busy = true;
  const [name = '', ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  const view = routes[name] ? name : '';
  document.body.classList.remove('menu-open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  closeInbox();
  $$('.modal').forEach(m => m.remove());
  document.documentElement.style.overflow = '';
  const curtain = !soft && !first;
  if (curtain) await wipe('in');
  try { cleanup?.(); } catch { /* ignore */ }
  cleanup = null;
  if (hasGsap()) ScrollTrigger.getAll().forEach(tr => tr.kill());
  const y = soft ? scrollY : 0;
  main.innerHTML = '';
  document.body.dataset.view = view || 'home';
  if (!soft) window.scrollTo(0, 0);
  renderHeader(view);
  if (!soft && view !== lastView) trackVisit(view || 'home');
  lastView = view;
  try { cleanup = await routes[view](main, rest); } catch (err) { console.error(err); main.innerHTML = '<div class="page"><div class="shell narrow"><h1>Something went wrong.</h1><p class="muted">Please reload the page.</p></div></div>'; }
  if (soft) window.scrollTo(0, y);
  if (hasGsap()) ScrollTrigger.refresh();
  if (!soft) main.focus({ preventScroll: true });
  if (curtain) await wipe('out');
  first = false;
  busy = false;
  if (queued) { queued = false; navigate(); }
}

function renderHeader(view) {
  const items = [['', site('home')], ['about', site('about')], ['parents', site('parents')], ['admin', site('adminEntry')], ['contact', site('contact')]];
  $('#nav').innerHTML = items.map(([r, l]) => `<a href="#/${r}" class="${view === r || (r === 'parents' && ['register', 'verify', 'declarations'].includes(view)) ? 'active' : ''}">${esc(l)}</a>`).join('');
  const me = currentUser();
  const sb = $('#signBtn');
  sb.textContent = me ? t('myAccount') : site('register');
  sb.href = me ? '#/account' : '#/login';
  const li = langInfo();
  $('#langsel').innerHTML = `<button class="lang-btn" aria-haspopup="listbox" aria-expanded="false">${li.flag === 'gb' ? '<span class="gb">EN</span>' : flag(li.flag)}<span>${esc(li.short)}</span><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
    <ul class="lang-menu" role="listbox">${LANGS.map(l => `<li><button role="option" data-lang="${l.code}" aria-selected="${l.code === lang()}">${l.flag === 'gb' ? '<span class="gb">EN</span>' : flag(l.flag)}<span>${esc(l.name)}</span></button></li>`).join('')}</ul>`;
}

function initHeader() {
  const bar = $('#topbar');
  addEventListener('scroll', () => bar.classList.toggle('scrolled', scrollY > 30), { passive: true });
  $('#menuBtn').addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    $('#menuBtn').setAttribute('aria-expanded', String(open));
  });
  $('#langsel').addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    const box = $('#langsel');
    if (b) { setLang(b.dataset.lang); box.classList.remove('open'); return; }
    if (e.target.closest('.lang-btn')) {
      const open = box.classList.toggle('open');
      $('.lang-btn', box).setAttribute('aria-expanded', String(open));
    }
  });
  document.addEventListener('click', e => { if (!e.target.closest('#langsel')) $('#langsel').classList.remove('open'); if (!e.target.closest('#extrasPop, #extrasBtn')) closeExtras(); });
}

const EXTRAS = [
  ['Mobile and tablet version', 'Every page works on phones. In Option A phones show the desktop page zoomed out.'],
  ['Talent camps and events', 'Admin → Camps and events. Parents answer under My account.'],
  ['Announcements by email', 'Admin → Announcements. Each family gets it in its own language.'],
  ['Yearly profile check', 'Season reminder in the parent account and status in the admin.'],
  ['Visual dashboard and monthly report', 'Charts and country map on the admin dashboard, monthly PDF.'],
  ['Privacy-friendly visitor statistics', 'Admin → Visitors. No cookies, no Google.'],
  ['Extra account protection', 'My account → Security: two-step sign-in, new-device alerts.'],
  ['60 days of support', 'After launch, instead of 14 days.']
];
function closeExtras() { $('#extrasPop').hidden = true; $('#extrasBtn').setAttribute('aria-expanded', 'false'); }
function initDemoBar() {
  const sync = () => $$('.planswitch button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.plan === getPlan())));
  sync();
  $('.planswitch').addEventListener('click', e => { const b = e.target.closest('[data-plan]'); if (b) setPlan(b.dataset.plan); });
  $('#extrasPop').innerHTML = `<h4>Option B adds</h4><ol>${EXTRAS.map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join('')}</ol><p>Look for the gold <span class="btag">B</span> marks in the preview.</p>`;
  $('#extrasBtn').addEventListener('click', () => {
    const pop = $('#extrasPop');
    pop.hidden = !pop.hidden;
    $('#extrasBtn').setAttribute('aria-expanded', String(!pop.hidden));
  });
  $('#resetBtn').addEventListener('click', async () => {
    if (!confirm('Reset all demo data in this browser?')) return;
    resetAll();
    await ensureSeed();
    setOverrides(db.overrides);
    renderList();
    toast('Demo data reset.');
    location.hash = '#/';
    navigate();
  });
  onPlan(() => { sync(); toast(isB() ? 'Option B: specification + 8 extras' : 'Option A: the specification'); navigate({ soft: true }); });
}

(async function start() {
  applyPlan();
  document.documentElement.lang = lang();
  await ensureSeed();
  setOverrides(db.overrides);
  initInbox();
  initHeader();
  initDemoBar();
  onLang(() => { renderList(); navigate({ soft: true }); });
  addEventListener('hashchange', () => navigate());
  // admin inactivity: the admin view checks this on every navigation and on a timer
  addEventListener('pointerdown', () => { if (currentAdmin()) session.patch({ adminSeen: Date.now() }); }, { passive: true });
  addEventListener('keydown', () => { if (currentAdmin()) session.patch({ adminSeen: Date.now() }); }, { passive: true });
  await navigate();
  if (hasGsap() && !reduced()) gsap.from('#demobar', { y: 90, opacity: 0, duration: 1, delay: .6, ease: 'expo.out', clearProps: 'transform,opacity' });
})();
