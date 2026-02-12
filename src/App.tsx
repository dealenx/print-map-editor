import { useState, useRef, useCallback } from "react"
import type maplibregl from "maplibre-gl"
import { MapView } from "@/components/MapView"
import { Sidebar } from "@/components/Sidebar"
import { PAPER_SIZES } from "@/lib/paper-sizes"
import type { PaperSize, Orientation } from "@/lib/paper-sizes"
import { exportMapToPng } from "@/lib/export-png"
import { getPaperPixels } from "@/lib/paper-sizes"

const DEFAULT_STYLE = "https://tiles.openfreemap.org/styles/positron"

function App() {
  const [paper, setPaper] = useState<PaperSize>(PAPER_SIZES[1]) // A4
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [dpi, setDpi] = useState(300)
  const [mapStyle, setMapStyle] = useState(DEFAULT_STYLE)
  const [exporting, setExporting] = useState(false)
  const [zoomInfo, setZoomInfo] = useState("")
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)

  const handleMapReady = useCallback((map: maplibregl.Map) => {
    mapInstanceRef.current = map

    const updateZoom = () => {
      const z = map.getZoom().toFixed(2)
      const center = map.getCenter()
      setZoomInfo(`Zoom: ${z} | ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`)
    }
    map.on("moveend", updateZoom)
    map.on("zoomend", updateZoom)
    updateZoom()
  }, [])

  const handleLocationSelect = useCallback(
    (lng: number, lat: number, _name: string) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({
          center: [lng, lat],
          zoom: 13,
          duration: 1500,
        })
      }
    },
    []
  )

  const handleExport = useCallback(async () => {
    if (!mapInstanceRef.current) return
    setExporting(true)
    try {
      const map = mapInstanceRef.current
      const px = getPaperPixels(paper, orientation, dpi)
      console.log(`Exporting ${paper.label} ${orientation} at ${dpi}dpi: ${px.width}x${px.height}px`)

      await exportMapToPng({
        center: map.getCenter(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
        style: mapStyle,
        paper,
        orientation,
        dpi,
      })
    } catch (err) {
      console.error("Export failed:", err)
      alert("Export failed. See console for details.")
    } finally {
      setExporting(false)
    }
  }, [paper, orientation, dpi, mapStyle])

  return (
    <div className="flex h-full w-full">
      {/* Map area */}
      <div className="flex-1 relative">
        <MapView
          paper={paper}
          orientation={orientation}
          mapStyle={mapStyle}
          onMapReady={handleMapReady}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        paper={paper}
        orientation={orientation}
        dpi={dpi}
        mapStyle={mapStyle}
        exporting={exporting}
        zoomInfo={zoomInfo}
        onPaperChange={setPaper}
        onOrientationChange={setOrientation}
        onDpiChange={setDpi}
        onStyleChange={setMapStyle}
        onExport={handleExport}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  )
}

export default App
