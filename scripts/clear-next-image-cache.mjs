/**
 * Drop Next's optimized-image cache.
 *
 *   node scripts/clear-next-image-cache.mjs        (or import it)
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * `next/image` caches what it serves under `.next/**\/cache/images`, keyed by
 * the source URL, its width and its quality — not by the bytes behind that URL.
 * The brand assets are dropped in under fixed names on purpose (see
 * public/brand/README.md: new artwork, no code change), so replacing one leaves
 * the key identical and the optimizer keeps answering `X-Nextjs-Cache: HIT`
 * with the previous artwork. The file on disk is new, every check says so, and
 * the page still shows the old one.
 *
 * Busting the URL instead is not available: the optimizer rejects a query
 * string on a local path outright — `"url" parameter is not allowed` — so a
 * `?v=` on the src turns the banner into a 400 rather than a fresh image.
 *
 * Hence this, called by the banner scripts once they have written a file. It is
 * only a cache: anything removed is rebuilt on the next request.
 */
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

/**
 * Every image cache under `.next` — the dev server keeps its own
 * (`.next/dev/cache/images`) separate from a production build's
 * (`.next/cache/images`), and which exist depends on what has been run.
 */
const CACHE_DIRS = [
  path.join('.next', 'cache', 'images'),
  path.join('.next', 'dev', 'cache', 'images'),
];

/** Removes the caches and returns how many entries were dropped. */
export function clearNextImageCache() {
  let entries = 0;

  for (const dir of CACHE_DIRS) {
    if (!existsSync(dir)) continue;
    entries += readdirSync(dir).length;
    rmSync(dir, { recursive: true, force: true });
  }

  return entries;
}

// Also runnable on its own, for the times an asset is replaced by hand.
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const entries = clearNextImageCache();
  console.log(`cleared ${entries} optimized image${entries === 1 ? '' : 's'} from Next's cache`);
}
