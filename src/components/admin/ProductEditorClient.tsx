"use client"

import React, { useState } from "react"
import { ArrowLeft, Save, Loader2, DollarSign, Box, Tag, Globe, Settings, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { updateProductGatekeeper, setProductImage } from "@/app/actions/admin/products"

type ProductData = {
  id: string
  name: string
  description: string | null
  price: number
  cost: number
  imageUrl: string
  collectionId: string | null
  printifyId: string | null
  status: "LIVE" | "DRAFT"
}

type CollectionData = {
  id: string
  name: string
}

export default function ProductEditorClient({
  product,
  collections,
  mockups = []
}: {
  product: ProductData
  collections: CollectionData[]
  mockups?: { src: string; color: string }[]
}) {
  const [price, setPrice] = useState(product.price)
  const [collectionId, setCollectionId] = useState(product.collectionId || "none")
  const [status, setStatus] = useState<"LIVE" | "DRAFT">(product.status || "DRAFT")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState(product.imageUrl)

  const pickImage = async (src: string) => {
    setMainImage(src)
    try { await setProductImage(product.id, src) } catch { /* non-blocking */ }
  }

  // Financial Algorithm: Retail - (Cost + (Retail * 2.9% + 0.30)) = Net Profit
  const stripeFees = (price * 0.029) + 0.30
  const netProfit = price - (product.cost + stripeFees)
  const marginPercent = price > 0 ? (netProfit / price) * 100 : 0

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
       await updateProductGatekeeper(product.id, price, collectionId, status)
       // Optional: router.refresh() if needed, but updateProductGatekeeper does revalidatePath
    } catch (err: any) {
       setError(err.message || "An unexpected error occurred.")
    } finally {
       setIsSaving(false)
    }
  }

  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-8 font-sans bg-surface min-h-screen p-8">
      
      {/* BREADCRUMB & HEADER */}
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="space-y-1">
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-ink transition-colors mb-2">
            <ArrowLeft size={16} /> Products
          </Link>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">{product.name}</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-[#E8E6E1] rounded-card text-sm font-semibold text-ink hover:bg-[#FBFAF8] transition-colors">
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-ink border border-ink rounded-card text-sm font-semibold text-white hover:bg-ink transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save product
          </button>
        </div>
      </div>

      {error && (
         <div className="max-w-6xl mx-auto bg-[#FBF3F0] border border-[#E7D3CB] rounded-card p-4 flex items-center gap-3 text-brand-terracotta text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <span className="font-bold">{error}</span>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* LEFT COLUMN: Media & Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Media Card */}
          <div className="bg-white border border-[#E8E6E1] rounded-panel overflow-hidden">
             <div className="p-4 border-b border-[#EFEDE8] flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Media</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.printifyId || "LOCAL"}</span>
             </div>
             <div className="aspect-[4/3] w-full relative bg-[#FBFAF8] flex items-center justify-center p-12">
               {mainImage ? (
                 <Image src={mainImage} alt={product.name} fill className="object-contain p-8" />
               ) : (
                 <Box size={48} className="text-neutral-200" />
               )}
             </div>

             {/* Colour mockups gallery */}
             {mockups.length > 0 && (
               <div className="px-4 pb-4 pt-2 border-t border-[#EFEDE8]">
                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Colors ({mockups.length})</span>
                 <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                   {mockups.map((m) => (
                     <button key={m.src} onClick={() => pickImage(m.src)} title={m.color}
                       className={`flex-shrink-0 w-16 h-16 rounded-card border overflow-hidden bg-[#FBFAF8] transition-all ${mainImage === m.src ? "border-accent-700 ring-2 ring-accent-100" : "border-[#E8E6E1] hover:border-neutral-300"}`}>
                       <Image src={m.src} alt={m.color} width={64} height={64} className="w-full h-full object-contain" />
                     </button>
                   ))}
                 </div>
               </div>
             )}
          </div>

          {/* Description Card */}
          <div className="bg-white border border-[#E8E6E1] rounded-panel overflow-hidden">
             <div className="px-4 py-3.5 border-b border-[#EFEDE8]">
                <span className="text-sm font-bold text-ink">Product Description</span>
             </div>
             <div className="p-8 space-y-6">
                <div 
                   className="text-sm text-neutral-500 leading-relaxed max-w-none prose prose-slate" 
                   dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }} 
                />
             </div>
             <div className="px-4 py-3.5 bg-[#FBFAF8] border-t border-[#EFEDE8] flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                <span>Body Content</span>
                <span>Rich Text Field</span>
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Stats & Organization */}
        <div className="space-y-6">
          
          <div className="bg-white border border-[#E8E6E1] rounded-panel p-6 space-y-6">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-ink">
                      <Globe size={16} className="text-neutral-400" />
                      <span className="text-sm font-bold">Storefront Status</span>
                   </div>
                   <button
                      disabled={collectionId === "none" || isSaving}
                      onClick={() => setStatus(status === "LIVE" ? "DRAFT" : "LIVE")}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${collectionId === "none" ? 'bg-neutral-200 cursor-not-allowed' : status === "LIVE" ? 'bg-accent-600' : 'bg-neutral-300'}`}
                      title={collectionId === "none" ? "Assign a collection first" : `Switch to ${status === "LIVE" ? "DRAFT" : "LIVE"}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status === "LIVE" ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                   {status === "LIVE" && collectionId !== "none" ? (
                      <span className="bg-[#E3F1DF] text-[#008060] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#B7DDB0] uppercase tracking-wider">
                        Live on Storefront
                      </span>
                   ) : (
                      <span className="bg-[#F1F2F3] text-[#5C5F62] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D3D6D8] uppercase tracking-wider">
                        Hidden / Draft
                      </span>
                   )}
                </div>

                {collectionId === "none" && (
                   <div className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-100">
                      <AlertCircle size={12} className="text-amber-600 mt-0.5" />
                      <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
                         Assign a collection to enable storefront publication.
                      </p>
                   </div>
                )}
             </div>

             <div className="h-px bg-neutral-100" />

             <div className="space-y-4">
                <div className="flex items-center gap-2 text-ink">
                   <Tag size={16} className="text-neutral-400" />
                   <span className="text-sm font-bold">Collection</span>
                </div>
                <select 
                   value={collectionId}
                   onChange={e => setCollectionId(e.target.value)}
                   className="w-full bg-white border border-[#E8E6E1] rounded-card text-sm font-semibold text-ink px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500/10 focus:border-accent-700"
                >
                   <option value="none">Choose Collection</option>
                   {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                </select>
             </div>
          </div>

          {/* Profit Calculator Card */}
          <div className="bg-white border border-[#E8E6E1] rounded-panel overflow-hidden">
             <div className="p-4 border-b border-[#EFEDE8] flex items-center gap-2">
                <DollarSign size={16} className="text-neutral-400" />
                <span className="text-sm font-bold text-ink">Financial Insights</span>
             </div>
             
             <div className="p-6 space-y-6">
                {/* Pricing Field */}
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Retail Price</label>
                      <span className="text-[10px] font-bold text-neutral-300 uppercase">USD</span>
                   </div>
                   <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm group-focus-within:text-accent-700">$</span>
                      <input 
                         type="number" 
                         value={price}
                         onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                         className="w-full bg-white border border-[#E8E6E1] rounded-card text-sm font-bold text-ink pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500/10 focus:border-accent-700 transition-all font-mono"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Base Cost</span>
                      <p className="text-xs font-bold text-ink">{formatUSD(product.cost)}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Est. Fees</span>
                      <p className="text-xs font-bold text-neutral-400">{formatUSD(stripeFees)}</p>
                   </div>
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Net Profit</span>
                         <p className={`text-[16px] font-semibold ${netProfit > 0 ? "text-accent-700" : "text-brand-terracotta"}`}>
                            {formatUSD(netProfit)}
                         </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-semibold tracking-widest ${netProfit > 0 ? "bg-accent-50 text-accent-800" : "bg-[#FBF3F0] text-brand-terracotta"}`}>
                         {marginPercent.toFixed(1)}%
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="px-4 py-3.5 bg-[#FBFAF8] border-t border-[#EFEDE8] flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Margins Protected</span>
                <Settings size={14} className="text-neutral-300" />
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
