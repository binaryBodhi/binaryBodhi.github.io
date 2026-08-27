import { useEffect, useRef } from "react"
import { useReducedMotion } from "./useReducedMotion"

export type PixelCanvasVariant =
  | "hero"
  | "mesh"
  | "mark"
  | "skills"
  | "contact"
  | "takeover"

interface PixelCanvasProps {
  className?: string
  mark?: string
  progress?: number
  variant: PixelCanvasVariant
}

interface DrawOptions {
  fromMark: string
  mark: string
  progress: () => number
  transitionStart: number
}

function pseudoRandom(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function drawHero(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  const cell = Math.max(7, Math.min(13, Math.floor(width / 42)))
  const columns = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)
  const centerX = columns * 0.55 + Math.sin(time * 0.00035) * columns * 0.1
  const centerY = rows * 0.46 + Math.cos(time * 0.00028) * rows * 0.08

  context.fillStyle = "#f8f8f5"
  context.fillRect(0, 0, width, height)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const distance = Math.hypot(column - centerX, row - centerY)
      const wave = Math.sin(distance * 0.82 - time * 0.0022)
      const noise = pseudoRandom(column, row)
      const threshold = 0.3 + noise * 0.48
      if (wave < threshold) continue

      const accent = (column + row) % 17 === 0
      context.fillStyle = accent ? "#c6a348" : "#111111"
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

function drawMesh(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  context.clearRect(0, 0, width, height)

  const points: Array<{ accent: boolean; x: number; y: number; z: number }> = []
  const columns = Math.max(34, Math.min(62, Math.round(width / 9)))
  const rows = Math.max(28, Math.min(52, Math.round(height / 10)))
  const rotationY = time * 0.00026
  const rotationX = -0.22 + Math.sin(time * 0.00019) * 0.09
  const cosineY = Math.cos(rotationY)
  const sineY = Math.sin(rotationY)
  const cosineX = Math.cos(rotationX)
  const sineX = Math.sin(rotationX)
  const scale = Math.min(width, height) * 0.46

  const project = (
    x: number,
    y: number,
    z: number,
    row: number,
    column: number,
    face: number,
  ) => {
    const crawl = Math.sin(time * 0.0018 + row * 0.43 + column * 0.29 + face) * 0.018
    const rotatedX = x * cosineY - z * sineY
    const rotatedZ = x * sineY + z * cosineY
    const rotatedY = (y + crawl) * cosineX - rotatedZ * sineX
    const depth = (y + crawl) * sineX + rotatedZ * cosineX
    const perspective = 2.8 / (3.1 - depth)

    points.push({
      accent: (row * 11 + column * 7 + face * 5) % 79 === 0,
      x: width * 0.51 + rotatedX * scale * perspective,
      y: height * 0.51 + rotatedY * scale * perspective,
      z: perspective,
    })
  }

  for (let row = 0; row < rows; row += 1) {
    const v = row / Math.max(1, rows - 1)
    for (let column = 0; column < columns; column += 1) {
      const u = column / Math.max(1, columns - 1)
      const x = (u - 0.5) * 1.7
      const y = (v - 0.5) * 1.28
      const faceWave = Math.sin(u * Math.PI * 4 + time * 0.0011) * 0.035

      project(x, y, 0.46 + faceWave, row, column, 0)

      if (row < Math.round(rows * 0.34)) {
        const topV = row / Math.max(1, Math.round(rows * 0.34) - 1)
        project(x, -0.64, 0.46 - topV * 0.88, row, column, 1)
      }

      if (column < Math.round(columns * 0.24)) {
        const sideU = column / Math.max(1, Math.round(columns * 0.24) - 1)
        project(0.85, y, 0.46 - sideU * 0.88, row, column, 2)
      }
    }
  }

  points.sort((a, b) => a.z - b.z)
  for (const point of points) {
    const size = Math.max(1.1, Math.min(3.1, point.z * 2.25))
    context.fillStyle = point.accent ? "#c6a348" : "rgba(248, 248, 245, 0.92)"
    context.fillRect(point.x, point.y, size, size)
  }
}

function drawTakeover(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time: number,
  options: DrawOptions,
) {
  context.clearRect(0, 0, width, height)

  const progress = Math.min(1, Math.max(0, options.progress()))
  const cell = Math.max(10, Math.min(18, Math.round(width / 76)))
  const columns = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)

  context.fillStyle = "#111111"
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const distanceFromRight = (columns - 1 - column) / Math.max(1, columns - 1)
      const staticNoise = pseudoRandom(column * 1.73, row * 0.91) - 0.5
      const rowWave = Math.sin(row * 0.47 + column * 0.13) * 0.045
      const activation = Math.min(
        0.88,
        Math.max(
          0.015,
          0.025 + distanceFromRight * 0.82 + staticNoise * 0.18 + rowWave,
        ),
      )
      const strength = Math.min(1, Math.max(0, (progress - activation) * 14))
      if (strength <= 0) continue

      const size = cell * strength
      const inset = (cell - size) / 2
      context.fillRect(
        column * cell + inset,
        row * cell + inset,
        size,
        size,
      )
    }
  }
}

const glyphs: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  J: ["11111", "00010", "00010", "00010", "10010", "10010", "01100"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
}

function drawMark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  options: DrawOptions,
) {
  context.fillStyle = "#111111"
  context.fillRect(0, 0, width, height)

  const fromGlyph = glyphs[options.fromMark] ?? glyphs.S
  const toGlyph = glyphs[options.mark] ?? glyphs.S
  const rawProgress = Math.min(1, Math.max(0, (time - options.transitionStart) / 720))
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress)
  const cell = Math.max(3, Math.min(width / 8.5, height / 10.5))
  const originX = (width - cell * 5) / 2
  const originY = (height - cell * 7) / 2

  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const fromOn = fromGlyph[row][column] === "1" ? 1 : 0
      const toOn = toGlyph[row][column] === "1" ? 1 : 0
      const strength = fromOn + (toOn - fromOn) * progress
      if (strength <= 0.02) continue

      const changing = fromOn !== toOn
      const scatter = changing ? Math.sin(progress * Math.PI) : 0
      const phase = row * 1.7 + column * 2.3
      const driftX = Math.sin(time * 0.0022 + phase) * cell * 0.18 * scatter
      const driftY = Math.cos(time * 0.0018 + phase) * cell * 0.22 * scatter
      const inset = Math.max(1, cell * 0.13)
      const size = Math.max(1, (cell - inset * 2) * strength)
      const x = originX + column * cell + cell / 2 - size / 2 + driftX
      const y = originY + row * cell + cell / 2 - size / 2 + driftY
      const isAccent = (row * 5 + column) % 17 === 0

      context.fillStyle = isAccent ? "#c6a348" : "#f8f8f5"
      context.fillRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size))
    }
  }
}

function drawSkills(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  context.fillStyle = "#aebbaa"
  context.fillRect(0, 0, width, height)
  context.strokeStyle = "#111111"
  context.lineWidth = 1

  const rows = 8
  const columns = 10
  const cellWidth = width / columns
  const cellHeight = height / rows

  for (let row = 0; row < rows; row += 1) {
    context.beginPath()
    for (let column = 0; column < columns; column += 1) {
      const x = column * cellWidth + cellWidth * 0.5
      const pulse = Math.sin(time * 0.0014 + row * 0.8 + column * 0.45)
      const y = row * cellHeight + cellHeight * 0.5 + pulse * cellHeight * 0.18
      if (column === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.stroke()
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if ((row * 3 + column * 5) % 7 !== 0) continue
      const x = column * cellWidth + cellWidth * 0.5
      const y = row * cellHeight + cellHeight * 0.5
      context.fillStyle = (row + column) % 3 === 0 ? "#91a2c7" : "#111111"
      context.fillRect(x - 3, y - 3, 6, 6)
    }
  }
}

function drawContact(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  context.fillStyle = "#d8becd"
  context.fillRect(0, 0, width, height)

  const cell = Math.max(8, Math.floor(width / 36))
  const baseline = height * 0.64
  const columns = Math.ceil(width / cell)

  for (let column = 0; column < columns; column += 1) {
    const wave = Math.sin(column * 0.48 + time * 0.0012)
    const secondary = Math.sin(column * 0.19 - time * 0.0008)
    const towerHeight = Math.max(1, Math.round(4 + wave * 2 + secondary * 3))

    for (let row = 0; row < towerHeight; row += 1) {
      const highlight = (column + row) % 11 === 0
      context.fillStyle = highlight ? "#c6a348" : "#111111"
      context.fillRect(
        column * cell,
        baseline - row * cell,
        cell - 2,
        cell - 2,
      )
    }
  }
}

const drawers = {
  hero: drawHero,
  mark: drawMark,
  mesh: drawMesh,
  skills: drawSkills,
  contact: drawContact,
  takeover: drawTakeover,
} satisfies Record<
  PixelCanvasVariant,
  (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    options: DrawOptions,
  ) => void
>

export function PixelCanvas({
  className = "",
  mark = "S",
  progress = 1,
  variant,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previousMarkRef = useRef(mark.toUpperCase().slice(0, 1))
  const progressRef = useRef(progress)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    let frame = 0
    let isVisible = true
    let width = 0
    let height = 0
    let disposed = false
    let lastTakeoverProgress = -1
    const nextMark = mark.toUpperCase().slice(0, 1) || "S"
    const drawOptions: DrawOptions = {
      fromMark: previousMarkRef.current,
      mark: nextMark,
      progress: () => progressRef.current,
      transitionStart: window.performance.now(),
    }
    previousMarkRef.current = nextMark

    const render = (time: number) => {
      if (disposed || !isVisible) return
      const renderTime = reducedMotion ? drawOptions.transitionStart + 720 : time
      const currentProgress = drawOptions.progress()
      if (variant !== "takeover" || currentProgress !== lastTakeoverProgress) {
        drawers[variant](context, width, height, renderTime, drawOptions)
        lastTakeoverProgress = currentProgress
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(render)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      drawers[variant](context, width, height, drawOptions.transitionStart, drawOptions)
    }

    const start = () => {
      window.cancelAnimationFrame(frame)
      if (isVisible) frame = window.requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      start()
    })
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) start()
        else window.cancelAnimationFrame(frame)
      },
      { root: canvas.closest(".modern-main"), threshold: 0.01 },
    )

    resizeObserver.observe(canvas)
    visibilityObserver.observe(canvas)
    resize()
    start()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [mark, reducedMotion, variant])

  return (
    <canvas
      ref={canvasRef}
      className={`modern-pixel-canvas${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  )
}
