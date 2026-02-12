import { useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { PaperSize, Orientation } from "@/lib/paper-sizes"
import { getPaperAspectRatio } from "@/lib/paper-sizes"

interface MapViewProps {
  paper: PaperSize
  orientation: Orientation
  mapStyle: string
  onMapReady: (map: maplibregl.Map) => void
}

export function MapView({ paper, orientation, mapStyle, onMapReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [37.6173, 55.7558], // Moscow
      zoom: 11,
      attributionControl: false,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    } as maplibregl.MapOptions)

    map.addControl(new maplibregl.AttributionControl(), "bottom-right")
    map.addControl(new maplibregl.NavigationControl(), "bottom-right")
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left")

    mapRef.current = map

    map.once("load", () => {
      onMapReady(map)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update style
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle)
    }
  }, [mapStyle])

  // Update overlay frame to match paper aspect ratio
  const updateOverlay = useCallback(() => {
    if (!overlayRef.current || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerW = containerRect.width
    const containerH = containerRect.height
    const aspect = getPaperAspectRatio(paper, orientation)

    // Fit paper frame within container with some padding
    const padding = 40
    const availW = containerW - padding * 2
    const availH = containerH - padding * 2

    let frameW: number, frameH: number
    if (availW / availH > aspect) {
      frameH = availH
      frameW = frameH * aspect
    } else {
      frameW = availW
      frameH = frameW / aspect
    }

    const overlay = overlayRef.current
    overlay.style.width = `${frameW}px`
    overlay.style.height = `${frameH}px`
    overlay.style.left = `${(containerW - frameW) / 2}px`
    overlay.style.top = `${(containerH - frameH) / 2}px`
  }, [paper, orientation])

  useEffect(() => {
    updateOverlay()
    window.addEventListener("resize", updateOverlay)
    return () => window.removeEventListener("resize", updateOverlay)
  }, [updateOverlay])

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Paper frame overlay */}
      <div
        ref={overlayRef}
        className="absolute pointer-events-none z-10"
        style={{
          border: "2px dashed #e11d48",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.15)",
        }}
      >
        {/* Corner labels */}
        <div className="absolute -top-6 left-0 text-xs font-mono text-rose-600 bg-white/80 px-1 rounded">
          {paper.label} {orientation === "landscape" ? "(landscape)" : "(portrait)"}
        </div>
      </div>
    </div>
  )
}
