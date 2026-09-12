// Generates contact/alex-perez.vcf — vCard 4.0 (RFC 6350), UTF-8, CRLF line endings.
// No private data beyond what is intentionally public (spec §2/§14).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { CONTACT as C } from './contact.config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const lines = [
  'BEGIN:VCARD',
  'VERSION:4.0',
  `FN:${C.fullName}`,
  `N:${C.lastName};${C.firstName};;;`,
  `TITLE:${C.title}`,
  `TEL;TYPE=cell;VALUE=uri:tel:${C.phone}`,
  `EMAIL:${C.email}`,
  ...C.urls.map((u) => `URL:${u}`),
  `NOTE:${C.org}`,
  'END:VCARD',
];

// RFC 6350 mandates CRLF; trailing CRLF included. Prepend a UTF-8 BOM so importers
// that ignore the (uncontrollable, charset-less) HTTP Content-Type still detect UTF-8
// and render accents correctly (Pérez, Ingeniería) instead of Latin-1 mojibake.
const vcf = '\uFEFF' + lines.join('\r\n') + '\r\n';

mkdirSync(resolve(root, 'contact'), { recursive: true });
const out = resolve(root, 'contact/alex-perez.vcf');
writeFileSync(out, vcf, 'utf8');
console.log(`✓ contact/alex-perez.vcf (${Buffer.byteLength(vcf)} bytes, vCard 4.0, CRLF)`);
