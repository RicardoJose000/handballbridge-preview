import { db, save, uid, log, currentUser } from '../store.js';
import { t, site, slogan, generationsHead, lang } from '../i18n.js';
import { GROUPS, ORIGIN } from '../site-data.js';
import { $, $$, esc, icon, flag, field, selectField, toast, clearErrors, fieldError, validEmail, hasGsap, reduced, enter, note, vid, photo, autoVideos } from '../ui.js';
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
// photos for the film strip and the country ring (Pexels licence, self-hosted)
const STRIP = ['jump', 'keeper', 'match', 'attack', 'leap', 'goal', 'shot', 'training', 'player', 'tactics'];
const RING = { BA: 'match', HR: 'attack', RS: 'keeper', ME: 'leap', AL: 'goal', XK: 'jump', MK: 'shot' };
const pad = n => String(n).padStart(2, '0');

export function renderHome(main) {
  const s = slogan();
  const posts = (db.content.posts || []).filter(p => p.active);
  const players = db.players.length;
  const steps = [
    ['how1', vid('parent'), ''],
    ['how2', photo('tactics'), `<div class="float-code"><small>noreply@hb-talents.com</small><b>482 913</b></div>`],
    ['how3', vid('sign'), ''],
    ['how4', photo('player'), `<div class="float-card"><span class="avatar">LH</span><span><b>Lejla H.</b><small>2010 / 2011 · ${flag('ba', 'sm')} ${flag('hr', 'sm')}</small></span><i class="chip ok">${esc(t('stActive'))}</i></div>`]
  ];
  main.innerHTML = `
  <section class="hero" id="hero">
    <div class="hero-img" style="background-image:url('${heroImage()}')"></div>
    <div class="hero-shade"></div>
    <!-- same layout, sizes and fonts as the current hb-talents.com homepage -->
    <div class="slogan" id="slogan" aria-label="${esc(s.join(' '))}">
      <div class="slogan-in">${s.map(x => `<span>${esc(x)}</span>`).join('')}
        <svg class="swish" viewBox="0 0 520 72" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gSwish" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#B97D19"/><stop offset="40%" stop-color="#FFF2A3"/><stop offset="70%" stop-color="#E9B63D"/><stop offset="100%" stop-color="#A36A12"/></linearGradient></defs><path d="M12 54 Q255 -10 508 43 Q255 5 12 54 Z" fill="url(#gSwish)"/><path d="M44 61 Q259 16 478 44" fill="none" stroke="#FFE998" stroke-width="2.4" stroke-linecap="round"/></svg>
      </div>
    </div>
    <div class="hero-body">
      <div class="eyebrow" data-h>${esc(site('heroEyebrow'))}</div>
      <h1><span class="l" data-h>${esc(site('heroA'))}</span> <span class="l gold" data-h>${esc(site('heroB'))}</span></h1>
      <p class="hero-desc" data-h>${esc(site('heroDesc'))}</p>
      <div class="gens" data-h><h3 class="gens-h">${esc(generationsHead())}</h3><div class="gens-list">${GROUPS.map(g => `<a class="gen" href="#/parents">${g}</a>`).join('')}</div></div>
      <div class="flags" data-h>${ORIGIN.map(c => `<span class="flagchip" title="${esc(country(c))}">${flag(FLAG[c])}</span>`).join('')}</div>
      <div class="hero-cta" data-h><a class="btn hero-btn" href="#/${currentUser() ? 'account' : 'parents'}">${esc(site('registerChild'))}</a></div>
      <span class="privacybadge" data-h>${esc(site('privateNote'))}</span>
    </div>
  </section>
  <div class="adstrip">${activeAds().map(adHTML).join('')}</div>

  <div class="filmstrip" aria-hidden="true"><div class="film-track" id="filmTrack">${[...STRIP, ...STRIP].map((n, i) => (i % 3 === 2 ? `<div class="wd">${esc(s[Math.floor(i / 3) % 3])}</div>` : '') + `<div class="fr">${photo(n)}<span>HB · ${pad(i % 10 + 1)}A</span></div>`).join('')}</div></div>

  <section class="reel" id="reel">
    <div class="reel-media" id="reelMedia">${vid('reel', { preload: 'auto' })}</div>
    <div class="reel-bars"><i></i><i></i></div>
    <div class="reel-copy"><div class="eyebrow">${esc(site('heroEyebrow'))}</div>
      <h2 id="reelTitle">${s.map((x, i) => `<span class="${i === 2 ? 'gold' : ''}">${esc(x)}</span>`).join('')}</h2>
      <p>${esc(t('reelSub'))}</p></div>
    <div class="reel-tc" aria-hidden="true"><span>Rec</span><span id="tc">01:00:00:00</span><span>HB · 2026/27</span></div>
  </section>

  <section class="journey"><div class="shell">
    <div class="sec-head" data-r><div class="eyebrow dark">${esc(t('journeyKick'))}</div><h2 class="display">${esc(t('howTitle'))}</h2></div>
    <div class="jgrid">${steps.map(([k, media, extra], i) => `<article class="jcard" data-tilt>
      <div class="jmedia">${media}${extra}<span class="jnum">${pad(i + 1)}</span></div>
      <h3>${esc(t(k))}</h3></article>`).join('')}</div>
    <div class="row-center" data-r><a class="btn btn-gold btn-lg" href="#/register">${esc(t('regTitle'))} →</a></div>
  </div></section>

  <section class="ringsec"><div class="shell ringhead" data-r>
      <div><div class="eyebrow">${esc(generationsHead())} · ${GROUPS.join(' · ')}</div><h2 class="display light">${esc(t('ringTitle'))}<br><span class="gold">${esc(s[2])}</span></h2></div>
      <div class="bigstat"><b data-count="${players}">${players}</b><span>${esc(t('playersFrom'))}</span></div>
    </div>
    <div class="ring-stage" id="ringStage" data-drag>
      <div class="ring" id="ring">${ORIGIN.map(c => `<figure>${photo(RING[c], country(c))}<figcaption>${flag(FLAG[c])}<b>${esc(country(c))}</b></figcaption></figure>`).join('')}</div>
      <div class="ring-floor"></div>
    </div>
    <p class="ring-hint">← ${esc(t('ringHint'))} →</p>
  </section>

  <section class="secsec"><div class="shell secgrid">
    <div class="sec-photo">${photo('keeper', '')}<div class="lockchip">${icon.lock}<span>${esc(t('secTitle2'))}</span></div></div>
    <div class="sec-copy">
      <div class="eyebrow dark" data-r>HANDBALLBRIDGE · GDPR</div>
      <h2 class="display" data-r>${esc(t('secTitle'))}<br><span class="goldtext">${esc(t('secTitle2'))}</span></h2>
      <ul class="seclist">${['secP1', 'secP2', 'secP3', 'secP4'].map(k => `<li data-r><i>${icon.shield}</i><span>${esc(t(k))}</span></li>`).join('')}</ul>
      <p class="private dark" data-r>${esc(site('privateNote'))}</p>
    </div>
  </div></section>

  ${posts.length ? `<section class="news"><div class="shell">${posts.map(p => `<article class="post" data-r><span class="post-date">${new Date(p.at).toLocaleDateString('en-GB')}</span><h3>${esc(p.title[lang()] || p.title.en)}</h3><p>${esc(p.body[lang()] || p.body.en)}</p></article>`).join('')}</div></section>` : ''}

  <section class="cta"><div class="cta-bg">${vid('team')}</div><div class="shell cta-in" data-r>
    <div class="eyebrow">${esc(t('ctaKick'))}</div>
    <h2 class="display light">${esc(site('heroA'))} <span class="gold">${esc(site('heroB'))}</span></h2>
    <div class="row-center"><a class="btn btn-gold btn-lg" href="#/${currentUser() ? 'account' : 'parents'}">${esc(site('registerChild'))}</a><a class="btn btn-glass btn-lg" href="#/about">${esc(t('aboutTitle'))}</a></div>
  </div></section>
  ${footer()}`;

  const cleanups = [autoVideos(main), ring3d($('#ringStage', main))];
  let tcRaf = 0;
  const tc = $('#tc', main), rv = $('#reelMedia video', main);
  const tick = () => { const ts = rv.currentTime || 0; tc.textContent = `01:00:${pad(Math.floor(ts))}:${pad(Math.floor((ts % 1) * 25))}`; tcRaf = requestAnimationFrame(tick); };
  tick();
  cleanups.push(() => cancelAnimationFrame(tcRaf));
  const done = () => cleanups.forEach(f => f());

  if (!hasGsap() || reduced()) return done;
  const tl = gsap.timeline({ delay: filmIntro() });
  // the main image is shown exactly as on the current site: no zoom, no crop change
  tl.from('.hero-img', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0)
    .from('[data-h]', { y: 34, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', clearProps: 'transform,opacity' }, .25)
    .from('.flagchip', { y: 16, opacity: 0, scale: .8, duration: .7, stagger: .05, ease: 'back.out(2)', clearProps: 'transform,opacity' }, .9)
    .from('.slogan-in span', { opacity: 0, x: 40, filter: 'blur(6px)', duration: 1.1, stagger: .18, ease: 'power3.out' }, .6)
    .from('.swish', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'power2.inOut' }, 1.2)
    .from('.adcard', { y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', clearProps: 'transform,opacity' }, .9);
  $$('[data-r]', main).forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

  // film strip: runs on its own and leans with scroll speed
  const marquee = gsap.to('#filmTrack', { xPercent: -50, duration: 60, ease: 'none', repeat: -1 });
  const skew = gsap.quickTo('.filmstrip', 'skewY', { duration: .6, ease: 'power3.out' });
  const st = ScrollTrigger.create({ trigger: '.filmstrip', start: 'top bottom', end: 'bottom top', onUpdate: self => { const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 500); skew(v); marquee.timeScale(1 + Math.abs(v) * 1.5); } });
  cleanups.push(() => { marquee.kill(); st.kill(); });

  // showreel: the film opens from a card to full screen, then the letterbox bars close in
  const mm = gsap.matchMedia();
  mm.add('(min-width: 701px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '#reel', start: 'top top', end: '+=140%', pin: true, scrub: 1, anticipatePin: 1 } })
      .to('#reelMedia', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
      .to('#reelMedia video', { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
      .from('#reelTitle span', { yPercent: 70, opacity: 0, stagger: .12, duration: .6, ease: 'power3.out' }, .15)
      .from('.reel-copy .eyebrow, .reel-copy p', { opacity: 0, y: 20, duration: .4 }, .5)
      .to('.reel-bars i', { height: '9vh', ease: 'power2.inOut', duration: .5 }, .75)
      .from('.reel-tc', { opacity: 0, duration: .3 }, .8);
  });
  mm.add('(max-width: 700px)', () => { gsap.set('#reelMedia', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }); gsap.set('#reelMedia video', { scale: 1 }); });
  cleanups.push(() => mm.revert());

  // journey cards rise in 3D, then tilt with the pointer
  gsap.from('.jcard', { rotateX: -28, y: 90, opacity: 0, transformPerspective: 1000, transformOrigin: 'top center', duration: 1.2, stagger: .12, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.jgrid', start: 'top 85%', once: true } });
  if (matchMedia('(pointer: fine)').matches) $$('[data-tilt]', main).forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); gsap.to(el, { rotateY: ((e.clientX - r.left) / r.width - .5) * 12, rotateX: -((e.clientY - r.top) / r.height - .5) * 10, transformPerspective: 900, duration: .5, ease: 'power2.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: .9, ease: 'elastic.out(1, .5)' }));
  });
  // keeper photo: clip reveal and parallax
  gsap.fromTo('.sec-photo', { clipPath: 'inset(16% 16% 16% 16% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'power2.out', scrollTrigger: { trigger: '.secsec', start: 'top 85%', end: 'center center', scrub: 1 } });
  gsap.fromTo('.sec-photo img', { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.secsec', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('[data-count]', main).forEach(el => { const o = { v: 0 }, to = +el.dataset.count; gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } }); });
  gsap.fromTo('.cta-bg', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  return done;
}

// Film shutter on the first visit: a slate with a running frame counter, then the bars open.
function filmIntro() {
  if (window.__introDone) return 0;
  window.__introDone = true;
  const el = document.createElement('div');
  el.className = 'intro';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<i class="bar t"></i><i class="bar b"></i><div class="slate"><div><i></i><span>Take 01</span><b>Handball<em>Bridge</em></b><span id="introN">00</span></div></div>`;
  document.body.append(el);
  const n = { v: 0 }, out = el.querySelector('#introN');
  gsap.timeline({ onComplete: () => el.remove() })
    .from('.intro .slate div', { opacity: 0, y: 20, duration: .5, ease: 'expo.out' })
    .to(n, { v: 24, duration: .8, ease: 'none', onUpdate: () => { out.textContent = pad(Math.round(n.v)); } }, 0)
    .to('.intro .slate', { opacity: 0, duration: .25 }, .85)
    .to('.intro .bar.t', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, .9)
    .to('.intro .bar.b', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, .9);
  return 1.1;
}

// Drag-to-spin 3D ring of the seven countries. Cards facing away are dimmed.
function ring3d(stage) {
  const ring = $('#ring', stage), figs = $$('figure', ring), n = figs.length, step = 360 / n;
  let R = 0, rot = 0, vel = .12, drag = false, lx = 0, raf = 0, visible = false;
  const layout = () => {
    R = Math.round(figs[0].offsetWidth / 2 / Math.tan(Math.PI / n)) + 40;
    figs.forEach((f, i) => { f.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; });
  };
  const render = () => {
    ring.style.transform = `translateZ(${-R}px) rotateX(-6deg) rotateY(${rot}deg)`;
    figs.forEach((f, i) => { const face = Math.cos((i * step + rot) * Math.PI / 180); f.style.filter = `brightness(${(.45 + .55 * Math.max(0, face)).toFixed(3)})`; });
  };
  const still = reduced();
  const loop = () => {
    if (!visible) { raf = 0; return; }
    if (!drag && !still) { vel += (.12 - vel) * .03; rot -= vel; }
    render(); raf = requestAnimationFrame(loop);
  };
  const down = e => { drag = true; lx = e.clientX; stage.setPointerCapture?.(e.pointerId); };
  const move = e => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = -dx * .25; };
  const up = () => { drag = false; };
  stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  addEventListener('resize', layout);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); });
  io.observe(stage);
  layout(); render();
  return () => { io.disconnect(); cancelAnimationFrame(raf); removeEventListener('resize', layout); };
}

/* ---------------- about ---------------- */
export function renderAbout(main) {
  main.innerHTML = `<section class="page-hero" style="--img:url('${heroImage()}')"><div class="shell"><div class="eyebrow">HANDBALLBRIDGE</div><h1>${esc(t('aboutTitle'))}</h1></div></section>
  <section class="page"><div class="shell two-col">
    <div class="prose" data-e><p class="lead">${esc(t('aboutP1'))}</p><p>${esc(t('aboutP2'))}</p>
      <div class="gens light"><div class="gens-h">${esc(generationsHead())}</div><div class="gens-list">${GROUPS.map(g => `<span class="gen">${g}</span>`).join('')}</div></div>
      <div class="flags light">${ORIGIN.map(c => `<span class="flagchip" title="${esc(country(c))}">${flag(FLAG[c])}<em>${esc(country(c))}</em></span>`).join('')}</div>
    </div>
    <div class="about-side"><div class="mosaic" data-e><figure class="m1">${photo('attack')}</figure><figure class="m2">${photo('goal')}</figure><figure class="m3">${vid('team')}</figure></div>
    <div class="card how" data-e><h3>${esc(t('howTitle'))}</h3>
      <ol class="howlist">${['how1', 'how2', 'how3', 'how4'].map((k, i) => `<li><i>${i + 1}</i><span>${esc(t(k))}</span></li>`).join('')}</ol>
      <p class="muted small">${esc(t('adultsToo'))}</p>
      <a class="btn btn-gold" href="#/register">${esc(t('regTitle'))} →</a></div></div>
  </div></section>${footer()}`;
  enter(main, '[data-e]');
  return autoVideos(main);
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
