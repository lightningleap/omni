import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import CollectionClient from '@/components/CollectionClient';
import { resolveProductAttributes } from '@/utils/plp/productAttributes';

/**
 * Browse collections, and search results.
 *
 * This page used to be four lines that redirected to the home page, which
 * quietly broke two things at once: every "Browse Collections" link landed back
 * on the home page, and the header search — which pushes to
 * `/collections?q=…` — threw the query away and did the same.
 *
 * So it serves both jobs the links already assumed it did: with `?q=` it shows
 * matching products; without one it lists the collections that actually exist,
 * read from the database rather than a hand-kept list that can drift out of
 * step with it.
 */

export const revalidate = 3600;

interface CollectionsPageProps {
  searchParams: Promise<{ q?: string; audience?: string }>;
}

export async function generateMetadata({ searchParams }: CollectionsPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return q
    ? { title: `Search: ${q} | Unrwly`, robots: { index: false } }
    : { title: 'Collections | Unrwly', description: 'Every UNRWLY collection in one place.' };
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { q, audience } = await searchParams;
  const query = q?.trim();

  const audienceFilter =
    audience?.toLowerCase() === 'kids' ? ('KIDS' as const) : ('ADULT' as const);

  const { safeUser } = await getSessionUser();

  // ── Search ────────────────────────────────────────────────────────────────
  if (query) {
    const matches = await prisma.product.findMany({
      where: {
        status: 'LIVE',
        audience: audienceFilter,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { collection: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { collection: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 120,
    });

    const products = matches.map((p) => ({
      _id: p.id,
      variantId: '',
      name: p.name,
      slug: String(p.printifyId),
      image: p.imageUrl,
      secondaryImage: p.imageUrl,
      price: `$${p.price.toFixed(2)}`,
      rawPrice: p.price,
      category: p.collection?.name ?? 'UNRWLY',
      attributes: resolveProductAttributes({
        name: p.name,
        description: p.description,
        collectionName: p.collection?.name,
      }),
    }));

    if (products.length === 0) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <h1 className="type-h2 mb-3">No matches for “{query}”</h1>
          <p className="type-body text-neutral-500 max-w-sm mb-10">
            Try a shorter word — a colour, an animal, or a product type like mug or tote.
          </p>
          <Link
            href="/collections"
            className="type-button text-xs uppercase tracking-[0.18em] border-b border-current pb-1 hover:text-accent-800 transition-colors"
          >
            Browse all collections
          </Link>
        </div>
      );
    }

    return (
      <CollectionClient
        initialProducts={products}
        title={`Search: ${query}`}
        user={safeUser}
      />
    );
  }

  // ── Browse ────────────────────────────────────────────────────────────────
  // Only collections that have something to show: an empty one is a dead end,
  // and the storefront linking to dead ends is what started this.
  const collections = await prisma.collection.findMany({
    where: { products: { some: { status: 'LIVE', audience: audienceFilter } } },
    select: {
      id: true,
      name: true,
      handle: true,
      description: true,
      imageUrl: true,
      products: {
        where: { status: 'LIVE', audience: audienceFilter },
        select: { imageUrl: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { products: { where: { status: 'LIVE', audience: audienceFilter } } } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 max-w-2xl">
          <p className="type-label text-neutral-400 mb-3">The Archive</p>
          <h1 className="type-h1 mb-4">Collections</h1>
          <p className="type-body text-neutral-500">
            {collections.length} collections, printed to order and packed by hand.
          </p>
        </header>

        {collections.length === 0 ? (
          <p className="type-body text-neutral-500">
            Nothing published in this store yet.{' '}
            <Link href="/" className="underline hover:text-accent-800">Back to home</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {collections.map((c) => {
              const cover = c.imageUrl || c.products[0]?.imageUrl;

              return (
                <Link
                  key={c.id}
                  href={`/collections/${c.handle}?audience=${audienceFilter.toLowerCase()}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={c.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs uppercase tracking-widest">
                        {c.name}
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <h2 className="text-sm font-bold text-[#1A1A1A] group-hover:text-accent-800 transition-colors">
                      {c.name}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {c._count.products} {c._count.products === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
