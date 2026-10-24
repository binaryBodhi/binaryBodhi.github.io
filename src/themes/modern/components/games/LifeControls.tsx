import { useEffect, useRef, useState } from "react"
import type { LifeSettings } from "./gameOfLife"

interface LifeControlsProps {
  settings: LifeSettings
  onChange: (settings: LifeSettings) => void
}

const sliders = [
  { key: "generationsPerSecond", label: "Generations / second", max: 30, unit: "" },
  { key: "seedPercent", label: "Starting population", max: 50, unit: "%" },
] as const

export function LifeControls({ settings, onChange }: LifeControlsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)
  const infoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [hintIsVisible, setHintIsVisible] = useState(true)
  const [infoIsOpen, setInfoIsOpen] = useState(false)

  const dismissHint = () => {
    setHintIsVisible(false)
    summaryRef.current?.focus()
  }

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const details = detailsRef.current
      if (details && event.target instanceof Node && !details.contains(event.target)) details.open = false
    }
    document.addEventListener("pointerdown", closeOutside)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      clearTimeout(infoCloseTimerRef.current)
    }
  }, [])

  return (
    <>
      {hintIsVisible && (
        <aside className="modern-theme-hint modern-life-hint" aria-labelledby="modern-life-hint-title">
          <div className="modern-theme-hint-bar">
            <span>Try the controls</span>
            <button type="button" aria-label="Dismiss Game of Life hint" onClick={dismissHint}>×</button>
          </div>
          <div className="modern-theme-hint-body">
            <h2 id="modern-life-hint-title">Make a little chaos.</h2>
            <p>Change the speed or starting population and watch the pattern evolve.</p>
            <button type="button" onClick={() => {
              if (detailsRef.current) detailsRef.current.open = true
              dismissHint()
            }}>Try the controls ↗</button>
          </div>
        </aside>
      )}
      <details
        ref={detailsRef}
        className="modern-hero-canvas-caption"
        onToggle={(event) => {
          if (event.currentTarget.open) setHintIsVisible(false)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && detailsRef.current?.open) {
            event.preventDefault()
            detailsRef.current.open = false
            summaryRef.current?.focus()
          }
        }}
      >
        <summary ref={summaryRef}>
          <span>Conway’s Game of Life</span>
          <span
            className="modern-life-info"
            onPointerEnter={() => {
              clearTimeout(infoCloseTimerRef.current)
              setInfoIsOpen(true)
            }}
            onPointerLeave={() => {
              infoCloseTimerRef.current = setTimeout(() => setInfoIsOpen(false), 200)
            }}
            onFocus={() => setInfoIsOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setInfoIsOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation()
                setInfoIsOpen(false)
              }
            }}
          >
            <button type="button" aria-label="About Conway’s Game of Life" aria-expanded={infoIsOpen} aria-controls="modern-life-information" onClick={(event) => {
              event.preventDefault()
              setInfoIsOpen(true)
            }}>i</button>
            {infoIsOpen && (
              <span id="modern-life-information" className="modern-life-information">
                <span>Simple rules. Universal computation.</span>
                <span>The Game of Life is Turing complete: in theory, anything an algorithm can compute can also be computed here, using only patterns of living and dead cells.</span>
                <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank" rel="noreferrer">Read on Wikipedia ↗</a>
              </span>
            )}
          </span>
          <span className="modern-life-status">{settings.paused ? "PAUSED" : "LIVE"}</span>
          <svg aria-hidden="true" className="modern-life-chevron" viewBox="0 0 16 16" width="16" height="16">
            <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </summary>
        <div className="modern-life-dropdown">
          {sliders.map(({ key, label, max, unit }) => (
            <label key={key}>
              <span>{label}</span>
              <input
                type="range"
                min="1"
                max={max}
                value={settings[key]}
                onChange={(event) => onChange({ ...settings, [key]: Number(event.target.value) })}
              />
              <output>{settings[key]}{unit}</output>
            </label>
          ))}
          <p>Changing the population restarts the grid.</p>
          <div className="modern-life-actions">
            <button type="button" onClick={() => onChange({ ...settings, paused: !settings.paused })}>
              {settings.paused ? "Play" : "Pause"}
            </button>
            <button type="button" onClick={() => onChange({ ...settings, restartToken: settings.restartToken + 1 })}>
              Restart
            </button>
          </div>
        </div>
      </details>
    </>
  )
}
