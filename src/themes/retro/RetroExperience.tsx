import type { Experience } from "../../data/types"
import "./RetroExperience.css"

interface RetroExperienceProps {
  experience: Experience[]
}

function formatDate(value: string) {
  const [year, month] = value.split("-").map(Number)

  if (!month) {
    return value
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1)))
}

function formatPeriod(experience: Experience) {
  const end = experience.period.end
    ? formatDate(experience.period.end)
    : "Present"

  return `${formatDate(experience.period.start)} — ${end}`
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
  return (
    <section className="retro-experience" aria-labelledby="experience-title">
      <header className="retro-experience-intro">
        <p>Selected timeline</p>
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
                <span>{formatPeriod(item)}</span>
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
