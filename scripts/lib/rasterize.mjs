// Rasterizes an SVG string to PNG using the Playwright Chromium already available
// as a devDependency (no extra native image libs). Used for QR preview + Wallet icons.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

export async function svgToPng(svg, { width, height, background = null, out }) {
  const h = height ?? width;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: h }, deviceScaleFactor: 1 });
    const sized = svg.replace(
      /<svg /,
      `<svg width="${width}" height="${h}" preserveAspectRatio="xMidYMid meet" `
    );
    const bg = background ? `background:${background};` : '';
    await page.setContent(
      `<!doctype html><meta charset="utf-8"><body style="margin:0;${bg}">${sized}</body>`,
      { waitUntil: 'networkidle' }
    );
    const buf = await page.locator('svg').screenshot({ omitBackground: !background });
    writeFileSync(out, buf);
  } finally {
    await browser.close();
  }
}
