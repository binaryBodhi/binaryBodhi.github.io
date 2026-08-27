import { useRef, useState } from "react"
import type { PortfolioData } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"
import { WindowPanel } from "./WindowPanel"

interface HeroSectionProps {
  data: PortfolioData
}

function ExternalLink({ label, url }: { label: string; url: string }) {
  const isEmail = url.startsWith("mailto:")
  return (
    <a
      className="modern-action"
      href={url}
      target={isEmail ? undefined : "_blank"}
      rel={isEmail ? undefined : "noreferrer"}
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  )
}

export function HeroSection({ data }: HeroSectionProps) {
  const heroGridRef = useRef<HTMLDivElement>(null)
  const [terminalIsOpen, setTerminalIsOpen] = useState(true)
  const headlineParts = data.profile.headline
    .split(/\s*\|\s*/)
    .filter(Boolean)
  const currentExperience = data.experience.find((item) => !item.period.end)
  const primarySkills = data.skills.flatMap((group) => group.skills).slice(0, 6)
  const emailLink = data.profile.email ? `mailto:${data.profile.email}` : null

  return (
    <SectionFrame
      id="modern-about"
      index="01"
      label="Profile / system entry"
      titleId="modern-about-title"
      className="modern-hero-section"
    >
      <div ref={heroGridRef} className="modern-hero-grid">
        <Reveal className="modern-hero-heading-wrap">
          <p className="modern-kicker">Portfolio of {data.profile.name}</p>
          <h1 id="modern-about-title" tabIndex={-1}>
            {headlineParts.map((part) => (
              <span key={part}>{part}</span>
            ))}
          </h1>
        </Reveal>

        <Reveal className="modern-hero-art" delay={90}>
          <PixelCanvas variant="hero" />
          <div className="modern-canvas-caption">
            <span>Generative signal</span>
            <span aria-hidden="true">LIVE</span>
          </div>
        </Reveal>

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
              <div className="modern-terminal-actions">
                {data.socialLinks.map((link) => (
                  <ExternalLink key={link.id} label={link.label} url={link.url} />
                ))}
                {emailLink && <ExternalLink label="Email" url={emailLink} />}
              </div>
            </WindowPanel>
          </Reveal>
        )}

        <Reveal className="modern-hero-widgets" delay={180}>
          {currentExperience && (
            <div className="modern-side-widget modern-side-widget--gold">
              <span className="modern-widget-key" aria-hidden="true">N</span>
              <div>
                <strong>Now building</strong>
                <span>{currentExperience.organization}</span>
              </div>
            </div>
          )}
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
