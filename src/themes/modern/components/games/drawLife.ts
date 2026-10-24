import { createLifeGrid, stepLifeGrid } from "./gameOfLife"
import type { CanvasDrawer } from "../canvas/types"

export const drawLife: CanvasDrawer = (context, width, height, time, options) => {
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
