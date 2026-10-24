import { createLifeGrid, stepLifeGrid } from "../gameOfLife"
import { MARK_MORPH_DURATION_MS } from "../../../../shared/animation"
import { smoothstep } from "../../../../shared/math"
import { blendColor } from "./palette"
import type { DrawOptions, PixelCanvasVariant } from "./types"

type CanvasDrawer = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  options: DrawOptions,
) => void

function pseudoRandom(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const drawHero: CanvasDrawer = (context, width, height, time, options) => {
  const cell = Math.max(7, Math.min(13, Math.floor(width / 42)))
  const columns = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)
  const settings = options.lifeSettings()
  if (!options.life || options.life.columns !== columns || options.life.rows !== rows
    || options.life.seedPercent !== settings.seedPercent || options.life.restartToken !== settings.restartToken) {
    options.life = {
      columns,
      rows,
      cells: createLifeGrid(columns, rows, settings.seedPercent),
      next: new Uint8Array(columns * rows),
      lastStepTime: time,
      seedPercent: settings.seedPercent,
      restartToken: settings.restartToken,
      paused: settings.paused,
      generationsPerSecond: settings.generationsPerSecond,
    }
  }
  const life = options.life
  if (life.paused !== settings.paused || life.generationsPerSecond !== settings.generationsPerSecond) {
    life.lastStepTime = time
    life.paused = settings.paused
    life.generationsPerSecond = settings.generationsPerSecond
  }
  // Resume with one step after an offscreen pause rather than rushing to catch up.
  if (!settings.paused && time - life.lastStepTime >= 1000 / settings.generationsPerSecond) {
    stepLifeGrid(life.cells, life.next, columns, rows)
    const previous = life.cells
    life.cells = life.next
    life.next = previous
    life.lastStepTime = time
  }

  context.fillStyle = options.palette.heroPaper
  context.fillRect(0, 0, width, height)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (life.cells[row * columns + column] === 0) continue

      const accent = (column + row) % 17 === 0
      context.fillStyle = accent ? options.palette.gold : options.palette.ink
      const inset = accent ? 1 : Math.max(1, Math.floor(cell * 0.16))
      context.fillRect(
        column * cell + inset,
        row * cell + inset,
        cell - inset * 2,
        cell - inset * 2,
      )
    }
  }
}

const drawTakeover: CanvasDrawer = (context, width, height, _time, options) => {
  context.clearRect(0, 0, width, height)

  const progress = Math.min(1, Math.max(0, options.progress()))
  if (progress === 0) return
  context.fillStyle = options.palette.ink
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
  const background = blendColor(options.palette.panel, options.palette.ink, paletteProgress)
  const foreground = blendColor(options.palette.ink, options.palette.artPaper, paletteProgress)
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

      context.fillStyle = isAccent ? options.palette.gold : foreground
      context.fillRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size))
    }
  }
}

export const drawers = {
  hero: drawHero,
  mark: drawMark,
  takeover: drawTakeover,
} satisfies Record<PixelCanvasVariant, CanvasDrawer>

