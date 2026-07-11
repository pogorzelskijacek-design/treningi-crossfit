// Generates the PWA / home-screen icon set from a single inline SVG.
// Run with: node scripts/generate-pwa-icons.mjs
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

const BG = '#141414'; // near-black, matches the app's dark theme
const BAR = '#fafafa';
const ACCENT = '#a1a1aa';

/**
 * A clean barbell glyph on a full-bleed dark background.
 * `inset` (0–1) shrinks the barbell toward the centre so maskable icons keep
 * the glyph inside the OS safe zone; the background always fills the square.
 */
function buildSvg({ size = 512, inset = 0, rounded = false } = {}) {
  const s = 512;
  // Scale the barbell around the centre by (1 - inset).
  const k = 1 - inset;
  const cx = s / 2;
  const cy = s / 2;
  const t = (x, y, w, h) => {
    const nx = cx + (x - cx) * k;
    const ny = cy + (y - cy) * k;
    return { x: nx, y: ny, w: w * k, h: h * k };
  };
  const rect = (x, y, w, h, rx, fill = BAR) => {
    const r = t(x, y, w, h);
    return `<rect x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" rx="${(rx * k).toFixed(1)}" fill="${fill}"/>`;
  };

  const bg = rounded
    ? `<rect width="${s}" height="${s}" rx="${s * 0.22}" fill="${BG}"/>`
    : `<rect width="${s}" height="${s}" fill="${BG}"/>`;

  const barbell = [
    // full bar spanning end to end
    rect(120, 249, 272, 14, 7, ACCENT),
    // left plates
    rect(150, 192, 22, 128, 8),
    rect(182, 212, 18, 88, 7),
    // right plates
    rect(312, 212, 18, 88, 7),
    rect(340, 192, 22, 128, 8),
    // end caps
    rect(132, 234, 14, 44, 5, ACCENT),
    rect(366, 234, 14, 44, 5, ACCENT),
  ].join('');

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">${bg}${barbell}</svg>`
  );
}

// A single, slightly enlarged glyph (~60% width) reads well as a home-screen
// tile and still sits inside the maskable safe zone (80% centre circle), so the
// same geometry works for "any", "maskable" and Apple touch icons.
const targets = [
  { file: 'pwa-192x192.png', size: 192, inset: -0.12 },
  { file: 'pwa-512x512.png', size: 512, inset: -0.12 },
  { file: 'maskable-icon-512x512.png', size: 512, inset: -0.12 },
  { file: 'apple-touch-icon.png', size: 180, inset: -0.06 },
  { file: 'favicon-96x96.png', size: 96, inset: -0.04 },
];

for (const { file, size, inset, rounded } of targets) {
  const svg = buildSvg({ size, inset, rounded });
  await sharp(svg).png().toFile(resolve(publicDir, file));
  console.log(`✓ ${file}`);
}

// A crisp scalable favicon too.
const { writeFileSync } = await import('node:fs');
writeFileSync(resolve(publicDir, 'favicon.svg'), buildSvg({ size: 512, inset: 0.04, rounded: true }));
console.log('✓ favicon.svg');
