"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Image as ImageIcon, Loader2, Plus, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkPublishToCollection, syncPrintifyManual, updateProductGatekeeper, toggleProductStatus, deleteManyProducts } from "@/app/actions/admin/products";
import ProductCard from "@/components/admin/cards/ProductCard";
import { AdminCardGrid, AdminViewToggle, useAdminView } from "@/components/admin/ui/views";
import { AdminCheckbox } from "@/components/admin/ui/checkbox";
import {
  ADMIN_RULE,
  AdminButton,
  adminButtonClass,
  AdminEmpty,
  AdminMono,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/admin/ui/primitives";

type ProductData = {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  imageUrl: string;
  collectionId: string | null;
  status: "LIVE" | "DRAFT";
  source?: string;
};

type CollectionData = {
  id: string;
  name: string;
};

export default function ProductsClient({ 
  initialProducts, 
  collections 
}: { 
  initialProducts: ProductData[];
  collections: CollectionData[];
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCollectionSync, setBulkCollectionSync] = useState("none");
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "STUDIO" | "SYNCED">("ALL");
  /**
   * Presentation only.
   *
   * The source tabs, the search, the selection set, the saving/saved sets and
   * every handler are declared once above and read by both trees. `view` never
   * reaches `filteredProducts` or any server action — which is what makes
   * "filter to My designs, switch to cards, see the same products, still
   * selected" true without a line of code to keep the two in step.
   */
  const [view, setView] = useAdminView("products");
  const router = useRouter();

  // FALLBACK REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const studioCount = initialProducts.filter((p) => p.source === "STUDIO").length;
  const syncedCount = initialProducts.length - studioCount;

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "STUDIO" ? p.source === "STUDIO" : p.source !== "STUDIO");
    return matchesSearch && matchesSource;
  });

  // Named once rather than re-deriving the same comparison in the header
  // cell's class, its content, its label and its aria-pressed.
  const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  /* Some but not all — the header box shows a dash rather than claiming the
     whole page is selected. `toggleAll` already selects all from this state,
     so this is presentation only. */
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleOneById = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // The table's cell click needs the event stopped before the row sees it; the
  // card's checkbox has no row to stop it reaching. Same Set either way.
  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleOneById(id);
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    await bulkPublishToCollection(Array.from(selectedIds), bulkCollectionSync);
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Confirm permanent removal of ${selectedIds.size} products?`)) return;
    
    setBulkLoading(true);
    try {
      const result = await deleteManyProducts(Array.from(selectedIds));
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      }
    } catch (error) {
      alert("Selection removal failed.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleManualSync = async () => {
    setBulkLoading(true);
    const result = await syncPrintifyManual();
    setBulkLoading(false);
    if (result.success) {
      router.refresh();
      if (result.message) alert(result.message);
    } else {
      alert("Sync Failed: " + (result.message || "Check server logs."));
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: "LIVE" | "DRAFT") => {
    const isLive = currentStatus === "LIVE";
    setSavingIds(prev => new Set(prev).add(productId));
    try {
      const result = await toggleProductStatus(productId, !isLive);
      if (result.success) {
        setSavedIds(prev => new Set(prev).add(productId));
        setTimeout(() => {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }, 2000);
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || "Toggle failed.");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleInlineUpdate = async (productId: string, price: number, collectionId: string, status: "LIVE" | "DRAFT") => {
    setSavingIds(prev => new Set(prev).add(productId));
    try {
      const result = await updateProductGatekeeper(productId, price, collectionId, status);
      if (result.success) {
        setSavedIds(prev => new Set(prev).add(productId));
        setTimeout(() => {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }, 2000);
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || "Update failed.");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        action={
          <>
            <AdminButton disabled={bulkLoading} onClick={handleManualSync}>
              {bulkLoading ? (
                <Loader2 aria-hidden size={14} className="animate-spin" />
              ) : (
                <ArrowUpRight aria-hidden size={14} />
              )}
              Sync Printify
            </AdminButton>
            <Link href="/admin/products/new" className={adminButtonClass("primary")}>
              <Plus aria-hidden size={14} /> New product
            </Link>
          </>
        }
      />

      <AdminPanel className="min-h-[60vh]">
        {/* Source tabs. They were `text-xs uppercase tracking-widest`, a step
            the studio uses nowhere else; the label step is the same one the
            table headers below them use, so the tab and the column it filters
            are set alike. */}
        <div
          style={{ borderColor: ADMIN_RULE }}
          className="flex items-center gap-1 border-b px-4 pt-3"
        >
          {([
            ["ALL", `All (${initialProducts.length})`],
            ["STUDIO", `My designs (${studioCount})`],
            ["SYNCED", `Synced (${syncedCount})`],
          ] as const).map(([key, lbl]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSourceFilter(key)}
              aria-pressed={sourceFilter === key}
              className={`type-admin-label -mb-px border-b-2 px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 ${
                sourceFilter === key
                  ? "border-accent-800 text-accent-700"
                  : "border-transparent text-neutral-400 hover:text-ink"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div
          style={{ borderColor: ADMIN_RULE }}
          className="flex items-center gap-3 border-b p-4"
        >
          <div className="min-w-0 flex-1">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search products…"
              label="Search products by name"
            />
          </div>
          <AdminViewToggle view={view} onChange={setView} />
        </div>

        {filteredProducts.length === 0 ? (
          <AdminEmpty
            icon={<ImageIcon aria-hidden size={24} />}
            title="No products match these filters"
            message="Clear the search, or switch to All to see the whole catalogue."
          />
        ) : view === 'list' ? (
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh className="w-12 text-center">
                    <AdminCheckbox
                      className="mx-auto"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      label={allSelected ? "Clear selection" : "Select all products"}
                    />
                  </AdminTh>
                  <AdminTh className="w-16">Image</AdminTh>
                  <AdminTh>Product</AdminTh>
                  <AdminTh>Collection</AdminTh>
                  <AdminTh className="text-right">Price</AdminTh>
                  <AdminTh className="text-center">Live</AdminTh>
                  <AdminTh className="text-right">Profit</AdminTh>
                  <AdminTh className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  const isSaving = savingIds.has(product.id);
                  const isSaved = savedIds.has(product.id);
                  const potentialProfit = product.price - (product.cost || 0);

                  return (
                    <AdminTr
                      key={product.id}
                      className={`group ${isSelected ? "bg-accent-50/40" : ""}`}
                    >
                      <AdminTd className="text-center" onClick={(e) => toggleOne(product.id, e)}>
                        <AdminCheckbox
                          checked={isSelected}
                          onChange={() => toggleOneById(product.id)}
                          label={`Select ${product.name}`}
                        />
                      </AdminTd>
                      <AdminTd>
                        <Link href={`/admin/products/${product.id}`} className="block">
                          <div
                            style={{ borderColor: ADMIN_RULE }}
                            className="relative h-11 w-11 overflow-hidden rounded-card border bg-[#FBFAF8]"
                          >
                            {product.imageUrl ? (
                              <Image src={product.imageUrl} alt="" fill className="object-cover" />
                            ) : (
                              <ImageIcon
                                aria-hidden
                                size={16}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-300"
                              />
                            )}
                          </div>
                        </Link>
                      </AdminTd>
                      <AdminTd>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="flex flex-col gap-0.5"
                        >
                          <span className="flex items-center gap-2 font-semibold text-ink">
                            {product.name}
                            {product.source === "STUDIO" && (
                              <span className="type-admin-label rounded-card border border-accent-100 bg-accent-50 px-1.5 py-0.5 text-accent-700">
                                Studio
                              </span>
                            )}
                          </span>
                          <AdminMono className="text-neutral-400">
                            {product.id.substring(0, 8)}
                          </AdminMono>
                        </Link>
                      </AdminTd>
                      <AdminTd>
                        <select
                          disabled={isSaving}
                          value={product.collectionId || "none"}
                          aria-label={`Collection for ${product.name}`}
                          onChange={(e) =>
                            handleInlineUpdate(product.id, product.price, e.target.value, product.status)
                          }
                          className="type-admin-body cursor-pointer rounded-card border-none bg-transparent px-2 py-1 text-neutral-600 outline-none transition-colors hover:bg-[#F4F2ED] focus-visible:ring-2 focus-visible:ring-accent-700/30"
                        >
                          <option value="none">Unassigned</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </AdminTd>
                      <AdminTd className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-neutral-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            disabled={isSaving}
                            defaultValue={product.price}
                            aria-label={`Price for ${product.name}`}
                            onBlur={(e) => {
                              const newPrice = parseFloat(e.target.value);
                              if (newPrice !== product.price) {
                                handleInlineUpdate(
                                  product.id,
                                  newPrice,
                                  product.collectionId || "none",
                                  product.status
                                );
                              }
                            }}
                            className="type-admin-body w-20 rounded-card border-none bg-transparent px-2 py-1 text-right font-semibold tabular-nums text-ink outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-accent-700/15"
                          />
                        </div>
                      </AdminTd>
                      <AdminTd>
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleStatusToggle(product.id, product.status)}
                            role="switch"
                            aria-checked={product.status === "LIVE"}
                            aria-label={`${product.name} is ${product.status === "LIVE" ? "live" : "hidden"}`}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 ${
                              product.status === "LIVE" ? "bg-accent-800" : "bg-neutral-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                                product.status === "LIVE" ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </AdminTd>
                      <AdminTd className="text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-semibold tabular-nums ${
                              potentialProfit > 0 ? "text-accent-700" : "text-brand-terracotta"
                            }`}
                          >
                            ${potentialProfit.toFixed(2)}
                          </span>
                          <span className="type-admin-meta text-neutral-400">projected</span>
                        </div>
                      </AdminTd>
                      <AdminTd className="w-10 text-center">
                        {isSaving ? (
                          <Loader2 aria-hidden size={14} className="animate-spin text-accent-700" />
                        ) : isSaved ? (
                          <CheckCircle2
                            aria-hidden
                            size={14}
                            className="animate-in zoom-in text-accent-600 duration-300"
                          />
                        ) : null}
                      </AdminTd>
                    </AdminTr>
                  );
                })}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        ) : (
          /* Cards. Every prop here is the row's own state and the row's own
             handler — the card renders them differently and calls the same
             functions, so there is no second write path to keep in sync. */
          <AdminCardGrid min={220} className="p-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                collections={collections}
                isSelected={selectedIds.has(product.id)}
                isSaving={savingIds.has(product.id)}
                isSaved={savedIds.has(product.id)}
                onToggleSelect={() => toggleOneById(product.id)}
                onStatusToggle={() => handleStatusToggle(product.id, product.status)}
                onInlineUpdate={(price, collectionId) =>
                  handleInlineUpdate(product.id, price, collectionId, product.status)
                }
              />
            ))}
          </AdminCardGrid>
        )}
      </AdminPanel>

      {/* The bulk bar. Every control in it was uppercase at a different
          tracking — "SELECT COLLECTION", "Assign", "Destroy" — which read as
          three separate widgets bolted together. Same buttons and the same
          select as the rest of the studio now, and "Destroy" is "Delete". */}
      {/* The bar was `min-w-[400px]` on a `fixed` element, so on a 375px phone
          it pushed past the viewport and scrolled the page sideways. `max-w`
          caps it at the screen and the row wraps. Desktop is untouched — the
          cap only binds below 400px, where the old width was already wrong. */}
      {selectedIds.size > 0 && (
        <div className="animate-in slide-in-from-bottom-8 fixed bottom-8 left-1/2 z-[100] w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 duration-300">
          <div
            style={{ borderColor: ADMIN_RULE }}
            className="flex min-w-[min(400px,100%)] flex-wrap items-center gap-x-4 gap-y-2 rounded-panel border bg-white p-3 shadow-lg"
          >
            <span className="type-admin-label rounded-card bg-accent-800 px-3 py-1.5 text-white">
              {selectedIds.size} selected
            </span>

            <div className="h-4 w-px bg-neutral-200" />

            <div className="flex flex-1 items-center gap-2">
              <label htmlFor="bulk-collection" className="sr-only">
                Collection to assign to the selected products
              </label>
              <select
                id="bulk-collection"
                value={bulkCollectionSync}
                onChange={(e) => setBulkCollectionSync(e.target.value)}
                className="type-admin-body cursor-pointer rounded-card border-none bg-[#FBFAF8] px-3 py-2 text-neutral-600 outline-none transition-colors hover:bg-[#F4F2ED] focus-visible:ring-2 focus-visible:ring-accent-700/30"
              >
                <option value="none">Select a collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <AdminButton onClick={handleBulkPublish} disabled={bulkLoading}>
                Assign
              </AdminButton>
            </div>

            <div className="h-4 w-px bg-neutral-200" />

            <AdminButton
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="border-[#E7D3CB] bg-[#FBF3F0] text-brand-terracotta hover:bg-[#F6E4DD]"
            >
              {bulkLoading ? (
                <Loader2 aria-hidden size={14} className="animate-spin" />
              ) : (
                <Trash2 aria-hidden size={14} />
              )}
              Delete
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}
