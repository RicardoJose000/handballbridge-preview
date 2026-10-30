// Browser stand-in for the real PHP 8 + MySQL backend on Hetzner.
// It follows the same rules as production: hashed passwords and codes,
// throttling, consent records with versions, audit logs with retention.
// Everything here is fictional demo data and stays in this browser.
import { ORIGIN } from './site-data.js';

const KEY = 'hbb.db.v1';
const SKEY = 'hbb.session.v1';
export const DOC_VERSION = '2026-10';
// adults (18+) may register at any age; the generations 2008 to 2013 apply to children
export const ADULT_GROUP = '18+';
// version of the legal texts; the administrator starts a new one when the texts change
export const docVersion = () => db.content?.legalVersion || DOC_VERSION;
export const SEASON = '2026/27';
export const ADMIN_EMAIL = 'admin@hb-talents.com';
export const ADMIN_PASSWORD = 'HB-Admin-2026!';
export const DEMO_PARENT = { id: 'amra.hodzic', pw: 'Demo-Parent-2026' };
export const DEMO_ADULT = { id: 'ema.kovac', pw: 'Demo-Player-2026' };
export const LOG_RETENTION_DAYS = 365;
const DAY = 86400000;

const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const blank = () => ({
  users: [], players: [], consents: [], codes: [], mail: [], logs: [], throttle: {}, requests: [], messages: [],
  overrides: {}, content: {}, ads: [], events: [], announcements: [], visits: { days: {}, pages: {}, funnel: { started: 0, finished: 0 } },
  seeded: false
});

function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export let db = load() || blank();
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full or blocked: keep in memory */ }
}
export function resetAll() {
  try { localStorage.removeItem(KEY); sessionStorage.removeItem(SKEY); localStorage.removeItem('hbb.draft'); } catch { /* ignore */ }
  db = blank();
  memSession = null;
}

export const uid = (p = 'id') => p + '_' + hex(crypto.getRandomValues(new Uint8Array(6)));
export const norm = e => String(e || '').trim().toLowerCase();

/* ---------- crypto ---------- */
export async function hashPassword(pw, salt) {
  salt = salt || hex(crypto.getRandomValues(new Uint8Array(16)));
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 120000 }, key, 256);
  return { salt, hash: hex(bits) };
}
export async function verifyPassword(pw, rec) {
  if (!rec) return false;
  const { hash } = await hashPassword(pw, rec.salt);
  return safeEqual(hash, rec.hash);
}
async function sha(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/* ---------- session ---------- */
let memSession = null;
export const session = {
  get() { try { return JSON.parse(sessionStorage.getItem(SKEY)) || memSession; } catch { return memSession; } },
  set(v) { memSession = v; try { sessionStorage.setItem(SKEY, JSON.stringify(v)); } catch { /* ignore */ } },
  patch(v) { this.set({ ...(this.get() || {}), ...v }); },
  clear() { memSession = null; try { sessionStorage.removeItem(SKEY); } catch { /* ignore */ } }
};
// signed-in parent or adult player (fully verified, declarations done)
export function currentUser() {
  const s = session.get();
  if (!s?.userId || !s.auth) return null;
  const u = userById(s.userId);
  return u && u.role !== 'admin' && u.status !== 'inactive' ? u : null;
}
export function currentAdmin() {
  const s = session.get();
  if (!s?.adminId || !s.mfa) return null;
  if (s.adminSeen && Date.now() - s.adminSeen > ADMIN_IDLE) return null;
  return userById(s.adminId);
}
export const ADMIN_IDLE = 15 * 60 * 1000;

/* ---------- one-time codes ---------- */
const CODE_TTL = 15 * 60 * 1000;
const CODE_TRIES = 5;
const RESEND_GAP = 30 * 1000;
const RESEND_PER_HOUR = 5;
export async function issueCode(userId, purpose) {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  const code = String(n).padStart(6, '0');
  const prev = db.codes.find(c => c.userId === userId && c.purpose === purpose);
  const sends = (prev?.sends || []).filter(t => Date.now() - t < 3600000);
  db.codes = db.codes.filter(c => c !== prev);
  db.codes.push({ userId, purpose, hash: await sha(code + ':' + userId), exp: Date.now() + CODE_TTL, tries: 0, sends: [...sends, Date.now()] });
  save();
  return code;
}
// seconds until a new code may be sent, or -1 when the hourly limit is reached
export function resendWait(userId, purpose) {
  const c = db.codes.find(x => x.userId === userId && x.purpose === purpose);
  if (!c) return 0;
  const sends = c.sends.filter(t => Date.now() - t < 3600000);
  if (sends.length >= RESEND_PER_HOUR) return -1;
  return Math.max(0, Math.ceil((sends[sends.length - 1] + RESEND_GAP - Date.now()) / 1000));
}
export async function checkCode(userId, purpose, code) {
  const c = db.codes.find(x => x.userId === userId && x.purpose === purpose && x.hash);
  if (!c) return { ok: false, key: 'codeNone' };
  if (Date.now() > c.exp) return { ok: false, key: 'codeExpired' };
  if (c.tries >= CODE_TRIES) return { ok: false, key: 'codeLocked' };
  if (!safeEqual(await sha(code + ':' + userId), c.hash)) {
    c.tries++; save();
    const left = CODE_TRIES - c.tries;
    return left > 0 ? { ok: false, key: 'codeWrong', n: left } : { ok: false, key: 'codeLocked' };
  }
  c.hash = null; // single use; keep the send history for the resend limit
  save();
  return { ok: true };
}

/* ---------- login throttling ---------- */
export function lockedFor(id) {
  const t = db.throttle[norm(id)];
  return t && t.until > Date.now() ? Math.ceil((t.until - Date.now()) / 1000) : 0;
}
export function loginFailed(id, actor = 'Unknown') {
  const k = norm(id);
  const t = db.throttle[k] || { fails: 0, until: 0 };
  t.fails++;
  log('login_fail', actor, `Failed sign-in for "${k}"`);
  if (t.fails >= 5) { t.until = Date.now() + 60 * 1000; t.fails = 0; }
  db.throttle[k] = t; save();
  return 5 - t.fails;
}
export function loginOk(id) { delete db.throttle[norm(id)]; save(); }

/* ---------- logs (section 8.10) ---------- */
export const LOG_TYPES = {
  account: 'Account created', verify: 'Email verified', player: 'Player registered', profile: 'Profile changed',
  consent: 'Consent changed', delete: 'Profile deleted', admin: 'Administrative action', login_fail: 'Failed sign-in', access: 'Data access'
};
export function log(type, actor, text) {
  db.logs.unshift({ at: Date.now(), type, actor, text });
  const cut = Date.now() - LOG_RETENTION_DAYS * DAY;
  db.logs = db.logs.filter(l => l.at > cut).slice(0, 2000);
  save();
}

/* ---------- queries ---------- */
export const userById = id => db.users.find(u => u.id === id);
export const userByLogin = s => db.users.find(u => u.email === norm(s) || u.username === norm(s));
export const userByEmail = e => db.users.find(u => u.email === norm(e));
export const playersOf = uid => db.players.filter(p => p.parentId === uid || p.userId === uid);
export const playerById = id => db.players.find(p => p.id === id);
export const consentsOf = ({ userId, playerId }) => db.consents
  .filter(c => (userId ? c.userId === userId : true) && (playerId ? c.playerId === playerId : true))
  .sort((a, b) => b.at - a.at);
export const playerConsent = pid => db.consents.filter(c => c.playerId === pid && c.type === 'player').sort((a, b) => b.at - a.at)[0];
export function consentState(pid) {
  const c = playerConsent(pid);
  return !c ? 'missing' : c.status === 'given' ? 'given' : 'withdrawn';
}
export const displayName = u => `${u.first} ${u.last}`;
export const birthYear = p => +String(p.birth).slice(0, 4);
export function day(v) {
  const m = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
}
export function groupOf(p) {
  const y = birthYear(p);
  return y < 2008 ? ADULT_GROUP : y <= 2009 ? '2008 / 2009' : y <= 2011 ? '2010 / 2011' : '2012 / 2013';
}
export function ageOn(birth, at = new Date()) {
  const d = day(birth);
  let a = at.getFullYear() - d.getFullYear();
  if (at.getMonth() < d.getMonth() || (at.getMonth() === d.getMonth() && at.getDate() < d.getDate())) a--;
  return a;
}
export function eighteenth(birth) {
  const d = day(birth);
  return new Date(d.getFullYear() + 18, d.getMonth(), d.getDate()).getTime();
}
// shown status of a player profile (section 8.3 "profile status")
export function playerStatus(p) {
  if (p.status === 'inactive') return 'inactive';
  const owner = userById(p.parentId || p.userId);
  if (!owner || !owner.verified) return 'unverified';
  if (consentState(p.id) !== 'given') return 'noconsent';
  return 'active';
}

export function deletePlayer(pid, actor, reason = '') {
  const p = playerById(pid);
  if (!p) return;
  db.players = db.players.filter(x => x.id !== pid);
  // consent records are kept (anonymised) for the legal retention period
  db.consents.filter(c => c.playerId === pid).forEach(c => { c.playerName = 'Deleted profile'; c.deletedAt = Date.now(); });
  db.events.forEach(e => { e.invited = e.invited.filter(x => x !== pid); delete e.answers[pid]; });
  log('delete', actor, `Deleted player profile ${p.id}${reason ? ` (${reason})` : ''}`);
  save();
}
export function deleteAccount(userId, actor) {
  playersOf(userId).forEach(p => deletePlayer(p.id, actor));
  db.users = db.users.filter(u => u.id !== userId);
  db.codes = db.codes.filter(c => c.userId !== userId);
  db.consents.filter(c => c.userId === userId).forEach(c => { c.deletedAt = Date.now(); });
  log('delete', actor, `Deleted account ${userId}`);
  save();
}

export function exportFor(userId) {
  const u = userById(userId);
  const clean = p => { const { parentId, userId: _u, ...rest } = p; return rest; };
  return {
    exported_at: new Date().toISOString(),
    account: { type: u.role, first_name: u.first, last_name: u.last, username: u.username, email: u.email, date_of_birth: u.birth, country_of_residence: u.residence, language: u.lang, created_at: new Date(u.createdAt).toISOString(), email_verified: u.verified },
    players: playersOf(userId).map(clean),
    declarations_and_consents: consentsOf({ userId }).map(c => ({ type: c.type, player_id: c.playerId || null, document_version: c.version, language: c.lang, status: c.status, given_at: new Date(c.at).toISOString(), withdrawn_at: c.withdrawnAt ? new Date(c.withdrawnAt).toISOString() : null }))
  };
}

/* ---------- visits (Option B statistics, no cookies, aggregated) ---------- */
export function trackVisit(page) {
  const d = new Date().toISOString().slice(0, 10);
  db.visits.days[d] = (db.visits.days[d] || 0) + 1;
  db.visits.pages[page] = (db.visits.pages[page] || 0) + 1;
  save();
}

/* ---------- seed: fictional players, parents and history ---------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FIRST_F = ['Lejla', 'Ema', 'Sara', 'Amina', 'Lana', 'Mia', 'Ajla', 'Nika', 'Hana', 'Ena', 'Tea', 'Iva', 'Jovana', 'Milica', 'Ana', 'Lea', 'Elira', 'Arta', 'Dua', 'Teodora', 'Marija', 'Una', 'Dina', 'Klea'];
const FIRST_M = ['Amar', 'Luka', 'Adin', 'Filip', 'Marko', 'Kenan', 'Ivan', 'Stefan', 'Nikola', 'Dino', 'Tarik', 'Petar', 'Arber', 'Leon', 'David', 'Vuk', 'Eldin', 'Ensar', 'Andrej', 'Bojan', 'Arian', 'Mateo'];
const LAST = ['Hadžić', 'Kovač', 'Petrović', 'Jurić', 'Begić', 'Babić', 'Marić', 'Novak', 'Jovanović', 'Hoxha', 'Krasniqi', 'Delić', 'Mehmedović', 'Popović', 'Horvat', 'Vuković', 'Stojanovski', 'Berisha', 'Šarić', 'Ilić', 'Đukić', 'Nikolić', 'Kurti', 'Trajkovski', 'Omerović', 'Radović', 'Gashi', 'Knežević'];
const PARENT_F = ['Amra', 'Selma', 'Jasmina', 'Vesna', 'Maja', 'Dragana', 'Ivana', 'Merita', 'Biljana', 'Alma', 'Snježana', 'Elma'];
const PARENT_M = ['Emir', 'Goran', 'Dario', 'Zoran', 'Nenad', 'Edin', 'Blerim', 'Dejan', 'Mirza', 'Igor', 'Ilir', 'Saša'];
const RES = [['NO', 9], ['DE', 8], ['AT', 5], ['CH', 4], ['SE', 4], ['DK', 2], ['BA', 4], ['HR', 3], ['RS', 3], ['ME', 1], ['MK', 1], ['AL', 1], ['XK', 1], ['SI', 2], ['NL', 1], ['US', 1]];
const CLUBS = { NO: ['Larvik HK', 'Kolstad Håndball', 'Elverum Håndball', 'Bækkelaget HK', 'Fana IL'], DE: ['THW Kiel Jugend', 'SG Flensburg', 'HSG Wetzlar', 'TuS Metzingen', 'Füchse Berlin'], AT: ['Hypo NÖ', 'HC Fivers', 'Bregenz Handball'], CH: ['Kadetten Schaffhausen', 'Pfadi Winterthur'], SE: ['IK Sävehof', 'Ystads IF'], DK: ['Aalborg Håndbold', 'GOG'], BA: ['RK Bosna', 'RK Izviđač', 'ŽRK Grude'], HR: ['RK Zagreb', 'RK Podravka', 'RK Nexe'], RS: ['RK Vojvodina', 'ŽRK Radnički'], ME: ['ŽRK Budućnost', 'RK Lovćen'], MK: ['RK Vardar', 'ŽRK Metalurg'], AL: ['KH Tirana'], XK: ['KH Prishtina'], SI: ['RK Celje', 'RK Krim'], NL: ['Hurry-Up'], US: ['NYC Handball'] };
const PLACES = { BA: ['Sarajevo', 'Tuzla', 'Mostar', 'Zenica', 'Bihać'], HR: ['Zagreb', 'Split', 'Osijek', 'Rijeka'], RS: ['Beograd', 'Novi Sad', 'Niš'], ME: ['Podgorica', 'Nikšić'], MK: ['Skopje', 'Bitola'], AL: ['Tirana', 'Durrës'], XK: ['Prishtinë', 'Prizren'], NO: ['Oslo', 'Bergen', 'Stavanger', 'Trondheim'], DE: ['München', 'Stuttgart', 'Berlin', 'Frankfurt'], AT: ['Wien', 'Graz', 'Linz'], CH: ['Zürich', 'Basel'], SE: ['Göteborg', 'Malmö'], DK: ['Aarhus', 'Odense'], SI: ['Ljubljana'], NL: ['Rotterdam'], US: ['Chicago'] };
const LANG_FOR = { BA: 'bs', HR: 'hr', RS: 'sr', ME: 'cnr', MK: 'mk', AL: 'sq', XK: 'sq-XK' };

export async function ensureSeed() {
  if (db.seeded) return;
  const r = rng(20261030);
  const pick = a => a[Math.floor(r() * a.length)];
  const weighted = list => { const tot = list.reduce((s, [, w]) => s + w, 0); let x = r() * tot; for (const [v, w] of list) { if ((x -= w) < 0) return v; } return list[0][0]; };
  const now = Date.now();
  const sharedParent = await hashPassword(DEMO_PARENT.pw);
  const sharedAdult = await hashPassword(DEMO_ADULT.pw);
  const admin = await hashPassword(ADMIN_PASSWORD);
  db.users.push({ id: 'admin', role: 'admin', first: 'Platform', last: 'Administrator', email: ADMIN_EMAIL, username: 'admin', pw: admin, verified: true, status: 'active', createdAt: now - 90 * DAY, lang: 'bs' });

  // registration timestamps: a few today, more in the last week, rest spread over 60 days
  const when = i => {
    if (i < 3) return now - (1 + i * 2) * 3600000;
    if (i < 10) return now - (1 + r() * 6) * DAY;
    return now - (7 + r() * 53) * DAY;
  };
  const addConsents = (userId, at, l, guardian) => {
    db.consents.push({ id: uid('k'), userId, playerId: null, type: guardian ? 'guardian' : 'self', version: DOC_VERSION, lang: l, at, status: 'given' });
    db.consents.push({ id: uid('k'), userId, playerId: null, type: 'terms', version: DOC_VERSION, lang: l, at, status: 'given' });
    db.consents.push({ id: uid('k'), userId, playerId: null, type: 'privacy', version: DOC_VERSION, lang: l, at, status: 'given' });
    if (r() > .35) db.consents.push({ id: uid('k'), userId, playerId: null, type: 'federation', version: DOC_VERSION, lang: l, at, status: 'given' });
  };
  const makePlayer = (owner, kind, gender, birthYear, at, l) => {
    const res = owner.residence;
    const origin = pick(ORIGIN);
    const bornHome = r() > .55;
    const birthCountry = bornHome ? origin : res;
    const citizens = [origin];
    if (!ORIGIN.includes(res) && r() > .45) citizens.push(res);
    if (r() > .85) citizens.push(pick(ORIGIN.filter(o => o !== origin)));
    const potential = r() > .5 ? [pick(ORIGIN.filter(o => !citizens.includes(o)))] : [];
    const first = gender === 'F' ? pick(FIRST_F) : pick(FIRST_M);
    const m = 1 + Math.floor(r() * 12), d = 1 + Math.floor(r() * 28);
    const posCount = r() > .7 ? 2 : 1;
    const positions = [];
    while (positions.length < posCount) { const x = Math.floor(r() * 7); if (!positions.includes(x)) positions.push(x); }
    const p = {
      id: 'P' + String(1000 + db.players.length + 1), kind, parentId: kind === 'minor' ? owner.id : null, userId: kind === 'adult' ? owner.id : null,
      name: `${first} ${owner.last}`, gender, birth: `${birthYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      place: pick(PLACES[birthCountry] || ['—']), birthCountry, residence: res, citizens: [...new Set(citizens)], potential,
      basis: potential.length ? pick(['mother', 'father', 'both']) : 'na',
      parent1: kind === 'minor' ? displayName(owner) : '', phone1: kind === 'minor' ? '+47 4' + Math.floor(1e6 + r() * 8e6) : '', email1: kind === 'minor' ? owner.email : '',
      parent2: '', phone2: '', email2: '', phone: kind === 'adult' ? '+49 15' + Math.floor(1e7 + r() * 8e7) : '',
      club: pick(CLUBS[res] || ['Demo HC']), clubEmail: '', hand: r() > .78 ? 'L' : 'R', positions,
      status: 'active', createdAt: at, updatedAt: at, seasonCheck: r() > .5 ? SEASON : null
    };
    db.players.push(p);
    db.consents.push({ id: uid('k'), userId: owner.id, playerId: p.id, type: 'player', version: DOC_VERSION, lang: l, at, status: 'given' });
    return p;
  };

  // the demo parent used in the walkthrough
  const amra = { id: uid('u'), role: 'parent', first: 'Amra', last: 'Hodžić', birth: '1984-05-14', email: 'amra.hodzic@example.com', username: 'amra.hodzic', residence: 'NO', lang: 'bs', pw: sharedParent, verified: true, status: 'active', createdAt: now - 20 * DAY, twofa: false, devices: [{ name: 'Chrome · Windows', at: now - 20 * DAY }] };
  db.users.push(amra);
  addConsents(amra.id, amra.createdAt, 'bs', true);
  const a1 = makePlayer(amra, 'minor', 'F', 2011, amra.createdAt + 3600000, 'bs');
  a1.name = 'Lejla Hodžić'; a1.citizens = ['BA', 'NO']; a1.potential = ['HR']; a1.basis = 'mother'; a1.birthCountry = 'NO'; a1.place = 'Oslo'; a1.club = 'Bækkelaget HK'; a1.positions = [3]; a1.hand = 'L'; a1.seasonCheck = null;
  const a2 = makePlayer(amra, 'minor', 'M', 2008, amra.createdAt + 7200000, 'bs');
  a2.name = 'Tarik Hodžić'; a2.birth = '2008-12-02'; a2.citizens = ['BA', 'NO']; a2.potential = []; a2.basis = 'na'; a2.birthCountry = 'BA'; a2.place = 'Sarajevo'; a2.club = 'Bækkelaget HK'; a2.positions = [6]; a2.seasonCheck = SEASON;

  let i = 0;
  for (let n = 0; n < 44; n++, i++) {
    const res = weighted(RES);
    const female = r() > .5;
    const first = female ? pick(PARENT_F) : pick(PARENT_M);
    const last = pick(LAST);
    const l = LANG_FOR[res] || pick(['bs', 'bs', 'hr', 'sr', 'en', 'sq']);
    const at = when(i);
    const username = norm(`${first}.${last}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')) + (n > 20 ? n : '');
    const verified = r() > .12;
    const u = { id: uid('u'), role: 'parent', first, last, birth: `${1972 + Math.floor(r() * 16)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`, email: `${username}@example.com`, username, residence: res, lang: l, pw: sharedParent, verified, status: 'active', createdAt: at, twofa: false, devices: [] };
    db.users.push(u);
    if (!verified) continue;
    addConsents(u.id, at, l, true);
    const kids = r() > .72 ? 2 : 1;
    for (let k = 0; k < kids; k++) {
      const y = 2009 + Math.floor(r() * 5);
      makePlayer(u, 'minor', r() > .5 ? 'F' : 'M', y, at + (k + 1) * 1800000 + (k ? Math.floor(r() * 5) * DAY : 0), l);
    }
  }
  // adult players (born 2008, already 18)
  const ema = { id: uid('u'), role: 'adult', first: 'Ema', last: 'Kovač', birth: '2008-02-04', email: 'ema.kovac@example.com', username: 'ema.kovac', residence: 'DE', lang: 'hr', pw: sharedAdult, verified: true, status: 'active', createdAt: now - 9 * DAY, twofa: false, devices: [{ name: 'Safari · iPhone', at: now - 9 * DAY }] };
  db.users.push(ema);
  addConsents(ema.id, ema.createdAt, 'hr', false);
  const ep = makePlayer(ema, 'adult', 'F', 2008, ema.createdAt + 600000, 'hr');
  ep.name = 'Ema Kovač'; ep.birth = '2008-02-04'; ep.citizens = ['HR', 'BA']; ep.club = 'TuS Metzingen'; ep.positions = [5];
  for (let n = 0; n < 7; n++, i++) {
    const res = weighted(RES);
    const gender = r() > .5 ? 'F' : 'M';
    const first = gender === 'F' ? pick(FIRST_F) : pick(FIRST_M);
    const last = pick(LAST);
    const username = norm(`${first}.${last}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')) + '08';
    const at = when(i);
    const u = { id: uid('u'), role: 'adult', first, last, birth: `2008-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`, email: `${username}@example.com`, username, residence: res, lang: LANG_FOR[res] || 'en', pw: sharedAdult, verified: true, status: 'active', createdAt: at, twofa: false, devices: [] };
    db.users.push(u);
    addConsents(u.id, at, u.lang, false);
    const p = makePlayer(u, 'adult', gender, 2008, at + 900000, u.lang);
    p.name = `${first} ${last}`; p.birth = u.birth;
  }
  // a few realistic exceptions for the admin views
  db.players[7].status = 'inactive';
  const wd = db.consents.find(c => c.playerId === db.players[12].id);
  if (wd) { wd.status = 'withdrawn'; wd.withdrawnAt = now - 3 * DAY; }

  db.requests.push({ id: uid('r'), userId: db.users[6].id, type: 'correction', text: 'The club of my daughter changed to RK Zagreb this summer.', at: now - 2 * DAY, status: 'open' });
  db.requests.push({ id: uid('r'), userId: db.users[11].id, type: 'deletion', text: 'Please delete our account, we moved back home.', at: now - 1 * DAY, status: 'open' });
  db.messages.push({ id: uid('q'), name: 'Selma Begić', email: 'selma.begic@example.com', type: 'parent', body: 'Can I register my son who plays in Austria but lives in Germany?', at: now - 5 * 3600000, read: false });
  db.messages.push({ id: uid('q'), name: 'Coach M. Larsen', email: 'm.larsen@example.no', type: 'external', body: 'We organise a youth tournament in Oslo in March. Can we put information on the platform?', at: now - 2 * DAY, read: true });

  db.ads = [
    { id: 'ad1', slot: 1, title: 'REKLAMNI PROSTOR 1', desc: 'Vaša reklama ovdje', button: 'Saznaj više', url: '', image: '', active: true, from: '', to: '' },
    { id: 'ad2', slot: 2, title: 'REKLAMNI PROSTOR 2', desc: 'Vaša reklama ovdje', button: 'Saznaj više', url: '', image: '', active: true, from: '', to: '' }
  ];
  db.content.posts = [{ id: uid('n'), title: { en: 'Registration for 2026/27 is open', bs: 'Registracija za 2026/27 je otvorena' }, body: { en: 'Parents can now register players born 2008 to 2013.', bs: 'Roditelji sada mogu registrovati igrače rođene od 2008. do 2013.' }, at: now - 6 * DAY, active: true }];

  // Option B demo content
  const girls2011 = db.players.filter(p => p.gender === 'F' && birthYear(p) >= 2010 && birthYear(p) <= 2011).slice(0, 14).map(p => p.id);
  if (!girls2011.includes(a1.id)) girls2011.push(a1.id);
  const ans = {};
  girls2011.forEach((id, n) => { if (id !== a1.id && n % 3 !== 2) ans[id] = n % 4 === 3 ? 'no' : 'yes'; });
  db.events.push({ id: uid('e'), title: 'Talent camp 2010/11 girls', place: 'Sarajevo', date: new Date(now + 24 * DAY).toISOString().slice(0, 10), group: '2010 / 2011', invited: girls2011, answers: ans, createdAt: now - 4 * DAY });
  db.announcements.push({ id: uid('a'), subject: 'Welcome to season 2026/27', filter: 'All parents and players', count: 0, at: now - 6 * DAY });

  for (let d = 0; d < 30; d++) {
    const day = new Date(now - d * DAY).toISOString().slice(0, 10);
    db.visits.days[day] = Math.round(60 + r() * 90 + (d < 7 ? 40 : 0));
  }
  db.visits.pages = { home: 2140, parents: 820, register: 610, about: 380, login: 540, contact: 120 };
  db.visits.funnel = { started: 188, finished: 141 };

  db.logs.push({ at: now - 1 * DAY, type: 'admin', actor: 'System', text: 'Nightly database backup completed (encrypted, kept 30 days)' });
  db.logs.push({ at: now - 2 * DAY, type: 'admin', actor: 'Administrator', text: 'Exported 18 players to CSV (filters: residence Norway)' });
  db.seeded = true;
  save();
}
