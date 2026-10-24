import type { LifeSettings } from "../games/gameOfLife"
import type { CanvasPalette } from "./palette"

export type PixelCanvasVariant =
  | "hero"
  | "mark"
  | "takeover"

export interface PixelCanvasProps {
  className?: string
  lifeSettings?: LifeSettings
  mark?: string
  /** Externally animated letter weights, sharing the experience cards' clock. */
  markWeights?: Readonly<Record<string, number>>
  /** Called after the takeover's final, fully opaque frame is drawn. */
  onComplete?: () => void
  progress?: number
  takeoverColor?: "ink" | "pink"
  variant: PixelCanvasVariant
}

export interface DrawOptions {
  palette: CanvasPalette
  fromMark: string
  mark: string
  markWeights: () => Readonly<Record<string, number>> | undefined
  progress: () => number
  takeoverColor: () => "ink" | "pink"
  transitionStart: number
  lifeSettings: () => LifeSettings
  life: (LifeSettings & {
    columns: number
    rows: number
    cells: Uint8Array
    next: Uint8Array
    lastStepTime: number
  }) | null
}

export type CanvasDrawer = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  options: DrawOptions,
) => void
