import { adultHomepage } from './adultHomepage';
import { kidsHomepage } from './kidsHomepage';
import type { HomepageContent, HomepageMode } from './types';

export * from './types';
export { adultHomepage } from './adultHomepage';
export { kidsHomepage } from './kidsHomepage';
export { sharedHomepage } from './shared';
export { COLLECTIONS, pickCollections } from './collections';

/**
 * The mode registry — the single lookup every homepage section goes through.
 *
 * Adding a third mode later (e.g. "teen") means adding a file, adding it here,
 * and widening `HomepageMode`. No section component changes.
 */
export const HOMEPAGE_CONTENT: Record<HomepageMode, HomepageContent> = {
  adult: adultHomepage,
  kids: kidsHomepage,
};

export function getHomepageContent(mode: HomepageMode): HomepageContent {
  return HOMEPAGE_CONTENT[mode] ?? HOMEPAGE_CONTENT.adult;
}
