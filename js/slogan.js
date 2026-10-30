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
export function layoutSlogan(box, el, cfg = sloganCfg(), mode) {
  const W = box.clientWidth, H = box.clientHeight;
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
  const run = () => layoutSlogan(box, el);
  const ro = new ResizeObserver(run);
  ro.observe(box);
  document.fonts?.ready.then(run);
  run();
  return () => ro.disconnect();
}
