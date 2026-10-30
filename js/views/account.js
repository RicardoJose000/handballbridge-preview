import { db, day, save, uid, session, currentUser, playersOf, playerById, playerConsent, consentsOf, playerStatus, groupOf, birthYear, ageOn, eighteenth, deletePlayer, deleteAccount, exportFor, hashPassword, verifyPassword, log, DOC_VERSION, SEASON } from '../store.js';
import { t, lang, LANGS, country, consentText, confirmText, fmtD, fmtDT } from '../i18n.js';
import { ORIGIN } from '../site-data.js';
import { isB } from '../plan.js';
import { $, $$, esc, go, icon, field, selectField, pwField, bindPasswordUI, clearErrors, fieldError, formError, firstError, validEmail, pwStrongEnough, toast, openModal, confirmBox, download, note, flag, enter, bTag, setBusy } from '../ui.js';
import { sendMail, wrapMail } from '../mail.js';
import { consentPdf } from '../pdf.js';
import { countryOptions } from './auth.js';
import { footer, heroImage } from './home.js';

const FLAG = { BA: 'ba', HR: 'hr', RS: 'rs', ME: 'me', AL: 'al', XK: 'xk', MK: 'mk' };
const posName = i => t('pos' + i);
const ST_CHIP = { active: ['ok', 'stActive'], unverified: ['warn', 'stUnverified'], inactive: ['bad', 'stInactive'], noconsent: ['bad', 'stNoConsent'] };
const chip = p => { const [c, k] = ST_CHIP[playerStatus(p)]; return `<span class="chip ${c}">${esc(t(k))}</span>`; };
const cflags = list => list.map(c => FLAG[c] ? flag(FLAG[c], 'sm') : `<span class="cc">${c}</span>`).join('');

export function renderAccount(main, rest) {
  const me = currentUser();
  if (!me) { go('login'); return; }
  const adult = me.role === 'adult';
  const [section = adult ? 'player' : 'children', a, b] = rest;
  if (section === 'child' && a === 'new') return questionnaire(main, me, null);
  if (section === 'player' && a === 'new') return questionnaire(main, me, null);
  if (section === 'p' && a) {
    const p = playerById(a);
    if (!p || (p.parentId !== me.id && p.userId !== me.id)) { toast('No access.', 'bad'); go('account'); return; }
    return b === 'edit' ? questionnaire(main, me, p) : profileView(main, me, p);
  }

  const tabs = [
    [adult ? 'player' : 'children', adult ? t('tabMyProfile') : t('tabChildren'), icon.users],
    ['details', t('tabDetails'), icon.user],
    ['consents', t('tabConsents'), icon.file],
    ['privacy', t('tabPrivacy'), icon.shield],
    ...(isB() ? [['events', t('tabEvents'), icon.calendar, true], ['security', t('tabSecurity'), icon.lock, true]] : [])
  ];
  const cur = tabs.some(x => x[0] === section) ? section : tabs[0][0];
  main.innerHTML = `${band(me)}
  <section class="page app"><div class="shell app-grid">
    <nav class="side" aria-label="${esc(t('myAccount'))}">${tabs.map(([k, l, ic, x]) => `<a href="#/account/${k}" class="${k === cur ? 'on' : ''}">${ic}<span>${esc(l)}</span>${x ? bTag() : ''}</a>`).join('')}
      <button class="side-out" id="out">${icon.logout}<span>${esc(t('signOut'))}</span></button></nav>
    <div class="app-main" id="am"></div>
  </div></section>${footer()}`;
  $('#out', main).addEventListener('click', () => { session.clear(); toast(t('signOut')); go(''); });
  const am = $('#am', main);
  ({ children: childrenTab, player: childrenTab, details: detailsTab, consents: consentsTab, privacy: privacyTab, events: eventsTab, security: securityTab })[cur](am, me);
  enter(am, ':scope > *');
}

const band = me => `<section class="band"><div class="shell">
  <div class="eyebrow">${esc(t('myAccount'))} · ${esc(me.role === 'adult' ? t('regAdult') : t('regParent'))}</div>
  <h1>${esc(t('hello', { name: me.first }))}</h1><p>${esc(me.role === 'adult' ? t('portalSubAdult') : t('portalSub'))}</p></div></section>`;

/* ---------------- children / player ---------------- */
function childrenTab(am, me) {
  const adult = me.role === 'adult';
  const list = playersOf(me.id);
  const due = isB() ? list.filter(p => p.seasonCheck !== SEASON && p.status !== 'inactive') : [];
  am.innerHTML = `
    ${due.map(p => `<div class="season" data-id="${p.id}">${bTag()}<span>${esc(t('checkBanner', { name: p.name }))}</span><div><button class="btn btn-gold btn-sm" data-ok>${esc(t('checkOk'))}</button><a class="btn btn-ghost btn-sm" href="#/account/p/${p.id}/edit">${esc(t('checkUpdate'))}</a></div></div>`).join('')}
    <div class="head-row"><h2>${esc(adult ? t('tabMyProfile') : t('tabChildren'))}</h2>${!adult || !list.length ? `<a class="btn btn-gold" href="#/account/${adult ? 'player' : 'child'}/new">${icon.plus} ${esc(adult ? t('qTitleAdult') : list.length ? t('addAnother') : t('addChild'))}</a>` : ''}</div>
    ${list.length ? `<div class="kids">${list.map(p => kidCard(p)).join('')}</div>` : `<div class="empty-card">${icon.users}<h3>${esc(t('noChildren'))}</h3><p class="muted">${esc(t('noChildrenD'))}</p><a class="btn btn-gold" href="#/account/${adult ? 'player' : 'child'}/new">${esc(adult ? t('qTitleAdult') : t('addChild'))}</a></div>`}`;
  $$('.season [data-ok]', am).forEach(b => b.addEventListener('click', () => {
    const p = playerById(b.closest('.season').dataset.id);
    p.seasonCheck = SEASON; p.updatedAt = Date.now(); save();
    log('profile', `${me.first} ${me.last}`, `Season ${SEASON} check confirmed for ${p.id}`);
    toast(t('checkDone'));
    childrenTab(am, me);
  }));
  bindKidActions(am, me, () => childrenTab(am, me));
}

function kidCard(p) {
  const age = ageOn(p.birth);
  const soon = p.kind === 'minor' && age >= 17;
  return `<article class="kid" data-id="${p.id}">
    <div class="kid-top"><span class="avatar">${esc(p.name.split(' ').map(x => x[0]).join('').slice(0, 2))}</span>
      <div><h3>${esc(p.name)}</h3><p class="muted small">${esc(t('profileId'))} ${p.id} · ${esc(t('registered', { date: fmtD(p.createdAt) }))}</p></div>${chip(p)}</div>
    <dl class="facts">
      <div><dt>${esc(t('group'))}</dt><dd>${groupOf(p)}</dd></div>
      <div><dt>${esc(t('birthDate'))}</dt><dd>${fmtD(p.birth)}</dd></div>
      <div><dt>${esc(t('qClub'))}</dt><dd>${esc(p.club || '—')}</dd></div>
      <div><dt>${esc(t('qCitizens'))}</dt><dd class="flagsline">${cflags(p.citizens)}</dd></div>
    </dl>
    ${soon ? `<p class="adult-note">${icon.info}<span>${esc(t('turns18', { name: p.name.split(' ')[0], date: fmtD(eighteenth(p.birth)) }))}</span></p>` : ''}
    <div class="kid-actions">
      <a class="btn btn-ghost btn-sm" href="#/account/p/${p.id}">${icon.eye} ${esc(t('open'))}</a>
      <a class="btn btn-ghost btn-sm" href="#/account/p/${p.id}/edit">${icon.edit} ${esc(t('edit'))}</a>
      <button class="btn btn-ghost btn-sm" data-pdf>${icon.download} ${esc(t('downloadPdf'))}</button>
      <button class="btn btn-ghost btn-sm danger" data-del>${icon.trash} ${esc(t('del'))}</button>
    </div></article>`;
}
function bindKidActions(root, me, refresh) {
  $$('[data-pdf]', root).forEach(b => b.addEventListener('click', async () => {
    const p = playerById(b.closest('[data-id]').dataset.id);
    setBusy(b, true);
    download(`HandballBridge-${p.id}-consent.pdf`, await consentPdf(p, lang()));
    setBusy(b, false);
  }));
  $$('[data-del]', root).forEach(b => b.addEventListener('click', async () => {
    const p = playerById(b.closest('[data-id]').dataset.id);
    const ok = await confirmBox({ title: t('delTitle', { name: p.name }), text: esc(t('delText')), confirmLabel: t('deleteProfile'), danger: true, requireWord: t('delWord') });
    if (!ok) return;
    deletePlayer(p.id, `${me.first} ${me.last}`, 'by account owner');
    toast(t('deleted'));
    refresh();
  }));
}

/* ---------------- profile view ---------------- */
function profileView(main, me, p) {
  const c = playerConsent(p.id);
  const rows = [
    [t('qName'), p.name], [t('qGender'), p.gender === 'F' ? t('female') : t('male')], [t('birthDate'), fmtD(p.birth)], [t('group'), groupOf(p)],
    [t('qPlace'), p.place], [t('qBirthCountry'), country(p.birthCountry)], [t('residence'), country(p.residence)],
    [t('qCurrent'), p.citizens.map(x => country(x)).join(', ')], [t('qPotential'), p.potential.map(x => country(x)).join(', ') || '—'],
    [t('qBasis'), t({ mother: 'bMother', father: 'bFather', both: 'bBoth', na: 'bNA' }[p.basis] || 'bNA')],
    ...(p.kind === 'minor' ? [[t('qParent1'), p.parent1], [t('qPhone1'), p.phone1], [t('qEmail1'), p.email1], [t('qParent2'), p.parent2 || '—'], [t('qPhone2'), p.phone2 || '—'], [t('qEmail2'), p.email2 || '—']] : [[t('qPhone'), p.phone || '—']]),
    [t('qClub'), p.club], [t('qClubEmail'), p.clubEmail || '—'], [t('qHand'), p.hand === 'L' ? t('left') : t('right')], [t('qPositions'), p.positions.map(posName).join(', ')]
  ];
  main.innerHTML = `${band(me)}<section class="page"><div class="shell">
    <a class="link back" href="#/account">← ${esc(t('back'))}</a>
    <div class="profile card" data-id="${p.id}">
      <div class="kid-top"><span class="avatar lg">${esc(p.name.split(' ').map(x => x[0]).join('').slice(0, 2))}</span>
        <div><h2>${esc(p.name)}</h2><p class="muted">${esc(t('profileId'))} ${p.id} · ${groupOf(p)} · ${esc(t('registered', { date: fmtD(p.createdAt) }))}</p></div>${chip(p)}</div>
      ${p.kind === 'minor' && ageOn(p.birth) >= 17 ? `<p class="adult-note">${icon.info}<span>${esc(t('turns18', { name: p.name.split(' ')[0], date: fmtD(eighteenth(p.birth)) }))}</span></p>` : ''}
      <dl class="details">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || '—')}</dd></div>`).join('')}</dl>
      <div class="consent-line">${icon.shield}<span>${esc(t('ctPlayer'))}: <b>${esc(c?.status === 'given' ? t('cGiven') : t('cWithdrawn'))}</b> · ${c ? fmtDT(c.at) : ''} · ${esc(t('version'))} ${c?.version || DOC_VERSION}</span></div>
      <div class="kid-actions">
        <a class="btn btn-gold btn-sm" href="#/account/p/${p.id}/edit">${icon.edit} ${esc(t('edit'))}</a>
        <button class="btn btn-ghost btn-sm" data-pdf>${icon.download} ${esc(t('downloadPdf'))}</button>
        <button class="btn btn-ghost btn-sm danger" data-del>${icon.trash} ${esc(t('deleteProfile'))}</button>
      </div></div></div></section>${footer()}`;
  bindKidActions(main, me, () => go('account'));
  enter(main, '.profile, .back');
}

/* ---------------- questionnaire (fields of the current form) ---------------- */
const DKEY = 'hbb.draft';
function questionnaire(main, me, existing) {
  const adult = me.role === 'adult';
  if (adult && !existing && playersOf(me.id).length) { go('account'); return; }
  let draft = {};
  if (!existing) { try { draft = JSON.parse(localStorage.getItem(DKEY) || '{}')[me.id] || {}; } catch { /* ignore */ } }
  const x = existing || draft;
  let citizens = [...(x.citizens || [])];
  const val = (k, d = '') => x[k] ?? d;
  const opts = countryOptions();
  main.innerHTML = `${band(me)}<section class="page"><div class="shell narrow-l">
    <a class="link back" href="#/account">← ${esc(t('back'))}</a>
    <form class="card form q" id="qf" novalidate>
      <div class="step-kicker">${esc(t('qStage'))}</div>
      <h2>${esc(adult ? t('qTitleAdult') : t('qTitle'))}</h2><p class="muted">${esc(adult ? t('qSubAdult') : t('qSub'))}</p>
      ${existing ? '' : note(esc(t('qDraft')))}
      <div class="grid2">
        ${field('name', t('qName'), { value: val('name', adult ? `${me.first} ${me.last}` : '') })}
        ${selectField('gender', t('qGender'), [['F', t('female')], ['M', t('male')]], { value: val('gender') })}
        ${field('birth', t('birthDate'), { type: 'date', value: val('birth', adult ? me.birth : ''), attrs: 'min="2008-01-01" max="2013-12-31"' })}
        ${field('place', t('qPlace'), { value: val('place') })}
        ${selectField('birthCountry', t('qBirthCountry'), opts, { value: val('birthCountry') })}
        ${selectField('residence', t('residence'), opts, { value: val('residence', me.residence), required: false })}
      </div>
      <div class="hintbox"><b>${esc(t('qCitizens'))}:</b> ${esc(t('qCitHint'))}</div>
      <h3>${esc(t('qCurrent'))}</h3><p class="muted small">${esc(t('qCurrentHelp'))}</p>
      <div class="group citpick" data-field="citizens">
        <div class="field"><label for="cs">${esc(t('qFind'))}</label><input class="input" id="cs" type="search" autocomplete="off" placeholder="${esc(t('qFindPh'))}" role="combobox" aria-expanded="false" aria-controls="cr"></div>
        <ul class="cit-results" id="cr" role="listbox" hidden></ul>
        <p class="muted small">${esc(t('qSelected'))}</p><div class="cit-chips" id="cc" aria-live="polite"></div>
      </div>
      <h3>${esc(t('qPotential'))}</h3>
      <div class="pills">${ORIGIN.map(c => `<label class="pill"><input type="checkbox" name="potential" value="${c}" ${(x.potential || []).includes(c) ? 'checked' : ''}><span>${flag(FLAG[c], 'sm')}${esc(country(c))}</span></label>`).join('')}</div>
      <div class="grid2">
        ${selectField('basis', t('qBasis'), [['mother', t('bMother')], ['father', t('bFather')], ['both', t('bBoth')], ['na', t('bNA')]], { value: val('basis'), required: false })}
        ${adult ? field('phone', t('qPhone'), { type: 'tel', value: val('phone'), required: false }) : ''}
      </div>
      ${adult ? '' : `<div class="grid2">
        ${field('parent1', t('qParent1'), { value: val('parent1', `${me.first} ${me.last}`) })}
        ${field('phone1', t('qPhone1'), { type: 'tel', value: val('phone1') })}
        ${field('email1', t('qEmail1'), { type: 'email', value: val('email1', me.email) })}
        ${field('parent2', t('qParent2'), { value: val('parent2'), required: false })}
        ${field('phone2', t('qPhone2'), { type: 'tel', value: val('phone2'), required: false })}
        ${field('email2', t('qEmail2'), { type: 'email', value: val('email2'), required: false })}
      </div>`}
      <div class="grid2">
        ${field('club', t('qClub'), { value: val('club') })}
        ${field('clubEmail', t('qClubEmail'), { type: 'email', value: val('clubEmail'), required: false })}
        ${selectField('hand', t('qHand'), [['L', t('left')], ['R', t('right')]], { value: val('hand') })}
      </div>
      <h3>${esc(t('qPositions'))}</h3>
      <div class="group pills" data-field="positions">${[0, 1, 2, 3, 4, 5, 6].map(i => `<label class="pill"><input type="checkbox" name="positions" value="${i}" ${(x.positions || []).map(Number).includes(i) ? 'checked' : ''}><span>${esc(posName(i))}</span></label>`).join('')}</div>
      <label class="check"><input type="checkbox" name="legal" ${existing ? 'checked' : ''}><span>${esc(adult ? t('declSelf') : t('qLegal'))}</span></label>
      <button class="btn btn-gold btn-block" type="submit">${esc(existing ? t('save') : adult ? t('qSaveAdult') : t('qSave'))}</button>
    </form></div></section>${footer()}`;
  enter(main, '.q > *', { stagger: .02 });
  const f = $('#qf', main);
  const cs = $('#cs', f), cr = $('#cr', f), cc = $('#cc', f);

  const drawChips = () => {
    cc.innerHTML = citizens.length ? citizens.map(c => `<span class="cit">${FLAG[c] ? flag(FLAG[c], 'sm') : ''}${esc(country(c))}<button type="button" data-rm="${c}" aria-label="${esc(t('del'))}">×</button></span>`).join('') : `<span class="muted small">${esc(t('qNoneYet'))}</span>`;
  };
  const showMatches = () => {
    const q = cs.value.trim().toLocaleLowerCase();
    const list = (q ? opts.filter(([c, n]) => n.toLocaleLowerCase().includes(q) || c.toLowerCase() === q) : opts.filter(([c]) => ORIGIN.includes(c))).filter(([c]) => !citizens.includes(c)).slice(0, 8);
    cr.innerHTML = list.map(([c, n]) => `<li role="option"><button type="button" data-add="${c}">${FLAG[c] ? flag(FLAG[c], 'sm') : `<span class="cc">${c}</span>`}${esc(n)}</button></li>`).join('');
    cr.hidden = !list.length; cs.setAttribute('aria-expanded', String(!cr.hidden));
  };
  drawChips();
  cs.addEventListener('input', showMatches);
  cs.addEventListener('focus', showMatches);
  cs.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('[data-add]', cr)?.click(); } });
  cr.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (!b) return; citizens.push(b.dataset.add); cs.value = ''; cr.hidden = true; drawChips(); fieldError(f, 'citizens', ''); saveDraft(); cs.focus(); });
  cc.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { citizens = citizens.filter(c => c !== b.dataset.rm); drawChips(); saveDraft(); } });
  document.addEventListener('click', function off(e) { if (!f.isConnected) { document.removeEventListener('click', off); return; } if (!e.target.closest('.citpick')) cr.hidden = true; });

  const read = () => {
    const fd = new FormData(f);
    const o = Object.fromEntries(fd);
    o.potential = fd.getAll('potential'); o.positions = fd.getAll('positions').map(Number); o.citizens = [...citizens];
    Object.keys(o).forEach(k => { if (typeof o[k] === 'string') o[k] = o[k].trim(); });
    return o;
  };
  function saveDraft() {
    if (existing) return;
    try { const all = JSON.parse(localStorage.getItem(DKEY) || '{}'); const { legal, ...d } = read(); all[me.id] = d; localStorage.setItem(DKEY, JSON.stringify(all)); } catch { /* ignore */ }
  }
  f.addEventListener('input', saveDraft);

  f.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(f);
    const v = read();
    let bad = false;
    const req = k => { if (!v[k]) { fieldError(f, k, t('vRequired')); bad = true; } };
    ['name', 'gender', 'birth', 'place', 'birthCountry', 'club', 'hand'].forEach(req);
    if (!adult) { ['parent1', 'phone1'].forEach(req); if (!validEmail(v.email1)) { fieldError(f, 'email1', t('vEmail')); bad = true; } if (v.email2 && !validEmail(v.email2)) { fieldError(f, 'email2', t('vEmail')); bad = true; } }
    if (v.clubEmail && !validEmail(v.clubEmail)) { fieldError(f, 'clubEmail', t('vEmail')); bad = true; }
    if (v.birth) {
      const y = +v.birth.slice(0, 4), age = ageOn(v.birth);
      if (y < 2008 || y > 2013) { fieldError(f, 'birth', t('vGroup')); bad = true; }
      else if (!adult && age >= 18) { fieldError(f, 'birth', t('vMinor')); bad = true; }
      else if (adult && age < 18) { fieldError(f, 'birth', t('vAdultOnly')); bad = true; }
    }
    if (!citizens.length) { fieldError(f, 'citizens', t('vCitizen')); bad = true; }
    if (!v.positions.length) { fieldError(f, 'positions', t('vPosition')); bad = true; }
    if (!v.legal) { fieldError(f, 'legal', t('vConfirm')); bad = true; }
    if (!existing && db.players.some(p => p.parentId === me.id && p.name.toLocaleLowerCase() === v.name.toLocaleLowerCase() && p.birth === v.birth)) { formError(f, t('vDuplicate')); return; }
    if (bad) { formError(f, t('vFix')); firstError(f); return; }
    const data = {
      name: v.name, gender: v.gender, birth: v.birth, place: v.place, birthCountry: v.birthCountry, residence: v.residence || me.residence, citizens: v.citizens, potential: v.potential,
      basis: v.basis || 'na', parent1: v.parent1 || '', phone1: v.phone1 || '', email1: v.email1 || '', parent2: v.parent2 || '', phone2: v.phone2 || '', email2: v.email2 || '', phone: v.phone || '',
      club: v.club, clubEmail: v.clubEmail || '', hand: v.hand, positions: v.positions
    };
    if (existing) {
      const changed = Object.keys(data).filter(k => JSON.stringify(existing[k]) !== JSON.stringify(data[k]));
      Object.assign(existing, data, { updatedAt: Date.now() });
      if (isB()) existing.seasonCheck = SEASON;
      save();
      log('profile', `${me.first} ${me.last}`, `Edited ${existing.id}: ${changed.join(', ') || 'no changes'}`);
      toast(t('updated'));
      go('account/p/' + existing.id);
      return;
    }
    review(main, me, data);
  });
}

function review(main, me, data) {
  const adult = me.role === 'adult';
  const rows = [[t('qName'), data.name], [t('birthDate'), fmtD(data.birth)], [t('group'), groupOf(data)], [t('residence'), country(data.residence)], [t('qCurrent'), data.citizens.map(c => country(c)).join(', ')], [t('qClub'), data.club], [t('qPositions'), data.positions.map(posName).join(', ')]];
  main.innerHTML = `${band(me)}<section class="page"><div class="shell narrow-l"><div class="card form">
    <div class="step-kicker">${esc(t('qStage'))}</div><h2>${esc(t('reviewTitle'))}</h2><p class="muted">${esc(t('reviewSub'))}</p>
    <dl class="details compact">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <h3>${esc(t('consentFor'))}</h3>
    <div class="consent-text">${consentText({ parent: `${me.first} ${me.last}`, player: data.name, adult }).split('\n\n').map(s => `<p>${esc(s)}</p>`).join('')}<small>${esc(t('version'))} ${DOC_VERSION}</small></div>
    <form id="rf" novalidate><label class="check big"><input type="checkbox" name="ok"><span>${esc(t('iConsent'))}</span></label>
    <div class="row-between"><button class="btn btn-ghost" type="button" id="backq">← ${esc(t('edit'))}</button><button class="btn btn-gold" type="submit">${esc(t('confirmRegister'))}</button></div></form>
  </div></div></section>${footer()}`;
  enter(main, '.card > *', { stagger: .03 });
  $('#backq', main).addEventListener('click', () => questionnaire(main, me, null));
  const f = $('#rf', main);
  f.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(f);
    if (!f.ok.checked) { fieldError(f, 'ok', t('vConfirm')); return; }
    const btn = $('[type=submit]', f); setBusy(btn, true);
    // section 5.3: verified account, link parent and child, save, consent, confirmation, email
    if (!me.verified) { formError(f, t('stUnverified')); setBusy(btn, false); return; }
    const p = { id: 'P' + String(1000 + db.players.length + 1 + Math.floor(Math.random() * 90)), kind: adult ? 'adult' : 'minor', parentId: adult ? null : me.id, userId: adult ? me.id : null, ...data, status: 'active', createdAt: Date.now(), updatedAt: Date.now(), seasonCheck: SEASON };
    while (db.players.some(x => x.id === p.id)) p.id = 'P' + Math.floor(1000 + Math.random() * 9000);
    db.players.push(p);
    db.consents.push({ id: uid('k'), userId: me.id, playerId: p.id, type: 'player', version: DOC_VERSION, lang: lang(), at: Date.now(), status: 'given' });
    db.visits.funnel.finished++;
    save();
    try { const all = JSON.parse(localStorage.getItem(DKEY) || '{}'); delete all[me.id]; localStorage.setItem(DKEY, JSON.stringify(all)); } catch { /* ignore */ }
    log('player', `${me.first} ${me.last}`, `Registered ${adult ? 'adult' : 'minor'} player ${p.id} (${groupOf(p)})`);
    log('consent', `${me.first} ${me.last}`, `Player consent given for ${p.id} (version ${DOC_VERSION})`);
    const l = me.lang || lang();
    const pdf = await consentPdf(p, l);
    sendMail(me.email, t('mRegSubj', { name: p.name }, l), wrapMail(l, t('mRegTitle', null, l), `<p>${esc(confirmText(p.name, l))}</p>
      <table class="mtable"><tr><td>${esc(t('profileId', null, l))}</td><td><b>${p.id}</b></td></tr><tr><td>${esc(t('group', null, l))}</td><td><b>${groupOf(p)}</b></td></tr></table>
      <p>${esc(t('mRegHow', null, l))}</p><p class="small">${esc(t('mRegAttach', null, l))}</p>`), { attachments: [{ name: `HandballBridge-${p.id}-consent.pdf`, url: pdf }] });
    done(main, me, p);
  });
}

function done(main, me, p) {
  const adult = me.role === 'adult';
  history.replaceState(null, '', '#/account/p/' + p.id);
  main.innerHTML = `${band(me)}<section class="page"><div class="shell narrow-l"><div class="card success">
    <div class="tick">${icon.check}</div><h2>${esc(t('regDone', { name: p.name }))}</h2><p class="muted">${esc(t('regDoneSub', { email: me.email }))}</p>
    <dl class="details compact"><div><dt>${esc(t('profileId'))}</dt><dd>${p.id}</dd></div><div><dt>${esc(t('group'))}</dt><dd>${groupOf(p)}</dd></div></dl>
    <div class="row-center"><a class="btn btn-ghost" href="#/account">${esc(t('myAccount'))}</a>${adult ? '' : `<a class="btn btn-gold" href="#/account/child/new">${icon.plus} ${esc(t('addAnother'))}</a>`}</div>
  </div></div></section>${footer()}`;
  if (window.gsap) gsap.from('.success > *', { y: 20, opacity: 0, stagger: .07, duration: .8, ease: 'expo.out' });
}

/* ---------------- my details ---------------- */
function detailsTab(am, me) {
  am.innerHTML = `<h2>${esc(t('tabDetails'))}</h2>
    <form class="card form" id="pf" novalidate>
      <div class="grid2">${field('first', t('firstName'), { value: me.first })}${field('last', t('lastName'), { value: me.last })}</div>
      <div class="grid2">${field('birth', t('birthDate'), { type: 'date', value: me.birth })}${selectField('residence', t('residence'), countryOptions(), { value: me.residence })}</div>
      <div class="grid2"><div class="field"><label>${esc(t('email'))}</label><input class="input" value="${esc(me.email)}" disabled><div class="hint-s">${esc(t('emailFixed'))}</div></div>
      ${selectField('lang', 'Language / Jezik', LANGS.map(l => [l.code, l.name]), { value: me.lang, placeholder: false })}</div>
      <button class="btn btn-gold" type="submit">${esc(t('save'))}</button>
    </form>
    <h2>${esc(t('changePw'))}</h2>
    <form class="card form" id="wf" novalidate>
      ${pwField('current', t('currentPw'), 'current-password')}
      <div class="grid2">${pwField('password', t('newPassword'), 'new-password', true)}${pwField('password2', t('passwordRepeat'), 'new-password')}</div>
      <button class="btn btn-ghost" type="submit">${esc(t('changePw'))}</button>
    </form>`;
  const pf = $('#pf', am);
  pf.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(pf);
    const v = Object.fromEntries(new FormData(pf));
    let bad = false;
    ['first', 'last', 'birth', 'residence'].forEach(k => { if (!String(v[k]).trim()) { fieldError(pf, k, t('vRequired')); bad = true; } });
    if (bad) return;
    Object.assign(me, { first: v.first.trim(), last: v.last.trim(), birth: v.birth, residence: v.residence, lang: v.lang });
    save();
    log('profile', `${me.first} ${me.last}`, 'Account details edited');
    toast(t('saved'));
  });
  const wf = $('#wf', am);
  bindPasswordUI(wf);
  wf.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(wf);
    const v = Object.fromEntries(new FormData(wf));
    if (!await verifyPassword(v.current, me.pw)) { fieldError(wf, 'current', t('pwWrongCurrent')); return; }
    if (!pwStrongEnough(v.password)) { fieldError(wf, 'password', t('vPwWeak')); return; }
    if (v.password !== v.password2) { fieldError(wf, 'password2', t('vPwMatch')); return; }
    me.pw = await hashPassword(v.password); save();
    log('profile', `${me.first} ${me.last}`, 'Password changed');
    sendMail(me.email, t('mPwSubj', null, me.lang), wrapMail(me.lang, t('mPwSubj', null, me.lang), `<p>${esc(t('mPwBody', null, me.lang))}</p>`), { quiet: true });
    wf.reset(); toast(t('pwChanged'));
  });
}

/* ---------------- consents ---------------- */
const CT = { guardian: 'ctGuardian', self: 'ctSelf', terms: 'ctTerms', privacy: 'ctPrivacy', federation: 'ctFed', player: 'ctPlayer' };
function consentsTab(am, me) {
  const list = consentsOf({ userId: me.id }).filter(c => !c.deletedAt);
  // only the newest record of each consent can be changed; older ones stay as history
  const latest = new Set();
  const seen = new Set();
  list.forEach(c => { const k = c.type + (c.playerId || ''); if (!seen.has(k)) { seen.add(k); latest.add(c.id); } });
  const hasFed = list.some(c => c.type === 'federation' && c.status === 'given');
  am.innerHTML = `<h2>${esc(t('consentHistory'))}</h2><p class="muted">${esc(t('consentHistoryD'))}</p>
    <div class="card list">${list.map(c => {
      const p = c.playerId && playerById(c.playerId);
      const can = (c.type === 'federation' || c.type === 'player') && latest.has(c.id);
      return `<div class="lrow"><span class="lic ${c.status === 'given' ? 'ok' : 'bad'}">${c.status === 'given' ? icon.check : icon.close}</span>
        <div class="lmain"><b>${esc(t(CT[c.type]))}${p ? ` · ${esc(p.name)}` : ''}</b><small>${esc(c.status === 'given' ? t('cGiven') : t('cWithdrawn'))} · ${fmtDT(c.withdrawnAt || c.at)} · ${esc(t('version'))} ${c.version} · ${esc(c.lang.toUpperCase())}</small></div>
        ${can ? `<button class="btn btn-ghost btn-sm" data-c="${c.id}">${esc(c.status === 'given' ? t('withdraw') : t('giveAgain'))}</button>` : ''}</div>`;
    }).join('')}
    ${hasFed ? '' : `<div class="lrow"><span class="lic">${icon.plus}</span><div class="lmain"><b>${esc(t('ctFed'))}</b><small>${esc(t('declFed'))}</small></div><button class="btn btn-ghost btn-sm" id="fedOn">${esc(t('giveAgain'))}</button></div>`}</div>`;
  $$('[data-c]', am).forEach(b => b.addEventListener('click', async () => {
    const c = db.consents.find(x => x.id === b.dataset.c);
    if (c.status === 'given') {
      if (!await confirmBox({ title: t('withdrawQ'), text: esc(t('withdrawD')), confirmLabel: t('withdraw'), danger: true })) return;
      c.status = 'withdrawn'; c.withdrawnAt = Date.now();
    } else {
      db.consents.push({ ...c, id: uid('k'), status: 'given', at: Date.now(), withdrawnAt: null, version: DOC_VERSION, lang: lang() });
    }
    save();
    log('consent', `${me.first} ${me.last}`, `${t(CT[c.type], null, 'en')} ${c.status === 'withdrawn' ? 'withdrawn' : 'given again'}${c.playerId ? ` for ${c.playerId}` : ''}`);
    toast(t('saved'));
    consentsTab(am, me);
  }));
  $('#fedOn', am)?.addEventListener('click', () => {
    db.consents.push({ id: uid('k'), userId: me.id, playerId: null, type: 'federation', version: DOC_VERSION, lang: lang(), at: Date.now(), status: 'given' });
    save(); log('consent', `${me.first} ${me.last}`, 'Federation sharing consent given'); toast(t('saved')); consentsTab(am, me);
  });
}

/* ---------------- privacy ---------------- */
function privacyTab(am, me) {
  am.innerHTML = `<h2>${esc(t('tabPrivacy'))}</h2>
    <div class="gdpr">
      <div class="card gcard"><span class="gic">${icon.download}</span><h3>${esc(t('dlData'))}</h3><p class="muted">${esc(t('dlDataD'))}</p><button class="btn btn-gold btn-sm" id="exp">${esc(t('dlData'))}</button></div>
      <div class="card gcard"><span class="gic">${icon.edit}</span><h3>${esc(t('reqCorrection'))}</h3><p class="muted">${esc(t('reqCorrectionD'))}</p><button class="btn btn-ghost btn-sm" id="cor">${esc(t('reqCorrection'))}</button></div>
      <div class="card gcard danger"><span class="gic">${icon.trash}</span><h3>${esc(t('delAccount'))}</h3><p class="muted">${esc(t('delAccountD'))}</p><button class="btn btn-danger btn-sm" id="dela">${esc(t('delAccount'))}</button></div>
    </div>`;
  $('#exp', am).addEventListener('click', () => {
    download(`HandballBridge-my-data-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(exportFor(me.id), null, 2), 'application/json');
    log('access', `${me.first} ${me.last}`, 'Downloaded own data (data export)');
  });
  $('#cor', am).addEventListener('click', () => openModal({
    title: t('reqCorrection'), html: `<form id="cq" novalidate><div class="field"><label for="ct">${esc(t('whatWrong'))}</label><textarea class="input" id="ct" name="text" rows="4"></textarea></div><div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>${esc(t('cancel'))}</button><button class="btn btn-gold" type="submit">${esc(t('send'))}</button></div></form>`,
    onMount(w, close) {
      $('#cq', w).addEventListener('submit', e => {
        e.preventDefault();
        const text = $('#ct', w).value.trim();
        if (!text) { fieldError($('#cq', w), 'text', t('vRequired')); return; }
        db.requests.unshift({ id: uid('r'), userId: me.id, type: 'correction', text, at: Date.now(), status: 'open' });
        save(); log('profile', `${me.first} ${me.last}`, 'Correction request sent'); close(); toast(t('reqSent'));
      });
    }
  }));
  $('#dela', am).addEventListener('click', async () => {
    const ok = await confirmBox({ title: t('delAccount') + '?', text: esc(t('delAccountD')) + '<br><br>' + esc(t('delText')), confirmLabel: t('delAccount'), danger: true, requireWord: t('delWord') });
    if (!ok) return;
    deleteAccount(me.id, `${me.first} ${me.last}`);
    session.clear();
    toast(t('accDeleted'));
    go('');
  });
}

/* ---------------- Option B: events ---------------- */
function eventsTab(am, me) {
  const mine = playersOf(me.id).map(p => p.id);
  const inv = db.events.flatMap(ev => ev.invited.filter(id => mine.includes(id)).map(id => ({ ev, p: playerById(id) })));
  am.innerHTML = `<h2>${esc(t('tabEvents'))} ${bTag()}</h2>
    ${inv.length ? `<div class="events">${inv.map(({ ev, p }) => {
      const a = ev.answers[p.id];
      return `<article class="card event" data-e="${ev.id}" data-p="${p.id}"><div class="ev-date"><b>${day(ev.date).getDate()}</b><span>${day(ev.date).toLocaleDateString(lang() === 'en' ? 'en-GB' : 'bs', { month: 'short' })}</span></div>
        <div class="ev-main"><small>${esc(t('evFor', { name: p.name }))}</small><h3>${esc(ev.title)}</h3><p class="muted">${icon.globe} ${esc(ev.place)} · ${fmtD(ev.date)} · ${ev.group}</p></div>
        <div class="ev-act">${a ? `<span class="chip ${a === 'yes' ? 'ok' : 'bad'}">${esc(a === 'yes' ? t('evAccepted') : t('evDeclined'))}</span>` : `<button class="btn btn-gold btn-sm" data-a="yes">${esc(t('evAccept'))}</button><button class="btn btn-ghost btn-sm" data-a="no">${esc(t('evDecline'))}</button>`}</div></article>`;
    }).join('')}</div>` : `<div class="empty-card">${icon.calendar}<h3>${esc(t('evNone'))}</h3></div>`}`;
  $$('[data-a]', am).forEach(b => b.addEventListener('click', () => {
    const card = b.closest('.event');
    const ev = db.events.find(x => x.id === card.dataset.e);
    ev.answers[card.dataset.p] = b.dataset.a; save();
    log('profile', `${me.first} ${me.last}`, `Answered "${b.dataset.a}" to ${ev.title} for ${card.dataset.p}`);
    toast(t('evAnswered')); eventsTab(am, me);
  }));
}

/* ---------------- Option B: security ---------------- */
function securityTab(am, me) {
  am.innerHTML = `<h2>${esc(t('tabSecurity'))} ${bTag()}</h2>
    <div class="card sec-row"><div><h3>${esc(t('sec2fa'))}</h3><p class="muted">${esc(t('sec2faD'))}</p></div>
      <button class="switch ${me.twofa ? 'on' : ''}" id="tfa" role="switch" aria-checked="${!!me.twofa}"><i></i><span>${esc(me.twofa ? t('secOn') : t('secOff'))}</span></button></div>
    <div class="card"><h3>${esc(t('secDevices'))}</h3><p class="muted">${esc(t('secDevicesD'))}</p>
      <ul class="devices">${(me.devices || []).map((d, i) => `<li>${icon.lock}<span><b>${esc(d.name)}</b>${i === 0 ? ` · ${esc(t('thisDevice'))}` : ''}</span><time>${fmtDT(d.at)}</time></li>`).join('')}</ul></div>`;
  $('#tfa', am).addEventListener('click', () => {
    me.twofa = !me.twofa; save();
    log('profile', `${me.first} ${me.last}`, `Two-step sign-in ${me.twofa ? 'enabled' : 'disabled'}`);
    toast(t('saved')); securityTab(am, me);
  });
}
