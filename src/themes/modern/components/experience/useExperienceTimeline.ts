import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { clamp } from "../../../../shared/math"
import { getScrollOffset } from "../../../../shared/dom"

interface TimelineOptions {
  experienceCount: number
  isCompact: boolean
  reducedMotion: boolean
  onEntranceStart: () => void
  onTakeoverChange: (progress: number, visible: boolean) => void
}

const ENTRANCE_DURATION_MS = 1000

export function useExperienceTimeline({
  experienceCount, isCompact, reducedMotion, onEntranceStart, onTakeoverChange,
}: TimelineOptions) {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRootRef = useRef<HTMLElement | null>(null)
  const timelineTravelRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [entranceProgress, setEntranceProgress] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const scrollRoot = section?.closest<HTMLElement>(".modern-main")
    if (!section || !scrollRoot || experienceCount === 0) return

    scrollRootRef.current = scrollRoot
    const listeners = new AbortController()
    let animationFrame = 0
    let entranceFrame = 0
    let entranceStarted = false
    let currentEntranceProgress = 0
    const publishTakeover = () => {
      onTakeoverChange(
        clamp((currentEntranceProgress - 0.22) / 0.78, 0, 1),
        currentEntranceProgress > 0,
      )
    }

    const playTransition = (target: 0 | 1) => {
      if (entranceStarted === (target === 1)) return
      if (target === 1 && !isCompact) onEntranceStart()
      entranceStarted = target === 1
      if (entranceFrame) window.cancelAnimationFrame(entranceFrame)
      entranceFrame = 0
      if (reducedMotion) {
        currentEntranceProgress = target
        if (target === 1) setEntranceProgress(1)
        publishTakeover()
        return
      }

      const startProgress = currentEntranceProgress
      const duration = Math.max(1, ENTRANCE_DURATION_MS * Math.abs(target - startProgress))
      const startTime = window.performance.now()
      const advanceEntrance = (time: number) => {
        const progress = clamp((time - startTime) / duration, 0, 1)
        currentEntranceProgress = startProgress + (target - startProgress) * progress
        // Panel colors persist once revealed; only the wrapper unwinds on exit.
        const panelProgress = currentEntranceProgress
        if (target === 1) {
          setEntranceProgress((current) => Math.max(current, panelProgress))
        }
        publishTakeover()
        entranceFrame = progress < 1
          ? window.requestAnimationFrame(advanceEntrance)
          : 0
      }
      entranceFrame = window.requestAnimationFrame(advanceEntrance)
    }

    const updateActiveExperience = () => {
      animationFrame = 0
      const rootRect = scrollRoot.getBoundingClientRect()
      const sectionRect = section.getBoundingClientRect()
      if (isCompact) {
        // Phones use a natural list rather than a pinned timeline. Start the
        // same background reveal as Experience enters the reading area.
        const activationLine = rootRect.top + scrollRoot.clientHeight * 0.3
        playTransition(sectionRect.top <= activationLine && sectionRect.bottom > rootRect.top ? 1 : 0)
        publishTakeover()
        return
      }
      const sectionTop = getScrollOffset(scrollRoot, section)
      const localOffset = scrollRoot.scrollTop - sectionTop
      const timelineTravel = Math.max(1, timelineTravelRef.current)

      // Exit when the pinned timeline releases and Projects starts entering,
      // rather than waiting another viewport for Experience to disappear.
      // Reversing during playback continues from the currently drawn progress.
      playTransition(localOffset >= -1 && localOffset <= timelineTravel + 1 ? 1 : 0)

      publishTakeover()

      const progress = clamp(localOffset / timelineTravel, 0, 1)
      const nextIndex = clamp(
        Math.floor(progress * experienceCount),
        0,
        Math.max(0, experienceCount - 1),
      )
      setActiveIndex((current) => current === nextIndex ? current : nextIndex)
      setScrollProgress((current) => Math.abs(current - progress) > 0.002 ? progress : current)
    }

    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateActiveExperience)
      }
    }

    const handleEntranceWheel = (event: WheelEvent) => {
      if (isCompact || reducedMotion || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

      if (entranceStarted && entranceFrame && event.deltaY > 0) {
        // Hold only during playback. Continuous wheel input must be allowed
        // to advance the timeline as soon as the entrance finishes.
        event.preventDefault()
        return
      }
      if (entranceStarted || event.deltaY <= 0) return

      const sectionTop = getScrollOffset(scrollRoot, section)
      if (Math.abs(scrollRoot.scrollTop - sectionTop) > 1) return

      // The scrolling controller eases to the pin before pausing. Do not snap
      // here based on a raw wheel delta that has not yet been rendered.
      event.preventDefault()
      scrollRoot.scrollTo({ top: sectionTop, behavior: "instant" })
      playTransition(1)
      scheduleUpdate()
    }

    const updateMetrics = () => {
      if (isCompact) {
        scheduleUpdate()
        return
      }
      const viewportHeight = scrollRoot.clientHeight
      const stepDistance = Math.max(520, viewportHeight * 0.82)
      const timelineTravel = stepDistance * experienceCount
      timelineTravelRef.current = timelineTravel
      section.style.setProperty("--modern-experience-viewport", `${viewportHeight}px`)
      section.style.setProperty("--modern-experience-timeline-travel", `${timelineTravel}px`)
      scheduleUpdate()
    }

    const navigateFromHash = () => {
      if (isCompact || window.location.hash !== "#modern-experience") return
      const sectionTop = getScrollOffset(scrollRoot, section)
      scrollRoot.scrollTo({
        top: sectionTop,
        behavior: "instant",
      })
    }

    updateMetrics()
    navigateFromHash()
    updateActiveExperience()
    scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true, signal: listeners.signal })
    scrollRoot.addEventListener("wheel", handleEntranceWheel, { passive: false, signal: listeners.signal })
    window.addEventListener("resize", updateMetrics, { signal: listeners.signal })
    window.addEventListener("hashchange", navigateFromHash, { signal: listeners.signal })
    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(scrollRoot)
    if (isCompact) resizeObserver.observe(section)
    if (section.previousElementSibling) resizeObserver.observe(section.previousElementSibling)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      if (entranceFrame) window.cancelAnimationFrame(entranceFrame)
      listeners.abort()
      resizeObserver.disconnect()
      scrollRootRef.current = null
      onTakeoverChange(0, false)
    }
  }, [experienceCount, isCompact, reducedMotion, onEntranceStart, onTakeoverChange])

  const scrollToExperience = useCallback((requestedIndex: number) => {
    const section = sectionRef.current
    const scrollRoot = scrollRootRef.current
    if (!section || !scrollRoot || experienceCount === 0) return

    const nextIndex = clamp(requestedIndex, 0, experienceCount - 1)
    const sectionTop = getScrollOffset(scrollRoot, section)
    const timelineTravel = timelineTravelRef.current
    const stepProgress = nextIndex / experienceCount
    const targetOffset = requestedIndex < 0
      ? 0
      : requestedIndex >= experienceCount
        ? timelineTravel + scrollRoot.clientHeight
        // Land inside the entry so rounded scrollTop cannot select the previous one.
        : timelineTravel * stepProgress + (nextIndex > 0 ? 1 : 0)

    scrollRoot.scrollTo({
      top: sectionTop + targetOffset,
      behavior: reducedMotion ? "auto" : "smooth",
    })
  }, [experienceCount, reducedMotion])

  const handleSectionKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || isCompact) return

    const forwardIndex = entranceProgress < 0.999 ? 0 : activeIndex + 1
    const target = new Map([
      ["ArrowDown", forwardIndex], ["PageDown", forwardIndex],
      ["ArrowUp", activeIndex - 1], ["PageUp", activeIndex - 1],
      ["Home", 0], ["End", experienceCount - 1],
    ]).get(event.key)
    if (target === undefined) return
    event.preventDefault()
    scrollToExperience(target)
  }

  return { sectionRef, activeIndex, entranceProgress, scrollProgress, scrollToExperience, handleSectionKeyDown }
}
