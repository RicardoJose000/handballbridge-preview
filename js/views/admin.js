// Administration portal (specification section 8). Admin screens are in English.
import { db, day, save, uid, session, currentAdmin, userById, userByEmail, verifyPassword, issueCode, checkCode, lockedFor, loginFailed, loginOk, log, LOG_TYPES, LOG_RETENTION_DAYS, playersOf, playerById, playerConsent, consentsOf, playerStatus, groupOf, birthYear, deletePlayer, deleteAccount, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_IDLE, SEASON, DOC_VERSION, docVersion, ADULT_GROUP } from '../store.js';
import { t, LANGS, KEYS, baseText, SITE_KEYS, site, setOverrides, country, DERIVED, fmtD, fmtDT, slogan, sloganBase, legalText, consentText } from '../i18n.js';
import { COUNTRIES, ORIGIN, GROUPS } from '../site-data.js';
import { isB } from '../plan.js';
import { $, $$, esc, go, icon, toast, openModal, confirmBox, clearErrors, fieldError, formError, validEmail, bindPasswordUI, pwField, bindCodeInputs, codeInputsHTML, setBusy, download, note, flag, enter, bTag, countUp } from '../ui.js';
import { sendMail, wrapMail, openInbox, latestFor, FROM } from '../mail.js';
import { barsV, line, donut, tileMap } from '../charts.js';
import { adHTML, heroImage } from './home.js';
import { layoutSlogan, sloganCfg, SLOGAN_DEFAULT, SLOGAN_FONTS, SLOGAN_COLORS, sloganStyle, styleSlogan, loadFont } from '../slogan.js';

const DAY = 86400000;
const FLAG = { BA: 'ba', HR: 'hr', RS: 'rs', ME: 'me', AL: 'al', XK: 'xk', MK: 'mk' };
const cn = c => country(c, 'en');
const cflags = list => list.map(c => FLAG[c] ? flag(FLAG[c], 'sm') : `<span class="cc">${c}</span>`).join('');
const POS = ['Goalkeeper', 'Left wing', 'Right wing', 'Left back', 'Right back', 'Centre back', 'Pivot'];
const ST = { active: ['ok', 'Active'], unverified: ['warn', 'Unverified'], inactive: ['bad', 'Deactivated'], noconsent: ['bad', 'Consent withdrawn'] };
const stChip = s => `<span class="chip ${ST[s][0]}">${ST[s][1]}</span>`;
const maskEmail = e => { const [n, d] = String(e).split('@'); return n.slice(0, 2) + '•••@' + d; };
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const actor = 'Administrator';

export function renderAdmin(main, [tab]) {
  const me = currentAdmin();
  if (!me) {
    const s = session.get();
    if (s?.adminId && s.mfa) { session.patch({ adminId: null, mfa: false }); toast('Signed out after 15 minutes without activity.', 'bad'); log('admin', actor, 'Automatic sign-out after inactivity'); }
    return login(main);
  }
  return portal(main, me, tab || 'dashboard');
}

/* ---------------- 8.1 secure login ---------------- */
function login(main) {
  main.innerHTML = `<section class="auth admin-auth"><div class="auth-art"><div class="auth-art-in">
      <span class="brand"><span class="word">Handball<b>Bridge</b></span></span><p class="auth-quote">Administration portal</p>
      <ul class="trust"><li>${icon.lock}<span>Separate admin login with a second step</span></li><li>${icon.shield}<span>Lockout after 5 wrong attempts</span></li><li>${icon.clock}<span>Automatic sign-out after 15 minutes</span></li><li>${icon.list}<span>Every important action is logged</span></li></ul>
    </div></div><div class="auth-main"><div class="auth-card" id="ac"></div></div></section>`;
  const box = $('#ac', main);
  let admin = null;
  function one() {
    box.innerHTML = `<div class="step-kicker">PRIVATE ADMINISTRATION · STEP 1 OF 2</div><h1>Administrator sign in</h1><p class="muted">Password first, then a code sent to the admin mailbox.</p>
      <div class="creds"><span><b>Demo login</b><br><code>${ADMIN_EMAIL}</code><br><code>${ADMIN_PASSWORD}</code></span><button class="btn btn-ghost btn-sm" id="fill" type="button">Fill in</button></div>
      <form class="form" id="a1" novalidate><div class="field"><label for="email">Admin email</label><input class="input" id="email" name="email" type="email" autocomplete="username"></div>
      ${pwField('password', 'Password', 'current-password')}<button class="btn btn-gold btn-block" type="submit">Continue →</button></form>`;
    const f = $('#a1', box);
    bindPasswordUI(f);
    enter(box, ':scope > *');
    $('#fill', box).addEventListener('click', () => { f.email.value = ADMIN_EMAIL; f.password.value = ADMIN_PASSWORD; $('[type=submit]', f).focus(); });
    f.addEventListener('submit', async e => {
      e.preventDefault(); clearErrors(f);
      const { email, password } = Object.fromEntries(new FormData(f));
      if (!validEmail(email)) { fieldError(f, 'email', 'Enter a valid email address.'); return; }
      const wait = lockedFor(email);
      if (wait) { formError(f, `Too many attempts. Try again in ${wait} seconds.`); return; }
      const btn = $('[type=submit]', f); setBusy(btn, true);
      const u = userByEmail(email);
      const ok = u && u.role === 'admin' && await verifyPassword(password || '', u.pw);
      setBusy(btn, false);
      if (!ok) { const left = loginFailed(email, 'Admin login'); formError(f, lockedFor(email) ? 'Too many attempts. Paused for 60 seconds.' : `Wrong email or password. ${left} attempts left.`); return; }
      loginOk(email);
      admin = u;
      const code = await issueCode(u.id, 'admin2fa');
      sendMail(u.email, `Admin sign-in code: ${code}`, wrapMail('en', 'Your admin sign-in code', `<p>Someone is signing in to the HandballBridge administration with your password.</p><div class="code">${code}</div><p class="small">If this was not you, change the password right away.</p>`));
      session.patch({ adminId: u.id, mfa: false });
      two();
    });
  }
  function two() {
    box.innerHTML = `<div class="step-kicker">PRIVATE ADMINISTRATION · STEP 2 OF 2</div><h1>Enter the sign-in code</h1><p class="muted">A 6-digit code was sent to ${esc(admin.email)}.</p>
      ${note('Find the code in the <b>Demo inbox</b> at the bottom of the screen.')}
      <form class="form" id="a2" novalidate>${codeInputsHTML()}<button class="btn btn-gold btn-block" type="submit">Open administration</button>
      <button class="btn btn-ghost btn-sm" type="button" id="oi">${icon.mail} Open demo inbox</button></form>`;
    const f = $('#a2', box);
    enter(box, ':scope > *');
    $('#oi', box).addEventListener('click', () => openInbox(latestFor(admin.email)?.id));
    const code = bindCodeInputs($('.code-inputs', f), () => f.requestSubmit());
    setTimeout(() => $('input', f)?.focus(), 200);
    f.addEventListener('submit', async e => {
      e.preventDefault(); clearErrors(f);
      if (code.value().length < 6) { formError(f, 'Enter all 6 digits.'); return; }
      const r = await checkCode(admin.id, 'admin2fa', code.value());
      if (!r.ok) { formError(f, t(r.key, { n: r.n }, 'en')); code.shake(); code.clear(); return; }
      session.patch({ adminId: admin.id, mfa: true, adminSeen: Date.now() });
      log('admin', actor, 'Signed in to the administration (password + email code)');
      toast('Welcome to the administration.');
      main.innerHTML = '';
      portal(main, admin, 'dashboard');
    });
  }
  one();
}

/* ---------------- portal shell ---------------- */
const TABS = () => [
  ['dashboard', 'Dashboard', icon.chart], ['players', 'Player database', icon.search], ['accounts', 'Parent and player accounts', icon.users],
  ['requests', 'Requests and messages', icon.inbox], ['content', 'Website content', icon.text], ['translations', 'Languages', icon.globe],
  ['legal', 'Privacy and legal texts', icon.file], ['ads', 'Advertising', icon.image], ['reports', 'Statistics and reports', icon.list], ['logs', 'Activity log', icon.clock],
  ...(isB() ? [['events', 'Camps and events', icon.calendar, 1], ['announce', 'Announcements', icon.megaphone, 1], ['visitors', 'Visitors', icon.eye, 1]] : [])
];

function portal(main, me, tab) {
  const tabs = TABS();
  if (!tabs.some(x => x[0] === tab)) tab = 'dashboard';
  const openReq = db.requests.filter(r => r.status !== 'done').length + db.messages.filter(m => !m.read).length;
  main.innerHTML = `<section class="admin">
    <aside class="aside"><div class="aside-head"><span class="brand small"><span class="word">Handball<b>Bridge</b></span></span><small>Administration</small></div>
      <nav>${tabs.map(([k, l, ic, b]) => `<a href="#/admin/${k}" class="${k === tab ? 'on' : ''}">${ic}<span>${l}</span>${k === 'requests' && openReq ? `<em>${openReq}</em>` : ''}${b ? bTag() : ''}</a>`).join('')}</nav>
      <div class="aside-foot"><div class="who">${icon.lock}<span><b>Administrator</b><small id="idle">Auto sign-out in 15:00</small></span></div><button class="btn btn-ghost btn-sm btn-block" id="aout">${icon.logout} Sign out</button></div>
    </aside>
    <div class="adm-main" id="adm"></div></section>`;
  $('#aout', main).addEventListener('click', () => { log('admin', actor, 'Signed out'); session.patch({ adminId: null, mfa: false }); toast('Signed out.'); go(''); });
  const idle = $('#idle', main);
  const timer = setInterval(() => {
    const s = session.get();
    const left = ADMIN_IDLE - (Date.now() - (s?.adminSeen || 0));
    if (left <= 0) { clearInterval(timer); renderAdmin(main, [tab]); return; }
    idle.textContent = `Auto sign-out in ${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
  }, 1000);
  const adm = $('#adm', main);
  ({ dashboard, players, accounts, requests, content, legal, translations, ads, reports, logs, events, announce, visitors })[tab](adm);
  enter(adm, ':scope > *', { stagger: .04 });
  return () => clearInterval(timer);
}
const head = (title, sub, actions = '', b = false) => `<div class="adm-head"><div><h1>${title} ${b ? bTag() : ''}</h1><p class="muted">${sub}</p></div><div class="adm-actions">${actions}</div></div>`;

/* ---------------- 8.2 dashboard ---------------- */
function rangeOf(r) {
  const now = Date.now(), sod = startOfDay();
  if (r.kind === 'today') return [sod, now + 1];
  if (r.kind === '7') return [now - 7 * DAY, now + 1];
  if (r.kind === '30') return [now - 30 * DAY, now + 1];
  return [r.from ? new Date(r.from).getTime() : 0, r.to ? new Date(r.to).getTime() + DAY : now + 1];
}
function dashboard(adm) {
  const st = { kind: '30', from: '', to: '' };
  adm.innerHTML = head('Dashboard', 'Live numbers from the database. No names or contact details on this page.',
    `${isB() ? `<button class="btn btn-gold btn-sm" id="mrep">${icon.download} Monthly report PDF ${bTag()}</button>` : ''}`) +
    `<div class="range card"><span>Period</span>${[['today', 'Today'], ['7', '7 days'], ['30', '30 days'], ['custom', 'Custom']].map(([k, l]) => `<button class="seg ${k === st.kind ? 'on' : ''}" data-k="${k}">${l}</button>`).join('')}
      <span class="custom" hidden><input class="input sm" type="date" id="rf"> – <input class="input sm" type="date" id="rt"></span></div>
    <div class="kpis" id="kpis"></div><div id="dash"></div>`;
  const draw = () => {
    const [a, b] = rangeOf(st);
    const sod = startOfDay();
    const parents = db.users.filter(u => u.role === 'parent');
    const pl = db.players;
    const inR = x => x.createdAt >= a && x.createdAt < b;
    const k = [
      ['Registered parents', parents.length, `${parents.filter(u => u.createdAt >= sod).length} new today`],
      ['Registered players', pl.length, `${pl.filter(p => p.createdAt >= sod).length} new today`],
      ['New parents today', parents.filter(u => u.createdAt >= sod).length, 'parent accounts'],
      ['New players today', pl.filter(p => p.createdAt >= sod).length, 'player profiles'],
      ['Last 7 days', pl.filter(p => p.createdAt > Date.now() - 7 * DAY).length, 'player registrations'],
      ['Last 30 days', pl.filter(p => p.createdAt > Date.now() - 30 * DAY).length, 'player registrations'],
      ['Active profiles', pl.filter(p => playerStatus(p) === 'active').length, `${db.users.filter(u => !u.verified).length} unverified accounts`],
      ['In selected period', pl.filter(inR).length, `${parents.filter(inR).length} parent accounts`]
    ];
    $('#kpis', adm).innerHTML = k.map(([l, v, s]) => `<div class="kpi card"><span>${l}</span><b data-v="${v}">${v}</b><small>${s}</small></div>`).join('');
    $$('#kpis b', adm).forEach(el => countUp(el, +el.dataset.v));
    const sel = pl.filter(inR);
    const byRes = {}; sel.forEach(p => { byRes[p.residence] = (byRes[p.residence] || 0) + 1; });
    const resRows = Object.entries(byRes).sort((x, y) => y[1] - x[1]);
    const older = pl.filter(p => birthYear(p) < 2008).length;
    const years = [...(older ? [{ l: 'Before 2008', v: older }] : []), ...[2008, 2009, 2010, 2011, 2012, 2013].map(y => ({ l: String(y), v: pl.filter(p => birthYear(p) === y).length }))];
    const stc = { active: 0, unverified: 0, inactive: 0, noconsent: 0 }; pl.forEach(p => { stc[playerStatus(p)]++; });
    const unverAcc = db.users.filter(u => u.role !== 'admin' && !u.verified).length;
    if (!isB()) {
      $('#dash', adm).innerHTML = `<div class="grid-2">
        <div class="card"><h3>Registrations by country of residence</h3><p class="muted small">Selected period · player profiles</p>
          <table class="tbl"><thead><tr><th>Country</th><th class="r">Registrations</th></tr></thead><tbody>${resRows.slice(0, 8).map(([c, v]) => `<tr><td>${esc(cn(c))}</td><td class="r"><b>${v}</b></td></tr>`).join('') || '<tr><td colspan="2" class="muted">No registrations in this period.</td></tr>'}
          ${resRows.length > 8 ? `<tr><td>Other countries</td><td class="r"><b>${resRows.slice(8).reduce((s, [, v]) => s + v, 0)}</b></td></tr>` : ''}</tbody></table></div>
        <div class="card"><h3>Players by year of birth</h3><p class="muted small">All profiles</p>
          <table class="tbl"><thead><tr><th>Year</th><th>Group</th><th class="r">Players</th></tr></thead><tbody>${years.map(y => `<tr><td>${y.l}</td><td>${y.l === 'Before 2008' ? ADULT_GROUP : groupOf({ birth: y.l })}</td><td class="r"><b>${y.v}</b></td></tr>`).join('')}</tbody></table></div>
        <div class="card"><h3>Status</h3><table class="tbl"><tbody>
          <tr><td>Active player profiles</td><td class="r"><b>${stc.active}</b></td></tr><tr><td>Deactivated</td><td class="r"><b>${stc.inactive}</b></td></tr>
          <tr><td>Consent withdrawn</td><td class="r"><b>${stc.noconsent}</b></td></tr><tr><td>Unverified accounts (email not confirmed)</td><td class="r"><b>${unverAcc}</b></td></tr></tbody></table></div>
        <div class="card"><h3>Latest registrations</h3><p class="muted small">ID, group and country only</p><table class="tbl"><tbody>${[...pl].sort((x, y) => y.createdAt - x.createdAt).slice(0, 6).map(p => `<tr><td class="mono">${p.id}</td><td>${groupOf(p)}</td><td>${esc(cn(p.residence))}</td><td class="r muted">${fmtD(p.createdAt, 'en')}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
      return;
    }
    // Option B: visual dashboard
    const days = [...Array(30)].map((_, i) => { const d0 = startOfDay(new Date(Date.now() - (29 - i) * DAY)); return pl.filter(p => p.createdAt >= d0 && p.createdAt < d0 + DAY).length; });
    $('#dash', adm).innerHTML = `<div class="grid-2 b-dash">
      <div class="card dark span2"><div class="row-between"><div><h3>Registrations per day ${bTag()}</h3><p class="muted small">Last 30 days · player profiles</p></div><b class="big">${days.reduce((s, v) => s + v, 0)}</b></div>${line(days)}</div>
      <div class="card dark"><h3>Registrations by country ${bTag()}</h3><p class="muted small">Selected period · hover a tile</p>${tileMap(byRes, cn)}</div>
      <div class="card"><h3>Players by year of birth ${bTag()}</h3>${barsV(years)}</div>
      <div class="card"><h3>Profile status ${bTag()}</h3>${donut([{ l: 'Active', v: stc.active, c: '#2FB67C' }, { l: 'Deactivated', v: stc.inactive, c: '#E5484D' }, { l: 'Consent withdrawn', v: stc.noconsent, c: '#F5A524' }, { l: 'Unverified', v: stc.unverified, c: '#94A3B8' }])}<p class="muted small">Unverified accounts: ${unverAcc}</p></div>
      <div class="card"><h3>Top countries of residence</h3><table class="tbl"><tbody>${resRows.slice(0, 6).map(([c, v]) => `<tr><td>${esc(cn(c))}</td><td class="r"><b>${v}</b></td></tr>`).join('')}</tbody></table></div>
    </div>`;
    if (window.gsap) { gsap.from($$('.bar', adm), { scaleY: 0, transformOrigin: 'bottom', duration: .9, stagger: .05, ease: 'expo.out' }); gsap.from($$('.tile.has', adm), { opacity: 0, scale: .6, transformOrigin: 'center', duration: .6, stagger: .03, ease: 'back.out(2)' }); }
  };
  adm.addEventListener('click', e => {
    const b = e.target.closest('.seg'); if (!b) return;
    st.kind = b.dataset.k; $$('.seg', adm).forEach(x => x.classList.toggle('on', x === b));
    $('.custom', adm).hidden = st.kind !== 'custom'; draw();
  });
  ['rf', 'rt'].forEach(id => $('#' + id, adm).addEventListener('change', () => { st.from = $('#rf', adm).value; st.to = $('#rt', adm).value; draw(); }));
  $('#mrep', adm)?.addEventListener('click', monthlyReport);
  draw();
}

/* ---------------- 8.3 + 8.4 player database ---------------- */
const F0 = () => ({ q: '', year: '', group: '', cit: [], birthCountry: '', residence: '', gender: '', hand: '', pos: [], status: '' });
let filt = F0(), sortBy = ['createdAt', -1], page = 0;
export function applyFilters(f = filt) {
  return db.players.filter(p =>
    (!f.q || p.name.toLowerCase().includes(f.q.toLowerCase()) || p.id.toLowerCase() === f.q.toLowerCase()) &&
    (!f.year || birthYear(p) === +f.year) && (!f.group || groupOf(p) === f.group) &&
    (!f.cit.length || f.cit.some(c => p.citizens.includes(c))) &&
    (!f.birthCountry || p.birthCountry === f.birthCountry) && (!f.residence || p.residence === f.residence) &&
    (!f.gender || p.gender === f.gender) && (!f.hand || p.hand === f.hand) &&
    (!f.pos.length || f.pos.some(i => p.positions.includes(i))) && (!f.status || playerStatus(p) === f.status));
}
const countrySel = (id, v, label) => `<label class="ff"><span>${label}</span><select class="input sm" id="${id}"><option value="">All</option>${[...new Set([...ORIGIN, 'NO', 'DE', 'AT', 'CH', 'SE', 'DK', 'SI', 'NL', 'US'])].map(c => [c, cn(c)]).concat(COUNTRIES.filter(c => !ORIGIN.includes(c)).map(c => [c, cn(c)]).sort((x, y) => x[1].localeCompare(y[1]))).filter((x, i, arr) => arr.findIndex(y => y[0] === x[0]) === i).map(([c, n]) => `<option value="${c}" ${c === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
function players(adm) {
  adm.innerHTML = head('Player database', 'Combine any filters. Contact details stay hidden in the list; opening a full profile is logged.',
    `<button class="btn btn-ghost btn-sm" id="ex1">${icon.download} CSV</button><button class="btn btn-ghost btn-sm" id="ex2">${icon.download} Excel</button>`) +
    `<div class="card filters" id="fl">
      <label class="ff wide"><span>First and last name or ID</span><span class="search">${icon.search}<input class="input sm" id="q" value="${esc(filt.q)}" placeholder="Search a player"></span></label>
      <label class="ff"><span>Year of birth</span><select class="input sm" id="year"><option value="">All</option>${[...new Set([...db.players.map(birthYear), 2008, 2009, 2010, 2011, 2012, 2013])].sort((a, b) => a - b).map(y => `<option ${String(y) === filt.year ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
      <label class="ff"><span>Birth-year group</span><select class="input sm" id="group"><option value="">All</option>${[...GROUPS, ADULT_GROUP].map(g => `<option ${g === filt.group ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
      <label class="ff"><span>Gender</span><select class="input sm" id="gender"><option value="">All</option><option value="F" ${filt.gender === 'F' ? 'selected' : ''}>Female</option><option value="M" ${filt.gender === 'M' ? 'selected' : ''}>Male</option></select></label>
      ${countrySel('birthCountry', filt.birthCountry, 'Country of birth')}${countrySel('residence', filt.residence, 'Country of residence')}
      <label class="ff"><span>Playing hand</span><select class="input sm" id="hand"><option value="">All</option><option value="L" ${filt.hand === 'L' ? 'selected' : ''}>Left</option><option value="R" ${filt.hand === 'R' ? 'selected' : ''}>Right</option></select></label>
      <label class="ff"><span>Profile status</span><select class="input sm" id="status"><option value="">All</option>${Object.entries(ST).map(([k, [, l]]) => `<option value="${k}" ${filt.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <div class="ff full"><span>Position (one or more)</span><div class="citf">${POS.map((n, i) => `<button type="button" class="pf ${filt.pos.includes(i) ? 'on' : ''}" data-pos="${i}">${n}</button>`).join('')}</div></div>
      <div class="ff full"><span>Citizenship (one or more)</span><div class="citf">${ORIGIN.map(c => `<button type="button" class="cf ${filt.cit.includes(c) ? 'on' : ''}" data-c="${c}">${flag(FLAG[c], 'sm')}${esc(cn(c))}</button>`).join('')}
        <select class="input sm" id="citMore"><option value="">+ other country</option>${COUNTRIES.filter(c => !ORIGIN.includes(c)).map(c => [c, cn(c)]).sort((x, y) => x[1].localeCompare(y[1])).map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join('')}</select>
        ${filt.cit.filter(c => !ORIGIN.includes(c)).map(c => `<button type="button" class="cf on" data-c="${c}">${esc(cn(c))} ×</button>`).join('')}</div></div>
      <div class="ff-actions"><button class="btn btn-ghost btn-sm" id="example">Example from the spec</button><button class="btn btn-ghost btn-sm" id="clear">Clear filters</button></div>
    </div>
    <div class="card"><div class="row-between"><p class="muted" id="count"></p><p class="muted small">${icon.lock} Hidden in list: date of birth, phone, emails, parent names</p></div>
      <div class="table-wrap"><table class="tbl click" id="pt"><thead><tr>${[['id', 'ID'], ['name', 'Name'], ['birth', 'Born'], ['gender', 'Gender'], ['group', 'Group'], ['cit', 'Citizenships'], ['residence', 'Residence'], ['club', 'Club'], ['status', 'Status'], ['createdAt', 'Registered']].map(([k, l]) => `<th><button data-sort="${k}">${l}<i>${sortBy[0] === k ? (sortBy[1] > 0 ? '↑' : '↓') : ''}</i></button></th>`).join('')}</tr></thead><tbody></tbody></table></div>
      <div class="pager" id="pager"></div></div>`;
  const fl = $('#fl', adm);
  const sync = () => {
    ['q', 'year', 'group', 'gender', 'birthCountry', 'residence', 'hand', 'status'].forEach(k => { filt[k] = $('#' + k, fl).value.trim(); });
    page = 0; table();
  };
  fl.addEventListener('input', e => { if (e.target.id !== 'citMore') sync(); });
  fl.addEventListener('change', e => {
    if (e.target.id === 'citMore' && e.target.value) { if (!filt.cit.includes(e.target.value)) filt.cit.push(e.target.value); players(adm); return; }
    sync();
  });
  fl.addEventListener('click', e => {
    const pf = e.target.closest('.pf');
    if (pf) { const i = +pf.dataset.pos; filt.pos = filt.pos.includes(i) ? filt.pos.filter(x => x !== i) : [...filt.pos, i]; players(adm); return; }
    const c = e.target.closest('.cf'); if (!c) return;
    filt.cit = filt.cit.includes(c.dataset.c) ? filt.cit.filter(x => x !== c.dataset.c) : [...filt.cit, c.dataset.c];
    players(adm);
  });
  $('#clear', adm).addEventListener('click', () => { filt = F0(); players(adm); });
  $('#example', adm).addEventListener('click', () => { filt = { ...F0(), year: '2011', gender: 'F', cit: ['BA'], residence: 'NO' }; players(adm); toast('Female · born 2011 · citizenship Bosnia and Herzegovina · living in Norway'); });
  $('#pt thead', adm).addEventListener('click', e => { const b = e.target.closest('[data-sort]'); if (!b) return; sortBy = [b.dataset.sort, sortBy[0] === b.dataset.sort ? -sortBy[1] : 1]; players(adm); });
  $('#pt tbody', adm).addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) playerModal(tr.dataset.id, () => table()); });
  $('#ex1', adm).addEventListener('click', () => exportPlayers('csv'));
  $('#ex2', adm).addEventListener('click', () => exportPlayers('xls'));
  function table() {
    const rows = sorted(applyFilters());
    $('#count', adm).innerHTML = `<b>${rows.length}</b> of ${db.players.length} players match`;
    const per = 20, pages = Math.max(1, Math.ceil(rows.length / per));
    page = Math.min(page, pages - 1);
    $('#pt tbody', adm).innerHTML = rows.slice(page * per, page * per + per).map(p => `<tr data-id="${p.id}" tabindex="0"><td class="mono">${p.id}</td><td><b>${esc(p.name)}</b></td><td>${birthYear(p)}</td><td>${p.gender === 'F' ? 'F' : 'M'}</td><td>${groupOf(p)}</td><td class="flagsline">${cflags(p.citizens)}</td><td>${esc(cn(p.residence))}</td><td>${esc(p.club)}</td><td>${stChip(playerStatus(p))}</td><td class="muted">${fmtD(p.createdAt, 'en')}</td></tr>`).join('') || '<tr><td colspan="10" class="empty-row">No players match these filters.</td></tr>';
    $('#pager', adm).innerHTML = pages > 1 ? [...Array(pages)].map((_, i) => `<button class="${i === page ? 'on' : ''}" data-pg="${i}">${i + 1}</button>`).join('') : '';
    $$('[data-pg]', adm).forEach(b => b.addEventListener('click', () => { page = +b.dataset.pg; table(); }));
  }
  table();
}
function sorted(rows) {
  const [k, d] = sortBy;
  const val = p => k === 'birth' ? p.birth : k === 'group' ? groupOf(p) : k === 'cit' ? p.citizens.join() : k === 'status' ? playerStatus(p) : k === 'residence' ? cn(p.residence) : p[k];
  return [...rows].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * d);
}
function describeFilters() {
  const parts = [];
  Object.entries(filt).forEach(([k, v]) => { if (Array.isArray(v) ? v.length : v) parts.push(`${k}: ${Array.isArray(v) ? v.map(x => k === 'pos' ? POS[x] : x).join('/') : v}`); });
  return parts.join(', ') || 'none';
}
function exportPlayers(kind) {
  const rows = sorted(applyFilters());
  const cols = ['ID', 'Name', 'Birth year', 'Group', 'Gender', 'Citizenships', 'Potential citizenships', 'Country of birth', 'Country of residence', 'Club', 'Playing hand', 'Positions', 'Status', 'Registered'];
  const data = rows.map(p => [p.id, p.name, birthYear(p), groupOf(p), p.gender === 'F' ? 'Female' : 'Male', p.citizens.map(cn).join(' / '), p.potential.map(cn).join(' / '), cn(p.birthCountry), cn(p.residence), p.club, p.hand === 'L' ? 'Left' : 'Right', p.positions.map(i => POS[i]).join(' / '), ST[playerStatus(p)][1], new Date(p.createdAt).toISOString().slice(0, 10)]);
  const stamp = new Date().toISOString().slice(0, 10);
  if (kind === 'csv') {
    const q = v => `"${String(v).replace(/"/g, '""')}"`;
    download(`handballbridge-players-${stamp}.csv`, '﻿' + [cols, ...data].map(r => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
  } else {
    const x = v => String(v).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
    const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Players"><Table>${[cols, ...data].map((r, i) => `<Row>${r.map(v => `<Cell${i ? '' : ' ss:StyleID="h"'}><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${x(v)}</Data></Cell>`).join('')}</Row>`).join('')}</Table></Worksheet></Workbook>`;
    download(`handballbridge-players-${stamp}.xls`, xml, 'application/vnd.ms-excel');
  }
  log('admin', actor, `Exported ${rows.length} players to ${kind.toUpperCase()} (filters: ${describeFilters()}). Contact details not included.`);
  toast(`Exported ${rows.length} players. The export is logged.`);
}

function playerModal(id, refresh) {
  const p = playerById(id);
  if (!p) return;
  const owner = userById(p.parentId || p.userId);
  log('access', actor, `Opened full profile ${p.id}`);
  const cons = consentsOf({ playerId: p.id });
  const rows = [['Gender', p.gender === 'F' ? 'Female' : 'Male'], ['Date of birth', p.birth], ['Place of birth', p.place], ['Country of birth', cn(p.birthCountry)], ['Country of residence', cn(p.residence)], ['Citizenships', p.citizens.map(cn).join(', ')], ['Potential citizenships', p.potential.map(cn).join(', ') || '—'], ['Basis', p.basis], ['Club', p.club], ['Club email', p.clubEmail || '—'], ['Playing hand', p.hand === 'L' ? 'Left' : 'Right'], ['Positions', p.positions.map(i => POS[i]).join(', ')],
    ...(p.kind === 'minor' ? [['First parent', `${p.parent1} · ${p.phone1} · ${p.email1}`], ['Second parent', p.parent2 ? `${p.parent2} · ${p.phone2} · ${p.email2}` : '—']] : [['Phone', p.phone || '—']])];
  openModal({
    title: p.name, wide: true, sub: `${p.id} · ${groupOf(p)} · ${p.kind === 'adult' ? 'Adult player (own account)' : 'Minor (parent account)'} · access to this profile is logged`,
    html: `<div class="pm">
      <div class="pm-top">${stChip(playerStatus(p))}<span class="chip">${p.seasonCheck === SEASON ? `Season ${SEASON} checked` : `Season ${SEASON} not checked`}</span><span class="muted small">Registered ${fmtDT(p.createdAt, 'en')} · last change ${fmtDT(p.updatedAt, 'en')}</span></div>
      <div class="grid-2"><dl class="details compact">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div><h4>Linked account</h4><div class="linked">${owner ? `<b>${esc(owner.first)} ${esc(owner.last)}</b><span>${esc(owner.email)}</span><span>${owner.role === 'parent' ? 'Parent account' : 'Own adult account'} · email ${owner.verified ? 'verified' : 'NOT verified'} · ${owner.status}</span>` : 'Account deleted'}</div>
      <h4>Consent status</h4><ul class="clist">${cons.map(c => `<li><span class="chip ${c.status === 'given' ? 'ok' : 'bad'}">${c.status}</span> ${c.type} · v${c.version} · ${c.lang} · ${fmtDT(c.withdrawnAt || c.at, 'en')}</li>`).join('') || '<li class="muted">No consent recorded</li>'}</ul></div></div>
      <div class="modal-foot spread"><button class="btn btn-ghost btn-sm" id="pmEdit">${icon.edit} Correct data</button><button class="btn btn-ghost btn-sm" id="pmAct">${p.status === 'inactive' ? 'Reactivate profile' : 'Deactivate profile'}</button><button class="btn btn-danger btn-sm" id="pmDel">${icon.trash} Start deletion</button></div></div>`,
    onMount(w, close) {
      $('#pmAct', w).addEventListener('click', () => {
        p.status = p.status === 'inactive' ? 'active' : 'inactive'; p.updatedAt = Date.now(); save();
        log('admin', actor, `${p.status === 'inactive' ? 'Deactivated' : 'Reactivated'} profile ${p.id}`);
        toast(`Profile ${p.status === 'inactive' ? 'deactivated' : 'reactivated'}.`); close(); refresh();
      });
      $('#pmDel', w).addEventListener('click', async () => {
        close();
        const ok = await confirmBox({ title: `Delete ${p.name}?`, text: 'Controlled deletion: the profile is removed. Consent records are kept anonymised for the legal retention period. The parent gets an email.', confirmLabel: 'Delete profile', danger: true, requireWord: 'DELETE' });
        if (!ok) return;
        const o = userById(p.parentId || p.userId);
        deletePlayer(p.id, actor, 'administrative deletion');
        if (o) sendMail(o.email, `HandballBridge: profile ${p.id} deleted`, wrapMail(o.lang, 'Profile deleted', `<p>The profile ${esc(p.id)} was deleted by the administrator. Questions: info@hb-talents.com.</p>`), { quiet: true });
        toast('Profile deleted and logged.'); refresh();
      });
      $('#pmEdit', w).addEventListener('click', () => { close(); correctModal(p, refresh); });
    }
  });
}
function correctModal(p, refresh) {
  const fields = [['name', 'Name'], ['place', 'Place of birth'], ['club', 'Club'], ['clubEmail', 'Club email'], ['phone1', 'First parent phone'], ['email1', 'First parent email']].filter(([k]) => p.kind === 'minor' || !['phone1', 'email1'].includes(k));
  openModal({
    title: `Correct data · ${p.id}`, sub: 'Every correction is saved with the old value, the new value and your reason.',
    html: `<form id="cfm" class="form" novalidate>${fields.map(([k, l]) => `<div class="field"><label for="c_${k}">${l}</label><input class="input" id="c_${k}" name="${k}" value="${esc(p[k])}"></div>`).join('')}
      <div class="field"><label for="reason">Reason for the correction <b class="req">*</b></label><input class="input" id="reason" name="reason" placeholder="e.g. request from parent on ${new Date().toISOString().slice(0, 10)}"></div>
      <div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-gold" type="submit">Save correction</button></div></form>`,
    onMount(w, close) {
      const f = $('#cfm', w);
      f.addEventListener('submit', e => {
        e.preventDefault(); clearErrors(f);
        const v = Object.fromEntries(new FormData(f));
        if (!v.reason.trim()) { fieldError(f, 'reason', 'A reason is required for the audit log.'); return; }
        const changes = fields.filter(([k]) => (v[k] || '').trim() !== (p[k] || '')).map(([k]) => { const s = `${k}: "${p[k]}" → "${v[k].trim()}"`; p[k] = v[k].trim(); return s; });
        if (!changes.length) { close(); return; }
        p.updatedAt = Date.now(); save();
        log('profile', actor, `Corrected ${p.id}: ${changes.join('; ')} · reason: ${v.reason.trim()}`);
        toast('Correction saved and logged.'); close(); refresh();
      });
    }
  });
}

/* ---------------- 8.5 accounts ---------------- */
function accounts(adm) {
  let q = '', type = '';
  adm.innerHTML = head('Parent and player accounts', 'Search accounts, check verification and consent, deactivate or handle requests. Passwords are stored as hashes and can never be viewed.') +
    `<div class="card"><div class="toolbar"><span class="search">${icon.search}<input class="input sm" id="aq" placeholder="Search name, username or email"></span>
      <select class="input sm" id="at"><option value="">All account types</option><option value="parent">Parent accounts</option><option value="adult">Adult player accounts</option></select></div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Type</th><th>Email</th><th>Email verified</th><th class="r">Players</th><th>Consents</th><th>Status</th><th>Registered</th><th></th></tr></thead><tbody id="ab"></tbody></table></div></div>`;
  const draw = () => {
    const list = db.users.filter(u => u.role !== 'admin' && (!type || u.role === type) && (!q || `${u.first} ${u.last} ${u.username} ${u.email}`.toLowerCase().includes(q))).sort((a, b) => b.createdAt - a.createdAt);
    $('#ab', adm).innerHTML = list.map(u => {
      const ps = playersOf(u.id);
      const missing = ps.filter(p => playerConsent(p.id)?.status !== 'given').length;
      return `<tr data-u="${u.id}"><td><b>${esc(u.first)} ${esc(u.last)}</b><small class="block muted">${esc(u.username)}</small></td><td>${u.role === 'parent' ? 'Parent' : 'Adult player'}</td><td class="mono small">${esc(maskEmail(u.email))}</td>
        <td>${u.verified ? '<span class="chip ok">Verified</span>' : '<span class="chip warn">Unverified</span>'}</td><td class="r"><b>${ps.length}</b></td>
        <td>${!ps.length ? '<span class="muted small">—</span>' : missing ? `<span class="chip bad">${missing} missing</span>` : '<span class="chip ok">Complete</span>'}</td>
        <td>${u.status === 'inactive' ? '<span class="chip bad">Deactivated</span>' : '<span class="chip ok">Active</span>'}</td><td class="muted">${fmtD(u.createdAt, 'en')}</td>
        <td class="r"><button class="btn btn-ghost btn-sm" data-view>View</button></td></tr>`;
    }).join('');
  };
  $('#aq', adm).addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
  $('#at', adm).addEventListener('change', e => { type = e.target.value; draw(); });
  $('#ab', adm).addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) accountModal(b.closest('tr').dataset.u, draw); });
  draw();
}
function accountModal(id, refresh) {
  const u = userById(id);
  log('access', actor, `Opened account ${u.username}`);
  const ps = playersOf(u.id);
  const cons = consentsOf({ userId: u.id }).filter(c => !c.playerId);
  openModal({
    title: `${u.first} ${u.last}`, wide: true, sub: `${u.role === 'parent' ? 'Parent account' : 'Adult player account'} · ${u.email} · language ${u.lang.toUpperCase()}`,
    html: `<div class="grid-2"><div><h4>Account</h4><dl class="details compact"><div><dt>Username</dt><dd>${esc(u.username)}</dd></div><div><dt>Date of birth</dt><dd>${u.birth}</dd></div><div><dt>Country of residence</dt><dd>${esc(cn(u.residence))}</dd></div><div><dt>Email verified</dt><dd>${u.verified ? 'Yes' : 'No'}</dd></div><div><dt>Registered</dt><dd>${fmtDT(u.createdAt, 'en')}</dd></div><div><dt>Password</dt><dd>${icon.lock} Stored as a salted hash, not viewable</dd></div></dl>
      <h4>Declarations</h4><ul class="clist">${cons.map(c => `<li><span class="chip ${c.status === 'given' ? 'ok' : 'bad'}">${c.status}</span> ${c.type} · v${c.version} · ${fmtDT(c.at, 'en')}</li>`).join('') || '<li class="muted">None yet</li>'}</ul></div>
      <div><h4>Linked players (${ps.length})</h4><ul class="clist">${ps.map(p => `<li><b>${esc(p.name)}</b> · ${p.id} · ${groupOf(p)} ${stChip(playerStatus(p))}</li>`).join('') || '<li class="muted">No players</li>'}</ul>
      <h4>Requests</h4><ul class="clist">${db.requests.filter(r => r.userId === u.id).map(r => `<li><span class="chip">${r.type}</span> ${esc(r.text)} · ${r.status}</li>`).join('') || '<li class="muted">No requests</li>'}</ul></div></div>
      <div class="modal-foot spread">${!u.verified ? '<button class="btn btn-ghost btn-sm" id="resendV">Resend verification code</button>' : ''}<button class="btn btn-ghost btn-sm" id="deact">${u.status === 'inactive' ? 'Reactivate account' : 'Deactivate account'}</button><button class="btn btn-danger btn-sm" id="delAcc">${icon.trash} Delete account</button></div>`,
    onMount(w, close) {
      $('#deact', w).addEventListener('click', () => {
        u.status = u.status === 'inactive' ? 'active' : 'inactive'; save();
        log('admin', actor, `${u.status === 'inactive' ? 'Deactivated' : 'Reactivated'} account ${u.username}`);
        toast('Saved and logged.'); close(); refresh();
      });
      $('#resendV', w)?.addEventListener('click', async () => {
        const { codeMail } = await import('../mail.js');
        codeMail(u, await issueCode(u.id, 'verify'));
        log('admin', actor, `Resent verification code to ${u.username}`);
      });
      $('#delAcc', w).addEventListener('click', async () => {
        close();
        if (!await confirmBox({ title: `Delete the account of ${u.first} ${u.last}?`, text: `The account and ${ps.length} linked player profile(s) are removed. Consent records are kept anonymised as required by law.`, confirmLabel: 'Delete account', danger: true, requireWord: 'DELETE' })) return;
        deleteAccount(u.id, actor);
        toast('Account deleted and logged.'); refresh();
      });
    }
  });
}

/* ---------------- requests + messages ---------------- */
function requests(adm) {
  const reqs = db.requests;
  adm.innerHTML = head('Requests and messages', 'Correction and deletion requests from parents and players, and messages from the contact form.') +
    `<div class="card"><h3>Data requests</h3><div class="list">${reqs.map(r => {
      const u = userById(r.userId);
      return `<div class="lrow" data-r="${r.id}"><span class="lic ${r.status === 'done' ? 'ok' : ''}">${r.type === 'deletion' ? icon.trash : icon.edit}</span>
        <div class="lmain"><b>${r.type === 'deletion' ? 'Deletion request' : 'Correction request'} · ${u ? esc(`${u.first} ${u.last}`) : 'deleted account'}</b><small>${esc(r.text)} · ${fmtDT(r.at, 'en')}</small></div>
        <span class="chip ${r.status === 'done' ? 'ok' : r.status === 'progress' ? 'warn' : ''}">${r.status === 'done' ? 'Done' : r.status === 'progress' ? 'In progress' : 'Open'}</span>
        ${r.status !== 'done' ? `${u ? `<button class="btn btn-ghost btn-sm" data-open="${u.id}">Account</button>` : ''}${r.type === 'deletion' && u ? '<button class="btn btn-danger btn-sm" data-run>Run deletion</button>' : ''}<button class="btn btn-ghost btn-sm" data-done>Mark done</button>` : ''}</div>`;
    }).join('') || '<p class="muted">No requests.</p>'}</div></div>
    <div class="card"><h3>Contact messages</h3><div class="list">${db.messages.map(m => `<div class="lrow ${m.read ? '' : 'unread'}" data-m="${m.id}"><span class="lic">${icon.mail}</span><div class="lmain"><b>${esc(m.name)} · ${m.type === 'parent' ? 'Parent' : 'External inquiry'}</b><small>${esc(m.email)} · ${fmtDT(m.at, 'en')}</small><p>${esc(m.body)}</p></div><button class="btn btn-ghost btn-sm" data-read>${m.read ? 'Mark unread' : 'Mark read'}</button></div>`).join('') || '<p class="muted">No messages.</p>'}</div></div>`;
  adm.addEventListener('click', async e => {
    const row = e.target.closest('[data-r]');
    if (row) {
      const r = db.requests.find(x => x.id === row.dataset.r);
      if (e.target.closest('[data-done]')) { r.status = 'done'; save(); log('admin', actor, `Request ${r.type} marked done`); requests(adm); }
      if (e.target.closest('[data-open]')) accountModal(e.target.closest('[data-open]').dataset.open, () => requests(adm));
      if (e.target.closest('[data-run]')) {
        const u = userById(r.userId);
        if (!await confirmBox({ title: 'Run the deletion?', text: `Deletes the account of ${esc(u.first)} ${esc(u.last)} and all linked player profiles.`, confirmLabel: 'Delete', danger: true, requireWord: 'DELETE' })) return;
        sendMail(u.email, 'HandballBridge: your data was deleted', wrapMail(u.lang, 'Deletion completed', '<p>Your account and all linked profiles were deleted as you requested.</p>'), { quiet: true });
        deleteAccount(u.id, actor); r.status = 'done'; save(); toast('Deletion completed and logged.'); requests(adm);
      }
    }
    const mr = e.target.closest('[data-m]');
    if (mr && e.target.closest('[data-read]')) { const m = db.messages.find(x => x.id === mr.dataset.m); m.read = !m.read; save(); requests(adm); }
  }, { once: true });
}

/* ---------------- 8.6 website content ---------------- */
const SITE_LABELS = { home: 'Menu: Home', about: 'Menu: About', parents: 'Menu: For parents', contact: 'Menu: Contact', register: 'Button: Sign in', heroEyebrow: 'Homepage: small heading', heroA: 'Homepage: title line 1', heroB: 'Homepage: title line 2 (gold)', heroDesc: 'Homepage: description', registerChild: 'Homepage: main button', privateNote: 'Homepage: privacy note', adminEntry: 'Menu: Administrator' };
function content(adm) {
  let l = 'bs';
  const draw = () => {
    const posts = db.content.posts || [];
    adm.innerHTML = head('Website content', 'Change texts, news and the main image without a developer. Changes are live immediately and logged.', `<a class="btn btn-ghost btn-sm" href="#/" target="_blank">Open homepage ↗</a>`) +
      `<div class="card"><div class="row-between"><h3>Homepage and menu texts</h3><label class="ff inline"><span>Language</span><select class="input sm" id="cl">${LANGS.map(x => `<option value="${x.code}" ${x.code === l ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label></div>
        <form id="cform" class="form">${SITE_KEYS.map(k => { const v = site(k, l); const long = v.length > 60; return `<div class="field"><label for="s_${k}">${SITE_LABELS[k] || k}</label>${long ? `<textarea class="input" id="s_${k}" name="${k}" rows="2">${esc(v)}</textarea>` : `<input class="input" id="s_${k}" name="${k}" value="${esc(v)}">`}</div>`; }).join('')}
        <div class="row-between"><span class="muted small">Only the selected language changes. The original text can be restored at any time.</span><span><button class="btn btn-ghost btn-sm" type="button" id="crest">Restore original</button> <button class="btn btn-gold btn-sm" type="submit">Save texts</button></span></div></form></div>
      <div class="card" id="slogEd"></div>
      <div class="grid-2"><div class="card"><h3>Main homepage image</h3><p class="muted small">The current image stays until the project owner approves a new one.</p>
        <div class="heroprev" style="background-image:url('${heroImage()}')"></div>
        <label class="check"><input type="checkbox" id="appr"><span>The new image is approved by the project owner</span></label>
        <div class="row-between"><label class="btn btn-ghost btn-sm file">${icon.image} Upload new image<input type="file" id="himg" accept="image/jpeg,image/png,image/webp" hidden></label>${db.content.heroImage ? '<button class="btn btn-ghost btn-sm" id="hrest">Restore original image</button>' : ''}</div></div>
      <div class="card"><div class="row-between"><h3>News and announcements</h3><button class="btn btn-gold btn-sm" id="padd">${icon.plus} New post</button></div>
        <div class="list">${posts.map(p => `<div class="lrow" data-p="${p.id}"><span class="lic ${p.active ? 'ok' : ''}">${icon.text}</span><div class="lmain"><b>${esc(p.title.en || p.title.bs)}</b><small>${fmtD(p.at, 'en')} · ${p.active ? 'Visible on homepage' : 'Hidden'}</small></div><button class="btn btn-ghost btn-sm" data-pe>Edit</button><button class="btn btn-ghost btn-sm" data-pt>${p.active ? 'Hide' : 'Show'}</button><button class="btn btn-ghost btn-sm danger" data-pd>Delete</button></div>`).join('') || '<p class="muted">No posts.</p>'}</div></div></div>`;
    $('#cl', adm).addEventListener('change', e => { l = e.target.value; draw(); });
    sloganEditor($('#slogEd', adm), l);
    $('#cform', adm).addEventListener('submit', e => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(e.target));
      db.overrides[l] = db.overrides[l] || {};
      const changed = [];
      SITE_KEYS.forEach(k => { const nv = v[k].trim(); if (nv !== site(k, l)) changed.push(k); db.overrides[l]['site.' + k] = nv; });
      save(); setOverrides(db.overrides);
      log('admin', actor, `Website texts edited (${l}): ${changed.join(', ') || 'no changes'}`);
      toast('Texts saved. They are live on the website.');
    });
    $('#crest', adm).addEventListener('click', () => {
      if (db.overrides[l]) Object.keys(db.overrides[l]).filter(k => k.startsWith('site.')).forEach(k => delete db.overrides[l][k]);
      save(); setOverrides(db.overrides); log('admin', actor, `Website texts restored to original (${l})`); toast('Original texts restored.'); draw();
    });
    $('#himg', adm).addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      if (!$('#appr', adm).checked) { toast('Please confirm the approval first.', 'bad'); e.target.value = ''; return; }
      if (file.size > 3 * 1024 * 1024) { toast('Image too large (max 3 MB).', 'bad'); return; }
      const r = new FileReader();
      r.onload = () => { db.content.heroImage = r.result; save(); log('admin', actor, 'Main homepage image replaced (approved by project owner)'); toast('Main image replaced.'); draw(); };
      r.readAsDataURL(file);
    });
    $('#hrest', adm)?.addEventListener('click', () => { delete db.content.heroImage; save(); log('admin', actor, 'Main homepage image restored to original'); toast('Original image restored.'); draw(); });
    $('#padd', adm).addEventListener('click', () => postModal(null, draw));
    $$('[data-p]', adm).forEach(row => {
      const p = posts.find(x => x.id === row.dataset.p);
      $('[data-pe]', row).addEventListener('click', () => postModal(p, draw));
      $('[data-pt]', row).addEventListener('click', () => { p.active = !p.active; save(); log('admin', actor, `Post ${p.active ? 'shown' : 'hidden'}: ${p.title.en}`); draw(); });
      $('[data-pd]', row).addEventListener('click', async () => { if (!await confirmBox({ title: 'Delete this post?', text: esc(p.title.en || ''), confirmLabel: 'Delete', danger: true })) return; db.content.posts = posts.filter(x => x !== p); save(); log('admin', actor, `Post deleted: ${p.title.en}`); draw(); });
    });
  };
  draw();
}
function postModal(p, done) {
  openModal({
    title: p ? 'Edit post' : 'New post', html: `<form id="pf" class="form"><div class="grid2"><div class="field"><label>Title (English)</label><input class="input" name="ten" value="${esc(p?.title.en || '')}"></div><div class="field"><label>Title (Bosanski)</label><input class="input" name="tbs" value="${esc(p?.title.bs || '')}"></div></div>
      <div class="grid2"><div class="field"><label>Text (English)</label><textarea class="input" name="ben" rows="4">${esc(p?.body.en || '')}</textarea></div><div class="field"><label>Text (Bosanski)</label><textarea class="input" name="bbs" rows="4">${esc(p?.body.bs || '')}</textarea></div></div>
      <p class="muted small">Other languages show the English text until a translation is added.</p>
      <div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-gold" type="submit">Save</button></div></form>`,
    onMount(w, close) {
      $('#pf', w).addEventListener('submit', e => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        if (!v.ten.trim() && !v.tbs.trim()) { toast('Add a title.', 'bad'); return; }
        const data = { title: { en: v.ten.trim(), bs: v.tbs.trim() }, body: { en: v.ben.trim(), bs: v.bbs.trim() } };
        if (p) Object.assign(p, data); else (db.content.posts = db.content.posts || []).unshift({ id: uid('n'), ...data, at: Date.now(), active: true });
        save(); log('admin', actor, `Post ${p ? 'edited' : 'published'}: ${data.title.en || data.title.bs}`); close(); done();
      });
    }
  });
}

/* ---------------- 8.7 translations ---------------- */
function translations(adm) {
  let l = 'hr', q = '', onlyOpen = false;
  const stats = code => {
    const ov = db.overrides[code] || {};
    const review = DERIVED[code] ? KEYS.filter(k => !ov[k]).length : 0;
    return { edited: Object.keys(ov).filter(k => !k.startsWith('site.')).length, review };
  };
  const draw = () => {
    const ov = db.overrides[l] || {};
    const rows = KEYS.filter(k => {
      const txt = (ov[k] ?? baseText(k, l)) + ' ' + baseText(k, 'en') + ' ' + k;
      const open = DERIVED[l] && !ov[k];
      return (!q || txt.toLowerCase().includes(q)) && (!onlyOpen || open);
    });
    adm.innerHTML = head('Languages and translations', 'Choose a language, find a text and edit it. A change affects only that language and never the structure of the forms.') +
      `<div class="langstats">${LANGS.map(x => { const s = stats(x.code); return `<button class="lstat ${x.code === l ? 'on' : ''}" data-l="${x.code}"><b>${x.name}</b><small>${KEYS.length} texts${s.edited ? ` · ${s.edited} edited` : ''}</small>${s.review ? `<em>${s.review} need review</em>` : '<em class="ok">Complete</em>'}</button>`; }).join('')}</div>
      <div class="card"><div class="toolbar"><span class="search">${icon.search}<input class="input sm" id="tq" placeholder="Find a text in English or ${esc(LANGS.find(x => x.code === l).name)}" value="${esc(q)}"></span>
        <label class="check inline"><input type="checkbox" id="topen" ${onlyOpen ? 'checked' : ''}><span>Only missing / needs review</span></label><span class="muted small">${rows.length} texts</span></div>
        ${DERIVED[l] ? note(`${esc(LANGS.find(x => x.code === l).name)} starts from ${DERIVED[l] === 'bs' ? 'Bosnian' : 'Albanian'} and needs a native speaker's check. Saving a text marks it as reviewed.`) : ''}
        <div class="table-wrap"><table class="tbl tr"><thead><tr><th>Text</th><th>English reference</th><th>${esc(LANGS.find(x => x.code === l).name)}</th><th></th></tr></thead><tbody>${rows.slice(0, 60).map(k => {
          const open = DERIVED[l] && !ov[k];
          return `<tr data-k="${k}"><td class="mono small">${k}</td><td class="small muted">${esc(baseText(k, 'en'))}</td><td><textarea class="input sm" rows="2">${esc(ov[k] ?? baseText(k, l))}</textarea></td><td class="r">${open ? '<span class="chip warn">Review</span>' : ov[k] ? '<span class="chip ok">Edited</span>' : ''}<button class="btn btn-ghost btn-sm" data-save>Save</button></td></tr>`;
        }).join('')}</tbody></table></div>${rows.length > 60 ? `<p class="muted small">Showing 60 of ${rows.length}. Use the search to find a text.</p>` : ''}</div>`;
    $$('[data-l]', adm).forEach(b => b.addEventListener('click', () => { l = b.dataset.l; draw(); }));
    $('#tq', adm).addEventListener('input', e => { q = e.target.value.toLowerCase(); const pos = e.target.selectionStart; draw(); const i = $('#tq', adm); i.focus(); i.setSelectionRange(pos, pos); });
    $('#topen', adm).addEventListener('change', e => { onlyOpen = e.target.checked; draw(); });
    $$('[data-save]', adm).forEach(b => b.addEventListener('click', () => {
      const tr = b.closest('tr'), k = tr.dataset.k, v = $('textarea', tr).value.trim();
      if (!v) { toast('A translation cannot be empty.', 'bad'); return; }
      const ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
      if (ph(v) !== ph(baseText(k, 'en'))) { toast(`Keep the placeholders: ${ph(baseText(k, 'en')) || 'none'}`, 'bad'); return; }
      db.overrides[l] = db.overrides[l] || {}; db.overrides[l][k] = v; save(); setOverrides(db.overrides);
      log('admin', actor, `Translation edited (${l}): ${k}`); toast('Translation saved.'); draw();
    }));
  };
  draw();
}

/* ---------------- 8.8 advertising ---------------- */
function ads(adm) {
  adm.innerHTML = head('Advertising', 'Manage the advertising spaces on the homepage. Adverts never receive any data about children or parents: no tracking, no cookies, links open separately.', `<button class="btn btn-gold btn-sm" id="adAdd">${icon.plus} Add advert</button>`) +
    `<div class="ads-admin">${db.ads.map(a => {
      const d = new Date().toISOString().slice(0, 10);
      const live = a.active && (!a.from || a.from <= d) && (!a.to || a.to >= d);
      return `<div class="card adrow" data-a="${a.id}"><div class="adprev">${adHTML(a)}</div><div class="admeta"><span class="chip ${live ? 'ok' : ''}">${live ? 'Live' : a.active ? 'Scheduled / ended' : 'Inactive'}</span><small>Space ${a.slot}${a.from || a.to ? ` · ${a.from || '…'} – ${a.to || '…'}` : ' · no end date'}${a.url ? ` · ${esc(a.url)}` : ''}</small>
        <span><button class="btn btn-ghost btn-sm" data-ed>Edit</button><button class="btn btn-ghost btn-sm" data-tg>${a.active ? 'Deactivate' : 'Activate'}</button><button class="btn btn-ghost btn-sm danger" data-dl>Delete</button></span></div></div>`;
    }).join('') || '<p class="muted">No adverts.</p>'}</div>`;
  $('#adAdd', adm).addEventListener('click', () => adModal(null, () => ads(adm)));
  $$('[data-a]', adm).forEach(row => {
    const a = db.ads.find(x => x.id === row.dataset.a);
    $('[data-ed]', row).addEventListener('click', () => adModal(a, () => ads(adm)));
    $('[data-tg]', row).addEventListener('click', () => { a.active = !a.active; save(); log('admin', actor, `Advert ${a.active ? 'activated' : 'deactivated'}: ${a.title}`); ads(adm); });
    $('[data-dl]', row).addEventListener('click', async () => { if (!await confirmBox({ title: 'Delete this advert?', text: esc(a.title), confirmLabel: 'Delete', danger: true })) return; db.ads = db.ads.filter(x => x !== a); save(); log('admin', actor, `Advert deleted: ${a.title}`); ads(adm); });
  });
  $$('.adprev a', adm).forEach(a => a.addEventListener('click', e => e.preventDefault()));
}
function adModal(a, done) {
  const x = a || { title: '', desc: '', button: 'Saznaj više', url: '', image: '', active: true, from: '', to: '', slot: Math.max(0, ...db.ads.map(y => y.slot)) + 1 };
  let image = x.image;
  openModal({
    title: a ? 'Edit advert' : 'New advert', wide: true,
    html: `<form id="adf" class="form" novalidate><div class="grid2"><div class="field"><label>Title</label><input class="input" name="title" value="${esc(x.title)}"></div><div class="field"><label>Short text</label><input class="input" name="desc" value="${esc(x.desc)}"></div>
      <div class="field"><label>Button text</label><input class="input" name="button" value="${esc(x.button)}"></div><div class="field"><label>Destination URL</label><input class="input" name="url" value="${esc(x.url)}" placeholder="https://"></div>
      <div class="field"><label>Show from</label><input class="input" type="date" name="from" value="${x.from}"></div><div class="field"><label>Show until</label><input class="input" type="date" name="to" value="${x.to}"></div></div>
      <div class="row-between"><label class="btn btn-ghost btn-sm file">${icon.image} Upload image or logo<input type="file" id="adimg" accept="image/*" hidden></label><label class="check inline"><input type="checkbox" name="active" ${x.active ? 'checked' : ''}><span>Active</span></label></div>
      <div class="adprev" id="adp"></div>
      <div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-gold" type="submit">Save advert</button></div></form>`,
    onMount(w, close) {
      const f = $('#adf', w);
      const prev = () => { const v = Object.fromEntries(new FormData(f)); $('#adp', w).innerHTML = adHTML({ ...v, image }); };
      prev(); f.addEventListener('input', prev);
      $('#adimg', w).addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; if (file.size > 1024 * 1024) { toast('Max 1 MB.', 'bad'); return; } const r = new FileReader(); r.onload = () => { image = r.result; prev(); }; r.readAsDataURL(file); });
      f.addEventListener('submit', e => {
        e.preventDefault(); clearErrors(f);
        const v = Object.fromEntries(new FormData(f));
        if (!v.title.trim()) { fieldError(f, 'title', 'Required'); return; }
        if (v.url && !/^https:\/\/[\w.-]+\.[a-z]{2,}/i.test(v.url.trim())) { fieldError(f, 'url', 'Use a full https:// address.'); return; }
        if (v.from && v.to && v.from > v.to) { fieldError(f, 'to', 'End date is before the start date.'); return; }
        const data = { title: v.title.trim(), desc: v.desc.trim(), button: v.button.trim(), url: v.url.trim(), image, active: !!v.active, from: v.from, to: v.to };
        if (a) Object.assign(a, data); else db.ads.push({ id: uid('ad'), slot: x.slot, ...data });
        save(); log('admin', actor, `Advert ${a ? 'edited' : 'added'}: ${data.title}`); toast('Advert saved.'); close(); done();
      });
    }
  });
}

/* ---------------- 8.9 reports ---------------- */
function reports(adm) {
  let by = 'week';
  const draw = () => {
    const pl = db.players;
    const bucket = ts => { const d = new Date(ts); if (by === 'day') return d.toISOString().slice(0, 10); if (by === 'month') return d.toISOString().slice(0, 7); const m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return 'Week of ' + m.toISOString().slice(0, 10); };
    const time = {}; pl.forEach(p => { const k = bucket(p.createdAt); time[k] = (time[k] || 0) + 1; });
    const timeRows = Object.entries(time).sort((a, b) => b[0].localeCompare(a[0])).slice(0, by === 'day' ? 14 : 10);
    const count = fn => { const o = {}; pl.forEach(p => [].concat(fn(p)).forEach(k => { o[k] = (o[k] || 0) + 1; })); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
    const tbl = (title, rows, label = x => x) => `<div class="card"><h3>${title}</h3><table class="tbl"><tbody>${rows.map(([k, v]) => `<tr><td>${esc(label(k))}</td><td class="r"><b>${v}</b></td></tr>`).join('')}</tbody></table></div>`;
    const cons = { given: 0, withdrawn: 0 }; pl.forEach(p => { cons[playerConsent(p.id)?.status === 'given' ? 'given' : 'withdrawn']++; });
    const fed = db.users.filter(u => u.role !== 'admin' && db.consents.some(c => c.userId === u.id && c.type === 'federation' && c.status === 'given')).length;
    adm.innerHTML = head('Statistics and reports', 'Aggregated numbers only. No names or contact details.', `<button class="btn btn-ghost btn-sm" id="rcsv">${icon.download} Export report CSV</button>`) +
      `<div class="card"><div class="row-between"><h3>Registrations over time</h3><span>${['day', 'week', 'month'].map(k => `<button class="seg ${k === by ? 'on' : ''}" data-by="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</span></div>
        ${isB() ? barsV(timeRows.slice().reverse().map(([k, v]) => ({ l: k.replace('Week of ', '').slice(5), v })), { h: 150 }) : ''}
        <table class="tbl"><tbody>${timeRows.map(([k, v]) => `<tr><td>${k}</td><td class="r"><b>${v}</b></td></tr>`).join('')}</tbody></table></div>
      <div class="grid-3">
        ${tbl('By country of residence', count(p => p.residence), cn)}
        ${tbl('By citizenship', count(p => p.citizens), cn)}
        ${tbl('By birth-year group', count(p => groupOf(p)).sort((a, b) => a[0].localeCompare(b[0])))}
        ${tbl('By year of birth', count(p => String(birthYear(p))).sort((a, b) => a[0].localeCompare(b[0])))}
        ${tbl('By gender', count(p => p.gender), g => g === 'F' ? 'Female' : 'Male')}
        <div class="card"><h3>Verification and consent</h3><table class="tbl"><tbody><tr><td>Verified accounts</td><td class="r"><b>${db.users.filter(u => u.role !== 'admin' && u.verified).length}</b></td></tr><tr><td>Unverified accounts</td><td class="r"><b>${db.users.filter(u => u.role !== 'admin' && !u.verified).length}</b></td></tr><tr><td>Player consent given</td><td class="r"><b>${cons.given}</b></td></tr><tr><td>Player consent withdrawn</td><td class="r"><b>${cons.withdrawn}</b></td></tr><tr><td>Accounts allowing federation sharing</td><td class="r"><b>${fed}</b></td></tr></tbody></table></div>
      </div>`;
    $$('[data-by]', adm).forEach(b => b.addEventListener('click', () => { by = b.dataset.by; draw(); }));
    $('#rcsv', adm).addEventListener('click', () => {
      const lines = [['Section', 'Item', 'Count'], ...timeRows.map(([k, v]) => ['Registrations by ' + by, k, v]), ...count(p => p.residence).map(([k, v]) => ['Residence', cn(k), v]), ...count(p => p.citizens).map(([k, v]) => ['Citizenship', cn(k), v]), ...count(p => groupOf(p)).map(([k, v]) => ['Group', k, v]), ...count(p => p.gender).map(([k, v]) => ['Gender', k, v])];
      download(`handballbridge-report-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + lines.map(r => r.map(x => `"${x}"`).join(',')).join('\r\n'), 'text/csv');
      log('admin', actor, 'Exported statistics report (aggregated)');
    });
  };
  draw();
}

/* ---------------- 8.10 activity log ---------------- */
function logs(adm) {
  let type = '', q = '';
  const draw = () => {
    const list = db.logs.filter(l => (!type || l.type === type) && (!q || `${l.actor} ${l.text}`.toLowerCase().includes(q)));
    $('#lb', adm).innerHTML = list.slice(0, 150).map(l => `<tr><td class="muted nowrap">${fmtDT(l.at, 'en')}</td><td><span class="chip t-${l.type}">${LOG_TYPES[l.type] || l.type}</span></td><td>${esc(l.actor)}</td><td>${esc(l.text)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty-row">No entries.</td></tr>';
    $('#lc', adm).textContent = `${list.length} entries`;
  };
  adm.innerHTML = head('Activity log', `Security and administrative events. Kept for ${LOG_RETENTION_DAYS} days, then removed automatically. Only administrators can read it.`, `<button class="btn btn-ghost btn-sm" id="lcsv">${icon.download} Export CSV</button>`) +
    `<div class="card"><div class="toolbar"><span class="search">${icon.search}<input class="input sm" id="lq" placeholder="Search the log"></span><select class="input sm" id="lt"><option value="">All events</option>${Object.entries(LOG_TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><span class="muted small" id="lc"></span></div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>When</th><th>Event</th><th>By</th><th>Details</th></tr></thead><tbody id="lb"></tbody></table></div></div>`;
  $('#lq', adm).addEventListener('input', e => { q = e.target.value.toLowerCase(); draw(); });
  $('#lt', adm).addEventListener('change', e => { type = e.target.value; draw(); });
  $('#lcsv', adm).addEventListener('click', () => { download(`handballbridge-log-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + db.logs.map(l => [new Date(l.at).toISOString(), l.type, l.actor, l.text].map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\r\n'), 'text/csv'); log('admin', actor, 'Exported the activity log'); });
  draw();
}

/* ---------------- Option B: camps and events ---------------- */
function events(adm) {
  adm.innerHTML = head('Camps and events', 'Invite a group straight from the player database. Parents answer in their account; you see the answers here.', `<button class="btn btn-gold btn-sm" id="evNew">${icon.plus} New camp or event</button>`, true) +
    `<div class="events-admin">${db.events.map(ev => {
      const yes = ev.invited.filter(id => ev.answers[id] === 'yes').length, no = ev.invited.filter(id => ev.answers[id] === 'no').length;
      return `<div class="card evrow" data-e="${ev.id}"><div class="ev-date"><b>${day(ev.date).getDate()}</b><span>${day(ev.date).toLocaleDateString('en-GB', { month: 'short' })}</span></div>
        <div class="ev-main"><h3>${esc(ev.title)}</h3><p class="muted">${esc(ev.place)} · ${fmtD(ev.date, 'en')} · ${ev.group || 'all groups'}</p>
        <div class="ev-bar"><i style="width:${(yes / Math.max(1, ev.invited.length)) * 100}%" class="y"></i><i style="width:${(no / Math.max(1, ev.invited.length)) * 100}%" class="n"></i></div>
        <small><b>${ev.invited.length}</b> invited · <b class="okc">${yes}</b> accepted · <b class="badc">${no}</b> declined · ${ev.invited.length - yes - no} no answer</small></div>
        <button class="btn btn-ghost btn-sm" data-att>${icon.download} Attendance list</button></div>`;
    }).join('') || '<p class="muted">No events yet.</p>'}</div>`;
  $('#evNew', adm).addEventListener('click', () => eventModal(() => events(adm)));
  $$('[data-att]', adm).forEach(b => b.addEventListener('click', () => {
    const ev = db.events.find(x => x.id === b.closest('[data-e]').dataset.e);
    const rows = ev.invited.map(id => playerById(id)).filter(Boolean).map(p => [p.id, p.name, groupOf(p), p.club, ev.answers[p.id] === 'yes' ? 'Accepted' : ev.answers[p.id] === 'no' ? 'Declined' : 'No answer']);
    download(`attendance-${ev.date}.csv`, '﻿' + [['ID', 'Name', 'Group', 'Club', 'Answer'], ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\r\n'), 'text/csv');
    log('admin', actor, `Exported attendance list for ${ev.title}`);
  }));
}
function eventModal(done) {
  openModal({
    title: 'New camp or event', wide: true, sub: 'Invitations go to the parent (or the adult player) in their own language.',
    html: `<form id="evf" class="form" novalidate><div class="grid2"><div class="field"><label>Title</label><input class="input" name="title" placeholder="Selection camp 2012/13 boys"></div><div class="field"><label>Place</label><input class="input" name="place" placeholder="Zagreb"></div><div class="field"><label>Date</label><input class="input" type="date" name="date" min="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="field"><label>Birth-year group</label><select class="input" name="group"><option value="">All</option>${[...GROUPS, ADULT_GROUP].map(g => `<option>${g}</option>`).join('')}</select></div>
      <div class="field"><label>Gender</label><select class="input" name="gender"><option value="">All</option><option value="F">Female</option><option value="M">Male</option></select></div>
      <div class="field"><label>Citizenship</label><select class="input" name="cit"><option value="">Any</option>${ORIGIN.map(c => `<option value="${c}">${esc(cn(c))}</option>`).join('')}</select></div></div>
      <p class="invcount" id="ic"></p>
      <div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-gold" type="submit">Create and send invitations</button></div></form>`,
    onMount(w, close) {
      const f = $('#evf', w);
      const pick = () => { const v = Object.fromEntries(new FormData(f)); return db.players.filter(p => playerStatus(p) === 'active' && (!v.group || groupOf(p) === v.group) && (!v.gender || p.gender === v.gender) && (!v.cit || p.citizens.includes(v.cit))); };
      const upd = () => { $('#ic', w).innerHTML = `${icon.users} <b>${pick().length}</b> active players will be invited`; };
      upd(); f.addEventListener('input', upd);
      f.addEventListener('submit', e => {
        e.preventDefault(); clearErrors(f);
        const v = Object.fromEntries(new FormData(f));
        let bad = false;
        ['title', 'place', 'date'].forEach(k => { if (!v[k].trim()) { fieldError(f, k, 'Required'); bad = true; } });
        const list = pick();
        if (!list.length) { formError(f, 'No players match.'); return; }
        if (bad) return;
        const ev = { id: uid('e'), title: v.title.trim(), place: v.place.trim(), date: v.date, group: v.group, invited: list.map(p => p.id), answers: {}, createdAt: Date.now() };
        db.events.unshift(ev);
        list.forEach(p => { const o = userById(p.parentId || p.userId); if (o) sendMail(o.email, t('mEventSubj', { event: ev.title }, o.lang), wrapMail(o.lang, ev.title, `<p>${esc(t('mEventBody', { name: p.name, event: ev.title, place: ev.place, date: fmtD(ev.date, o.lang) }, o.lang))}</p>`), { quiet: true }); });
        save(); log('admin', actor, `Event created: ${ev.title} · ${list.length} invitations sent`);
        toast(`${list.length} invitations sent. See the demo inbox.`); close(); done();
      });
    }
  });
}

/* ---------------- Option B: announcements ---------------- */
function announce(adm) {
  adm.innerHTML = head('Announcements by email', 'Send news to a chosen group. Every family receives it in its own language, with the text you write for that language.', '', true) +
    `<div class="grid-2"><form class="card form" id="anf" novalidate><h3>New announcement</h3>
      <div class="grid2"><div class="field"><label>Birth-year group</label><select class="input" name="group"><option value="">All</option>${[...GROUPS, ADULT_GROUP].map(g => `<option>${g}</option>`).join('')}</select></div>
      <div class="field"><label>Country of residence</label><select class="input" name="res"><option value="">All</option>${['NO', 'DE', 'AT', 'CH', 'SE', 'DK', ...ORIGIN].map(c => `<option value="${c}">${esc(cn(c))}</option>`).join('')}</select></div></div>
      <div class="field"><label>Language version</label><select class="input" id="anl">${LANGS.map(l => `<option value="${l.code}">${l.name}</option>`).join('')}</select></div>
      <div class="field"><label>Subject</label><input class="input" id="ans"></div><div class="field"><label>Message</label><textarea class="input" id="anb" rows="5"></textarea></div>
      <p class="muted small" id="anv"></p><p class="invcount" id="anc"></p>
      <button class="btn btn-gold" type="submit">${icon.megaphone} Send announcement</button></form>
    <div class="card"><h3>Sent</h3><div class="list">${db.announcements.map(a => `<div class="lrow"><span class="lic ok">${icon.megaphone}</span><div class="lmain"><b>${esc(a.subject)}</b><small>${esc(a.filter)} · ${a.count ? `${a.count} recipients · ` : ''}${fmtDT(a.at, 'en')}</small></div></div>`).join('')}</div></div></div>`;
  const f = $('#anf', adm);
  const texts = {};
  let cur = 'bs';
  $('#anl', adm).value = cur;
  const keep = () => { texts[cur] = { s: $('#ans', adm).value, b: $('#anb', adm).value }; $('#anv', adm).textContent = `Written: ${Object.entries(texts).filter(([, v]) => v.s.trim()).map(([k]) => k.toUpperCase()).join(', ') || 'none'} · families with other languages get the English version (or the first one written).`; };
  $('#anl', adm).addEventListener('change', e => { keep(); cur = e.target.value; $('#ans', adm).value = texts[cur]?.s || ''; $('#anb', adm).value = texts[cur]?.b || ''; });
  const targets = () => { const v = Object.fromEntries(new FormData(f)); const ids = new Set(db.players.filter(p => p.status !== 'inactive' && (!v.group || groupOf(p) === v.group) && (!v.res || p.residence === v.res)).map(p => p.parentId || p.userId)); return db.users.filter(u => ids.has(u.id) && u.status !== 'inactive' && u.verified); };
  const upd = () => { keep(); $('#anc', adm).innerHTML = `${icon.users} <b>${targets().length}</b> accounts will receive it`; };
  upd(); f.addEventListener('input', upd);
  f.addEventListener('submit', e => {
    e.preventDefault(); keep();
    const written = Object.entries(texts).filter(([, v]) => v.s.trim() && v.b.trim());
    if (!written.length) { toast('Write a subject and a message.', 'bad'); return; }
    const fallback = texts.en?.s.trim() ? texts.en : written[0][1];
    const list = targets();
    list.forEach(u => { const x = texts[u.lang]?.s.trim() ? texts[u.lang] : fallback; sendMail(u.email, x.s, wrapMail(u.lang, x.s, `<p>${esc(x.b).replace(/\n/g, '<br>')}</p>`), { quiet: true, from: FROM.noreply }); });
    const v = Object.fromEntries(new FormData(f));
    db.announcements.unshift({ id: uid('a'), subject: fallback.s, filter: [v.group || 'all groups', v.res ? cn(v.res) : 'all countries'].join(' · '), count: list.length, at: Date.now() });
    save(); log('admin', actor, `Announcement sent to ${list.length} accounts: ${fallback.s}`);
    toast(`Sent to ${list.length} accounts. See the demo inbox.`); announce(adm);
  });
}

/* ---------------- Option B: visitors ---------------- */
function visitors(adm) {
  const days = [...Array(30)].map((_, i) => db.visits.days[new Date(Date.now() - (29 - i) * DAY).toISOString().slice(0, 10)] || 0);
  const tot = days.reduce((s, v) => s + v, 0);
  const pages = Object.entries(db.visits.pages).sort((a, b) => b[1] - a[1]);
  const f = db.visits.funnel;
  adm.innerHTML = head('Visitors', 'Self-hosted statistics. No cookies, no Google, no personal data: only page counts per day.', '', true) +
    `<div class="kpis"><div class="kpi card"><span>Visits, 30 days</span><b>${tot}</b><small>page views</small></div><div class="kpi card"><span>Today</span><b>${days[29]}</b><small>page views</small></div><div class="kpi card"><span>Started registration</span><b>${f.started}</b><small>forms opened</small></div><div class="kpi card"><span>Finished registration</span><b>${f.finished}</b><small>${Math.round((f.finished / Math.max(1, f.started)) * 100)}% completion</small></div></div>
    <div class="grid-2"><div class="card dark span2"><h3>Page views per day</h3>${line(days)}</div>
      <div class="card"><h3>Most visited pages</h3><table class="tbl"><tbody>${pages.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r"><b>${v}</b></td></tr>`).join('')}</tbody></table></div>
      <div class="card"><h3>How it works</h3><ul class="plain"><li>${icon.check} Counts are stored on your own server</li><li>${icon.check} No cookie banner needed for statistics</li><li>${icon.check} Nothing is shared with third parties</li><li>${icon.check} Children's data is never part of the statistics</li></ul></div></div>`;
}

/* ---------------- Option B: monthly report ---------------- */
async function monthlyReport() {
  const J = window.jspdf?.jsPDF;
  if (!J) return;
  const doc = new J({ unit: 'mm', format: 'a4' });
  const pl = db.players, month = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const since = Date.now() - 30 * DAY;
  doc.setFillColor(8, 23, 53); doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text('HandballBridge · Monthly report', 20, 24);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text(`${month} · aggregated numbers, no personal data`, 20, 32);
  let y = 56;
  const row = (k, v) => { doc.setTextColor(60, 70, 90); doc.text(k, 20, y); doc.setTextColor(8, 23, 53); doc.setFont('helvetica', 'bold'); doc.text(String(v), 190, y, { align: 'right' }); doc.setFont('helvetica', 'normal'); y += 8; };
  doc.setFontSize(11);
  row('Registered players (total)', pl.length);
  row('New players, last 30 days', pl.filter(p => p.createdAt > since).length);
  row('Registered parents (total)', db.users.filter(u => u.role === 'parent').length);
  row('Adult players with own account', db.users.filter(u => u.role === 'adult').length);
  row('Active profiles', pl.filter(p => playerStatus(p) === 'active').length);
  y += 4; doc.setFont('helvetica', 'bold'); doc.text('By birth-year group', 20, y); doc.setFont('helvetica', 'normal'); y += 8;
  GROUPS.forEach(g => row(g, pl.filter(p => groupOf(p) === g).length));
  y += 4; doc.setFont('helvetica', 'bold'); doc.text('Top countries of residence', 20, y); doc.setFont('helvetica', 'normal'); y += 8;
  const res = {}; pl.forEach(p => { res[p.residence] = (res[p.residence] || 0) + 1; });
  Object.entries(res).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([c, v]) => row(cn(c).normalize('NFD').replace(/[̀-ͯ]/g, ''), v));
  const url = doc.output('datauristring');
  download(`handballbridge-report-${new Date().toISOString().slice(0, 7)}.pdf`, url);
  sendMail(ADMIN_EMAIL, `Monthly report ${month}`, wrapMail('en', `Monthly report ${month}`, '<p>The monthly summary is attached. It contains aggregated numbers only.</p>'), { attachments: [{ name: `report-${new Date().toISOString().slice(0, 7)}.pdf`, url }] });
  log('admin', actor, `Monthly report generated and sent to ${ADMIN_EMAIL}`);
}

/* ---------------- slogan on the main image: text and position ---------------- */
const STAGES = { desktop: [1440, 900, 'Desktop'], tablet: [834, 1112, 'Tablet'], mobile: [390, 844, 'Phone'] };
function sloganEditor(box, l) {
  const cfg = sloganCfg();
  const st = sloganStyle();
  SLOGAN_FONTS.forEach(f => loadFont(f.id));   // so every option shows in its own font
  let mode = 'desktop';
  const lines = slogan(l);
  box.innerHTML = `<div class="row-between"><div><h3>Slogan on the main image</h3><p class="muted small">It stays on the same spot of the picture on every screen size. Drag it in the preview or use the sliders. The text is saved for the language selected above.</p></div>
      <span class="segs">${Object.entries(STAGES).map(([k, [, , n]]) => `<button type="button" class="seg ${k === mode ? 'on' : ''}" data-m="${k}">${n}</button>`).join('')}</span></div>
    <div class="slog-grid">
      <div class="sp-wrap" id="spWrap"><div class="sp-stage" id="spStage"><div class="sp-img" style="background-image:url('${heroImage()}')"></div><div class="sp-shade"></div>
        <div class="sp-title"><i></i><i></i><i></i></div>
        <div class="slogan sp-slogan" id="spSlogan"><div class="slogan-in">${lines.map(x => `<span>${esc(x)}</span>`).join('')}<svg class="swish" viewBox="0 0 520 72" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gSwishP" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#B97D19"/><stop offset="40%" stop-color="#FFF2A3"/><stop offset="70%" stop-color="#E9B63D"/><stop offset="100%" stop-color="#A36A12"/></linearGradient></defs><path d="M12 54 Q255 -10 508 43 Q255 5 12 54 Z" fill="url(#gSwishP)"/><path d="M44 61 Q259 16 478 44" fill="none" stroke="#FFE998" stroke-width="2.4" stroke-linecap="round"/></svg></div></div>
      </div></div>
      <form class="form" id="slogForm">
        ${[0, 1, 2].map(i => `<div class="field"><label for="sl${i}">Line ${i + 1}</label><input class="input sm" id="sl${i}" value="${esc(lines[i])}" placeholder="${esc(sloganBase(l)[i])}"></div>`).join('')}
        <div class="field"><label>Font</label><div class="fontpick" id="fontPick">${SLOGAN_FONTS.map(f => `<button type="button" class="fp ${f.id === st.font ? 'on' : ''}" data-f="${f.id}" style="font-family:${esc(f.css)};font-style:${f.italic ? 'italic' : 'normal'}"><b>${esc(lines[0] || 'Isti sport.')}</b><small>${esc(f.name)}${f.cy ? '' : ' · no Cyrillic'}</small></button>`).join('')}</div>
          <label class="check inline boldsw"><input type="checkbox" id="slBold" ${st.bold ? 'checked' : ''}><span><b>Bold</b> (e.g. Caveat Bold, Inter ExtraBold, Montserrat ExtraBold)</span></label></div>
        <div class="field"><label>Colour</label><div class="colpick">${SLOGAN_COLORS.map(([c, n]) => `<button type="button" class="cp ${c === st.color ? 'on' : ''}" data-c="${c}" title="${n}" style="--c:${c}"><i></i>${n}</button>`).join('')}</div></div>
        <div class="sliders">${[['x', 'Left / right'], ['y', 'Up / down'], ['w', 'Size'], ['rot', 'Rotation']].map(([k, n]) => `<label class="sl"><span>${n} <b id="v_${k}"></b></span><input type="range" id="r_${k}"></label>`).join('')}</div>
        <p class="muted small" id="spNote"></p>
        <div class="row-between"><button class="btn btn-ghost btn-sm" type="button" id="slogReset">Restore original</button><button class="btn btn-gold btn-sm" type="submit">Save slogan</button></div>
      </form></div>`;
  const wrap = $('#spWrap', box), stage = $('#spStage', box), el = $('#spSlogan', box);
  const RANGE = {
    desktop: { x: [0, .9, .002], y: [-.1, .8, .002], w: [.12, .6, .002] },
    tablet: { x: [0, .9, .002], y: [-.1, .8, .002], w: [.12, .6, .002] },
    mobile: { x: [-.2, .4, .005], y: [-80, 200, 1], w: [.4, 1, .005] }
  };
  const scale = () => { const [W, H] = STAGES[mode]; return Math.min(wrap.clientWidth / W, 460 / H); };
  const draw = () => {
    const [W, H] = STAGES[mode], sc = scale();
    Object.assign(stage.style, { width: W + 'px', height: H + 'px', transform: `scale(${sc})`, left: (wrap.clientWidth - W * sc) / 2 + 'px' });
    wrap.style.height = H * sc + 'px';
    stage.dataset.mode = mode;
    const c = cfg[mode];
    if (mode === 'mobile') {
      const inner = el.firstElementChild;
      Object.assign(el.style, { left: c.x * 100 + '%', top: 92 + c.y + 'px', width: c.w * 100 + '%' });
      inner.style.fontSize = Math.min(42, Math.max(25, .062 * W)) + 'px';
      inner.style.transform = `rotate(${c.rot}deg)`;
    } else layoutSlogan(stage, el, cfg, mode);
    ['x', 'y', 'w'].forEach(k => {
      const r = $('#r_' + k, box);
      [r.min, r.max, r.step] = RANGE[mode][k];
      r.value = c[k];
      $('#v_' + k, box).textContent = mode === 'mobile' && k === 'y' ? Math.round(c.y) + ' px' : Math.round(c[k] * 100) + '%';
    });
    const rr = $('#r_rot', box);
    rr.min = -25; rr.max = 10; rr.step = 1; rr.value = c.rot;
    $('#v_rot', box).textContent = c.rot + '°';
    $('#spNote', box).innerHTML = mode === 'mobile' ? `Phone layout belongs to Option B ${bTag()}. In Option A phones show the desktop page.` : mode === 'tablet' ? 'Used for screens from 651 to 1100 pixels wide.' : 'Used for screens wider than 1100 pixels.';
  };
  styleSlogan(el, st);
  draw();
  $$('[data-f]', box).forEach(b => b.addEventListener('click', () => { st.font = b.dataset.f; $$('[data-f]', box).forEach(x => x.classList.toggle('on', x === b)); styleSlogan(el, st); setTimeout(draw, 300); document.fonts?.ready.then(draw); }));
  const boldPreview = () => $$('.fp b', box).forEach(x => { const f = SLOGAN_FONTS.find(y => y.id === x.parentElement.dataset.f); x.style.fontWeight = st.bold ? String(f.bold || 700) : '400'; });
  boldPreview();
  $('#slBold', box).addEventListener('change', e => { st.bold = e.target.checked; boldPreview(); styleSlogan(el, st); setTimeout(draw, 200); });
  $$('.cp', box).forEach(b => b.addEventListener('click', () => { st.color = b.dataset.c; $$('.cp', box).forEach(x => x.classList.toggle('on', x === b)); styleSlogan(el, st); }));
  const ro = new ResizeObserver(draw);
  ro.observe(wrap);
  $$('[data-m]', box).forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; $$('[data-m]', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
  ['x', 'y', 'w', 'rot'].forEach(k => $('#r_' + k, box).addEventListener('input', e => { cfg[mode][k] = +e.target.value; draw(); }));
  [0, 1, 2].forEach(i => $('#sl' + i, box).addEventListener('input', e => { $$('.slogan-in span', el)[i].textContent = e.target.value || sloganBase(l)[i]; }));
  // drag the slogan in the preview
  let drag = null;
  el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const [W, H] = STAGES[mode], sc = scale();
    const dx = (e.clientX - drag.x) / sc, dy = (e.clientY - drag.y) / sc;
    drag = { x: e.clientX, y: e.clientY };
    const c = cfg[mode];
    if (mode === 'mobile') { c.x += dx / W; c.y += dy; } else {
      const s2 = Math.max(W / 1200, H / 697);
      c.x += dx / (1200 * s2); c.y += dy / (697 * s2);
    }
    draw();
  });
  el.addEventListener('pointerup', () => { drag = null; });
  $('#slogReset', box).addEventListener('click', () => {
    cfg[mode] = { ...SLOGAN_DEFAULT[mode] };
    st.font = 'original'; st.color = '#FFFFFF'; st.bold = false; $('#slBold', box).checked = false; boldPreview();
    $$('[data-f]', box).forEach(x => x.classList.toggle('on', x.dataset.f === 'original'));
    $$('.cp', box).forEach(x => x.classList.toggle('on', x.dataset.c === '#FFFFFF'));
    styleSlogan(el, st); draw();
  });
  $('#slogForm', box).addEventListener('submit', e => {
    e.preventDefault();
    const base = sloganBase(l);
    db.overrides[l] = db.overrides[l] || {};
    [0, 1, 2].forEach(i => {
      const v = $('#sl' + i, box).value.trim();
      if (v && v !== base[i]) db.overrides[l]['slogan.' + i] = v; else delete db.overrides[l]['slogan.' + i];
    });
    const round = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));
    db.content.sloganPos = { desktop: round(cfg.desktop), tablet: round(cfg.tablet), mobile: round(cfg.mobile) };
    db.content.sloganStyle = { font: st.font, color: st.color, bold: st.bold };
    save(); setOverrides(db.overrides);
    log('admin', actor, `Slogan saved (text ${l}, position for desktop, tablet and phone)`);
    toast('Slogan saved. It is live on the homepage.');
  });
}

/* ---------------- privacy information, terms and consent wording ---------------- */
const LEGAL = {
  privacy: ['Privacy information', 'Shown in registration step 3 and at hb-talents.com → Privacy information.'],
  terms: ['Terms and Conditions', 'Shown in registration step 3 and at hb-talents.com → Terms and Conditions.'],
  consent: ['Parent consent statement', 'Shown before a child is registered, printed in the consent PDF and sent by email. {RODITELJ} = parent name, {DIJETE} = child name.'],
  consentAdult: ['Adult player consent statement', 'Shown to players aged 18 or older and printed in their PDF. {DIJETE} = player name.']
};
function legal(adm) {
  let l = 'bs', kind = 'privacy';
  const draw = () => {
    const current = legalText(kind, l);
    const base = kind.startsWith('consent') ? consentText({ parent: '{RODITELJ}', player: '{DIJETE}', adult: kind === 'consentAdult' }, l) : '';
    adm.innerHTML = head('Privacy and legal texts', 'Edit the privacy statement, terms and consent wording for every language. Every acceptance is saved with the document version.') +
      `<div class="card"><div class="row-between"><div class="segs">${Object.entries(LEGAL).map(([k, [n]]) => `<button class="seg ${k === kind ? 'on' : ''}" data-k="${k}">${n}</button>`).join('')}</div>
        <label class="ff inline"><span>Language</span><select class="input sm" id="ll">${LANGS.map(x => `<option value="${x.code}" ${x.code === l ? 'selected' : ''}>${x.name}${legalText(kind, x.code) ? ' ✓' : ''}</option>`).join('')}</select></label></div>
        <p class="muted small" style="margin:12px 0">${esc(LEGAL[kind][1])}</p>
        <form id="lf" class="form"><textarea class="input" id="lt" rows="16" placeholder="${esc(kind.startsWith('consent') ? '' : 'Paste the approved text here. Empty lines start a new paragraph.')}">${esc(current ?? base)}</textarea>
        <div class="docver">${icon.file}<span>Current version: <b>${docVersion()}</b> · ${current ? 'Edited text' : kind.startsWith('consent') ? 'Original text from the current site' : 'Not written yet (a placeholder is shown)'}</span></div>
        <label class="check"><input type="checkbox" id="lnew"><span>This is a new version of the legal texts. New acceptances are saved with version <b>${new Date().toISOString().slice(0, 10)}</b>.</span></label>
        <div class="row-between"><button class="btn btn-ghost btn-sm" type="button" id="lpre">${icon.eye} Preview</button><span>${current ? '<button class="btn btn-ghost btn-sm" type="button" id="lrest">Restore original</button> ' : ''}<button class="btn btn-gold btn-sm" type="submit">Save text</button></span></div></form></div>
      <div class="card"><h3>Status per language</h3><table class="tbl"><thead><tr><th>Language</th>${Object.values(LEGAL).map(([n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody>${LANGS.map(x => `<tr><td>${x.name}</td>${Object.keys(LEGAL).map(k => `<td>${legalText(k, x.code) ? '<span class="chip ok">Written</span>' : k.startsWith('consent') ? '<span class="chip">Original</span>' : '<span class="chip warn">Missing</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    $$('[data-k]', adm).forEach(b => b.addEventListener('click', () => { kind = b.dataset.k; draw(); }));
    $('#ll', adm).addEventListener('change', e => { l = e.target.value; draw(); });
    $('#lpre', adm).addEventListener('click', () => {
      const txt = $('#lt', adm).value.trim();
      openModal({ title: LEGAL[kind][0], wide: true, sub: `${LANGS.find(x => x.code === l).name} · preview`, html: `<div class="legal">${txt.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>` });
    });
    $('#lrest', adm)?.addEventListener('click', () => { delete db.overrides[l]['legal.' + kind]; save(); setOverrides(db.overrides); log('admin', actor, `${LEGAL[kind][0]} (${l}) restored`); toast('Original restored.'); draw(); });
    $('#lf', adm).addEventListener('submit', e => {
      e.preventDefault();
      const txt = $('#lt', adm).value.trim();
      if (!txt) { toast('The text cannot be empty.', 'bad'); return; }
      if (kind === 'consent' && !txt.includes('{DIJETE}')) { toast('Keep {DIJETE} in the text, it becomes the child name.', 'bad'); return; }
      db.overrides[l] = db.overrides[l] || {};
      db.overrides[l]['legal.' + kind] = txt;
      if ($('#lnew', adm).checked) db.content.legalVersion = new Date().toISOString().slice(0, 10);
      save(); setOverrides(db.overrides);
      log('admin', actor, `${LEGAL[kind][0]} saved (${l}), version ${docVersion()}`);
      toast('Saved. The new text is live.');
      draw();
    });
  };
  draw();
}
