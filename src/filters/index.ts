import { adultFilters } from './adult';
import { kidsFilters } from './kids';
import type { FilterConfig, ShopAudience } from '@/types/plp';

export * from './shared';
export { adultFilters } from './adult';
export { kidsFilters, KIDS_COLORS } from './kids';

/**
 * The filter registry. Adding an audience — a "teen" store, a "home" store — is
 * a new config file plus one line here; every PLP picks it up automatically.
 */
export const FILTER_CONFIGS: Record<ShopAudience, FilterConfig> = {
  adult: adultFilters,
  kids: kidsFilters,
};

export function getFilterConfig(audience: ShopAudience): FilterConfig {
  return FILTER_CONFIGS[audience] ?? FILTER_CONFIGS.adult;
}
