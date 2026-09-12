// Generates the printed-card deliverables (spec §4) — SVG-first, 100% vector:
//   print/business-card.svg          – self-contained vector master. QR + logo are
//                                       vector; the name/role/phone are OUTLINED to
//                                       paths with the real Lora/Poppins fonts, so the
//                                       typography is pixel-perfect in every renderer
//                                       (browser, librsvg, print RIP) with zero font deps.
//   print/business-card-print.pdf    – vector PDF via rsvg-convert (no rasterization)
//   print/business-card-preview.png  – high-res raster preview via rsvg-convert
// Layout: QR left (square, minimal Autarqui α embedded) / identity right (name/role/phone).
// Finished 85x55mm, 3mm bleed => 91x61mm document.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import opentype from 'opentype.js';
import { CONTACT as C, CARD_URL } from './contact.config.mjs';
import { buildQrSvg } from './lib/qr.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = resolve(root, 'assets/autarqui-isotipo.svg');
mkdirSync(resolve(root, 'print'), { recursive: true });

const BLEED = 3, TRIM_W = 85, TRIM_H = 55;
const DOC_W = TRIM_W + BLEED * 2; // 91
const DOC_H = TRIM_H + BLEED * 2; // 61
const SAFE = 2;                    // tight margin from trim to use more space
const QR_MM = 44;                  // enlarged QR (and embedded logo)

// --- Load the real brand fonts as static TTFs (Google Fonts v1 API) for outlining ---
async function loadFont(spec) {
  const css = await (await fetch(`https://fonts.googleapis.com/css?family=${spec}&subset=latin`)).text();
  const ttf = css.match(/url\((https:[^)]+\.ttf)\)/)[1];
  return opentype.parse(await (await fetch(ttf)).arrayBuffer());
}
const lora = await loadFont('Lora:600');
const poppins = await loadFont('Poppins');

// --- QR (square, minimal α embedded), inline & vector ---
const qrSvg = buildQrSvg({ url: CARD_URL, logoPath, logoAreaRatio: 0.06 });
const qrInner = qrSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const qrViewBox = qrSvg.match(/viewBox="([^"]+)"/)[1];

const qrX = BLEED + SAFE;
const qrY = (DOC_H - QR_MM) / 2;
const rightEdge = DOC_W - BLEED - SAFE;
const cy = DOC_H / 2;

// Right-aligned outlined text (coords in mm). Compose glyphs directly (with kerning)
// to bypass opentype.js's high-level feature engine, which chokes on this font's ccmp.
const line = (font, text, size, baselineY, fill) => {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  const kern = (i) => (i > 0 ? font.getKerningValue(glyphs[i - 1], glyphs[i]) * scale : 0);
  let width = 0;
  glyphs.forEach((g, i) => { width += kern(i) + g.advanceWidth * scale; });
  let penX = rightEdge - width;
  let d = '';
  glyphs.forEach((g, i) => {
    penX += kern(i);
    d += g.getPath(penX, baselineY, size).toPathData(3);
    penX += g.advanceWidth * scale;
  });
  return `<path d="${d}" fill="${fill}"/>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${DOC_W}mm" height="${DOC_H}mm" viewBox="0 0 ${DOC_W} ${DOC_H}">
  <rect width="${DOC_W}" height="${DOC_H}" fill="#ffffff"/>
  <svg x="${qrX}" y="${qrY}" width="${QR_MM}" height="${QR_MM}" viewBox="${qrViewBox}">${qrInner}</svg>
  ${line(lora, C.firstName, 7, cy - 6, '#000000')}
  ${line(lora, C.lastName, 7, cy + 1.5, '#000000')}
  ${line(poppins, C.title, 3.1, cy + 9, '#6e6e6e')}
  ${line(poppins, C.phoneDisplay, 3.1, cy + 14.5, '#1a1a1a')}
</svg>`;

const svgPath = resolve(root, 'print/business-card.svg');
writeFileSync(svgPath, svg + '\n', 'utf8');
console.log(`✓ print/business-card.svg (${DOC_W}x${DOC_H}mm, 100% vector, text outlined)`);

execFileSync('rsvg-convert', ['-f', 'pdf', '-o', resolve(root, 'print/business-card-print.pdf'), svgPath]);
console.log('✓ print/business-card-print.pdf (vector, via rsvg-convert)');
execFileSync('rsvg-convert', ['-f', 'png', '-w', '1400', '-o', resolve(root, 'print/business-card-preview.png'), svgPath]);
console.log('✓ print/business-card-preview.png (1400px, via rsvg-convert)');
