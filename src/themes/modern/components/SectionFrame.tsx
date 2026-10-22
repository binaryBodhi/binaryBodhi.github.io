import type { ReactNode } from "react"

interface SectionFrameProps {
  children: ReactNode
  className?: string
  name: string
  index: string
  label: string
}

export function SectionFrame({ children, name, index, label, className = `modern-${name}-section` }: SectionFrameProps) {
  const id = `modern-${name}`
  return (
    <section
      id={id}
      className={`modern-shell-section${className ? ` ${className}` : ""}`}
      aria-labelledby={`${id}-title`}
    >
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
