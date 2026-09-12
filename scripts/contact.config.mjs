// Single source of truth for the business-card / vCard / QR / Wallet generators.
// Change contact details here and re-run `npm run generate` (the QR never changes:
// it always points to CARD_URL, so printed cards stay valid).

export const CONTACT = {
  fullName: 'Alejandro Pérez',
  firstName: 'Alejandro',
  lastName: 'Pérez',
  title: 'Ingeniería de software',
  phone: '+34663822594',
  phoneDisplay: '+34 663 822 594',
  email: 'contact@alexperez.dev',
  urls: ['https://alexperez.dev', 'https://autarqui.co'],
  org: 'autarqui.co',
  site: 'alexperez.dev',
};

// The permanent QR destination. Everything (print, Wallet, web) resolves here.
export const CARD_URL = 'https://alexperez.dev/card';

// Apple Wallet identifiers (spec §7/§8). Team ID is injected at build time from
// the APPLE_TEAM_ID env var; never hard-code a private value.
export const WALLET = {
  passTypeIdentifier: 'pass.dev.alexperez.businesscard',
  serialNumber: 'alejandro-perez-business-card-v1',
  organizationName: 'Alejandro Pérez',
  description: 'Tarjeta de negocios de Alejandro Pérez',
};
