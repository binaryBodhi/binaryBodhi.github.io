import { usePixelCanvas } from "./canvas/usePixelCanvas"
import type { PixelCanvasProps } from "./canvas/types"

export function PixelCanvas({ className = "", ...options }: PixelCanvasProps) {
  const canvasRef = usePixelCanvas(options)
  return <canvas ref={canvasRef} className={`modern-pixel-canvas${className ? ` ${className}` : ""}`} aria-hidden="true" />
}
