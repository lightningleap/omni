import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/ProductClient';
import { fetchPrintifyProductById, fetchPrintifyProducts } from '@/lib/printify';
import { prisma } from '@/lib/prisma';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Determine if user is admin based on environment variable
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = user?.email?.toLowerCase().trim() === masterEmail;

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

  // 3. Merge data (Database prices/names override Printify if needed)
  const allImages = printifyProduct.images?.map((img: any) => img.src) || [dbProduct.imageUrl];
  
  const normalizedProduct = {
    ...printifyProduct,
    allImages,
    image: allImages[0] || dbProduct.imageUrl,
    name: dbProduct.name, 
    description: dbProduct.description || printifyProduct.description,
    _id: dbProduct.id,
    price: `$${dbProduct.price.toFixed(2)}`,
    rawPrice: dbProduct.price,
    category: dbProduct.collection?.name || printifyProduct.category
  };
  // 4. Get recommendations (can use cached Printify list or DB)
  const allProducts = await fetchPrintifyProducts() || [];
  const recommendations = allProducts
    .filter(p => p.slug !== slug)
    .slice(0, 4);

  return (
    <ProductClient 
      product={normalizedProduct} 
      recommendations={recommendations} 
      user={safeUser}
    />
  );
}
