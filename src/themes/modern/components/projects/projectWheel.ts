export function projectIndex(position: number, count: number) {
  return count > 0 ? ((position % count) + count) % count : 0
}

/** Virtual slots keep the wheel moving in the same direction across either end. */
export function projectWheelSlots(position: number, count: number) {
  if (count === 0) return []
  if (count === 1) return [{ turn: 0, index: 0, distance: 0, weight: 1 }]
  return Array.from({ length: 5 }, (_, offset) => {
    const turn = Math.floor(position) + offset - 2
    const distance = turn - position
    return {
      turn,
      index: projectIndex(turn, count),
      distance,
      weight: Math.max(0, 1 - Math.abs(distance)),
    }
  })
}

export function projectWheelStyle(distance: number, reducedMotion: boolean, step = 42) {
  const extent = Math.abs(distance)
  const weight = Math.max(0, 1 - extent)
  const move = `translateY(${distance * step}%)`
  const scale = `scale(${1 - Math.min(extent, 1) * 0.14})`
  return {
    transform: reducedMotion
      ? `${move} ${scale}`
      : `perspective(700px) ${move} rotateX(${-distance * 45}deg) ${scale}`,
    opacity: extent <= 1 ? 0.26 + weight * 0.74 : Math.max(0, (1.7 - extent) / 0.7) * 0.26,
    filter: `blur(${Math.min(extent, 1) * 2.5}px)`,
  }
}
