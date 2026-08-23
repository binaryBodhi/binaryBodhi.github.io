import { useState } from "react"
import type { PortfolioData } from "../../data/types"
import { RetroExperience } from "./RetroExperience"
import "./RetroPortfolio.css"

interface RetroPortfolioProps {
  data: PortfolioData
  onSwitchTheme?: () => void
}

export function RetroPortfolio({ data, onSwitchTheme }: RetroPortfolioProps) {
  const [linksAreVisible, setLinksAreVisible] = useState(false)
  const [activeView, setActiveView] = useState<"home" | "experience">("home")

  return (
    <main id="retro-home" className="retro-page">
      <section
        className="retro-frame"
        aria-labelledby={activeView === "home" ? "retro-name" : "experience-title"}
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
          <a href="#education">Education</a>
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
              <h1 id="retro-name">{data.profile.name}</h1>
            </div>
            <p className="retro-headline">{data.profile.headline}</p>
          </div>
        ) : (
          <RetroExperience experience={data.experience} />
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
