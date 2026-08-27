import type { SkillGroup } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"

interface SkillsSectionProps {
  skills: SkillGroup[]
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <SectionFrame
      id="modern-skills"
      index="04"
      label="Technical system map"
      titleId="modern-skills-title"
      className="modern-skills-section"
    >
      <div className="modern-skills-heading">
        <Reveal>
          <h2 id="modern-skills-title">A stack designed to connect.</h2>
          <p>
            Languages, platforms, data tools, and infrastructure grouped by how
            they contribute to the system.
          </p>
        </Reveal>
        <Reveal className="modern-skills-canvas" delay={80}>
          <PixelCanvas variant="skills" />
        </Reveal>
      </div>

      <div className="modern-skills-grid">
        {skills.map((group, index) => (
          <Reveal key={group.id} delay={Math.min(index * 55, 220)}>
            <article className="modern-skill-module">
              <header>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{group.name}</h3>
              </header>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <span aria-hidden="true" />
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionFrame>
  )
}
