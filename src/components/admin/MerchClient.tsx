"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { updateMerchSettings, updateCollectionImage, upsertDiscoveryItem, removeDiscoveryItem } from "@/app/actions/merch";
import { upload } from "@vercel/blob/client";
import { Video, Megaphone, Image as ImageIcon, Trash2, Plus, Loader2, Star, Zap, Edit3, Check, Search, LayoutGrid, Flame, Upload, X } from "lucide-react";

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
  { id: "BUDGET", label: "Budget Friendly Picks", icon: Zap, color: "#4f46e5", description: "Curate under ₹599 collections" },
  { id: "OMG", label: "OMG Deals", icon: Star, color: "#f59e0b", description: "Highlight premium discounted deals" },
  { id: "CATEGORY", label: "Shop By Category", icon: LayoutGrid, color: "#10b981", description: "Manage homepage category grid" }
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
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setHeroImageUrl(blob.url);
    } catch (error) {
      alert("Poster Upload Failed.");
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
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      setEditForm((prev: any) => ({ ...prev, imageUrl: blob.url }));
    } catch (error: any) {
      console.group("Discovery Upload Diagnostic");
      console.error("Error Object:", error);
      if (error instanceof Response) {
        try {
          const body = await error.json();
          console.error("Server Response Body:", body);
          alert(`UPLOAD FAILED [${body.code || 'UNKNOWN'}]: ${body.error || error.statusText}`);
        } catch {
          console.error("Raw status:", error.status, error.statusText);
        }
      } else {
        alert(error.message || "UPLOAD FAILED. Check console.");
      }
      console.groupEnd();
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
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-slate-900 px-4 md:px-8">
      <div className="max-w-7xl mx-auto mt-8 space-y-12">
        {/* Header - Integrated */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight italic">Content Management</h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Curate your storefront experience and visual narrative.</p>
          </div>
          <button 
            onClick={handleSaveConfig}
            disabled={isSavingConfig}
            className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            {isSavingConfig ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} 
            Save Global Assets
          </button>
        </div>
        {/* ── SECTION SELECTOR ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                updateSection(section.id);
                setIsMenuOpen(false);
              }}
              className={`relative overflow-hidden group p-8 rounded-3xl border-2 transition-all text-left ${
                activeSection === section.id 
                ? 'bg-white border-indigo-600 ring-4 ring-indigo-50 shadow-sm' 
                : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${activeSection === section.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <section.icon size={28} />
                </div>
                {activeSection === section.id && <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Active Scope</div>}
              </div>
              <div className="mt-8 space-y-2">
                <h3 className={`text-2xl font-black transition-colors leading-none ${activeSection === section.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {section.label}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── CURATION DECK ─────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                {activeSection === "BUDGET" ? "Budget Friendly picks" : activeSection === "OMG" ? "OMG Deals" : "Shop By Category"}
                <span className="text-slate-300 font-light px-2 border-l border-slate-200">Current Distribution</span>
              </h2>
              <p className="text-sm text-slate-500 font-medium">Collections currently appearing in the {activeSection} carousel.</p>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} /> Select Collection from Menu
            </button>
          </div>

          {isMenuOpen && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search all collections catalog..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredCollections.map(coll => (
                    <button
                      key={coll.id}
                      onClick={() => handleAddDiscovery(coll.id)}
                      disabled={isAddingDiscovery === coll.id}
                      className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-600 hover:ring-2 hover:ring-indigo-50 transition-all text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase truncate">{coll.name}</span>
                        {isAddingDiscovery === coll.id ? <Loader2 size={14} className="animate-spin text-indigo-600" /> : <Plus size={14} className="text-slate-300 group-hover:text-indigo-600" />}
                      </div>
                    </button>
                  ))}
                  {searchTerm && filteredCollections.length === 0 && (
                    <p className="col-span-full py-4 text-center text-slate-400 font-medium italic">No collections found in catalog</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="p-6 flex gap-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-100 relative overflow-hidden bg-slate-50 flex-shrink-0">
                    <Image src={item.customImageUrl || item.collection.imageUrl || ""} alt={item.collection.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase italic">{item.collection.name}</h3>
                        <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md tracking-widest uppercase">
                          {item.customDescription || "Set description"}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditForm({ 
                              imageUrl: item.customImageUrl || "", 
                              description: item.customDescription || "" 
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleRemoveDiscovery(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {editingItemId === item.id && (
                      <div className="space-y-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storefront Asset Media (1080x1350px Optimized)</label>
                            
                            <label className="cursor-pointer group flex items-center justify-center gap-4 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300">
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Uploading Media...</span>
                                </div>
                              ) : editForm.imageUrl ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm mb-2 group-preview">
                                    <Image src={editForm.imageUrl} alt="Preview" fill className="object-cover" />
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditForm({ ...editForm, imageUrl: "" });
                                      }}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
                                    >
                                      <X size={12} />
                                    </button>
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-preview-hover:opacity-100 transition-opacity">
                                      <ImageIcon size={20} className="text-white" />
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Change Asset</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="text-slate-400 group-hover:text-indigo-600" size={24} />
                                  </div>
                                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-600">Select File from Device</span>
                                </div>
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Card Legend Description (E.G. UNDER ₹599)</label>
                            <input 
                              type="text"
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              placeholder="E.G. UNDER ₹599"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => handleSaveItemEdit(item.id, item.collectionId)}
                            className="flex-1 bg-indigo-600 text-white text-sm font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                          >
                            <Check size={20} /> Finalize and Ingest Curation
                          </button>
                          <button 
                            onClick={() => setEditingItemId(null)}
                            className="px-8 py-4 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                          >
                            <X size={18} /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activeItems.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-inner">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <Search size={32} />
                  </div>
                  <p className="text-xl font-bold text-slate-600">No collections curated yet</p>
                  <p className="text-sm text-slate-400 font-medium">Use the "Select Collection from Menu" button to start curating.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="pt-12 border-t border-slate-200">
          {/* Configuration Panel */}
          <section className="max-w-3xl space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase italic">Global Render Assets</h2>
              <p className="text-sm text-slate-500 font-medium">Control hierarchical storefront media flow.</p>
            </div>
            
            <form onSubmit={handleSaveConfig} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              {/* Hierarchical Poster Link */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hero Static Poster (IMG) - Desktop Optimized 2000x1200px</label>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-12 py-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  
                  <label className="cursor-pointer group flex items-center justify-center gap-4 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-8 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-indigo-600" size={24} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={18} className="text-slate-400 group-hover:text-indigo-600" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-600">Upload from Device</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroPosterUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Animation Sequencer Playlist</label>
                   <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Tip: Use Cloudinary f_auto,q_auto links</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heroVideoUrls.map((url, idx) => (
                    <div key={idx} className="relative">
                      <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const next = [...heroVideoUrls];
                          next[idx] = e.target.value;
                          setHeroVideoUrls(next);
                        }}
                        placeholder={`Hero Animation ${idx + 1}`}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 rounded-xl px-10 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingConfig}
                className="w-full bg-[#121212] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-indigo-900 transition-all"
              >
                {isSavingConfig ? <Loader2 className="animate-spin" size={16} /> : "Finalize Global Hierarchy"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
