// Consent PDF in the user's language. Noto Sans is embedded so č, ć, đ, ë and Cyrillic print correctly.
import { t, consentText, country, fmtD, fmtDT } from './i18n.js';
import { db, docVersion, groupOf, userById } from './store.js';

let fontsB64 = null;
async function fonts() {
  if (fontsB64) return fontsB64;
  const get = async f => {
    const buf = await (await fetch(`assets/fonts/${f}`)).arrayBuffer();
    let s = ''; const b = new Uint8Array(buf);
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  };
  fontsB64 = { r: await get('hb-Regular.ttf'), b: await get('hb-Bold.ttf'), i: await get('hb-Italic.ttf') };
  return fontsB64;
}

const TYPES = { guardian: 'ctGuardian', self: 'ctSelf', terms: 'ctTerms', privacy: 'ctPrivacy', federation: 'ctFed', player: 'ctPlayer' };

export async function consentPdf(player, l) {
  const J = window.jspdf?.jsPDF;
  const owner = userById(player.parentId || player.userId);
  l = l || owner?.lang || 'en';
  const adult = player.kind === 'adult';
  const cons = db.consents.filter(c => c.userId === owner.id && (c.playerId === player.id || !c.playerId)).sort((a, b) => a.at - b.at);
  const main = cons.find(c => c.playerId === player.id && c.type === 'player') || cons[cons.length - 1];
  if (!J) return 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(consentText({ parent: owner.first + ' ' + owner.last, player: player.name, adult }, l))));

  const F = await fonts();
  const doc = new J({ unit: 'mm', format: 'a4' });
  doc.addFileToVFS('hb-r.ttf', F.r); doc.addFont('hb-r.ttf', 'hb', 'normal');
  doc.addFileToVFS('hb-b.ttf', F.b); doc.addFont('hb-b.ttf', 'hb', 'bold');
  doc.addFileToVFS('hb-i.ttf', F.i); doc.addFont('hb-i.ttf', 'hb', 'italic');
  const W = 210, M = 20;
  const navy = [8, 23, 53], gold = [231, 185, 83], muted = [102, 116, 138], line = [220, 227, 238];

  doc.setFillColor(...navy); doc.rect(0, 0, W, 46, 'F');
  doc.setFillColor(...gold); doc.rect(0, 46, W, 1.2, 'F');
  doc.setFont('hb', 'bold'); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
  doc.text('Handball', M, 17); doc.setTextColor(...gold); doc.text('Bridge', M + doc.getTextWidth('Handball'), 17);
  doc.setFont('hb', 'bold'); doc.setFontSize(21); doc.setTextColor(255, 255, 255);
  doc.text(t('pdfTitle', null, l), M, 35);
  doc.setFont('hb', 'normal'); doc.setFontSize(8.5); doc.setTextColor(200, 212, 230);
  doc.text(`${t('profileId', null, l)} ${player.id}`, W - M, 15, { align: 'right' });
  doc.text(`${t('version', null, l)} ${main?.version || docVersion()}`, W - M, 20, { align: 'right' });

  let y = 62;
  const head = s => { doc.setFont('hb', 'bold'); doc.setFontSize(10.5); doc.setTextColor(176, 128, 26); doc.text(s.toUpperCase(), M, y); y += 7; };
  const pair = (label, value, x, yy) => {
    doc.setFont('hb', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...muted); doc.text(label, x, yy);
    doc.setFont('hb', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...navy); doc.text(String(value || '—'), x, yy + 5.2);
  };
  head(t('pdfPlayer', null, l));
  pair(t('qName', null, l), player.name, M, y); pair(t('birthDate', null, l), fmtD(player.birth, l), 100, y); pair(t('group', null, l), groupOf(player), 150, y);
  y += 14;
  pair(t('residence', null, l), country(player.residence, l), M, y); pair(t('qCitizens', null, l), player.citizens.map(c => country(c, l)).join(', '), 100, y);
  y += 16;
  head(adult ? t('stepAccount', null, l) : t('pdfGuardian', null, l));
  pair(t('fullName', null, l), `${owner.first} ${owner.last}`, M, y); pair(t('email', null, l), owner.email, 100, y);
  y += 15;
  doc.setDrawColor(...line); doc.line(M, y, W - M, y); y += 9;

  head(t('consentFor', null, l));
  doc.setFont('hb', 'normal'); doc.setFontSize(9.6); doc.setTextColor(30, 42, 62);
  consentText({ parent: `${owner.first} ${owner.last}`, player: player.name, adult }, l).split('\n\n').forEach(par => {
    const lines = doc.splitTextToSize(par, W - 2 * M);
    doc.text(lines, M, y); y += lines.length * 4.6 + 3;
  });
  y += 3;
  head(t('pdfDeclarations', null, l));
  cons.forEach(c => {
    const ok = c.status === 'given';
    doc.setFillColor(...(ok ? [47, 182, 124] : [229, 72, 77])); doc.circle(M + 1.6, y - 1.3, 1.6, 'F');
    doc.setFont('hb', 'bold'); doc.setFontSize(9.4); doc.setTextColor(...navy);
    doc.text(t(TYPES[c.type] || 'ctPlayer', null, l), M + 6, y);
    doc.setFont('hb', 'normal'); doc.setFontSize(8.6); doc.setTextColor(...muted);
    doc.text(`${ok ? t('cGiven', null, l) : t('cWithdrawn', null, l)} · ${fmtDT(c.at, l)} · ${t('version', null, l)} ${c.version}`, W - M, y, { align: 'right' });
    y += 6.4;
  });
  y += 5;
  doc.setFontSize(8.6); doc.setTextColor(...muted);
  const rights = doc.splitTextToSize(t('pdfRights', null, l).replace(/→/g, '>'), W - 2 * M);
  doc.text(rights, M, y); y += rights.length * 4.2 + 8;

  doc.setFillColor(242, 245, 250); doc.roundedRect(M, y, W - 2 * M, 30, 3, 3, 'F');
  doc.setFont('hb', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...muted);
  doc.text(t('pdfSigned', null, l).toUpperCase(), M + 7, y + 9); doc.text(t('pdfWhen', null, l).toUpperCase(), 128, y + 9);
  doc.setFont('hb', 'italic'); doc.setFontSize(17); doc.setTextColor(...navy);
  doc.text(`${owner.first} ${owner.last}`, M + 7, y + 21);
  doc.setFont('hb', 'bold'); doc.setFontSize(10.5);
  doc.text(fmtDT(main?.at || Date.now(), l), 128, y + 20);

  doc.setFont('hb', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...muted);
  doc.text('HandballBridge · hb-talents.com · noreply@hb-talents.com', M, 287);
  return doc.output('datauristring');
}
