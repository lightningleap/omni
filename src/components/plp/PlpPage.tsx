import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PlpClient from '@/components/plp/PlpClient';
import { getShopCategory } from '@/data/shopCategories';
import { getFilterConfig } from '@/filters';
import { NEW_FOR_DAYS } from '@/filters/shared';
import { matchesAnyKeyword, resolveProductAttributes } from '@/utils/plp/productAttributes';
import { ETSY_LISTINGS, ETSY_LISTINGS_BY_PRINTIFY_ID } from '@/data/etsyListings';
import { parseFilterState } from '@/utils/plp/filterUrl';
import type { PlpProduct, ShopAudience } from '@/types/plp';
import { getSessionUser } from "@/lib/auth";

/**
 * The Product Listing Page, as a server component.
 *
 * Extracted from the route so both route families — `/shop/<category>` and
 * `/kids/<age>` — are one call each. They differ only in which namespace of the
 * registry they look the slug up in; everything after that is identical, and
 * neither route file contains any logic worth duplicating.
 */

/**
 * Fetch the catalogue for one audience, with a real best-seller count per
 * product (aggregated from OrderItem — the only genuine popularity signal the
 * schema carries).
 *
 * ── ONLY PRODUCTS THAT ARE REALLY ON ETSY ───────────────────────────────────
 * Narrowed to the Printify ids currently PUBLISHED to Etsy, exactly as
 * `getHomepageData` has always been. Without it these pages listed the whole
 * catalogue: measured against the live shops, 152 LIVE Adult rows for 87
 * listings and 35 Kids rows for 52 — so 91 Adult and 11 Kids products were on
 * the site that a customer could not find after clicking through. The homepage
 * showed one catalogue and the shop pages another, from the same database.
 *
 * ── THE LISTING IS THE SOURCE OF TRUTH, THE ROW IS THE IDENTITY ─────────────
 * Also as on the homepage: the database row supplies identity (its id, its
 * Printify id, when it was created, what it has sold) so cart, wishlist and
 * product pages keep working untouched, while the LISTING supplies the title,
 * price, image and destination — the four things that have to match Etsy, and
 * the four the stored copy goes stale on. A number of stored image URLs have
 * already expired against the older Printify hosts; the listing's image is the
 * one Etsy is serving now.
 *
 * Attributes are resolved from the FULL listing title rather than the shortened
 * one, because the keywords trimmed for display are exactly where the colour
 * and product type usually are.
 */
export async function getCatalogue(
  audience: ShopAudience,
  /**
   * Narrows to a single collection. Used by `/collections/<handle>`, which is
   * the same listing page scoped to one collection's products rather than the
   * whole audience catalogue. Omitted → the full catalogue, which is what the
   * category pages and the virtual "New Arrivals" handle both want.
   */
  options?: {
    collectionId?: string;
    /**
     * Ids of several collections, for a Browse Collections section that spans
     * more than one product type — "Home & Desk" is home-decor + stationery +
     * pillows + rugs + towels. Applied in the WHERE clause, so a section that
     * resolves this way costs exactly what a single-collection page costs.
     */
    collectionIds?: string[];
    /**
     * Whole-token matches against the Etsy listing TITLE, for a section that
     * describes a theme the database has no column for. Applied after the
     * query, because the title lives in the static Etsy registry rather than
     * in Postgres — the same registry every card already reads its name and
     * price from, so this adds no fetch.
     */
    titleKeywords?: string[];
  },
): Promise<PlpProduct[]> {
  const listings = ETSY_LISTINGS_BY_PRINTIFY_ID[audience];
  const etsyPrintifyIds = ETSY_LISTINGS[audience].map((l) => l.printifyId);

  try {
    const [products, sales] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'LIVE',
          audience: audience === 'kids' ? 'KIDS' : 'ADULT',
          printifyId: { in: etsyPrintifyIds },
          ...(options?.collectionId ? { collectionId: options.collectionId } : {}),
          ...(options?.collectionIds?.length
            ? { collectionId: { in: options.collectionIds } }
            : {}),
        },
        include: { collection: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true } }),
    ]);

    const unitsByProduct = new Map(sales.map((row) => [row.productId, row._sum.quantity ?? 0]));
    const newCutoff = Date.now() - NEW_FOR_DAYS * 24 * 60 * 60 * 1000;

    return products
      // Belt and braces against the `in` clause: a row whose Printify id is not
      // in this audience's listings cannot produce a card, so an Adult listing
      // can never attach itself to a Kids row even if the ids ever collided.
      .filter((p) => listings.has(String(p.printifyId)))
      // A themed Browse Collections section, matched on the listing title.
      // Runs before the map so a narrowed section does no work per excluded row.
      .filter((p) =>
        options?.titleKeywords?.length
          ? matchesAnyKeyword(listings.get(String(p.printifyId))!.title, options.titleKeywords)
          : true,
      )
      .map((p) => {
        // Non-null by construction — filtered on this same lookup above.
        const listing = listings.get(String(p.printifyId))!;

        return {
          _id: p.id,
          // The Etsy title trimmed to its product clause. The full listing title
          // is written for Etsy's search engine and runs to a dozen keywords,
          // which no product card can show.
          name: listing.displayTitle,
          slug: String(p.printifyId),
          image: listing.image,
          secondaryImage: listing.image,
          price: `$${listing.price.toFixed(2)}`,
          rawPrice: listing.price,
          category: p.collection?.name ?? 'UNRWLY',
          attributes: resolveProductAttributes({
            name: listing.title,
            description: p.description,
            collectionName: p.collection?.name,
          }),
          createdAt: p.createdAt.toISOString(),
          unitsSold: unitsByProduct.get(p.id) ?? 0,
          isNew: p.createdAt.getTime() >= newCutoff,
          etsyUrl: listing.etsyUrl,
        };
      });
  } catch (error) {
    console.error(`Failed to load the ${audience} catalogue:`, error);
    return [];
  }
}

export default async function PlpPage({
  slug,
  basePath = '/shop',
  searchParams,
}: {
  slug: string;
  basePath?: '/shop' | '/kids';
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const category = getShopCategory(slug, basePath);
  if (!category) notFound();

  const { user, isAdmin } = await getSessionUser();

  const safeUser = user
    ? { id: user.id, email: user.email, role: isAdmin ? 'ADMIN' : 'CUSTOMER' }
    : null;

  const products = await getCatalogue(category.audience);

  // Seed the client from the URL, validated against this audience's own config,
  // so a shared or bookmarked link opens on exactly the filtered view it names.
  const initialState = parseFilterState(searchParams, getFilterConfig(category.audience));

  return (
    <PlpClient
      category={category}
      products={products}
      initialState={initialState}
      user={safeUser}
    />
  );
}
