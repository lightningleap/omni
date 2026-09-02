/**
 * Kids colour palette — the single source of truth for every colour surface.
 *
 * Two very different things read this list: the homepage "Shop by Color" browse
 * section (single-select, big playful swatches) and the Kids PLP colour facet
 * (multi-select, sidebar + quick rail). Keeping one list means a colour added
 * here appears in both, with the same name, the same swatch and — critically —
 * the same `slug`, which is what product attributes are matched on and what
 * ends up in a shareable URL.
 *
 * `slug` MUST stay in step with the colour keys in
 * `utils/plp/productAttributes.ts`; that mapping is what turns "Blue" into a set
 * of products.
 */
export interface KidsColor {
  id: string;
  name: string;
  /** Swatch fill. A CSS gradient for the two mixed swatches. */
  hex: string;
  /** Matched against a product's resolved `colors` attribute. */
  slug: string;
  /** Draw a hairline around very light swatches so they read on off-white. */
  bordered?: boolean;
  /**
   * Reserved: a photographed swatch (a folded garment, a print detail) to use
   * instead of a flat circle once real photography exists.
   */
  image?: string;
}

export const KIDS_COLORS: KidsColor[] = [
  { id: 'red', name: 'Red', slug: 'red', hex: '#D64545' },
  { id: 'blue', name: 'Blue', slug: 'blue', hex: '#3B6FD4' },
  { id: 'pink', name: 'Pink', slug: 'pink', hex: '#E88BAE' },
  { id: 'purple', name: 'Purple', slug: 'purple', hex: '#8A63C9' },
  { id: 'yellow', name: 'Yellow', slug: 'yellow', hex: '#F2C14E' },
  { id: 'green', name: 'Green', slug: 'green', hex: '#4E9A5B' },
  { id: 'orange', name: 'Orange', slug: 'orange', hex: '#E3833B' },
  { id: 'black', name: 'Black', slug: 'black', hex: '#1A1A1A' },
  { id: 'white', name: 'White', slug: 'white', hex: '#F2F0EB', bordered: true },
  { id: 'brown', name: 'Brown', slug: 'brown', hex: '#7A5741' },
  {
    id: 'pastel',
    name: 'Pastel',
    slug: 'pastel',
    hex: 'linear-gradient(135deg, #F7D6E0 0%, #FBF0C4 38%, #CFE8D5 70%, #CFDDF5 100%)',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    slug: 'rainbow',
    hex: 'conic-gradient(from 210deg, #D64545, #E3833B, #F2C14E, #4E9A5B, #3B6FD4, #8A63C9, #D64545)',
  },
];

const BY_SLUG = new Map(KIDS_COLORS.map((c) => [c.slug, c]));

export function getKidsColor(slug: string): KidsColor | undefined {
  return BY_SLUG.get(slug);
}

export const KIDS_COLOR_SLUGS = KIDS_COLORS.map((c) => c.slug);
