import { useLayoutEffect, useRef } from "react"

export function usePixelMorph<T extends HTMLElement>(contentKey: string, weight: number, reducedMotion: boolean) {
  const elementRef = useRef<T>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef<{ x: number; y: number; alpha: number }[]>([])
  const drawRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const element = elementRef.current
    if (!canvas || !element || reducedMotion) return

    const rasterize = () => {
      const bounds = element.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const style = getComputedStyle(element)
      const source = document.createElement("canvas")
      source.width = Math.ceil(bounds.width)
      source.height = Math.ceil(bounds.height)
      const context = source.getContext("2d", { willReadFrequently: true })
      if (!context) return
      context.fillStyle = style.color
      context.textBaseline = "top"
      for (const label of element.querySelectorAll<HTMLElement>("[data-pixel-text]")) {
        const labelStyle = getComputedStyle(label)
        context.font = `${labelStyle.fontWeight} ${labelStyle.fontSize} ${labelStyle.fontFamily}`
        const node = label.firstChild
        if (!node || node.nodeType !== Node.TEXT_NODE) continue
        const text = node.textContent ?? ""
        const range = document.createRange()
        // Character positions preserve the tag font's tracking and wrapping.
        for (let index = 0; index < text.length; index++) {
          if (/\s/.test(text[index])) continue
          range.setStart(node, index)
          range.setEnd(node, index + 1)
          const rect = range.getBoundingClientRect()
          const letter = labelStyle.textTransform === "uppercase" ? text[index].toUpperCase() : text[index]
          context.fillText(letter, rect.left - bounds.left, rect.top - bounds.top)
        }
      }
      for (const tag of element.querySelectorAll("li")) {
        const rect = tag.getBoundingClientRect()
        const thickness = parseFloat(getComputedStyle(tag).borderTopWidth)
        if (!thickness) continue
        const x = rect.left - bounds.left
        const y = rect.top - bounds.top
        context.fillRect(x, y, rect.width, thickness)
        context.fillRect(x, y + rect.height - thickness, rect.width, thickness)
        context.fillRect(x, y, thickness, rect.height)
        context.fillRect(x + rect.width - thickness, y, thickness, rect.height)
      }
      const { data } = context.getImageData(0, 0, source.width, source.height)
      const pixels: typeof pixelsRef.current = []
      const step = 3
      for (let y = 0; y < source.height; y += step) {
        for (let x = 0; x < source.width; x += step) {
          let alpha = 0
          for (let dy = 0; dy < step && y + dy < source.height; dy++) {
            for (let dx = 0; dx < step && x + dx < source.width; dx++) {
              alpha += data[((y + dy) * source.width + x + dx) * 4 + 3] / 255
            }
          }
          if (alpha > 0) pixels.push({ x, y, alpha: Math.min(1, alpha / 3) })
        }
      }
      pixelsRef.current = pixels
      canvas.width = source.width + 24
      canvas.height = source.height + 24
      canvas.style.width = `${source.width + 24}px`
      canvas.style.height = `${source.height + 24}px`
      canvas.style.color = style.color
      drawRef.current()
    }
    rasterize()
    const observer = new ResizeObserver(rasterize)
    observer.observe(element)
    let cancelled = false
    document.fonts.ready.then(() => { if (!cancelled) rasterize() })
    return () => { cancelled = true; observer.disconnect() }
  }, [contentKey, reducedMotion])

  useLayoutEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (!canvas || !context) return
      context.clearRect(0, 0, canvas.width, canvas.height)
      if (reducedMotion || weight <= 0 || weight >= 1) return
      const scatter = Math.sin(weight * Math.PI)
      context.fillStyle = canvas.style.color
      for (const pixel of pixelsRef.current) {
        const phase = pixel.x * 1.7 + pixel.y * 2.3
        const size = 2.7 * weight
        context.globalAlpha = pixel.alpha
        context.fillRect(
          pixel.x + 12 + Math.sin(phase) * 10 * scatter + (3 - size) / 2,
          pixel.y + 12 + Math.cos(phase) * 8 * scatter + (3 - size) / 2,
          size, size,
        )
      }
    }
    drawRef.current = draw
    draw()
  }, [weight, reducedMotion])

  const opacity = reducedMotion ? 1 : Math.max(0, (weight - 0.65) / 0.35)
  return { elementRef, canvasRef, opacity }
}
