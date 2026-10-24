import { usePixelMorph } from "./usePixelMorph"

interface PixelDescriptionProps {
  text: string
  weight: number
  reducedMotion: boolean
}

export function PixelDescription({ text, weight, reducedMotion }: PixelDescriptionProps) {
  const { elementRef, canvasRef, opacity } = usePixelMorph<HTMLParagraphElement>(text, weight, reducedMotion)
  return (
    <p ref={elementRef} className="modern-project-description">
      <span data-pixel-text style={{ opacity }}>{text}</span>
      <canvas ref={canvasRef} aria-hidden="true" style={{ opacity: 1 - opacity }} />
    </p>
  )
}
