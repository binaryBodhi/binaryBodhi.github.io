export interface CanvasPalette {
  ink: string
  panel: string
  gold: string
  blue: string
  green: string
  pink: string
  heroPaper: string
  artPaper: string
}

export function readCanvasPalette(canvas: HTMLCanvasElement): CanvasPalette {
  const style = getComputedStyle(canvas)
  const read = (name: string) => style.getPropertyValue(`--modern-${name}`).trim()
  return {
    ink: read("ink"), panel: read("panel"), gold: read("accent-gold"),
    blue: read("accent-blue"), green: read("accent-green"), pink: read("accent-pink"),
    heroPaper: read("hero-paper"), artPaper: read("art-paper"),
  }
}

export function blendColor(from: string, to: string, progress: number) {
  const channels = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
  const start = channels(from)
  const end = channels(to)
  return `rgb(${start.map((value, index) => Math.round(value + (end[index] - value) * progress)).join(", ")})`
}
