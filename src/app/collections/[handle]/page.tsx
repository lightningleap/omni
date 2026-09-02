import React from 'react';
import { notFound } from 'next/navigation';
import CollectionClient from '@/components/CollectionClient';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { resolveProductAttributes } from '@/utils/plp/productAttributes';
import { getSessionUser } from "@/lib/auth";

export const revalidate = 3600; // ISR: 1 hour

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ audience?: string }>;
}

export default async function IndividualCollectionPage({ params, searchParams }: CollectionPageProps) {
  const { handle } = await params;
  const { audience } = await searchParams;
  // ADULT / KIDS narrowing driven by the storefront nav.
  //
  // A missing param defaults to ADULT rather than "every audience". The nav
  // toggle is always showing one mode or the other, so an unscoped grid puts
  // toddler tees under a toggle that reads "Adult". The nav corrects the URL to
  // the shopper's persisted mode on mount, but that happens after this render —
  // defaulting here means the mixed grid never paints at all.
  const audienceFilter =
    audience?.toLowerCase() === 'kids' ? 'KIDS' as const : 'ADULT' as const;
  const { user, isAdmin } = await getSessionUser();


  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  // Fetch the collection by handle with visibility check
  const collection = await prisma.collection.findUnique({
    where: { 
      handle
    },
    include: {
      products: {
        where: { status: 'LIVE', ...(audienceFilter ? { audience: audienceFilter } : {}) }
      }
    }
  });

  // "Coming Soon" state for non-existent or hidden handles
  if (!collection && handle !== 'all') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-8 border border-neutral-100">
          <Sparkles size={32} className="text-neutral-300 animate-pulse" />
        </div>
        <h1 className="type-h2 mb-4">Collection Coming Soon</h1>
        <p className="type-body max-w-sm text-neutral-400">
          We are currently curating the next archive drop. Stay tuned for the release.
        </p>
        <Link href="/" className="type-button mt-12 flex items-center gap-2 text-black text-xs uppercase tracking-[0.18em] hover:translate-x-2 transition-transform">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  // The 'all' handle is a virtual collection (linked from the footer as
  // "New Arrivals"): there is no Collection row for it, so pull the live
  // catalogue directly instead of rendering an empty grid.
  const products = collection
    ? collection.products
    : await prisma.product.findMany({
        where: { status: 'LIVE', ...(audienceFilter ? { audience: audienceFilter } : {}) },
        orderBy: { createdAt: 'desc' },
      });

  // Map database products
  const formattedProducts = products.map(p => ({
    _id: p.id,
    variantId: '',
    name: p.name,
    slug: p.printifyId,
    image: p.imageUrl,
    secondaryImage: p.imageUrl,
    price: `$${p.price.toFixed(2)}`,
    rawPrice: p.price,
    category: collection?.name || 'Uncategorized',
    // Resolved through the shared catalogue adapter — the same one the PLP and
    // the homepage feed use — so the always-visible colour swatches on these
    // cards are the same colours the filter panel would match.
    attributes: resolveProductAttributes({ name: p.name, collectionName: collection?.name }),
  }));

  // Fetch collections for filter
  const allCollections = await prisma.collection.findMany({
    select: { name: true }
  });
  const categories = ['All', ...allCollections.map(c => c.name)];

  const audienceLabel = audienceFilter === 'KIDS' ? 'Kids' : audienceFilter === 'ADULT' ? 'Adult' : '';
  const pageTitle = collection?.name
    ? (audienceLabel ? `${audienceLabel} · ${collection.name}` : collection.name)
    : "New Arrivals";

  return (
    <CollectionClient
      initialProducts={formattedProducts}
      categories={categories}
      title={pageTitle}
      user={safeUser}
    />
  );
}
