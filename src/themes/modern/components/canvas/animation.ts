import { MARK_MORPH_DURATION_MS } from "../../../../shared/animation.ts"
import type { DrawOptions, PixelCanvasVariant } from "./types"

type AnimationOptions = Pick<DrawOptions, "lifeSettings" | "markWeights" | "fromMark" | "mark" | "transitionStart">

export function needsAnimationFrame(
  variant: PixelCanvasVariant,
  options: AnimationOptions,
  time: number,
  reducedMotion: boolean,
) {
  if (variant === "hero") return !options.lifeSettings().paused
  if (reducedMotion || variant === "takeover") return false
  if (variant === "mark") {
    // External weights redraw on their shared clock. Standalone marks stop once settled.
    return !options.markWeights() && options.fromMark !== options.mark && time < options.transitionStart + MARK_MORPH_DURATION_MS
  }
  return true
}
