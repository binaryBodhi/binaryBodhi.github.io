import { useCallback, useEffect, useRef } from "react"
import type { RefObject } from "react"
import { useReducedMotion } from "./useReducedMotion"

const SCROLL_DURATION_MS = 1200
const easeOut = (progress: number) => Math.min(1, 1.001 - 2 ** (-10 * progress))
type ScrollPause = (from: number, to: number) => number | null

export function attachInertialScroll(scrollRoot: HTMLElement, getPausePosition?: ScrollPause) {
  const wheelRoot = scrollRoot.parentElement ?? scrollRoot
  let frame = 0
  let target = scrollRoot.scrollTop
  let lastPosition = target
  let startPosition = target
  let elapsedTime = 0
  let previousFrameTime = 0
  let direction = 0

  const stop = () => {
    window.cancelAnimationFrame(frame)
    frame = 0
    target = scrollRoot.scrollTop
    lastPosition = target
    direction = 0
  }

  const maximumScroll = () => Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight)
  const animate = (time: number) => {
    target = Math.max(0, Math.min(target, maximumScroll()))
    // Retarget from the current position without starving frames when wheel
    // events arrive immediately before each animation tick.
    elapsedTime += Math.max(0, Math.min(64, time - previousFrameTime))
    previousFrameTime = time
    const progress = Math.min(1, elapsedTime / SCROLL_DURATION_MS)
    let nextPosition = progress === 1
      ? target
      : startPosition + (target - startPosition) * easeOut(progress)
    const pausePosition = getPausePosition?.(scrollRoot.scrollTop, nextPosition) ?? null
    if (pausePosition !== null) nextPosition = pausePosition

    scrollRoot.scrollTo({ top: nextPosition, behavior: "instant" })
    lastPosition = scrollRoot.scrollTop
    if (pausePosition !== null) {
      stop()
      return
    }
    frame = progress < 1 ? window.requestAnimationFrame(animate) : 0
  }

  const handleWheel = (event: WheelEvent) => {
    // Experience's listener runs on the content root before this parent listener.
    if (event.defaultPrevented) {
      stop()
      return
    }
    if (event.ctrlKey || !event.cancelable || event.deltaY === 0 ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

    let element = event.target instanceof HTMLElement ? event.target : null
    if (!element || !scrollRoot.contains(element)) return
    while (element && element !== scrollRoot) {
      const { overflowY } = window.getComputedStyle(element)
      const canScroll = /auto|scroll/.test(overflowY) && element.scrollHeight > element.clientHeight
      if (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) ||
        (canScroll && (event.deltaY < 0 ? element.scrollTop > 0
          : element.scrollTop < element.scrollHeight - element.clientHeight))) {
        stop()
        return
      }
      element = element.parentElement
    }

    const delta = event.deltaY * (event.deltaMode === 1 ? 16
      : event.deltaMode === 2 ? scrollRoot.clientHeight : 1)
    const nextDirection = Math.sign(delta)
    if (!frame || (direction && nextDirection !== direction)) target = scrollRoot.scrollTop
    direction = nextDirection
    target = Math.max(0, Math.min(target + delta, maximumScroll()))
    startPosition = scrollRoot.scrollTop
    elapsedTime = 0
    event.preventDefault()
    if (!frame) {
      previousFrameTime = window.performance.now()
      frame = window.requestAnimationFrame(animate)
    }
  }

  const handleScroll = () => {
    // Scrollbars, links, and other programmatic scrolling take over immediately.
    if (frame && Math.abs(scrollRoot.scrollTop - lastPosition) > 1) stop()
  }

  wheelRoot.addEventListener("wheel", handleWheel, { passive: false })
  scrollRoot.addEventListener("scroll", handleScroll, { passive: true })
  scrollRoot.addEventListener("pointerdown", stop, { passive: true })
  scrollRoot.addEventListener("touchstart", stop, { passive: true })
  scrollRoot.addEventListener("keydown", stop, true)
  window.addEventListener("resize", stop)

  return {
    stop,
    destroy: () => {
      stop()
      wheelRoot.removeEventListener("wheel", handleWheel)
      scrollRoot.removeEventListener("scroll", handleScroll)
      scrollRoot.removeEventListener("pointerdown", stop)
      scrollRoot.removeEventListener("touchstart", stop)
      scrollRoot.removeEventListener("keydown", stop, true)
      window.removeEventListener("resize", stop)
    },
  }
}

export function useInertialScroll(
  scrollRef: RefObject<HTMLElement | null>,
  disabled: boolean,
  getPausePosition?: ScrollPause,
) {
  const controllerRef = useRef<ReturnType<typeof attachInertialScroll> | null>(null)
  const reducedMotion = useReducedMotion()
  const stop = useCallback(() => controllerRef.current?.stop(), [])

  useEffect(() => {
    const scrollRoot = scrollRef.current
    if (!scrollRoot || disabled || reducedMotion) return

    const controller = attachInertialScroll(scrollRoot, getPausePosition)
    controllerRef.current = controller
    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [disabled, reducedMotion, scrollRef, getPausePosition])

  return stop
}
