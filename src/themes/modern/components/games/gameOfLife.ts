export interface LifeSettings {
  generationsPerSecond: number
  seedPercent: number
  paused: boolean
  restartToken: number
}

export const DEFAULT_LIFE_SETTINGS: LifeSettings = {
  generationsPerSecond: 8,
  seedPercent: 13,
  paused: false,
  restartToken: 0,
}

/** A seeded starting population; subsequent generations follow B3/S23. */
export function createLifeGrid(columns: number, rows: number, seedPercent = DEFAULT_LIFE_SETTINGS.seedPercent) {
  const cells = new Uint8Array(columns * rows)
  let seed = 0x1a2b3c4d
  for (let index = 0; index < cells.length; index += 1) {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    cells[index] = (seed >>> 0) / 0x100000000 < seedPercent / 100 ? 1 : 0
  }
  return cells
}

/** Advance simultaneously on a grid whose opposite edges wrap around. */
export function stepLifeGrid(
  cells: Uint8Array,
  next: Uint8Array,
  columns: number,
  rows: number,
) {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      let neighbors = 0
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue
          const x = (column + dx + columns) % columns
          const y = (row + dy + rows) % rows
          neighbors += cells[y * columns + x]
        }
      }
      const index = row * columns + column
      next[index] = neighbors === 3 || (cells[index] === 1 && neighbors === 2) ? 1 : 0
    }
  }
}
