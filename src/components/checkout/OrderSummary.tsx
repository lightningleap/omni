"use client";

import React from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';

interface OrderSummaryProps {
  checkoutData: any;
}

export default function OrderSummary({ checkoutData }: OrderSummaryProps) {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const shippingPrice = checkoutData.shippingMethod === 'priority' ? 15 : 0;
  const total = subtotal + shippingPrice;

  return (
    <div className="space-y-8">
      {/* Product List */}
      <div className="space-y-4 px-6 md:px-0">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center group">
            <div className="relative w-16 aspect-[3/4] bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-black line-clamp-2 leading-tight mb-1">{item.name}</h4>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[1px] bg-neutral-200 mx-6 md:mx-0" />

      {/* Pricing Breakdown */}
      <div className="space-y-3 px-6 md:px-0">
        <div className="flex justify-between items-center text-xs font-medium text-neutral-500 uppercase tracking-widest">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-medium text-neutral-500 uppercase tracking-widest">
          <span>Shipping</span>
          <span className="text-[10px] font-black text-black">{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-neutral-100">
          <span className="text-sm font-black uppercase tracking-[0.2em]">Total</span>
          <div className="text-right">
            <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest block mb-1">USD</span>
            <span className="text-2xl font-black tracking-tighter leading-none">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-neutral-50/50 p-6 space-y-4 border border-neutral-100 mx-6 md:mx-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-neutral-100">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Secure AES-256 SSL Encryption</p>
        </div>
      </div>
    </div>
  );
}
