import type { Experience } from "../../data/types"
import { formatDateRange } from "./date"
import "./RetroExperience.css"

interface RetroExperienceProps {
  experience: Experience[]
}

function formatTimeline(experience: Experience[]) {
  if (experience.length === 0) {
    return null
  }

  const start = experience.reduce((earliest, item) =>
    item.period.start < earliest ? item.period.start : earliest,
  experience[0].period.start)

  const isOngoing = experience.some((item) => !item.period.end)
  const completedEnds = experience
    .map((item) => item.period.end)
    .filter((end): end is string => Boolean(end))
  const latestEnd = completedEnds.reduce((latest, end) =>
    end > latest ? end : latest,
  completedEnds[0] ?? start)

  return `${start.split("-")[0]} — ${isOngoing ? "Present" : latestEnd.split("-")[0]}`
}

function getOrganizationMark(organization: string) {
  return organization
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export function RetroExperience({ experience }: RetroExperienceProps) {
  const timeline = formatTimeline(experience)

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
                  {getOrganizationMark(item.organization)}
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

              {item.highlights && item.highlights.length > 0 && (
                <ul className="retro-experience-highlights">
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}

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
