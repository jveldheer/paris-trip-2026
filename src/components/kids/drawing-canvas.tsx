"use client"

import { useEffect, useRef, useState } from "react"
import { Trash2, Save, Paintbrush } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface DrawingCanvasProps {
  tripId: string
  memberId: string
  onSaved?: () => void
}

const COLORS = [
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#000000", label: "Black" },
]

const BRUSH_SIZES = [
  { size: 6, label: "S" },
  { size: 14, label: "M" },
  { size: 28, label: "L" },
]

export function DrawingCanvas({ tripId, memberId, onSaved }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState(COLORS[4].color) // blue default
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.offsetWidth
    const height = Math.min(window.innerHeight * 0.45, 380)
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
    }
  }, [])

  function getEventPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    const me = e as React.MouseEvent
    return {
      x: (me.clientX - rect.left) * scaleX,
      y: (me.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getEventPos(e)
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas || !lastPos.current) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pos = getEventPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() {
    isDrawing.current = false
    lastPos.current = null
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  async function saveDrawing() {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/png")
    )
    if (!blob) { setSaving(false); return }

    const fileName = `${tripId}/${memberId}/${Date.now()}.png`
    const supabase = getSupabaseClient()

    const { error: uploadErr } = await supabase.storage
      .from("drawings")
      .upload(fileName, blob, { contentType: "image/png" })

    if (!uploadErr) {
      await supabase.from("kid_drawings").insert({
        trip_id: tripId,
        member_id: memberId,
        storage_path: `drawings/${fileName}`,
        caption: null,
        photo_id: null,
      })

      clearCanvas()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      onSaved?.()
    }

    setSaving(false)
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-white dark:bg-card overflow-hidden shadow-md">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-800 flex items-center gap-2">
        <Paintbrush className="h-5 w-5 text-purple-600" />
        <span className="text-sm font-bold text-purple-800 dark:text-purple-300">
          Draw Something Amazing!
        </span>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair block bg-white"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 bg-purple-50/50 dark:bg-purple-950/10">
        {/* Color picker */}
        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map(({ color: c, label }) => (
            <button
              key={c}
              aria-label={label}
              onClick={() => setColor(c)}
              className={cn(
                "w-10 h-10 rounded-full border-4 transition-all active:scale-95",
                color === c
                  ? "border-gray-800 scale-110 shadow-md"
                  : "border-white shadow-sm"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground w-10">Size:</span>
          {BRUSH_SIZES.map(({ size, label }) => (
            <button
              key={size}
              aria-label={`Brush size ${label}`}
              onClick={() => setBrushSize(size)}
              className={cn(
                "flex items-center justify-center rounded-full bg-gray-800 text-white text-xs font-bold transition-all active:scale-95",
                brushSize === size && "ring-4 ring-blue-400 ring-offset-2"
              )}
              style={{ width: size + 18, height: size + 18 }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={clearCanvas}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Clear
          </Button>
          <Button
            size="lg"
            onClick={saveDrawing}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </Button>
        </div>

        {saved && (
          <p className="text-center text-sm text-green-600 font-medium">
            Your drawing has been saved to the gallery!
          </p>
        )}
      </div>
    </div>
  )
}
