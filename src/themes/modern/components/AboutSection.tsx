import type { Education, Profile } from "../../../data/types"
import { formatModernDateRange } from "../date"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"

interface AboutSectionProps {
  education: Education[]
  profile: Profile
}

export function AboutSection({ education, profile }: AboutSectionProps) {
  return (
    <SectionFrame
      id="modern-background"
      index="05"
      label="Background / learning"
      titleId="modern-background-title"
      className="modern-background-section"
    >
      <div className="modern-background-layout">
        <Reveal className="modern-background-heading">
          <span className="modern-floppy-icon" aria-hidden="true">
            <span />
          </span>
          <h2 id="modern-background-title">Built through study and practice.</h2>
        </Reveal>

        <Reveal className="modern-biography" delay={70}>
          <p className="modern-mono-label">About the developer</p>
          {profile.biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {profile.tagline && <strong>{profile.tagline}</strong>}
        </Reveal>

        <div className="modern-education-list">
          {education.map((item, index) => (
            <Reveal key={item.id} delay={Math.min(index * 80, 160)}>
              <article className="modern-education-card">
                <span aria-hidden="true">EDU.{index + 1}</span>
                <p>{formatModernDateRange(item.period)}</p>
                <h3>{item.qualification}</h3>
                {item.field && <p>{item.field}</p>}
                <strong>{item.institution}</strong>
                {item.location && <small>{item.location}</small>}
                {item.highlights && item.highlights.length > 0 && (
                  <ul>
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionFrame>
  )
}
