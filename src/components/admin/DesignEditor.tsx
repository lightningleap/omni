"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Stage, Layer, Rect, Circle, Text as KText, Image as KImage, Transformer } from "react-konva"
import {
  Upload, Type, Square, Circle as CircleIcon, Trash2, ArrowUp, ArrowDown, Bold,
  Sparkles, Loader2, X,
} from "lucide-react"
import { generateAiImage } from "@/app/actions/admin/products"
import {
  ADMIN_ACCENT,
  AdminButton,
  AdminSectionHeading,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui/primitives"

// ---- Layer model -------------------------------------------------
type Base = { id: string; x: number; y: number; rotation: number }
type ImageLayer = Base & { type: "image"; src: string; width: number; height: number }
type TextLayer = Base & { type: "text"; text: string; fontSize: number; fill: string; fontFamily: string; width: number; fontStyle: string }
type RectLayer = Base & { type: "rect"; width: number; height: number; fill: string }
type CircleLayer = Base & { type: "circle"; radius: number; fill: string }
type AnyLayer = ImageLayer | TextLayer | RectLayer | CircleLayer

const FONTS = ["Impact", "Arial", "Georgia", "Courier New", "Times New Roman", "Verdana"]

let uid = 0
const nextId = () => `l${++uid}`

// --- Garment templates (our own outlines — Printify doesn't expose theirs) ----
// print* are fractions of the garment box; the print stage is placed there.
type GarmentDef = { vbW: number; vbH: number; maxW: number; path: string; printX: number; printY: number; printW: number }
const GARMENTS: Record<string, GarmentDef> = {
  tshirt: {
    vbW: 100, vbH: 108, maxW: 520,
    path: "M35,9 C38,15 62,15 65,9 L84,17 L96,39 L85,50 L76,44 L76,103 L24,103 L24,44 L15,50 L4,39 L16,17 Z",
    printX: 0.37, printY: 0.30, printW: 0.27,
  },
  tank: {
    vbW: 100, vbH: 108, maxW: 500,
    path: "M31,27 L35,10 C37,6 43,6 45,12 C47,18 53,18 55,12 C57,6 63,6 65,10 L69,27 L72,103 L28,103 Z",
    printX: 0.38, printY: 0.30, printW: 0.24,
  },
  hoodie: {
    vbW: 100, vbH: 114, maxW: 520,
    path: "M34,14 C36,7 64,7 66,14 C74,12 80,16 84,20 L96,42 L85,54 L78,48 L78,107 L22,107 L22,48 L15,54 L4,42 L16,20 C20,16 26,12 34,14 Z",
    printX: 0.37, printY: 0.36, printW: 0.27,
  },
}
export function garmentTypeFor(title: string): string | null {
  const t = title.toLowerCase()
  if (/tank/.test(t)) return "tank"
  if (/hoodie|sweatshirt|crewneck|sweater/.test(t)) return "hoodie"
  if (/t-?shirt|tee|top|jersey/.test(t)) return "tshirt"
  return null
}

// Renders a Konva image node from a (same-origin) data URL — no CORS taint.
function URLImage({ layer, shapeRef, onSelect, onChange }: any) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const im = new window.Image()
    // Attach the handler BEFORE setting src — Safari can fire load
    // synchronously for data: URLs, which would otherwise be missed.
    im.onload = () => setImg(im)
    im.src = layer.src
  }, [layer.src])
  if (!img) return null
  return (
    <KImage
      ref={shapeRef}
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target
        const sx = node.scaleX(), sy = node.scaleY()
        node.scaleX(1); node.scaleY(1)
        onChange({
          x: node.x(), y: node.y(), rotation: node.rotation(),
          width: Math.max(10, node.width() * sx),
          height: Math.max(10, node.height() * sy),
        })
      }}
    />
  )
}

export default function DesignEditor({
  printArea,
  exportRef,
  onLayerCount,
  onChange,
  positionLabel,
  garment,
}: {
  printArea: { width: number; height: number }
  exportRef: React.MutableRefObject<null | (() => string)>
  onLayerCount?: (n: number) => void
  onChange?: () => void
  positionLabel?: string
  garment?: string | null
}) {
  const aspect = printArea.width / printArea.height // print area w/h

  // When a garment template is available, size the print stage as a portion of
  // the garment so the whole garment shows behind it (Printify-style).
  const g = garment ? (GARMENTS as Record<string, GarmentDef>)[garment] : null
  let displayW: number, displayH: number, gBox: null | { w: number; h: number; left: number; top: number } = null
  if (g) {
    displayW = Math.round(g.maxW * g.printW)
    displayH = Math.round(displayW / aspect)
    const cW = g.maxW
    const cH = Math.round(g.maxW * (g.vbH / g.vbW))
    gBox = { w: cW, h: cH, left: Math.round(g.printX * cW), top: Math.round(g.printY * cH) }
  } else {
    const MAX = 460
    displayW = aspect >= 1 ? MAX : Math.round(MAX * aspect)
    displayH = aspect >= 1 ? Math.round(MAX / aspect) : MAX
  }

  const [layers, setLayers] = useState<AnyLayer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stageRef = useRef<any>(null)
  const trRef = useRef<any>(null)
  const nodeRefs = useRef<Record<string, any>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const selected = layers.find((l) => l.id === selectedId) || null

  useEffect(() => { onLayerCount?.(layers.length) }, [layers.length, onLayerCount])
  // Notify parent on any design change (add/move/resize/edit) for live preview
  useEffect(() => { onChange?.() }, [layers, onChange])

  // Attach transformer to the selected node
  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const node = selectedId ? nodeRefs.current[selectedId] : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId, layers])

  const update = (id: string, patch: Partial<AnyLayer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? ({ ...l, ...patch } as AnyLayer) : l)))

  const addText = () =>
    setLayers((ls) => [
      ...ls,
      { id: nextId(), type: "text", text: "YOUR TEXT", x: displayW * 0.15, y: displayH * 0.4,
        fontSize: Math.round(displayH * 0.14), fill: "#111111", fontFamily: "Impact",
        fontStyle: "normal", width: displayW * 0.7, rotation: 0 },
    ])
  const addRect = () =>
    setLayers((ls) => [...ls, { id: nextId(), type: "rect", x: displayW * 0.3, y: displayH * 0.35, width: displayW * 0.4, height: displayH * 0.3, fill: "#3E715C", rotation: 0 }])
  const addCircle = () =>
    setLayers((ls) => [...ls, { id: nextId(), type: "circle", x: displayW * 0.5, y: displayH * 0.5, radius: Math.min(displayW, displayH) * 0.2, fill: "#f59e0b", rotation: 0 }])

  const addImageFromSrc = (src: string) => {
    const im = new window.Image()
    // Handler before src (Safari may fire load synchronously for data: URLs).
    im.onload = () => {
      const scale = Math.min((displayW * 0.7) / im.width, (displayH * 0.7) / im.height, 1)
      const w = im.width * scale, h = im.height * scale
      setLayers((ls) => [...ls, { id: nextId(), type: "image", src, x: (displayW - w) / 2, y: (displayH - h) / 2, width: w, height: h, rotation: 0 }])
    }
    im.src = src
  }

  const onFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => addImageFromSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  // ---- AI image generation (free, via Pollinations) ----
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const runAi = async () => {
    if (!aiPrompt.trim() || aiLoading) return
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await generateAiImage(aiPrompt)
      if (res.success && res.dataUrl) {
        addImageFromSrc(res.dataUrl)
        setAiOpen(false)
        setAiPrompt("")
      } else {
        setAiError(res.error || "Generation failed.")
      }
    } catch {
      setAiError("Generation failed. Try again.")
    } finally {
      setAiLoading(false)
    }
  }

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setLayers((ls) => ls.filter((l) => l.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const move = (dir: -1 | 1) => {
    if (!selectedId) return
    setLayers((ls) => {
      const i = ls.findIndex((l) => l.id === selectedId)
      const j = i + dir
      if (i < 0 || j < 0 || j >= ls.length) return ls
      const copy = [...ls]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); deleteSelected() }
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [selectedId, deleteSelected])

  // Expose a flatten-to-PNG function to the parent
  useEffect(() => {
    exportRef.current = () => {
      const tr = trRef.current
      tr?.nodes([])
      tr?.getLayer()?.batchDraw()
      const longest = Math.max(printArea.width, printArea.height)
      const cap = Math.min(longest, 1600) // keep export under the 4.5MB upload limit
      const pixelRatio = cap / Math.max(displayW, displayH)
      const url = stageRef.current.toDataURL({ pixelRatio, mimeType: "image/png" })
      // re-attach transformer
      const node = selectedId ? nodeRefs.current[selectedId] : null
      tr?.nodes(node ? [node] : [])
      tr?.getLayer()?.batchDraw()
      return url
    }
    return () => { exportRef.current = null }
  }, [exportRef, printArea.width, printArea.height, displayW, displayH, selectedId])

  const setRef = (id: string) => (n: any) => { if (n) nodeRefs.current[id] = n; else delete nodeRefs.current[id] }
  const commonHandlers = (id: string) => ({
    onClick: () => setSelectedId(id),
    onTap: () => setSelectedId(id),
    onDragEnd: (e: any) => update(id, { x: e.target.x(), y: e.target.y() }),
  })

  const stageEl = (
    <Stage
      ref={stageRef}
      width={displayW}
      height={displayH}
      onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null) }}
      onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null) }}
    >
      <Layer>
        {layers.map((l) => {
          if (l.type === "image")
            return <URLImage key={l.id} layer={l} shapeRef={setRef(l.id)} onSelect={() => setSelectedId(l.id)} onChange={(p: any) => update(l.id, p)} />
          if (l.type === "text")
            return (
              <KText key={l.id} ref={setRef(l.id)} text={l.text} x={l.x} y={l.y} fontSize={l.fontSize}
                fill={l.fill} fontFamily={l.fontFamily} fontStyle={l.fontStyle} width={l.width} align="center"
                rotation={l.rotation} draggable {...commonHandlers(l.id)}
                onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(); n.scaleX(1); n.scaleY(1); update(l.id, { x: n.x(), y: n.y(), rotation: n.rotation(), fontSize: Math.max(6, l.fontSize * sx), width: Math.max(20, n.width() * sx) }) }} />
            )
          if (l.type === "rect")
            return (
              <Rect key={l.id} ref={setRef(l.id)} x={l.x} y={l.y} width={l.width} height={l.height} fill={l.fill}
                rotation={l.rotation} draggable {...commonHandlers(l.id)}
                onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); update(l.id, { x: n.x(), y: n.y(), rotation: n.rotation(), width: Math.max(10, n.width() * sx), height: Math.max(10, n.height() * sy) }) }} />
            )
          return (
            <Circle key={l.id} ref={setRef(l.id)} x={l.x} y={l.y} radius={l.radius} fill={l.fill}
              rotation={l.rotation} draggable {...commonHandlers(l.id)}
              onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(); n.scaleX(1); n.scaleY(1); update(l.id, { x: n.x(), y: n.y(), radius: Math.max(5, l.radius * sx) }) }} />
          )
        })}
        <Transformer ref={trRef} rotateEnabled anchorSize={8} borderStroke={ADMIN_ACCENT} anchorStroke={ADMIN_ACCENT} />
      </Layer>
    </Stage>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* TOOLBAR */}
      <div className="flex lg:flex-col gap-2">
        <ToolBtn icon={<Upload size={18} />} label="Upload" onClick={() => fileRef.current?.click()} />
        <ToolBtn icon={<Sparkles size={18} />} label="AI" onClick={() => setAiOpen(true)} accent />
        <ToolBtn icon={<Type size={18} />} label="Text" onClick={addText} />
        <ToolBtn icon={<Square size={18} />} label="Rect" onClick={addRect} />
        <ToolBtn icon={<CircleIcon size={18} />} label="Circle" onClick={addCircle} />
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>

      {/* CANVAS */}
      <div className="flex-1 flex items-center justify-center">
        {g && gBox ? (
          /* Garment template: outline behind, print stage on the chest */
          <div className="relative" style={{ width: gBox.w, height: gBox.h }}>
            {positionLabel && (
              <span className="type-admin-label absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-card bg-ink px-2.5 py-1 text-white">
                {positionLabel}
              </span>
            )}
            <svg viewBox={`0 0 ${g.vbW} ${g.vbH}`} width={gBox.w} height={gBox.h}
              className="absolute inset-0" style={{ color: "#cdd2da" }}>
              <path d={g.path} fill="#fbfcfd" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
            </svg>
            <div className="absolute" style={{ left: gBox.left, top: gBox.top, width: displayW, height: displayH, outline: "2px dashed #9aa0ac", outlineOffset: "-1px" }}>
              {stageEl}
            </div>
          </div>
        ) : (
          /* Plain print-area box */
          <div className="relative" style={{ width: displayW, height: displayH }}>
            {positionLabel && (
              <span className="type-admin-label absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-card bg-ink px-2.5 py-1 text-white">
                {positionLabel}
              </span>
            )}
            <div className="rounded-card overflow-hidden bg-white"
              style={{ width: displayW, height: displayH, position: "relative", outline: "2px dashed #94a3b8", outlineOffset: "-2px" }}>
              {stageEl}
            </div>
          </div>
        )}
      </div>

      {/* PROPERTIES / LAYERS */}
      <div className="w-full lg:w-56 space-y-4">
        {selected ? (
          <div className="bg-[#FBFAF8] border border-[#E8E6E1] rounded-panel p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="type-admin-label text-neutral-500">{selected.type}</span>
              <div className="flex gap-1">
                <IconMini onClick={() => move(1)} title="Forward"><ArrowUp size={14} /></IconMini>
                <IconMini onClick={() => move(-1)} title="Backward"><ArrowDown size={14} /></IconMini>
                <IconMini onClick={deleteSelected} title="Delete" danger><Trash2 size={14} /></IconMini>
              </div>
            </div>

            {selected.type === "text" && (
              <div className="space-y-2">
                <AdminTextarea
                  aria-label="Layer text"
                  value={selected.text}
                  onChange={(e) => update(selected.id, { text: e.target.value })}
                  rows={2}
                  className="resize-none p-2"
                />
                <AdminSelect
                  aria-label="Font"
                  value={selected.fontFamily}
                  onChange={(e) => update(selected.id, { fontFamily: e.target.value })}
                  className="p-2"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </AdminSelect>
                <div className="flex items-center gap-2">
                  <button onClick={() => update(selected.id, { fontStyle: selected.fontStyle.includes("bold") ? "normal" : "bold" })}
                    className={`p-1.5 rounded-card border ${selected.fontStyle.includes("bold") ? "bg-ink text-white border-ink" : "border-[#E8E6E1] text-neutral-500"}`}>
                    <Bold size={14} />
                  </button>
                  <input type="color" value={selected.fill} onChange={(e) => update(selected.id, { fill: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-[#E8E6E1]" />
                  <input type="range" min={8} max={displayH} value={selected.fontSize}
                    onChange={(e) => update(selected.id, { fontSize: parseInt(e.target.value) })} className="flex-1 accent-accent-800" />
                </div>
              </div>
            )}

            {(selected.type === "rect" || selected.type === "circle") && (
              <div className="flex items-center gap-2">
                <span className="type-admin-label text-neutral-500">Colour</span>
                <input type="color" value={selected.fill} onChange={(e) => update(selected.id, { fill: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-[#E8E6E1]" />
              </div>
            )}
          </div>
        ) : (
          <div className="type-admin-meta rounded-panel border border-dashed border-[#E8E6E1] bg-[#FBFAF8] p-4 text-center text-neutral-400">
            Add an element, then click it to edit.
          </div>
        )}

        {/* Layer list */}
        {layers.length > 0 && (
          <div className="bg-white border border-[#E8E6E1] rounded-panel p-2 space-y-1">
            <span className="type-admin-label px-1 text-neutral-400">Layers</span>
            {[...layers].reverse().map((l) => (
              <button key={l.id} onClick={() => setSelectedId(l.id)}
                className={`type-admin-meta flex w-full items-center gap-2 rounded-card px-2 py-1.5 text-left font-semibold ${selectedId === l.id ? "bg-accent-50 text-accent-800" : "text-neutral-500 hover:bg-[#FBFAF8]"}`}>
                {l.type === "text" ? <Type size={12} /> : l.type === "image" ? <Upload size={12} /> : l.type === "rect" ? <Square size={12} /> : <CircleIcon size={12} />}
                <span className="truncate">{l.type === "text" ? (l as TextLayer).text : l.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI IMAGE MODAL */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !aiLoading && setAiOpen(false)}>
          <div className="bg-white rounded-panel w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <AdminSectionHeading className="flex items-center gap-2">
                <Sparkles aria-hidden size={15} className="text-accent-700" /> AI image
              </AdminSectionHeading>
              <button onClick={() => !aiLoading && setAiOpen(false)} className="text-neutral-400 hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <AdminTextarea
              aria-label="Describe the image to generate"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runAi() }}
              rows={3}
              autoFocus
              placeholder="Describe the image… e.g. “a retro sunset with palm trees, bold vintage poster style”"
            />
            {aiError && <p className="type-admin-body font-semibold text-brand-terracotta" role="alert">{aiError}</p>}
            <AdminButton
              variant="primary"
              onClick={runAi}
              disabled={aiLoading || !aiPrompt.trim()}
              className="h-11 w-full"
            >
              {aiLoading ? (
                <Loader2 aria-hidden size={15} className="animate-spin" />
              ) : (
                <Sparkles aria-hidden size={15} />
              )}
              {aiLoading ? "Generating…" : "Generate and add"}
            </AdminButton>
            <p className="type-admin-meta text-center text-neutral-400">
              Takes a few seconds. The image is added to your canvas — drag and resize it like any layer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ToolBtn({ icon, label, onClick, accent }: { icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-panel border transition-colors ${accent
        ? "bg-accent-50 border-accent-200 text-accent-700 hover:bg-accent-100"
        : "bg-white border-[#E8E6E1] text-neutral-500 hover:border-accent-600 hover:text-accent-700"}`}>
      {icon}
      <span className="type-admin-label">{label}</span>
    </button>
  )
}

function IconMini({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      className={`p-1.5 rounded-card border transition-colors ${danger ? "border-[#E7D3CB] text-brand-terracotta hover:bg-[#FBF3F0]" : "border-[#E8E6E1] text-neutral-500 hover:bg-neutral-100"}`}>
      {children}
    </button>
  )
}
