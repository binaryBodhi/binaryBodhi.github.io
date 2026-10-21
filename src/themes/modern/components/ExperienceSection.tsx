import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react"
import type { Experience } from "../../../data/types"
import { formatModernDateRange } from "../date"
import { PixelCanvas } from "./PixelCanvas"
import { useReducedMotion } from "./useReducedMotion"
import { useExperienceMorph } from "./useExperienceMorph"

interface ExperienceSectionProps {
  experience: Experience[]
  onEntranceStart: () => void
  onTakeoverChange: (progress: number, visible: boolean) => void
  takeoverComplete: boolean
}

type ExperienceStyle = CSSProperties & {
  "--modern-experience-count": number
  "--modern-experience-segment-count": number
  "--modern-experience-panel-fill": string
}

const PROGRESS_SEGMENTS_PER_EXPERIENCE = 5
const ENTRANCE_DURATION_MS = 1000

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function getOrganizationMark(organization: string) {
  return organization
    .replace(/\([^)]*\)/g, "")
    .trim()
    .charAt(0)
    .toUpperCase()
}

export function ExperienceSection({ experience, onEntranceStart, onTakeoverChange, takeoverComplete }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRootRef = useRef<HTMLElement | null>(null)
  const timelineTravelRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [entranceProgress, setEntranceProgress] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isCompact, setIsCompact] = useState(() => window.matchMedia("(max-width: 767px)").matches)
  const reducedMotion = useReducedMotion()
  const experienceCount = experience.length
  const morphWeights = useExperienceMorph(activeIndex, experienceCount, isCompact || reducedMotion)
  const markWeights: Record<string, number> = {}
  experience.forEach((item, index) => {
    const mark = getOrganizationMark(item.organization)
    markWeights[mark] = (markWeights[mark] ?? 0) + (morphWeights[index] ?? 0)
  })

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 767px)")
    const updateCompactLayout = () => setIsCompact(compactQuery.matches)

    updateCompactLayout()
    compactQuery.addEventListener("change", updateCompactLayout)
    return () => compactQuery.removeEventListener("change", updateCompactLayout)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const scrollRoot = section?.closest<HTMLElement>(".modern-main")
    if (!section || !scrollRoot || experienceCount === 0) return

    scrollRootRef.current = scrollRoot
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
      const sectionTop = scrollRoot.scrollTop + sectionRect.top - rootRect.top
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
      section.style.setProperty("--modern-experience-progress", String(progress))
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

      const sectionTop = scrollRoot.scrollTop +
        section.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top
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
      const sectionTop = scrollRoot.scrollTop +
        section.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top
      scrollRoot.scrollTo({
        top: sectionTop,
        behavior: "instant",
      })
    }

    updateMetrics()
    navigateFromHash()
    updateActiveExperience()
    scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true })
    scrollRoot.addEventListener("wheel", handleEntranceWheel, { passive: false })
    window.addEventListener("resize", updateMetrics)
    window.addEventListener("hashchange", navigateFromHash)
    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(scrollRoot)
    if (isCompact) resizeObserver.observe(section)
    if (section.previousElementSibling) resizeObserver.observe(section.previousElementSibling)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      if (entranceFrame) window.cancelAnimationFrame(entranceFrame)
      scrollRoot.removeEventListener("scroll", scheduleUpdate)
      scrollRoot.removeEventListener("wheel", handleEntranceWheel)
      window.removeEventListener("resize", updateMetrics)
      window.removeEventListener("hashchange", navigateFromHash)
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
    const rootRect = scrollRoot.getBoundingClientRect()
    const sectionRect = section.getBoundingClientRect()
    const sectionTop = scrollRoot.scrollTop + sectionRect.top - rootRect.top
    const timelineTravel = timelineTravelRef.current
    const stepProgress = nextIndex / experienceCount
    const targetOffset = requestedIndex < 0
      ? 0
      : requestedIndex >= experienceCount
        ? timelineTravel + scrollRoot.clientHeight
        : timelineTravel * stepProgress

    scrollRoot.scrollTo({
      top: sectionTop + targetOffset,
      behavior: reducedMotion ? "auto" : "smooth",
    })
  }, [experienceCount, reducedMotion])

  const handleSectionKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || isCompact) return

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault()
      scrollToExperience(entranceProgress < 0.999 ? 0 : activeIndex + 1)
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault()
      scrollToExperience(activeIndex - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      scrollToExperience(0)
    } else if (event.key === "End") {
      event.preventDefault()
      scrollToExperience(experienceCount - 1)
    }
  }

  if (experienceCount === 0) return null

  const progressSegmentCount = experienceCount * PROGRESS_SEGMENTS_PER_EXPERIENCE
  const visibleEntranceProgress = reducedMotion
    ? 1
    : entranceProgress
  // Wait for the canvas to draw its final pixels before starting the bar fade.
  const entranceComplete = isCompact || reducedMotion ||
    (takeoverComplete && visibleEntranceProgress === 1)
  const completedProgressSegments = entranceComplete
    ? Math.max(1, Math.ceil(scrollProgress * progressSegmentCount))
    : 0
  const style = {
    "--modern-experience-count": experienceCount,
    "--modern-experience-segment-count": progressSegmentCount,
    "--modern-experience-panel-fill": `${clamp((visibleEntranceProgress - 0.08) / 0.28, 0, 1) * 100}%`,
  } as ExperienceStyle

  return (
    <section
      ref={sectionRef}
      id="modern-experience"
      className="modern-shell-section modern-experience-section"
      style={style}
      tabIndex={0}
      aria-labelledby="modern-experience-title"
      aria-roledescription="scroll-driven experience timeline"
      onKeyDown={handleSectionKeyDown}
    >
      <div className={`modern-experience-pin${entranceComplete ? " is-entered" : ""}`}>
        <div className="modern-experience-content">
        <div className="modern-section-index" aria-hidden="true">02</div>

        <div className="modern-section-body">
          <p className="modern-section-label">Selected work history</p>
          <h2 id="modern-experience-title" className="modern-visually-hidden">
            Systems built for the real world
          </h2>

          <div className="modern-experience-panels">
            <div className="modern-experience-card-backdrops" aria-hidden="true">
              <div className="modern-experience-heading-panel" />
              <div className="modern-experience-navigation-panel" />
              <div className="modern-experience-copy-panel" />
            </div>
            {experience.map((item, index) => {
              const isActive = index === activeIndex
              const weight = morphWeights[index] ?? 0
              const highlights = item.highlights ?? []

              return (
                <article
                  key={item.id}
                  className={`modern-experience-panel${isActive ? " is-active" : ""}`}
                  style={{
                    "--modern-experience-weight": weight,
                    visibility: isCompact || weight > 0 ? "visible" : "hidden",
                  } as CSSProperties}
                  aria-hidden={!isCompact && !isActive}
                  inert={!isCompact && !isActive ? true : undefined}
                >
                  <header className={`modern-experience-heading-panel${item.role.length > 22 ? " has-long-title" : ""}`}>
                    <div className="modern-experience-panel-kicker modern-experience-static">
                      <span>02</span>
                      <span>Experience</span>
                    </div>
                    <span className="modern-experience-panel-number" aria-hidden="true">
                      <span className="modern-experience-static">02</span>
                      <span className="modern-experience-morph">.{index + 1}</span>
                    </span>
                    <h3 className="modern-experience-morph">{item.role}</h3>
                    <p className="modern-experience-morph">{item.organization}</p>
                  </header>

                  <div className="modern-experience-navigation-panel modern-experience-static" aria-label="Experience controls">
                    <div className="modern-experience-arrows">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label="Previous experience"
                        onClick={(event) => {
                          event.currentTarget.blur()
                          scrollToExperience(index - 1)
                        }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === experienceCount - 1}
                        aria-label="Next experience"
                        onClick={(event) => {
                          event.currentTarget.blur()
                          scrollToExperience(index + 1)
                        }}
                      >
                        →
                      </button>
                    </div>

                    <div className="modern-experience-progress-copy" aria-hidden="true">
                      {experience.map((progressItem, progressIndex) => (
                        <span key={progressItem.id}>{progressIndex + 1}</span>
                      ))}
                    </div>
                    <div
                      className="modern-experience-progress"
                      role="progressbar"
                      aria-label={`Experience ${index + 1} of ${experienceCount}`}
                      aria-valuemin={0}
                      aria-valuemax={progressSegmentCount}
                      aria-valuenow={completedProgressSegments}
                    >
                      {Array.from({ length: progressSegmentCount }, (_, progressIndex) => (
                        <span
                          key={progressIndex}
                          className={progressIndex < completedProgressSegments ? "is-complete" : ""}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="modern-experience-copy-panel">
                    <div className="modern-experience-meta modern-experience-morph">
                      <span>{formatModernDateRange(item.period)}</span>
                      {item.location && <span>{item.location}</span>}
                    </div>

                    {item.summary && <p className="modern-experience-summary modern-experience-morph">{item.summary}</p>}

                    {highlights.length > 0 && (
                      <div className="modern-experience-selected-work">
                        <p className="modern-experience-static">Selected work</p>
                        <ul className="modern-experience-morph">
                          {highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.technologies && item.technologies.length > 0 && (
                      <ul className="modern-tag-list modern-experience-morph" aria-label="Technologies">
                        {item.technologies.map((technology) => (
                          <li key={technology}>{technology}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="modern-experience-art-panel modern-experience-art-panel--entry" aria-hidden="true">
                    <PixelCanvas
                      className="modern-experience-entry-mark"
                      variant="mark"
                      progress={clamp((visibleEntranceProgress - 0.08) / 0.28, 0, 1)}
                      mark={getOrganizationMark(item.organization)}
                    />
                  </div>
                </article>
              )
            })}

            <div className="modern-experience-art-layer" aria-hidden="true">
              <div className="modern-experience-art-panel modern-experience-art-panel--persistent">
                <PixelCanvas
                  variant="mark"
                  progress={clamp((visibleEntranceProgress - 0.08) / 0.28, 0, 1)}
                  mark={getOrganizationMark(experience[0].organization)}
                  markWeights={markWeights}
                />
              </div>
            </div>
          </div>

          <p className="modern-visually-hidden" aria-live="polite" aria-atomic="true">
            Showing experience {activeIndex + 1} of {experienceCount}: {experience[activeIndex]?.role} at {experience[activeIndex]?.organization}
          </p>
        </div>
        </div>
      </div>
    </section>
  )
}
