import type { PortfolioData } from "../../../data/types"
import { formatDateRange } from "../../../shared/date"
import { BulletList } from "../../../shared/BulletList"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"

export function AboutSection({ education, profile }: Pick<PortfolioData, "education" | "profile">) {
  return (
    <SectionFrame
      name="background"
      index="05"
      label="Background / learning"
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
                <p>{formatDateRange(item.period)}</p>
                <h3>{item.qualification}</h3>
                {item.field && <p>{item.field}</p>}
                <strong>{item.institution}</strong>
                {item.location && <small>{item.location}</small>}
                <BulletList items={item.highlights} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionFrame>
  )
}
