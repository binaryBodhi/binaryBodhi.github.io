import type { Education } from "../../data/types"
import { formatDateRange } from "../../shared/date"
import { BulletList } from "../../shared/BulletList"
import "./RetroSections.css"
import "./RetroEducation.css"

export function RetroEducation({ education }: { education: Education[] }) {
  return (
    <section
      className="retro-education"
      aria-labelledby="education-title"
      tabIndex={0}
    >
      <header className="retro-education-intro">
        <p>Academic records</p>
        <h1 id="education-title">Education</h1>
      </header>

      <div className="retro-education-list">
        {education.map((item, index) => {
          const headingId = `education-${item.id}-institution`

          return (
            <article
              className="retro-education-record"
              aria-labelledby={headingId}
              key={item.id}
            >
              <div className="retro-education-record-heading">
                <span className="retro-education-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="retro-education-rule" aria-hidden="true" />
                <p className="retro-education-period">
                  {formatDateRange(item.period)}
                </p>
              </div>

              <h2 id={headingId}>{item.institution}</h2>

              <div className="retro-education-details">
                <div>
                  <p className="retro-education-qualification">
                    {item.qualification}
                  </p>
                  {item.field && (
                    <p className="retro-education-field">{item.field}</p>
                  )}
                </div>

                {item.location && (
                  <p className="retro-education-location">{item.location}</p>
                )}
              </div>

              <BulletList className="retro-education-highlights" items={item.highlights} />
            </article>
          )
        })}
      </div>
    </section>
  )
}
