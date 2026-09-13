"use client";

import React from 'react';
import Image from 'next/image';
import { FolderTree, Loader2, Trash2 } from 'lucide-react';
import { ADMIN_RULE, AdminMono } from '@/components/admin/ui/primitives';

/**
 * A collection in the card view.
 *
 * ── THE IMAGE, AND WHERE IT COMES FROM ──────────────────────────────────────
 * `Collection.imageUrl` is a real field on the model — the Content section
 * already reads it to build the storefront's discovery rails. The Collections
 * page was fetching it and dropping it on the floor: its server component
 * loads every scalar (`findMany` with no `select`) and then maps five of them
 * across the client boundary. The card view maps a sixth. No new query, no new
 * round trip.
 *
 * ── AND WHEN THERE IS NONE ──────────────────────────────────────────────────
 * Most collections have no image yet, so the empty state has to be a real
 * design rather than a grey box: the studio's tinted ground with the same
 * FolderTree glyph the section's own empty state uses, in the lightest neutral
 * so it reads as a placeholder and not as a broken image. It is deliberately
 * not the collection name set large — that would look like an image that
 * failed to load.
 *
 * ── HIERARCHY ───────────────────────────────────────────────────────────────
 * Image → name → handle and product count → delete. The count is the same
 * accent chip the table cell uses, and delete is the same button with the same
 * behaviour (no confirmation, because the table's has none either — this card
 * is not the place to change that policy).
 */

type CollectionData = {
  id: string;
  name: string;
  description: string | null;
  handle: string;
  productCount: number;
  imageUrl?: string | null;
};

export default function CollectionCard({
  collection,
  isDeleting,
  onDelete,
}: {
  collection: CollectionData;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <article
      style={{ borderColor: ADMIN_RULE }}
      className="group flex flex-col overflow-hidden rounded-panel border bg-white transition-colors duration-200 hover:border-neutral-300"
    >
      {/* ── IMAGE ────────────────────────────────────────────────────────
          16:10 rather than the products' 4:3 — a collection reads as a banner,
          a product as an object. `object-cover` here for the same reason: a
          collection image is scenery and crops happily. */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#FBFAF8]">
        {collection.imageUrl ? (
          <Image
            src={collection.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 260px"
            className="object-cover transition-opacity duration-200 group-hover:opacity-90"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderTree aria-hidden size={28} strokeWidth={1.5} className="text-neutral-300" />
          </div>
        )}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h3 className="type-admin-body line-clamp-1 font-medium text-ink transition-colors group-hover:text-accent-700">
            {collection.name}
          </h3>
          <AdminMono className="mt-0.5 block text-neutral-400">/{collection.handle}</AdminMono>
        </div>

        {/* The description the table shows in its third column. One line here
            too, and the em-dash placeholder is the table's, so an empty
            description looks the same in both views. */}
        <p className="type-admin-meta line-clamp-2 min-h-[2.4em] text-neutral-500">
          {collection.description || '—'}
        </p>

        <div
          style={{ borderColor: ADMIN_RULE }}
          className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5"
        >
          <span className="type-admin-meta inline-flex items-center rounded-card border border-accent-100 bg-accent-50 px-2 py-0.5 font-medium tabular-nums text-accent-800">
            {collection.productCount}{' '}
            {collection.productCount === 1 ? 'product' : 'products'}
          </span>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onDelete}
            aria-label={`Delete the ${collection.name} collection`}
            className="rounded-card bg-[#FBF3F0] p-2 text-brand-terracotta transition-colors hover:bg-[#F6E4DD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 aria-hidden size={14} className="animate-spin" />
            ) : (
              <Trash2 aria-hidden size={14} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
