import { useState } from "react"
import type { Experience } from "../../../../data/types"
import { useReducedMotion } from "../../../../shared/hooks/useReducedMotion"
import { PixelCanvas } from "../PixelCanvas"
import { SectionNavigation } from "../SectionNavigation"
import { MobileExperienceCard } from "./MobileExperienceCard"
import { useExperienceMorph } from "./useExperienceMorph"

export function MobileExperienceBrowser({ experience, progress }: { experience: Experience[]; progress: number }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const activeIndex = index % experience.length
  const reducedMotion = useReducedMotion()
  const weights = useExperienceMorph(activeIndex, experience.length, reducedMotion)
  const item = experience[activeIndex]
  const mark = item.organization.replace(/\([^)]*\)/g, "").trim().charAt(0).toUpperCase()
  const markWeights: Record<string, number> = {}
  experience.forEach((entry, entryIndex) => {
    const letter = entry.organization.replace(/\([^)]*\)/g, "").trim().charAt(0).toUpperCase()
    markWeights[letter] = (markWeights[letter] ?? 0) + (weights[entryIndex] ?? 0)
  })

  function navigate(direction: -1 | 1) {
    setFlipped(false)
    setIndex((current) => (current + direction + experience.length) % experience.length)
  }

  return (
    <div className="modern-experience-browser">
      <SectionNavigation label="Experience navigation" items={experience} activeIndex={activeIndex}
        progressBackground={<PixelCanvas className="modern-experience-progress-background" variant="takeover" progress={progress} />}
        onPrevious={() => navigate(-1)} onNext={() => navigate(1)} />
      <article className="modern-experience-card" aria-label={`${item.role} at ${item.organization}`}>
        <MobileExperienceCard experience={experience} activeIndex={activeIndex} weights={weights}
          flipped={flipped} onFlip={setFlipped} mark={
            <div className="modern-experience-inline-mark" aria-hidden="true">
              <PixelCanvas variant="mark" progress={progress} mark={mark} markWeights={markWeights} />
            </div>
          } />
      </article>
      <p className="modern-visually-hidden" aria-live="polite" aria-atomic="true">
        Experience {activeIndex + 1} of {experience.length}: {item.role} at {item.organization}
      </p>
    </div>
  )
}
