import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import PlpClient from '@/components/plp/PlpClient';
import { getCatalogue } from '@/components/plp/PlpPage';
import { getFilterConfig } from '@/filters';
import { parseFilterState } from '@/utils/plp/filterUrl';
import type { ShopCategory } from '@/types/plp';
import { getSessionUser } from '@/lib/auth';

export const revalidate = 3600; // ISR: 1 hour

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * A collection is a Product Listing Page scoped to one collection.
 *
 * It used to render its own client (`CollectionClient`): an 88px title, a count
 * pill and a bare grid — no breadcrumb, no sort, no filters. It imported
 * `FilterSidebar` and never rendered it, which is the clearest evidence that the
 * filtering was intended and simply never wired up. Meanwhile `/shop/<category>`
 * and `/kids/<age>` already had all of it through `PlpClient`.
 *
 * So this route no longer has a layout of its own. It resolves the collection,
 * describes it as a `ShopCategory` — the same shape the static registry hands
 * the other two route families — and hands it to the same client. Collections
 * inherit filtering, sorting, URL state, the mobile filter drawer, the empty
 * state and the back link for free, and can never drift from the shop pages
 * again, because there is only one listing page left to drift.
 */
export default async function IndividualCollectionPage({ params, searchParams }: CollectionPageProps) {
  const { handle } = await params;
  const query = await searchParams;

  const audienceParam = typeof query.audience === 'string' ? query.audience : undefined;

  // ADULT / KIDS narrowing driven by the storefront nav.
  //
  // A missing param defaults to ADULT rather than "every audience". The nav
  // toggle is always showing one mode or the other, so an unscoped grid puts
  // toddler tees under a toggle that reads "Adult". The nav corrects the URL to
  // the shopper's persisted mode on mount, but that happens after this render —
  // defaulting here means the mixed grid never paints at all.
  const isKids = audienceParam?.toLowerCase() === 'kids';
  const audience = isKids ? ('kids' as const) : ('adult' as const);

  const { user, isAdmin } = await getSessionUser();
  const safeUser = user
    ? { id: user.id, email: user.email, role: isAdmin ? 'ADMIN' : 'CUSTOMER' }
    : null;

  // `all` is a virtual collection (the footer's "New Arrivals"): no Collection
  // row exists for it, so it resolves to the unscoped audience catalogue.
  const collection =
    handle === 'all'
      ? null
      : await prisma.collection.findUnique({
          where: { handle },
          select: { id: true, name: true },
        });

  // "Coming Soon" state for non-existent or hidden handles.
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
        <Link
          href="/"
          className="type-button mt-12 flex items-center gap-2 text-ink text-xs uppercase tracking-[0.18em] hover:translate-x-2 transition-transform"
        >
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const products = await getCatalogue(audience, { collectionId: collection?.id });

  // The trail points back into the audience the shopper is actually browsing,
  // so the back link on a Kids collection offers Kids rather than Shop.
  const parent = isKids
    ? { label: 'Kids', href: '/shop/kids' }
    : { label: 'Shop', href: '/shop/men' };

  const category: ShopCategory = {
    slug: handle,
    label: collection?.name ?? 'New Arrivals',
    audience,
    description: collection
      ? undefined
      : 'Fresh designs, just added to Unrwly.',
    breadcrumb: [{ label: 'Home', href: '/' }, parent],
  };

  // Seed the client from the URL, validated against this audience's own config,
  // so a shared or bookmarked filtered link opens on exactly the view it names.
  const initialState = parseFilterState(query, getFilterConfig(audience));

  return (
    <PlpClient
      category={category}
      products={products}
      initialState={initialState}
      user={safeUser}
    />
  );
}
