import type { ReactNode, Ref } from "react"

interface SectionFrameProps {
  children: ReactNode
  className?: string
  name: string
  index: string
  label: string
  bodyRef?: Ref<HTMLDivElement>
  background?: ReactNode
}

export function SectionFrame({ children, name, index, label, bodyRef, background, className = `modern-${name}-section` }: SectionFrameProps) {
  const id = `modern-${name}`
  return (
    <section
      id={id}
      className={`modern-shell-section${className ? ` ${className}` : ""}`}
      aria-labelledby={`${id}-title`}
    >
      {background}
      <div className="modern-section-index" aria-hidden="true">
        {index}
      </div>
      <div ref={bodyRef} className="modern-section-body">
        <p className="modern-section-label">{label}</p>
        {children}
      </div>
    </section>
  )
}
