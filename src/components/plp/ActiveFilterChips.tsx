"use client";

import { X } from 'lucide-react';
import type { ActiveFilterChip } from '@/types/plp';

/**
 * Active filter chips — one per selection, each removable, plus Clear All.
 *
 * The chips are built by the filter hook, not by this component, so whatever
 * set the selection came from — the sidebar, a quick chip, the Kids colour
 * rail, or a shared URL — it appears here and removes the same way.
 */
export default function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: ActiveFilterChip[];
  onClearAll: () => void;
}) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.remove}
          aria-label={`Remove filter ${chip.label}`}
          className="group/chip inline-flex h-9 items-center gap-2 rounded-full border border-accent/20 bg-white px-4 text-[12px] font-medium text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-accent/40 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
        >
          {chip.label}
          <X
            aria-hidden
            size={13}
            strokeWidth={2.5}
            className="text-neutral-400 transition-colors duration-200 group-hover/chip:text-ink"
          />
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="type-button ml-1 h-9 px-2 text-[11px] uppercase tracking-[0.1em] text-accent-700 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
      >
        Clear All
      </button>
    </div>
  );
}
