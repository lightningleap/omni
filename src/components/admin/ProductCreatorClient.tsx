"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Sparkles, Check, AlertCircle } from "lucide-react"
import { getDesignBlueprints, getBlueprintCanvas, createDesignedProduct } from "@/app/actions/admin/products"
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminMono,
  AdminPageHeader,
  AdminSearch,
  AdminSectionHeading,
  AdminTextarea,
} from "@/components/admin/ui/primitives"

const DesignEditor = dynamic(() => import("./DesignEditor"), {
  ssr: false,
  loading: () => (
    <div className="type-admin-body flex items-center justify-center gap-3 py-24 text-neutral-400">
      <Loader2 className="animate-spin" size={18} /> Loading design canvas...
    </div>
  ),
})

// Map a product title to one of our garment templates (front canvas only)
function garmentTypeFor(title: string): string | null {
  const t = title.toLowerCase()
  if (/tank/.test(t)) return "tank"
  if (/hoodie|sweatshirt|crewneck|sweater/.test(t)) return "hoodie"
  if (/t-?shirt|tee|top|jersey/.test(t)) return "tshirt"
  return null
}

type Blueprint = { id: number; title: string; brand: string; image: string }
type Side = { position: string; width: number; height: number }
type Variant = { id: number; color: string; size: string }
type ExportFn = { current: null | (() => string) }

const label = (pos: string) =>
  pos.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

// Best-effort swatch color for a Printify colour name
const COLOR_HEX: Record<string, string> = {
  white: "#ffffff", black: "#111111", navy: "#1e2a44", red: "#c0392b", "royal": "#1e40af",
  "royal blue": "#1e40af", blue: "#2563eb", "light blue": "#7dd3fc", "sky blue": "#7dd3fc",
  green: "#2e7d32", "forest green": "#1b4332", "military green": "#4b5320", olive: "#6b7233",
  grey: "#9ca3af", gray: "#9ca3af", "sport grey": "#b8bcc2", "sport gray": "#b8bcc2",
  "heather grey": "#b0b4ba", charcoal: "#36454f", "dark heather": "#4a4a4a",
  maroon: "#7b1e2b", purple: "#6b21a8", pink: "#ec4899", "light pink": "#f9a8d4",
  yellow: "#f4d03f", gold: "#d4af37", orange: "#e67e22", brown: "#6f4e37",
  cream: "#f5f0e1", natural: "#e8e0cf", sand: "#d8c9a3", tan: "#d2b48c",
  "kelly green": "#3d9970", "irish green": "#009a49", teal: "#008080", turquoise: "#40e0d0",
}
const swatch = (name: string) => COLOR_HEX[name.toLowerCase().trim()] || "#c9ccd1"

export default function ProductCreatorClient() {
  const router = useRouter()

  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loadingBps, setLoadingBps] = useState(true)
  const [bpError, setBpError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)

  const [sides, setSides] = useState<Side[] | null>(null)
  const [activeSide, setActiveSide] = useState<string>("")
  const [loadingArea, setLoadingArea] = useState(false)

  const [variants, setVariants] = useState<Variant[]>([])
  const [selColors, setSelColors] = useState<Set<string>>(new Set())
  const [selSizes, setSelSizes] = useState<Set<string>>(new Set())

  const [counts, setCounts] = useState<Record<string, number>>({})
  const exportRefs = useRef<Record<string, ExportFn>>({})

  const [preview, setPreview] = useState<string>("")
  const refreshPreview = useCallback(() => {
    const fn = exportRefs.current[activeSide]?.current
    if (fn) requestAnimationFrame(() => setPreview(fn()))
  }, [activeSide])
  useEffect(() => { refreshPreview() }, [activeSide, refreshPreview])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(24.99)

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ productId: string; mockups: string[] } | null>(null)

  useEffect(() => {
    getDesignBlueprints()
      .then((res) => {
        if (res.success && res.blueprints) setBlueprints(res.blueprints)
        else setBpError(res.error || "Failed to load product types.")
      })
      .catch(() => setBpError("Failed to load product types."))
      .finally(() => setLoadingBps(false))
  }, [])

  const pickBlueprint = async (b: Blueprint) => {
    setBlueprint(b)
    setSides(null)
    setCounts({})
    exportRefs.current = {}
    setLoadingArea(true)
    setError(null)
    if (!title) setTitle(`Custom ${b.title}`)
    try {
      const res = await getBlueprintCanvas(b.id)
      const list: Side[] = res.sides?.length ? res.sides : [{ position: "front", width: 1000, height: 1000 }]
      list.forEach((s) => { exportRefs.current[s.position] = { current: null } })
      setSides(list)
      setActiveSide(list[0].position)
      const vs = res.variants || []
      setVariants(vs)
      setSelColors(new Set(vs.map((v) => v.color).filter(Boolean)))
      setSelSizes(new Set(vs.map((v) => v.size).filter(Boolean)))
    } catch {
      const fallback = [{ position: "front", width: 1000, height: 1000 }]
      exportRefs.current["front"] = { current: null }
      setSides(fallback)
      setActiveSide("front")
      setVariants([])
    } finally {
      setLoadingArea(false)
    }
  }

  // Unique colours/sizes + the variant ids matching the current selection
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)))
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
  const selectedVariantIds = variants
    .filter((v) => (!v.color || selColors.has(v.color)) && (!v.size || selSizes.has(v.size)))
    .map((v) => v.id)
  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    setter(next)
  }

  const filtered = blueprints.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
  const totalLayers = Object.values(counts).reduce((a, b) => a + b, 0)

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const designs: { position: string; dataUrl: string }[] = []
      for (const side of sides || []) {
        if ((counts[side.position] || 0) === 0) continue
        const fn = exportRefs.current[side.position]?.current
        if (!fn) continue
        const dataUrl = fn()
        // ~bytes of the base64 payload
        const bytes = Math.ceil((dataUrl.length * 3) / 4)
        if (bytes > 9 * 1024 * 1024) {
          throw new Error(`The "${label(side.position)}" design is too large. Simplify it or use a smaller image.`)
        }
        designs.push({ position: side.position, dataUrl })
      }

      if (!designs.length) throw new Error("Add a design to at least one side first.")

      const res = (await createDesignedProduct({
        blueprintId: blueprint!.id,
        designs,
        variantIds: selectedVariantIds,
        title,
        description,
        price,
      })) as { success: boolean; productId?: string; mockups?: string[]; error?: string }

      if (res.success && res.productId) {
        setResult({ productId: res.productId, mockups: res.mockups || [] })
        setCreating(false)
      } else {
        setError(res.error || "Creation failed.")
        setCreating(false)
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error.")
      setCreating(false)
    }
  }

  const stripeFees = price * 0.029 + 0.3
  const formatUSD = (v: number) => `$${v.toFixed(2)}`

  // ---------- SUCCESS: real Printify mockups ----------
  if (result) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-2 pt-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100">
            <Check aria-hidden size={26} className="text-accent-700" />
          </div>
          <h1 className="type-admin-title text-ink">Product created</h1>
          <p className="type-admin-body max-w-md text-neutral-500">
            These are the mockups Printify generated for your design. It is saved to your store as a draft.
          </p>
        </div>

        {result.mockups.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {result.mockups.map((src, i) => (
              <div key={i} className="bg-white border border-[#E8E6E1] rounded-panel overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Mockup ${i + 1}`} className="w-full aspect-square object-contain bg-[#FBFAF8]" />
              </div>
            ))}
          </div>
        ) : (
          <p className="type-admin-body text-center text-neutral-400">Mockups are still generating — check the product in a moment.</p>
        )}

        <div className="flex items-center justify-center gap-3">
          <AdminButton
            variant="primary"
            onClick={() => router.push(`/admin/products/${result.productId}`)}
          >
            Open in products
          </AdminButton>
          <AdminButton
            onClick={() => {
              setResult(null); setBlueprint(null); setSides(null); setCounts({}); setTitle(""); setDescription("")
            }}
          >
            Create another
          </AdminButton>
        </div>
      </div>
    )
  }

  // ---------- STEP 1: pick product type ----------
  if (!blueprint) {
    return (
      <div className="space-y-6">
        <Header step={1} />
        <div className="max-w-md">
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search product types (t-shirt, mug, hoodie…)"
            label="Search Printify product types"
          />
        </div>

        {loadingBps && (
          <div className="type-admin-body flex items-center justify-center gap-3 py-20 text-neutral-400">
            <Loader2 aria-hidden className="animate-spin" size={16} /> Loading product catalogue…
          </div>
        )}
        {bpError && (
          <div
            role="alert"
            className="type-admin-body flex items-center gap-3 rounded-card border border-[#E7D3CB] bg-[#FBF3F0] p-3 text-brand-terracotta"
          >
            <AlertCircle aria-hidden size={16} /> {bpError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((b) => (
            <button key={b.id} onClick={() => pickBlueprint(b)}
              className="group text-left bg-white border border-[#E8E6E1] rounded-panel overflow-hidden hover:border-accent-600 transition-all">
              <div className="aspect-square relative bg-[#FBFAF8] flex items-center justify-center">
                {b.image ? <Image src={b.image} alt={b.title} fill className="object-contain p-4" /> : <Sparkles className="text-neutral-200" size={32} />}
              </div>
              <div className="border-t border-[#EFEDE8] p-3">
                <p className="type-admin-body line-clamp-2 font-semibold leading-tight text-ink">{b.title}</p>
                <p className="type-admin-label mt-1 text-neutral-400">{b.brand}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---------- STEP 2: design + details ----------
  return (
    <div className="space-y-6">
      <Header step={2} onBack={() => { setBlueprint(null); setSides(null) }} backLabel={blueprint.title} />

      {error && (
        <div
          role="alert"
          className="type-admin-body flex items-center gap-3 rounded-card border border-[#E7D3CB] bg-[#FBF3F0] p-3 font-semibold text-brand-terracotta"
        >
          <AlertCircle aria-hidden size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="xl:col-span-2 bg-white border border-[#E8E6E1] rounded-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <AdminSectionHeading>Design canvas</AdminSectionHeading>
            {sides && (
              <AdminMono className="text-neutral-400">
                {(() => { const s = sides.find((x) => x.position === activeSide); return s ? `${s.width}×${s.height}px` : "" })()}
              </AdminMono>
            )}
          </div>

          {/* Side tabs (Front / Back / Sleeves...) */}
          {sides && sides.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {sides.map((s) => (
                <button key={s.position} onClick={() => setActiveSide(s.position)}
                  className={`type-admin-meta flex items-center gap-2 rounded-card px-3 py-1.5 font-semibold transition-colors ${activeSide === s.position ? "bg-ink text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                  {label(s.position)}
                  {(counts[s.position] || 0) > 0 && <span className={`w-1.5 h-1.5 rounded-full ${activeSide === s.position ? "bg-accent-500" : "bg-accent-700"}`} />}
                </button>
              ))}
            </div>
          )}

          {loadingArea || !sides ? (
            <div className="type-admin-body flex items-center justify-center gap-3 py-24 text-neutral-400">
              <Loader2 aria-hidden className="animate-spin" size={16} /> Loading print area…
            </div>
          ) : (
            sides.map((s) => (
              <div key={s.position} style={{ display: activeSide === s.position ? "block" : "none" }}>
                <DesignEditor
                  printArea={{ width: s.width, height: s.height }}
                  exportRef={exportRefs.current[s.position]}
                  onLayerCount={(n) => setCounts((c) => (c[s.position] === n ? c : { ...c, [s.position]: n }))}
                  onChange={s.position === activeSide ? refreshPreview : undefined}
                  positionLabel={label(s.position)}
                  garment={/front/i.test(s.position) ? garmentTypeFor(blueprint.title) : null}
                />
              </div>
            ))
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Live preview: design placed on the real product photo */}
          <div className="bg-white border border-[#E8E6E1] rounded-panel p-6">
            <div className="flex items-center justify-between mb-3">
              <AdminSectionHeading>Preview on product</AdminSectionHeading>
              <span className="type-admin-label text-neutral-400">{label(activeSide || "front")}</span>
            </div>
            <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-[#FBFAF8] rounded-panel overflow-hidden flex items-center justify-center">
              {/front/i.test(activeSide) && blueprint.image ? (
                <>
                  <img src={blueprint.image} alt="" className="w-full h-full object-contain" />
                  {preview && (
                    // Approximate placement for the front print (rough guide only)
                    <img src={preview} alt="" className="absolute pointer-events-none object-contain"
                      style={{ left: "50%", top: "46%", width: "46%", maxHeight: "50%", transform: "translate(-50%, -50%)" }} />
                  )}
                </>
              ) : preview ? (
                <img src={preview} alt="" className="max-w-[70%] max-h-[70%] object-contain" />
              ) : (
                <span className="type-admin-meta text-neutral-400">Add a design to preview it</span>
              )}
            </div>
            <p className="type-admin-meta mt-2 text-center text-neutral-400">
              Approximate placement — Printify generates the exact mockup on creation.
            </p>
          </div>

          {/* Colors & Sizes */}
          {(colors.length > 0 || sizes.length > 0) && (
            <div className="bg-white border border-[#E8E6E1] rounded-panel p-6 space-y-5">
              <div className="flex items-center justify-between">
                <AdminSectionHeading>Colours and sizes</AdminSectionHeading>
                <span className="type-admin-label text-neutral-400">{selectedVariantIds.length} variants</span>
              </div>

              {colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="type-admin-label text-neutral-500">Colours</span>
                    <button type="button" onClick={() => setSelColors(new Set(selColors.size === colors.length ? [] : colors))}
                      className="type-admin-label text-accent-700 hover:text-accent-800">
                      {selColors.size === colors.length ? "Clear" : "All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const on = selColors.has(c)
                      return (
                        <button key={c} title={c} onClick={() => toggle(selColors, c, setSelColors)}
                          className={`type-admin-meta flex items-center gap-1.5 rounded-card border py-1 pl-1.5 pr-2.5 font-semibold transition-colors ${on ? "border-accent-700 bg-accent-50 text-ink" : "border-[#E8E6E1] text-neutral-500 hover:border-neutral-300"}`}>
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: swatch(c) }} />
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="type-admin-label text-neutral-500">Sizes</span>
                    <button type="button" onClick={() => setSelSizes(new Set(selSizes.size === sizes.length ? [] : sizes))}
                      className="type-admin-label text-accent-700 hover:text-accent-800">
                      {selSizes.size === sizes.length ? "Clear" : "All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const on = selSizes.has(s)
                      return (
                        <button key={s} onClick={() => toggle(selSizes, s, setSelSizes)}
                          className={`type-admin-meta rounded-card border px-3 py-1.5 font-semibold transition-colors ${on ? "border-ink bg-ink text-white" : "border-[#E8E6E1] text-neutral-500 hover:border-neutral-300"}`}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-[#E8E6E1] rounded-panel p-6 space-y-5">
            <AdminSectionHeading>Product details</AdminSectionHeading>
            <AdminField label="Name" htmlFor="new-product-title">
              <AdminInput
                id="new-product-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vintage Sunset Tee"
                className="font-semibold"
              />
            </AdminField>
            <AdminField label="Description" htmlFor="new-product-description">
              <AdminTextarea
                id="new-product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short product description…"
              />
            </AdminField>
            <AdminField
              label="Retail price (USD)"
              htmlFor="new-product-price"
              hint={`Est. Stripe fees ${formatUSD(stripeFees)} · base cost is set after creation`}
            >
              <div className="relative">
                <span className="type-admin-body pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                <AdminInput
                  id="new-product-price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="pl-7 font-semibold tabular-nums"
                />
              </div>
            </AdminField>
          </div>

          <AdminButton
            variant="primary"
            onClick={handleCreate}
            disabled={creating || totalLayers === 0 || !title.trim() || (variants.length > 0 && selectedVariantIds.length === 0)}
            className="h-11 w-full"
          >
            {creating ? (
              <Loader2 aria-hidden size={15} className="animate-spin" />
            ) : (
              <Check aria-hidden size={15} />
            )}
            {creating ? "Creating on Printify…" : "Create product"}
          </AdminButton>
          {totalLayers === 0 && (
            <p className="type-admin-meta text-center text-neutral-400">Add an image, text or shape to enable creation.</p>
          )}
          <p className="type-admin-meta text-center text-neutral-400">
            Every designed side is flattened and sent to Printify, which generates the real mockups. Saved as a draft.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * The wizard's header.
 *
 * It used to hand-roll a page title (24px) with an eyebrow under it at
 * `text-xs font-bold uppercase tracking-widest` — a step that exists nowhere
 * else in the studio. It is AdminPageHeader now, so the Design Studio's title
 * sits at exactly the height and weight of every other page's, and the step
 * indicator uses the meta slot that already exists for exactly this.
 */
function Header({ step, onBack, backLabel }: { step: number; onBack?: () => void; backLabel?: string }) {
  return (
    <AdminPageHeader
      title="Design Studio"
      meta={
        <>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <ArrowLeft aria-hidden size={13} /> {backLabel || "Back"}
            </button>
          ) : (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <ArrowLeft aria-hidden size={13} /> Products
            </Link>
          )}
          <span aria-hidden className="text-neutral-300">·</span>
          <span>{step === 1 ? "Step 1 — choose a product" : "Step 2 — design it"}</span>
        </>
      }
    />
  )
}
