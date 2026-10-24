import type { Project } from "../../../../data/types"
import { PixelTechnologies } from "./PixelTechnologies"
import { PixelDescription } from "./PixelDescription"
import { blendProps } from "../experience/blendProps"
import { useExperienceMorph } from "../experience/useExperienceMorph"

interface ProjectDetailsProps {
  projects: Project[]
  activeIndex: number
  reducedMotion: boolean
}

export function ProjectDetails({ projects, activeIndex, reducedMotion }: ProjectDetailsProps) {
  const weights = useExperienceMorph(activeIndex, projects.length, reducedMotion)

  return (
    <>
      <div className="modern-project-details">
        {projects.map((project, index) => (
          <div key={project.id} className="modern-project-detail-entry"
            {...blendProps(weights[index] ?? 0, index === activeIndex)}>
            <PixelDescription text={project.description ?? project.summary} weight={weights[index] ?? 0} reducedMotion={reducedMotion} />
            <PixelTechnologies technologies={project.technologies} weight={weights[index] ?? 0} reducedMotion={reducedMotion} />
          </div>
        ))}
      </div>
      <div className="modern-project-link-stack">
        {projects.map((project, index) => project.links.length > 0 && (
          <div key={project.id} className={`modern-project-links${index === activeIndex ? " is-active" : ""}`}
            aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
            {project.links.map((link) => (
              <a key={`${link.kind}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                {link.label}<span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
