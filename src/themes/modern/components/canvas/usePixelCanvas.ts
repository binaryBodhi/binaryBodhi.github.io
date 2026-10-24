import { useEffect, useLayoutEffect, useRef } from "react"
import { useReducedMotion } from "../../../../shared/hooks/useReducedMotion"
import { MARK_MORPH_DURATION_MS } from "../../../../shared/animation"
import { DEFAULT_LIFE_SETTINGS } from "../games/gameOfLife"
import { drawers } from "./drawings"
import { needsAnimationFrame } from "./animation"
import { readCanvasPalette } from "./palette"
import type { DrawOptions, PixelCanvasProps } from "./types"

export function usePixelCanvas({
  lifeSettings,
  mark = "S",
  markWeights,
  onComplete,
  progress = 1,
  takeoverColor = "ink",
  variant,
}: Omit<PixelCanvasProps, "className">) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previousMarkRef = useRef(mark.toUpperCase().slice(0, 1))
  const settingsRef = useRef({ progress, markWeights, lifeSettings, takeoverColor })
  const redrawRef = useRef<(() => void) | null>(null)
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    settingsRef.current = { progress, markWeights, lifeSettings, takeoverColor }
    redrawRef.current?.()
  }, [markWeights, lifeSettings, progress, takeoverColor])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    let frame = 0
    let isVisible = true
    let width = 0
    let height = 0
    let disposed = false
    let lastTakeoverProgress = -1
    const nextMark = mark.toUpperCase().slice(0, 1) || "S"
    const drawOptions: DrawOptions = {
      palette: readCanvasPalette(canvas),
      fromMark: previousMarkRef.current,
      mark: nextMark,
      markWeights: () => settingsRef.current.markWeights,
      progress: () => settingsRef.current.progress,
      takeoverColor: () => settingsRef.current.takeoverColor,
      transitionStart: window.performance.now(),
      lifeSettings: () => settingsRef.current.lifeSettings ?? { ...DEFAULT_LIFE_SETTINGS, paused: reducedMotion },
      life: null,
    }
    previousMarkRef.current = nextMark

    const render = (time: number) => {
      if (disposed || !isVisible) return
      const renderTime = reducedMotion && variant !== "hero" ? drawOptions.transitionStart + MARK_MORPH_DURATION_MS : time
      const currentProgress = drawOptions.progress()
      if (variant !== "takeover" || currentProgress !== lastTakeoverProgress) {
        drawers[variant](context, width, height, renderTime, drawOptions)
        if (variant === "takeover" && currentProgress === 1) onComplete?.()
        lastTakeoverProgress = currentProgress
      }
      const animate = needsAnimationFrame(variant, drawOptions, time, reducedMotion)
      if (animate) frame = window.requestAnimationFrame(render)
    }

    const resize = () => {
      window.cancelAnimationFrame(frame)
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      drawOptions.palette = readCanvasPalette(canvas)
      lastTakeoverProgress = -1
      render(window.performance.now())
    }

    redrawRef.current = () => {
      window.cancelAnimationFrame(frame)
      render(window.performance.now())
    }

    const start = () => {
      window.cancelAnimationFrame(frame)
      if (isVisible) frame = window.requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) start()
        else window.cancelAnimationFrame(frame)
      },
      { root: canvas.closest(".modern-main"), threshold: 0.01 },
    )

    resizeObserver.observe(canvas)
    visibilityObserver.observe(canvas)
    resize()

    return () => {
      disposed = true
      redrawRef.current = null
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [mark, onComplete, reducedMotion, variant])

  return canvasRef
}
