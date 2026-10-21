import { useEffect, useRef, useState } from "react"

const MORPH_DURATION_MS = 720

/** One clock for the card content and pixel letters, preserving interrupted blends. */
export function useExperienceMorph(activeIndex: number, count: number, immediate: boolean) {
  const [weights, setWeights] = useState(() =>
    Array.from({ length: count }, (_, index) => Number(index === activeIndex)),
  )
  const weightsRef = useRef(weights)

  useEffect(() => {
    const target = Array.from({ length: count }, (_, index) => Number(index === activeIndex))
    const from = target.map((_, index) => weightsRef.current[index] ?? 0)
    if (from.every((value, index) => value === target[index])) return
    const start = performance.now()
    let frame = 0

    const advance = (time: number) => {
      const progress = immediate ? 1 : Math.min(1, (time - start) / MORPH_DURATION_MS)
      const eased = progress * progress * (3 - 2 * progress)
      const next = target.map((value, index) => from[index] + (value - from[index]) * eased)
      weightsRef.current = next
      setWeights(next)
      if (progress < 1) frame = requestAnimationFrame(advance)
    }

    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [activeIndex, count, immediate])

  return immediate
    ? Array.from({ length: count }, (_, index) => Number(index === activeIndex))
    : weights
}
