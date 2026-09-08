import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/ProductClient';
import { fetchPrintifyProductById } from '@/lib/printify';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from "@/lib/auth";
import { ETSY_LISTINGS, ETSY_LISTINGS_BY_PRINTIFY_ID } from '@/data/etsyListings';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * DYNAMIC SEO GENERATION
 * Pulls real product data to populate Meta Tags, OpenGraph, and Twitter Cards.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // The 'slug' in the URL is actually the printifyId
  const dbProduct = await prisma.product.findUnique({
    where: { printifyId: slug }
  });

  if (!dbProduct) {
    return {
      title: 'Product Not Found',
    };
  }

  const description = dbProduct.description?.slice(0, 160) || '';

  return {
    title: dbProduct.name,
    description: description,
    openGraph: {
      title: `${dbProduct.name} | Unrwly`,
      description: description,
      images: [dbProduct.imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dbProduct.name} | Unrwly`,
      description: description,
      images: [dbProduct.imageUrl],
    },
  };
}

/**
 * PRODUCT DETAIL PAGE (SERVER COMPONENT)
 * Fetches real time data from Printify based on the product ID (slug).
 * Now uses Local Database as source of truth for visibility.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { user, isAdmin } = await getSessionUser();


  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;
  
  // 1. Verify existence and visibility in Database
  const dbProduct = await prisma.product.findUnique({
    where: { printifyId: slug },
    include: { collection: true }
  });

  if (!dbProduct) {
    return notFound();
  }

  // 2. Fetch Deep Details from Printify (Variants, all images, etc.)
  const printifyProduct = await fetchPrintifyProductById(slug);

  if (!printifyProduct) {
    // If database says it exists but Printify doesn't return it, 
    // we fallback to basic DB info or return 404
    return notFound();
  }

  // 3. Merge data.
  //
  // The GALLERY keeps Printify's image set: it carries every angle and mockup
  // for the product, where an Etsy listing exposes only its primary image, and
  // a detail page is the one surface that genuinely needs all of them.
  //
  // TITLE and PRICE come from the Etsy listing when there is one, for the same
  // reason they do on every other surface — it is what the customer is quoted
  // in the shop they can actually buy from, and the stored copy goes stale.
  // Falls back to the database row for a product with no listing.
  const allImages = printifyProduct.images?.map((img: any) => img.src) || [dbProduct.imageUrl];

  const listingForProduct = (dbProduct.audience === 'KIDS'
    ? ETSY_LISTINGS_BY_PRINTIFY_ID.kids
    : ETSY_LISTINGS_BY_PRINTIFY_ID.adult
  ).get(String(slug));

  const displayPrice = listingForProduct?.price ?? dbProduct.price;

  const normalizedProduct = {
    ...printifyProduct,
    allImages,
    image: allImages[0] || dbProduct.imageUrl,
    name: listingForProduct?.displayTitle ?? dbProduct.name,
    description: dbProduct.description || printifyProduct.description,
    _id: dbProduct.id,
    price: `$${displayPrice.toFixed(2)}`,
    rawPrice: displayPrice,
    category: dbProduct.collection?.name || printifyProduct.category,
    audience: dbProduct.audience,
  };
  // 4. Recommendations come from our own database, not from Printify.
  //
  // This used to call fetchPrintifyProducts(), which walks every page of every
  // Printify shop — 287 products over two shops, measured at ~36s — purely to
  // keep four of them. On Vercel that outruns the function timeout, so the
  // product page failed for shoppers even though the data was fine. The same
  // four rows come out of Postgres in milliseconds, and the database is already
  // the source of truth for what is visible in the storefront.
  //
  // ── SAME AUDIENCE, SAME COLLECTION FIRST, AND ONLY REAL LISTINGS ──────────
  // Two corrections over the previous version, which took the four most recent
  // rows of the same audience and nothing more:
  //
  //   · Etsy-gated, like every other surface. Without it these four could be
  //     products that were pulled from the shop pages precisely because a
  //     customer cannot buy them — recommending them is worse than showing
  //     nothing.
  //   · Collection-first. "You may also like" under a sweatshirt should lead
  //     with other sweatshirts; recency alone gave whatever happened to be
  //     uploaded last. Same-collection rows are taken first and topped up from
  //     the wider audience only if there are not four.
  //
  // The audience split is preserved throughout, so a Kids page can never
  // recommend an Adult product or the reverse.
  const mode: 'adult' | 'kids' = dbProduct.audience === 'KIDS' ? 'kids' : 'adult';
  const listings = ETSY_LISTINGS_BY_PRINTIFY_ID[mode];
  const etsyPrintifyIds = ETSY_LISTINGS[mode].map((l) => l.printifyId);

  const recommendationPool = await prisma.product.findMany({
    where: {
      status: 'LIVE',
      audience: dbProduct.audience,
      printifyId: { in: etsyPrintifyIds },
      NOT: { printifyId: slug },
    },
    include: { collection: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const sameCollection = recommendationPool.filter(
    (p) => dbProduct.collectionId && p.collectionId === dbProduct.collectionId
  );
  const rest = recommendationPool.filter((p) => !sameCollection.includes(p));

  const recommendations = [...sameCollection, ...rest]
    .slice(0, 4)
    .map((p) => {
      // The listing is the source of truth for what the customer sees, exactly
      // as on the homepage and the listing pages, so a recommendation card
      // cannot disagree with the same product's card on the shop page.
      const listing = listings.get(String(p.printifyId));
      return {
        _id: p.id,
        name: listing?.displayTitle ?? p.name,
        slug: String(p.printifyId),
        image: listing?.image ?? p.imageUrl,
        price: `$${(listing?.price ?? p.price ?? 0).toFixed(2)}`,
        rawPrice: listing?.price ?? p.price ?? 0,
        category: p.collection?.name ?? 'UNRWLY',
        etsyUrl: listing?.etsyUrl,
      };
    });

  /** This product's own Etsy listing, when it has one. Backs the secondary CTA. */
  const etsyListing = listings.get(String(slug));

  return (
    <ProductClient
      product={normalizedProduct}
      recommendations={recommendations}
      user={safeUser}
      etsyUrl={etsyListing?.etsyUrl}
    />
  );
}
