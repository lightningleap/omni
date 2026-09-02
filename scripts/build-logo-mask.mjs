/**
 * Derives the logo's alpha mask from the studio's logo file.
 *
 *   node scripts/build-logo-mask.mjs
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The logo has to be exactly the site's accent colour, and the accent is a
 * theme token that changes between the Adult and Kids storefronts. A raster
 * image cannot do that — its colour is baked into its pixels, which is how the
 * mark ended up olive (#809B71) while the accent was mint (#75AC95).
 *
 * So `BrandMark` stops painting the file and starts using it as a CSS mask: the
 * artwork's alpha channel becomes the stencil, and the fill comes from
 * `currentColor`, which is the accent token. Same silhouette, same edges, same
 * anti-aliasing — one source of truth for the colour.
 *
 * ── WHAT THIS SCRIPT PRODUCES ───────────────────────────────────────────────
 * `unrwly-logo-mask.png`: the source file with its RGB channels flattened and
 * ONLY its alpha kept. Same dimensions, same alpha values byte-for-byte, so the
 * mark is not resampled or redrawn in any way. Flattening the colour planes is
 * purely a size win — they deflate to nothing once they are a constant, taking
 * the file from 225 KB to ~46 KB. The original stays exactly as the studio
 * supplied it and is still the file anyone should replace.
 *
 * ── RE-RUN IT WHEN THE LOGO CHANGES ─────────────────────────────────────────
 * Drop in a new `unrwly-logo.png` and run this again. If the new mark is an
 * SVG, no mask is needed at all — see the note in `BrandMark`.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';

const SRC = 'public/brand/unrwly-logo.png';
const OUT = 'public/brand/unrwly-logo-mask.png';

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// Keep alpha, discard colour.
const alphaBefore = [];
for (let i = 0; i < data.length; i += 4) {
  alphaBefore.push(data[i + 3]);
  data[i] = 0;
  data[i + 1] = 0;
  data[i + 2] = 0;
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(OUT);

// Prove the stencil is untouched: every alpha value must round-trip exactly, or
// the mark's shape and edge softness would have shifted.
const check = await sharp(OUT).ensureAlpha().raw().toBuffer();
let drift = 0;
for (let i = 0, n = 0; i < check.length; i += 4, n += 1) {
  if (check[i + 3] !== alphaBefore[n]) drift += 1;
}

console.log(`${SRC} -> ${OUT}`);
console.log(`  ${info.width}x${info.height}   ${(statSync(SRC).size / 1024).toFixed(1)} KB -> ${(statSync(OUT).size / 1024).toFixed(1)} KB`);
console.log(`  alpha pixels differing from source: ${drift}`);
if (drift) {
  console.error('  FAILED — the mask does not match the source silhouette.');
  process.exit(1);
}
console.log('  alpha channel is identical to the source.');
