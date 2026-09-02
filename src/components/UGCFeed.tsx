"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const UGC_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop", alt: "Lifestyle 1" },
  { id: 2, src: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1974&auto=format&fit=crop", alt: "Lifestyle 2" },
  { id: 3, src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop", alt: "Lifestyle 3" },
  { id: 4, src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", alt: "Lifestyle 4" },
  { id: 5, src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop", alt: "Lifestyle 5" },
  { id: 6, src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop", alt: "Lifestyle 6" },
];

const UGCFeed = () => {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Unrwly';

  return (
    <section className="py-24 bg-white overflow-hidden select-none border-t border-gray-50">
      <div className="px-6 md:px-12 lg:px-24 mb-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent-700 font-bold">Community</span>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase leading-none">
              AS SEEN ON YOU
            </h2>
          </div>
          <a 
            href={`https://instagram.com/${storeName.toLowerCase()}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-gray-900 uppercase tracking-widest hover:text-accent-700 transition-colors flex items-center gap-2 group"
          >
            @{storeName.toUpperCase()}
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="text-rose-500"
            >
              <Heart size={14} fill="currentColor" />
            </motion.div>
          </a>
        </div>
      </div>

      {/* Grid Layout (Responsive masonry style) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 px-6 md:px-12 lg:px-24">
        {UGC_IMAGES.map((img, idx) => (
          <motion.div 
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-sm cursor-pointer"
          >
            <Image 
              src={img.src} 
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-white drop-shadow-lg"
              >
                <Heart size={32} fill="white" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default UGCFeed;
