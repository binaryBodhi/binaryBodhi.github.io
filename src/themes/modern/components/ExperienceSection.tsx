import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react"
import type { Experience } from "../../../data/types"
import { formatModernDateRange } from "../date"
import { PixelCanvas } from "./PixelCanvas"
import { useReducedMotion } from "./useReducedMotion"

interface ExperienceSectionProps {
  experience: Experience[]
}

type ExperienceStyle = CSSProperties & {
  "--modern-experience-count": number
  "--modern-experience-segment-count": number
}

const PROGRESS_SEGMENTS_PER_EXPERIENCE = 5

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

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRootRef = useRef<HTMLElement | null>(null)
  const entranceTravelRef = useRef(0)
  const timelineTravelRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [entranceProgress, setEntranceProgress] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isCompact, setIsCompact] = useState(false)
  const reducedMotion = useReducedMotion()
  const experienceCount = experience.length

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
    if (!section || !scrollRoot || experienceCount === 0 || isCompact) return

    const flow = section.parentElement
    const sourceSection = flow?.querySelector<HTMLElement>(".modern-hero-section")
    scrollRootRef.current = scrollRoot
    let animationFrame = 0

    const updateActiveExperience = () => {
      animationFrame = 0
      const rootRect = scrollRoot.getBoundingClientRect()
      const sectionRect = section.getBoundingClientRect()
      const sectionTop = scrollRoot.scrollTop + sectionRect.top - rootRect.top
      const localOffset = Math.max(0, scrollRoot.scrollTop - sectionTop)
      const entranceTravel = entranceTravelRef.current
      const timelineTravel = Math.max(1, timelineTravelRef.current)
      const nextEntranceProgress = entranceTravel === 0
        ? 1
        : clamp(localOffset / entranceTravel, 0, 1)
      const progress = clamp(
        (localOffset - entranceTravel) / timelineTravel,
        0,
        1,
      )
      const nextIndex = clamp(
        Math.floor(progress * experienceCount),
        0,
        Math.max(0, experienceCount - 1),
      )

      section.style.setProperty(
        "--modern-experience-entrance-progress",
        String(nextEntranceProgress),
      )
      // The content follows only behind fully filled pixel columns. The final
      // left-edge strip opens once every cell is opaque, before the handoff.
      const contentReveal = nextEntranceProgress < 0.952
        ? clamp((nextEntranceProgress - 0.24) / 0.82, 0, 1)
        : 0.8683 + ((nextEntranceProgress - 0.952) / 0.048) * 0.1317
      section.style.setProperty(
        "--modern-experience-content-inset",
        `${(1 - contentReveal) * 100}%`,
      )
      section.style.setProperty("--modern-experience-progress", String(progress))
      if (sourceSection) sourceSection.inert = localOffset > 0
      setEntranceProgress((current) => (
        Math.abs(current - nextEntranceProgress) > 0.0005
          ? nextEntranceProgress
          : current
      ))
      setActiveIndex((current) => current === nextIndex ? current : nextIndex)
      setScrollProgress((current) => Math.abs(current - progress) > 0.002 ? progress : current)
    }

    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateActiveExperience)
      }
    }

    const updateMetrics = () => {
      const viewportHeight = scrollRoot.clientHeight
      const stepDistance = Math.max(520, viewportHeight * 0.82)
      const entranceTravel = reducedMotion
        ? 0
        : Math.max(560, viewportHeight * 0.95)
      const timelineTravel = stepDistance * experienceCount

      entranceTravelRef.current = entranceTravel
      timelineTravelRef.current = timelineTravel

      section.style.setProperty("--modern-experience-viewport", `${viewportHeight}px`)
      section.style.setProperty("--modern-experience-entrance-travel", `${entranceTravel}px`)
      section.style.setProperty("--modern-experience-timeline-travel", `${timelineTravel}px`)
      section.style.setProperty(
        "--modern-experience-source-overlap",
        `${reducedMotion ? 0 : Math.min(viewportHeight, sourceSection?.offsetHeight ?? 0)}px`,
      )
      flow?.style.setProperty(
        "--modern-hero-pin-top",
        `${Math.min(0, viewportHeight - (sourceSection?.offsetHeight ?? 0))}px`,
      )
      section.dataset.navigationOffset = String(entranceTravel)
      scheduleUpdate()
    }

    const navigateFromHash = () => {
      if (window.location.hash !== "#modern-experience") return
      const sectionTop = scrollRoot.scrollTop +
        section.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top
      scrollRoot.scrollTo({
        top: sectionTop + entranceTravelRef.current,
        behavior: "auto",
      })
    }

    updateMetrics()
    navigateFromHash()
    updateActiveExperience()
    scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", updateMetrics)
    window.addEventListener("hashchange", navigateFromHash)
    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(scrollRoot)
    if (sourceSection) resizeObserver.observe(sourceSection)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      scrollRoot.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", updateMetrics)
      window.removeEventListener("hashchange", navigateFromHash)
      resizeObserver.disconnect()
      if (sourceSection) sourceSection.inert = false
      delete section.dataset.navigationOffset
      scrollRootRef.current = null
    }
  }, [experienceCount, isCompact, reducedMotion])

  const scrollToExperience = useCallback((requestedIndex: number) => {
    const section = sectionRef.current
    const scrollRoot = scrollRootRef.current
    if (!section || !scrollRoot || experienceCount === 0) return

    const nextIndex = clamp(requestedIndex, 0, experienceCount - 1)
    const rootRect = scrollRoot.getBoundingClientRect()
    const sectionRect = section.getBoundingClientRect()
    const sectionTop = scrollRoot.scrollTop + sectionRect.top - rootRect.top
    const entranceTravel = entranceTravelRef.current
    const timelineTravel = timelineTravelRef.current
    const stepProgress = nextIndex / experienceCount
    const targetOffset = requestedIndex < 0
      ? 0
      : requestedIndex >= experienceCount
        ? entranceTravel + timelineTravel + scrollRoot.clientHeight
        : entranceTravel + timelineTravel * stepProgress

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
  const visibleEntranceProgress = isCompact || reducedMotion
    ? 1
    : entranceProgress
  const completedProgressSegments = Math.max(
    1,
    Math.ceil(scrollProgress * progressSegmentCount),
  )
  const style = {
    "--modern-experience-count": experienceCount,
    "--modern-experience-segment-count": progressSegmentCount,
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
      <div className={`modern-experience-pin${visibleEntranceProgress >= 0.999 ? " is-entered" : ""}`}>
        <PixelCanvas
          className="modern-experience-takeover"
          progress={visibleEntranceProgress}
          variant="takeover"
        />
        <div
          className="modern-experience-content"
          inert={visibleEntranceProgress < 0.999 ? true : undefined}
        >
        <div className="modern-section-index" aria-hidden="true">02</div>

        <div className="modern-section-body">
          <p className="modern-section-label">Selected work history</p>
          <h2 id="modern-experience-title" className="modern-visually-hidden">
            Systems built for the real world
          </h2>

          <div className="modern-experience-panels">
            {experience.map((item, index) => {
              const isActive = index === activeIndex
              const highlights = item.highlights ?? []

              return (
                <article
                  key={item.id}
                  className={`modern-experience-panel${isActive ? " is-active" : ""}`}
                  aria-hidden={!isCompact && !isActive}
                  inert={!isCompact && !isActive ? true : undefined}
                >
                  <header className={`modern-experience-heading-panel${item.role.length > 22 ? " has-long-title" : ""}`}>
                    <div className="modern-experience-panel-kicker">
                      <span>02</span>
                      <span>Experience</span>
                    </div>
                    <span className="modern-experience-panel-number" aria-hidden="true">
                      02.{index + 1}
                    </span>
                    <h3>{item.role}</h3>
                    <p>{item.organization}</p>
                  </header>

                  <div className="modern-experience-navigation-panel" aria-label="Experience controls">
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
                      aria-valuemin={1}
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
                    <div className="modern-experience-meta">
                      <span>{formatModernDateRange(item.period)}</span>
                      {item.location && <span>{item.location}</span>}
                    </div>

                    {item.summary && <p className="modern-experience-summary">{item.summary}</p>}

                    {highlights.length > 0 && (
                      <div className="modern-experience-selected-work">
                        <p>Selected work</p>
                        <ul>
                          {highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.technologies && item.technologies.length > 0 && (
                      <ul className="modern-tag-list" aria-label="Technologies">
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
                  mark={getOrganizationMark(experience[activeIndex].organization)}
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
