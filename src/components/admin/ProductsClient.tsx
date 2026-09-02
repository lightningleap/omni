"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Search, ChevronDown, Image as ImageIcon, Loader2, Plus, ArrowUpRight, DollarSign, Filter, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkPublishToCollection, syncPrintifyManual, updateProductGatekeeper, toggleProductStatus, deleteManyProducts } from "@/app/actions/admin/products";

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

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
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
    <div className="space-y-10 font-sans">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center px-4">
        <div className="flex flex-col">
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Resource Management</p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={bulkLoading}
            onClick={handleManualSync}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
            Sync Printify
          </button>
          <Link
            href="/admin/products/new"
            className="px-6 py-2.5 bg-accent-800 border border-accent-800 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-accent-950 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Create Product
          </Link>
        </div>
      </div>

      {/* RESOURCE LIST CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[60vh]">
        {/* Source tabs */}
        <div className="px-8 pt-6 flex items-center gap-2 border-b border-slate-100 pb-0">
          {([
            ["ALL", `All (${initialProducts.length})`],
            ["STUDIO", `My Designs (${studioCount})`],
            ["SYNCED", `Synced (${syncedCount})`],
          ] as const).map(([key, lbl]) => (
            <button key={key} onClick={() => setSourceFilter(key)}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-colors ${sourceFilter === key ? "border-accent-800 text-accent-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
              {lbl}
            </button>
          ))}
        </div>
        {/* Filter Bar */}
        <div className="p-8 pb-4 flex items-center gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search resources by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-50 transition-all placeholder:text-slate-400 font-medium"
              />
           </div>
           
           <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Filter size={16} /> Sort
           </button>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto p-4 pt-0">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-4 w-12 text-center">
                   <div 
                    className={`w-5 h-5 border-2 rounded-md cursor-pointer mx-auto flex items-center justify-center transition-all ${selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? 'bg-[#4f46e5] border-[#4f46e5]' : 'bg-white border-slate-200'}`}
                    onClick={toggleAll}
                  >
                    {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 && <div className="w-2 h-0.5 bg-white rounded-full" />}
                  </div>
                </th>
                <th className="px-4 py-4 w-16">Visual</th>
                <th className="px-4 py-4">Identity</th>
                <th className="px-4 py-4">Scope</th>
                <th className="px-4 py-4 text-right">Yield</th>
                <th className="px-4 py-4 text-center">Protocol</th>
                <th className="px-4 py-4 text-right">Profit</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const isSaving = savingIds.has(product.id);
                const isSaved = savedIds.has(product.id);
                const potentialProfit = product.price - (product.cost || 0);

                return (
                  <tr 
                    key={product.id} 
                    className={`group transition-all duration-300 ${isSelected ? 'bg-accent-50/40 translate-x-1' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-5 text-center" onClick={(e) => toggleOne(product.id, e)}>
                       <div className={`w-5 h-5 border-2 rounded-md cursor-pointer mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-[#4f46e5] border-[#4f46e5]' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          {isSelected && <div className="w-2 h-0.5 bg-white rounded-full" />}
                       </div>
                    </td>
                    <td className="px-4 py-5">
                       <Link href={`/admin/products/${product.id}`} className="block">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden transition-transform duration-500 hover:scale-110 shadow-sm">
                             {product.imageUrl ? (
                               <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                             ) : (
                               <ImageIcon size={18} className="text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                             )}
                          </div>
                       </Link>
                    </td>
                    <td className="px-4 py-5">
                        <Link href={`/admin/products/${product.id}`} className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-black text-slate-900 transition-colors capitalize flex items-center gap-2">
                            {product.name}
                            {product.source === "STUDIO" && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-accent-700 bg-accent-50 border border-accent-100 px-1.5 py-0.5 rounded">Studio</span>
                            )}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">ID: {product.id.substring(0, 8)}</span>
                       </Link>
                    </td>
                    <td className="px-4 py-5">
                       <select
                         disabled={isSaving}
                         value={product.collectionId || "none"}
                         onChange={(e) => handleInlineUpdate(product.id, product.price, e.target.value, product.status)}
                         className="bg-transparent border-none text-[12px] font-bold text-slate-500 focus:ring-0 focus:outline-none cursor-pointer hover:bg-slate-100 rounded-lg px-2 py-1 transition-all capitalize"
                       >
                         <option value="none">UNASSIGNED</option>
                         {collections.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                       </select>
                    </td>
                    <td className="px-4 py-5 text-right">
                       <div className="flex items-center justify-end gap-1.5">
                          <span className="text-slate-300 text-[10px] font-black tracking-tight">$</span>
                          <input
                            type="number"
                            step="0.01"
                            disabled={isSaving}
                            defaultValue={product.price}
                            onBlur={(e) => {
                               const newPrice = parseFloat(e.target.value);
                               if (newPrice !== product.price) {
                                 handleInlineUpdate(product.id, newPrice, product.collectionId || "none", product.status);
                               }
                            }}
                            className="bg-transparent border-none text-right text-[13px] font-black text-slate-900 w-20 px-2 py-1 rounded-lg focus:ring-4 focus:ring-accent-50 focus:bg-white transition-all"
                          />
                       </div>
                    </td>
                    <td className="px-4 py-5">
                       <div className="flex items-center justify-center">
                          <button
                            disabled={isSaving}
                            onClick={() => handleStatusToggle(product.id, product.status)}
                            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${product.status === "LIVE" ? 'bg-[#4f46e5]' : 'bg-slate-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${product.status === "LIVE" ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                       <div className="flex flex-col items-end">
                          <span className={`text-[12px] font-black ${potentialProfit > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                             ${potentialProfit.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Projected</span>
                       </div>
                    </td>
                    <td className="px-4 py-5 w-10 text-center">
                       {isSaving ? (
                         <Loader2 size={14} className="text-accent-700 animate-spin" />
                       ) : isSaved ? (
                         <CheckCircle2 size={14} className="text-emerald-500 animate-in zoom-in duration-300" />
                       ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No resources located.</p>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white border border-[#4f46e5]/20 px-4 py-3 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] flex items-center gap-6 min-w-[400px]">
            <div className="bg-[#4f46e5] text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest">
              {selectedIds.size} Selected
            </div>
            
            <div className="h-4 w-px bg-slate-200" />
            
            <div className="flex-1 flex items-center gap-2">
              <select
                value={bulkCollectionSync}
                onChange={(e) => setBulkCollectionSync(e.target.value)}
                className="bg-slate-50 border-none text-[11px] font-black text-slate-600 rounded-lg px-4 py-2 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-tight"
              >
                <option value="none">SELECT COLLECTION</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={handleBulkPublish}
                disabled={bulkLoading}
                className="text-[11px] font-black text-[#4f46e5] uppercase tracking-widest px-4 hover:bg-accent-50 py-2 rounded-lg transition-all"
              >
                Assign
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <button 
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-6 py-2 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
            >
              {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Destroy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
