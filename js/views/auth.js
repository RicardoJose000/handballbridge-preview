import { db, day, save, uid, norm, session, currentUser, userById, userByEmail, userByLogin, hashPassword, verifyPassword, issueCode, checkCode, resendWait, lockedFor, loginFailed, loginOk, log, ageOn, docVersion, DEMO_PARENT, DEMO_ADULT } from '../store.js';
import { t, site, lang, country, legalText, fmtDT } from '../i18n.js';
import { COUNTRIES } from '../site-data.js';
import { isB } from '../plan.js';
import { $, $$, esc, go, icon, field, selectField, pwField, bindPasswordUI, bindCodeInputs, codeInputsHTML, clearErrors, fieldError, formError, firstError, validEmail, pwStrongEnough, setBusy, toast, openModal, steps, note, enter, bTag } from '../ui.js';
import { sendMail, wrapMail, codeMail, openInbox, latestFor } from '../mail.js';
import { heroImage } from './home.js';

const stepLabels = () => [t('stepAccount'), t('stepEmail'), t('stepDecl'), t('stepReady')];
export const countryOptions = () => {
  const c = new Intl.Collator(lang() === 'cnr' ? 'sr-Latn' : lang());
  return COUNTRIES.map(code => [code, country(code)]).sort((a, b) => c.compare(a[1], b[1]));
};
export function deviceName() {
  const ua = navigator.userAgent;
  const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const o = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : 'Linux';
  return `${b} · ${o}`;
}

function shell(main, inner, { kicker = '', step = -1 } = {}) {
  main.innerHTML = `<section class="auth">
    <div class="auth-art"><div class="auth-art-in">
      <span class="brand"><span class="word">Handball<b>Bridge</b></span></span>
      <p class="auth-quote">${esc(site('heroA'))} <b>${esc(site('heroB'))}</b></p>
      <ul class="trust"><li>${icon.lock}<span>${esc(t('footerRights'))}</span></li><li>${icon.mail}<span>noreply@hb-talents.com</span></li></ul>
    </div></div>
    <div class="auth-main"><div class="auth-card" id="ac">
      ${step >= 0 ? steps(stepLabels(), step) : ''}
      ${kicker ? `<div class="step-kicker">${esc(kicker)}</div>` : ''}
      ${inner}
    </div></div></section>`;
  enter(main, '#ac > *', { stagger: .04 });
  return $('#ac', main);
}

/* ---------------- register ---------------- */
export function renderRegister(main, [kind]) {
  if (currentUser()) { go('account'); return; }
  if (kind !== 'parent' && kind !== 'adult') {
    shell(main, `<h1>${esc(t('regTitle'))}</h1><p class="muted">${esc(t('regSub'))}</p>
      <div class="choice stack">
        <a class="choice-card" href="#/register/parent"><span class="ic">${icon.users}</span><b>${esc(t('regParent'))}</b><span>${esc(t('regParentD'))}</span><em>→</em></a>
        <a class="choice-card" href="#/register/adult"><span class="ic">${icon.user}</span><b>${esc(t('regAdult'))}</b><span>${esc(t('regAdultD'))}</span><em>→</em></a>
      </div><p class="center"><a class="link" href="#/login">${esc(t('haveAccount'))}</a></p>`);
    return;
  }
  const adult = kind === 'adult';
  db.visits.funnel.started++; save();
  const box = shell(main, `<h1>${esc(adult ? t('adultTitle') : t('parentsTitle'))}</h1><p class="muted">${esc(adult ? t('adultSub') : t('parentsSub'))}</p>
    <form class="form" id="rf" novalidate>
      <div class="grid2">${field('first', t('firstName'), { attrs: 'autocomplete="given-name"' })}${field('last', t('lastName'), { attrs: 'autocomplete="family-name"' })}</div>
      <div class="grid2">${field('birth', t('birthDate'), { type: 'date', attrs: `max="${new Date().toISOString().slice(0, 10)}"` })}${selectField('residence', t('residence'), countryOptions())}</div>
      ${field('email', t('email'), { type: 'email', attrs: 'autocomplete="email"' })}
      ${field('username', t('username'), { attrs: 'autocomplete="username"', hint: t('vUserFormat') })}
      <div class="grid2">${pwField('password', t('password'), 'new-password', true)}${pwField('password2', t('passwordRepeat'), 'new-password')}</div>
      <label class="check"><input type="checkbox" name="truth"><span>${esc(t('truthCheck'))}</span></label>
      ${note(esc(t('inboxNote')))}
      <button class="btn btn-gold btn-block" type="submit">${esc(t('toVerify'))}</button>
      <p class="center"><a class="link" href="#/login">${esc(t('haveAccount'))}</a></p>
    </form>`, { kicker: adult ? t('stage1Adult') : t('stage1'), step: 0 });
  const f = $('#rf', box);
  bindPasswordUI(f);
  f.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(f);
    const v = Object.fromEntries(new FormData(f));
    let bad = false;
    const req = k => { if (!String(v[k] || '').trim()) { fieldError(f, k, t('vRequired')); bad = true; return false; } return true; };
    ['first', 'last', 'residence'].forEach(req);
    if (req('birth')) {
      const d = day(v.birth);
      if (isNaN(d) || d > new Date()) { fieldError(f, 'birth', t('vDate')); bad = true; }
      else if (ageOn(v.birth) < 18) { fieldError(f, 'birth', t('vAdultOnly')); bad = true; }
      else if (adult && (d.getFullYear() < 2008 || d.getFullYear() > 2013)) { fieldError(f, 'birth', t('vGroup')); bad = true; }
    }
    if (!validEmail(v.email)) { fieldError(f, 'email', t('vEmail')); bad = true; }
    else if (userByEmail(v.email)) { fieldError(f, 'email', t('vEmailTaken')); bad = true; }
    const un = norm(v.username);
    if (!/^[a-z0-9._-]{3,30}$/.test(un)) { fieldError(f, 'username', t('vUserFormat')); bad = true; }
    else if (db.users.some(u => u.username === un)) { fieldError(f, 'username', t('vUserTaken')); bad = true; }
    if (!pwStrongEnough(v.password || '')) { fieldError(f, 'password', t('vPwWeak')); bad = true; }
    else if (v.password !== v.password2) { fieldError(f, 'password2', t('vPwMatch')); bad = true; }
    if (!v.truth) { fieldError(f, 'truth', t('vConfirm')); bad = true; }
    if (bad) { formError(f, t('vFix')); firstError(f); return; }
    const btn = $('[type=submit]', f); setBusy(btn, true);
    const u = {
      id: uid('u'), role: adult ? 'adult' : 'parent', first: v.first.trim(), last: v.last.trim(), birth: v.birth, email: norm(v.email), username: un,
      residence: v.residence, lang: lang(), pw: await hashPassword(v.password), verified: false, status: 'active', createdAt: Date.now(), twofa: false, devices: [{ name: deviceName(), at: Date.now() }]
    };
    db.users.push(u); save();
    log('account', `${u.first} ${u.last}`, `${adult ? 'Adult player' : 'Parent'} account created (${u.id})`);
    codeMail(u, await issueCode(u.id, 'verify'));
    session.set({ userId: u.id, stage: 'verify' });
    setBusy(btn, false);
    go('verify');
  });
}

/* ---------------- email verification ---------------- */
export function renderVerify(main) {
  const s = session.get();
  const u = s?.userId && userById(s.userId);
  if (!u) { go('register'); return; }
  if (u.verified) { go(s.auth ? 'account' : 'declarations'); return; }
  const box = shell(main, `<h1>${esc(t('verifyTitle'))}</h1><p class="muted">${esc(t('verifySub', { email: u.email }))}</p>
    <form class="form" id="vf" novalidate>
      ${codeInputsHTML()}
      <button class="btn btn-gold btn-block" type="submit">${esc(t('verifyBtn'))}</button>
      <div class="row-between"><button class="btn btn-ghost btn-sm" type="button" id="resend"></button><button class="btn btn-ghost btn-sm" type="button" id="oi">${icon.mail} ${esc(t('openInbox'))}</button></div>
      ${note(esc(t('inboxNote')))}
    </form>`, { kicker: t('stage2'), step: 1 });
  const f = $('#vf', box);
  const code = bindCodeInputs($('.code-inputs', f), () => f.requestSubmit());
  setTimeout(() => $('input', f)?.focus(), 250);
  $('#oi', box).addEventListener('click', () => openInbox(latestFor(u.email)?.id));
  const rb = $('#resend', box);
  const tick = () => {
    const w = resendWait(u.id, 'verify');
    rb.disabled = w !== 0;
    rb.textContent = w === -1 ? t('resendLimit') : w > 0 ? t('resendWait', { s: w }) : t('resend');
  };
  tick();
  const timer = setInterval(tick, 1000);
  rb.addEventListener('click', async () => {
    if (resendWait(u.id, 'verify') !== 0) return;
    codeMail(u, await issueCode(u.id, 'verify'));
    toast(t('codeSent')); tick(); code.clear();
  });
  f.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(f);
    if (code.value().length < 6) { formError(f, t('codeDigits')); return; }
    const r = await checkCode(u.id, 'verify', code.value());
    if (!r.ok) { formError(f, t(r.key, { n: r.n })); code.shake(); code.clear(); return; }
    u.verified = true; save();
    log('verify', `${u.first} ${u.last}`, `Email verified for ${u.email}`);
    session.set({ userId: u.id, stage: 'decl' });
    toast(t('emailVerified'));
    go('declarations');
  });
  return () => clearInterval(timer);
}

/* ---------------- declarations ---------------- */
export const legalHTML = kind => {
  const own = legalText(kind);
  return own ? own.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('') : `<p>${esc(t('legalPlaceholder'))}</p>`;
};
function legalModal(kind) {
  openModal({ title: t(kind), sub: `${t('version')} ${docVersion()}`, html: `<div class="legal">${legalHTML(kind)}</div><div class="modal-foot"><button class="btn btn-primary" data-close>${esc(t('close'))}</button></div>` });
}
export function renderDeclarations(main) {
  const s = session.get();
  const u = s?.userId && userById(s.userId);
  if (!u) { go('register'); return; }
  if (!u.verified) { go('verify'); return; }
  const adult = u.role === 'adult';
  const box = shell(main, `<h1>${esc(t('declTitle'))}</h1><p class="muted">${esc(t('declSub'))}</p>
    <form class="form" id="df" novalidate>
      <label class="check big"><input type="checkbox" name="main"><span>${esc(adult ? t('declSelf') : t('declGuardian'))}</span></label>
      <label class="check big"><input type="checkbox" name="terms"><span>${esc(t('declTerms'))} <button type="button" class="link" data-legal="terms">${esc(t('read'))}</button></span></label>
      <label class="check big"><input type="checkbox" name="privacy"><span>${esc(t('declPrivacy'))} <button type="button" class="link" data-legal="privacy">${esc(t('read'))}</button></span></label>
      <label class="check big sep"><input type="checkbox" name="federation"><span>${esc(t('declFed'))}</span></label>
      <div class="docver">${icon.file}<span>${esc(t('version'))} ${docVersion()} · ${esc(u.email)}</span></div>
      <button class="btn btn-gold btn-block" type="submit">${esc(t('activate'))}</button>
    </form>`, { kicker: t('stage3'), step: 2 });
  const f = $('#df', box);
  $$('[data-legal]', f).forEach(b => b.addEventListener('click', e => { e.preventDefault(); legalModal(b.dataset.legal); }));
  f.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(f);
    const v = Object.fromEntries(new FormData(f));
    let bad = false;
    ['main', 'terms', 'privacy'].forEach(k => { if (!v[k]) { fieldError(f, k, t('vConfirm')); bad = true; } });
    if (bad) return;
    const at = Date.now();
    const add = type => db.consents.push({ id: uid('k'), userId: u.id, playerId: null, type, version: docVersion(), lang: lang(), at, status: 'given' });
    add(adult ? 'self' : 'guardian'); add('terms'); add('privacy');
    if (v.federation) add('federation');
    save();
    log('consent', `${u.first} ${u.last}`, `Declarations accepted (version ${docVersion()}${v.federation ? ', incl. federation sharing' : ''})`);
    // the declaration is confirmed to the parent by email, in their language
    const L = u.lang, ver = docVersion();
    const items = [adult ? t('declSelf', null, L) : t('declGuardian', null, L), `${t('declTerms', null, L)} (${t('version', null, L)} ${ver})`, `${t('declPrivacy', null, L)} (${t('version', null, L)} ${ver})`, ...(v.federation ? [t('declFed', null, L)] : [])];
    sendMail(u.email, t('mDeclSubj', null, L), wrapMail(L, t('declTitle', null, L), `<p>${esc(t('mDeclBody', null, L))}</p>
      <ul class="mlist">${items.map(x => `<li>✓ ${esc(x)}</li>`).join('')}</ul>
      <p class="small"><b>${esc(u.first)} ${esc(u.last)}</b> · ${esc(u.email)}<br>${esc(t('confirmedAt', { date: fmtDT(at, L) }, L))}</p>
      <p>${esc(t('mWelcomeBody', null, L))}${adult ? '' : ' ' + esc(t('mDeclNext', null, L))}</p>`));
    session.set({ userId: u.id, auth: true });
    toast(t('activated'));
    go(adult ? 'account/player/new' : 'account');
  });
}

/* ---------------- sign in ---------------- */
export function renderLogin(main) {
  if (currentUser()) { go('account'); return; }
  const box = shell(main, `<h1>${esc(t('loginTitle'))}</h1><p class="muted">${esc(t('loginSub'))}</p>
    <div class="creds"><span><b>${esc(t('demoLogin'))}</b><br>${esc(t('regParent'))}: <code>${DEMO_PARENT.id}</code> / <code>${DEMO_PARENT.pw}</code><br>${esc(t('regAdult'))}: <code>${DEMO_ADULT.id}</code> / <code>${DEMO_ADULT.pw}</code></span>
      <span class="creds-b"><button class="btn btn-ghost btn-sm" type="button" data-fill="p">${esc(t('fill'))} 1</button><button class="btn btn-ghost btn-sm" type="button" data-fill="a">${esc(t('fill'))} 2</button></span></div>
    <form class="form" id="lf" novalidate>
      ${field('id', t('loginId'), { attrs: 'autocomplete="username"' })}
      ${pwField('password', t('password'), 'current-password')}
      <button class="btn btn-gold btn-block" type="submit">${esc(t('signIn'))}</button>
      <div class="row-between"><a class="link" href="#/forgot">${esc(t('forgot'))}</a><a class="link" href="#/register">${esc(t('noAccount'))}</a></div>
    </form>`, { kicker: t('stageLogin') });
  const f = $('#lf', box);
  bindPasswordUI(f);
  $$('[data-fill]', box).forEach(b => b.addEventListener('click', () => {
    const d = b.dataset.fill === 'p' ? DEMO_PARENT : DEMO_ADULT;
    f.id.value = d.id; f.password.value = d.pw; $('[type=submit]', f).focus();
  }));
  f.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(f);
    const v = Object.fromEntries(new FormData(f));
    if (!v.id.trim()) { fieldError(f, 'id', t('vRequired')); return; }
    const wait = lockedFor(v.id);
    if (wait) { formError(f, t('loginLocked', { s: wait })); return; }
    const btn = $('[type=submit]', f); setBusy(btn, true);
    const u = userByLogin(v.id);
    const ok = u && u.role !== 'admin' && await verifyPassword(v.password || '', u.pw);
    setBusy(btn, false);
    if (!ok) {
      const left = loginFailed(v.id, u ? `${u.first} ${u.last}` : 'Unknown');
      formError(f, lockedFor(v.id) ? t('loginLocked', { s: 60 }) : t('loginWrong', { n: left }));
      return;
    }
    if (u.status === 'inactive') { formError(f, t('inactiveAcc')); return; }
    loginOk(v.id);
    if (!u.verified) {
      codeMail(u, await issueCode(u.id, 'verify'));
      session.set({ userId: u.id, stage: 'verify' });
      go('verify'); return;
    }
    if (!db.consents.some(c => c.userId === u.id && c.type === 'terms' && c.status === 'given')) {
      session.set({ userId: u.id, stage: 'decl' }); go('declarations'); return;
    }
    if (isB() && u.twofa) { secondStep(box, u); return; }
    finishLogin(u);
  });
}

function secondStep(box, u) {
  box.innerHTML = `<div class="step-kicker">${esc(t('stageLogin'))} ${bTag()}</div><h1>${esc(t('code2faTitle'))}</h1><p class="muted">${esc(t('verifySub', { email: u.email }))}</p>
    <form class="form" id="tf" novalidate>${codeInputsHTML()}<button class="btn btn-gold btn-block" type="submit">${esc(t('signIn'))}</button>
    <button class="btn btn-ghost btn-sm" type="button" id="oi">${icon.mail} ${esc(t('openInbox'))}</button></form>`;
  issueCode(u.id, 'login').then(c => codeMail(u, c, 'login'));
  const f = $('#tf', box);
  const code = bindCodeInputs($('.code-inputs', f), () => f.requestSubmit());
  setTimeout(() => $('input', f)?.focus(), 200);
  $('#oi', box).addEventListener('click', () => openInbox(latestFor(u.email)?.id));
  f.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(f);
    if (code.value().length < 6) { formError(f, t('codeDigits')); return; }
    const r = await checkCode(u.id, 'login', code.value());
    if (!r.ok) { formError(f, t(r.key, { n: r.n })); code.shake(); code.clear(); return; }
    finishLogin(u);
  });
}

function finishLogin(u) {
  const dev = deviceName();
  u.devices = u.devices || [];
  const known = u.devices.some(d => d.name === dev);
  u.devices.unshift({ name: dev, at: Date.now() });
  u.devices = u.devices.slice(0, 8);
  save();
  if (isB() && !known) sendMail(u.email, t('mDeviceSubj', null, u.lang), wrapMail(u.lang, t('mDeviceSubj', null, u.lang), `<p>${esc(t('mDeviceBody', { device: dev }, u.lang))}</p>`), { quiet: true });
  session.set({ userId: u.id, auth: true });
  go('account');
}

/* ---------------- password reset ---------------- */
export function renderForgot(main) {
  const box = shell(main, `<h1>${esc(t('forgotTitle'))}</h1><p class="muted">${esc(t('forgotSub'))}</p>
    <form class="form" id="ff" novalidate>${field('email', t('email'), { type: 'email', attrs: 'autocomplete="email"' })}<button class="btn btn-gold btn-block" type="submit">${esc(t('sendCode'))}</button>
    <p class="center"><a class="link" href="#/login">← ${esc(t('signIn'))}</a></p></form>`, { kicker: t('stageLogin') });
  const f = $('#ff', box);
  f.addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(f);
    const email = f.email.value;
    if (!validEmail(email)) { fieldError(f, 'email', t('vEmail')); return; }
    const u = userByEmail(email);
    if (u && u.role !== 'admin' && resendWait(u.id, 'reset') === 0) codeMail(u, await issueCode(u.id, 'reset'), 'reset');
    // same answer whether or not the account exists
    box.innerHTML = `<div class="step-kicker">${esc(t('stageLogin'))}</div><h1>${esc(t('forgotTitle'))}</h1>${note(esc(t('resetNote')))}
      <form class="form" id="nf" novalidate>${codeInputsHTML()}
      <div class="grid2">${pwField('password', t('newPassword'), 'new-password', true)}${pwField('password2', t('passwordRepeat'), 'new-password')}</div>
      <button class="btn btn-gold btn-block" type="submit">${esc(t('setPassword'))}</button>
      <button class="btn btn-ghost btn-sm" type="button" id="oi">${icon.mail} ${esc(t('openInbox'))}</button></form>`;
    const nf = $('#nf', box);
    bindPasswordUI(nf);
    const code = bindCodeInputs($('.code-inputs', nf), () => {});
    $('#oi', box).addEventListener('click', () => openInbox(latestFor(norm(email))?.id));
    nf.addEventListener('submit', async ev => {
      ev.preventDefault(); clearErrors(nf);
      const p1 = nf.password.value, p2 = nf.password2.value;
      if (code.value().length < 6) { formError(nf, t('codeDigits')); return; }
      if (!pwStrongEnough(p1)) { fieldError(nf, 'password', t('vPwWeak')); return; }
      if (p1 !== p2) { fieldError(nf, 'password2', t('vPwMatch')); return; }
      if (!u) { formError(nf, t('codeNone')); return; }
      const r = await checkCode(u.id, 'reset', code.value());
      if (!r.ok) { formError(nf, t(r.key, { n: r.n })); code.shake(); code.clear(); return; }
      u.pw = await hashPassword(p1); save();
      log('profile', `${u.first} ${u.last}`, 'Password reset by email code');
      sendMail(u.email, t('mPwSubj', null, u.lang), wrapMail(u.lang, t('mPwSubj', null, u.lang), `<p>${esc(t('mPwBody', null, u.lang))}</p>`), { quiet: true });
      toast(t('resetDone'));
      go('login');
    });
  });
}
