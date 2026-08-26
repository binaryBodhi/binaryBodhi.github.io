import { useState } from "react"
import type { PortfolioData } from "../../data/types"
import { RetroEducation } from "./RetroEducation"
import { RetroExperience } from "./RetroExperience"
import "./RetroPortfolio.css"

interface RetroPortfolioProps {
  data: PortfolioData
  onSwitchTheme?: () => void
}

export function RetroPortfolio({ data, onSwitchTheme }: RetroPortfolioProps) {
  const [linksAreVisible, setLinksAreVisible] = useState(false)
  const [activeView, setActiveView] = useState<
    "home" | "education" | "experience"
  >("home")
  const activeHeadingId = {
    home: "retro-name",
    education: "education-title",
    experience: "experience-title",
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
          <button
            className={activeView === "education" ? "is-active" : undefined}
            type="button"
            aria-pressed={activeView === "education"}
            onClick={() => setActiveView("education")}
          >
            Education
          </button>
          <button
            className={activeView === "experience" ? "is-active" : undefined}
            type="button"
            aria-pressed={activeView === "experience"}
            onClick={() => setActiveView("experience")}
          >
            Experience
          </button>
          <a href="#projects">Projects</a>
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
        ) : (
          <RetroEducation education={data.education} />
        )}

        {onSwitchTheme && (
          <button
            className="retro-border-control retro-theme-switch"
            type="button"
            onClick={onSwitchTheme}
          >
            Modern Site
          </button>
        )}

      </section>

      <footer className="retro-footer">
        <span>© {new Date().getFullYear()} {data.profile.name}</span>
        <span>All rights reserved</span>
      </footer>
    </main>
  )
}
