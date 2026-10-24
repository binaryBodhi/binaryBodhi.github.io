import { mediaQueries } from "../../shared/hooks/useMediaQuery"
import { useReducedMotion } from "../../shared/hooks/useReducedMotion"
import { getScrollOffset } from "../../shared/dom"
import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import type { PortfolioData } from "../../data/types"
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
import "./styles/widgets.css"
import "./styles/HeroSection.css"
import "./styles/sections.css"
import "./styles/ExperienceSection.css"
import "./styles/ProjectsSection.css"
import "./styles/SkillsSection.css"
import "./styles/AboutSection.css"
import "./styles/ContactSection.css"
import "./styles/responsive.css"

interface ModernPortfolioProps {
  data: PortfolioData
  onSwitchTheme: () => void
}

export function ModernPortfolio({ data, onSwitchTheme }: ModernPortfolioProps) {
  const reducedMotion = useReducedMotion()
  const [activeSection, setActiveSection] = useState<ModernSectionId>("modern-about")
  const [navigationIsOpen, setNavigationIsOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const pauseAtExperience = useCallback((from: number, to: number) => {
    if (to <= from || window.matchMedia(mediaQueries.compact).matches) return null
    const scrollRoot = mainRef.current
    const experience = scrollRoot?.querySelector<HTMLElement>("#modern-experience")
    if (!scrollRoot || !experience) return null

    const pinPosition = getScrollOffset(scrollRoot, experience)
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
      let nextSection: HTMLElement | undefined = sections.findLast((section) => section.getBoundingClientRect().top <= activationLine) ?? sections[0]

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

    scrollRoot.scrollTo({
      top: getScrollOffset(scrollRoot, section),
      behavior: reducedMotion ? "auto" : "smooth",
    })
    setActiveSection(sectionId)
  }

  const handleMainKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    const scrollRoot = event.currentTarget
    const pageDistance = scrollRoot.clientHeight * 0.9
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth"

    const actions = new Map<string, () => void>([
      ["Home", () => scrollRoot.scrollTo({ top: 0, behavior })],
      ["End", () => scrollRoot.scrollTo({ top: scrollRoot.scrollHeight, behavior })],
      ["PageUp", () => scrollRoot.scrollBy({ top: -pageDistance, behavior })],
      ["PageDown", () => scrollRoot.scrollBy({ top: pageDistance, behavior })],
      ["ArrowUp", () => scrollRoot.scrollBy({ top: -48, behavior })],
      ["ArrowDown", () => scrollRoot.scrollBy({ top: 48, behavior })],
    ])
    const action = actions.get(event.key)
    if (!action) return
    event.preventDefault()
    action()
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
            menuIsOpen={navigationIsOpen}
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
            <SkillsSection skills={data.skills} profile={data.profile} education={data.education} />
            <ContactSection profile={data.profile} socialLinks={data.socialLinks} />
          </main>
        </div>
      </div>
    </div>
  )
}
