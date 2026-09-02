import { KIDS_COLORS } from './kidsColors';

/**
 * The catalogue's colour swatches — one fill per colour a product can resolve to.
 *
 * WHY THIS EXISTS
 * Product cards now show colour options permanently rather than on hover, so
 * every card needs to draw the colours that product is actually available in.
 * The colour a product resolves to is a slug (`black`, `sage`… see
 * `utils/plp/productAttributes.ts`); this file is the only place that says what
 * a slug LOOKS like, so the swatch on a card, the swatch in the PLP filter panel
 * and the swatch in the Kids browse rail are all the same colour.
 *
 * The Kids browse palette (`kidsColors.ts`) is the curated subset shown as a
 * merchandising rail; it is reused verbatim below rather than restated, so a
 * tweak there moves both surfaces together. The extra entries are the neutrals
 * the adult catalogue uses that the Kids rail deliberately doesn't offer.
 *
 * KEYS MUST MATCH the colour keys in `utils/plp/productAttributes.ts` — that
 * mapping is what turns a product name into a set of swatches. A colour with no
 * entry here simply doesn't draw, which is the honest failure: better to show
 * one swatch fewer than to invent a fill for a colour we can't describe.
 */
export interface ColorSwatch {
  /** Matches a product's resolved `colors` attribute. */
  slug: string;
  /** Display name, used for the swatch's accessible label. */
  name: string;
  /** CSS colour or gradient. Applied as `background`, so gradients work. */
  hex: string;
  /** Draw a hairline around very light fills so they read on white. */
  bordered?: boolean;
}

/** Neutrals the adult catalogue carries beyond the Kids browse palette. */
const ADULT_NEUTRALS: ColorSwatch[] = [
  { slug: 'grey', name: 'Grey', hex: '#8E8E8B' },
  { slug: 'beige', name: 'Beige', hex: '#D8CBB4', bordered: true },
  { slug: 'navy', name: 'Navy', hex: '#26364F' },
  { slug: 'olive', name: 'Olive', hex: '#6E6B47' },
];

export const COLOR_SWATCHES: ColorSwatch[] = [
  ...KIDS_COLORS.map(({ slug, name, hex, bordered }) => ({ slug, name, hex, bordered })),
  ...ADULT_NEUTRALS,
];

const BY_SLUG = new Map(COLOR_SWATCHES.map((c) => [c.slug, c]));

/**
 * Display order for a product's swatches.
 *
 * Products resolve their colours from a keyword table whose iteration order is
 * an implementation detail; sorting through this list means two products that
 * share colours always draw them in the same sequence, which is what makes a
 * grid of cards scannable at a glance (the client's actual ask — eyeballing
 * colours across the whole grid without hovering anything).
 */
const DISPLAY_ORDER = [
  'black', 'white', 'grey', 'beige', 'navy', 'blue', 'green', 'olive',
  'red', 'pink', 'purple', 'orange', 'yellow', 'brown', 'pastel', 'rainbow',
];
const ORDER_INDEX = new Map(DISPLAY_ORDER.map((slug, i) => [slug, i]));

export function getColorSwatch(slug: string): ColorSwatch | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Resolve a product's colour slugs to drawable swatches, in display order.
 * Unknown slugs are dropped rather than guessed at.
 */
export function resolveColorSwatches(slugs: readonly string[] | undefined): ColorSwatch[] {
  if (!slugs?.length) return [];

  const seen = new Set<string>();
  const swatches: ColorSwatch[] = [];

  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    const swatch = BY_SLUG.get(slug);
    if (!swatch) continue;
    seen.add(slug);
    swatches.push(swatch);
  }

  return swatches.sort(
    (a, b) => (ORDER_INDEX.get(a.slug) ?? 99) - (ORDER_INDEX.get(b.slug) ?? 99)
  );
}
