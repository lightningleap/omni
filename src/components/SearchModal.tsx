"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: boolean | (() => void);
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // TEMPORARY dummy search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      const dummyProducts = [
        { id: '1', handle: 'signature-heavyweight-hoodie', title: 'Signature Heavyweight Hoodie', price: '65.00 USD', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000' },
        { id: '2', handle: 'matte-black-phone-case', title: 'Matte Black Phone Case', price: '25.00 USD', image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=1000' }
      ];
      setResults(dummyProducts.filter(p => p.title.toLowerCase().includes(query.toLowerCase())));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
    setQuery('');
    setResults([]);
  }, [onClose]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-ink/90 backdrop-blur-xl flex flex-col pt-24 px-6 md:px-12"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4 flex-1">
              <Search className="text-neutral-500" size={24} />
              <input
                autoFocus
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none text-2xl md:text-4xl font-sans font-semibold uppercase tracking-tight outline-none placeholder:text-neutral-800"
              />
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4"
            >
              <X size={32} />
            </button>
          </div>

          <div className="h-[1px] w-full bg-neutral-900 mb-12" />

          <div className="flex-1 overflow-y-auto pb-24">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-neutral-500" size={40} />
              </div>
            ) : query && results.length === 0 ? (
              <div className="text-center py-20">
                <p className="type-body font-sans text-neutral-500 uppercase tracking-[0.18em]">
                  No results found for "{query}"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    onClick={handleClose}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] mb-4 bg-neutral-900 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ArrowRight className="text-white" size={32} />
                      </div>
                    </div>
                    <div>
                      <h3 className="type-product-name mb-1 text-sm uppercase tracking-[0.06em] transition-colors group-hover:text-neutral-400">
                        {product.title}
                      </h3>
                      <p className="type-price text-xs text-neutral-500">
                        {product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
