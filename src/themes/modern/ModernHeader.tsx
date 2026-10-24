import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, MouseEvent } from "react"
import { ScrambleLabel } from "./components/ScrambleLabel"
import { ThemeSwitchButton } from "./components/ThemeSwitchButton"
import { mediaQueries } from "../../shared/hooks/useMediaQuery"
import { modernNavigationItems } from "./modernNavigation"
import { getInitials } from "../../shared/text"
import type { ModernSectionId } from "./modernNavigation"

interface ModernHeaderProps {
  activeSection: ModernSectionId
  menuIsOpen: boolean
  name: string
  onMenuStateChange: (isOpen: boolean) => void
  onNavigate: (sectionId: ModernSectionId) => void
  onSwitchTheme?: () => void
}

export function ModernHeader({
  activeSection,
  menuIsOpen,
  name,
  onMenuStateChange,
  onNavigate,
  onSwitchTheme,
}: ModernHeaderProps) {
  const [scrambleTarget, setScrambleTarget] = useState<string | null>(null)
  const [themeHintIsVisible, setThemeHintIsVisible] = useState(true)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navigationRef = useRef<HTMLElement>(null)
  const restoreFocusFrameRef = useRef(0)

  const closeMenu = useCallback((restoreFocus = false) => {
    onMenuStateChange(false)
    if (restoreFocus) {
      window.cancelAnimationFrame(restoreFocusFrameRef.current)
      restoreFocusFrameRef.current = window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }, [onMenuStateChange])

  useEffect(() => () => window.cancelAnimationFrame(restoreFocusFrameRef.current), [])

  useEffect(() => {
    if (!menuIsOpen) return

    const focusFrame = window.requestAnimationFrame(() => {
      navigationRef.current?.querySelector<HTMLAnchorElement>("a")?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuIsOpen, onMenuStateChange, closeMenu])

  useEffect(() => {
    const desktopQuery = window.matchMedia(mediaQueries.desktop)
    const closeMenuAtDesktopSize = (event: MediaQueryListEvent) => {
      if (!event.matches) return

      const focusIsInMenu = navigationRef.current?.contains(document.activeElement)
      onMenuStateChange(false)
      if (focusIsInMenu) navigationRef.current?.querySelector<HTMLAnchorElement>("a")?.focus()
    }

    desktopQuery.addEventListener("change", closeMenuAtDesktopSize)
    return () => desktopQuery.removeEventListener("change", closeMenuAtDesktopSize)
  }, [onMenuStateChange])

  const handleNavigation = (sectionId: ModernSectionId) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    closeMenu(menuIsOpen)
    onNavigate(sectionId)
  }

  return (
    <header className="modern-header">
      <a
        className="modern-brand"
        href="#modern-about"
        aria-label={`${name} — back to About`}
        onClick={handleNavigation("modern-about")}
      >
        <span className="modern-brand-mark" aria-hidden="true">
          {getInitials(name)}
        </span>
        <span className="modern-brand-name">{name}</span>
      </a>

      <button
        ref={menuButtonRef}
        className="modern-menu-button"
        type="button"
        aria-expanded={menuIsOpen}
        aria-controls="modern-navigation"
        onClick={() => (menuIsOpen ? closeMenu() : onMenuStateChange(true))}
      >
        {menuIsOpen ? "Close" : "Menu"}
      </button>

      <nav
        ref={navigationRef}
        id="modern-navigation"
        className={`modern-navigation${menuIsOpen ? " is-open" : ""}`}
        aria-label="Modern portfolio navigation"
      >
        {modernNavigationItems.filter((item) => item.id !== "modern-about").map((item, index) => (
          <a
            key={item.id}
            className="modern-nav-link"
            style={{ "--modern-nav-index": index } as CSSProperties}
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? "location" : undefined}
            onPointerEnter={() => setScrambleTarget(item.id)}
            onPointerLeave={() => setScrambleTarget(null)}
            onClick={handleNavigation(item.id)}
          >
            <span
              className="modern-key"
              style={{ background: `var(--modern-accent-${item.accent})` }}
              aria-hidden="true"
            >
              {item.key}
            </span>
            <ScrambleLabel
              isActive={scrambleTarget === item.id}
              text={item.label}
            />
          </a>
        ))}

        {onSwitchTheme && <ThemeSwitchButton placement="mobile" onSwitch={onSwitchTheme} />}
      </nav>

      {onSwitchTheme && <ThemeSwitchButton placement="desktop" onSwitch={onSwitchTheme} />}
      {onSwitchTheme && themeHintIsVisible && !menuIsOpen && (
        <aside className="modern-theme-hint" aria-labelledby="modern-theme-hint-title">
          <div className="modern-theme-hint-bar">
            <span>R / Alternate view</span>
            <button type="button" aria-label="Dismiss retro site hint" onClick={() => setThemeHintIsVisible(false)}>×</button>
          </div>
          <div className="modern-theme-hint-body">
            <h2 id="modern-theme-hint-title">A little more retro.</h2>
            <p>Same developer. A different era.</p>
            <button type="button" onClick={onSwitchTheme}>Explore retro site ↗</button>
          </div>
        </aside>
      )}
    </header>
  )
}
