import { adultPresence, kidsPresence } from './presence';
import type { BrandPresence } from './types';
import type { HomepageMode } from '@/data/homepage/types';

export * from './types';
export { adultPresence, kidsPresence } from './presence';

/**
 * The brand-presence registry — the single lookup every trust surface goes
 * through, so no section ever branches on the audience itself.
 */
export const BRAND_PRESENCE: Record<HomepageMode, BrandPresence> = {
  adult: adultPresence,
  kids: kidsPresence,
};

export function getBrandPresence(mode: HomepageMode): BrandPresence {
  return BRAND_PRESENCE[mode] ?? BRAND_PRESENCE.adult;
}
