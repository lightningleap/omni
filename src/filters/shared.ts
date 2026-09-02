import type { SortOptionDef } from '@/types/plp';

/**
 * The storefront prices and displays in USD (see `getHomepageData` and the PDP),
 * so the quick-filter thresholds render with `$`. The brief specified ₹999 / ₹499
 * — the numbers are kept exactly as specified and the symbol is this one
 * constant, so switching the store to rupees is a single-character change here.
 */
export const CURRENCY_SYMBOL = '$';

/** Sorts every audience offers. Kids appends its two age sorts to these. */
export const SHARED_SORTS: SortOptionDef[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

/** A product is "New" for this long after it lands. */
export const NEW_FOR_DAYS = 30;
