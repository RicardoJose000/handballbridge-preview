// Places the slogan on the main image. Desktop and tablet use coordinates on the image itself,
// so the slogan stays on the same spot of the picture at any window size.
// Phone (Option B) keeps it above the title, like the current site.
import { db } from './store.js';
import { isB } from './plan.js';

export const IMG = { w: 1200, h: 697, posY: .52 };
// x, y, w: share of the drawn image. Defaults match the current hb-talents.com at 1440 x 900.
export const SLOGAN_DEFAULT = {
  desktop: { x: .630, y: .178, w: .288, rot: -10 },
  tablet: { x: .610, y: .150, w: .330, rot: -10 },
  mobile: { x: .05, y: 0, w: .82, rot: -10 }
};
export const sloganCfg = () => {
  const c = db.content.sloganPos || {};
  return { desktop: { ...SLOGAN_DEFAULT.desktop, ...c.desktop }, tablet: { ...SLOGAN_DEFAULT.tablet, ...c.tablet }, mobile: { ...SLOGAN_DEFAULT.mobile, ...c.mobile } };
};
export const modeFor = (W, b = isB()) => (b && W <= 650 ? 'mobile' : W <= 1100 ? 'tablet' : 'desktop');

// box: element that shows the image with background-size: cover; el: the .slogan element
export function layoutSlogan(box, el, cfg = sloganCfg(), mode, fixedH) {
  const W = box.clientWidth, H = fixedH || box.clientHeight;
  mode = mode || modeFor(W);
  const c = cfg[mode], inner = el.firstElementChild;
  el.dataset.mode = mode;
  if (mode === 'mobile') {
    Object.assign(el.style, { left: c.x * 100 + '%', top: c.y + 'px', width: c.w * 100 + '%' });
    inner.style.fontSize = '';
    inner.style.transform = `rotate(${c.rot}deg)`;
    return;
  }
  const s = Math.max(W / IMG.w, H / IMG.h), dw = IMG.w * s, dh = IMG.h * s;
  const ox = (W - dw) / 2, oy = (H - dh) * IMG.posY;
  // stay on the same spot of the picture, but never get cut at the screen edge
  const width = Math.min(c.w * dw, W * .42);
  const left = Math.max(12, Math.min(ox + c.x * dw, W - width - 24));
  Object.assign(el.style, { left: left + 'px', top: oy + c.y * dh + 'px', width: width + 'px' });
  inner.style.fontSize = (width * .0807).toFixed(2) + 'px';   // 36px at 446px width, as on the current site
  inner.style.transform = `rotate(${c.rot}deg)`;
}

// keeps the slogan in place while the window or the hero changes size
export function watchSlogan(box, el) {
  const body = box.querySelector('.hero-body');
  // size of the text itself, not of its full-width box
  const textRect = t => { const r = document.createRange(); r.selectNodeContents(t); return r.getBoundingClientRect(); };
  const sloganBottom = () => Math.max(...[...el.querySelectorAll('.slogan-in span')].map(s => s.getBoundingClientRect().bottom));
  const covers = () => {
    const ls = [...el.querySelectorAll('.slogan-in span')].map(s => s.getBoundingClientRect());
    const sb = { l: Math.min(...ls.map(r => r.left)), r: Math.max(...ls.map(r => r.right)), t: Math.min(...ls.map(r => r.top)), b: Math.max(...ls.map(r => r.bottom)) };
    return [...body.querySelectorAll('.eyebrow, h1 .l')].some(x => { const r = textRect(x); return r.left < sb.r && r.right > sb.l && r.top < sb.b && r.bottom > sb.t; });
  };
  let size = '';
  const fit = () => {
    if (body) body.style.paddingTop = '';
    layoutSlogan(box, el);
    if (!body || el.dataset.mode !== 'tablet') return;
    // on tablets the slogan could cover the title: then the title starts 18px below the slogan
    // one pass: the slogan keeps the place it had before the title moved, so nothing keeps shifting
    if (!covers()) return;
    const h0 = box.clientHeight;
    const gap = sloganBottom() + 18 - textRect(body.querySelector('.eyebrow')).top;
    body.style.paddingTop = Math.ceil(Math.max(gap, 8)) + 'px';
    layoutSlogan(box, el, undefined, undefined, h0);
  };
  const run = () => {
    if (box.clientWidth + 'x' + box.clientHeight === size) return;   // our own adjustment
    fit();
    size = box.clientWidth + 'x' + box.clientHeight;
  };
  const ro = new ResizeObserver(run);
  ro.observe(box);
  const again = () => { size = ''; run(); };
  document.fonts?.ready.then(again);
  run();
  const t = setTimeout(again, 2200);   // once more after the entrance animation
  return () => { ro.disconnect(); clearTimeout(t); };
}
