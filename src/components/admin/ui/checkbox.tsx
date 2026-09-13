"use client";

import React, { useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * The Management Studio's checkbox. One implementation, everywhere.
 *
 * ── WHAT IT REPLACES ────────────────────────────────────────────────────────
 * The studio had TWO checkboxes and neither was right.
 *
 * 1. A `<div>` / `<button>` pretending to be one, in the Customers and
 *    Products tables. It was unreachable as a checkbox by assistive tech, and
 *    its "tick" was `<div className="h-px w-1.5 rotate-45 bg-white" />` — a
 *    1px line rotated 45°, which is a SLASH, not a check mark. Selecting a row
 *    drew a tiny diagonal scratch in a green box.
 *
 * 2. A native `<input>` with `accent-[#2F5646]`, in Orders and on the cards.
 *    Real semantics, but `accent-color` hands the drawing to the browser, so
 *    the tick's shape, weight and inset were whatever the platform felt like —
 *    the "browser default" look, different on Windows, macOS and Android.
 *
 * This is the native input with `appearance-none`, so the browser stops
 * painting it entirely and the mark is ours: a lucide `Check` at the same
 * weight as every other icon in the studio, centred in the box.
 *
 * ── STATE IS NEVER CARRIED BY COLOUR ALONE ──────────────────────────────────
 * Checked adds a glyph; indeterminate adds a different glyph. Someone who
 * cannot separate the green from the white sees a mark appear either way, and
 * a screen reader gets the real `checked` / `mixed` state from the input
 * itself rather than from an `aria-pressed` on a button, which is what the
 * fake ones announced.
 *
 * ── WHY accent-800 AND NOT THE SIDEBAR'S accent-600 ─────────────────────────
 * Both are the same green — one sage ramp, two lightnesses, the way a neutral
 * scale is one grey. `accent-800` (#2F5646) is the studio's FILLED-ACTION step:
 * primary buttons, the checked box, anything white sits on top of. It carries
 * a white mark at 8.28:1. The rail's `accent-600` (#509176) is a large-surface
 * ground and takes white to 3.68:1 — over the 3:1 floor for a glyph, but a
 * visible step down, and the same swap on a primary button would put white
 * BUTTON TEXT at 3.68:1, under the 4.5:1 AA floor. So the ramp keeps its roles
 * and the hard-coded hexes are what got removed.
 */

export function AdminCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  disabled = false,
  className = '',
}: {
  checked: boolean;
  /** Some-but-not-all selected. Ignored when `checked` is true. */
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name. Visually hidden — a checkbox in a table has no visible label. */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  /* `indeterminate` is a DOM property with no HTML attribute, so it can only be
     set imperatively. This is the case an effect is actually for — writing to
     an external system (the DOM node) rather than back into React state. */
  const mixed = indeterminate && !checked;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);

  const filled = checked || mixed;

  return (
    <label
      /* Rows and cards around these have their own click handlers — opening a
         drawer, opening a product. Selecting is not opening, so the click stops
         here. Bubbling is all that is stopped; the label still toggles its own
         input, which is the browser's default and not something to re-implement. */
      onClick={(e) => e.stopPropagation()}
      className={`relative inline-flex h-4 w-4 shrink-0 items-center justify-center ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <span className="sr-only">{label}</span>

      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={`peer h-4 w-4 appearance-none rounded-[3px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 disabled:opacity-50 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${
          filled
            ? 'border-accent-800 bg-accent-800'
            : 'border-neutral-300 bg-white hover:border-neutral-400'
        }`}
      />

      {filled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-white"
        >
          {mixed ? (
            <Minus size={11} strokeWidth={3.5} />
          ) : (
            <Check size={11} strokeWidth={3.5} />
          )}
        </span>
      )}
    </label>
  );
}
