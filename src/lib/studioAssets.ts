import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Drop-in artwork lookup — "save the file, it appears".
 *
 * WHY
 * Most of the imagery on this site is still on-brand placeholder photography,
 * because the real product mockups live on Etsy and are exported by hand. The
 * alternative to placeholders — hard-coding paths to files that don't exist yet —
 * would put broken images across the homepage until every last asset landed.
 *
 * So: authored data keeps a placeholder URL, and these helpers check whether the
 * studio has saved a real file under the matching name. If it has, the real one
 * wins; if it hasn't, the placeholder renders and nothing is broken. Adding real
 * photography is a file drop, never a code change — the same contract
 * `public/brand/README.md` already promises for the brand banners.
 *
 * SERVER ONLY. These touch the filesystem, so they run in server components
 * during rendering (at most once per ISR window, not per request) and the
 * resolved paths are handed to client components as plain props.
 */

/** Formats accepted for a drop-in asset, in preference order. */
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'] as const;

/**
 * The public path of `<subdir>/<base>.<ext>` if the studio has saved one.
 *
 * @param subdir Directory under `public/`, e.g. `'categories'`.
 * @param base   Filename without extension, e.g. `'adult-witchy-and-gothic'`.
 * @returns A path usable as an `<Image src>`, or null if no file exists.
 */
export function findStudioImage(subdir: string, base: string): string | null {
  const dir = path.join(process.cwd(), 'public', subdir);

  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(dir, `${base}${ext}`))) {
      return `/${subdir}/${base}${ext}`;
    }
  }

  return null;
}

/**
 * The same lookup for a whole set of names at once.
 *
 * @returns A map of base → public path, containing ONLY the ones that exist, so
 *          a caller can treat it as a sparse set of overrides.
 */
export function findStudioImages(subdir: string, bases: string[]): Record<string, string> {
  const found: Record<string, string> = {};

  for (const base of bases) {
    const src = findStudioImage(subdir, base);
    if (src) found[base] = src;
  }

  return found;
}
