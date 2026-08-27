import type { ReactNode, Ref } from "react"

interface SectionFrameProps {
  children: ReactNode
  className?: string
  decoration?: ReactNode
  id: string
  index: string
  label: string
  sectionRef?: Ref<HTMLElement>
  titleId: string
}

export function SectionFrame({
  children,
  className = "",
  decoration,
  id,
  index,
  label,
  sectionRef,
  titleId,
}: SectionFrameProps) {
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`modern-shell-section${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
    >
      {decoration}
      <div className="modern-section-index" aria-hidden="true">
        {index}
      </div>
      <div className="modern-section-body">
        <p className="modern-section-label">{label}</p>
        {children}
      </div>
    </section>
  )
}
