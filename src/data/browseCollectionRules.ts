import type { HomepageMode } from './homepage/types';
import { getHomepageContent } from './homepage';

/**
 * How a Browse Collections circle resolves to real products.
 *
 * ── WHY THIS FILE HAD TO EXIST ──────────────────────────────────────────────
 * The rail's handles and the catalogue's handles were two different
 * vocabularies that had never been introduced to each other:
 *
 *   rail      french-with-attitude · witchy-and-gothic · dinosaur-world …
 *   database  bags · bottles · hats · home-decor · mugs · kid-s · women-s …
 *
 * The rail lists the Etsy shop's SECTIONS (a theme: what the design is about).
 * `Collection` in this database records the product TYPE (what the thing is).
 * Both are legitimate; neither is the other. So `/collections/<handle>` looked
 * every rail handle up with `findUnique({ where: { handle } })`, got `null` for
 * all of them, and rendered "Collection Coming Soon" — which is why every
 * circle except "All" appeared to have no products.
 *
 * ── THE TWO WAYS A CIRCLE CAN RESOLVE ───────────────────────────────────────
 * `collections` — the section IS a product type, and the row already exists.
 *   "Mugs & Drinkware" is the `mugs` collection; "Totes & Travel Bags" is
 *   `bags`. These are exact, curated joins: a product is in `mugs` because
 *   someone put it there in the studio, and nothing here second-guesses that.
 *
 * `keywords` — the section is a THEME, and the database has no column for it.
 *   Matched against the Etsy listing title, which is the same signal
 *   `resolveProductAttributes` already trusts for every facet on the PLP, and
 *   for the same reason: these titles are dense and specific ("Oui Mais Non
 *   Sweatshirt, French Girl Aesthetic, Paris Inspired…") while the descriptions
 *   are supplier boilerplate identical across the catalogue.
 *
 * ── HOW THE KEYWORDS WERE CHOSEN ────────────────────────────────────────────
 * By reading the 87 Adult and 45 Kids titles that are actually shoppable today,
 * not by guessing what a shop like this might sell. Matching is WHOLE-TOKEN via
 * `matchesAnyKeyword` — never substring — so `non` cannot match `non-toxic` and
 * `cat` cannot match `catalogue`. Broad words that would swallow the catalogue
 * were deliberately left out: `vintage` is absent from Vintage Botanical
 * because it also tags "Vintage Dinosaur Graphic T-Shirt", and the botanical
 * words alone already catch every listing that section is for.
 *
 * ── THIS IS A FALLBACK, NOT A REPLACEMENT ───────────────────────────────────
 * `/collections/<handle>` looks for a real `Collection` row FIRST and only
 * consults this file when there is none. So the moment someone creates a
 * `witchy-and-gothic` collection in the studio and assigns products to it, the
 * curated set wins and the keyword rule stops being consulted — no code change,
 * no entry to delete. That is the intended migration path, and it is why this
 * is a map rather than a hardcoded product list.
 */

export interface BrowseCollectionRule {
  /** Handles of real `Collection` rows whose products make up this section. */
  collections?: string[];
  /** Whole-token matches against the Etsy listing title. */
  keywords?: string[];
  /**
   * Resolves to nothing on purpose, and says why.
   *
   * A section with no rule at all is a bug; a section that is KNOWN to have no
   * backing data is a fact about the catalogue. The difference matters, because
   * only the second one should quietly render the PLP's empty state.
   */
  emptyReason?: string;
}

/**
 * Every handle in `browseCollections.items`, for both modes.
 *
 * `all` is absent by design: it is the virtual whole-catalogue handle the route
 * already understands, and giving it a rule would narrow it.
 */
export const BROWSE_COLLECTION_RULES: Record<HomepageMode, Record<string, BrowseCollectionRule>> = {
  adult: {
    // No per-product sale data exists. `flashSaleActive` on StoreConfig is a
    // global banner flag, not a price on a product, so there is nothing to
    // select on. Fabricating a discount to fill the grid would be inventing
    // catalogue data; this shows the real empty state until a sale field exists.
    sale: { emptyReason: 'No per-product sale data exists in the catalogue yet.' },

    // Oui Mais Non · Je t'adore · Joie de Vivre · Je Ne Regrette Rien.
    // `t` and `je` are left out: `je` is safe today but is one letter from
    // matching nothing meaningfully, and `t` is a fragment of "t-shirt".
    'french-with-attitude': {
      keywords: [
        'oui', 'mais', 'non', 'ouimaisnon', 'french', 'francophile',
        'paris', 'parisian', 'france', 'adore', 'joie', 'joi', 'vivre',
        'regrette', 'francaise',
      ],
    },

    'vintage-botanical': {
      keywords: [
        'botanical', 'floral', 'flower', 'flowers', 'wildflower', 'rose',
        'roses', 'nouveau', 'bouquet', 'blossom', 'vine', 'garden',
        'tropical', 'jungle', 'leaf', 'foliage',
      ],
    },

    'wildlife-and-oddities': {
      keywords: [
        'fox', 'serval', 'frog', 'shoebill', 'bird', 'tiger', 'wolf',
        'leopard', 'chicken', 'chickens', 'rooster', 'hen', 'moth',
        'flounder', 'fish', 'snake', 'dove', 'bug', 'animal', 'animals',
        'wildlife', 'marine', 'nautical', 'coastal', 'panda', 'bear',
      ],
    },

    'feminist-and-unfiltered': {
      keywords: [
        'feminist', 'feminism', 'patriarchy', 'resist', 'girls', 'rights',
        'unfiltered', 'rage', 'suffrage',
      ],
    },

    'witchy-and-gothic': {
      keywords: [
        'witchy', 'witch', 'witchcore', 'witchcraft', 'halloween', 'ghost',
        'ghosts', 'spooky', 'skeleton', 'gothic', 'goth', 'occult', 'coven',
        'seance', 'spellbound', 'spell',
      ],
    },

    'self-love-statements': {
      keywords: [
        'self', 'self-love', 'selflove', 'chaos', 'inspirational', 'rumi',
        'shine', 'positive', 'affirmation', 'worthy', 'enough',
      ],
    },

    // These four ARE product types, and the rows already exist and are curated.
    'totes-and-travel-bags': { collections: ['bags'] },
    'mugs-and-drinkware': { collections: ['mugs', 'bottles'] },
    'hats-and-accessories': { collections: ['hats', 'jewellery', 'phone-case'] },
    'home-and-desk': {
      collections: ['home-decor', 'stationery', 'pillows-covers', 'rugs-mats', 'towels'],
    },
  },

  kids: {
    'dinosaur-world': {
      keywords: [
        'dinosaur', 'dinosaurs', 'dino', 'dinos', 'rex', 'raptor',
        // Coined names in the titles, which tokenize as single words.
        'rainbowsaurus', 'plantosaurus',
      ],
    },
    'capybara-club': { keywords: ['capybara', 'capybaras', 'capy'] },
    'cats-and-mischief': { keywords: ['cat', 'cats', 'kitty', 'kitten', 'meow'] },
    'imagination-and-positivity': {
      keywords: [
        'magic', 'magical', 'wizard', 'unicorn', 'stardust', 'celestial',
        'rainbow', 'shine', 'inspirational', 'imagination', 'dream', 'dreams',
        'astronaut', 'space', 'sky', 'limit', 'spirit', 'potion',
      ],
    },
    'tiger-tales': { keywords: ['tiger', 'tigers'] },
    'woodland-friends': {
      keywords: [
        'woodland', 'forest', 'fox', 'mouse', 'mushroom', 'owl', 'deer',
        'hedgehog', 'squirrel', 'bunny', 'rabbit',
      ],
    },
    halloween: {
      keywords: ['halloween', 'ghost', 'ghosts', 'spooky', 'pumpkin', 'witch', 'boo'],
    },
  },
};

/** The rail entry for a handle, so the page can use its display name verbatim. */
export function findBrowseCollection(audience: HomepageMode, handle: string) {
  return getHomepageContent(audience).browseCollections.items.find((i) => i.handle === handle);
}

/** The rule for a handle, if this audience has one. */
export function getBrowseCollectionRule(
  audience: HomepageMode,
  handle: string,
): BrowseCollectionRule | undefined {
  return BROWSE_COLLECTION_RULES[audience][handle];
}
