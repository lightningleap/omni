"use client"

import React, { useState } from "react"
import { ArrowLeft, Save, Loader2, DollarSign, Box, Tag, Globe, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { updateProductGatekeeper, setProductImage } from "@/app/actions/admin/products"
import {
  ADMIN_RULE,
  AdminButton,
  adminButtonClass,
  AdminField,
  AdminInput,
  AdminMono,
  AdminPageHeader,
  AdminPanel,
  AdminSectionHeading,
  AdminSelect,
} from "@/components/admin/ui/primitives"

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
    /* This page set its own `bg-surface min-h-screen p-8` inside the admin
       layout, which already supplies the ground and the gutters — so the editor
       sat in a second, differently padded page. It is the studio's shell and
       header now, and every panel below is AdminPanel. */
    <div className="space-y-6">
      <AdminPageHeader
        title={product.name}
        meta={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <ArrowLeft aria-hidden size={13} /> Back to products
          </Link>
        }
        action={
          <>
            {/* A Link, not a button. The original Discard was a <button> with
                no onClick at all — it looked like an action and did nothing. */}
            <Link href="/admin/products" className={adminButtonClass()}>
              Discard
            </Link>
            <AdminButton variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 aria-hidden size={14} className="animate-spin" />
              ) : (
                <Save aria-hidden size={14} />
              )}
              Save product
            </AdminButton>
          </>
        }
      />

      {error && (
        <div
          className="type-admin-body animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-card border border-[#E7D3CB] bg-[#FBF3F0] p-3 text-brand-terracotta"
          role="alert"
        >
          <AlertCircle aria-hidden size={16} className="shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: media and description */}
        <div className="space-y-6 lg:col-span-2">
          <AdminPanel>
            <div
              style={{ borderColor: ADMIN_RULE }}
              className="flex items-center justify-between border-b px-4 py-3"
            >
              <AdminSectionHeading>Media</AdminSectionHeading>
              <AdminMono className="text-neutral-400">
                {product.printifyId || "local"}
              </AdminMono>
            </div>
            <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#FBFAF8] p-10">
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill className="object-contain p-8" />
              ) : (
                <Box aria-hidden size={40} className="text-neutral-200" />
              )}
            </div>

            {mockups.length > 0 && (
              <div style={{ borderColor: ADMIN_RULE }} className="border-t px-4 pb-4 pt-3">
                <p className="type-admin-label text-neutral-500">Colours ({mockups.length})</p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {mockups.map((m) => (
                    <button
                      key={m.src}
                      type="button"
                      onClick={() => pickImage(m.src)}
                      title={m.color}
                      aria-label={`Show the ${m.color} mockup`}
                      aria-pressed={mainImage === m.src}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-card border bg-[#FBFAF8] transition-colors ${
                        mainImage === m.src
                          ? "border-accent-700 ring-2 ring-accent-100"
                          : "border-[#E8E6E1] hover:border-neutral-300"
                      }`}
                    >
                      <Image
                        src={m.src}
                        alt=""
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </AdminPanel>

          <AdminPanel>
            <div style={{ borderColor: ADMIN_RULE }} className="border-b px-4 py-3">
              <AdminSectionHeading>Description</AdminSectionHeading>
            </div>
            <div
              className="type-admin-body max-w-none p-5 text-neutral-600 md:p-6"
              dangerouslySetInnerHTML={{
                __html: product.description || "<p>No description provided.</p>",
              }}
            />
          </AdminPanel>
        </div>

        {/* RIGHT COLUMN: status, collection, economics */}
        <div className="space-y-6">
          <AdminPanel padded className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Globe aria-hidden size={15} className="text-neutral-400" />
                  <AdminSectionHeading>Storefront status</AdminSectionHeading>
                </div>
                <button
                  type="button"
                  disabled={collectionId === "none" || isSaving}
                  onClick={() => setStatus(status === "LIVE" ? "DRAFT" : "LIVE")}
                  role="switch"
                  aria-checked={status === "LIVE"}
                  aria-label="Live on the storefront"
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 ${
                    collectionId === "none"
                      ? "cursor-not-allowed bg-neutral-200"
                      : status === "LIVE"
                        ? "cursor-pointer bg-accent-800"
                        : "cursor-pointer bg-neutral-300"
                  }`}
                  title={
                    collectionId === "none"
                      ? "Assign a collection first"
                      : `Switch to ${status === "LIVE" ? "draft" : "live"}`
                  }
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      status === "LIVE" ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {status === "LIVE" && collectionId !== "none" ? (
                <span className="type-admin-label inline-flex rounded-card border border-accent-200 bg-accent-50 px-2 py-1 text-accent-800">
                  Live on storefront
                </span>
              ) : (
                <span className="type-admin-label inline-flex rounded-card border border-[#E8E6E1] bg-[#FBFAF8] px-2 py-1 text-neutral-500">
                  Hidden — draft
                </span>
              )}

              {collectionId === "none" && (
                <div className="flex items-start gap-2 rounded-card border border-amber-100 bg-amber-50 p-2.5">
                  <AlertCircle aria-hidden size={13} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="type-admin-meta text-amber-700">
                    Assign a collection before this product can be published.
                  </p>
                </div>
              )}
            </div>

            <div className="h-px bg-neutral-100" />

            <AdminField
              label={
                <>
                  <Tag aria-hidden size={12} className="mr-1.5 inline align-[-1px]" />
                  Collection
                </>
              }
              htmlFor="product-collection"
            >
              <AdminSelect
                id="product-collection"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
              >
                <option value="none">Choose a collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </AdminPanel>

          {/* Unit economics */}
          <AdminPanel>
            <div
              style={{ borderColor: ADMIN_RULE }}
              className="flex items-center gap-2 border-b px-4 py-3"
            >
              <DollarSign aria-hidden size={15} className="text-neutral-400" />
              <AdminSectionHeading>Unit economics</AdminSectionHeading>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <AdminField label="Retail price (USD)" htmlFor="product-price">
                <div className="relative">
                  <span className="type-admin-body pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    $
                  </span>
                  {/* The one field in the studio that was set in `font-mono`
                      for no reason a reader could infer — a price is a figure
                      to type, not an identifier to read back. */}
                  <AdminInput
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="pl-7 font-semibold tabular-nums"
                  />
                </div>
              </AdminField>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="type-admin-label text-neutral-400">Base cost</p>
                  <p className="type-admin-body mt-1 font-semibold tabular-nums text-ink">
                    {formatUSD(product.cost)}
                  </p>
                </div>
                <div>
                  <p className="type-admin-label text-neutral-400">Est. fees</p>
                  <p className="type-admin-body mt-1 font-semibold tabular-nums text-neutral-500">
                    {formatUSD(stripeFees)}
                  </p>
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="type-admin-label text-neutral-400">Net profit</p>
                  <p
                    className={`type-admin-stat mt-1 ${
                      netProfit > 0 ? "text-accent-700" : "text-brand-terracotta"
                    }`}
                  >
                    {formatUSD(netProfit)}
                  </p>
                </div>
                <span
                  className={`type-admin-label rounded-card px-2 py-1 ${
                    netProfit > 0
                      ? "bg-accent-50 text-accent-800"
                      : "bg-[#FBF3F0] text-brand-terracotta"
                  }`}
                >
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  )
}
