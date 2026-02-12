import { useState, useRef, useCallback } from "react"
import type maplibregl from "maplibre-gl"
import { MapView, type MapViewRef } from "@/components/MapView"
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
  const mapViewRef = useRef<MapViewRef>(null)

  const handleMapReady = useCallback((map: maplibregl.Map) => {
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
    (lng: number, lat: number) => {
      const map = mapViewRef.current?.getMap()
      if (map) {
        map.flyTo({
          center: [lng, lat],
          zoom: 13,
          duration: 1500,
        })
      }
    },
    []
  )

  const handleExport = useCallback(async () => {
    const map = mapViewRef.current?.getMap()
    const bounds = mapViewRef.current?.getFrameBounds()
    
    if (!map || !bounds) {
      alert("Map not ready")
      return
    }
    
    setExporting(true)
    try {
      const px = getPaperPixels(paper, orientation, dpi)
      console.log(`Exporting ${paper.label} ${orientation} at ${dpi}dpi: ${px.width}x${px.height}px`)
      console.log(`Bounds: SW(${bounds.getSouth().toFixed(4)}, ${bounds.getWest().toFixed(4)}) NE(${bounds.getNorth().toFixed(4)}, ${bounds.getEast().toFixed(4)})`)

      await exportMapToPng({
        bounds,
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
          ref={mapViewRef}
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
