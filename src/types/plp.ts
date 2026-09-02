/**
 * Product Listing Page — shared type contracts.
 *
 * Everything the PLP does is driven by data of these shapes: a category
 * registry entry says WHAT is being listed, a `FilterConfig` says HOW it can be
 * narrowed, and a `PlpProduct` carries the attributes those filters match
 * against. No component hard-codes a facet, an option or a sort.
 */

/** Which filter experience a category gets. Mirrors the storefront mode. */
export type ShopAudience = 'adult' | 'kids';

/**
 * The facets a product can be narrowed by. Each key is both a URL parameter and
 * a field on `ProductAttributes`, so adding a facet is one entry here plus one
 * derivation rule — never a change to the filter panel or the engine.
 */
export type AttributeKey =
  | 'sizes'
  | 'fits'
  | 'colors'
  | 'categories'
  | 'themes'
  | 'fabrics'
  | 'ageRanges'
  | 'genders';

/** Boolean facets that aren't attribute lists. */
export type ProductFlag = 'new' | 'trending' | 'bestseller';

// Sorting is not PLP-specific — the homepage sections use the same keys and the
// same engine — so it lives in `types/sorting`. Imported for use below and
// re-exported, so `@/types/plp` stays the single import for filter config code.
import type { SortKey, SortOptionDef, Sortable } from '@/types/sorting';

export type { SortKey, SortOptionDef, Sortable };

/** How a filter group renders. The panel switches on this, nothing else. */
export type FilterControl = 'chips' | 'swatches' | 'list' | 'price';

export interface FilterOption {
  /** Stored in the URL and matched against product attributes. */
  value: string;
  label: string;
  /** Secondary line — e.g. "Ages 3–4" beneath the size "4T". */
  hint?: string;
  /** CSS colour or gradient for `swatches` controls. */
  swatch?: string;
  /** Draw a hairline around the swatch (for white / very light fills). */
  swatchBordered?: boolean;
}

export interface FilterGroupDef {
  /** Also the URL parameter key. */
  id: string;
  label: string;
  control: FilterControl;
  /** Which product attribute this group narrows. Omitted for `price`. */
  attribute?: AttributeKey;
  options?: FilterOption[];
  /** Expanded on first render. Defaults to true. */
  defaultOpen?: boolean;
}

/**
 * A single-axis change a quick chip applies. Keeping it to one axis is what
 * makes a chip trivially toggleable and its active state unambiguous.
 */
export interface FilterPatch {
  facet?: { key: AttributeKey; value: string };
  maxPrice?: number;
  flag?: ProductFlag;
}

export interface QuickChipDef {
  id: string;
  label: string;
  patch: FilterPatch;
}

/** The complete filtering experience for one audience. */
export interface FilterConfig {
  audience: ShopAudience;
  groups: FilterGroupDef[];
  quickChips: QuickChipDef[];
  sorts: SortOptionDef[];
  /** Kids only — the "Shop by Colour" rail above the grid. */
  colorRail?: FilterOption[];
}

/** Facet values a product carries. Empty array = no known value. */
export type ProductAttributes = Record<AttributeKey, string[]>;

/** A product as the PLP consumes it: card fields + everything filterable. */
export interface PlpProduct {
  _id: string;
  name: string;
  slug: string;
  image: string;
  secondaryImage?: string;
  /** Pre-formatted for display, e.g. "$24.00". */
  price: string;
  rawPrice: number;
  category?: string;
  attributes: ProductAttributes;
  /** ISO timestamp — drives "Newest" and the "New" flag. */
  createdAt: string;
  /** Real units sold, aggregated from OrderItem. Drives "Best Selling". */
  unitsSold: number;
  isNew: boolean;
}

/** The user's current selections. The single source of truth for the grid. */
export interface FilterState {
  facets: Partial<Record<AttributeKey, string[]>>;
  minPrice: number | null;
  maxPrice: number | null;
  flags: ProductFlag[];
  sort: SortKey;
}

/** A removable chip shown above the grid. */
export interface ActiveFilterChip {
  /** Stable identity for the remove handler. */
  id: string;
  label: string;
  remove: () => void;
}

/**
 * Per-option match counts for the current result set, so options that cannot
 * narrow anything are shown as unavailable instead of silently emptying the
 * grid. Keyed by `attribute:value`.
 */
export type FacetCounts = Record<string, number>;

/** A registry entry: one category, one PLP. */
export interface ShopCategory {
  /** URL segment appended to `basePath`. */
  slug: string;
  /**
   * Which route family serves this entry. `/shop` is the default; the age
   * groups live under `/kids` so their URLs read the way a parent would expect
   * (`/kids/3-5`, not `/shop/3-5`). Both are served by the same page component
   * off this same registry.
   */
  basePath?: '/shop' | '/kids';
  label: string;
  audience: ShopAudience;
  /** Optional supporting line under the page title. */
  description?: string;
  /** Trail shown above the title. The category itself is appended. */
  breadcrumb: { label: string; href: string }[];
  /**
   * Narrows the catalogue before any user filter — e.g. Toddler is the Kids
   * catalogue at ages 3–5. Applied through the same matching engine, but only
   * while the attribute has coverage in the data (see `applyCategoryScope`).
   */
  scope?: Partial<Record<AttributeKey, string[]>>;
}
