import type { Experience } from "../../../../data/types"

interface ExperienceNavigationProps {
  experience: Experience[]
  activeIndex: number
  segmentCount: number
  completedSegments: number
  onNavigate: (index: number) => void
}

export function ExperienceNavigation({
  experience, activeIndex, segmentCount, completedSegments, onNavigate,
}: ExperienceNavigationProps) {
  return (
    <div className="modern-experience-navigation-panel" aria-label="Experience controls">
      <div className="modern-experience-arrows">
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            disabled={activeIndex === (direction === -1 ? 0 : experience.length - 1)}
            aria-label={`${direction === -1 ? "Previous" : "Next"} experience`}
            onClick={(event) => {
              if (event.detail > 0) event.currentTarget.blur()
              onNavigate(activeIndex + direction)
            }}
          >
            {direction === -1 ? "←" : "→"}
          </button>
        ))}
      </div>

      <div className="modern-experience-progress-copy" aria-hidden="true">
        {experience.map((progressItem, progressIndex) => (
          <span key={progressItem.id}>{progressIndex + 1}</span>
        ))}
      </div>
      <div
        className="modern-experience-progress"
        role="progressbar"
        aria-label={`Experience ${activeIndex + 1} of ${experience.length}`}
        aria-valuemin={0}
        aria-valuemax={segmentCount}
        aria-valuenow={completedSegments}
      >
        {Array.from({ length: segmentCount }, (_, progressIndex) => (
          <span
            key={progressIndex}
            className={progressIndex < completedSegments ? "is-complete" : ""}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
