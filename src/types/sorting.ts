/**
 * Product sorting — shared contracts.
 *
 * Deliberately independent of any one surface: the homepage sections, the
 * Product Listing Pages and anything added later all sort through these types,
 * so a section only has to hand over products and a key.
 */

export type SortKey =
  /** The order the catalogue arrived in — merchandising's own choice. */
  | 'featured'
  | 'popularity'
  | 'bestselling'
  | 'newest'
  | 'rating'
  | 'price-asc'
  | 'price-desc'
  /** Kids only. */
  | 'age-asc'
  | 'age-desc';

export interface SortOptionDef {
  value: SortKey;
  label: string;
}

/**
 * The minimum a product must expose to be sorted.
 *
 * Every field beyond the id is optional on purpose: a section sorts by whatever
 * its products actually carry, and a key with no data behind it degrades to a
 * stable order instead of throwing or scrambling the grid. Both `PlpProduct`
 * and the homepage's lighter product shape satisfy this structurally.
 */
export interface Sortable {
  _id: string;
  rawPrice?: number;
  /** ISO timestamp. */
  createdAt?: string;
  /** Units sold, aggregated from order history. */
  unitsSold?: number;
  /** Average review score. No review data exists yet — see `utils/sorting`. */
  rating?: number;
  attributes?: {
    ageRanges?: string[];
  };
}
