/**
 * Hides sensitive areas of images (names, serial numbers, IDs) listed in scripts/redactions.mjs.
 *
 *   npm run redact             apply every redaction
 *   npm run redact -- --grid   write gridded previews to .redact-preview/ to help find coordinates
 *
 * The first run copies each untouched image to .originals/ (git-ignored, keep it private).
 * Every later run starts from that copy, so you can change or remove a box and run again
 * without blurring the same spot twice. Metadata (EXIF, GPS) is always removed from the output.
 */
import sharp from 'sharp';
import { copyFile, mkdir, access } from 'node:fs/promises';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import redactions from './redactions.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ORIGINALS = join(ROOT, '.originals');
const PREVIEWS = join(ROOT, '.redact-preview');
const grid = process.argv.includes('--grid');

const exists = (p) => access(p).then(() => true, () => false);

/** Build the patch that covers one box. */
async function patch(source, { x, y, w, h, mode = 'blur', color = '#e9e6dc' }) {
  if (mode === 'fill') {
    return sharp({ create: { width: w, height: h, channels: 3, background: color } }).png().toBuffer();
  }
  const region = sharp(source).extract({ left: x, top: y, width: w, height: h });
  // Shrinking to a few pixels first throws the text away for good; a plain blur can sometimes be reversed.
  const tiny = await region.resize(Math.max(1, Math.round(w / 24)), Math.max(1, Math.round(h / 24))).toBuffer();
  if (mode === 'pixelate') return sharp(tiny).resize(w, h, { kernel: 'nearest' }).png().toBuffer();
  return sharp(tiny).resize(w, h, { kernel: 'cubic' }).blur(Math.max(4, Math.min(w, h) / 6)).png().toBuffer();
}

/** A copy of the image with a labelled 100px grid and the configured boxes drawn on it. */
async function preview(source, boxes, out) {
  const { width, height } = await sharp(source).metadata();
  const lines = [];
  for (let x = 0; x < width; x += 100)
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#d9480f" stroke-opacity="${x % 500 ? 0.25 : 0.7}"/>`, `<text x="${x + 3}" y="16">${x}</text>`);
  for (let y = 0; y < height; y += 100)
    lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#d9480f" stroke-opacity="${y % 500 ? 0.25 : 0.7}"/>`, `<text x="3" y="${y + 16}">${y}</text>`);
  for (const b of boxes)
    lines.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="none" stroke="#1d4ed8" stroke-width="3"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="monospace" font-size="14" fill="#d9480f">${lines.join('')}</svg>`;
  await sharp(source).composite([{ input: Buffer.from(svg) }]).png().toFile(out);
}

for (const [file, boxes] of Object.entries(redactions)) {
  const target = join(ROOT, file);
  const original = join(ORIGINALS, file);
  if (!(await exists(original))) {
    await mkdir(dirname(original), { recursive: true });
    await copyFile(target, original);
    console.log(`backed up  ${file} -> .originals/`);
  }

  const { width, height } = await sharp(original).metadata();
  for (const b of boxes) {
    if (b.x < 0 || b.y < 0 || b.w <= 0 || b.h <= 0 || b.x + b.w > width || b.y + b.h > height)
      throw new Error(`${file}: box "${b.label ?? ''}" (${b.x},${b.y} ${b.w}x${b.h}) is outside the ${width}x${height} image`);
  }

  if (grid) {
    await mkdir(PREVIEWS, { recursive: true });
    const out = join(PREVIEWS, `${basename(file, extname(file))}.png`);
    await preview(original, boxes, out);
    console.log(`preview    ${out}`);
    continue;
  }

  const source = await sharp(original).toBuffer();
  const layers = await Promise.all(boxes.map(async (b) => ({ input: await patch(source, b), left: b.x, top: b.y })));
  const image = sharp(source).composite(layers); // sharp drops metadata unless told to keep it
  const ext = extname(file).toLowerCase();
  await (ext === '.png' ? image.png() : ext === '.webp' ? image.webp({ quality: 90 }) : image.jpeg({ quality: 88, mozjpeg: true })).toFile(target);
  console.log(`redacted   ${file} (${boxes.length} area${boxes.length === 1 ? '' : 's'})`);
}
