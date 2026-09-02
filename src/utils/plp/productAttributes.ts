import type { AttributeKey, ProductAttributes } from '@/types/plp';

/**
 * The adapter between the catalogue and the filters — and the ONE file that has
 * to change when real inventory data lands.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 * `Product` currently stores id / name / description / price / image /
 * collection / status / audience / source / timestamps. It has no columns for
 * size, colour, fit, fabric, design theme, age range or gender — the seven
 * facets the filter panel offers. Rather than invent columns or block the whole
 * PLP on a migration, every facet is resolved HERE, and only here.
 *
 * Today that resolution is keyword matching over the product's name,
 * description and collection name. It is genuinely useful — a product called
 * "Cosmic Dinosaur Oversized Tee" really is oversized, really is a dinosaur
 * print, really is a tee — and it is honest about what it cannot know: a facet
 * with no signal resolves to an empty list, the product is excluded from that
 * facet, and the UI shows the option as unavailable (0) rather than pretending.
 *
 * ── Replacing it ─────────────────────────────────────────────────────────────
 * When `Product` gains real columns (or a variant table), change
 * `resolveProductAttributes` to read them and delete the keyword tables. Every
 * filter, chip, count, sort and URL keeps working untouched — nothing else in
 * the PLP knows where attributes come from.
 */

/** The raw catalogue row this adapter accepts. */
export interface AttributeSource {
  name: string;
  /**
   * Accepted but deliberately NOT matched against — see `resolveProductAttributes`.
   * Kept on the interface so it's available the moment there's a use for it.
   */
  description?: string | null;
  collectionName?: string | null;
}

/**
 * Keyword → facet value. First match wins per keyword; a product can carry
 * several values per facet (a tee can be both `graphic` and `typography`).
 * Keys are matched as whole words, case-insensitively.
 */
type KeywordTable = Record<string, string[]>;

const COLORS: KeywordTable = {
  black: ['black', 'onyx', 'charcoal', 'noir'],
  white: ['white', 'ivory', 'ecru'],
  grey: ['grey', 'gray', 'slate', 'ash'],
  beige: ['beige', 'sand', 'oat', 'cream', 'tan'],
  navy: ['navy', 'midnight'],
  olive: ['olive', 'khaki', 'sage'],
  blue: ['blue', 'cobalt', 'azure', 'sky', 'ocean'],
  green: ['green', 'emerald', 'forest', 'mint'],
  red: ['red', 'crimson', 'scarlet', 'cherry'],
  pink: ['pink', 'rose', 'blush', 'fuchsia'],
  yellow: ['yellow', 'mustard', 'lemon', 'gold'],
  orange: ['orange', 'apricot', 'coral'],
  purple: ['purple', 'violet', 'lilac', 'lavender'],
  brown: ['brown', 'chocolate', 'coffee', 'mocha'],
  rainbow: ['rainbow', 'multicolour', 'multicolor', 'prism'],
  // Key must equal the `slug` in data/kidsColors.ts — that is what links a
  // swatch to the products it selects.
  pastel: ['pastel', 'pastels'],
};

const CATEGORIES: KeywordTable = {
  't-shirts': ['tee', 'tees', 't-shirt', 'tshirt', 'shirt'],
  'tank-tops': ['tank', 'vest', 'singlet'],
  hoodies: ['hoodie', 'hooded'],
  sweatshirts: ['sweatshirt', 'sweater', 'crewneck', 'jumper'],
  oversized: ['oversized', 'oversize'],
  'long-sleeve': ['longsleeve', 'long-sleeve'],
};

const FITS: KeywordTable = {
  slim: ['slim', 'fitted'],
  regular: ['regular', 'classic', 'standard'],
  relaxed: ['relaxed', 'loose', 'easy'],
  oversized: ['oversized', 'oversize', 'boxy'],
  athleisure: ['athleisure', 'active', 'activewear', 'sport', 'sports', 'gym', 'performance', 'training'],
};

const FABRICS: KeywordTable = {
  'organic-cotton': ['organic'],
  'cotton-blend': ['blend', 'poly', 'polyester'],
  tagless: ['tagless'],
  'soft-touch': ['soft', 'softtouch'],
  hypoallergenic: ['hypoallergenic', 'sensitive'],
};

const THEMES: KeywordTable = {
  // Adult
  minimal: ['minimal', 'minimalist', 'plain', 'essential'],
  // NOT 'print' / 'printed': this is a print-on-demand catalogue, so those words
  // appear on essentially every product and would make the facet match
  // everything — a filter that narrows nothing is worse than no filter.
  graphic: ['graphic', 'artwork', 'illustration', 'illustrated'],
  typography: ['typography', 'slogan', 'lettering', 'quote'],
  anime: ['anime', 'manga', 'otaku'],
  // 'classic' lives in `fits` (a classic *fit*) — as a theme keyword it is
  // marketing filler that tags half the catalogue as vintage.
  vintage: ['vintage', 'retro', 'nostalgic', 'heritage'],
  streetwear: ['street', 'streetwear', 'urban', 'skate'],
  // Shared
  nature: ['nature', 'floral', 'botanical', 'mountain', 'forest', 'ocean', 'leaf'],
  // Kids
  animals: ['animal', 'animals', 'lion', 'tiger', 'bear', 'panda', 'cat', 'dog', 'fox', 'bunny'],
  dinosaurs: ['dino', 'dinosaur', 'dinosaurs', 'rex', 'raptor'],
  cars: ['car', 'cars', 'truck', 'racer', 'racing', 'monster'],
  princess: ['princess', 'fairy', 'unicorn', 'castle'],
  space: ['space', 'cosmic', 'galaxy', 'rocket', 'astronaut', 'planet', 'star', 'stars'],
  cartoons: ['cartoon', 'cartoons', 'doodle', 'comic'],
  educational: ['alphabet', 'abc', 'numbers', 'learn', 'educational', 'science', 'maths', 'math'],
};

const GENDERS: KeywordTable = {
  boys: ['boy', 'boys'],
  girls: ['girl', 'girls'],
  unisex: ['unisex'],
};

const AGE_RANGES: KeywordTable = {
  '0-2': ['baby', 'infant', 'newborn', '0-2'],
  '3-5': ['toddler', '3-5'],
  '6-8': ['6-8'],
  '9-12': ['9-12', 'tween'],
  teen: ['teen', 'teens', 'youth'],
};

/**
 * Sizes are variant-level data, not text — a product page lists its size run, it
 * doesn't mention sizes in its title. There is nothing here to keyword-match, so
 * this facet resolves empty until a variant table exists. The Size group stays
 * in the config (it is part of the architecture the PLP is built around) and its
 * options simply render as unavailable until then.
 */
const SIZES: KeywordTable = {};

const TABLES: Record<AttributeKey, KeywordTable> = {
  sizes: SIZES,
  fits: FITS,
  colors: COLORS,
  categories: CATEGORIES,
  themes: THEMES,
  fabrics: FABRICS,
  ageRanges: AGE_RANGES,
  genders: GENDERS,
};

export const EMPTY_ATTRIBUTES: ProductAttributes = {
  sizes: [],
  fits: [],
  colors: [],
  categories: [],
  themes: [],
  fabrics: [],
  ageRanges: [],
  genders: [],
};

/** Whole-word, case-insensitive, punctuation-tolerant token set. */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9-]+/)
      .filter(Boolean)
  );
}

function matchTable(tokens: Set<string>, table: KeywordTable): string[] {
  const hits: string[] = [];
  for (const [value, keywords] of Object.entries(table)) {
    if (keywords.some((k) => tokens.has(k))) hits.push(value);
  }
  return hits;
}

/**
 * Resolve every filterable facet for one product.
 *
 * Replace the body with real column reads when the schema gains them; the
 * signature is the contract the rest of the PLP depends on.
 */
export function resolveProductAttributes(product: AttributeSource): ProductAttributes {
  // Name + collection only, NOT the description.
  //
  // These are print-on-demand listings: the titles are dense, specific and
  // SEO-written ("Blue Nostalgic Dinosaur Tee | Vintage Dinosaur Graphic
  // T-Shirt") while the descriptions are the supplier's boilerplate, which
  // mentions nature, comfort, classic fits and soft fabrics on every product
  // alike. Feeding both in made broad facets match the entire catalogue —
  // technically a filter, practically useless. The title is the signal.
  const tokens = tokenize([product.name, product.collectionName ?? ''].join(' '));

  return {
    sizes: matchTable(tokens, TABLES.sizes),
    fits: matchTable(tokens, TABLES.fits),
    colors: matchTable(tokens, TABLES.colors),
    categories: matchTable(tokens, TABLES.categories),
    themes: matchTable(tokens, TABLES.themes),
    fabrics: matchTable(tokens, TABLES.fabrics),
    ageRanges: matchTable(tokens, TABLES.ageRanges),
    genders: matchTable(tokens, TABLES.genders),
  };
}
