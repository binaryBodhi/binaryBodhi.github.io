import { useId, useRef, type ReactNode } from "react"
import type { ExperienceBlendProps } from "./blendProps"
import { ExperienceHeading } from "./ExperienceHeading"
import { ExperienceCopyPanel } from "./ExperienceCopyPanel"

export function MobileExperienceCard({ experience, activeIndex, weights, flipped, onFlip, mark }: ExperienceBlendProps & {
  flipped: boolean
  onFlip: (flipped: boolean) => void
  mark: ReactNode
}) {
  const descriptionId = useId()
  const frontButton = useRef<HTMLButtonElement>(null)
  const backFace = useRef<HTMLDivElement>(null)
  const item = experience[activeIndex]
  const label = `${item.role} at ${item.organization}`

  function flip(showDescription: boolean) {
    onFlip(showDescription)
    window.requestAnimationFrame(() => {
      (showDescription ? backFace : frontButton).current?.focus({ preventScroll: true })
    })
  }

  return (
    <div className={`modern-experience-flip${flipped ? " is-flipped" : ""}`}>
      <div className="modern-experience-flip-inner">
        <div className="modern-experience-flip-front" inert={flipped} aria-hidden={flipped}>
          <ExperienceHeading experience={experience} weights={weights} activeIndex={activeIndex} mark={mark} />
          <button ref={frontButton} type="button" className="modern-experience-flip-trigger"
            aria-label={`Show description for ${label}`} aria-controls={descriptionId} aria-expanded={flipped}
            onClick={() => flip(true)}>
            <span>Tap for details ↗</span>
          </button>
        </div>
        <div ref={backFace} id={descriptionId} className="modern-experience-flip-back"
          inert={!flipped} aria-hidden={!flipped} role="button" tabIndex={flipped ? 0 : -1}
          aria-label={`Back to ${label}`} aria-describedby={`${descriptionId}-copy`}
          onClick={() => flip(false)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || !["Enter", " "].includes(event.key)) return
            event.preventDefault()
            flip(false)
          }}>
          <div id={`${descriptionId}-copy`} className="modern-experience-flip-description">
          <ExperienceCopyPanel key={item.id} experience={[item]} weights={[1]} activeIndex={0} />
          </div>
        </div>
      </div>
    </div>
  )
}
