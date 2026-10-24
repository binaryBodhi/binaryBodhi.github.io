import { useRef, useState } from "react"
import type { PortfolioData } from "../../data/types"
import { RetroEducation } from "./RetroEducation"
import { RetroExperience } from "./RetroExperience"
import { RetroProjects } from "./RetroProjects"
import "./RetroPortfolio.css"

interface RetroPortfolioProps {
  data: PortfolioData
  onSwitchTheme?: () => void
}

export function RetroPortfolio({ data, onSwitchTheme }: RetroPortfolioProps) {
  const [linksAreVisible, setLinksAreVisible] = useState(false)
  const [updateIsVisible, setUpdateIsVisible] = useState(true)
  const themeSwitchRef = useRef<HTMLButtonElement>(null)
  const [activeView, setActiveView] = useState<
    "home" | "education" | "experience" | "projects"
  >("home")
  const activeHeadingId = {
    home: "retro-name",
    education: "education-title",
    experience: "experience-title",
    projects: "projects-title",
  }[activeView]

  return (
    <main id="retro-home" className="retro-page">
      <section
        className="retro-frame"
        aria-labelledby={activeHeadingId}
      >

        <button
          className="retro-home"
          type="button"
          aria-pressed={activeView === "home"}
          onClick={() => setActiveView("home")}
        >
          Home
        </button>

        <button
          className="retro-border-control retro-reveal"
          type="button"
          aria-expanded={linksAreVisible}
          onClick={() => setLinksAreVisible((areVisible) => !areVisible)}
        >
          <span className="retro-checkbox" aria-hidden="true">
            {linksAreVisible ? "×" : ""}
          </span>
          Reveal Links
        </button>

        <nav className="retro-navigation" aria-label="Portfolio navigation">
          {(["education", "experience", "projects"] as const).map((view) => (
            <button
              key={view}
              className={activeView === view ? "is-active" : undefined}
              type="button"
              aria-pressed={activeView === view}
              onClick={() => setActiveView(view)}
            >
              {{ education: "Education", experience: "Experience", projects: "Projects" }[view]}
            </button>
          ))}
          {data.profile.email && <a href={`mailto:${data.profile.email}`}>Contact</a>}
        </nav>

        {linksAreVisible && (
          <div className="retro-social-links" aria-label="Social links">
            {data.socialLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        )}

        {activeView === "home" ? (
          <div className="retro-introduction">
            <p className="retro-eyebrow">Portfolio of</p>
            <div className="retro-title-row">
              <h1 id="retro-name" tabIndex={-1}>{data.profile.name}</h1>
            </div>
            <p className="retro-headline">{data.profile.headline}</p>
          </div>
        ) : activeView === "experience" ? (
          <RetroExperience experience={data.experience} />
        ) : activeView === "projects" ? (
          <RetroProjects projects={data.projects ?? []} />
        ) : (
          <RetroEducation education={data.education} />
        )}

        {onSwitchTheme && (
          <>
            {updateIsVisible && (
              <aside className="retro-update" aria-labelledby="retro-update-title">
                <div className="retro-update-titlebar">
                  <strong id="retro-update-title">Portfolio update</strong>
                  <button
                    type="button"
                    aria-label="Dismiss portfolio update"
                    onClick={() => {
                      setUpdateIsVisible(false)
                      themeSwitchRef.current?.focus()
                    }}
                  >×</button>
                </div>
                <div className="retro-update-body">
                  <p>A new look is available.</p>
                  <p>Same developer. Modern edition.</p>
                  <button type="button" onClick={onSwitchTheme}>Explore modern site ↗</button>
                </div>
              </aside>
            )}
            <button
              ref={themeSwitchRef}
              className="retro-border-control retro-theme-switch"
              type="button"
              onClick={onSwitchTheme}
            >
              Modern Site
            </button>
          </>
        )}

      </section>

      <footer className="retro-footer">
        <span>© {new Date().getFullYear()} {data.profile.name}</span>
        <span>All rights reserved</span>
      </footer>
    </main>
  )
}
