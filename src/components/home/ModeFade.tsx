"use client";

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { HomepageMode } from '@/data/homepage';

// Matches the header toggle's 220ms pill slide, so the control and the content
// it drives settle together.
const DURATION = 0.22;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Subtle crossfade for the mode-driven part of a section.
 *
 * Layout-neutral by construction. It is only ever used in two places: inside a
 * section's existing block container (wrapping the header + content), or around
 * a whole section in the homepage's root `flex flex-col` — which has no `gap`
 * and stretches its items to full width, so a plain block wrapper changes
 * nothing about how the section is measured or spaced.
 *
 * Only `opacity` animates (compositor-only: no layout, no paint), and the keyed
 * child remounts so carousels reset to page one for the incoming dataset rather
 * than keeping the outgoing one's scroll position.
 *
 * The first render never animates: on load the content simply is there, and the
 * fade is reserved for an actual mode change (including the one-off swap a
 * returning Kids visitor gets right after hydration).
 */
export default function ModeFade({
  mode,
  children,
  className,
}: {
  mode: HomepageMode;
  children: ReactNode;
  className?: string;
}) {
  // "Has the mode ever changed under us?" — adjusted during render (React's
  // documented pattern for deriving state from a changing prop) rather than in
  // an effect, so the incoming content mounts already knowing whether to fade.
  // Once true it stays true: it only gates the very first paint, where the
  // content should simply be there rather than fading up on every page load.
  const [seenMode, setSeenMode] = useState(mode);
  const [hasSwitched, setHasSwitched] = useState(false);

  if (seenMode !== mode) {
    setSeenMode(mode);
    setHasSwitched(true);
  }

  return (
    <motion.div
      key={mode}
      initial={hasSwitched ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
