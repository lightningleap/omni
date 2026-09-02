/**
 * Splits the Kids lockup into its two stencils.
 *
 *   node scripts/build-kids-logo.mjs
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The Adult mark is drawn as a CSS mask filled from the accent token, so it can
 * never be the wrong colour — see `scripts/build-logo-mask.mjs` and `BrandMark`.
 * The Kids lockup could not follow that rule as one file, because it is two
 * colours: a mint "unrwly" wordmark and a black "KIDS" script. A single mask
 * flattens artwork to one colour by definition, so masking the whole lockup
 * would paint the script mint.
 *
 * The fix is not to abandon the rule but to cut the artwork along the line the
 * rule cares about. The wordmark and the script are separate glyphs that never
 * touch, so each becomes its own stencil:
 *
 *   • the wordmark's is filled from `--accent-900`, the same token the Kids
 *     storefront's buttons and chips read — so the mark carries no colour of
 *     its own and cannot drift from the accent, exactly like the Adult mark.
 *     The supplied mint (#01CC83) is close to that token but not equal to it,
 *     which is the drift this removes.
 *   • the script's is filled with the ink black it is drawn in. That is not a
 *     theme colour and is not meant to follow one; it is a stencil only so that
 *     both halves are built and drawn the same way.
 *
 * ── WHAT IT PRODUCES ────────────────────────────────────────────────────────
 * Two files, both the studio's artwork cropped to its ink with the colour
 * planes discarded and ONLY the alpha kept. Nothing is resampled or redrawn:
 * the crop is a crop and the alpha round-trips byte-for-byte, so the shapes,
 * their proportions, their transparency and their anti-aliased edges are the
 * studio's file untouched. The two stencils are the same size and share an
 * origin, so drawing one on top of the other reassembles the lockup with no
 * registration error possible.
 *
 * The original stays exactly as supplied and is still the file to replace.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';

const SRC = 'public/brand/logo unrwly kids.png';
const OUT_WORDMARK = 'public/brand/unrwly-kids-wordmark-mask.png';
const OUT_SCRIPT = 'public/brand/unrwly-kids-script-mask.png';

/**
 * Alpha above which a pixel counts as ink.
 *
 * Not 0: the export carries a halo of ~20k pixels at alpha 1-4 — under 2%
 * opaque, invisible on any ground, but enough to defeat a "trim what is exactly
 * transparent" crop and leave 180px of empty canvas below the mark. Above 4 the
 * box is stable all the way to alpha 32, so this sits on a plateau rather than
 * on a value tuned to one file. The real anti-aliased edge (alpha 5+) is kept.
 */
const OPAQUE_ENOUGH = 4;

/** The lockup's two ink colours, as they read where the artwork is solid. */
const MINT = [1, 204, 131];
const BLACK = [0, 0, 0];

/**
 * The export is **premultiplied**: a half-transparent mint pixel is stored as
 * half-brightness mint, not as mint at half alpha. That matters here because it
 * makes an anti-aliased wordmark edge read as a dark, near-black green — the
 * same thing a script edge reads as — so classifying on the stored bytes sends
 * a fringe of the black script into the mint stencil. Dividing the colour back
 * out first separates them cleanly: unpremultiplied, a wordmark edge is mint at
 * full brightness and a script edge is black.
 *
 * No clamping. Values above 255 come out of the division at very low alpha,
 * where the stored bytes are mostly rounding noise; clamping them to 255 would
 * flatten the ratios between the channels, which is the one thing the
 * classifier below actually reads.
 */
const unpremultiply = (r, g, b, a) => {
  const k = 255 / a;
  return [r * k, g * k, b * k];
};

/** Manhattan distance in RGB — good enough to tell a mint from a black. */
const distance = ([r, g, b], [tr, tg, tb]) => Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb);

/**
 * Which stencil a pixel belongs to: whichever ink it is closer to.
 *
 * Nearest-colour rather than a set of thresholds, because it always returns an
 * answer — no pixel can fall through the split and be dropped from the lockup,
 * which is the one failure mode that would change the artwork's shape. Whether
 * the two inks really are the only two colours present is checked separately,
 * below, rather than assumed here.
 */
const belongsToWordmark = (rgb) => distance(rgb, MINT) < distance(rgb, BLACK);

/**
 * How the run proves the artwork is still a two-colour lockup.
 *
 * Only solidly opaque pixels are examined: those are where the stored colour is
 * trustworthy, since unpremultiplying a nearly transparent pixel amplifies its
 * rounding error into noise. A pixel further than THIRD_COLOUR_DISTANCE from
 * both inks is not a fringe artefact, it is a third colour — a gradient, a
 * shadow, an outline — and a two-stencil split cannot draw it faithfully.
 * Today's file has 4 such pixels out of 235,162 (0.002%), all of them a hair
 * over the line, so the tolerance below is a wide margin rather than a fit.
 */
const TRUSTWORTHY_ALPHA = 200;
const THIRD_COLOUR_DISTANCE = 120;
const THIRD_COLOUR_TOLERANCE = 0.001; // 0.1% of solid ink

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// ── 1. Crop to the ink ──────────────────────────────────────────────────────
// The studio's artboard carries ~130px of empty space above and below the mark.
// Rendered at a fixed height that padding is not neutral: `contain` letterboxes
// the whole canvas, so the mark would come out about a third smaller than the
// Adult one beside it in the toggle and would sit off-centre in the header.
let minX = info.width;
let minY = info.height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    if (data[(y * info.width + x) * 4 + 3] > OPAQUE_ENOUGH) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX < 0) throw new Error(`${SRC} is fully transparent`);

const width = maxX - minX + 1;
const height = maxY - minY + 1;

// ── 2. Split the crop into two alpha-only stencils ──────────────────────────
const wordmark = Buffer.alloc(width * height * 4);
const script = Buffer.alloc(width * height * 4);
let solidInk = 0;
let thirdColour = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const src = ((y + minY) * info.width + (x + minX)) * 4;
    const out = (y * width + x) * 4;
    const a = data[src + 3];

    if (a <= OPAQUE_ENOUGH) continue; // the halo the crop above already excluded

    const rgb = unpremultiply(data[src], data[src + 1], data[src + 2], a);

    if (a >= TRUSTWORTHY_ALPHA) {
      solidInk += 1;
      if (Math.min(distance(rgb, MINT), distance(rgb, BLACK)) > THIRD_COLOUR_DISTANCE) thirdColour += 1;
    }

    // Colour planes stay at 0 — these are stencils, the fill comes from CSS.
    (belongsToWordmark(rgb) ? wordmark : script)[out + 3] = a;
  }
}

if (thirdColour > solidInk * THIRD_COLOUR_TOLERANCE) {
  throw new Error(
    `${thirdColour} of ${solidInk} solid pixels in ${SRC} are neither mint nor black. ` +
      'The lockup has gained a colour the two-stencil split cannot draw — it needs a ' +
      'third stencil, or, if that colour is decorative, a painted <Image>. Do not just ' +
      'widen the tolerance.'
  );
}

const toPng = (buf) =>
  sharp(buf, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9, effort: 10 });

await toPng(wordmark).toFile(OUT_WORDMARK);
await toPng(script).toFile(OUT_SCRIPT);

// ── 3. Prove the lockup survived the split ──────────────────────────────────
// Every alpha value must land in exactly one stencil and round-trip unchanged.
// If it does, the two drawn together are the original artwork, pixel for pixel.
const [wroteWordmark, wroteScript] = await Promise.all(
  [OUT_WORDMARK, OUT_SCRIPT].map((f) => sharp(f).ensureAlpha().raw().toBuffer())
);

let drift = 0;
let overlap = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const src = ((y + minY) * info.width + (x + minX)) * 4;
    const out = (y * width + x) * 4;
    const expected = data[src + 3] > OPAQUE_ENOUGH ? data[src + 3] : 0;
    const w = wroteWordmark[out + 3];
    const s = wroteScript[out + 3];

    if (w > 0 && s > 0) overlap += 1;
    if (w + s !== expected) drift += 1;
  }
}

if (drift > 0 || overlap > 0) {
  throw new Error(`stencils do not reassemble the source: ${drift} alpha mismatches, ${overlap} overlapping pixels`);
}

const kb = (f) => `${(statSync(f).size / 1024).toFixed(1)} KB`;

console.log(`${SRC}  ${info.width}x${info.height}  ${kb(SRC)}`);
console.log(`  -> ${OUT_WORDMARK}  ${width}x${height}  ${kb(OUT_WORDMARK)}   (filled from --accent-900)`);
console.log(`  -> ${OUT_SCRIPT}  ${width}x${height}  ${kb(OUT_SCRIPT)}   (filled with ink black)`);
console.log(`  aspect ${(width / height).toFixed(4)} — set KIDS_LOGO_ASPECT in src/components/BrandMark.tsx to this`);
console.log(`  ${thirdColour}/${solidInk} solid pixels off-ink; alpha reassembles the source exactly, no pixel in both stencils`);
