import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import type { PortfolioData } from "../../data/types"
import { AboutSection } from "./components/AboutSection"
import { ContactSection } from "./components/ContactSection"
import { ExperienceSection } from "./components/ExperienceSection"
import { HeroSection } from "./components/HeroSection"
import { ProjectsSection } from "./components/ProjectsSection"
import { PixelCanvas } from "./components/PixelCanvas"
import { SkillsSection } from "./components/SkillsSection"
import { useInertialScroll } from "./components/useInertialScroll"
import { ModernHeader } from "./ModernHeader"
import { modernNavigationItems } from "./modernNavigation"
import type { ModernSectionId } from "./modernNavigation"
import "./ModernPortfolio.css"
import "./ModernSections.css"

interface ModernPortfolioProps {
  data: PortfolioData
  onSwitchTheme: () => void
}

export function ModernPortfolio({ data, onSwitchTheme }: ModernPortfolioProps) {
  const [activeSection, setActiveSection] = useState<ModernSectionId>("modern-about")
  const [navigationIsOpen, setNavigationIsOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const pauseAtExperience = useCallback((from: number, to: number) => {
    if (to <= from || window.matchMedia("(max-width: 767px)").matches) return null
    const scrollRoot = mainRef.current
    const experience = scrollRoot?.querySelector<HTMLElement>("#modern-experience")
    if (!scrollRoot || !experience) return null

    const pinPosition = scrollRoot.scrollTop + experience.getBoundingClientRect().top -
      scrollRoot.getBoundingClientRect().top
    // Browsers can round scrollTop below the fractional section position.
    // Once within the entrance's one-pixel tolerance, let the timeline advance.
    return from < pinPosition - 1 && to >= pinPosition ? pinPosition : null
  }, [])
  const stopScrollInertia = useInertialScroll(mainRef, navigationIsOpen, pauseAtExperience)
  const [takeover, setTakeover] = useState({ progress: 0, visible: false, complete: false })
  const handleTakeoverChange = useCallback((progress: number, visible: boolean) => {
    setTakeover((current) => current.progress === progress && current.visible === visible
      ? current
      : { progress, visible, complete: current.complete && progress === 1 })
  }, [])
  const handleTakeoverComplete = useCallback(() => {
    setTakeover((current) => current.visible && current.progress === 1 && !current.complete
      ? { ...current, complete: true }
      : current)
  }, [])

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
    stopScrollInertia()
    const scrollRoot = mainRef.current
    const section = document.getElementById(sectionId)
    if (!scrollRoot || !section) return

    const rootRect = scrollRoot.getBoundingClientRect()
    const sectionRect = section.getBoundingClientRect()
    const navigationOffset = Number(section.dataset.navigationOffset ?? 0)
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scrollRoot.scrollTo({
      top: scrollRoot.scrollTop + sectionRect.top - rootRect.top + navigationOffset,
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
      <PixelCanvas
        className="modern-page-takeover"
        variant="takeover"
        progress={takeover.visible ? takeover.progress : 0}
        onComplete={handleTakeoverComplete}
      />
      <a className="modern-skip-link" href="#modern-main">
        Skip to content
      </a>

      <div className="modern-shell">
        <div className="modern-header-shell">
          <ModernHeader
            activeSection={activeSection}
            name={data.profile.name}
            onMenuStateChange={setNavigationIsOpen}
            onNavigate={navigateToSection}
            onSwitchTheme={onSwitchTheme}
          />
        </div>

        <div className="modern-main-shell">
          <main
            ref={mainRef}
            id="modern-main"
            className={`modern-main${navigationIsOpen ? " is-menu-locked" : ""}`}
            tabIndex={0}
            inert={navigationIsOpen}
            aria-label="Modern portfolio content"
            onKeyDown={handleMainKeyDown}
          >
            <div className="modern-about-experience-flow">
              <HeroSection data={data} />
              <ExperienceSection
                experience={data.experience}
                onEntranceStart={stopScrollInertia}
                onTakeoverChange={handleTakeoverChange}
                takeoverComplete={takeover.complete}
              />
            </div>
            <ProjectsSection projects={data.projects ?? []} />
            <SkillsSection skills={data.skills} />
            <AboutSection education={data.education} profile={data.profile} />
            <ContactSection profile={data.profile} socialLinks={data.socialLinks} />
          </main>
        </div>
      </div>
    </div>
  )
}
