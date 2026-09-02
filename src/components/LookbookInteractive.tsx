"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingBag } from 'lucide-react';

interface Hotspot {
  id: number;
  x: number; // percentage
  y: number; // percentage
  productName: string;
  price: string;
  slug: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: 1, x: 45, y: 35, productName: "Modern Ceramic Vase", price: "$45.00", slug: "modern-ceramic-vase" },
  { id: 2, x: 65, y: 60, productName: "Oak Wood Coffee Table", price: "$295.00", slug: "oak-wood-coffee-table" },
  { id: 3, x: 25, y: 75, productName: "Hand-Woven Textured Rug", price: "$180.00", slug: "hand-woven-textured-rug" },
];

const LookbookInteractive = () => {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gray-100 rounded-sm">
      <Image 
        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop"
        alt="Lifestyle Scene"
        fill
        priority
        className="object-cover brightness-90"
      />

      {/* Hero Overlay Text */}
      <div className="absolute top-12 left-12 md:top-24 md:left-24 z-10 pointer-events-none">
        <span className="text-[10px] font-bold text-white uppercase tracking-[0.4em] mb-4 block">Interactive Edit</span>
        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
          The Living <br /> Collection
        </h2>
      </div>

      {/* Hotspots */}
      {HOTSPOTS.map((spot) => (
        <div 
          key={spot.id}
          className="absolute z-20"
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
        >
          {/* Pulse Dot */}
          <button
            onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
            className="group relative flex items-center justify-center p-2"
          >
            <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-75" />
            <div className={`relative w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform duration-300 ${activeHotspot === spot.id ? 'rotate-45 bg-accent-700 text-white' : 'group-hover:scale-110'}`}>
              <Plus size={16} />
            </div>
          </button>

          {/* Tooltip Card */}
          <AnimatePresence>
            {activeHotspot === spot.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-48 bg-white shadow-2xl rounded-sm p-4 z-30"
              >
                <div className="relative">
                    <button 
                        onClick={() => setActiveHotspot(null)}
                        className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={12} />
                    </button>
                    <div className="space-y-2">
                        <span className="text-[8px] font-bold text-accent-700 uppercase tracking-widest block">Available Now</span>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none pr-4">{spot.productName}</h4>
                        <p className="text-xs font-bold text-gray-500">{spot.price}</p>
                        <Link 
                            href={`/products/${spot.slug}`}
                            className="flex items-center gap-2 text-[10px] font-bold text-gray-900 uppercase tracking-widest border-t border-gray-100 pt-3 group/link hover:text-accent-700 transition-colors"
                        >
                            <ShoppingBag size={12} />
                            View Product
                        </Link>
                    </div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 -translate-y-1/2" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Legend / Tip */}
      <div className="absolute bottom-12 right-12 z-10 hidden md:block">
        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Click hotspots to shop the scene
        </p>
      </div>
    </div>
  );
};

export default LookbookInteractive;
