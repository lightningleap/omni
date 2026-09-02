"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Sparkles, Search, Check, AlertCircle } from "lucide-react"
import { getDesignBlueprints, getBlueprintCanvas, createDesignedProduct } from "@/app/actions/admin/products"

const DesignEditor = dynamic(() => import("./DesignEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-24 text-slate-400 text-sm font-bold gap-3">
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
      <div className="space-y-8 p-4">
        <div className="flex flex-col items-center text-center gap-2 pt-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product created!</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md">
            Here are the real mockups Printify generated for your design. Saved to your store as a draft.
          </p>
        </div>

        {result.mockups.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {result.mockups.map((src, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Mockup ${i + 1}`} className="w-full aspect-square object-contain bg-slate-50" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">Mockups are still generating — check the product in a moment.</p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button onClick={() => router.push(`/admin/products/${result.productId}`)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
            Open in Products
          </button>
          <button onClick={() => {
            setResult(null); setBlueprint(null); setSides(null); setCounts({}); setTitle(""); setDescription("")
          }}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Create Another
          </button>
        </div>
      </div>
    )
  }

  // ---------- STEP 1: pick product type ----------
  if (!blueprint) {
    return (
      <div className="space-y-8 p-4">
        <Header step={1} />
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product types (t-shirt, mug, hoodie...)"
            className="w-full bg-white border border-slate-200 text-sm text-slate-900 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400 font-medium" />
        </div>

        {loadingBps && (
          <div className="flex items-center gap-3 text-slate-400 text-sm font-bold py-20 justify-center">
            <Loader2 className="animate-spin" size={18} /> Loading product catalog...
          </div>
        )}
        {bpError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle size={18} /> {bpError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((b) => (
            <button key={b.id} onClick={() => pickBlueprint(b)}
              className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-400 hover:shadow-lg transition-all">
              <div className="aspect-square relative bg-slate-50 flex items-center justify-center">
                {b.image ? <Image src={b.image} alt={b.title} fill className="object-contain p-4" /> : <Sparkles className="text-slate-200" size={32} />}
              </div>
              <div className="p-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">{b.title}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{b.brand}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---------- STEP 2: design + details ----------
  return (
    <div className="space-y-6 p-4">
      <Header step={2} onBack={() => { setBlueprint(null); setSides(null) }} backLabel={blueprint.title} />

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900">Design Canvas</span>
            {sides && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {(() => { const s = sides.find((x) => x.position === activeSide); return s ? `${s.width}×${s.height}px` : "" })()}
              </span>
            )}
          </div>

          {/* Side tabs (Front / Back / Sleeves...) */}
          {sides && sides.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {sides.map((s) => (
                <button key={s.position} onClick={() => setActiveSide(s.position)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeSide === s.position ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {label(s.position)}
                  {(counts[s.position] || 0) > 0 && <span className={`w-1.5 h-1.5 rounded-full ${activeSide === s.position ? "bg-emerald-400" : "bg-emerald-500"}`} />}
                </button>
              ))}
            </div>
          )}

          {loadingArea || !sides ? (
            <div className="flex items-center justify-center py-24 text-slate-400 text-sm font-bold gap-3">
              <Loader2 className="animate-spin" size={18} /> Loading print area...
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
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900">Preview on product</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label(activeSide || "front")}</span>
            </div>
            <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">
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
                <span className="text-[11px] text-slate-400 font-medium">Add a design to preview it</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">
              Approximate placement — Printify generates the exact mockup on creation.
            </p>
          </div>

          {/* Colors & Sizes */}
          {(colors.length > 0 || sizes.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Colors &amp; Sizes</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedVariantIds.length} variants</span>
              </div>

              {colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Colors</label>
                    <button onClick={() => setSelColors(new Set(selColors.size === colors.length ? [] : colors))}
                      className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-700">
                      {selColors.size === colors.length ? "Clear" : "All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const on = selColors.has(c)
                      return (
                        <button key={c} title={c} onClick={() => toggle(selColors, c, setSelColors)}
                          className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${on ? "border-indigo-500 bg-indigo-50 text-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sizes</label>
                    <button onClick={() => setSelSizes(new Set(selSizes.size === sizes.length ? [] : sizes))}
                      className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-700">
                      {selSizes.size === sizes.length ? "Clear" : "All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const on = selSizes.has(s)
                      return (
                        <button key={s} onClick={() => toggle(selSizes, s, setSelSizes)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-5">
            <span className="text-sm font-bold text-slate-900">Product Details</span>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vintage Sunset Tee"
                className="w-full bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short product description..."
                className="w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retail Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Est. Stripe fees {formatUSD(stripeFees)} · base cost set after creation</p>
            </div>
          </div>

          <button onClick={handleCreate} disabled={creating || totalLayers === 0 || !title.trim() || (variants.length > 0 && selectedVariantIds.length === 0)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {creating ? "Creating on Printify..." : "Create Product"}
          </button>
          {totalLayers === 0 && (
            <p className="text-center text-[11px] text-slate-400 font-medium">Add an image, text, or shape to enable creation.</p>
          )}
          <p className="text-center text-[11px] text-slate-400 font-medium">
            All designed sides are flattened and sent to Printify, which generates the real mockups. Saved as a DRAFT.
          </p>
        </div>
      </div>
    </div>
  )
}

function Header({ step, onBack, backLabel }: { step: number; onBack?: () => void; backLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        {onBack ? (
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-1">
            <ArrowLeft size={16} /> {backLabel || "Back"}
          </button>
        ) : (
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-1">
            <ArrowLeft size={16} /> Products
          </Link>
        )}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles size={22} className="text-indigo-500" /> Design Studio
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          {step === 1 ? "Step 1 — Choose a product" : "Step 2 — Design it"}
        </p>
      </div>
    </div>
  )
}
