import { useState } from "react"
import { ScrambleLabel } from "./ScrambleLabel"

export function ThemeSwitchButton({ placement, onSwitch }: {
  placement: "mobile" | "desktop"
  onSwitch: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      className={`modern-theme-switch modern-theme-switch--${placement}`}
      type="button"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onSwitch}
    >
      <ScrambleLabel isActive={hovered} text="Retro Site" />
      <span className="modern-key" style={{ background: "var(--modern-accent-pink)" }} aria-hidden="true">R</span>
    </button>
  )
}
