export interface PaperSize {
  id: string
  label: string
  widthMm: number
  heightMm: number
}

export const PAPER_SIZES: PaperSize[] = [
  { id: "a3", label: "A3", widthMm: 297, heightMm: 420 },
  { id: "a4", label: "A4", widthMm: 210, heightMm: 297 },
  { id: "a5", label: "A5", widthMm: 148, heightMm: 210 },
  { id: "a2", label: "A2", widthMm: 420, heightMm: 594 },
  { id: "letter", label: "Letter", widthMm: 216, heightMm: 279 },
  { id: "legal", label: "Legal", widthMm: 216, heightMm: 356 },
]

export type Orientation = "portrait" | "landscape"

export interface DpiOption {
  id: string
  label: string
  value: number
}

export const DPI_OPTIONS: DpiOption[] = [
  { id: "150", label: "150 DPI (Web)", value: 150 },
  { id: "300", label: "300 DPI (Print)", value: 300 },
]

export function getPaperPixels(
  paper: PaperSize,
  orientation: Orientation,
  dpi: number
): { width: number; height: number } {
  const mmToInch = 25.4
  let w = paper.widthMm
  let h = paper.heightMm
  if (orientation === "landscape") {
    ;[w, h] = [h, w]
  }
  return {
    width: Math.round((w / mmToInch) * dpi),
    height: Math.round((h / mmToInch) * dpi),
  }
}

export function getPaperAspectRatio(
  paper: PaperSize,
  orientation: Orientation
): number {
  if (orientation === "landscape") {
    return paper.heightMm / paper.widthMm
  }
  return paper.widthMm / paper.heightMm
}
