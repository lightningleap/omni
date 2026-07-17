"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Stage, Layer, Rect, Circle, Text as KText, Image as KImage, Transformer } from "react-konva"
import {
  Upload, Type, Square, Circle as CircleIcon, Trash2, ArrowUp, ArrowDown, Bold,
  Sparkles, Loader2, X,
} from "lucide-react"
import { generateAiImage } from "@/app/actions/admin/products"

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
    setLayers((ls) => [...ls, { id: nextId(), type: "rect", x: displayW * 0.3, y: displayH * 0.35, width: displayW * 0.4, height: displayH * 0.3, fill: "#4f46e5", rotation: 0 }])
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
        <Transformer ref={trRef} rotateEnabled anchorSize={8} borderStroke="#4f46e5" anchorStroke="#4f46e5" />
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
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
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
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                {positionLabel}
              </span>
            )}
            <div className="rounded-lg overflow-hidden bg-white"
              style={{ width: displayW, height: displayH, position: "relative", outline: "2px dashed #94a3b8", outlineOffset: "-2px" }}>
              {stageEl}
            </div>
          </div>
        )}
      </div>

      {/* PROPERTIES / LAYERS */}
      <div className="w-full lg:w-56 space-y-4">
        {selected ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                {selected.type}
              </span>
              <div className="flex gap-1">
                <IconMini onClick={() => move(1)} title="Forward"><ArrowUp size={14} /></IconMini>
                <IconMini onClick={() => move(-1)} title="Backward"><ArrowDown size={14} /></IconMini>
                <IconMini onClick={deleteSelected} title="Delete" danger><Trash2 size={14} /></IconMini>
              </div>
            </div>

            {selected.type === "text" && (
              <div className="space-y-2">
                <textarea value={selected.text} onChange={(e) => update(selected.id, { text: e.target.value })} rows={2}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 resize-none focus:outline-none focus:border-indigo-400" />
                <select value={selected.fontFamily} onChange={(e) => update(selected.id, { fontFamily: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white">
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={() => update(selected.id, { fontStyle: selected.fontStyle.includes("bold") ? "normal" : "bold" })}
                    className={`p-1.5 rounded-lg border ${selected.fontStyle.includes("bold") ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600"}`}>
                    <Bold size={14} />
                  </button>
                  <input type="color" value={selected.fill} onChange={(e) => update(selected.id, { fill: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200" />
                  <input type="range" min={8} max={displayH} value={selected.fontSize}
                    onChange={(e) => update(selected.id, { fontSize: parseInt(e.target.value) })} className="flex-1 accent-indigo-600" />
                </div>
              </div>
            )}

            {(selected.type === "rect" || selected.type === "circle") && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Color</span>
                <input type="color" value={selected.fill} onChange={(e) => update(selected.id, { fill: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-200" />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-[11px] text-slate-400 font-medium">
            Add an element, then click it to edit.
          </div>
        )}

        {/* Layer list */}
        {layers.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-2 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Layers</span>
            {[...layers].reverse().map((l) => (
              <button key={l.id} onClick={() => setSelectedId(l.id)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${selectedId === l.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                {l.type === "text" ? <Type size={12} /> : l.type === "image" ? <Upload size={12} /> : l.type === "rect" ? <Square size={12} /> : <CircleIcon size={12} />}
                <span className="truncate">{l.type === "text" ? (l as TextLayer).text : l.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI IMAGE MODAL */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !aiLoading && setAiOpen(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" /> AI Image
              </span>
              <button onClick={() => !aiLoading && setAiOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runAi() }}
              rows={3}
              autoFocus
              placeholder="Describe the image… e.g. 'a retro sunset with palm trees, bold vintage poster style'"
              className="w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none"
            />
            {aiError && <p className="text-xs font-bold text-rose-500">{aiError}</p>}
            <button
              onClick={runAi}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {aiLoading ? "Generating…" : "Generate & Add"}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Free AI — takes a few seconds. The image is added to your canvas; drag/resize it like any layer.
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
      className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl border transition-colors ${accent
        ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600"}`}>
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  )
}

function IconMini({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      className={`p-1.5 rounded-lg border transition-colors ${danger ? "border-rose-200 text-rose-500 hover:bg-rose-50" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
      {children}
    </button>
  )
}
