#!/usr/bin/env node
/**
 * Renders the social image and app icons with Playwright (Chromium).
 *
 *   npm run assets
 *
 * Outputs:
 *   og-image.png              1200×630  Open Graph / Twitter card
 *   apple-touch-icon.png      180×180
 *   icons/icon-192.png        192×192
 *   icons/icon-512.png        512×512
 *   icons/icon-maskable-512.png 512×512 (safe-zone padded)
 *   favicon.ico               32×32 PNG-in-ICO
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => path.join(root, p);

const browser = await chromium.launch();
const page = await browser.newPage();

// --- Open Graph image ---
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(`file://${out('scripts/og-image.html')}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out('og-image.png'), type: 'png' });
console.log('✓ og-image.png');

// --- Icons from favicon.svg ---
const svg = await readFile(out('favicon.svg'), 'utf8');
const iconHtml = (size, pad = 0, bg = 'transparent') => `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center">
  <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`;

async function icon(file, size, pad = 0, bg = 'transparent') {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconHtml(size, pad, bg));
  return page.screenshot({ path: file ? out(file) : undefined, omitBackground: bg === 'transparent', type: 'png' });
}

await mkdir(out('icons'), { recursive: true });
await icon('apple-touch-icon.png', 180, 0, '#0d1729');
await icon('icons/icon-192.png', 192);
await icon('icons/icon-512.png', 512);
await icon('icons/icon-maskable-512.png', 512, 72, '#0d1729');
console.log('✓ icons');

// --- favicon.ico (single 32×32 PNG wrapped in an ICO container) ---
const png = await icon(null, 32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);       // reserved
header.writeUInt16LE(1, 2);       // type: icon
header.writeUInt16LE(1, 4);       // image count
header.writeUInt8(32, 6);         // width
header.writeUInt8(32, 7);         // height
header.writeUInt8(0, 8);          // palette
header.writeUInt8(0, 9);          // reserved
header.writeUInt16LE(1, 10);      // colour planes
header.writeUInt16LE(32, 12);     // bits per pixel
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);     // offset
await writeFile(out('favicon.ico'), Buffer.concat([header, png]));
console.log('✓ favicon.ico');

await browser.close();
