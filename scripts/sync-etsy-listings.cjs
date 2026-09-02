/**
 * Regenerate `src/data/etsyListings.ts` from the shop's live Etsy catalogue.
 *
 *     node scripts/sync-etsy-listings.cjs
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The storefront should only show products a customer can actually find on
 * Etsy, and each card should link to that exact listing. Neither fact lives in
 * our database: `Product` stores a Printify id, not an Etsy listing URL.
 *
 * ── WHY PRINTIFY IS THE SOURCE, NOT ETSY ────────────────────────────────────
 * Etsy blocks automated requests outright (both shop pages return 403), so
 * scraping is not an option — and it would be the wrong one anyway: fragile,
 * rate-limited, and dependent on their HTML.
 *
 * Printify is the better source because it is the SYSTEM OF RECORD. Both shops
 * here (`UNRWLY Adult`, `UNRWLY Kids`) are Printify stores whose `sales_channel`
 * is `etsy` — Printify is what publishes the listings in the first place. Its
 * API returns, per product, the `external.handle` Etsy assigned it, which IS the
 * canonical listing URL. So a product carrying a handle is, by definition,
 * published to Etsy; one without a handle is not, and must not be shown as if it
 * were.
 *
 * ── RUN IT WHEN THE CATALOGUE MOVES ─────────────────────────────────────────
 * This runs by hand, never per request. The generated file is committed, so the
 * site has no runtime dependency on Printify or Etsy being up, and page loads
 * cost nothing. Re-run it when listings are added, retired or repriced.
 */

const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(process.cwd(), 'src', 'data', 'etsyListings.ts');

/** Storefront mode → the Printify shop that publishes that Etsy store. */
const SHOPS = [
  { mode: 'adult', id: '12699407', label: 'UNRWLY Adult', etsy: 'https://www.etsy.com/shop/Unrwly' },
  { mode: 'kids', id: '27560160', label: 'UNRWLY Kids', etsy: 'https://www.etsy.com/shop/UNRWLYkids' },
];

function readToken() {
  const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  const match = env.match(/^PRINTIFY_API_TOKEN=(.*)$/m);
  if (!match) throw new Error('PRINTIFY_API_TOKEN not found in .env');
  return match[1].trim().replace(/^["']|["']$/g, '');
}

async function fetchPage(token, shopId, page) {
  const res = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products.json?limit=50&page=${page}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Printify ${res.status} for shop ${shopId} page ${page}`);
  return res.json();
}

/**
 * The price a customer pays, in dollars.
 *
 * Printify prices per variant in cents and a product's variants differ (a 2XL
 * costs more than an S). The lowest ENABLED variant is what a storefront quotes
 * as the product's price, which is also how the listing reads on Etsy.
 */
function lowestEnabledPrice(product) {
  const enabled = (product.variants || []).filter((v) => v.is_enabled);
  if (!enabled.length) return null;
  return Math.min(...enabled.map((v) => v.price)) / 100;
}

function defaultImage(product) {
  const images = product.images || [];
  const preferred = images.find((i) => i.is_default) || images.find((i) => i.is_selected_for_publish) || images[0];
  return preferred ? preferred.src : null;
}

/**
 * A short display title.
 *
 * Etsy titles are written for its search engine, not for a product card —
 * "Oui Mais Non Sweatshirt, French Girl Aesthetic, Paris Inspired Sweatshirt,
 * Francophile Gift, Paris Vacation Sweater". The first comma-delimited clause is
 * reliably the product itself; the rest are keywords. Keeping the full title as
 * well means nothing is lost and the card can show either.
 */
function displayTitle(title) {
  const first = String(title).split(/\s*[,|]\s*/)[0].trim();
  return first.length >= 8 ? first : String(title).trim();
}

async function collect(token, shop) {
  const listings = [];
  let page = 1;
  let total = 0;

  for (;;) {
    const body = await fetchPage(token, shop.id, page);
    total = body.total ?? 0;
    const batch = body.data || [];
    if (!batch.length) break;

    for (const product of batch) {
      // The two conditions that make a product genuinely available on Etsy.
      const handle = product.external && product.external.handle;
      if (!product.visible || !handle) continue;
      if (!/^https:\/\/www\.etsy\.com\/listing\//.test(handle)) continue;

      const image = defaultImage(product);
      const price = lowestEnabledPrice(product);
      if (!image || price === null) continue;

      listings.push({
        printifyId: String(product.id),
        etsyListingId: String(product.external.id),
        title: String(product.title).trim(),
        displayTitle: displayTitle(product.title),
        price,
        image,
        etsyUrl: handle,
      });
    }

    if (batch.length < 50) break;
    page += 1;
    if (page > 40) break; // paranoia stop
  }

  // Deterministic order — Printify's own storefront order, then id as a
  // tie-break. Explicitly NOT random: the feed must render the same products on
  // every load, or screenshots, QA and merchandising all become guesswork.
  listings.sort((a, b) => a.printifyId.localeCompare(b.printifyId));

  return { listings, total };
}

(async () => {
  const token = readToken();
  const result = {};

  for (const shop of SHOPS) {
    const { listings, total } = await collect(token, shop);
    result[shop.mode] = listings;
    console.log(
      `${shop.label.padEnd(13)} ${String(listings.length).padStart(3)} live Etsy listings ` +
      `(of ${total} products in the Printify shop)`
    );
  }

  const body = `/**
 * Etsy listings, generated — DO NOT EDIT BY HAND.
 *
 * Regenerate with:  node scripts/sync-etsy-listings.cjs
 *
 * Every entry below is a product that is currently published to Etsy from the
 * shop's own Printify store, carrying the listing URL Etsy assigned it. A
 * product that is not published to Etsy is not in this file, which is what lets
 * the storefront show only products a customer can actually go and find.
 *
 * Keyed by \`printifyId\`, which is the same value \`Product.printifyId\` holds —
 * that join is how a catalogue row becomes an Etsy-backed product.
 *
 * Sources:
 *   adult  https://www.etsy.com/shop/Unrwly
 *   kids   https://www.etsy.com/shop/UNRWLYkids
 *
 * The catalogue moves. Re-run the script when listings are added, retired or
 * repriced rather than editing entries here.
 */

/** One product as it is currently listed on Etsy. */
export interface EtsyListing {
  /** Matches \`Product.printifyId\` in the database. */
  printifyId: string;
  /** Etsy's own listing id. */
  etsyListingId: string;
  /** The listing title, verbatim. */
  title: string;
  /** The title trimmed to its product clause, for the card. */
  displayTitle: string;
  /** Lowest enabled variant price, in dollars. */
  price: number;
  /** The listing's primary image. */
  image: string;
  /** The exact listing URL. */
  etsyUrl: string;
}

export type EtsyListingsByMode = Record<'adult' | 'kids', EtsyListing[]>;

export const ETSY_LISTINGS: EtsyListingsByMode = ${JSON.stringify(result, null, 2)};

/** Lookup by Printify id, scoped to one storefront so the two can never mix. */
export const ETSY_LISTINGS_BY_PRINTIFY_ID: Record<'adult' | 'kids', Map<string, EtsyListing>> = {
  adult: new Map(ETSY_LISTINGS.adult.map((l) => [l.printifyId, l])),
  kids: new Map(ETSY_LISTINGS.kids.map((l) => [l.printifyId, l])),
};
`;

  fs.writeFileSync(OUT, body);
  console.log(`\nwrote ${path.relative(process.cwd(), OUT)}`);
})().catch((e) => {
  console.error('sync failed:', e.message);
  process.exit(1);
});
