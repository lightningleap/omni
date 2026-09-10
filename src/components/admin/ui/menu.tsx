"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { ADMIN_RULE } from '@/components/admin/ui/primitives';

/**
 * The studio's overflow menu — a three-dot button and the small list it opens.
 *
 * ── WHY IT EXISTS ───────────────────────────────────────────────────────────
 * The Content cards kept Edit and Delete behind `opacity-0
 * group-hover:opacity-100`. That is not a small styling choice: on a touch
 * screen there is no hover, so the two actions were effectively invisible on
 * every phone and tablet, and on a desktop an admin had to sweep the pointer
 * across the deck to discover that a card could be edited at all. A control
 * that has to be found by accident is not a control.
 *
 * So the actions collapse into ONE affordance that is always on screen. The
 * card gets quieter — a permanent Edit and Delete pair on every card is a lot
 * of chrome for a grid — and the actions get more discoverable at the same
 * time, which is the trade a three-dot button is for.
 *
 * ── WHY IT IS HERE AND NOT IN `primitives` ──────────────────────────────────
 * `primitives.tsx` carries no `"use client"` directive, so it can be pulled
 * into a server component. This needs state, effects and refs. Importing it
 * from there would make every primitive a client component as a side effect of
 * adding a dropdown, so it sits beside `views.tsx` instead — the same reasoning
 * that put the view switch there.
 *
 * ── KEYBOARD AND FOCUS ──────────────────────────────────────────────────────
 * A real `role="menu"` contract: the trigger is `aria-haspopup="menu"` with
 * `aria-expanded`, opening moves focus to the first item, Up/Down/Home/End walk
 * the list, Escape and Tab close it, and closing returns focus to the trigger
 * so the tab order does not jump to the top of the page. Items are `<button>`s,
 * so Enter and Space already work and nothing re-implements them.
 */

export type AdminMenuItem = {
  label: string;
  /** A lucide icon component, matching the rest of the studio's icon set. */
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  onSelect: () => void;
  /** Renders in the brand terracotta — for Delete and its kin. */
  destructive?: boolean;
  disabled?: boolean;
};

export function AdminMenu({
  items,
  label,
  className = '',
}: {
  items: AdminMenuItem[];
  /** Accessible name for the trigger, e.g. `More options for Winter Knits`. */
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  /* The menu normally hangs below the trigger. Near the bottom of the window it
     would be half off-screen, so it flips above instead — measured on open
     against the real viewport rather than guessed from a breakpoint. */
  const [dropUp, setDropUp] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  /** Every enabled item, in DOM order — the arrow keys walk this. */
  const itemButtons = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])'
      ) ?? []
    );

  const openMenu = () => {
    // ~40px per row plus the plate's own padding, which is enough to know
    // whether the list would run past the fold without rendering it twice.
    const estimated = items.length * 40 + 16;
    const rect = triggerRef.current?.getBoundingClientRect();
    setDropUp(!!rect && rect.bottom + estimated > window.innerHeight && rect.top > estimated);
    setOpen(true);
  };

  /* Focus the first item once the plate is actually in the DOM. `itemButtons`
     reads the ref at call time rather than closing over a value, so it is not
     a dependency — it is a DOM query, not state. */
  useEffect(() => {
    if (open) itemButtons()[0]?.focus();
  }, [open]);

  /* Outside click, and the window moving under an open menu. `pointerdown`
     rather than `click` so the menu is gone before the click lands on whatever
     was underneath it. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // A menu pinned to a trigger that has scrolled away is worse than no menu.
    const onViewportChange = () => setOpen(false);

    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const buttons = itemButtons();
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);

    switch (e.key) {
      case 'Escape':
        e.stopPropagation();
        close();
        break;
      case 'Tab':
        // Let focus leave naturally, but do not leave a menu hanging open.
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        buttons[(index + 1) % buttons.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        buttons[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          // Whatever encloses this may have its own click behaviour.
          e.stopPropagation();
          if (open) close(false);
          else openMenu();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-card border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 ${
          open
            ? 'border-[#E8E6E1] bg-[#F1EFEA] text-ink'
            : 'border-transparent text-neutral-400 hover:bg-[#F4F2ED] hover:text-ink'
        }`}
      >
        <MoreHorizontal aria-hidden size={15} strokeWidth={2} />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          style={{ borderColor: ADMIN_RULE }}
          /* z-20 so it paints over the cards that follow it in the grid, and
             right-aligned so a menu in the last column opens inward. */
          className={`absolute right-0 z-20 min-w-[168px] overflow-hidden rounded-panel border bg-white p-1 shadow-md ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                close(false);
                item.onSelect();
              }}
              className={`type-admin-body flex w-full items-center gap-2.5 rounded-card px-2.5 py-2 text-left transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                item.destructive
                  ? 'text-brand-terracotta hover:bg-[#FBF3F0] focus-visible:bg-[#FBF3F0]'
                  : 'text-ink hover:bg-[#FBFAF8] focus-visible:bg-[#FBFAF8]'
              }`}
            >
              {item.icon && <item.icon aria-hidden size={14} className="shrink-0" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
