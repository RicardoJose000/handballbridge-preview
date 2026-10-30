// Small SVG charts for the Option B dashboard. No libraries, no tracking.
import { esc } from './ui.js';

export function barsV(items, { h = 160, color = '#E7B953' } = {}) {
  const max = Math.max(1, ...items.map(i => i.v));
  const w = 100 / items.length;
  return `<svg class="chart" viewBox="0 0 100 ${h / 2}" preserveAspectRatio="none" role="img">
    ${items.map((it, n) => { const bh = (it.v / max) * (h / 2 - 12); return `<rect class="bar" x="${n * w + w * .18}" y="${h / 2 - 10 - bh}" width="${w * .64}" height="${bh}" rx=".8" fill="${color}"><title>${esc(it.l)}: ${it.v}</title></rect>`; }).join('')}
  </svg><div class="chart-x">${items.map(i => `<span>${esc(i.l)}</span>`).join('')}</div>`;
}

export function line(points, { h = 70 } = {}) {
  const max = Math.max(1, ...points), n = points.length - 1 || 1;
  const xy = points.map((v, i) => [(i / n) * 100, h - 4 - (v / max) * (h - 12)]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  return `<svg class="chart line" viewBox="0 0 100 ${h}" preserveAspectRatio="none" role="img">
    <defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E7B953" stop-opacity=".45"/><stop offset="1" stop-color="#E7B953" stop-opacity="0"/></linearGradient></defs>
    <path d="${d} L100 ${h} L0 ${h} Z" fill="url(#lg)"/><path class="ln" d="${d}" fill="none" stroke="#E7B953" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}

export function donut(parts) {
  const tot = Math.max(1, parts.reduce((s, p) => s + p.v, 0));
  let a = 0;
  const R = 42, C = 2 * Math.PI * R;
  return `<div class="donut"><svg viewBox="0 0 100 100" role="img"><circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(8,23,53,.07)" stroke-width="12"/>
    ${parts.map(p => { const len = (p.v / tot) * C; const s = `<circle class="seg" cx="50" cy="50" r="${R}" fill="none" stroke="${p.c}" stroke-width="12" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-a}" transform="rotate(-90 50 50)"><title>${esc(p.l)}: ${p.v}</title></circle>`; a += len; return s; }).join('')}
    <text x="50" y="49" text-anchor="middle" class="dn-v">${tot}</text><text x="50" y="61" text-anchor="middle" class="dn-l">total</text></svg>
    <ul>${parts.map(p => `<li><i style="background:${p.c}"></i>${esc(p.l)}<b>${p.v}</b></li>`).join('')}</ul></div>`;
}

// tile map of Europe: one square per country, shade = registrations
const GRID = {
  IS: [1, 0], NO: [5, 0], SE: [6, 0], FI: [7, 0],
  IE: [1, 1], GB: [2, 1], DK: [5, 1], EE: [7, 1],
  NL: [3, 2], DE: [4, 2], PL: [5, 2], LV: [7, 2], BY: [8, 2],
  BE: [3, 3], LU: [4, 3], CZ: [5, 3], SK: [6, 3], LT: [7, 3], UA: [8, 3],
  FR: [2, 4], CH: [3, 4], AT: [4, 4], HU: [5, 4], RO: [6, 4], MD: [7, 4],
  PT: [0, 5], ES: [1, 5], IT: [3, 5], SI: [4, 5], HR: [5, 5], RS: [6, 5], BG: [7, 5],
  BA: [5, 6], XK: [6, 6], MK: [7, 6], MT: [3, 6],
  ME: [5, 7], AL: [6, 7], GR: [7, 7], TR: [8, 7]
};
export function tileMap(counts, name) {
  const max = Math.max(1, ...Object.values(counts));
  const S = 46, G = 4;
  const tiles = Object.entries(GRID).map(([c, [x, y]]) => {
    const v = counts[c] || 0;
    const k = v ? .22 + .78 * (v / max) : 0;
    return `<g class="tile${v ? ' has' : ''}" transform="translate(${x * (S + G)} ${y * (S + G)})"><rect width="${S}" height="${S}" rx="7" fill="${v ? `rgba(231,185,83,${k.toFixed(2)})` : 'rgba(255,255,255,.06)'}"/>
      <text x="${S / 2}" y="${v ? 20 : 28}" text-anchor="middle" class="tc">${c}</text>${v ? `<text x="${S / 2}" y="36" text-anchor="middle" class="tv">${v}</text>` : ''}<title>${esc(name(c))}: ${v}</title></g>`;
  }).join('');
  const other = Object.entries(counts).filter(([c]) => !GRID[c]).reduce((s, [, v]) => s + v, 0);
  return `<svg class="tilemap" viewBox="-4 -4 ${9 * (S + G) + 8} ${8 * (S + G) + 8}" role="img" aria-label="Registrations by country">${tiles}</svg>${other ? `<p class="tm-other">Outside Europe: <b>${other}</b></p>` : ''}`;
}
