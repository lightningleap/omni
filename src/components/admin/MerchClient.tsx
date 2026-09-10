"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { updateMerchSettings, updateCollectionImage, upsertDiscoveryItem, removeDiscoveryItem } from "@/app/actions/merch";
import { uploadMerchAsset } from "@/app/actions/upload";
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminMono,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminSectionHeading,
} from "@/components/admin/ui/primitives";
import { AdminCardGrid } from "@/components/admin/ui/views";
import ContentCard from "@/components/admin/cards/ContentCard";
import { Video, Image as ImageIcon, Plus, Loader2, Star, Zap, Check, Search, LayoutGrid, Upload } from "lucide-react";

type Config = {
  heroVideoUrls: string[];
  heroImageUrl: string | null;
  promoAnnouncement: string | null;
};

type LookbookImg = {
  id: string;
  url: string;
  alt: string | null;
};

type Collection = {
  id: string;
  name: string;
  imageUrl: string | null;
}

type DiscoveryItem = {
  id: string;
  section: string;
  collectionId: string;
  customImageUrl: string | null;
  customDescription: string | null;
  collection: Collection;
}

const SECTIONS = [
  /* `color` is gone from these three. It was never read — the section buttons
     take their colour from `accent-800` / `neutral-100` — so it was three dead
     hexes, one of which (`#10b981`, Tailwind's emerald-500) was the only green
     in the whole studio that did not come from the sage ramp. Dead or not, it
     was the exact thing a grep for stray greens trips over. */
  { id: "BUDGET", label: "Budget Friendly Picks", icon: Zap, description: "Curate under ₹599 collections" },
  { id: "OMG", label: "OMG Deals", icon: Star, description: "Highlight premium discounted deals" },
  { id: "CATEGORY", label: "Shop By Category", icon: LayoutGrid, description: "Manage homepage category grid" }
];

export default function MerchClient({ 
  initialConfig, 
  initialImages,
  collections,
  initialDiscovery
}: { 
  initialConfig: Config | null, 
  initialImages: LookbookImg[],
  collections: Collection[],
  initialDiscovery: DiscoveryItem[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [heroVideoUrls, setHeroVideoUrls] = useState<string[]>(() => {
    const urls = initialConfig?.heroVideoUrls || [];
    const result = [...urls];
    while (result.length < 4) result.push("");
    return result.slice(0, 4);
  });
  const [heroImageUrl, setHeroImageUrl] = useState(initialConfig?.heroImageUrl || "");
  const [promoAnnouncement, setPromoAnnouncement] = useState(initialConfig?.promoAnnouncement || "");
  
  const [images, setImages] = useState(initialImages);
  
  const [activeSection, setActiveSection] = useState(searchParams.get("section") || "BUDGET");
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>(initialDiscovery);
  
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync state with discovery items when they change from server
  useEffect(() => {
    setDiscoveryItems(initialDiscovery);
  }, [initialDiscovery]);

  const updateSection = (section: string) => {
    setActiveSection(section);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", section);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const refreshWithSection = () => {
    router.refresh();
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", activeSection);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Discovery Management State
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingDiscovery, setIsAddingDiscovery] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editForm, setEditForm] = useState({ imageUrl: "", description: "" });

  const activeItems = discoveryItems.filter(item => item.section === activeSection);
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !activeItems.find(item => item.collectionId === c.id)
  ); // SHOWN ALL COLLECTIONS


  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingConfig(true);
    try {
      await updateMerchSettings({ 
        heroVideoUrls, 
        heroImageUrl, 
        promoAnnouncement: promoAnnouncement || null 
      });
      alert("GLOBAL ASSETS SYNCED.");
    } catch {
      alert("FAILED TO SYNC CONFIGURATION.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleHeroPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await uploadMerchAsset(body);

      if (!result.success) {
        alert(result.message);
        return;
      }
      setHeroImageUrl(result.url);
    } catch {
      alert("Poster upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };



  const handleAddDiscovery = async (collectionId: string) => {
    setIsAddingDiscovery(collectionId);
    try {
      await upsertDiscoveryItem({
        section: activeSection,
        collectionId,
        customDescription: activeSection === "BUDGET" ? "UNDER ₹599" : activeSection === "CATEGORY" ? "SHOP NOW" : "PREMIUM PIECES"
      });
      refreshWithSection();
      setIsMenuOpen(false); // AUTO-CLOSE MENU AFTER SELECTION
    } catch {
      alert("FAILED TO CURATE COLLECTION.");
    } finally {
      setIsAddingDiscovery(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const result = await uploadMerchAsset(body);

      // The action reports why it refused — file too large, wrong type, bucket
      // missing — so show that instead of a generic failure.
      if (!result.success) {
        alert(result.message);
        return;
      }

      setEditForm((prev: any) => ({ ...prev, imageUrl: result.url }));
    } catch (error: any) {
      console.error("[MERCH] Discovery image upload failed:", error);
      alert(error?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDiscovery = async (id: string) => {
    if (!confirm("Remove this collection from the section?")) return;
    try {
      await removeDiscoveryItem(id);
      setDiscoveryItems(discoveryItems.filter(i => i.id !== id));
    } catch {
      alert("FAILED TO REMOVE FROM CURATION.");
    }
  };

  const handleSaveItemEdit = async (itemId: string, collectionId: string) => {
    try {
      await upsertDiscoveryItem({
        section: activeSection,
        collectionId,
        customImageUrl: editForm.imageUrl || null, 
        customDescription: editForm.description
      });
      setEditingItemId(null);
      refreshWithSection();
    } catch {
      alert("FAILED TO SAVE EDITS.");
    }
  };

  return (
    /* This page painted its own `min-h-screen bg-[#f8fafc]` — a cold slate
       ground, inside an admin layout that is already a warm #F4F2ED — and set
       its own gutters and 7xl container on top of the layout's. Both are gone;
       it uses the shell, the ground and the header every other section uses. */
    <div className="space-y-6 text-ink">
        <AdminPageHeader
          title="Content"
          meta="Curate the storefront's collections and hero media."
          action={
            <AdminButton variant="primary" onClick={handleSaveConfig} disabled={isSavingConfig}>
              {isSavingConfig ? (
                <Loader2 aria-hidden className="animate-spin" size={14} />
              ) : (
                <Check aria-hidden size={14} />
              )}
              Save global assets
            </AdminButton>
          }
        />
        {/* ── SECTION SELECTOR ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                updateSection(section.id);
                setIsMenuOpen(false);
              }}
              aria-pressed={activeSection === section.id}
              className={`group relative overflow-hidden rounded-panel border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 ${
                activeSection === section.id
                  ? 'border-accent-800 bg-white ring-2 ring-accent-50'
                  : 'border-[#E8E6E1] bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-card p-3 ${activeSection === section.id ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                  <section.icon aria-hidden size={20} />
                </div>
                {activeSection === section.id && (
                  <span className="type-admin-label rounded-card bg-accent-50 px-2 py-1 text-accent-800">Active</span>
                )}
              </div>
              <div className="mt-5">
                {/* Was `text-2xl` (24px) — the same size as the page title above
                    it, on three cards at once. It is a panel heading. */}
                <h2 className={`type-admin-section transition-colors ${activeSection === section.id ? 'text-ink' : 'text-neutral-400'}`}>
                  {section.label}
                </h2>
                <p className="type-admin-meta mt-1 text-neutral-400">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── CURATION DECK ─────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              {/* Was a second 24px heading on the page, competing with the page
                  title. A section inside a page is a section heading. */}
              <AdminSectionHeading>
                {activeSection === "BUDGET" ? "Budget-friendly picks" : activeSection === "OMG" ? "OMG deals" : "Shop by category"}
              </AdminSectionHeading>
              <p className="type-admin-meta mt-1 text-neutral-500">
                Collections currently appearing in this carousel.
              </p>
            </div>
            <AdminButton
              variant="primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <Plus aria-hidden size={14} /> Add a collection
            </AdminButton>
          </div>

          {isMenuOpen && (
            <div className="animate-in fade-in slide-in-from-top-4 rounded-panel border border-[#E8E6E1] bg-white p-5">
              <div className="flex flex-col space-y-5">
                <AdminSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search all collections…"
                  label="Search the collection catalogue"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredCollections.map(coll => (
                    <button
                      key={coll.id}
                      onClick={() => handleAddDiscovery(coll.id)}
                      disabled={isAddingDiscovery === coll.id}
                      className="group p-4 bg-white border border-[#E8E6E1] rounded-panel hover:border-accent-800 hover:ring-2 hover:ring-accent-50 transition-all text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="type-admin-body truncate font-semibold text-ink transition-colors group-hover:text-accent-700">{coll.name}</span>
                        {isAddingDiscovery === coll.id ? <Loader2 size={14} className="animate-spin text-accent-700" /> : <Plus size={14} className="text-neutral-300 group-hover:text-accent-700" />}
                      </div>
                    </button>
                  ))}
                  {searchTerm && filteredCollections.length === 0 && (
                    <p className="type-admin-body col-span-full py-4 text-center text-neutral-400">No collections match that search.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeItems.length === 0 ? (
            /* The existing empty state, unchanged apart from dropping
               `col-span-full` — it is no longer a grid child. */
            <div className="py-20 text-center border border-dashed border-[#E8E6E1] rounded-panel bg-white">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#FBFAF8] rounded-panel flex items-center justify-center mx-auto text-neutral-300">
                  <Search size={32} />
                </div>
                <p className="type-admin-section text-neutral-500">No collections curated yet</p>
                <p className="type-admin-meta text-neutral-400">Use “Add a collection” above to start.</p>
              </div>
            </div>
          ) : (
            /* auto-fill rather than a fixed `md:grid-cols-2`: the deck was two
               half-width cards at every desktop width, which is most of why
               they read as empty. This measures the content column instead, so
               it settles at two columns on a tablet or a small laptop and three
               from `xl` up — no breakpoint ladder to get wrong at an in-between
               size, and one column on a phone without a special case.

               `items-start` because one card can grow: opening its edit form
               triples its height, and under the grid's default `stretch` every
               other card in that row would grow with it and end up padded out
               with empty space — the exact fault this redesign set out to fix.
               Off-stretch they keep their own height, and since a card is now a
               fixed-ratio image over two single lines, they are all the same
               height anyway. */
            <AdminCardGrid min={280} className="items-start">
              {activeItems.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  isEditing={editingItemId === item.id}
                  /* The same two setState calls the old hover button made. */
                  onEdit={() => {
                    setEditingItemId(item.id);
                    setEditForm({
                      imageUrl: item.customImageUrl || "",
                      description: item.customDescription || "",
                    });
                  }}
                  onRemove={() => handleRemoveDiscovery(item.id)}
                  editForm={editForm}
                  onEditFormChange={setEditForm}
                  isUploading={isUploading}
                  onFileUpload={handleFileUpload}
                  onSave={() => handleSaveItemEdit(item.id, item.collectionId)}
                  onCancel={() => setEditingItemId(null)}
                />
              ))}
            </AdminCardGrid>
          )}
        </section>

        <section className="max-w-3xl space-y-4 border-t border-[#E8E6E1] pt-8">
          <div>
            <AdminSectionHeading>Hero media</AdminSectionHeading>
            <p className="type-admin-meta mt-1 text-neutral-500">
              The poster image and animations behind the homepage hero.
            </p>
          </div>

          <AdminPanel padded>
            <form onSubmit={handleSaveConfig} className="space-y-5">
              <AdminField
                label="Hero poster image"
                htmlFor="hero-poster-url"
                hint="Desktop-optimised, around 2000×1200px."
              >
                <div className="relative">
                  <ImageIcon
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={15}
                  />
                  <AdminInput
                    id="hero-poster-url"
                    type="text"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://…"
                    className="bg-[#FBFAF8] pl-10"
                  />
                </div>
              </AdminField>

              <label className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-card border border-dashed border-[#E8E6E1] bg-[#FBFAF8] py-6 transition-colors hover:border-accent-700 hover:bg-accent-50/30">
                {isUploading ? (
                  <Loader2 aria-hidden className="animate-spin text-accent-700" size={20} />
                ) : (
                  <>
                    <Upload aria-hidden size={16} className="text-neutral-400 group-hover:text-accent-700" />
                    <span className="type-admin-label text-neutral-500 group-hover:text-accent-700">
                      Upload from device
                    </span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleHeroPosterUpload} disabled={isUploading} />
              </label>

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="type-admin-label text-neutral-500">Hero animations</span>
                  <span className="type-admin-meta text-neutral-400">
                    Cloudinary <AdminMono>f_auto,q_auto</AdminMono> links work best.
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {heroVideoUrls.map((url, idx) => (
                    <div key={idx} className="relative">
                      <Video
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={14}
                      />
                      <AdminInput
                        type="text"
                        aria-label={`Hero animation ${idx + 1}`}
                        value={url}
                        onChange={(e) => {
                          const next = [...heroVideoUrls];
                          next[idx] = e.target.value;
                          setHeroVideoUrls(next);
                        }}
                        placeholder={`Hero animation ${idx + 1}`}
                        className="bg-[#FBFAF8] pl-9"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <AdminButton type="submit" variant="primary" disabled={isSavingConfig} className="w-full">
                {isSavingConfig ? (
                  <Loader2 aria-hidden className="animate-spin" size={14} />
                ) : (
                  "Save hero media"
                )}
              </AdminButton>
            </form>
          </AdminPanel>
        </section>
    </div>
  );
}
