"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'scale' | 'fade';
  viewport?: boolean;
}

/**
 * ANIMATED SECTION (CLIENT COMPONENT)
 * Thin wrapper for entrance animations to keep parent pages as Server Components.
 */
export default function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0, 
  direction = 'up',
  viewport = true 
}: AnimatedSectionProps) {
  const variants = {
    up: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  };

  const { initial, animate } = variants[direction];

  const motionProps = viewport
    ? {
        initial,
        whileInView: animate,
        viewport: { once: true },
        transition: { duration: 0.8, delay },
      }
    : {
        initial,
        animate,
        transition: { duration: 0.8, delay },
      };

  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}
