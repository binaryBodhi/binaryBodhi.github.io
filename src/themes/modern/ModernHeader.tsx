import { useCallback, useEffect, useRef, useState } from "react"
import { modernNavigationItems } from "./modernNavigation"
import type { ModernSectionId } from "./modernNavigation"

interface ModernHeaderProps {
  activeSection: ModernSectionId
  name: string
  onMenuStateChange?: (isOpen: boolean) => void
  onNavigate: (sectionId: ModernSectionId) => void
  onSwitchTheme?: () => void
}

const scrambleCharacters = "<>/[]{}01*+#"
const scrambleFrameDuration = 34
const scrambleExtension = 350

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function ScrambleLabel({ isActive, text }: { isActive: boolean; text: string }) {
  const [visibleText, setVisibleText] = useState(text)
  const animationRef = useRef<number | null>(null)

  const startAnimation = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    if (animationRef.current !== null) window.clearInterval(animationRef.current)

    const previousDuration =
      Math.ceil(text.length / 0.55) * scrambleFrameDuration
    const extendedDuration = previousDuration + scrambleExtension
    const totalFrames = Math.max(
      1,
      Math.ceil(extendedDuration / scrambleFrameDuration),
    )
    const charactersPerFrame = text.length / totalFrames
    let resolvedCharacters = 0
    animationRef.current = window.setInterval(() => {
      resolvedCharacters += charactersPerFrame
      setVisibleText(
        [...text]
          .map((character, index) => {
            if (character === " " || index < resolvedCharacters) return character
            return scrambleCharacters[
              Math.floor(Math.random() * scrambleCharacters.length)
            ]
          })
          .join(""),
      )

      if (resolvedCharacters >= text.length) {
        window.clearInterval(animationRef.current ?? undefined)
        animationRef.current = null
        setVisibleText(text)
      }
    }, scrambleFrameDuration)
  }, [text])

  useEffect(() => {
    if (!isActive) return

    startAnimation()

    return () => {
      if (animationRef.current !== null) {
        window.clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isActive, startAnimation])

  return (
    <>
      <span
        className="modern-scramble-label"
        aria-hidden="true"
      >
        {isActive ? visibleText : text}
      </span>
      <span className="modern-visually-hidden">{text}</span>
    </>
  )
}

export function ModernHeader({
  activeSection,
  name,
  onMenuStateChange,
  onNavigate,
  onSwitchTheme,
}: ModernHeaderProps) {
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [scrambleTarget, setScrambleTarget] = useState<string | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navigationRef = useRef<HTMLElement>(null)

  const closeMenu = (restoreFocus = false) => {
    setMenuIsOpen(false)
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }

  useEffect(() => {
    onMenuStateChange?.(menuIsOpen)

    if (!menuIsOpen) return

    const focusFrame = window.requestAnimationFrame(() => {
      navigationRef.current?.querySelector<HTMLAnchorElement>("a")?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuIsOpen(false)
        window.requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuIsOpen, onMenuStateChange])

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)")
    const closeMenuAtDesktopSize = (event: MediaQueryListEvent) => {
      if (!event.matches) return

      const focusIsInMenu = navigationRef.current?.contains(document.activeElement)
      setMenuIsOpen(false)
      if (focusIsInMenu) menuButtonRef.current?.focus()
    }

    desktopQuery.addEventListener("change", closeMenuAtDesktopSize)
    return () => desktopQuery.removeEventListener("change", closeMenuAtDesktopSize)
  }, [])

  const handleNavigation = (sectionId: ModernSectionId) => {
    const shouldRestoreFocus = menuIsOpen
    setMenuIsOpen(false)
    onNavigate(sectionId)
    if (shouldRestoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }

  return (
    <header className="modern-header">
      <a
        className="modern-brand"
        href="#modern-about"
        aria-label={`${name} — back to About`}
        onClick={(event) => {
          event.preventDefault()
          handleNavigation("modern-about")
        }}
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
        onClick={() => (menuIsOpen ? closeMenu() : setMenuIsOpen(true))}
      >
        {menuIsOpen ? "Close" : "Menu"}
      </button>

      <nav
        ref={navigationRef}
        id="modern-navigation"
        className={`modern-navigation${menuIsOpen ? " is-open" : ""}`}
        aria-label="Modern portfolio navigation"
      >
        {modernNavigationItems.map((item) => (
          <a
            key={item.id}
            className="modern-nav-link"
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? "location" : undefined}
            onPointerEnter={() => setScrambleTarget(item.id)}
            onPointerLeave={() => setScrambleTarget(null)}
            onClick={(event) => {
              event.preventDefault()
              handleNavigation(item.id)
            }}
          >
            <span
              className={`modern-key modern-key--${item.accent}`}
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

        {onSwitchTheme && (
          <button
            className="modern-theme-switch modern-theme-switch--mobile"
            type="button"
            onPointerEnter={() => setScrambleTarget("retro-mobile")}
            onPointerLeave={() => setScrambleTarget(null)}
            onClick={onSwitchTheme}
          >
            <ScrambleLabel
              isActive={scrambleTarget === "retro-mobile"}
              text="Retro Site"
            />
            <span className="modern-key modern-key--pink" aria-hidden="true">
              R
            </span>
          </button>
        )}
      </nav>

      {onSwitchTheme && (
        <button
          className="modern-theme-switch modern-theme-switch--desktop"
          type="button"
          onPointerEnter={() => setScrambleTarget("retro-desktop")}
          onPointerLeave={() => setScrambleTarget(null)}
          onClick={onSwitchTheme}
        >
          <ScrambleLabel
            isActive={scrambleTarget === "retro-desktop"}
            text="Retro Site"
          />
          <span className="modern-key modern-key--pink" aria-hidden="true">
            R
          </span>
        </button>
      )}
    </header>
  )
}
