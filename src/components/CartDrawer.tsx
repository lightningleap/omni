"use client";

import React, { useState } from 'react';
import EmptyBag from '@/components/cart/EmptyBag';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { sendGAEvent } from '@next/third-parties/google';

const CartDrawer: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // --- GA4 EVENT TRACKING: view_cart ---
  React.useEffect(() => {
    // We check for 'mounted' to ensure this only runs in the browser
    if (mounted && isDrawerOpen && items.length > 0) {
      const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

      sendGAEvent('event', 'view_cart', {
        currency: 'USD',
        value: cartTotal,
        items: items.map(item => ({
          item_id: item.productId || item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  }, [isDrawerOpen, items, mounted]);

  // Handle Item Removal with GA4 Tracking
  const handleRemoveItem = (itemId: string, item: any) => {
    // Track removal BEFORE removing from state
    sendGAEvent('event', 'remove_from_cart', {
      currency: 'USD',
      value: item.price * item.quantity,
      items: [{
        item_id: item.productId || item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }]
    });
    removeItem(itemId);
  };

  if (!mounted) return null;

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%', scale: 0.95 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: '100%', scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 250,
              scale: { duration: 0.4, ease: "easeOut" }
            }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
            style={{ borderLeft: '1px solid var(--color-hairline)' }}
          >
            <div className="p-6 border-b flex items-center justify-between bg-white" style={{ borderColor: 'var(--color-hairline)' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-neutral-500" />
                <h2 className="type-label text-ink">Shopping Bag</h2>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 300 }}
                    className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full font-bold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-neutral-400 hover:text-ink hover:bg-neutral-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <EmptyBag onContinue={() => setDrawerOpen(false)} />
              ) : (
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group bg-white p-4 items-start border" style={{ borderColor: 'var(--color-hairline)' }}>
                      <div className="relative w-20 aspect-[3/4] bg-surface overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--color-hairline)' }}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="type-product-name text-sm text-ink leading-tight line-clamp-2 uppercase tracking-tight">{item.name}</h4>
                            <button
                              onClick={() => handleRemoveItem(item.id, item)}
                              className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {/* The chosen variant, so the bag says which one was
                              added — two sizes of the same garment are now two
                              separate lines and would otherwise be
                              indistinguishable. Only renders what was actually
                              chosen; a product with no options shows nothing. */}
                          {(item.size || item.color) && (
                            <p className="type-caption mt-1 text-neutral-500">
                              {[item.color, item.size].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-sm font-light text-neutral-500 mt-1">${item.price.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center mt-3">
                          <div className="flex items-center bg-white border border-neutral-200 rounded-none overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-neutral-400 hover:text-ink hover:bg-neutral-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-ink">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-neutral-400 hover:text-ink hover:bg-neutral-50 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-neutral-100 mt-auto">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col">
                  <span className="type-label text-neutral-500 mb-1">Subtotal</span>
                  <span className="type-caption text-[11px] normal-case tracking-normal text-neutral-400">Taxes and shipping calculated at checkout</span>
                </div>
                <span className="type-price text-xl text-ink">${subtotal.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => {
                  sendGAEvent('event', 'begin_checkout', {
                    currency: 'USD',
                    value: subtotal,
                    items: items.map(item => ({
                      item_id: item.productId || item.id,
                      item_name: item.name,
                      price: item.price,
                      quantity: item.quantity
                    }))
                  });
                  setDrawerOpen(false);
                }}
                aria-disabled={items.length === 0}
                className={`btn-commerce w-full ${items.length === 0 ? "pointer-events-none" : ""}`}
              >
                {/* 14px lock against 13px text — the icon reads as the same
                    weight as the label rather than as a badge beside it. Gap,
                    height, radius, hover, press and focus all come from
                    `.btn-commerce`, so this button and the homepage "Shop" CTA
                    cannot drift apart. */}
                <Lock aria-hidden size={14} strokeWidth={2} />
                Secure Checkout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
