import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PlpClient from '@/components/plp/PlpClient';
import { getShopCategory } from '@/data/shopCategories';
import { getFilterConfig } from '@/filters';
import { NEW_FOR_DAYS } from '@/filters/shared';
import { resolveProductAttributes } from '@/utils/plp/productAttributes';
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
 */
export async function getCatalogue(audience: ShopAudience): Promise<PlpProduct[]> {
  try {
    const [products, sales] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'LIVE', audience: audience === 'kids' ? 'KIDS' : 'ADULT' },
        include: { collection: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true } }),
    ]);

    const unitsByProduct = new Map(sales.map((row) => [row.productId, row._sum.quantity ?? 0]));
    const newCutoff = Date.now() - NEW_FOR_DAYS * 24 * 60 * 60 * 1000;

    return products.map((p) => ({
      _id: p.id,
      name: p.name,
      slug: String(p.printifyId),
      image: p.imageUrl,
      secondaryImage: p.imageUrl,
      price: `$${(p.price || 0).toFixed(2)}`,
      rawPrice: p.price || 0,
      category: p.collection?.name ?? 'UNRWLY',
      attributes: resolveProductAttributes({
        name: p.name,
        description: p.description,
        collectionName: p.collection?.name,
      }),
      createdAt: p.createdAt.toISOString(),
      unitsSold: unitsByProduct.get(p.id) ?? 0,
      isNew: p.createdAt.getTime() >= newCutoff,
    }));
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
