import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import PlpClient from '@/components/plp/PlpClient';
import { getCatalogue } from '@/components/plp/PlpPage';
import { getFilterConfig } from '@/filters';
import { findBrowseCollection, getBrowseCollectionRule } from '@/data/browseCollectionRules';
import { getPrimaryCategories } from '@/data/shopCategories';
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
  const explicitKids = audienceParam?.toLowerCase() === 'kids';

  /*
   * When the param is missing, let the HANDLE settle it before falling back.
   *
   * A Browse Collections handle belongs to exactly one mode — `dinosaur-world`
   * is only ever Kids, `witchy-and-gothic` only ever Adult — so a bare
   * `/collections/dinosaur-world` is not ambiguous, it is just missing a
   * breadcrumb. Without this it defaulted to Adult, found no Kids rule there,
   * and rendered "Collection Coming Soon" — so every shared, bookmarked or
   * hand-typed Kids category link was broken even though the rail's own links
   * carry the param correctly.
   *
   * Only consulted when the param is ABSENT. An explicit `?audience=adult`
   * still means Adult, so the nav can never be overruled by a handle.
   */
  const inferredKids =
    audienceParam === undefined && getBrowseCollectionRule('kids', handle) !== undefined;

  const isKids = explicitKids || inferredKids;
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

  /*
   * A Browse Collections circle, when no `Collection` row carries its handle.
   *
   * The rail lists the Etsy shop's SECTIONS ("Witchy & Gothic") while this
   * database's collections record product TYPES ("Mugs"). Those vocabularies
   * never met, so every circle but "All" resolved to `null` above and fell
   * straight into the Coming Soon branch — which is the whole reason the
   * categories looked empty.
   *
   * Order matters: the curated row WINS. This is consulted only when there
   * isn't one, so creating `witchy-and-gothic` in the studio and assigning
   * products to it silently takes over from the keyword rule.
   */
  const rule = collection ? undefined : getBrowseCollectionRule(audience, handle);
  const railEntry = collection ? undefined : findBrowseCollection(audience, handle);

  // Named collections referenced by a rule (`Home & Desk` → five of them) still
  // have to become ids, and the handles are authored, not user input.
  const ruleCollections = rule?.collections?.length
    ? await prisma.collection.findMany({
        where: { handle: { in: rule.collections } },
        select: { id: true },
      })
    : [];

  // "Coming Soon" is now only for a handle NOTHING knows about — not for a
  // real section that simply has no `Collection` row of its own.
  if (!collection && !rule && handle !== 'all') {
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

  /*
   * A section declared empty (`emptyReason`) must select NOTHING rather than
   * fall through to the whole catalogue. "On Sale" has no per-product sale data
   * behind it, and an unnarrowed query there would quietly present all 87 Adult
   * products as discounted — a worse failure than the empty state, because it
   * looks like it worked.
   */
  const products = rule?.emptyReason
    ? []
    : await getCatalogue(audience, {
        collectionId: collection?.id,
        collectionIds: ruleCollections.length ? ruleCollections.map((c) => c.id) : undefined,
        titleKeywords: rule?.keywords,
      });

  // The trail points back into the audience the shopper is actually browsing,
  // so the back link on a Kids collection offers Kids rather than Shop.
  const parent = isKids
    ? { label: 'Kids', href: '/shop/kids' }
    : { label: 'Shop', href: '/shop/men' };

  /*
   * The department tab, as a SCOPE — never as an identity.
   *
   * `?dept=men` narrows which products this collection lists and nothing else.
   * The scope comes from the very same registry entry `/shop/men` uses, so the
   * tab and the department page can never disagree about what "Men" selects,
   * and a scope added to the registry later starts working here with no change
   * to this file.
   *
   * Note what is NOT taken from that entry: its `label`, its `description` and
   * its `breadcrumb`. Those stay the collection's, which is the whole point —
   * the title below reads `collection?.name ?? railEntry?.name`, with the
   * department nowhere in it.
   */
  const deptParam = typeof query.dept === 'string' ? query.dept : undefined;
  const dept = deptParam
    ? getPrimaryCategories(audience).find((c) => c.slug === deptParam)
    : undefined;

  const category: ShopCategory = {
    slug: handle,
    // The rail's own wording, verbatim — a shopper who clicked "French with
    // Attitude" should land on a page that says so, not on the name of some
    // collection the rule happened to resolve through.
    label: collection?.name ?? railEntry?.name ?? 'New Arrivals',
    audience,
    description: collection || railEntry ? undefined : 'Fresh designs, just added to Unrwly.',
    breadcrumb: [{ label: 'Home', href: '/' }, parent],
    // The only thing the department contributes. `usePlpFilters` runs this
    // through `applyCategoryScope`, the same path `/shop/unisex` takes.
    scope: dept?.scope,
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
