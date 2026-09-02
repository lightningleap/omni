"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * Premium editorial section heading.
 *
 * A clean, distraction-free heading: the brand wordmark type with a
 * scroll-triggered fade + rise reveal and a thin gradient underline.
 *
 * The previous decorative layers — the drifting line-art icon burst and the
 * ambient "cloud of light" glow — have been removed to keep the canvas quiet
 * and product-first. Honors prefers-reduced-motion via CSS.
 */
export default function SectionHeading({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && e.intersectionRatio >= 0.35) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: [0, 0.35, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex flex-col items-center text-center px-4 pb-5 md:pb-6">
      <h2 data-visible={visible} className="sh-title relative z-10">
        {children}
      </h2>

      {/* Thin gradient underline */}
      <span
        aria-hidden
        data-visible={visible}
        className="sh-underline relative z-10 mt-4 h-[2px] w-20 md:w-24 origin-center rounded-full"
      />
    </div>
  );
}
