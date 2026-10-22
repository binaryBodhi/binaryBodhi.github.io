import { useReducedMotion } from "../../../shared/hooks/useReducedMotion"
import { useRef, useState } from "react"
import type { PortfolioData } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { LifeControls } from "./LifeControls"
import { DEFAULT_LIFE_SETTINGS } from "./gameOfLife"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"
import { WindowPanel } from "./WindowPanel"

function SideWidget({ label, value, accent, className = "" }: {
  label: string; value: string; accent: string; className?: string
}) {
  return (
    <div className={`${className} modern-side-widget`}>
      <span className="modern-widget-key" style={{ background: `var(--modern-accent-${accent})` }} aria-hidden="true">{label[0]}</span>
      <div><strong>{label}</strong><span>{value}</span></div>
    </div>
  )
}

export function HeroSection({ data }: { data: PortfolioData }) {
  const reducedMotion = useReducedMotion()
  const heroGridRef = useRef<HTMLDivElement>(null)
  const [terminalIsOpen, setTerminalIsOpen] = useState(true)
  const [lifeSettings, setLifeSettings] = useState(() => ({
    ...DEFAULT_LIFE_SETTINGS,
    paused: reducedMotion,
  }))
  const headlineParts = data.profile.headline
    .split(/(?<=,)\s+|\s*\|\s*/)
    .filter(Boolean)
  const currentExperience = data.experience.find((item) => !item.period.end)
  const primarySkills = data.skills.flatMap((group) => group.skills).slice(0, 6)

  return (
    <SectionFrame
      name="about"
      index="01"
      label="Profile / system entry"
      className="modern-hero-section"
    >
      <div ref={heroGridRef} className="modern-hero-grid">
        <div className="modern-hero-heading-frame">
          <div className="modern-hero-background" aria-hidden="true">
            <PixelCanvas variant="hero" lifeSettings={lifeSettings} />
          </div>
          <LifeControls settings={lifeSettings} onChange={setLifeSettings} />
          {currentExperience && (
            <SideWidget className="modern-hero-now-building" label="Now building" value={currentExperience.organization} accent="gold" />
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
          {data.profile.location && (
            <SideWidget label="Location" value={data.profile.location} accent="blue" />
          )}
          {data.profile.availability && (
            <SideWidget label="Availability" value={data.profile.availability} accent="green" />
          )}
        </Reveal>
      </div>
    </SectionFrame>
  )
}
