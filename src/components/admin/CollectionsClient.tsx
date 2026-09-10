"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Loader2, FolderTree } from "lucide-react"
import { createCollection, deleteCollection } from "@/app/actions/admin/products"
import CollectionCard from "@/components/admin/cards/CollectionCard"
import { AdminCardGrid, AdminViewToggle, useAdminView } from "@/components/admin/ui/views"
import {
  ADMIN_RULE,
  AdminButton,
  AdminEmpty,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminPanel,
  AdminSectionHeading,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTextarea,
  AdminTh,
  AdminTr,
} from "@/components/admin/ui/primitives"

type CollectionData = {
  id: string;
  name: string;
  description: string | null;
  handle: string;
  productCount: number;
  /** Optional on the model, and most collections have none — the card draws a
   *  branded placeholder rather than a broken image when it is absent. */
  imageUrl?: string | null;
}

export default function CollectionsClient({ initialCollections }: { initialCollections: CollectionData[] }) {
  const router = useRouter()
  const [collections, setCollections] = useState(initialCollections)
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [newColDesc, setNewColDesc] = useState("")
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  // Presentation only — both views render the same `collections` array and
  // call the same `handleDelete`.
  const [view, setView] = useAdminView("collections")

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
    <div className="space-y-6">
      <AdminPageHeader
        title="Collections"
        meta="Organise the catalogue into thematic groups."
      />

      {/* The create form. Its two fields were an unlabelled input and textarea
          at `rounded-panel` with a `ring-2 ring-accent-500/20` focus, beside a
          search field one panel away at `rounded-card` with
          `ring-accent-700/15` — AdminField and AdminInput are both now. */}
      <AdminPanel padded>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-card bg-accent-50 p-2 text-accent-700">
            <FolderTree aria-hidden size={16} />
          </div>
          <AdminSectionHeading>New collection</AdminSectionHeading>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <AdminField label="Collection name" htmlFor="new-collection-name">
              <AdminInput
                id="new-collection-name"
                type="text"
                placeholder="e.g. Summer Essentials"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                disabled={isCreating}
              />
            </AdminField>
            <AdminButton
              type="submit"
              variant="primary"
              disabled={isCreating || !newColName.trim()}
              className="w-full"
            >
              {isCreating ? (
                <Loader2 aria-hidden size={14} className="animate-spin" />
              ) : (
                <Plus aria-hidden size={14} />
              )}
              Create collection
            </AdminButton>
          </div>
          <AdminField label="Description" htmlFor="new-collection-description">
            <AdminTextarea
              id="new-collection-description"
              placeholder="A brief summary for this collection…"
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              disabled={isCreating}
              rows={4}
            />
          </AdminField>
        </form>
      </AdminPanel>

      <AdminPanel>
        <div
          style={{ borderColor: ADMIN_RULE }}
          className="flex items-center justify-between gap-3 border-b px-4 py-3"
        >
          <span className="type-admin-meta text-neutral-500">
            {collections.length} {collections.length === 1 ? "collection" : "collections"}
          </span>
          <AdminViewToggle view={view} onChange={setView} />
        </div>

        {collections.length === 0 ? (
          <AdminEmpty
            icon={<FolderTree aria-hidden size={24} />}
            title="No collections yet"
            message="Create one above and it becomes available to every product."
          />
        ) : view === 'list' ? (
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh>Collection</AdminTh>
                  <AdminTh className="text-center">Products</AdminTh>
                  <AdminTh>Description</AdminTh>
                  <AdminTh className="text-right">Delete</AdminTh>
                </tr>
              </thead>
              <tbody>
                {collections.map((col) => {
                  const isDeleting = loadingIds.has(col.id);

                  return (
                    <AdminTr key={col.id} className="group">
                      <AdminTd>
                        <div className="flex flex-col">
                          <span className="font-semibold text-ink transition-colors group-hover:text-accent-700">
                            {col.name}
                          </span>
                          <span className="type-admin-meta mt-0.5 text-neutral-400">/{col.handle}</span>
                        </div>
                      </AdminTd>
                      <AdminTd className="text-center">
                        <span className="type-admin-meta inline-flex items-center rounded-card border border-accent-100 bg-accent-50 px-2 py-0.5 font-semibold tabular-nums text-accent-800">
                          {col.productCount}
                        </span>
                      </AdminTd>
                      <AdminTd>
                        <span className="line-clamp-1 max-w-[300px]">{col.description || "—"}</span>
                      </AdminTd>
                      <AdminTd className="text-right">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(col.id)}
                          aria-label={`Delete the ${col.name} collection`}
                          className="rounded-card bg-[#FBF3F0] p-2 text-brand-terracotta transition-colors hover:bg-[#F6E4DD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 aria-hidden size={14} className="animate-spin" />
                          ) : (
                            <Trash2 aria-hidden size={14} />
                          )}
                        </button>
                      </AdminTd>
                    </AdminTr>
                  );
                })}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        ) : (
          <AdminCardGrid min={240} className="p-3 md:p-4">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                isDeleting={loadingIds.has(col.id)}
                onDelete={() => handleDelete(col.id)}
              />
            ))}
          </AdminCardGrid>
        )}
      </AdminPanel>
    </div>
  )
}
