export interface CanvasPalette {
  ink: string
  panel: string
  gold: string
  pink: string
  heroPaper: string
  artPaper: string
  markBackground?: string
  markForeground?: string
  markAccent?: string
}

export function readCanvasPalette(canvas: HTMLCanvasElement): CanvasPalette {
  const style = getComputedStyle(canvas)
  const read = (name: string) => style.getPropertyValue(`--modern-${name}`).trim()
  return {
    ink: read("ink"), panel: read("panel"), gold: read("accent-gold"), pink: read("accent-pink"),
    heroPaper: read("hero-paper"), artPaper: read("art-paper"),
    markBackground: read("mark-background") || undefined,
    markForeground: read("mark-foreground") || undefined,
    markAccent: read("mark-accent") || undefined,
  }
}

export function blendColor(from: string, to: string, progress: number) {
  const channels = (hex: string) => {
    // Production CSS minification can shorten #ffffff to #fff.
    const expanded = hex.length === 4 ? `#${[...hex.slice(1)].map((digit) => digit + digit).join("")}` : hex
    return [1, 3, 5].map((index) => Number.parseInt(expanded.slice(index, index + 2), 16))
  }
  const start = channels(from)
  const end = channels(to)
  return `rgb(${start.map((value, index) => Math.round(value + (end[index] - value) * progress)).join(", ")})`
}
