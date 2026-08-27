import type { Profile, SocialLink } from "../../../data/types"
import { PixelCanvas } from "./PixelCanvas"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"

interface ContactSectionProps {
  profile: Profile
  socialLinks: SocialLink[]
}

export function ContactSection({ profile, socialLinks }: ContactSectionProps) {
  const links = [
    ...socialLinks.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      external: !link.url.startsWith("mailto:"),
    })),
    ...(profile.email
      ? [{ id: "email", label: "Email", url: `mailto:${profile.email}`, external: false }]
      : []),
  ]

  return (
    <SectionFrame
      id="modern-contact"
      index="06"
      label="Contact / next signal"
      titleId="modern-contact-title"
      className="modern-contact-section"
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
              key={link.id}
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
