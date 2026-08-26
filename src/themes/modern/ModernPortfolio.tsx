import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import type { PortfolioData } from "../../data/types"
import { ModernHeader } from "./ModernHeader"
import { modernNavigationItems } from "./modernNavigation"
import type { ModernSectionId } from "./modernNavigation"
import "./ModernPortfolio.css"

interface ModernPortfolioProps {
  data: PortfolioData
  onSwitchTheme: () => void
}

export function ModernPortfolio({ data, onSwitchTheme }: ModernPortfolioProps) {
  const [activeSection, setActiveSection] =
    useState<ModernSectionId>("modern-about")
  const [navigationIsOpen, setNavigationIsOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const scrollRoot = mainRef.current
    if (!scrollRoot) return

    const sections = modernNavigationItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    let animationFrame = 0
    const updateActiveSection = () => {
      animationFrame = 0
      const rootTop = scrollRoot.getBoundingClientRect().top
      const activationLine = rootTop + scrollRoot.clientHeight * 0.32
      let nextSection: HTMLElement | undefined = sections[0]

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          nextSection = section
        }
      }

      if (
        scrollRoot.scrollTop + scrollRoot.clientHeight >=
        scrollRoot.scrollHeight - 2
      ) {
        nextSection = sections.at(-1)
      }

      if (nextSection) setActiveSection(nextSection.id as ModernSectionId)
    }

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      scrollRoot.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [])

  const navigateToSection = (sectionId: ModernSectionId) => {
    const scrollRoot = mainRef.current
    const section = document.getElementById(sectionId)
    if (!scrollRoot || !section) return

    const rootRect = scrollRoot.getBoundingClientRect()
    const sectionRect = section.getBoundingClientRect()
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scrollRoot.scrollTo({
      top: scrollRoot.scrollTop + sectionRect.top - rootRect.top,
      behavior: reducedMotion ? "auto" : "smooth",
    })
    setActiveSection(sectionId)
  }

  const handleMainKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    const scrollRoot = event.currentTarget
    const pageDistance = scrollRoot.clientHeight * 0.9
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth"

    switch (event.key) {
      case "Home":
        event.preventDefault()
        scrollRoot.scrollTo({ top: 0, behavior })
        break
      case "End":
        event.preventDefault()
        scrollRoot.scrollTo({ top: scrollRoot.scrollHeight, behavior })
        break
      case "PageUp":
        event.preventDefault()
        scrollRoot.scrollBy({ top: -pageDistance, behavior })
        break
      case "PageDown":
        event.preventDefault()
        scrollRoot.scrollBy({ top: pageDistance, behavior })
        break
      case "ArrowUp":
        event.preventDefault()
        scrollRoot.scrollBy({ top: -48, behavior })
        break
      case "ArrowDown":
        event.preventDefault()
        scrollRoot.scrollBy({ top: 48, behavior })
        break
    }
  }

  return (
    <div className="modern-page">
      <a className="modern-skip-link" href="#modern-main">
        Skip to content
      </a>

      <div className="modern-shell">
        <ModernHeader
          activeSection={activeSection}
          name={data.profile.name}
          onMenuStateChange={setNavigationIsOpen}
          onNavigate={navigateToSection}
          onSwitchTheme={onSwitchTheme}
        />

        <main
          ref={mainRef}
          id="modern-main"
          className={`modern-main${navigationIsOpen ? " is-menu-locked" : ""}`}
          tabIndex={0}
          inert={navigationIsOpen}
          aria-label="Modern portfolio content"
          onKeyDown={handleMainKeyDown}
        >
          {modernNavigationItems.map((item, index) => (
            <section
              key={item.id}
              id={item.id}
              className="modern-shell-section"
              aria-labelledby={`${item.id}-title`}
            >
              <div className="modern-section-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="modern-section-placeholder">
                <p className="modern-section-label">Modern portfolio module</p>
                <h2 id={`${item.id}-title`} tabIndex={-1}>{item.label}</h2>
                {item.id === "modern-about" && (
                  <p className="modern-section-intro">{data.profile.headline}</p>
                )}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}
