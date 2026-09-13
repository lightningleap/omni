"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ADMIN_RULE, AdminMono } from '@/components/admin/ui/primitives';
import { AdminCheckbox } from '@/components/admin/ui/checkbox';

/**
 * A product in the card view.
 *
 * ── WHAT IT SHOWS, AND WHY NOTHING MORE ─────────────────────────────────────
 * Exactly the seven fields the table row shows — image, name, Studio origin,
 * short id, collection, price, live status, projected profit — and exactly the
 * four things it lets you do. A product card is the obvious place to invent
 * ratings, stock and sales figures; none of those exist on this model, so none
 * of them are here.
 *
 * ── THE ONE THING IT DOES DIFFERENTLY ───────────────────────────────────────
 * The table leads with a 44px thumbnail because a row is scanned by NAME. A
 * card is scanned by PICTURE — that is the whole reason to offer one for a
 * catalogue — so the image takes the top of the card at a fixed 4:3 and the
 * name sits under it. Everything else is the same information in the same
 * words.
 *
 * ── EVERY CONTROL IS THE ROW'S CONTROL ──────────────────────────────────────
 * The collection select, the price field and the live switch are the same
 * elements bound to the same handlers as the table's, passed in from
 * ProductsClient. Editing a price in a card and editing it in a row are the
 * same call; there is no card-specific write path.
 *
 * ── HEIGHT ──────────────────────────────────────────────────────────────────
 * Names run from two words to two lines. The image is a fixed ratio, the name
 * is clamped to two lines and reserves both whether or not it needs them
 * (`min-h`), and the controls are pushed to the bottom by `mt-auto` on a flex
 * column — so a row of cards has its prices and switches on one line instead
 * of stepping up and down with the length of the names above them.
 */

type ProductData = {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  imageUrl: string;
  collectionId: string | null;
  status: 'LIVE' | 'DRAFT';
  source?: string;
};

export default function ProductCard({
  product,
  collections,
  isSelected,
  isSaving,
  isSaved,
  onToggleSelect,
  onStatusToggle,
  onInlineUpdate,
}: {
  product: ProductData;
  collections: { id: string; name: string }[];
  isSelected: boolean;
  isSaving: boolean;
  isSaved: boolean;
  onToggleSelect: () => void;
  onStatusToggle: () => void;
  onInlineUpdate: (price: number, collectionId: string) => void;
}) {
  const potentialProfit = product.price - (product.cost || 0);

  return (
    <article
      style={{ borderColor: isSelected ? undefined : ADMIN_RULE }}
      className={`group flex flex-col overflow-hidden rounded-panel border bg-white transition-colors duration-200 ${
        isSelected ? 'border-accent-800 bg-accent-50/30' : 'hover:border-neutral-300'
      }`}
    >
      {/* ── IMAGE ────────────────────────────────────────────────────────
          Fixed 4:3 on a tinted ground, `object-contain` because these are
          product photographs on white from Printify — cropping them to fill
          would cut the garment. The ratio is what keeps a row of cards
          aligned; the image inside it letterboxes. */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#FBFAF8]">
        <Link
          href={`/admin/products/${product.id}`}
          className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-700/40"
          aria-label={`Edit ${product.name}`}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 240px"
              className="object-contain p-3 transition-opacity duration-200 group-hover:opacity-90"
            />
          ) : (
            <ImageIcon
              aria-hidden
              size={22}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-300"
            />
          )}
        </Link>

        {/* Selection. A real checkbox on a plate, so it is reachable by keyboard
            and announced — the same control as the table's header/row boxes. */}
        <div className="absolute left-2.5 top-2.5 flex items-center rounded-[3px] bg-white/90 p-1 backdrop-blur-sm">
          <AdminCheckbox
            checked={isSelected}
            onChange={onToggleSelect}
            label={`Select ${product.name}`}
          />
        </div>

        {/* Status, and the save indicator the row shows in its last column. */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          {isSaving ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
              <Loader2 aria-hidden size={12} className="animate-spin text-accent-700" />
            </span>
          ) : isSaved ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
              <CheckCircle2 aria-hidden size={12} className="text-accent-600" />
            </span>
          ) : null}
          {/* Sentence case at the meta step rather than 0.12em caps. The
              label step is right for a column header, which is read once as a
              heading; a status chip is read at a glance and caps only slow
              that down. */}
          <span
            className={`type-admin-meta rounded-card border px-1.5 py-0.5 font-medium ${
              product.status === 'LIVE'
                ? 'border-accent-200 bg-accent-50 text-accent-800'
                : 'border-[#E8E6E1] bg-white text-neutral-500'
            }`}
          >
            {product.status === 'LIVE' ? 'Live' : 'Draft'}
          </span>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div>
          <Link
            href={`/admin/products/${product.id}`}
            className="block rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30"
          >
            {/* Two lines reserved whether or not both are used, so the row of
                cards keeps one baseline. */}
            <h3 className="type-admin-body line-clamp-2 min-h-[2.6em] font-medium text-ink transition-colors group-hover:text-accent-700">
              {product.name}
            </h3>
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <AdminMono className="text-neutral-400">{product.id.substring(0, 8)}</AdminMono>
            {product.source === 'STUDIO' && (
              <span className="type-admin-meta rounded-card border border-accent-100 bg-accent-50 px-1.5 py-0.5 font-medium text-accent-700">
                Studio
              </span>
            )}
          </div>
        </div>

        {/* ── CONTROLS ────────────────────────────────────────────────────
            `mt-auto` pins this block to the bottom of the card regardless of
            how many lines the name above it took. */}
        <div className="mt-auto space-y-2.5">
          <div>
            <label htmlFor={`card-collection-${product.id}`} className="sr-only">
              Collection for {product.name}
            </label>
            <select
              id={`card-collection-${product.id}`}
              disabled={isSaving}
              value={product.collectionId || 'none'}
              onChange={(e) => onInlineUpdate(product.price, e.target.value)}
              style={{ borderColor: ADMIN_RULE }}
              className="type-admin-meta w-full cursor-pointer rounded-card border bg-[#FBFAF8] px-2 py-1.5 text-neutral-600 outline-none transition-colors hover:bg-[#F4F2ED] focus-visible:ring-2 focus-visible:ring-accent-700/30 disabled:opacity-50"
            >
              <option value="none">Unassigned</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{ borderColor: ADMIN_RULE }}
            className="flex items-center justify-between gap-2 border-t pt-2.5"
          >
            <div className="flex min-w-0 items-center gap-1">
              <span className="type-admin-body text-neutral-400">$</span>
              <label htmlFor={`card-price-${product.id}`} className="sr-only">
                Price for {product.name}
              </label>
              <input
                id={`card-price-${product.id}`}
                type="number"
                step="0.01"
                disabled={isSaving}
                defaultValue={product.price}
                onBlur={(e) => {
                  const newPrice = parseFloat(e.target.value);
                  if (newPrice !== product.price) {
                    onInlineUpdate(newPrice, product.collectionId || 'none');
                  }
                }}
                className="type-admin-body w-16 rounded-card border-none bg-transparent px-1 py-1 font-semibold tabular-nums text-ink outline-none transition-colors focus:bg-[#FBFAF8] focus:ring-2 focus:ring-accent-700/15"
              />
              <span
                className={`type-admin-meta shrink-0 tabular-nums ${
                  potentialProfit > 0 ? 'text-accent-700' : 'text-brand-terracotta'
                }`}
                title="Projected profit per unit"
              >
                +${potentialProfit.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={onStatusToggle}
              role="switch"
              aria-checked={product.status === 'LIVE'}
              aria-label={`${product.name} is ${product.status === 'LIVE' ? 'live' : 'hidden'}`}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 disabled:opacity-50 ${
                product.status === 'LIVE' ? 'bg-accent-800' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                  product.status === 'LIVE' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
