import { getViewportRect, readElementRect } from "./shared/dom"
import { useRef, useState } from "react"
import { ModernPortfolio } from "./themes/modern/ModernPortfolio"
import { RetroPortfolio } from "./themes/retro/RetroPortfolio"
import { portfolioData } from "./data/data"
import {
  ThemeTransition,
  type ThemeTransitionRect,
} from "./components/theme-transition/ThemeTransition"

type Theme = "retro" | "modern"

interface ActiveTransition {
  destination: Theme
  sourceRect: ThemeTransitionRect
}

function measureThemeFrame(theme: Theme): ThemeTransitionRect {
  const selector = theme === "retro" ? ".retro-frame" : ".modern-shell"
  return readElementRect(selector) ?? getViewportRect()
}

function App() {
  const [theme, setTheme] = useState<Theme>("modern")
  const [activeTransition, setActiveTransition] =
    useState<ActiveTransition | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const transitionIsRunningRef = useRef(false)
  const isTransitioning = activeTransition !== null
  const destinationTheme = activeTransition?.destination
  const surfacePhase = isTransitioning
    ? theme === destinationTheme
      ? "incoming"
      : "outgoing"
    : "idle"

  const beginThemeTransition = (nextTheme: Theme) => {
    if (transitionIsRunningRef.current || nextTheme === theme) return

    transitionIsRunningRef.current = true
    setAnnouncement(`Switching to the ${nextTheme} portfolio.`)
    setActiveTransition({
      destination: nextTheme,
      sourceRect: measureThemeFrame(theme),
    })
  }

  const finishThemeTransition = () => {
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
  }
  const Portfolio = theme === "modern" ? ModernPortfolio : RetroPortfolio

  return (
    <div
      className="app"
      data-theme-phase={destinationTheme ? `transitioning-to-${destinationTheme}` : theme}
      aria-busy={isTransitioning}
    >
      <div
        className={`app-theme app-theme--${theme} app-theme--${surfacePhase}`}
        inert={isTransitioning}
        aria-hidden={isTransitioning ? true : undefined}
      >
        <Portfolio data={portfolioData} onSwitchTheme={() => beginThemeTransition(theme === "modern" ? "retro" : "modern")} />
      </div>

      {activeTransition && (
        <ThemeTransition
          direction={`to-${activeTransition.destination}`}
          sourceRect={activeTransition.sourceRect}
          onSwap={() => setTheme(activeTransition.destination)}
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
