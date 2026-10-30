import { t } from './i18n.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const go = path => { location.hash = '#/' + path; };
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const hasGsap = () => typeof window.gsap !== 'undefined';
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());
export const today = () => new Date().toISOString().slice(0, 10);

export const icon = {
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5"/><circle cx="17.5" cy="9.5" r="2.5"/><path d="M16 14.6c3 .1 5.5 1.7 5.5 5.4"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5 12 13l8.5-5.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24"><path d="M3 10v4h3l7 5V5L6 10z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>',
  text: '<svg viewBox="0 0 24 24"><path d="M5 6h14M12 6v13M8 19h8"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  inbox: '<svg viewBox="0 0 24 24"><path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6z"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>',
  ball: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.5 10c5 2 12 2 17 0M4 15.5c5-2 11-2 16 0"/></svg>'
};

/* ---------- toasts ---------- */
export function toast(msg, kind = 'ok', action) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = `<i aria-hidden="true">${kind === 'bad' ? '!' : kind === 'mail' ? icon.mail : icon.check}</i><span>${esc(msg)}</span>`;
  if (action) {
    const b = document.createElement('button');
    b.className = 'btn btn-ghost btn-sm';
    b.textContent = action.label;
    b.onclick = () => { action.onClick(); dismiss(); };
    el.append(b);
  }
  box.append(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  const dismiss = () => { el.classList.add('out'); setTimeout(() => el.remove(), 400); };
  setTimeout(dismiss, action ? 6500 : 4000);
}

/* ---------- modal ---------- */
export function openModal({ title, sub = '', html, wide = false, onMount }) {
  const prev = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `<div class="modal-back" data-close></div>
    <div class="modal-card${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mTitle">
      <button class="icon-btn modal-x" data-close aria-label="${esc(t('close'))}">${icon.close}</button>
      <h3 id="mTitle">${esc(title)}</h3>
      ${sub ? `<p class="modal-sub">${sub}</p>` : ''}
      <div class="modal-body">${html}</div>
    </div>`;
  document.body.append(wrap);
  document.documentElement.style.overflow = 'hidden';
  const card = $('.modal-card', wrap);
  if (hasGsap() && !reduced()) {
    gsap.fromTo($('.modal-back', wrap), { opacity: 0 }, { opacity: 1, duration: .3 });
    gsap.fromTo(card, { opacity: 0, y: 26, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'expo.out' });
  }
  const focusables = () => $$('button, [href], input, select, textarea', card).filter(x => !x.disabled && x.offsetParent !== null);
  const onKey = e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = focusables(); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  };
  let closed = false;
  function close() {
    if (closed) return; closed = true;
    document.removeEventListener('keydown', onKey);
    const done = () => {
      wrap.remove();
      if (!$('.modal')) document.documentElement.style.overflow = '';
      prev?.focus?.();
    };
    if (hasGsap() && !reduced()) {
      gsap.to(card, { opacity: 0, y: 16, duration: .2, ease: 'power2.in' });
      gsap.to($('.modal-back', wrap), { opacity: 0, duration: .25, onComplete: done });
    } else done();
  }
  document.addEventListener('keydown', onKey);
  $$('[data-close]', wrap).forEach(b => b.addEventListener('click', close));
  onMount?.(wrap, close);
  setTimeout(() => (focusables().find(x => x.matches('input, select, textarea')) || focusables()[1] || card).focus(), 60);
  return close;
}

export function confirmBox({ title, text, confirmLabel, danger = false, requireWord }) {
  return new Promise(resolve => {
    let result = false;
    openModal({
      title,
      html: `<p class="muted">${text}</p>
        ${requireWord ? `<div class="field" style="margin-top:16px"><label for="cw">${esc(t('typeToConfirm', { w: requireWord }))}</label><input class="input" id="cw" autocomplete="off"></div>` : ''}
        <div class="modal-foot"><button class="btn btn-ghost" data-close>${esc(t('cancel'))}</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cOk" ${requireWord ? 'disabled' : ''}>${esc(confirmLabel || t('verifyBtn'))}</button></div>`,
      onMount(w, c) {
        const ok = $('#cOk', w);
        if (requireWord) $('#cw', w).addEventListener('input', e => { ok.disabled = e.target.value.trim().toUpperCase() !== requireWord.toUpperCase(); });
        ok.addEventListener('click', () => { result = true; c(); });
        const obs = new MutationObserver(() => { if (!w.isConnected) { obs.disconnect(); resolve(result); } });
        obs.observe(document.body, { childList: true });
      }
    });
  });
}

/* ---------- forms ---------- */
export function fieldError(form, name, msg) {
  const input = form.elements[name] || $(`[data-field="${name}"]`, form);
  const box = (input?.closest ? input.closest('.field, .check, .group') : null) || $(`[data-field="${name}"]`, form);
  if (!box) return;
  box.classList.toggle('err', !!msg);
  let m = box.querySelector(':scope > .msg');
  if (!m) { m = document.createElement('div'); m.className = 'msg'; box.append(m); }
  m.textContent = msg || '';
  if (input?.setAttribute) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}
export function clearErrors(form) {
  $$('.err', form).forEach(f => f.classList.remove('err'));
  $$('.msg', form).forEach(m => { m.textContent = ''; });
  $('.form-error', form)?.remove();
}
export function formError(form, msg) {
  $('.form-error', form)?.remove();
  const d = document.createElement('div');
  d.className = 'form-error'; d.setAttribute('role', 'alert'); d.textContent = msg;
  form.prepend(d);
  d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
export function firstError(form) {
  const e = $('.err', form);
  if (e) { e.scrollIntoView({ block: 'center', behavior: 'smooth' }); $('input, select, textarea', e)?.focus({ preventScroll: true }); }
}

export function pwScore(pw) {
  let s = 0;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return pw.length < 10 ? Math.min(s, 1) : s;
}
export const pwStrongEnough = pw => pw.length >= 10 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);

export const field = (name, label, { type = 'text', value = '', required = true, attrs = '', hint = '' } = {}) => `
  <div class="field"><label for="${name}">${esc(label)}${required ? ' <b class="req">*</b>' : ` <span class="opt">(${esc(t('optional'))})</span>`}</label>
    <input class="input" id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${attrs}>
    ${hint ? `<div class="hint-s">${esc(hint)}</div>` : ''}</div>`;
export const selectField = (name, label, options, { value = '', required = true, placeholder = true } = {}) => `
  <div class="field"><label for="${name}">${esc(label)}${required ? ' <b class="req">*</b>' : ` <span class="opt">(${esc(t('optional'))})</span>`}</label>
    <select class="input" id="${name}" name="${name}">${placeholder ? `<option value="">${esc(t('select'))}</option>` : ''}${options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
export const pwField = (name, label, auto, meter = false) => `
  <div class="field"><label for="${name}">${esc(label)} <b class="req">*</b></label>
    <div class="pw"><input class="input" type="password" id="${name}" name="${name}" autocomplete="${auto}" ${meter ? 'data-meter' : ''}>
    <button type="button" aria-label="Show password">${icon.eye}</button></div>
    ${meter ? `<div class="meter"><i></i><i></i><i></i><i></i></div><div class="meter-label">${esc(t('pwHint'))}</div>` : ''}
  </div>`;
export function bindPasswordUI(root) {
  $$('.pw', root).forEach(w => {
    const input = $('input', w), b = $('button', w);
    b.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      b.innerHTML = show ? icon.eyeOff : icon.eye;
    });
  });
  $$('input[data-meter]', root).forEach(input => {
    const f = input.closest('.field'), meter = $('.meter', f), label = $('.meter-label', f);
    const cols = ['#E5484D', '#F5A524', '#E7B953', '#2FB67C'];
    input.addEventListener('input', () => {
      const s = input.value ? Math.max(1, pwScore(input.value)) : 0;
      $$('i', meter).forEach((i, n) => { i.style.background = n < s ? cols[s - 1] : ''; });
      label.textContent = !input.value ? t('pwHint') : s >= 4 ? t('pwStrong') : pwStrongEnough(input.value) ? t('pwOk') : t('pwWeak');
    });
  });
}

export function bindCodeInputs(wrap, onComplete) {
  const inputs = $$('input', wrap);
  const value = () => inputs.map(i => i.value).join('');
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(-1);
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
      if (value().length === inputs.length) onComplete(value());
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
    inp.addEventListener('paste', e => {
      const v = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, inputs.length);
      if (!v) return;
      e.preventDefault();
      inputs.forEach((x, n) => { x.value = v[n] || ''; });
      inputs[Math.min(v.length, inputs.length - 1)].focus();
      if (v.length === inputs.length) onComplete(v);
    });
  });
  return {
    value,
    clear() { inputs.forEach(x => { x.value = ''; }); inputs[0].focus(); },
    shake() { wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake'); }
  };
}
export const codeInputsHTML = () =>
  `<div class="code-inputs" role="group" aria-label="${esc(t('code'))}">${Array.from({ length: 6 }, (_, i) =>
    `<input inputmode="numeric" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" maxlength="1" aria-label="${i + 1}">`).join('')}</div>`;

export function download(name, data, type) {
  const url = typeof data === 'string' && data.startsWith('data:') ? data : URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  if (!url.startsWith('data:')) setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export function setBusy(btn, busy) { btn.classList.toggle('loading', busy); btn.disabled = busy; }
export const note = (html, kind = '') => `<div class="note ${kind}">${icon.info}<span>${html}</span></div>`;
export const flag = (code, cls = '') => ['ba', 'hr', 'rs', 'me', 'al', 'xk', 'mk'].includes(code) ? `<img class="flagimg ${cls}" src="assets/img/flags/${code}.webp" alt="" width="26" height="18">` : '';
export const steps = (labels, active) => `<ol class="steps" aria-label="Progress">${labels.map((l, i) => `<li class="${i < active ? 'done' : i === active ? 'on' : ''}"><i>${i < active ? icon.check : i + 1}</i><span>${esc(l)}</span></li>`).join('')}</ol>`;
// marks a feature that belongs to Option B, so the client sees what the extra price adds
export const bTag = () => `<span class="btag" title="${esc(t('extraB'))}">B</span>`;
export function enter(root, sel, opts = {}) {
  const els = $$(sel, root);
  if (!hasGsap() || reduced() || !els.length) return;
  gsap.from(els, { opacity: 0, y: 22, duration: .8, ease: 'expo.out', stagger: .05, clearProps: 'transform,opacity', ...opts });
}
// self-hosted media (Pexels licence): muted clips play only while on screen
export const vid = (name, { preload = 'none', cls = '' } = {}) =>
  `<video class="${cls}" data-auto src="assets/video/${name}.mp4" poster="assets/video/${name}.jpg" muted loop playsinline preload="${preload}" aria-hidden="true"></video>`;
export const photo = (name, alt = '', attrs = '') => `<img src="assets/photo/${name}.webp" alt="${esc(alt)}" loading="lazy" decoding="async" ${attrs}>`;
export function autoVideos(root) {
  const vids = $$('video[data-auto]', root);
  if (reduced() || !('IntersectionObserver' in window)) { vids.forEach(v => v.pause()); return () => {}; }
  const io = new IntersectionObserver(es => es.forEach(({ target: v, isIntersecting }) => { if (isIntersecting) v.play()?.catch(() => {}); else v.pause(); }), { rootMargin: '120px' });
  vids.forEach(v => { v.muted = true; io.observe(v); });
  return () => { io.disconnect(); vids.forEach(v => v.pause()); };
}

export function countUp(el, to, dur = 1.2) {
  if (!hasGsap() || reduced()) { el.textContent = to; return; }
  const o = { v: 0 };
  gsap.to(o, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
}
