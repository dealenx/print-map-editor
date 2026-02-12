import maplibregl from "maplibre-gl"
import type { PaperSize, Orientation } from "./paper-sizes"
import { getPaperPixels } from "./paper-sizes"

export interface ExportOptions {
  bounds: maplibregl.LngLatBounds
  bearing: number
  pitch: number
  style: string
  paper: PaperSize
  orientation: Orientation
  dpi: number
}

export async function exportMapToPng(options: ExportOptions): Promise<void> {
  const { width, height } = getPaperPixels(
    options.paper,
    options.orientation,
    options.dpi
  )

  // Create hidden container
  const container = document.createElement("div")
  container.style.width = `${width}px`
  container.style.height = `${height}px`
  container.style.position = "absolute"
  container.style.left = "-99999px"
  container.style.top = "-99999px"
  document.body.appendChild(container)

  return new Promise((resolve, reject) => {
    try {
      const renderMap = new maplibregl.Map({
        container,
        style: options.style,
        bounds: options.bounds,
        fitBoundsOptions: { padding: 0 },
        bearing: options.bearing,
        pitch: options.pitch,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        pixelRatio: 1,
        canvasContextAttributes: { preserveDrawingBuffer: true },
      } as maplibregl.MapOptions)

      renderMap.once("idle", () => {
        try {
          const canvas = renderMap.getCanvas()
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob from canvas"))
              return
            }
            // Download
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `map-${options.paper.label}-${options.orientation}-${options.dpi}dpi.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            // Cleanup
            renderMap.remove()
            document.body.removeChild(container)
            resolve()
          }, "image/png")
        } catch (err) {
          renderMap.remove()
          document.body.removeChild(container)
          reject(err)
        }
      })

      renderMap.once("error", (e) => {
        renderMap.remove()
        document.body.removeChild(container)
        reject(e.error)
      })
    } catch (err) {
      document.body.removeChild(container)
      reject(err)
    }
  })
}
