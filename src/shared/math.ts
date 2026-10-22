export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function smoothstep(progress: number) {
  return progress * progress * (3 - 2 * progress)
}
