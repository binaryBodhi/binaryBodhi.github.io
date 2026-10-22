import type { Project } from "../../data/types"
import "./RetroSections.css"
import "./RetroProjects.css"

export function RetroProjects({ projects }: { projects: Project[] }) {
  return (
    <section className="retro-projects" aria-labelledby="projects-title" tabIndex={0}>
      <header className="retro-projects-intro">
        <p>Project archive</p>
        <h1 id="projects-title">Projects</h1>
      </header>
      <div className="retro-projects-list">
        {projects.map((project, index) => (
          <article className="retro-project-record" key={project.id}>
            <p className="retro-project-index">{String(index + 1).padStart(2, "0")}</p>
            <h2>{project.title}</h2>
            <p className="retro-project-description">{project.description ?? project.summary}</p>
            <ul className="retro-project-technologies" aria-label="Technologies">
              {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
            {project.links.length > 0 && (
              <div className="retro-project-links">
                {project.links.map((link) => (
                  <a key={`${link.kind}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
        {projects.length === 0 && <p>No projects added yet.</p>}
      </div>
    </section>
  )
}
