"use client";

import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TrendingCarouselProps {
  products: any[];
  user?: any;
}

const TrendingCarousel = ({ products, user }: TrendingCarouselProps) => {
  return (
    // 4 cards per desktop row at the ORIGINAL 5-column card size.
    //
    // Columns are explicitly sized instead of 1fr, so the cards can never
    // stretch: with C = the grid's content width, the old 5-column card was
    //     W5 = (C - 4*20) / 5 = 0.2C - 16   ->   calc(20% - 16px)
    // which reproduces it exactly at every width (1024px → 168px, 1440px+ →
    // 251.2px), and stays overflow-proof where a hard-coded width would not.
    //
    // Holding the card width fixed locks the remaining space into one equation
    // at 1440px:  3*gap + 2*edge = 331.2px. Pinning the outer cards to the
    // container edges (edge = 0) forces a 110px gap, which reads as disconnected;
    // squeezing the gap to 20px forces 136px edges, which reads as a cluster
    // floating in the middle. gap-x-16 sits at the midpoint — 64px between cards,
    // ~70px at each edge — so the row still reaches most of the way across
    // without either extreme. Adjust that single value to re-balance.
    // Mobile (2 cols) and tablet (3 cols) are deliberately untouched.
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 p-1 lg:grid-cols-[repeat(4,calc(20%_-_16px))] lg:gap-x-16 lg:justify-center">
      {products.map((product, idx) => (
        <ProductCard
          key={product._id || idx}
          product={product}
          index={idx}
          user={user}
          // Derived server-side from real order history and publish dates — see
          // `deriveProductTags` in app/page.tsx. Undefined for most products,
          // which is the intended state: the badge means something because it is
          // not on everything.
          tag={product.tag}
        />
      ))}
    </div>
  );
};

export default TrendingCarousel;
