import { useState } from "react"
import type { Project } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleIndex = projects.length > 0 ? activeIndex % projects.length : 0
  const activeProject = projects[visibleIndex]
  const activeMark = activeProject?.title.trim().charAt(0).toUpperCase() || "S"

  const showProject = (direction: -1 | 1) => {
    if (projects.length < 2) return
    setActiveIndex((current) =>
      (current + direction + projects.length) % projects.length,
    )
  }

  return (
    <SectionFrame
      id="modern-projects"
      index="03"
      label="Project archive"
      titleId="modern-projects-title"
      className="modern-projects-section"
    >
      <Reveal className="modern-projects-heading">
        <h2 id="modern-projects-title">Projects, assembled as working systems.</h2>
        <p>
          Case studies connect the problem, implementation, and result—not just
          the final screenshot.
        </p>
      </Reveal>

      {activeProject ? (
        <Reveal className="modern-project-stage" delay={80}>
          <article className="modern-project-card">
            <div className="modern-project-card-copy">
              <div className="modern-project-card-meta">
                <span>03.{visibleIndex + 1}</span>
                {activeProject.featured && <span>Featured</span>}
              </div>
              <h3>{activeProject.title}</h3>
              <p>{activeProject.description ?? activeProject.summary}</p>
              <ul className="modern-tag-list" aria-label="Technologies">
                {activeProject.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
              {activeProject.links.length > 0 && (
                <div className="modern-project-links">
                  {activeProject.links.map((link) => (
                    <a key={`${link.kind}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                      {link.label}<span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="modern-project-visual">
              {activeProject.image ? (
                <img src={activeProject.image.src} alt={activeProject.image.alt} />
              ) : (
                <PixelCanvas variant="mark" mark={activeMark} />
              )}
            </div>
          </article>

          <div className="modern-project-controls" aria-label="Project navigation">
            <button type="button" onClick={() => showProject(-1)} disabled={projects.length < 2}>
              <span aria-hidden="true">←</span> Previous
            </button>
            <div className="modern-project-progress" aria-hidden="true">
              {projects.map((project, index) => (
                <span key={project.id} className={index === visibleIndex ? "is-active" : ""} />
              ))}
            </div>
            <button type="button" onClick={() => showProject(1)} disabled={projects.length < 2}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </Reveal>
      ) : (
        <Reveal className="modern-project-empty" delay={80}>
          <div>
            <span aria-hidden="true">03.0</span>
            <h3>Case studies are being assembled.</h3>
            <p>
              This module is connected and ready for project screenshots,
              source links, and implementation notes.
            </p>
          </div>
          <PixelCanvas variant="mark" mark="S" />
        </Reveal>
      )}
    </SectionFrame>
  )
}
