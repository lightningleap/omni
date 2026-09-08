"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '@/components/ProductCard';

export default function WishlistClient({ user }: { user?: any }) {
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const wishlistCount = wishlistItems.length;

  if (wishlistCount === 0) {
    return (
      <div className="min-h-screen pt-12 pb-20 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-8 border border-hairline">
          <Heart size={32} className="text-neutral-300" />
        </div>
        <h1 className="type-h2 mb-4 text-ink">Your Wishlist is Empty</h1>
        <p className="type-body mb-8 max-w-md text-neutral-500">Save your favorite items here to keep track of them and buy them later.</p>
        <Link 
          href="/collections"
          className="type-button flex items-center gap-2 text-accent-ink text-sm uppercase tracking-[0.18em] hover:underline"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="type-h2 mb-2 text-ink">
            Wishlist
          </h1>
          <p className="type-label text-neutral-500">
            {wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {wishlistItems.map((item) => (
            <ProductCard 
              key={item.id} 
              showRemove={true}
              onRemove={removeItem}
              user={user}
              product={{
                _id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                slug: item.slug,
                rawPrice: item.rawPrice
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
