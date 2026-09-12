// Generates print/contact-qr.svg (vector, logo-embedded) and print/contact-qr.png
// (preview). Encodes ONLY the permanent CARD_URL (spec §3/§13).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { CARD_URL } from './contact.config.mjs';
import { buildQrSvg } from './lib/qr.mjs';
import { svgToPng } from './lib/rasterize.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = resolve(root, 'assets/autarqui-isotipo.svg');
mkdirSync(resolve(root, 'print'), { recursive: true });

// Standalone SVG at a print size (~28mm) for direct use.
const svgSized = buildQrSvg({ url: CARD_URL, logoPath, sizeAttr: '28mm', logoAreaRatio: 0.06 });
writeFileSync(resolve(root, 'print/contact-qr.svg'), svgSized + '\n', 'utf8');
console.log('✓ print/contact-qr.svg (28mm, EC=H, Autarqui logo)');

// Unsized copy (viewBox only) for the PNG preview render.
const svgFlex = buildQrSvg({ url: CARD_URL, logoPath, logoAreaRatio: 0.06 });
await svgToPng(svgFlex, { width: 1200, background: '#ffffff', out: resolve(root, 'print/contact-qr.png') });
console.log('✓ print/contact-qr.png (1200px preview)');
console.log(`  encodes: ${CARD_URL}`);
