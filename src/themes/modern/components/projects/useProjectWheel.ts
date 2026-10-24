import { useEffect, useRef, useState } from "react"
import { MARK_MORPH_DURATION_MS } from "../../../../shared/animation"
import { smoothstep } from "../../../../shared/math"

export function useProjectWheel(target: number, reducedMotion: boolean) {
  const [position, setPosition] = useState(target)
  const positionRef = useRef(target)

  useEffect(() => {
    const from = positionRef.current
    const start = performance.now()
    let frame = 0
    const advance = (time: number) => {
      const progress = reducedMotion ? 1 : Math.min(1, (time - start) / MARK_MORPH_DURATION_MS)
      const next = from + (target - from) * smoothstep(progress)
      positionRef.current = next
      setPosition(next)
      if (progress < 1) frame = requestAnimationFrame(advance)
    }
    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [target, reducedMotion])

  return reducedMotion ? target : position
}
