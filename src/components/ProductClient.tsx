"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, MapPin, ChevronRight, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google'; // Added import

const COLOR_MAP: Record<string, string> = {
  Black: '#000000', White: '#FFFFFF', Red: '#DC2626', Blue: '#2563EB',
  Navy: '#1E3A5F', Green: '#16A34A', Pink: '#EC4899', Beige: '#D4B896',
  Grey: '#6B7280', Brown: '#92400E', Yellow: '#EAB308', Orange: '#EA580C',
  Purple: '#7C3AED',
};

const CrossSellCarousel = ({ products, user }: { products: any[], user?: any }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="bg-white px-4 md:px-12 py-16" style={{ borderTop: '1px solid #eaeaec' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="type-h3 mb-6 text-[#282C3F]">Similar Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {products.map((product, index) => (
            <ProductCard key={product._id || product.slug} product={product} index={index} user={user} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function ProductClient({ product, recommendations = [], user }: ProductClientProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [currentSlide, setCurrentSlide] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.items.some(i => i.id === product._id));
  const router = useRouter();

  const handleGatekeep = () => {
    if (!user) {
      router.push('/auth?message=Unrwly Membership Required. Please sign in to shop.');
      return true;
    }
    return false;
  };

  const activePriceDisplay = product.price;
  const activePriceNumber = useMemo(() => {
    if (typeof activePriceDisplay === 'number') return activePriceDisplay;
    return parseFloat(activePriceDisplay.replace(/[^0-9.-]+/g, ""));
  }, [activePriceDisplay]);

  // --- GA4 EVENT TRACKING: view_item ---
  useEffect(() => {
    if (product) {
      sendGAEvent('event', 'view_item', {
        currency: 'USD',
        value: activePriceNumber,
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: activePriceNumber,
          item_category: product.category || 'Uncategorized'
        }]
      });
    }
  }, [product, activePriceNumber]);
  // -------------------------------------

  const handleToggleWishlist = () => {
    if (handleGatekeep()) return;

    // --- GA4 EVENT TRACKING: add_to_wishlist ---
    if (!isInWishlist) {
      sendGAEvent('event', 'add_to_wishlist', {
        currency: 'USD',
        value: activePriceNumber,
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: activePriceNumber
        }]
      });
    }
    // -------------------------------------------

    toggleWishlist({
      id: `${product._id}`,
      name: product.name,
      price: product.price,
      image: images[0],
      slug: product.slug,
      rawPrice: activePriceNumber,
    });
  };

  const images = useMemo(() => {
    let raw: any[] = [];
    if (product.allImages && product.allImages.length > 0) raw = product.allImages;
    else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      raw = product.images.map((img: any) => typeof img === 'string' ? img : img.src);
    }
    else if (product.image) raw = [product.image];

    const filtered = raw.filter((img: any) => typeof img === 'string' && img.trim() !== '');
    return filtered.length > 0 ? filtered : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"];
  }, [product.allImages, product.images, product.image]);

  const variants = product.variants || [];
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => { if (v.color) set.add(v.color); });
    return Array.from(set);
  }, [variants]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => { if (v.size) set.add(v.size); });
    return Array.from(set);
  }, [variants]);

  const strikethroughPrice = (activePriceNumber * 1.5).toFixed(2);
  const discountPercent = 33;

  const handleAddToCart = () => {
    if (handleGatekeep()) return;

    // --- GA4 EVENT TRACKING: Detailed add_to_cart ---
    sendGAEvent('event', 'add_to_cart', {
      currency: 'USD',
      value: activePriceNumber,
      items: [{
        item_id: product._id,
        item_name: product.name,
        price: activePriceNumber,
        quantity: 1,
        item_variant: `${selectedColor} ${selectedSize}`.trim() || 'Default'
      }]
    });
    // ------------------------------------------------

    addItem({
      id: `${product._id}`,
      productId: product._id,
      name: product.name,
      price: activePriceNumber,
      image: images[0],
      quantity: 1,
      variantId: product.variantId,
    });
    setDrawerOpen(true);
  };

  const handlePincodeCheck = () => {
    if (pincode.length === 6) setPincodeStatus('valid');
    else setPincodeStatus('invalid');
  };

  const { parsedFeatures, parsedCare, parsedDetails } = useMemo(() => {
    const html = product.description || '';
    let f = '';
    let c = '';
    let d = html;

    const fMarkers = ['Product features', 'Key features', 'Features:'];
    const cMarkers = ['Care instructions', 'Care:'];

    let fIdx = -1;
    let fMarker = '';
    for (const m of fMarkers) {
      const idx = html.toLowerCase().indexOf(m.toLowerCase());
      if (idx !== -1 && (fIdx === -1 || idx < fIdx)) { fIdx = idx; fMarker = m; }
    }

    let cIdx = -1;
    let cMarker = '';
    for (const m of cMarkers) {
      const idx = html.toLowerCase().indexOf(m.toLowerCase());
      if (idx !== -1 && (cIdx === -1 || idx < cIdx)) { cIdx = idx; cMarker = m; }
    }

    if (fIdx !== -1 && cIdx !== -1) {
      if (fIdx < cIdx) {
        d = html.substring(0, fIdx);
        f = html.substring(fIdx + fMarker.length, cIdx);
        c = html.substring(cIdx + cMarker.length);
      } else {
        d = html.substring(0, cIdx);
        c = html.substring(cIdx + cMarker.length, fIdx);
        f = html.substring(fIdx + fMarker.length);
      }
    } else if (fIdx !== -1) {
      d = html.substring(0, fIdx);
      f = html.substring(fIdx + fMarker.length);
    } else if (cIdx !== -1) {
      d = html.substring(0, cIdx);
      c = html.substring(cIdx + cMarker.length);
    }

    const clean = (s: string) => s.replace(/^[:\s-]+|[:\s-]+$/g, '').trim();
    return { parsedFeatures: clean(f), parsedCare: clean(c), parsedDetails: clean(d) };
  }, [product.description]);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white text-[#334155] font-sans selection:bg-[#0F172A] selection:text-white">
      <div className="hidden md:block max-w-7xl mx-auto px-12 pt-12 pb-4">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link href="/collections" className="hover:text-black">{product.category || 'Collection'}</Link>
          <ChevronRight size={10} />
          <span className="text-[#0F172A] font-bold">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 pb-24">

        <div className="lg:col-span-7">
          <div className="hidden lg:grid grid-cols-2" style={{ gap: '2px' }}>
            {images.map((img: string, idx: number) => (
              <div key={idx} className="relative overflow-hidden bg-[#f5f5f6]" style={{ aspectRatio: '3/4', border: '1px solid #eaeaec' }}>
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={idx < 2}
                  sizes="400px"
                />
              </div>
            ))}
          </div>

          <div className="lg:hidden relative">
            <div
              ref={scrollRef}
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const slide = Math.round(target.scrollLeft / target.clientWidth) + 1;
                setCurrentSlide(slide);
              }}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar aspect-[3/4]"
            >
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full snap-center relative">
                  <Image src={img} alt={product.name} fill className="object-cover" priority={idx === 0} />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              {currentSlide} / {images.length}
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <button
                onClick={handleToggleWishlist}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-colors overflow-hidden group/heart"
              >
                <Heart
                  size={20}
                  className={`transition-all ${isInWishlist ? 'text-rose-500 fill-rose-500 scale-110' : 'text-neutral-400 group-hover/heart:text-rose-500'}`}
                />
              </button>
              <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-black transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 px-6 md:px-0 lg:sticky lg:top-28 lg:self-start" style={{maxHeight: 'calc(100vh - 128px)', overflowY: 'auto'}}>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <p className="type-label text-[#282C3F]">UNRWLY</p>
              {/* Product name is product information, not editorial display type:
                  `font-sans` keeps it on Manrope against the global h1 default. */}
              <h1 className="type-product-name font-sans text-xl leading-tight text-[#94969f] uppercase md:text-2xl">{product.name}</h1>
            </div>

            <hr className="border-neutral-100" />

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="type-price text-4xl text-[#0F172A]">{activePriceDisplay}</span>
                <span className="text-lg text-slate-400 line-through font-medium">MRP ${strikethroughPrice}</span>
                <span className="type-price text-lg uppercase" style={{color: '#D97757'}}>({discountPercent}% OFF)</span>
              </div>
              <p className="type-caption text-[11px] uppercase tracking-[0.18em] text-emerald-600">inclusive of all taxes</p>
            </div>

            <div className="space-y-6 pt-4">
              {availableSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest">Select Size</span>
                    <button className="text-[12px] font-bold uppercase tracking-widest hover:underline" style={{ color: '#ff3f6c' }}>Size Chart &gt;</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map(size => {
                      const isActive = selectedSize.toUpperCase() === size.toUpperCase();
                      const isOutOfStock = size.toLowerCase() === 'xs' || size.toLowerCase() === 'xxl';
                      return (
                        <button
                          key={size}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(isActive ? '' : size)}
                          className={`relative w-14 h-14 flex items-center justify-center text-sm font-bold border transition-all duration-200 rounded-sm ${isOutOfStock ? 'opacity-20 cursor-not-allowed overflow-hidden' : ''}`}
                          style={{
                            borderColor: isActive ? '#ff3f6c' : isOutOfStock ? '#eaeaec' : '#d4d5d9',
                            color: isActive ? '#ff3f6c' : '#282C3F',
                            background: isActive ? '#fff0f4' : undefined,
                          }}
                        >
                          {size}
                          {isOutOfStock && <div className="absolute inset-0 border-t border-neutral-400 -rotate-45" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="space-y-4">
                  <span className="text-sm font-black uppercase tracking-widest block">Available Shades</span>
                  <div className="flex flex-wrap gap-4">
                    {availableColors.map(color => {
                      const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                      const hex = COLOR_MAP[color] || '#888';
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(isActive ? '' : color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${isActive ? 'border-neutral-900 scale-110' : 'border-transparent hover:scale-110'}`}
                        >
                          <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: hex }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={handleAddToCart}
                className="py-4 font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-3 active:scale-95 transition-all bg-[#121212] text-white hover:bg-accent-800"
              >
                <ShoppingBag size={16} /> Add to Bag
              </button>
              <button
                onClick={handleToggleWishlist}
                className="py-4 font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 group/wish border border-slate-200 hover:border-[#D97757]"
                style={{ color: isInWishlist ? '#D97757' : '#334155' }}
              >
                <Heart size={16} className={isInWishlist ? 'fill-[#D97757]' : 'group-hover/wish:text-[#D97757] transition-colors'} />
                {isInWishlist ? 'In Wishlist' : 'Wishlist'}
              </button>
            </div>

            <div className="py-6 mt-4 space-y-3" style={{ borderTop: '1px solid #eaeaec' }}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">100% Original Products</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">Easy 14-day Returns & Exchange</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">Pay on Delivery Available</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">Free Delivery on orders above $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white flex p-3 gap-3 border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleToggleWishlist}
          className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest border border-slate-200"
          style={{ color: isInWishlist ? '#D97757' : '#334155' }}
        >
          <Heart size={18} className={isInWishlist ? 'fill-[#D97757]' : ''} /> {isInWishlist ? 'Wishlisted' : 'Wishlist'}
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-[1.5] flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest active:scale-95 transition-transform bg-[#121212] text-white hover:bg-accent-800"
        >
          <ShoppingBag size={18} /> Add to Bag
        </button>
      </div>

      <section className="bg-white px-6 md:px-12 py-24 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="space-y-6">
              <h3 className="type-label flex items-center gap-3 text-black">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                Product Features
              </h3>
              <div
                className="text-sm text-neutral-500 leading-relaxed font-medium space-y-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedFeatures || '<ul className="list-disc pl-4 space-y-2"><li>Premium Build Quality</li><li>Ethically Sourced Materials</li><li>High-Definition Print Technology</li><li>Limited Edition "Unrwly" Original</li></ul>' }}
              />
            </div>
            <div className="space-y-6">
              <h3 className="type-label flex items-center gap-3 text-black">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                Care Instructions
              </h3>
              <div
                className="text-sm text-neutral-500 leading-relaxed font-medium prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedCare || '<ul className="list-disc pl-4 space-y-2"><li>Machine wash cold, inside out</li><li>Tumble dry on low or hang dry</li><li>Do not iron directly on graphics</li><li>Avoid bleach and harsh detergents</li></ul>' }}
              />
            </div>
            <div className="space-y-6">
              <h3 className="type-label flex items-center gap-3 text-black">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                The Details
              </h3>
              <div
                className="text-sm text-neutral-500 leading-relaxed font-medium prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedDetails || 'No additional details provided.' }}
              />
            </div>
          </div>
        </div>
      </section>

      <CrossSellCarousel products={recommendations} user={user} />
    </div>
  );
}

interface ProductClientProps {
  product: any;
  recommendations?: any[];
  user?: any;
}
