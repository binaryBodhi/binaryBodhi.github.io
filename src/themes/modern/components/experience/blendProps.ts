import type { CSSProperties } from "react"
import type { Experience } from "../../../../data/types"

export interface ExperienceBlendProps {
  experience: Experience[]
  weights: number[]
  activeIndex: number
}

export function blendProps(weight: number, active: boolean) {
  return {
    style: {
      "--modern-experience-weight": weight,
      visibility: weight > 0 ? "visible" : "hidden",
    } as CSSProperties,
    "aria-hidden": !active,
    inert: !active ? true : undefined,
  }
}
