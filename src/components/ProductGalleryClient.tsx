"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface ProductGalleryClientProps {
  products: any[];
}

const ProductGalleryClient = ({ products }: ProductGalleryClientProps) => {
  const { addItem } = useCart();

  return (
    <section className="py-24 px-6 md:px-12 bg-ink">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="type-label mb-2 text-neutral-500">New Arrivals</h2>
          <p className="text-4xl font-light italic text-white">Fall/Winter 2026</p>
        </div>
        <Link href="/collections" className="text-sm uppercase tracking-widest text-white border-b border-neutral-800 pb-1 hover:border-white transition-colors">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div key={product._id || product.slug} className="group cursor-pointer">
            <Link href={`/products/${product.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-900 mb-6"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-0 transition-all duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                {product.secondaryImage && (
                  <Image
                    src={product.secondaryImage}
                    alt={`${product.name} alternate`}
                    fill
                    className="object-cover object-center w-full h-full opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </Link>

            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  addItem(product.variantId);
                }}
                className="absolute -top-16 left-4 right-4 py-3 bg-white text-ink text-xs uppercase font-bold tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10"
              >
                Quick Add
              </button>

              <Link href={`/products/${product.slug}`} className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{product.category}</p>
                  <h3 className="type-product-name text-sm uppercase text-white transition-colors group-hover:text-neutral-300">{product.name}</h3>
                </div>
                <p className="text-sm font-light text-neutral-400 font-mono tracking-tighter">{product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGalleryClient;
