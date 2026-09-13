"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';

interface GlobalCountdownProps {
  endsAt: Date | null;
  message: string;
  isActive: boolean;
}

const GlobalCountdown = ({ endsAt, message, isActive }: GlobalCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!isActive || !endsAt) return;

    const timer = setInterval(() => {
      const target = new Date(endsAt).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, isActive]);

  if (!isActive || !timeLeft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[50]"
      >
        <div className="bg-[#FFF5F2] w-64 p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] rounded-l-2xl border-l-2 border-t-2 border-b-2 border-[#FADED7] flex flex-col gap-3 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-brand-terracotta fill-brand-terracotta/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-terracotta/60">Studio Drop</span>
            </div>
            <h2 className="font-display text-xl font-normal tracking-[-0.01em] text-brand-terracotta leading-[1.1]">
              {message}
            </h2>
          </div>

          <div className="flex items-center gap-3 border-t border-[#FADED7] pt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono font-bold text-brand-terracotta">{String(timeLeft.d).padStart(2, '0')}</span>
              <span className="text-[9px] font-serif italic text-brand-terracotta/60">d</span>
            </div>
            <div className="w-px h-3 bg-[#FADED7]" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono font-bold text-brand-terracotta">{String(timeLeft.h).padStart(2, '0')}</span>
              <span className="text-[9px] font-serif italic text-brand-terracotta/60">h</span>
            </div>
            <div className="w-px h-3 bg-[#FADED7]" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono font-bold text-brand-terracotta">{String(timeLeft.m).padStart(2, '0')}</span>
              <span className="text-[9px] font-serif italic text-brand-terracotta/60">m</span>
            </div>
            <div className="w-px h-3 bg-[#FADED7]" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono font-bold text-brand-terracotta animate-pulse">{String(timeLeft.s).padStart(2, '0')}</span>
              <span className="text-[9px] font-serif italic text-brand-terracotta/60">s</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalCountdown;
