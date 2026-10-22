import { getContactLinks } from "../../../shared/contactLinks"
import type { PortfolioData } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"

export function ContactSection({ profile, socialLinks }: Pick<PortfolioData, "profile" | "socialLinks">) {
  const links = getContactLinks(profile, socialLinks)

  return (
    <SectionFrame
      name="contact"
      index="06"
      label="Contact / next signal"
    >
      <div className="modern-contact-grid">
        <Reveal className="modern-contact-copy">
          <p className="modern-kicker">Let&apos;s connect</p>
          <h2 id="modern-contact-title">The next system starts with a conversation.</h2>
          {profile.availability && <p>{profile.availability}</p>}
          {profile.location && <p>{profile.location}</p>}
        </Reveal>

        <Reveal className="modern-contact-links" delay={80}>
          <p className="modern-mono-label">Channels</p>
          {links.map((link, index) => (
            <a
              key={link.url}
              href={link.url}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{link.label}</strong>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </Reveal>

        <Reveal className="modern-contact-art" delay={120}>
          <PixelCanvas variant="contact" />
        </Reveal>
      </div>

      <footer className="modern-footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Designed as two eras of the same interface</span>
        <strong aria-hidden="true">{profile.name}</strong>
      </footer>
    </SectionFrame>
  )
}
