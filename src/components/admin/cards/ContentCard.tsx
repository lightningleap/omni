"use client";

import React from "react";
import Image from "next/image";
import { Edit3, Image as ImageIcon, Loader2, Trash2, Upload, X } from "lucide-react";
import {
  ADMIN_RULE,
  AdminButton,
  AdminField,
  AdminInput,
} from "@/components/admin/ui/primitives";
import { AdminMenu } from "@/components/admin/ui/menu";

/**
 * A curated collection in the Content deck.
 *
 * ── WHAT WAS WRONG WITH THE OLD CARD ────────────────────────────────────────
 * It was a 128px thumbnail sitting beside a title in a half-width card with
 * `p-6` around it, which left roughly two thirds of the card empty — the
 * "large empty rectangle" problem. The image, the one thing a merchandiser is
 * actually judging, was the smallest element on it, and the two actions were
 * hidden behind `opacity-0 group-hover:opacity-100`.
 *
 * This inverts that. The artwork becomes the card, at the same `16/10` frame
 * `CollectionCard` uses — these ARE collections, so a curated one and a
 * catalogue one should crop identically — and the text becomes a compact block
 * beneath it. Nothing was added to fill space; the space was removed.
 *
 * ── EVERY FIELD IS ONE THE ITEM ALREADY HAS ─────────────────────────────────
 * `collection.name`, `customDescription`, `customImageUrl` and
 * `collection.imageUrl`. That is the whole object minus `section` (constant
 * across the deck being viewed, so it says nothing about any one card) and
 * `order`, which `upsertDiscoveryItem` never writes — every row is 0, so a
 * "Position 3" line would be a fabricated number wearing a real field's name.
 *
 * An earlier pass carried a third line reporting WHICH image field was in use
 * ("Custom image" / "Collection image"). It was accurate and it is gone: on a
 * card whose whole job is to show you the artwork, a line of text describing
 * where that artwork came from is a caption on a picture you are already
 * looking at. Removing it took the card from three tiers to two, which is the
 * change that made the grid read as calm rather than merely tidy.
 *
 * ── THE IMAGE FALLBACK IS THE STUDIO'S, AND IT FIXES A CRASH ────────────────
 * The old card passed `customImageUrl || collection.imageUrl || ""` straight
 * to `next/image`. An empty `src` is a runtime error, so a curated collection
 * with no artwork anywhere took the page down. It now renders the same empty
 * well `CollectionCard` and the Finance table render — the icon on `#FBFAF8`.
 *
 * ── NO `overflow-hidden` ON THE ARTICLE ─────────────────────────────────────
 * Deliberate, and easy to "fix" back into a bug: the menu is absolutely
 * positioned inside this card, and an `overflow-hidden` ancestor would clip it
 * to the card's edge. The image well clips itself with `rounded-t-panel`
 * instead, which is the only thing that needed clipping.
 */

type DiscoveryItem = {
  id: string;
  section: string;
  collectionId: string;
  customImageUrl: string | null;
  customDescription: string | null;
  collection: { id: string; name: string; imageUrl: string | null };
};

export default function ContentCard({
  item,
  isEditing,
  onEdit,
  onRemove,
  editForm,
  onEditFormChange,
  isUploading,
  onFileUpload,
  onSave,
  onCancel,
}: {
  item: DiscoveryItem;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  editForm: { imageUrl: string; description: string };
  onEditFormChange: (next: { imageUrl: string; description: string }) => void;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const name = item.collection.name;
  const imageSrc = item.customImageUrl || item.collection.imageUrl;

  return (
    <article
      style={{ borderColor: isEditing ? undefined : ADMIN_RULE }}
      /* Editing is marked by the border alone. It carried a `ring-2 ring-accent-50`
         as well, which on a grid of white cards read as a glow — and one card
         glowing is exactly the kind of loud the rest of this card avoids. A
         border going from hairline grey to accent is enough to find. */
      className={`flex flex-col rounded-panel border bg-white transition-colors duration-200 ${
        isEditing ? "border-accent-800" : "hover:border-neutral-300"
      }`}
    >
      {/* ── ARTWORK ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-panel bg-[#FBFAF8]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon aria-hidden size={28} strokeWidth={1.5} className="text-neutral-300" />
          </div>
        )}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────
          Two lines and a control. The hairline is not decoration: a collection
          shot on a white sweep runs straight into a white card with nothing to
          stop it, and the image well's `#FBFAF8` only shows where the photo
          does not reach.

          `p-4` against the artwork's full bleed, so the text block sits on one
          margin the eye can find rather than on the card's edge. */}
      <div style={{ borderColor: ADMIN_RULE }} className="border-t p-4">
        {/* The menu shares the title's line rather than floating over the
            artwork, so it never sits on top of the thing being judged and its
            hit area never lands on a dark part of a photograph.

            The negative margins are optical, not structural: they pull the
            28px hit area back so the 15px glyph inside it lines up with the
            title's cap height and with the card's right margin. Without them
            the button reads as both too low and too far in — the kind of
            half-pixel wrongness that makes a card feel unconsidered. */}
        <div className="flex items-start justify-between gap-3">
          <h3 title={name} className="type-admin-section min-w-0 flex-1 truncate text-ink">
            {name}
          </h3>

          <AdminMenu
            className="-mr-1.5 -mt-1"
            label={`More options for ${name}`}
            items={[
              { label: "Edit card", icon: Edit3, onSelect: onEdit },
              {
                label: "Remove from section",
                icon: Trash2,
                onSelect: onRemove,
                destructive: true,
              },
            ]}
          />
        </div>

        {/* The caption the storefront prints on this collection's card.
            It lost its pill. A filled, bordered chip is three pieces of chrome
            around four words, and on a grid of them the boxes were the first
            thing the eye landed on rather than the artwork. As a tracked label
            it reads as a caption — which is what it is — and the accent shrinks
            to what it should be here: one small green mark per card.

            Both states use the same type step so the caption sits on the same
            baseline on every card, set or not. Only the colour differs: the
            accent is reserved for a caption that exists, because painting an
            empty field in the brand colour makes "unset" look like a value. */}
        <p
          className={`type-admin-label mt-1.5 truncate ${
            item.customDescription ? "text-accent-800" : "text-neutral-400"
          }`}
        >
          {item.customDescription || "Set a description"}
        </p>
      </div>

      {/* ── EDIT ─────────────────────────────────────────────────────────
          The same two fields, the same handlers, the same server action. Only
          the padding and the dropzone height changed, because this now opens
          inside a column rather than across a half-width card. */}
      {isEditing && (
        <div
          style={{ borderColor: ADMIN_RULE }}
          className="animate-in fade-in slide-in-from-top-2 space-y-4 border-t p-3.5 duration-200"
        >
          <div className="space-y-2">
            <span className="type-admin-label block text-neutral-500">
              Card image — 1080×1350px
            </span>

            <label className="group flex w-full cursor-pointer items-center justify-center rounded-panel border border-dashed border-[#E8E6E1] bg-[#FBFAF8] py-6 transition-colors hover:border-accent-700 hover:bg-accent-50/30">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 aria-hidden className="animate-spin text-accent-700" size={22} />
                  <span className="type-admin-label text-accent-700">Uploading…</span>
                </div>
              ) : editForm.imageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-16 w-16 overflow-hidden rounded-card border border-[#E8E6E1]">
                    <Image src={editForm.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <span className="type-admin-label text-accent-700">Change image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload
                    aria-hidden
                    size={20}
                    className="text-neutral-400 group-hover:text-accent-700"
                  />
                  <span className="type-admin-label text-neutral-500 group-hover:text-accent-700">
                    Choose a file
                  </span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={onFileUpload}
                disabled={isUploading}
              />
            </label>

            {/* Lifted out of the dropzone label: it used to be a <button>
                nested inside a <label>, which meant clicking it also fired the
                label and opened the file picker it had just cleared. */}
            {editForm.imageUrl && !isUploading && (
              <button
                type="button"
                onClick={() => onEditFormChange({ ...editForm, imageUrl: "" })}
                className="type-admin-meta inline-flex items-center gap-1.5 rounded-card px-1.5 py-1 font-medium text-brand-terracotta transition-colors hover:bg-[#FBF3F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30"
              >
                <X aria-hidden size={12} />
                Clear custom image
              </button>
            )}
          </div>

          <AdminField
            label="Card caption"
            htmlFor={`discovery-caption-${item.id}`}
            hint="Shown on the collection card, e.g. “Under ₹599”."
          >
            <AdminInput
              id={`discovery-caption-${item.id}`}
              type="text"
              value={editForm.description}
              onChange={(e) => onEditFormChange({ ...editForm, description: e.target.value })}
              placeholder="Under ₹599"
              className="bg-[#FBFAF8]"
            />
          </AdminField>

          <div className="flex gap-2">
            <AdminButton variant="primary" className="flex-1" onClick={onSave}>
              Save changes
            </AdminButton>
            <AdminButton onClick={onCancel}>Cancel</AdminButton>
          </div>
        </div>
      )}
    </article>
  );
}
