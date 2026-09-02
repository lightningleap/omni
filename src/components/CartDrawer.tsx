"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Minus, Plus, Trash2, Lock } from 'lucide-react';
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
            style={{ borderLeft: '1px solid #eaeaec' }}
          >
            <div className="p-6 border-b flex items-center justify-between bg-white" style={{ borderColor: '#eaeaec' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#94969f]" />
                <h2 className="text-lg font-black uppercase text-[#282C3F] tracking-tight">Shopping Bag</h2>
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
                className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-8 border border-neutral-100"
                  >
                    <ShoppingBag size={32} className="text-neutral-300" />
                  </motion.div>
                  <h3 className="type-body mb-2 font-sans font-medium text-black">Your cart is currently empty.</h3>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="mt-6 flex items-center gap-2 text-black text-xs uppercase tracking-[0.2em] hover:text-accent-700 transition-colors font-bold"
                  >
                    Continue Browsing <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group bg-white p-4 items-start border" style={{ borderColor: '#eaeaec' }}>
                      <div className="relative w-20 aspect-[3/4] bg-[#f5f5f6] overflow-hidden flex-shrink-0" style={{ border: '1px solid #eaeaec' }}>
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
                            <h4 className="text-sm font-bold text-black leading-tight line-clamp-2 uppercase tracking-tight">{item.name}</h4>
                            <button
                              onClick={() => handleRemoveItem(item.id, item)}
                              className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm font-light text-neutral-500 mt-1">${item.price.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center mt-3">
                          <div className="flex items-center bg-white border border-neutral-200 rounded-none overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-black">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-50 transition-colors"
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
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black mb-1">Subtotal</span>
                  <span className="text-neutral-300 text-[9px] uppercase tracking-wider">Taxes & shipping calculated at checkout</span>
                </div>
                <span className="text-2xl font-bold text-black">${subtotal.toFixed(2)}</span>
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
                className={`w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors flex justify-center items-center gap-3 rounded-none shadow-xl ${items.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
              >
                <Lock size={14} />
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
