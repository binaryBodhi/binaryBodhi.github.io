import { useCallback, useRef, useState } from "react"
import { ModernPortfolio } from "./themes/modern/ModernPortfolio"
import { RetroPortfolio } from "./themes/retro/RetroPortfolio"
import { portfolioData } from "./data/data"
import {
  ThemeTransition,
  type ThemeTransitionDirection,
  type ThemeTransitionRect,
} from "./components/theme-transition/ThemeTransition"

type Theme = "retro" | "modern"

interface ActiveTransition {
  direction: ThemeTransitionDirection
  sourceRect: ThemeTransitionRect
}

function measureThemeFrame(theme: Theme): ThemeTransitionRect {
  const selector = theme === "retro" ? ".retro-frame" : ".modern-shell"
  const frame = document.querySelector<HTMLElement>(selector)
  const rect = frame?.getBoundingClientRect()

  if (!rect) {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>("retro")
  const [activeTransition, setActiveTransition] =
    useState<ActiveTransition | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const transitionIsRunningRef = useRef(false)
  const isTransitioning = activeTransition !== null
  const destinationTheme = activeTransition?.direction === "to-modern"
    ? "modern"
    : activeTransition?.direction === "to-retro"
      ? "retro"
      : null
  const surfacePhase = isTransitioning
    ? theme === destinationTheme
      ? "incoming"
      : "outgoing"
    : "idle"

  const beginThemeTransition = useCallback((nextTheme: Theme) => {
    if (transitionIsRunningRef.current || nextTheme === theme) return

    transitionIsRunningRef.current = true
    setAnnouncement(`Switching to the ${nextTheme} portfolio.`)
    setActiveTransition({
      direction: nextTheme === "modern" ? "to-modern" : "to-retro",
      sourceRect: measureThemeFrame(theme),
    })
  }, [theme])

  const finishThemeTransition = useCallback(() => {
    const completedTheme = destinationTheme ?? "retro"
    setActiveTransition(null)
    transitionIsRunningRef.current = false
    setAnnouncement(`${completedTheme === "modern" ? "Modern" : "Retro"} portfolio ready.`)

    window.requestAnimationFrame(() => {
      const focusTargetId = completedTheme === "modern"
        ? "modern-about-title"
        : "retro-name"
      document.getElementById(focusTargetId)?.focus({ preventScroll: true })
    })
  }, [destinationTheme])

  const swapThemeUnderTransition = useCallback(() => {
    if (!activeTransition) return

    setTheme(activeTransition.direction === "to-modern" ? "modern" : "retro")
  }, [activeTransition])

  return (
    <div
      className="app"
      data-theme-phase={
        activeTransition
          ? activeTransition.direction === "to-modern"
            ? "transitioning-to-modern"
            : "transitioning-to-retro"
          : theme
      }
      aria-busy={isTransitioning}
    >
      <div
        className={`app-theme app-theme--${theme} app-theme--${surfacePhase}`}
        inert={isTransitioning}
        aria-hidden={isTransitioning ? true : undefined}
      >
        {theme === "modern" ? (
          <ModernPortfolio
            data={portfolioData}
            onSwitchTheme={() => beginThemeTransition("retro")}
          />
        ) : (
          <RetroPortfolio
            data={portfolioData}
            onSwitchTheme={() => beginThemeTransition("modern")}
          />
        )}
      </div>

      {activeTransition && (
        <ThemeTransition
          direction={activeTransition.direction}
          sourceRect={activeTransition.sourceRect}
          onSwap={swapThemeUnderTransition}
          onComplete={finishThemeTransition}
        />
      )}

      <p className="app-visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
}

export default App
