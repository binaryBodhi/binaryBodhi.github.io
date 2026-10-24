import { drawLife } from "../games/drawLife"
import { MARK_MORPH_DURATION_MS } from "../../../../shared/animation"
import { smoothstep } from "../../../../shared/math"
import { blendColor } from "./palette"
import type { CanvasDrawer, PixelCanvasVariant } from "./types"

function pseudoRandom(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const drawTakeover: CanvasDrawer = (context, width, height, _time, options) => {
  context.clearRect(0, 0, width, height)

  const progress = Math.min(1, Math.max(0, options.progress()))
  if (progress === 0) return
  context.fillStyle = options.palette[options.takeoverColor()]
  if (progress === 1) {
    context.fillRect(0, 0, width, height)
    return
  }

  // Fine, scattered cells accumulate across the canvas background.
  // There is no directional curtain or movement of the content underneath.
  const cell = 3
  const columns = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (pseudoRandom(column, row) > progress) continue
      context.fillRect(column * cell, row * cell, cell, cell)
    }
  }
}

const glyphs: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  J: ["11111", "00010", "00010", "00010", "10010", "10010", "01100"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
}

const drawMark: CanvasDrawer = (context, width, height, time, options) => {
  const paletteProgress = Math.min(1, Math.max(0, options.progress()))
  const background = options.palette.markBackground ?? blendColor(options.palette.panel, options.palette.ink, paletteProgress)
  const foreground = options.palette.markForeground ?? blendColor(options.palette.ink, options.palette.artPaper, paletteProgress)
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  const fromGlyph = glyphs[options.fromMark] ?? glyphs.S
  const toGlyph = glyphs[options.mark] ?? glyphs.S
  const weightedGlyphs = Object.entries(options.markWeights() ?? {}).map(([mark, weight]) => ({
    glyph: glyphs[mark] ?? glyphs.S,
    weight,
  }))
  const rawProgress = Math.min(1, Math.max(0, (time - options.transitionStart) / MARK_MORPH_DURATION_MS))
  const progress = smoothstep(rawProgress)
  const cell = Math.max(3, Math.min(width / 8.5, height / 10.5))
  const originX = (width - cell * 5) / 2
  const originY = (height - cell * 7) / 2

  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const fromOn = fromGlyph[row][column] === "1" ? 1 : 0
      const toOn = toGlyph[row][column] === "1" ? 1 : 0
      const strength = weightedGlyphs.length > 0
        ? weightedGlyphs.reduce((sum, { glyph, weight }) => sum + Number(glyph[row][column]) * weight, 0)
        : fromOn + (toOn - fromOn) * progress
      if (strength <= 0.02) continue

      const scatter = weightedGlyphs.length > 0
        ? Math.sin(strength * Math.PI)
        : fromOn !== toOn ? Math.sin(progress * Math.PI) : 0
      const phase = row * 1.7 + column * 2.3
      const driftX = Math.sin(time * 0.0022 + phase) * cell * 0.18 * scatter
      const driftY = Math.cos(time * 0.0018 + phase) * cell * 0.22 * scatter
      const inset = Math.max(1, cell * 0.13)
      const size = Math.max(1, (cell - inset * 2) * strength)
      const x = originX + column * cell + cell / 2 - size / 2 + driftX
      const y = originY + row * cell + cell / 2 - size / 2 + driftY
      const isAccent = (row * 5 + column) % 17 === 0

      context.fillStyle = isAccent ? (options.palette.markAccent ?? options.palette.markForeground ?? options.palette.gold) : foreground
      context.fillRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size))
    }
  }
}

export const drawers = {
  hero: drawLife,
  mark: drawMark,
  takeover: drawTakeover,
} satisfies Record<PixelCanvasVariant, CanvasDrawer>

