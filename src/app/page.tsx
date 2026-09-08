import React from 'react';
import { closeSync, existsSync, openSync, readSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import CommunitySection from "@/components/CommunitySection";
import { prisma } from "@/lib/prisma";

// ── Mode-aware homepage sections ──────────────────────────────────────────
// One homepage, two modes (Adult / Kids). The page below owns the layout and
// the section ORDER; each of these components owns one section's content and
// reads it from the mode the header toggle has selected. Nothing here branches
// on the audience — see src/data/homepage/* for what each mode contributes.
//
// The order:
//   brand plate → welcome → three promotional windows → Browse Collections →
//   products → Etsy record + reviews → follow → community → newsletter → footer.
//
// Two things moved. The full-viewport video hero is gone: the welcome block that
// replaced it is a fifth of the height, and the film now plays inside the middle
// promotional window, where it merchandises instead of blocking. And the shop's
// Etsy record — its trading history and its customers' own words — sits directly
// after the catalogue rather than nowhere at all, because for a one-person
// studio that record is the strongest thing on the page. The record and the
// reviews used to be two stacked sections repeating each other's figures; they
// are now one two-column section.
//
// Adult and Kids run the identical structure; the collections, the categories,
// the copy, the statistics, the reviews and the shop links all differ.
import BrandBannerSection, { type BrandBannerMap } from "@/components/home/BrandBannerSection";
import WelcomeSection from "@/components/home/WelcomeSection";
import FeaturedCollectionsSection from "@/components/home/FeaturedCollectionsSection";
import BrowseCollectionsSection from "@/components/home/BrowseCollectionsSection";
import ProductFeedSection from "@/components/home/ProductFeedSection";
import EtsyLegacySection from "@/components/home/EtsyLegacySection";
import FollowUnrwlySection from "@/components/home/FollowUnrwlySection";
import {
  HOMEPAGE_CONTENT,
  sharedHomepage,
  type HomepageDataByMode,
  type HomepageMode,
} from "@/data/homepage";
import { ETSY_LISTINGS, ETSY_LISTINGS_BY_PRINTIFY_ID } from "@/data/etsyListings";
import { resolveProductCategoryId } from "@/data/productCategories";
import { findStudioImage, findStudioImages } from "@/lib/studioAssets";
import { resolveProductAttributes } from "@/utils/plp/productAttributes";

import { getSessionUser } from "@/lib/auth";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// The homepage feed is now the page's primary content rather than one rail among
// several, so it carries more of the catalogue than the old 20-product row.
//
// It is also grouped into category strips now (T-Shirts, Hoodies & Sweatshirts,
// Totes & Bags, Hats & Accessories, Mugs — see `data/productCategories.ts`), and
// a cap of 24 was making that structure lie: the 24 newest rows are not spread
// evenly across the shop's product types, so whole categories rendered with two
// products in them or not at all. The ceiling now sits above the live Etsy
// catalogue on both shops (69 Adult / 44 Kids), so every strip is complete. Each
// strip is a horizontal rail, so the extra cards cost no vertical space and
// their images stay lazy — only the first few in the feed are fetched eagerly.
const FEED_SIZE = 120;

// ── BRAND BANNERS ───────────────────────────────────────────────────────────
// The plate between the header and the hero — one per storefront mode. Adult
// carries the UNRWLY lockup, Kids the UNRWLY KIDS one; BrandBannerSection
// renders whichever matches the selected mode, so the two can never appear
// together. Adding a mode later is another entry here, not another component.
//
// Checked for rather than rendered blind: the artwork is a file the studio drops
// in, and a missing one would otherwise put a broken image at the very top of
// the homepage. Present → it renders; absent → that mode opens on the hero as it
// did before, and the server logs which file it was looking for. The check runs
// at most once per ISR window (60s), not per request.
const BRAND_BANNER_FILES: Record<HomepageMode, { base: string; label: string; alt: string }> = {
  adult: {
    base: 'unrwly-banner',
    label: 'UNRWLY — apparel for the delightfully unruly',
    alt: 'UNRWLY — apparel for the delightfully unruly. Original illustrated designs: tees, tanks, gifts.',
  },
  kids: {
    base: 'unrwly-kids-banner',
    label: 'UNRWLY Kids — little humans, big energy',
    alt: 'UNRWLY Kids — little humans, big energy. Original illustrated designs: tees, tanks, gifts.',
  },
};

// Whichever the studio exports, in preference order. Accepting both spares
// anyone re-encoding artwork just to satisfy a filename — a JPEG export is a
// perfectly good banner, and re-saving it as PNG would only lose quality.
const BANNER_EXTENSIONS = ['.png', '.jpg', '.jpeg'] as const;

/**
 * An image's real pixel size, read out of its own header.
 *
 * The plate renders at its own natural aspect ratio, so the `<Image>` needs the
 * file's true dimensions: a hard-coded guess would letterbox or squash artwork
 * shaped even slightly differently, and the two banners are not the same shape.
 * Reading them here is what keeps the promise in public/brand/README.md — drop
 * in new artwork, change no code.
 *
 * Both formats are parsed rather than decoded — a couple of dozen bytes each,
 * no image library — and this runs at most once per ISR window.
 */
function readPngSize(head: Buffer): { width: number; height: number } | null {
  // Bytes 12–16 are the first chunk's type; a valid PNG always opens on IHDR,
  // whose width and height are the two 32-bit ints that follow.
  if (head.length < 24 || head.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

function readJpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null; // SOI

  // Walk the segment chain to the frame header, which is the only segment that
  // carries the image's dimensions. Every segment states its own length, so
  // this steps over the comment/quantisation/EXIF payloads without parsing them.
  let offset = 2;
  while (offset + 4 <= buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    // Standalone markers (padding, RSTn) carry no length field.
    if (marker === 0xff) { offset += 1; continue; }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) { offset += 2; continue; }

    const length = buf.readUInt16BE(offset + 2);
    // SOF0–SOF15 hold the frame; the four that are not frame headers (DHT, JPG,
    // DAC, and the 0xC8 reserved marker) are excluded.
    const isFrameHeader =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrameHeader) {
      if (offset + 9 > buf.length) return null;
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function readImageSize(absPath: string): { width: number; height: number } | null {
  let fd: number | undefined;
  try {
    fd = openSync(absPath, 'r');
    // Enough for a PNG header outright, and for the JPEG segments that precede
    // the frame header in any normal export (EXIF and colour profiles included).
    const buf = Buffer.alloc(65_536);
    const read = readSync(fd, buf, 0, buf.length, 0);
    if (read <= 0) return null;
    const head = buf.subarray(0, read);

    // Sniffed, not taken from the extension. Exports arrive named by whatever
    // the design tool was set to, and a PNG saved as `.jpeg` used to fall to the
    // JPEG parser, return null, and take the banner off the homepage with only a
    // line in the server log to say so. The two signatures are unmistakable.
    const isPng =
      head.length >= 8 && head.readUInt32BE(0) === 0x89504e47 && head.readUInt32BE(4) === 0x0d0a1a0a;
    const size = isPng ? readPngSize(head) : readJpegSize(head);
    return size && size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

function getBrandBanners(): BrandBannerMap {
  const banners: BrandBannerMap = {};

  for (const mode of Object.keys(BRAND_BANNER_FILES) as HomepageMode[]) {
    const { base, label, alt } = BRAND_BANNER_FILES[mode];
    const dir = path.join(process.cwd(), 'public', 'brand');
    const file = BANNER_EXTENSIONS.map((ext) => `${base}${ext}`).find((name) =>
      existsSync(path.join(dir, name))
    );

    if (!file) {
      console.warn(
        `[homepage] ${mode} brand banner not rendered: no public/brand/${base}${BANNER_EXTENSIONS.join(' | ')} found. ` +
        `Save the banner artwork there (see public/brand/README.md).`
      );
      continue;
    }

    const size = readImageSize(path.join(dir, file));
    if (!size) {
      console.warn(
        `[homepage] ${mode} brand banner not rendered: public/brand/${file} could not be read as an image.`
      );
      continue;
    }

    banners[mode] = { src: `/brand/${file}`, ...size, label, alt };
  }

  return banners;
}

/**
 * Real category thumbnails, wherever the studio has saved one.
 *
 * The Browse Collections circles ship on-brand placeholder photography, because
 * the shop's real imagery is exported by hand from its Etsy listings. Rather
 * than wait for all twenty files or hard-code paths to images that don't exist,
 * this looks for `public/categories/<mode>-<id>.jpg` (or .png / .webp) and hands
 * back only the ones that are actually there. A category with a real file uses
 * it; one without keeps its placeholder. Same "drop the file in, change no code"
 * contract as the brand banners — see public/categories/README.md.
 *
 * Runs at most once per ISR window (60s), not per request.
 */
function getCategoryImages(): Record<string, string> {
  const bases = (Object.keys(HOMEPAGE_CONTENT) as HomepageMode[]).flatMap((mode) =>
    HOMEPAGE_CONTENT[mode].browseCollections.items.map((item) => `${mode}-${item.id}`)
  );

  return findStudioImages('categories', bases);
}

/**
 * The badge a product card shows above its name — derived, never authored.
 *
 * "Best Seller" is the shop's genuine top sellers by units actually ordered;
 * "New" is a row published in the last month. A product that is neither gets no
 * badge at all: a grid where every card is flagged is a grid where no flag means
 * anything, and inventing one would be the same lie as inventing a review.
 */
const NEW_FOR_DAYS = 30;
const BESTSELLER_COUNT = 3;

function deriveProductTags(
  rows: { id: string; createdAt: Date }[],
  unitsByProduct: Map<string, number>
): Map<string, string> {
  const tags = new Map<string, string>();

  // Top sellers first, so a product that is both new and a bestseller says the
  // more persuasive of the two.
  const bestsellers = [...rows]
    .filter((row) => (unitsByProduct.get(row.id) ?? 0) > 0)
    .sort((a, b) => (unitsByProduct.get(b.id) ?? 0) - (unitsByProduct.get(a.id) ?? 0))
    .slice(0, BESTSELLER_COUNT);

  for (const row of bestsellers) tags.set(row.id, 'Best Seller');

  const newCutoff = Date.now() - NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
  for (const row of rows) {
    if (!tags.has(row.id) && row.createdAt.getTime() >= newCutoff) tags.set(row.id, 'New');
  }

  return tags;
}

// Retry once on transient connection blips (e.g. Supabase pooler cold-start)
// so a momentary timeout self-heals instead of falling back to an empty feed.
async function withRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 800): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const msg = String((error as Error)?.message ?? error);
    const transient = /timeout|ETIMEDOUT|ECONNRESET|Connection terminated|connect/i.test(msg);
    if (retries > 0 && transient) {
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

/**
 * Everything the homepage needs, in one round trip.
 *
 * ── ONE QUERY, TWO FEEDS ────────────────────────────────────────────────────
 * The two storefronts used to be served the identical rows, which meant the
 * Adult homepage could open on a wall of children's mockups. `Product.audience`
 * has always carried the answer, so the feed now splits on it: Adult shows
 * ADULT rows, Kids shows KIDS rows, and neither can show the other's. It is
 * still ONE query — filtering in memory after the fetch, rather than issuing two
 * — because both feeds render on every page load (the mode toggle is a client
 * switch, with no server round trip) and a single ordered read is cheaper than
 * two.
 *
 * ── ONLY PRODUCTS THAT ARE REALLY ON ETSY ───────────────────────────────────
 * The query is narrowed to the Printify ids that are currently PUBLISHED to
 * Etsy (see data/etsyListings.ts). The catalogue holds far more than the shops
 * list — 227 Adult rows against 69 live listings — so without this the feed
 * would show products a customer could not find after clicking through to the
 * shop, which is exactly the mismatch the Etsy trust sections below are meant
 * to rule out.
 *
 * Narrowing in the WHERE clause rather than after the fetch also means the
 * database returns roughly a hundred rows instead of three hundred.
 *
 * `FEED_SIZE` is applied per audience after the split, so a catalogue that is
 * mostly adult still fills the Kids feed instead of returning two rows.
 */
async function getHomepageData() {
  const etsyPrintifyIds = [
    ...ETSY_LISTINGS.adult.map((l) => l.printifyId),
    ...ETSY_LISTINGS.kids.map((l) => l.printifyId),
  ];

  try {
    const [dbProducts, config, productSales] = await withRetry(() => Promise.all([
      prisma.product.findMany({
        where: { status: 'LIVE', printifyId: { in: etsyPrintifyIds } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.storeConfig.findUnique({ where: { id: "global" } }),
      // Real units sold per product — the only genuine popularity signal the
      // schema carries. Backs the "Best Selling" sort in the section header.
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true } })
    ]));

    const unitsByProduct = new Map(
      productSales.map((row) => [row.productId, row._sum.quantity ?? 0])
    );

    /**
     * Build one audience's feed, with the Etsy listing as the source of truth
     * for what the customer sees.
     *
     * The database row supplies identity (its id, its Printify id) so the cart,
     * wishlist and product pages keep working exactly as before. The LISTING
     * supplies the title, the price, the image and the destination — because
     * those are the four things that have to match what is on Etsy, and the
     * database copy of them can be months stale. A number of the stored image
     * URLs have already expired (the server log is full of 400s and 403s from
     * the older Printify hosts); the listing's image is the one Etsy is serving
     * right now.
     *
     * The lookup is scoped to this audience, so an Adult listing cannot attach
     * itself to a Kids row even if the two catalogues ever shared an id.
     */
    const toFeed = (rows: typeof dbProducts, mode: 'adult' | 'kids') => {
      const listings = ETSY_LISTINGS_BY_PRINTIFY_ID[mode];
      const page = rows
        .filter((p) => listings.has(String(p.printifyId)))
        .slice(0, FEED_SIZE);

      // Tags are derived within the audience, so the Kids feed names its own
      // bestsellers rather than inheriting whatever happens to top the catalogue.
      const tagsByProduct = deriveProductTags(page, unitsByProduct);

      return page.map((p) => {
        // Non-null by construction: `page` is filtered on this same lookup.
        const listing = listings.get(String(p.printifyId))!;

        return {
          _id: p.id,
          // The Etsy title, shortened to its product clause — the full listing
          // title is written for Etsy's search engine and runs to a dozen
          // keywords, which no product card can show.
          name: listing.displayTitle,
          slug: String(p.printifyId),
          price: `$${listing.price.toFixed(2)}`,
          rawPrice: listing.price,
          image: listing.image,
          description: p.description || "",
          category: "UNRWLY",
          createdAt: p.createdAt.toISOString(),
          unitsSold: unitsByProduct.get(p.id) ?? 0,
          tag: tagsByProduct.get(p.id),
          /** The exact listing this product is sold as on Etsy. */
          etsyUrl: listing.etsyUrl,
          // Which category strip the feed puts this product in. Resolved from
          // the FULL Etsy title, not the shortened one: the listing's own words
          // are where the product type is actually named ("… Sturdy Tote Bag",
          // "… 15oz Mug"), and the clause trimmed for display sometimes takes
          // the noun with it. See data/productCategories.ts.
          categoryId: resolveProductCategoryId(listing.title),
          // Colour and age are resolved by the shared catalogue adapter — the
          // same one the Product Listing Pages use — so the feed's sorts read
          // the same attributes everywhere, and the card's always-visible colour
          // swatches draw the same colours the filter panel would match. Run
          // against the FULL Etsy title, not the shortened one: the keywords
          // trimmed for display are exactly where the colour usually is.
          attributes: resolveProductAttributes({ name: listing.title }),
        };
      });
    };

    return {
      adultProducts: toFeed(dbProducts.filter((p) => p.audience === 'ADULT'), 'adult'),
      kidsProducts: toFeed(dbProducts.filter((p) => p.audience === 'KIDS'), 'kids'),
      config,
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);
    return { adultProducts: [], kidsProducts: [], config: null };
  }
}

export default async function Home() {
  const { user, isAdmin } = await getSessionUser();

  const { adultProducts, kidsProducts, config } = await getHomepageData();
  const brandBanners = getBrandBanners();
  const categoryImages = getCategoryImages();
  // The studio photograph beside the welcome copy. Save one as
  // `public/brand/studio.jpg` and it replaces the section's placeholder — same
  // drop-in contract as the brand banners and the category thumbnails.
  const studioImage = findStudioImage('brand', 'studio');

  // Drives the "nothing published yet" state and whether the community rail
  // renders — true if EITHER storefront has stock, since the toggle can reach
  // both without a page load.
  const hasProducts = adultProducts.length > 0 || kidsProducts.length > 0;


  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  // ── Catalogue data, keyed by storefront mode ──────────────────────────────
  // Each mode gets its own audience's rows (see `getHomepageData`), so the
  // Adult homepage can no longer open on a wall of children's mockups and the
  // Kids homepage never shows adult designs. The toggle is a client-side
  // switch, so both sets are sent and the swap costs no round trip.
  const homepageData: HomepageDataByMode = {
    adult: { products: adultProducts },
    kids: { products: kidsProducts },
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="relative z-10 flex flex-col">
      {/* ── ANNOUNCEMENT BAR ──────────────────────────────── */}
      {config?.promoAnnouncement && (
        <div className="bg-accent text-accent-on py-2 text-center text-[10px] font-semibold uppercase tracking-[0.3em] sticky top-0 z-[60]">
          {config.promoAnnouncement}
        </div>
      )}

      {/* ── BRAND BANNER (PER MODE) ───────────────────────── */}
      {/* Sits between the header and the hero. The selected mode picks the
          artwork — Adult the UNRWLY lockup, Kids the UNRWLY KIDS one — so only
          ever one plate renders, and a mode with no artwork renders none. */}
      <BrandBannerSection banners={brandBanners} />

      {/* ── WELCOME / BRAND INTRO ─────────────────────────── */}
      {/* What used to be a 92–110vh video banner. The film did not go away — it
          moved into the middle promotional window below, which is the whole
          point: it merchandises there instead of costing a viewport here.
          The studio photograph beside the copy is resolved from disk if the
          studio has saved one; otherwise the section falls back to its own
          on-brand placeholder. */}
      <WelcomeSection studioImage={studioImage} />

      {/* ── THREE PROMOTIONAL WINDOWS ─────────────────────── */}
      {/* Bestsellers · the film · Seasonal. Same card, same dimensions, equal
          weight; the video slot is decided in the mode's data, not here. */}
      <FeaturedCollectionsSection videoUrls={config?.heroVideoUrls} />

      {/* ── BROWSE COLLECTIONS (CATEGORY CIRCLES) ── */}
      {/* Per mode, not shared: Adult browses its own Etsy sections and Kids
          browses Dinosaur World, Capybara Club and the rest. */}
      <BrowseCollectionsSection imageOverrides={categoryImages} />

      {/* ── MAIN PRODUCT FEED ─────────────────────────────── */}
      <ProductFeedSection data={homepageData} user={safeUser} />

      {/* ── ETSY RECORD + CUSTOMER REVIEWS ────────────────── */}
      {/* Placed after the catalogue on purpose. A shopper who has just scrolled
          two dozen products is exactly the person deciding whether to trust the
          shop with a card number; this is the answer, with the Etsy page one
          click away to be checked.

          One section, two columns: the shop's claim on the left, the customers
          who back it on the right. "Loved on Etsy" used to be a second section
          directly below this one, and the four-card statistics grid that used to
          fill this section's right side repeated the very figures those reviews
          already carried. The grid is gone and the reviews moved into its place. */}
      <EtsyLegacySection />

      {/* ── FOLLOW UNRWLY ─────────────────────────────────── */}
      {/* The last step of the trust argument: record → what customers said →
          where to keep watching. The icons used to live under the statistics
          above, where they were the easiest thing on the page to miss. */}
      <FollowUnrwlySection />

      {/* ── SOCIAL FEED ───────────────────────────────────── */}
      {/* Kept and given a little more weight: for a small studio, real customers
          wearing the work is the trust signal a marketplace can't fake. */}
      {hasProducts && <CommunitySection />}

      {/* ── EMPTY STATE (nothing published yet) ───────────── */}
      {!hasProducts && (
        <section className="py-40 flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-16 bg-black/[0.04] rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={24} className="text-neutral-400" />
            </div>
            <h2 className="type-h2 text-ink">Collection Drop Coming Soon</h2>
            <p className="type-body text-neutral-500">
              We are curating the next UNRWLY drop. Head to Admin to sync products from Printify.
            </p>
            <Link
              href="/admin/products"
              className="type-button inline-flex items-center gap-2 mt-6 bg-accent text-accent-on text-[11px] uppercase tracking-widest px-8 py-4 rounded-full hover:bg-accent-800 hover:text-accent-on-strong hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgb(var(--accent-ring-rgb)/0.5)] transition-[background-color,transform,box-shadow] duration-200 ease-out"
            >
              Go to Admin <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ───────────────────────────────────── */}
      {/* Shared across modes — one list, both audiences. Layout unchanged; only
          the vertical rhythm was eased to match the sections above it. */}
      {/* The whole band is an accent ground, so every foreground in it — the
          heading, the muted copy, the field, its placeholder, the button — is
          expressed as `--accent-on` rather than as white. Adult is unchanged:
          `--accent-on` IS white there. Kids inverts to a deep teal on its
          brighter mint, which is the only way this band stays readable. */}
      <section className="py-28 md:py-32 bg-accent">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="type-label mb-4 text-accent-on/[0.72]">{sharedHomepage.newsletter.label}</p>
          <h2 className="type-section-title mb-3 text-accent-on">
            {sharedHomepage.newsletter.title}
          </h2>
          <p className="type-body mb-9 text-accent-on/[0.72]">{sharedHomepage.newsletter.subtitle}</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder={sharedHomepage.newsletter.placeholder}
              aria-label={sharedHomepage.newsletter.placeholder}
              className="flex-grow bg-accent-on/[0.06] border border-accent-on/20 rounded-full px-6 py-4 text-accent-on placeholder:text-accent-on/55 focus:outline-none focus:border-accent-on/45 focus:bg-accent-on/[0.09] transition-colors text-sm"
            />
            {/* Inverted against the band: the button takes the band's own
                foreground as its ground and the accent as its text, so it
                separates from the band in both modes rather than being a white
                pill that all but disappears on Kids' brighter mint. */}
            <button className="type-button bg-accent-on text-accent rounded-full px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.4)] transition-[transform,box-shadow] duration-200 ease-out shrink-0">
              {sharedHomepage.newsletter.submitLabel}
            </button>
          </form>
        </div>
      </section>
      </div>
    </div>
  );
}
