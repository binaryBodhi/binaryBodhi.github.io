import type { Experience } from "../../../../data/types"
import type { ReactNode } from "react"
import { BulletList } from "../../../../shared/BulletList"
import { formatDateRange } from "../../../../shared/date"
import { blendProps, type ExperienceBlendProps } from "./blendProps"

export function ExperienceCopyPanel({ experience, weights, activeIndex }: ExperienceBlendProps) {
  const activeHasHighlights = (experience[activeIndex]?.highlights?.length ?? 0) > 0
  const renderStack = (render: (item: Experience) => ReactNode) => (
    <div className="modern-experience-copy-stack">
      {experience.map((item, index) => (
        <div
          key={item.id}
          className="modern-experience-copy-entry modern-experience-morph"
          {...blendProps(weights[index] ?? 0, index === activeIndex)}
        >
          {render(item)}
        </div>
      ))}
    </div>
  )

  return (
    <div className="modern-experience-copy-panel">
      {renderStack((item) => (
        <>
          <div className="modern-experience-meta">
            <span>{formatDateRange(item.period)}</span>
            {item.location && <span>{item.location}</span>}
          </div>
          {item.summary && <p className="modern-experience-summary">{item.summary}</p>}
        </>
      ))}

      {experience.some((item) => (item.highlights?.length ?? 0) > 0) && (
        <div className="modern-experience-selected-work">
          <p style={{ visibility: activeHasHighlights ? "visible" : "hidden" }}>Selected work</p>
          {renderStack((item) => <BulletList items={item.highlights} />)}
        </div>
      )}

      {renderStack((item) => <BulletList className="modern-tag-list" aria-label="Technologies" items={item.technologies} />)}
    </div>
  )
}

