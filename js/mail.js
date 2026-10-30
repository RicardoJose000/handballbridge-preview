// Outgoing email. In production: SMTP through noreply@hb-talents.com with SPF, DKIM and DMARC.
// In the preview every message lands in the demo inbox instead.
import { db, save, uid } from './store.js';
import { t, fmtDT } from './i18n.js';
import { $, esc, toast } from './ui.js';

export const FROM = { noreply: 'HandballBridge <noreply@hb-talents.com>', admin: 'HandballBridge Admin <admin@hb-talents.com>' };

// email body in the recipient's language
export function wrapMail(l, title, body) {
  return `<div class="mail-doc"><div class="mh"><span class="mlogo">Handball<b>Bridge</b></span></div>
    <div class="mb"><h2>${esc(title)}</h2>${body}</div>
    <div class="mf">${esc(t('mFooter', null, l))}</div></div>`;
}

export function sendMail(to, subject, html, { attachments = [], from = FROM.noreply, quiet = false } = {}) {
  const m = { id: uid('m'), to, from, subject, html, at: Date.now(), read: false, attachments };
  db.mail.unshift(m);
  db.mail = db.mail.slice(0, 80);
  save();
  renderList();
  const btn = $('#inboxBtn');
  if (btn) { btn.classList.remove('ping'); void btn.offsetWidth; btn.classList.add('ping'); }
  if (!quiet) toast(`${t('demoInbox')}: ${subject}`, 'mail', { label: t('open'), onClick: () => openInbox(m.id) });
  return m;
}

/* ---------- drawer ---------- */
let drawer, list, view;
export function initInbox() {
  drawer = $('#inbox'); list = $('#mailList'); view = $('#mailView');
  $('#inboxBtn').addEventListener('click', () => (drawer.classList.contains('open') ? closeInbox() : openInbox()));
  document.querySelectorAll('[data-inbox-close]').forEach(b => b.addEventListener('click', closeInbox));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open') && !document.querySelector('.modal')) closeInbox(); });
  list.addEventListener('click', e => { const b = e.target.closest('[data-mail]'); if (b) showMail(b.dataset.mail); });
  renderList();
}
export function openInbox(id) {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('inbox-open');
  if (id) showMail(id); else { view.hidden = true; list.hidden = false; }
}
export function closeInbox() {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('inbox-open');
}
export function latestFor(email) { return db.mail.find(m => m.to === email); }

export function renderList() {
  if (!list) return;
  const unread = db.mail.filter(m => !m.read).length;
  const badge = $('#inboxBadge');
  badge.hidden = !unread; badge.textContent = unread;
  $('#inboxTitle').textContent = t('demoInbox');
  if (!db.mail.length) { list.innerHTML = `<li class="empty">${esc(t('inboxNote'))}</li>`; return; }
  list.innerHTML = db.mail.map(m => `<li class="${m.read ? '' : 'unread'}"><button data-mail="${m.id}">
    <span class="av" aria-hidden="true">HB</span>
    <span class="ml"><b>${esc(m.subject)}</b><small>${esc(m.to)}${m.attachments.length ? ' · PDF' : ''}</small></span>
    <time>${new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time></button></li>`).join('');
}
function showMail(id) {
  const m = db.mail.find(x => x.id === id);
  if (!m) return;
  m.read = true; save(); renderList();
  list.hidden = true; view.hidden = false;
  view.innerHTML = `<button class="btn btn-ghost btn-sm" id="mailBack">← ${esc(t('back'))}</button>
    <div class="mail-meta"><b>${esc(m.subject)}</b><span>From: ${esc(m.from)}</span><span>To: ${esc(m.to)}</span><span>${fmtDT(m.at)}</span></div>
    ${m.html}
    ${m.attachments.map(a => `<a class="attach" href="${a.url}" download="${esc(a.name)}"><span class="pdf">PDF</span><span><b>${esc(a.name)}</b><small>${esc(t('downloadPdf'))}</small></span></a>`).join('')}`;
  $('#mailBack').addEventListener('click', () => { view.hidden = true; list.hidden = false; });
  drawer.querySelector('.inbox-body').scrollTop = 0;
}

/* ---------- templates ---------- */
export const codeMail = (u, code, kind = 'verify') => {
  const l = u.lang || 'en';
  const subj = kind === 'reset' ? t('mResetSubj', { code }, l) : kind === 'login' ? t('mLoginSubj', { code }, l) : t('mVerifySubj', { code }, l);
  const title = kind === 'reset' ? t('forgotTitle', null, l) : kind === 'login' ? t('code2faTitle', null, l) : t('verifyTitle', null, l);
  const body = kind === 'reset' ? t('mResetBody', null, l) : t('mVerifyBody', null, l);
  sendMail(u.email, subj, wrapMail(l, title, `<p>${esc(body)}</p><div class="code">${code}</div><p class="small">${esc(t('mIgnore', null, l))}</p>`));
};
