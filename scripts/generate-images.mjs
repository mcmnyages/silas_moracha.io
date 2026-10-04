/**
 * Generates the social preview image (public/og.png) and the Apple touch icon.
 * Run with `npm run images` after changing your photo, name or role.
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

const W = 1200;
const H = 630;
const PHOTO_W = 430;

const photo = await sharp(root('src/assets/images/hero.jpg'))
  .resize(PHOTO_W, H, { fit: 'cover', position: 'top' })
  .grayscale()
  .modulate({ brightness: 0.9 })
  .toBuffer();

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0f0f0d" stop-opacity="1"/><stop offset="1" stop-color="#0f0f0d" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="${W - PHOTO_W}" width="120" height="${H}" fill="url(#fade)"/>
  <line x1="64" y1="96" x2="${W - PHOTO_W - 40}" y2="96" stroke="#2a2925"/>
  <line x1="64" y1="520" x2="${W - PHOTO_W - 40}" y2="520" stroke="#2a2925"/>

  <g font-family="Consolas, 'IBM Plex Mono', monospace" font-size="20" fill="#8e8c83" letter-spacing="1">
    <text x="64" y="80">PORTFOLIO</text>
    <text x="${W - PHOTO_W - 40}" y="80" text-anchor="end">ELDORET, KE</text>
    <text x="64" y="566">SOFTWARE · SECURITY · AI</text>
  </g>

  <g font-family="'Arial Black', 'Segoe UI Black', Archivo, sans-serif" font-weight="900" fill="#ecebe4" letter-spacing="-4">
    <text x="58" y="270" font-size="140">Silas</text>
    <text x="58" y="420" font-size="140">Moracha<tspan fill="#ff5b14">.</tspan></text>
  </g>
  <text x="64" y="600" font-family="Consolas, 'IBM Plex Mono', monospace" font-size="20" fill="#ff5b14">mcmnyages.github.io/silas_moracha.io</text>
</svg>`;

await sharp({ create: { width: W, height: H, channels: 4, background: '#0f0f0d' } })
  .composite([
    { input: photo, left: W - PHOTO_W, top: 0 },
    { input: Buffer.from(overlay), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(root('public/og.png'));

await sharp(await readFile(root('public/favicon.svg')), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(root('public/apple-touch-icon.png'));

console.log('Generated public/og.png and public/apple-touch-icon.png');
