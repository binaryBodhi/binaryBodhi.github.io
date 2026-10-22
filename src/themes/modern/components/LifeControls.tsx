import { useEffect, useRef } from "react"
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

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const details = detailsRef.current
      if (details && event.target instanceof Node && !details.contains(event.target)) details.open = false
    }
    document.addEventListener("pointerdown", closeOutside)
    return () => document.removeEventListener("pointerdown", closeOutside)
  }, [])

  return (
    <details
      ref={detailsRef}
      className="modern-hero-canvas-caption"
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
        <span className="modern-life-status">{settings.paused ? "PAUSED" : "LIVE"}</span>
        <span aria-hidden="true" className="modern-life-chevron">⌄</span>
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
  )
}
