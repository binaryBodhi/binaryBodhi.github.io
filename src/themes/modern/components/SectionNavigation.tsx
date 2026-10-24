import type { ReactNode } from "react"

export function SectionNavigation({ label, items, activeIndex, onPrevious, onNext, progressBackground }: {
  label: string
  items: { id: string }[]
  activeIndex: number
  onPrevious: () => void
  onNext: () => void
  progressBackground?: ReactNode
}) {
  return (
    <div className="modern-project-controls" aria-label={label}>
      <button type="button" onClick={onPrevious} disabled={items.length < 2}>
        <span aria-hidden="true">←</span> Previous
      </button>
      <div className="modern-project-progress" aria-hidden="true">
        {progressBackground}
        {items.map((item, index) => (
          <span key={item.id} className={index === activeIndex ? "is-active" : ""} />
        ))}
      </div>
      <button type="button" onClick={onNext} disabled={items.length < 2}>
        Next <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
