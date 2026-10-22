import { blendProps, type ExperienceBlendProps } from "./blendProps"

interface ExperienceHeadingProps extends ExperienceBlendProps {
  startIndex?: number
}

export function ExperienceHeading({
  experience, weights, activeIndex, startIndex = 0,
}: ExperienceHeadingProps) {
  return (
    <header className="modern-experience-heading-panel">
      <div className="modern-experience-panel-kicker">
        <span>02</span>
        <span>Experience</span>
      </div>
      <span className="modern-experience-panel-number" aria-hidden="true">
        <span>02</span>
        <span className="modern-experience-panel-suffix">
          {experience.map((item, index) => (
            <span key={item.id} className="modern-experience-morph" {...blendProps(weights[index] ?? 0, index === activeIndex)}>
              .{startIndex + index + 1}
            </span>
          ))}
        </span>
      </span>
      <div className="modern-experience-heading-stack">
        {experience.map((item, index) => (
          <div
            key={item.id}
            className={`modern-experience-heading-entry${item.role.length > 22 ? " has-long-title" : ""}`}
            {...blendProps(weights[index] ?? 0, index === activeIndex)}
          >
            <h3 className="modern-experience-morph">{item.role}</h3>
            <p className="modern-experience-morph">{item.organization}</p>
          </div>
        ))}
      </div>
    </header>
  )
}
