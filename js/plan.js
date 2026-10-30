// Demo switch between the two offers in the scope confirmation.
// Option A: the specification, desktop layout (phones see the desktop page zoomed out).
// Option B: the specification plus the eight extras, including the mobile version.
const PKEY = 'hbb.plan';
let plan = (() => {
  const q = new URLSearchParams(location.search).get('plan');
  if (q === 'a' || q === 'b') return q;
  try { const s = localStorage.getItem(PKEY); if (s === 'a' || s === 'b') return s; } catch { /* ignore */ }
  return 'a';
})();
const listeners = new Set();

export const isB = () => plan === 'b';
export const getPlan = () => plan;
export const onPlan = f => listeners.add(f);

export function applyPlan() {
  document.body.classList.toggle('plan-b', plan === 'b');
  document.body.classList.toggle('plan-a', plan === 'a');
  const vp = document.querySelector('meta[name=viewport]');
  vp.setAttribute('content', plan === 'b' ? 'width=device-width, initial-scale=1' : 'width=1280');
  const url = new URL(location.href);
  url.searchParams.set('plan', plan);
  history.replaceState(null, '', url);
}
export function setPlan(p) {
  if (p === plan || (p !== 'a' && p !== 'b')) return;
  plan = p;
  try { localStorage.setItem(PKEY, p); } catch { /* ignore */ }
  applyPlan();
  listeners.forEach(f => f(p));
}
