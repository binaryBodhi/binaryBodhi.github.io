import { mediaQueries, useMediaQuery } from "./useMediaQuery"

export function useReducedMotion() {
  return useMediaQuery(mediaQueries.reducedMotion)
}
