// Generates contact/alex-perez.vcf.
// vCard 3.0 (iOS/macOS/Android's most compatible format), UTF-8, CRLF, NO BOM
// (a BOM makes iOS Contacts reject the file as "unable to open"). Only public data.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { CONTACT as C } from './contact.config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const lines = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `N:${C.lastName};${C.firstName};;;`,
  `FN:${C.fullName}`,
  `TITLE:${C.title}`,
  `TEL;TYPE=CELL:${C.phone}`,
  `EMAIL;TYPE=INTERNET:${C.email}`,
  ...C.urls.map((u) => `URL:${u}`),
  `NOTE:${C.org}`,
  'END:VCARD',
];

// UTF-8, CRLF, no BOM. The bytes are UTF-8; vCard 3.0 is read as UTF-8 by iOS/macOS.
const vcf = lines.join('\r\n') + '\r\n';

mkdirSync(resolve(root, 'contact'), { recursive: true });
const out = resolve(root, 'contact/alex-perez.vcf');
writeFileSync(out, vcf, 'utf8');
console.log(`✓ contact/alex-perez.vcf (${Buffer.byteLength(vcf)} bytes, vCard 3.0, CRLF, no BOM)`);
