// Builds the Apple Wallet Generic pass (spec §5–9) and, IF signing certs are present,
// produces a signed wallet/alex-perez.pkpass. Assets always build; signing is skipped
// (with instructions) when wallet/certs/ is missing so it works before Apple setup.
//
// Signing inputs (place in wallet/certs/, gitignored):
//   cert.pem  – your Pass Type ID certificate (PEM)
//   key.pem   – its private key (PEM, unencrypted)
//   wwdr.pem  – Apple WWDR intermediate certificate (PEM)
// Env: APPLE_TEAM_ID – your 10-char Apple Team ID.
import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { CARD_URL, WALLET, CONTACT as C } from './contact.config.mjs';
import { svgToPng } from './lib/rasterize.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const passDir = resolve(root, 'wallet/pass');
const certDir = resolve(root, 'wallet/certs');
mkdirSync(passDir, { recursive: true });

const teamId = process.env.APPLE_TEAM_ID || 'APPLE_TEAM_ID';

// 1. Rasterize icon/logo from the real Autarqui isotipo (white-tile variant).
const tile = readFileSync(resolve(root, 'assets/autarqui-isotipo-tile.svg'), 'utf8');
const sizes = [
  ['icon.png', 29], ['icon@2x.png', 58], ['icon@3x.png', 87],
  ['logo.png', 50], ['logo@2x.png', 100], ['logo@3x.png', 150],
];
for (const [name, px] of sizes) {
  await svgToPng(tile, { width: px, background: '#ffffff', out: resolve(passDir, name) });
}
console.log('✓ wallet/pass icons + logo (Autarqui isotipo)');

// 2. pass.json (Generic pass; single QR barcode -> permanent CARD_URL).
const pass = {
  formatVersion: 1,
  passTypeIdentifier: WALLET.passTypeIdentifier,
  serialNumber: WALLET.serialNumber,
  teamIdentifier: teamId,
  organizationName: WALLET.organizationName,
  description: WALLET.description,
  logoText: '',
  foregroundColor: 'rgb(20, 20, 20)',
  backgroundColor: 'rgb(255, 255, 255)',
  labelColor: 'rgb(110, 110, 110)',
  generic: {
    // Mirror the physical card: name, role, phone (α shown via the pass logo).
    primaryFields: [{ key: 'name', label: '', value: C.fullName }],
    secondaryFields: [{ key: 'role', label: '', value: C.title }],
    auxiliaryFields: [{ key: 'phone', label: '', value: C.phoneDisplay }],
  },
  barcodes: [{
    format: 'PKBarcodeFormatQR',
    message: CARD_URL,
    messageEncoding: 'iso-8859-1',
    altText: 'alexperez.dev/card',
  }],
};
writeFileSync(resolve(passDir, 'pass.json'), JSON.stringify(pass, null, 2) + '\n', 'utf8');
console.log(`✓ wallet/pass/pass.json (teamIdentifier: ${teamId})`);

// 3. manifest.json = SHA-1 of every payload file (all except manifest/signature).
const payload = readdirSync(passDir).filter((f) => f !== 'manifest.json' && f !== 'signature');
const manifest = {};
for (const f of payload) manifest[f] = createHash('sha1').update(readFileSync(resolve(passDir, f))).digest('hex');
writeFileSync(resolve(passDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('✓ wallet/pass/manifest.json');

// 4. Sign + zip when certs are available.
const cert = resolve(certDir, 'cert.pem');
const key = resolve(certDir, 'key.pem');
const wwdr = resolve(certDir, 'wwdr.pem');
const haveCerts = existsSync(cert) && existsSync(key) && existsSync(wwdr);

if (!haveCerts || teamId === 'APPLE_TEAM_ID') {
  console.log('\n⚠  Skipping signing — assets are ready but the pass is NOT signed yet.');
  console.log('   To produce wallet/alex-perez.pkpass you must (see scripts/README.md):');
  console.log('   1) Create Pass Type ID `pass.dev.alexperez.businesscard` in Apple Developer');
  console.log('   2) Create its certificate, export cert+key as .p12, download Apple WWDR cert');
  console.log('   3) openssl-convert to wallet/certs/{cert,key,wwdr}.pem  (gitignored)');
  console.log('   4) export APPLE_TEAM_ID=XXXXXXXXXX && node scripts/generate-wallet-pass.mjs');
  process.exit(0);
}

// PKCS#7 detached signature over manifest.json.
execFileSync('openssl', [
  'smime', '-binary', '-sign', '-noattr', '-outform', 'DER',
  '-certfile', wwdr, '-signer', cert, '-inkey', key,
  '-in', resolve(passDir, 'manifest.json'), '-out', resolve(passDir, 'signature'),
]);
console.log('✓ wallet/pass/signature (PKCS#7 detached)');

// 5. Zip payload at archive root (no containing folder) -> .pkpass
const out = resolve(root, 'wallet/alex-perez.pkpass');
if (existsSync(out)) rmSync(out);
const files = [...payload, 'manifest.json', 'signature'];
execFileSync('zip', ['-X', out, ...files], { cwd: passDir });
console.log(`✓ wallet/alex-perez.pkpass (signed, ${files.length} entries)`);
