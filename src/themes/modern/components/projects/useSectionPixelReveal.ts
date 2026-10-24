import { useEffect, useRef, useState } from "react"

const REVEAL_DURATION_MS = 1000

/** Reverse from the currently drawn frame when the section leaves the reading area. */
export function useSectionPixelReveal(reducedMotion: boolean) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [backgroundProgress, setBackgroundProgress] = useState(0)

  useEffect(() => {
    const body = bodyRef.current
    const root = body?.closest<HTMLElement>(".modern-main")
    if (!body || !root) return
    let frame = 0
    let updateFrame = 0
    let target = 0
    let current = 0

    const play = (nextTarget: number) => {
      if (nextTarget === target) return
      target = nextTarget
      cancelAnimationFrame(frame)
      if (reducedMotion) {
        current = target
        setBackgroundProgress(current)
        return
      }
      const from = current
      const started = performance.now()
      const duration = Math.max(1, REVEAL_DURATION_MS * Math.abs(target - from))
      const advance = (now: number) => {
        const progress = Math.min(1, (now - started) / duration)
        current = from + (nextTarget - from) * progress
        // Match Experience's delayed accumulation of scattered 3px cells.
        setBackgroundProgress(Math.max(0, (current - 0.22) / 0.78))
        frame = progress < 1 ? requestAnimationFrame(advance) : 0
      }
      frame = requestAnimationFrame(advance)
    }

    const update = () => {
      updateFrame = 0
      const viewport = root.getBoundingClientRect()
      const bounds = body.getBoundingClientRect()
      const readingLine = viewport.top + root.clientHeight * 0.3
      play(bounds.top <= readingLine && bounds.bottom > readingLine ? 1 : 0)
    }
    const schedule = () => {
      if (!updateFrame) updateFrame = requestAnimationFrame(update)
    }
    update()
    root.addEventListener("scroll", schedule, { passive: true })
    const observer = new ResizeObserver(schedule)
    observer.observe(body)
    observer.observe(root)
    return () => {
      root.removeEventListener("scroll", schedule)
      observer.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(updateFrame)
    }
  }, [reducedMotion])

  return { bodyRef, backgroundProgress }
}
