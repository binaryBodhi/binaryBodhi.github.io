import { usePixelMorph } from "./usePixelMorph"

interface PixelTechnologiesProps {
  technologies: string[]
  weight: number
  reducedMotion: boolean
}

export function PixelTechnologies({ technologies, weight, reducedMotion }: PixelTechnologiesProps) {
  const { elementRef, canvasRef, opacity } = usePixelMorph<HTMLDivElement>(
    JSON.stringify(technologies), weight, reducedMotion,
  )
  return (
    <div ref={elementRef} className="modern-project-technologies">
      <ul className="modern-tag-list" aria-label="Technologies" style={{ opacity }}>
        {technologies.map((technology) => <li key={technology}><span data-pixel-text>{technology}</span></li>)}
      </ul>
      <canvas ref={canvasRef} aria-hidden="true" style={{ opacity: 1 - opacity }} />
    </div>
  )
}
