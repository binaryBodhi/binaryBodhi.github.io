import { useRef, useState } from "react"
import type { PortfolioData } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { LifeControls } from "./LifeControls"
import { DEFAULT_LIFE_SETTINGS } from "./gameOfLife"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"
import { WindowPanel } from "./WindowPanel"

interface HeroSectionProps {
  data: PortfolioData
}

export function HeroSection({ data }: HeroSectionProps) {
  const heroGridRef = useRef<HTMLDivElement>(null)
  const [terminalIsOpen, setTerminalIsOpen] = useState(true)
  const [lifeSettings, setLifeSettings] = useState(() => ({
    ...DEFAULT_LIFE_SETTINGS,
    paused: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }))
  const headlineParts = data.profile.headline
    .split(/(?<=,)\s+|\s*\|\s*/)
    .filter(Boolean)
  const currentExperience = data.experience.find((item) => !item.period.end)
  const primarySkills = data.skills.flatMap((group) => group.skills).slice(0, 6)

  return (
    <SectionFrame
      id="modern-about"
      index="01"
      label="Profile / system entry"
      titleId="modern-about-title"
      className="modern-hero-section"
    >
      <div ref={heroGridRef} className="modern-hero-grid">
        <div className="modern-hero-heading-frame">
          <div className="modern-hero-background" aria-hidden="true">
            <PixelCanvas variant="hero" lifeSettings={lifeSettings} />
          </div>
          {currentExperience && (
            <div className="modern-hero-now-building modern-side-widget modern-side-widget--gold">
              <span className="modern-widget-key" aria-hidden="true">N</span>
              <div>
                <strong>Now building</strong>
                <span>{currentExperience.organization}</span>
              </div>
            </div>
          )}
          <Reveal className="modern-hero-heading-wrap">
            <h1 id="modern-about-title" tabIndex={-1}>
              {headlineParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </h1>
          </Reveal>
        </div>

        {terminalIsOpen && (
          <Reveal className="modern-hero-terminal" delay={140}>
            <WindowPanel
              dragBoundaryRef={heroGridRef}
              draggable
              onClose={() => setTerminalIsOpen(false)}
              title="developer.profile"
            >
              <div className="modern-terminal-lines">
                <p><span>$</span> whoami</p>
                <p>{data.profile.name}</p>
                <p><span>$</span> current_role</p>
                <p>{currentExperience?.role ?? data.profile.headline}</p>
                <p><span>$</span> toolchain --summary</p>
                <p>{primarySkills.join(" / ")}</p>
              </div>
            </WindowPanel>
          </Reveal>
        )}

        <Reveal className="modern-hero-widgets" delay={180}>
          <LifeControls settings={lifeSettings} onChange={setLifeSettings} />
          {data.profile.location && (
            <div className="modern-side-widget modern-side-widget--blue">
              <span className="modern-widget-key" aria-hidden="true">L</span>
              <div>
                <strong>Location</strong>
                <span>{data.profile.location}</span>
              </div>
            </div>
          )}
          {data.profile.availability && (
            <div className="modern-side-widget modern-side-widget--green">
              <span className="modern-widget-key" aria-hidden="true">A</span>
              <div>
                <strong>Availability</strong>
                <span>{data.profile.availability}</span>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </SectionFrame>
  )
}
