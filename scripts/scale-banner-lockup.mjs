/**
 * Re-export a brand banner with its lockup drawn smaller on the same plate.
 *
 *   node scripts/scale-banner-lockup.mjs <source-image> <adult|kids> [scale] [out]
 *
 * e.g.  node scripts/scale-banner-lockup.mjs "public/brand/banner adult latest.png" adult 0.8
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The banner is rendered full-bleed, so how large the lockup reads on screen is
 * decided entirely by how much of the file's width it occupies — no CSS can
 * make it smaller without shrinking the plate along with it. The only place to
 * change it is the artwork.
 *
 * Shrinking the whole file would not do it either: that scales the plate too,
 * and the mark comes back the same fraction of the width it started at. What
 * has to shrink is the lockup *within* its canvas, leaving more paper around
 * it — which is what this does, so the studio's export stays the source of
 * truth and the site never carries a hand-edited PNG nobody can reproduce.
 *
 * ── HOW ─────────────────────────────────────────────────────────────────────
 * The plate is white paper with a very faint hand-drawn grid on it (never more
 * than ~19 levels away from white, against the ~429 of the mint and ~765 of the
 * black). That gap is wide enough to separate the two reliably:
 *
 *   1. find the lockup, erase it, and close the hole by copying paper down from
 *      a whole number of grid rows above or below — so both families of lines
 *      run through the patch instead of stopping at its edge;
 *   2. take the lockup on its own, whitened back to bare paper around it, and
 *      resize it;
 *   3. multiply it back onto the cleaned plate at the same centre. Multiply
 *      rather than alpha: the mark is dark on white paper, so every pixel of
 *      its anti-aliased edge lands at exactly the weight it was drawn with,
 *      with no matte to estimate and no halo where the estimate would be off.
 *
 * Re-run it from the studio's file whenever the scale needs to change. Chaining
 * it on its own output would resample artwork that has already been resampled;
 * the source is always the export the studio sent.
 *
 * `scripts/install-banner.mjs` is the tool for putting a banner in place
 * unchanged. This one ends with the same crop report, since the plate is capped
 * at 380px tall and cropped from the centre on a wide screen, and with the same
 * cache drop — Next's image cache is keyed by URL, and these files are replaced
 * under fixed names, so without it the site keeps serving the previous artwork
 * from a cache HIT. See scripts/clear-next-image-cache.mjs.
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { clearNextImageCache } from './clear-next-image-cache.mjs';

const [src, mode = 'adult', scaleArg = '0.8', outArg] = process.argv.slice(2);

if (!src) {
  console.error('usage: node scripts/scale-banner-lockup.mjs <source-image> <adult|kids> [scale] [out]');
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`no such file: ${src}`);
  process.exit(1);
}
if (mode !== 'adult' && mode !== 'kids') {
  console.error(`mode must be "adult" or "kids", got "${mode}"`);
  process.exit(1);
}

const scale = Number(scaleArg);

if (!(scale > 0.2 && scale <= 1)) {
  console.error(`scale must be between 0.2 and 1, got "${scaleArg}"`);
  process.exit(1);
}

// Must match BRAND_BANNER_FILES in src/app/page.tsx.
const base = mode === 'adult' ? 'unrwly-banner' : 'unrwly-kids-banner';
const out = outArg ?? path.join('public', 'brand', `${base}.png`);

/**
 * Sum-of-channels distance from paper above which a pixel is the lockup.
 *
 * The grid tops out at 57 in the Kids plate and 30 in the Adult one; the mint
 * sits at 429 and the black at 765. 70 is clear of the grid with room to spare
 * and far below anything that is actually ink.
 */
const GRID_CEILING = 70;

/**
 * How far past the lockup to treat the plate as dirty, in pixels.
 *
 * The threshold above finds the mark's body but leaves the last whisper of its
 * anti-aliased edge — a few levels of grey, individually below the grid, and
 * collectively a ghost of the old outline if it stays behind. Erasing a small
 * collar around every stroke removes it. It costs only some grid.
 */
const FRINGE = 6;

const CAP = 380; // the plate's rendered height cap — see BrandBannerSection.

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const at = (x, y) => (y * W + x) * 4;

// Paper, sampled from the four corners — always background on these plates.
const corners = [
  [2, 2],
  [W - 3, 2],
  [2, H - 3],
  [W - 3, H - 3],
].map(([x, y]) => at(x, y));
const paper = [0, 1, 2].map((k) => Math.round(corners.reduce((a, i) => a + data[i + k], 0) / 4));

const distance = (i) =>
  Math.abs(data[i] - paper[0]) + Math.abs(data[i + 1] - paper[1]) + Math.abs(data[i + 2] - paper[2]);

/**
 * The grid's vertical period, in pixels, by autocorrelating how dark each row
 * is over a strip of plate the lockup never reaches.
 *
 * Read off the file rather than hard-coded because it is the one number the
 * repair depends on, and a differently-ruled plate would otherwise be patched
 * with paper from the wrong place — which is worse than not patching at all.
 */
function gridPeriod() {
  const strip = Math.floor(W * 0.2); // the far left, always background
  const profile = [];

  for (let y = 0; y < H; y += 1) {
    let sum = 0;
    for (let x = 0; x < strip; x += 1) {
      const i = at(x, y);
      sum += paper[0] + paper[1] + paper[2] - data[i] - data[i + 1] - data[i + 2];
    }
    profile.push(sum / strip);
  }

  const mean = profile.reduce((a, v) => a + v, 0) / H;
  const centred = profile.map((v) => v - mean);

  let best = 0;
  let bestScore = -Infinity;

  // Below ~12px is texture, not ruling; above a third of the height there is
  // not enough overlap left to score a lag honestly.
  for (let lag = 12; lag < Math.floor(H / 3); lag += 1) {
    let score = 0;
    for (let y = 0; y + lag < H; y += 1) score += centred[y] * centred[y + lag];
    score /= H - lag;
    if (score > bestScore) {
      bestScore = score;
      best = lag;
    }
  }

  return best;
}

// ── 1. Where is the lockup? ─────────────────────────────────────────────────
const dirty = new Uint8Array(W * H);
let minX = W;
let maxX = -1;
let minY = H;
let maxY = -1;

for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    if (distance(at(x, y)) <= GRID_CEILING) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    for (let dy = -FRINGE; dy <= FRINGE; dy += 1) {
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      for (let dx = -FRINGE; dx <= FRINGE; dx += 1) {
        const xx = x + dx;
        if (xx >= 0 && xx < W) dirty[yy * W + xx] = 1;
      }
    }
  }
}

if (maxX < 0) {
  console.error(`no artwork found in ${src} — every pixel is within ${GRID_CEILING} of the paper.`);
  process.exit(1);
}

const inkW = maxX - minX + 1;
const inkH = maxY - minY + 1;
const centreX = (minX + maxX + 1) / 2;
const centreY = (minY + maxY + 1) / 2;

// ── 2. Erase it, closing the hole with paper from a grid row away ───────────
// Straight interpolation across the hole would work — the paper is white and
// flat — but it would take the grid with it, leaving a lighter rectangle where
// every line stopped short. Copying from a whole number of grid rows up or down
// keeps them: it is the same column, so the vertical lines simply continue, and
// it is an exact period away, so the horizontal ones land where they belong.
const period = gridPeriod();
const plate = Buffer.from(data);

// Nearest clean pixel in this column at a multiple of the period. The offsets
// alternate outwards so the source is as close to the hole as the grid allows.
const sourceFor = (x, y) => {
  for (let step = 1; step * period < H; step += 1) {
    for (const dy of [-step * period, step * period]) {
      const yy = y + dy;
      if (yy < 0 || yy >= H || dirty[yy * W + x]) continue;
      return at(x, yy);
    }
  }
  return -1;
};

for (let y = 0; y < H; y += 1) {
  let x = 0;
  while (x < W) {
    if (!dirty[y * W + x]) {
      x += 1;
      continue;
    }

    let end = x;
    while (end < W && dirty[y * W + end]) end += 1;

    // Fallback for a column the grid offers no clean source in: interpolate the
    // paper across the run, the way a flat background would be filled.
    const left = x > 0 ? at(x - 1, y) : -1;
    const right = end < W ? at(end, y) : -1;

    for (let fill = x; fill < end; fill += 1) {
      const i = at(fill, y);
      const from = sourceFor(fill, y);

      if (from >= 0) {
        for (let k = 0; k < 3; k += 1) plate[i + k] = data[from + k];
      } else {
        const t = (fill - x + 1) / (end - x + 1);
        for (let k = 0; k < 3; k += 1) {
          const l = left >= 0 ? plate[left + k] : plate[right + k];
          const r = right >= 0 ? data[right + k] : plate[left + k];
          plate[i + k] = Math.round(l + (r - l) * t);
        }
      }

      plate[i + 3] = 255;
    }

    x = end;
  }
}

// ── 3. Lift the lockup off the paper, resize it, multiply it back ───────────
// Whitening everything that is not ink keeps the crop's own copy of the grid
// out of the multiply, where it would otherwise land on top of the plate's real
// grid as a second, misaligned set of lines.
const cropW = inkW + 2 * FRINGE;
const cropH = inkH + 2 * FRINGE;
const cropX = Math.max(0, minX - FRINGE);
const cropY = Math.max(0, minY - FRINGE);
const lockup = Buffer.alloc(cropW * cropH * 3, 255);

for (let y = 0; y < cropH; y += 1) {
  for (let x = 0; x < cropW; x += 1) {
    const sx = cropX + x;
    const sy = cropY + y;
    if (sx >= W || sy >= H) continue;
    const i = at(sx, sy);
    if (distance(i) <= GRID_CEILING) continue;
    const o = (y * cropW + x) * 3;
    for (let k = 0; k < 3; k += 1) lockup[o + k] = data[i + k];
  }
}

const scaledW = Math.max(1, Math.round(cropW * scale));
const scaledH = Math.max(1, Math.round(cropH * scale));
const scaled = await sharp(lockup, { raw: { width: cropW, height: cropH, channels: 3 } })
  .resize(scaledW, scaledH, { kernel: 'lanczos3' })
  .png()
  .toBuffer();

const left = Math.round(centreX - scaledW / 2);
const top = Math.round(centreY - scaledH / 2);

await sharp(plate, { raw: { width: W, height: H, channels: 4 } })
  .composite([{ input: scaled, left, top, blend: 'multiply' }])
  .png({ compressionLevel: 9 })
  .toFile(out);

// ── 4. Report, and check the plate still crops safely ───────────────────────
const { data: check, info: checkInfo } = await sharp(out)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let newTop = -1;
let newBottom = -1;

for (let y = 0; y < checkInfo.height; y += 1) {
  let ink = 0;
  for (let x = 0; x < checkInfo.width; x += 1) {
    const i = (y * checkInfo.width + x) * 4;
    const d =
      Math.abs(check[i] - paper[0]) + Math.abs(check[i + 1] - paper[1]) + Math.abs(check[i + 2] - paper[2]);
    if (d > GRID_CEILING) ink += 1;
  }
  // A handful of pixels is a grid line; a real row of artwork is far denser.
  if (ink > checkInfo.width * 0.008) {
    if (newTop < 0) newTop = y;
    newBottom = y;
  }
}

const ratio = W / H;
const t = newTop / H;
const b = newBottom / H;
const margin = Math.min(t, 1 - b);
const safeTo = margin <= 0 ? Infinity : (CAP * ratio) / (1 - 2 * margin);

console.log(`${src}  ->  ${out}`);
console.log(`  plate ${W}x${H} unchanged; lockup ${inkW}x${inkH} -> ${scaledW}x${scaledH}  (${scale}x)`);
console.log(`  grid period ${period}px — the paper behind the old lockup was patched from that far up or down`);
console.log(`  lockup width ${((inkW / W) * 100).toFixed(1)}% -> ${((scaledW / W) * 100).toFixed(1)}% of the plate`);
console.log(`  artwork occupies ${(t * 100).toFixed(1)}% – ${(b * 100).toFixed(1)}% of the height`);
console.log(
  safeTo === Infinity || safeTo > 3840
    ? '  nothing clips at any realistic viewport width ✓'
    : `  nothing clips up to ~${Math.round(safeTo)}px viewport; beyond that the artwork starts to clip.`
);

// The file changed but its URL did not, so anything Next already optimized for
// this banner would keep being served instead. Only a cache — it rebuilds on
// the next request.
const dropped = clearNextImageCache();
console.log(
  dropped
    ? `\ndropped ${dropped} entr${dropped === 1 ? 'y' : 'ies'} from Next's image cache — reload the page to see this file`
    : "\nNext's image cache was already empty"
);
