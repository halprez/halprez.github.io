# Business card / vCard / QR / Wallet generators

All contact details live in `scripts/contact.config.mjs`. The QR **always** encodes the
permanent URL `https://alexperez.dev/card`, so you can change phone/email/URLs and
regenerate everything **without reprinting** physical cards.

## One-time setup
```bash
npm install
npx playwright install chromium   # used to rasterize PNGs and print the card PDF
```

## Regenerate web + print assets
```bash
npm run generate
```
Outputs:
- `contact/alex-perez.vcf` — vCard 4.0 (served at `/contact/alex-perez.vcf`)
- `print/contact-qr.svg` / `print/contact-qr.png` — QR with the real Autarqui logo
- `print/business-card.svg` — editable vector source (85×55mm + 3mm bleed)
- `print/business-card-print.pdf` — print-ready (fonts embedded, QR vector)
- `print/business-card-preview.png` — preview

The `/card` page is `card/index.html` (static, no build step).

## Apple Wallet pass (requires an Apple Developer account)

The pass is only for your own iPhone — to display the QR so others can scan it and save
your vCard from the website. Assets + `pass.json` build without certs; **signing** needs
your Apple certificate and cannot be done in CI without your private key.

Manual steps:
1. Apple Developer → Identifiers → create a **Pass Type ID**: `pass.dev.alexperez.businesscard`.
2. Create a **certificate** for that Pass Type ID (upload a CSR from Keychain Access),
   download the `.cer`, then in Keychain export the cert **and its private key** as a `.p12`.
3. Download the **Apple WWDR** intermediate certificate (G4) from Apple's PKI page.
4. Note your 10-character **Team ID** (Apple Developer → Membership).
5. Convert to PEM into `wallet/certs/` (gitignored):
   ```bash
   mkdir -p wallet/certs
   openssl pkcs12 -in pass.p12 -clcerts -nokeys -out wallet/certs/cert.pem -legacy
   openssl pkcs12 -in pass.p12 -nocerts -nodes -out wallet/certs/key.pem -legacy
   openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wallet/certs/wwdr.pem   # if the WWDR file is DER
   ```
6. Build + sign:
   ```bash
   export APPLE_TEAM_ID=XXXXXXXXXX
   npm run generate:wallet
   ```
   Produces `wallet/alex-perez.pkpass`. Commit it (it contains no private key) so
   `/wallet/alex-perez.pkpass` serves it. Re-run whenever the design or QR changes.

### Security
Never commit `*.p12`, `*.pem`, `*.key`, `*.cer`, or `wallet/certs/` — already gitignored.

## Notes
- GitHub Pages can't set custom headers; a top-level `.nojekyll` serves `.vcf`/`.pkpass`
  verbatim and the `/card` button uses `download`. Verify the vCard import and the
  `.pkpass` "Add to Wallet" flow on a real device.
- Physically **scan-test** the printed QR (iPhone Camera + Control Center scanner, Android,
  varied light, 15–50 cm) before ordering a print run — a mathematically-valid QR isn't
  guaranteed readable after printing.
