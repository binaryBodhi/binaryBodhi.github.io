import type { CSSProperties } from "react"
import type { Experience } from "../../../data/types"
import { clamp } from "../../../shared/math"
import { mediaQueries, useMediaQuery } from "../../../shared/hooks/useMediaQuery"
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion"
import { PixelCanvas } from "./PixelCanvas"
import { useExperienceMorph } from "./experience/useExperienceMorph"
import { ExperienceHeading } from "./experience/ExperienceHeading"
import { ExperienceCopyPanel } from "./experience/ExperienceCopyPanel"
import { ExperienceNavigation } from "./experience/ExperienceNavigation"
import { MobileExperienceBrowser } from "./experience/MobileExperienceBrowser"
import { useExperienceTimeline } from "./experience/useExperienceTimeline"

interface ExperienceSectionProps {
  experience: Experience[]
  onEntranceStart: () => void
  onTakeoverChange: (progress: number, visible: boolean) => void
  takeoverComplete: boolean
}

const PROGRESS_SEGMENTS_PER_EXPERIENCE = 5

function getOrganizationMark(organization: string) {
  return organization.replace(/\([^)]*\)/g, "").trim().charAt(0).toUpperCase()
}

export function ExperienceSection({
  experience,
  onEntranceStart,
  onTakeoverChange,
  takeoverComplete,
}: ExperienceSectionProps) {
  const isCompact = useMediaQuery(mediaQueries.compact)
  const reducedMotion = useReducedMotion()
  const {
    sectionRef, activeIndex, entranceProgress, scrollProgress,
    scrollToExperience, handleSectionKeyDown,
  } = useExperienceTimeline({
    experienceCount: experience.length,
    isCompact,
    reducedMotion,
    onEntranceStart,
    onTakeoverChange,
  })
  const weights = useExperienceMorph(activeIndex, experience.length, isCompact || reducedMotion)
  if (experience.length === 0) return null

  const fillProgress = clamp(((reducedMotion ? 1 : entranceProgress) - 0.08) / 0.28, 0, 1)
  const entranceComplete = isCompact || reducedMotion || (takeoverComplete && entranceProgress === 1)
  const segmentCount = experience.length * PROGRESS_SEGMENTS_PER_EXPERIENCE
  const completedSegments = entranceComplete ? Math.max(1, Math.ceil(scrollProgress * segmentCount)) : 0
  const markWeights: Record<string, number> = {}
  experience.forEach((item, index) => {
    const mark = getOrganizationMark(item.organization)
    markWeights[mark] = (markWeights[mark] ?? 0) + (weights[index] ?? 0)
  })
  const style = {
    "--modern-experience-count": experience.length,
    "--modern-experience-segment-count": segmentCount,
    "--modern-experience-panel-fill": `${fillProgress * 100}%`,
  } as CSSProperties

  return (
    <section
      ref={sectionRef}
      id="modern-experience"
      className="modern-shell-section modern-experience-section"
      style={style}
      tabIndex={0}
      aria-labelledby="modern-experience-title"
      aria-roledescription={isCompact ? undefined : "scroll-driven experience timeline"}
      onKeyDown={handleSectionKeyDown}
    >
      <div className="modern-experience-pin">
        <div className="modern-experience-content">
          <div className="modern-section-index" aria-hidden="true">02</div>
          <div className="modern-section-body">
            <p className="modern-section-label">Selected work history</p>
            <h2 id="modern-experience-title" className="modern-visually-hidden">Systems built for the real world</h2>
            <div className="modern-experience-panels">
              {isCompact ? <MobileExperienceBrowser experience={experience} progress={fillProgress} /> : (
                <>
                  <ExperienceHeading experience={experience} weights={weights} activeIndex={activeIndex} />
                  <ExperienceNavigation
                    experience={experience}
                    activeIndex={activeIndex}
                    segmentCount={segmentCount}
                    completedSegments={completedSegments}
                    onNavigate={scrollToExperience}
                  />
                  <ExperienceCopyPanel experience={experience} weights={weights} activeIndex={activeIndex} />
                  <div className="modern-experience-art-panel" aria-hidden="true">
                    <PixelCanvas
                      variant="mark"
                      progress={fillProgress}
                      mark={getOrganizationMark(experience[0].organization)}
                      markWeights={markWeights}
                    />
                  </div>
                </>
              )}
            </div>
            {!isCompact && (
              <p className="modern-visually-hidden" aria-live="polite" aria-atomic="true">
                Showing experience {activeIndex + 1} of {experience.length}: {experience[activeIndex]?.role} at {experience[activeIndex]?.organization}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
