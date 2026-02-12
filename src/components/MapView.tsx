import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { PaperSize, Orientation } from "@/lib/paper-sizes"
import { getPaperAspectRatio } from "@/lib/paper-sizes"

export interface MapViewRef {
  getMap: () => maplibregl.Map | null
  getFrameBounds: () => maplibregl.LngLatBounds | null
}

interface MapViewProps {
  paper: PaperSize
  orientation: Orientation
  mapStyle: string
  onMapReady: (map: maplibregl.Map) => void
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(
  ({ paper, orientation, mapStyle, onMapReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const frameRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null)

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current,
      getFrameBounds: () => {
        const map = mapRef.current
        const frame = frameRectRef.current
        if (!map || !frame) return null

        // Convert frame corners (screen pixels) to geographic coordinates
        const topLeft = map.unproject([frame.left, frame.top])
        const bottomRight = map.unproject([frame.left + frame.width, frame.top + frame.height])

        return new maplibregl.LngLatBounds(
          [topLeft.lng, bottomRight.lat], // SW
          [bottomRight.lng, topLeft.lat]  // NE
        )
      },
    }))

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

      const left = (containerW - frameW) / 2
      const top = (containerH - frameH) / 2

      // Store frame rect for bounds calculation
      frameRectRef.current = { left, top, width: frameW, height: frameH }

      const overlay = overlayRef.current
      overlay.style.width = `${frameW}px`
      overlay.style.height = `${frameH}px`
      overlay.style.left = `${left}px`
      overlay.style.top = `${top}px`
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
)

MapView.displayName = "MapView"
