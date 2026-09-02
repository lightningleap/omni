"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Loader2, FolderTree } from "lucide-react"
import { createCollection, deleteCollection } from "@/app/actions/admin/products"

type CollectionData = {
  id: string;
  name: string;
  description: string | null;
  handle: string;
  productCount: number;
}

export default function CollectionsClient({ initialCollections }: { initialCollections: CollectionData[] }) {
  const router = useRouter()
  const [collections, setCollections] = useState(initialCollections)
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [newColDesc, setNewColDesc] = useState("")
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  // Sync state when props change (revalidation)
  useEffect(() => {
    setCollections(initialCollections)
  }, [initialCollections])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return

    setIsCreating(true)
    const result = await createCollection(newColName, newColDesc)
    
    if (result.success) {
      setNewColName("")
      setNewColDesc("")
      startTransition(() => {
        router.refresh()
      })
    }
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    setLoadingIds(prev => new Set(prev).add(id))
    const result = await deleteCollection(id)
    
    if (result.success) {
      startTransition(() => {
        router.refresh()
      })
    }
    setLoadingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="space-y-8 font-sans text-neutral-900 max-w-[1400px] pb-24">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
          <p className="text-sm text-neutral-500 mt-1">Organize and curate your product catalog into thematic groups.</p>
        </div>
      </div>

      {/* Creation Sleek Card */}
      <div className="bg-white border border-neutral-200/60 rounded-3xl p-8 space-y-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FolderTree size={20} />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Create New Collection</h3>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Collection Name</label>
              <input 
                type="text" 
                placeholder="e.g. Summer Essentials" 
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                disabled={isCreating}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-300"
              />
            </div>
            <button 
              type="submit"
              disabled={isCreating || !newColName.trim()}
              className="w-full bg-indigo-600 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Initialize Collection
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Description</label>
            <textarea 
              placeholder="Provide a brief summary for this collection..." 
              value={newColDesc}
              onChange={e => setNewColDesc(e.target.value)}
              disabled={isCreating}
              rows={4}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none placeholder:text-neutral-300"
            />
          </div>
        </form>
      </div>

      {/* Active Collections Data Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="p-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Collection</th>
                <th className="p-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">Products</th>
                <th className="p-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
                <th className="p-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {collections.map((col) => {
                const isDeleting = loadingIds.has(col.id);

                return (
                  <tr key={col.id} className="group hover:bg-neutral-50/50 transition-all duration-200">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors tracking-tight">{col.name}</span>
                        <span className="text-[10px] text-neutral-400 font-medium mt-0.5 uppercase tracking-widest">/{col.handle}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-100">
                        {col.productCount} Items
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-neutral-500 font-medium line-clamp-1 max-w-[300px]">
                        {col.description || "—"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        disabled={isDeleting}
                        onClick={() => handleDelete(col.id)}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                        <FolderTree size={24} className="text-neutral-300" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-400">No active collections found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
