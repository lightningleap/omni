/**
 * Install a brand banner and check it will render correctly.
 *
 *   node scripts/install-banner.mjs <source-image> [adult|kids]
 *
 * e.g.  node scripts/install-banner.mjs "C:/Users/Pranshu/Downloads/banner.png"
 *
 * ── WHY A SCRIPT ────────────────────────────────────────────────────────────
 * Copying the file in is the easy half — you can do that in Explorer. The half
 * worth automating is what comes after: the plate is capped at 380px tall and
 * cropped from the centre on wide screens (see `BrandBannerSection`), so a
 * lockup sitting too near the top or bottom of its canvas loses its ends on a
 * large display, and you would only find out on a machine you don't own.
 *
 * So this copies the file, reads its real dimensions, finds the artwork's
 * actual vertical extent by scanning for non-background pixels, and reports the
 * widest viewport at which nothing clips. It also removes the superseded file
 * for that mode, because `.png` wins the extension lookup and a leftover `.jpg`
 * is then dead weight nobody notices.
 ** It ends by dropping Next's optimized-image cache. That cache is keyed by the
 * source URL, and these files are replaced under fixed names, so without this
 * the site keeps serving the previous artwork from a cache HIT — see
 * scripts/clear-next-image-cache.mjs.
 */
import sharp from 'sharp';
import { closeSync, copyFileSync, existsSync, openSync, readSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { clearNextImageCache } from './clear-next-image-cache.mjs';

const [src, mode = 'adult'] = process.argv.slice(2);

if (!src) {
  console.error('usage: node scripts/install-banner.mjs <source-image> [adult|kids]');
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

// Must match BRAND_BANNER_FILES in src/app/page.tsx.
const base = mode === 'adult' ? 'unrwly-banner' : 'unrwly-kids-banner';

/**
 * The file's real format, read from its first bytes.
 *
 * Not the extension: design tools export named after whatever the dialog was
 * last set to, and a PNG called `.jpeg` is common enough that it has already
 * happened here. Installed under the wrong name it costs the banner entirely —
 * anything reading it goes to the wrong parser — so the destination is named
 * after what the file actually is, and the mismatch is called out rather than
 * carried forward.
 */
function sniffFormat(file) {
  const fd = openSync(file, 'r');
  const head = Buffer.alloc(8);

  try {
    readSync(fd, head, 0, 8, 0);
  } finally {
    closeSync(fd);
  }

  if (head.readUInt32BE(0) === 0x89504e47 && head.readUInt32BE(4) === 0x0d0a1a0a) return '.png';
  if (head.readUInt16BE(0) === 0xffd8) return '.jpg';
  return null;
}

const ext = sniffFormat(src);
const claimed = path.extname(src).toLowerCase();

if (!ext) {
  console.error(`${src} is neither a PNG nor a JPEG — see BANNER_EXTENSIONS in src/app/page.tsx`);
  process.exit(1);
}
if (ext !== claimed && !(ext === '.jpg' && claimed === '.jpeg')) {
  console.log(`note       ${src} is named ${claimed} but is really a ${ext.slice(1).toUpperCase()} — installing it as ${ext}`);
}

const dest = path.join('public', 'brand', `${base}${ext}`);
copyFileSync(src, dest);
console.log(`installed  ${dest}  (${(statSync(dest).size / 1024).toFixed(0)} KB)`);

// `.png` is checked first, so any other extension for this mode is now unread.
for (const other of ['.png', '.jpg', '.jpeg']) {
  const p = path.join('public', 'brand', `${base}${other}`);
  if (other !== ext && existsSync(p)) {
    unlinkSync(p);
    console.log(`removed    ${p}  (superseded — the lookup would never reach it)`);
  }
}

// ── Will it crop badly? ─────────────────────────────────────────────────────
const CAP = 380;
const { data, info } = await sharp(dest).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const px = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2], data[i + C - 1]]; };

// "Artwork" is any pixel far enough from the PAPER colour — not simply a dark
// one. The Kids lockup is a bright mint that reads as near-white in greyscale,
// so a darkness threshold finds only the black sub-text and reports the mark as
// sitting in the bottom third of the canvas, which is the opposite of true.
// Paper is sampled from the four corners, which are always background.
const corners = [px(2, 2), px(W - 3, 2), px(2, H - 3), px(W - 3, H - 3)];
const paper = [0, 1, 2].map((k) => Math.round(corners.reduce((a, c) => a + c[k], 0) / 4));

// Comfortably past the faint grid rules, comfortably under any real ink.
const DELTA = 60;
let top = -1, bottom = -1;
for (let y = 0; y < H; y += 1) {
  let ink = 0;
  for (let x = 0; x < W; x += 1) {
    const [r, g, b, a] = px(x, y);
    if (a <= 8) continue;
    if (Math.abs(r - paper[0]) + Math.abs(g - paper[1]) + Math.abs(b - paper[2]) > DELTA) ink += 1;
  }
  // A handful of pixels is a grid line; a real row of artwork is far denser.
  if (ink > W * 0.008) { if (top < 0) top = y; bottom = y; }
}

const ratio = W / H;
console.log(`\n${W}x${H}   ratio ${ratio.toFixed(3)}`);

if (top < 0) {
  console.log('could not find any artwork rows — check the file.');
} else {
  const t = top / H, b = bottom / H;
  console.log(`artwork occupies ${(t * 100).toFixed(1)}% – ${(b * 100).toFixed(1)}% of the height`);

  // Cover crops symmetrically, so the safe band is bounded by whichever edge is
  // nearer the middle. Below this width the whole file is shown uncropped.
  const margin = Math.min(t, 1 - b);
  const safeTo = margin <= 0 ? Infinity : (CAP * ratio) / (1 - 2 * margin);
  console.log(`uncropped up to ${Math.round(CAP * ratio)}px viewport (natural height reaches the ${CAP}px cap there)`);
  console.log(
    safeTo === Infinity || safeTo > 3840
      ? 'nothing clips at any realistic viewport width ✓'
      : `nothing clips up to ~${Math.round(safeTo)}px viewport; beyond that the artwork starts to clip.\n` +
        '  → give the lockup more empty margin above and below in the export to push that higher.'
  );
}

// The file changed but its URL did not, so anything Next already optimized for
// this banner would keep being served instead. Only a cache — it rebuilds on
// the next request.
const dropped = clearNextImageCache();
console.log(
  dropped
    ? `\ndropped ${dropped} entr${dropped === 1 ? 'y' : 'ies'} from Next's image cache — reload the page to see this file`
    : "\nNext's image cache was already empty"
);
