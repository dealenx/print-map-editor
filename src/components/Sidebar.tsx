import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { SearchLocation } from "@/components/SearchLocation"
import { PAPER_SIZES, DPI_OPTIONS } from "@/lib/paper-sizes"
import type { PaperSize, Orientation } from "@/lib/paper-sizes"
import { Download, Loader2, RectangleVertical, RectangleHorizontal } from "lucide-react"

const MAP_STYLES = [
  { value: "https://tiles.openfreemap.org/styles/positron", label: "Positron (Light)" },
  { value: "https://tiles.openfreemap.org/styles/bright", label: "Bright" },
  { value: "https://tiles.openfreemap.org/styles/liberty", label: "Liberty" },
]

interface SidebarProps {
  paper: PaperSize
  orientation: Orientation
  dpi: number
  mapStyle: string
  exporting: boolean
  zoomInfo: string
  onPaperChange: (paper: PaperSize) => void
  onOrientationChange: (o: Orientation) => void
  onDpiChange: (dpi: number) => void
  onStyleChange: (style: string) => void
  onExport: () => void
  onLocationSelect: (lng: number, lat: number, name: string) => void
}

export function Sidebar({
  paper,
  orientation,
  dpi,
  mapStyle,
  exporting,
  zoomInfo,
  onPaperChange,
  onOrientationChange,
  onDpiChange,
  onStyleChange,
  onExport,
  onLocationSelect,
}: SidebarProps) {
  return (
    <div className="w-80 min-w-80 h-full bg-white border-l border-border flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">Maps SVG</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Print Map Editor</p>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* Search */}
        <div className="space-y-2">
          <Label>Location</Label>
          <SearchLocation onSelect={onLocationSelect} />
        </div>

        {/* Map Style */}
        <div className="space-y-2">
          <Label>Map Style</Label>
          <Select
            value={mapStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            options={MAP_STYLES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </div>

        {/* Paper Size */}
        <div className="space-y-2">
          <Label>Paper Size</Label>
          <Select
            value={paper.id}
            onChange={(e) => {
              const found = PAPER_SIZES.find((p) => p.id === e.target.value)
              if (found) onPaperChange(found)
            }}
            options={PAPER_SIZES.map((p) => ({
              value: p.id,
              label: `${p.label} (${p.widthMm}x${p.heightMm} mm)`,
            }))}
          />
        </div>

        {/* Orientation */}
        <div className="space-y-2">
          <Label>Orientation</Label>
          <div className="flex gap-2">
            <Button
              variant={orientation === "portrait" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onOrientationChange("portrait")}
            >
              <RectangleVertical className="h-4 w-4 mr-1" />
              Portrait
            </Button>
            <Button
              variant={orientation === "landscape" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onOrientationChange("landscape")}
            >
              <RectangleHorizontal className="h-4 w-4 mr-1" />
              Landscape
            </Button>
          </div>
        </div>

        {/* DPI */}
        <div className="space-y-2">
          <Label>Resolution</Label>
          <Select
            value={String(dpi)}
            onChange={(e) => onDpiChange(Number(e.target.value))}
            options={DPI_OPTIONS.map((d) => ({ value: d.id, label: d.label }))}
          />
        </div>

        {/* Zoom info */}
        {zoomInfo && (
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-md">
            {zoomInfo}
          </div>
        )}
      </div>

      {/* Export button - pinned to bottom */}
      <div className="mt-auto p-4 border-t border-border">
        <Button
          className="w-full"
          size="lg"
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PNG
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {paper.label} {orientation} at {dpi} DPI
        </p>
      </div>
    </div>
  )
}
