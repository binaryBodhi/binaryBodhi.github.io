import type { Experience } from "../../data/types"
import { formatDateRange, formatTimelineRange } from "../../shared/date"
import { BulletList } from "../../shared/BulletList"
import { getInitials } from "../../shared/text"
import "./RetroSections.css"
import "./RetroExperience.css"

export function RetroExperience({ experience }: { experience: Experience[] }) {
  const timeline = formatTimelineRange(experience.map((item) => item.period))

  return (
    <section
      className="retro-experience"
      aria-labelledby="experience-title"
      tabIndex={0}
    >
      <header className="retro-experience-intro">
        {timeline && <p>{timeline}</p>}
        <h1 id="experience-title">Experience</h1>
      </header>

      <div className="retro-experience-list">
        {experience.map((item) => (
          <article className="retro-experience-entry" key={item.id}>
            <div className="retro-experience-heading">
              <h2>{item.organization}</h2>
              <span className="retro-experience-rule" aria-hidden="true" />
              {item.image ? (
                <img
                  className="retro-experience-image"
                  src={item.image.src}
                  alt={item.image.alt}
                />
              ) : (
                <div className="retro-experience-mark" aria-hidden="true">
                  {getInitials(item.organization.replace(/\([^)]*\)/g, ""))}
                </div>
              )}
            </div>

            <div className="retro-experience-copy">
              <p className="retro-experience-role">{item.role}</p>
              <p className="retro-experience-meta">
                <span>{formatDateRange(item.period)}</span>
                {item.location && <span>{item.location}</span>}
              </p>

              {item.summary && (
                <p className="retro-experience-summary">{item.summary}</p>
              )}

              <BulletList className="retro-experience-highlights" items={item.highlights} />

              {item.technologies && item.technologies.length > 0 && (
                <p className="retro-experience-technologies">
                  {item.technologies.join(" / ")}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
