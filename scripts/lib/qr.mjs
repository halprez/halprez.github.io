// Builds an SVG QR code that encodes ONLY the given URL (spec §3/§13), with a real
// Autarqui logo centred on a white patch. Error correction H, quiet zone >= 4 modules.
// Handles non-square logos (e.g. the vertical α + AUTARQUI.CO lockup): the white patch
// matches the logo aspect ratio and the covered area is kept small enough to scan.
import QRCode from 'qrcode';
import { readFileSync } from 'node:fs';

export function buildQrSvg({ url, logoPath, margin = 4, sizeAttr = null, logoAreaRatio = 0.10 }) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const dim = n + margin * 2;

  // One path for all dark modules (crisp, small file).
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (data[y * n + x]) d += `M${x + margin} ${y + margin}h1v1h-1z`;
    }
  }

  // Logo geometry (aspect-aware). Area stays ~logoAreaRatio of the QR regardless of shape.
  const logoRaw = readFileSync(logoPath, 'utf8');
  const vb = logoRaw.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
  const [, , lw, lh] = vb;
  const inner = logoRaw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

  const aspect = lw / lh;
  const side0 = dim * Math.sqrt(logoAreaRatio); // side of an equal-area square
  const logoW = side0 * Math.sqrt(aspect);
  const logoH = side0 / Math.sqrt(aspect);
  const pad = 1.5; // white margin around the logo (modules)
  const patchSide = Math.max(logoW, logoH) + pad * 2; // always a SQUARE patch
  const scale = logoW / lw; // == logoH / lh
  const tx = (dim - logoW) / 2;
  const ty = (dim - logoH) / 2;

  const sizeAttrs = sizeAttr ? ` width="${sizeAttr}" height="${sizeAttr}"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}"${sizeAttrs} shape-rendering="crispEdges" role="img" aria-label="QR: ${url}">` +
    `<rect width="${dim}" height="${dim}" fill="#ffffff"/>` +
    `<path d="${d}" fill="#000000"/>` +
    `<rect x="${(dim - patchSide) / 2}" y="${(dim - patchSide) / 2}" width="${patchSide}" height="${patchSide}" rx="0.6" fill="#ffffff"/>` +
    `<g transform="translate(${tx} ${ty}) scale(${scale})">${inner}</g>` +
    `</svg>`;
}
