import type { Project } from "../../../../data/types"
import { projectWheelSlots } from "./projectWheel"

const GRID = 33

// All drawings share a pixel grid, so each square can shrink, drift and grow
// into its counterpart without replacing the graphic or changing layout.
function pixelFor(id: string, x: number, y: number): boolean {
  if (id === "ai-code-bug-predictor") {
    const side = Math.abs(x - 16)
    const shell = side ** 2 / 49 + (y - 19) ** 2 / 81 <= 1 && side >= 1
    const head = side <= 4 && y >= 7 && y <= 11
    const antenna = y >= 3 && y <= 6 && Math.abs(side - (9 - y)) <= 0.7
    const legs = [13, 19, 25].some((row) => {
      if (side < 6 || side > 12) return false
      const bend = row === 19 ? 0 : (side - 6) * (row < 19 ? -0.65 : 0.65)
      return Math.abs(y - (row + bend)) <= 0.8
    })
    return shell || head || antenna || legs
  }
  if (id === "playlist-creation-service") {
    if ((x - 16) ** 2 + (y - 16) ** 2 > 14 ** 2) return false
    for (let line = 0; line < 3; line++) {
      const curve = 11 + line * 5 + (x - 14) ** 2 * 0.023
      if (x >= 7 + line && x <= 25 - line && Math.abs(y - curve) < 1.1) return false
    }
    return true
  }
  if (id === "tripwithme") {
    const wheel = ((x - 9) ** 2 + (y - 24) ** 2 <= 9 || (x - 25) ** 2 + (y - 24) ** 2 <= 9)
    const body = x >= 3 && x <= 30 && y >= 18 && y <= 23
    const roof = y >= 11 && y < 18 && x >= 10 - (y - 11) * 0.7 && x <= 22 + (y - 11) * 0.7
    const window = y >= 13 && y <= 16 && x >= 11 - (y - 13) * 0.6 && x <= 21 + (y - 13) * 0.6 && x !== 17
    return wheel || body || (roof && !window)
  }
  return false
}

export function ProjectMark({ projects, position, reducedMotion }: {
  projects: Project[]
  position: number
  reducedMotion: boolean
}) {
  const slots = projectWheelSlots(position, projects.length)
  return (
    <svg className="modern-project-mark" viewBox="0 0 264 264" aria-hidden="true" focusable="false">
      {Array.from({ length: GRID * GRID }, (_, index) => {
        const x = index % GRID
        const y = Math.floor(index / GRID)
        const strength = Math.min(1, slots.reduce((sum, slot) => sum + (pixelFor(projects[slot.index].id, x, y) ? slot.weight : 0), 0))
        if (strength <= 0.02) return null
        const scatter = reducedMotion ? 0 : Math.sin(strength * Math.PI)
        const size = 6.6 * strength
        const phase = y * 1.7 + x * 2.3
        return <rect key={index}
          x={x * 8 + (8 - size) / 2 + Math.sin(position * 2.2 + phase) * 1.44 * scatter}
          y={y * 8 + (8 - size) / 2 + Math.cos(position * 1.8 + phase) * 1.76 * scatter}
          width={size} height={size} />
      })}
    </svg>
  )
}
