import { db, save, uid, log, currentUser } from '../store.js';
import { t, site, slogan, generationsHead, lang } from '../i18n.js';
import { GROUPS, ORIGIN } from '../site-data.js';
import { $, $$, esc, icon, flag, field, selectField, toast, clearErrors, fieldError, validEmail, hasGsap, reduced, enter, note } from '../ui.js';
import { sendMail, wrapMail, FROM } from '../mail.js';
import { country } from '../i18n.js';

const FLAG = { BA: 'ba', HR: 'hr', RS: 'rs', ME: 'me', AL: 'al', XK: 'xk', MK: 'mk' };

export function heroImage() { return db.content.heroImage || new URL('assets/img/hero.jpg', location.href.split('#')[0]).href; }

function activeAds() {
  const d = new Date().toISOString().slice(0, 10);
  return db.ads.filter(a => a.active && (!a.from || a.from <= d) && (!a.to || a.to >= d)).sort((a, b) => a.slot - b.slot);
}
export const adHTML = a => `<a class="adcard" ${a.url ? `href="${esc(a.url)}" target="_blank" rel="noopener sponsored"` : 'href="#/contact"'}>
  <span class="ad-visual">${a.image ? `<img src="${a.image}" alt="">` : '<i>✦</i>'}</span>
  <span class="ad-text"><b>${esc(a.title)}</b><span>${esc(a.desc)}</span></span>
  <span class="ad-btn">${esc(a.button || 'Saznaj više')}</span></a>`;

export function footer() {
  return `<footer class="foot"><div class="shell foot-in">
    <div><span class="brand small"><span class="word">Handball<b>Bridge</b></span></span><p>${esc(t('footerRights'))}</p></div>
    <div class="foot-links"><a href="#/about">${esc(site('about'))}</a><a href="#/parents">${esc(site('parents'))}</a><a href="#/contact">${esc(site('contact'))}</a><a href="#/admin">${esc(site('adminEntry'))}</a></div>
    <div class="foot-mail"><span>info@hb-talents.com</span><span>admin@hb-talents.com</span></div>
  </div><div class="shell foot-base">HandballBridge · hb-talents.com · 2026 · Preview with fictional data</div></footer>`;
}

/* ---------------- home ---------------- */
export function renderHome(main) {
  const s = slogan();
  const posts = (db.content.posts || []).filter(p => p.active);
  main.innerHTML = `
  <section class="hero" id="hero">
    <div class="hero-img" style="background-image:url('${heroImage()}')"></div>
    <div class="hero-shade"></div>
    <div class="shell hero-grid">
      <div class="hero-copy">
        <div class="eyebrow" data-h>${esc(site('heroEyebrow'))}</div>
        <h1><span class="l" data-h>${esc(site('heroA'))}</span><span class="l gold" data-h>${esc(site('heroB'))}</span></h1>
        <p class="hero-desc" data-h>${esc(site('heroDesc'))}</p>
        <div class="gens" data-h><div class="gens-h">${esc(generationsHead())}</div><div class="gens-list">${GROUPS.map(g => `<a class="gen" href="#/parents">${g}</a>`).join('')}</div></div>
        <div class="flags" data-h>${ORIGIN.map(c => `<span class="flagchip" title="${esc(country(c))}">${flag(FLAG[c])}</span>`).join('')}</div>
        <div class="hero-cta" data-h><a class="btn btn-gold btn-lg" href="#/${currentUser() ? 'account' : 'parents'}">${esc(site('registerChild'))}</a></div>
        <div class="private" data-h>${esc(site('privateNote'))}</div>
      </div>
      <div class="slogan" id="slogan" aria-label="${esc(s.join(' '))}">
        <div class="slogan-in">${s.map(x => `<span>${esc(x)}</span>`).join('')}
          <svg class="swish" viewBox="0 0 520 72" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gSwish" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#B97D19"/><stop offset="40%" stop-color="#FFF2A3"/><stop offset="70%" stop-color="#E9B63D"/><stop offset="100%" stop-color="#A36A12"/></linearGradient></defs><path d="M12 54 Q255 -10 508 43 Q255 5 12 54 Z" fill="url(#gSwish)"/><path d="M44 61 Q259 16 478 44" fill="none" stroke="#FFE998" stroke-width="2.4" stroke-linecap="round"/></svg>
        </div>
      </div>
    </div>
    <div class="shell ads">${activeAds().map(adHTML).join('')}</div>
  </section>
  ${posts.length ? `<section class="news"><div class="shell">${posts.map(p => `<article class="post" data-r><span class="post-date">${new Date(p.at).toLocaleDateString('en-GB')}</span><h3>${esc(p.title[lang()] || p.title.en)}</h3><p>${esc(p.body[lang()] || p.body.en)}</p></article>`).join('')}</div></section>` : ''}
  ${footer()}`;

  // motion: the main image stays the same; it only gets depth and a slow settle
  if (!hasGsap() || reduced()) return;
  const tl = gsap.timeline();
  tl.from('.hero-img', { scale: 1.14, duration: 2.4, ease: 'power2.out' }, 0)
    .from('[data-h]', { y: 34, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', clearProps: 'transform,opacity' }, .25)
    .from('.flagchip', { y: 16, opacity: 0, scale: .8, duration: .7, stagger: .05, ease: 'back.out(2)', clearProps: 'transform,opacity' }, .9)
    .from('.slogan-in span', { opacity: 0, x: 40, filter: 'blur(6px)', duration: 1.1, stagger: .18, ease: 'power3.out' }, .6)
    .from('.swish', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'power2.inOut' }, 1.2)
    .from('.adcard', { y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out' }, .9);
  gsap.to('.hero-img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('[data-r]', main).forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  const hero = $('#hero', main);
  if (matchMedia('(pointer: fine)').matches) {
    const qx = gsap.quickTo('.slogan-in', 'x', { duration: .9, ease: 'power3.out' });
    const qy = gsap.quickTo('.slogan-in', 'y', { duration: .9, ease: 'power3.out' });
    const ix = gsap.quickTo('.hero-img', 'x', { duration: 1.4, ease: 'power3.out' });
    const move = e => { const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5; qx(px * 22); qy(py * 14); ix(px * -14); };
    hero.addEventListener('pointermove', move);
    return () => hero.removeEventListener('pointermove', move);
  }
}

/* ---------------- about ---------------- */
export function renderAbout(main) {
  main.innerHTML = `<section class="page-hero" style="--img:url('${heroImage()}')"><div class="shell"><div class="eyebrow">HANDBALLBRIDGE</div><h1>${esc(t('aboutTitle'))}</h1></div></section>
  <section class="page"><div class="shell two-col">
    <div class="prose" data-e><p class="lead">${esc(t('aboutP1'))}</p><p>${esc(t('aboutP2'))}</p>
      <div class="gens light"><div class="gens-h">${esc(generationsHead())}</div><div class="gens-list">${GROUPS.map(g => `<span class="gen">${g}</span>`).join('')}</div></div>
      <div class="flags light">${ORIGIN.map(c => `<span class="flagchip" title="${esc(country(c))}">${flag(FLAG[c])}<em>${esc(country(c))}</em></span>`).join('')}</div>
    </div>
    <div class="card how" data-e><h3>${esc(t('howTitle'))}</h3>
      <ol class="howlist">${['how1', 'how2', 'how3', 'how4'].map((k, i) => `<li><i>${i + 1}</i><span>${esc(t(k))}</span></li>`).join('')}</ol>
      <p class="muted small">${esc(t('adultsToo'))}</p>
      <a class="btn btn-gold" href="#/register">${esc(t('regTitle'))} →</a></div>
  </div></section>${footer()}`;
  enter(main, '[data-e]');
}

/* ---------------- for parents ---------------- */
export function renderParents(main) {
  const me = currentUser();
  main.innerHTML = `<section class="page-hero" style="--img:url('${heroImage()}')"><div class="shell"><div class="eyebrow">${esc(t('stage1'))}</div><h1>${esc(t('parentsTitle'))}</h1><p>${esc(t('parentsSub'))}</p></div></section>
  <section class="page"><div class="shell">
    <div class="choice" data-e>
      <a class="choice-card" href="#/${me ? 'account' : 'register/parent'}"><span class="ic">${icon.users}</span><b>${esc(t('regParent'))}</b><span>${esc(t('regParentD'))}</span><em>→</em></a>
      <a class="choice-card" href="#/${me ? 'account' : 'register/adult'}"><span class="ic">${icon.user}</span><b>${esc(t('regAdult'))}</b><span>${esc(t('regAdultD'))}</span><em>→</em></a>
    </div>
    <div class="card how wide" data-e><h3>${esc(t('howTitle'))}</h3>
      <ol class="howlist row">${['how1', 'how2', 'how3', 'how4'].map((k, i) => `<li><i>${i + 1}</i><span>${esc(t(k))}</span></li>`).join('')}</ol></div>
    <p class="center muted"><a class="link" href="#/login">${esc(t('haveAccount'))}</a></p>
  </div></section>${footer()}`;
  enter(main, '[data-e]');
}

/* ---------------- contact ---------------- */
export function renderContact(main) {
  const me = currentUser();
  main.innerHTML = `<section class="page-hero" style="--img:url('${heroImage()}')"><div class="shell"><div class="eyebrow">${esc(t('contactKicker'))}</div><h1>${esc(t('contactTitle'))}</h1><p>${esc(t('contactSub'))}</p></div></section>
  <section class="page"><div class="shell narrow"><form class="card form" id="cf" novalidate data-e>
    <div class="grid2">${field('name', t('fullName'), { value: me ? `${me.first} ${me.last}` : '' })}${field('email', t('email'), { type: 'email', value: me?.email || '' })}</div>
    ${selectField('type', t('inquiryType'), [['parent', t('inqParent')], ['external', t('inqExternal')]], { value: me ? 'parent' : '' })}
    <div class="field"><label for="body">${esc(t('message'))} <b class="req">*</b></label><textarea class="input" id="body" name="body" rows="5"></textarea></div>
    <button class="btn btn-gold" type="submit">${esc(t('sendMessage'))}</button>
  </form></div></section>${footer()}`;
  enter(main, '[data-e]');
  const f = $('#cf', main);
  f.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(f);
    const v = Object.fromEntries(new FormData(f));
    let bad = false;
    ['name', 'type', 'body'].forEach(k => { if (!String(v[k] || '').trim()) { fieldError(f, k, t('vRequired')); bad = true; } });
    if (!validEmail(v.email)) { fieldError(f, 'email', t('vEmail')); bad = true; }
    if (bad) return;
    db.messages.unshift({ id: uid('q'), name: v.name.trim(), email: v.email.trim(), type: v.type, body: v.body.trim(), at: Date.now(), read: false });
    save();
    sendMail('info@hb-talents.com', `Contact form: ${v.name.trim()}`, wrapMail('en', 'New message from the website', `<p><b>${esc(v.name)}</b> (${esc(v.email)})</p><p>${esc(v.body)}</p>`), { from: FROM.noreply, quiet: true });
    f.reset();
    toast(t('messageSent'));
  });
}
